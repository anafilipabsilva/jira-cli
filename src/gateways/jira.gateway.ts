import { Inject, Injectable } from '@nestjs/common';
import { AxiosInstance } from 'axios';
import { gql, GraphQLClient } from 'graphql-request';
import { Version3Client } from 'jira.js';
import { Issue, IssueData, Step } from './../entities/issue.entity';
import { RequestException } from './../exceptions/request.exception';
import { IssueConverter } from './issue.converter';

@Injectable()
export class JiraGateway {
  constructor(
    private readonly client: Version3Client,
    @Inject('HTTP_AXIOS')
    private readonly axios: AxiosInstance,
    private readonly issueConverter: IssueConverter,
  ) {}

  public async createIssue(data: IssueData): Promise<Issue> {
    const input = this.issueConverter.convertToJiraFormat(data);
    const result = await this.catcher(
      async () => await this.client.issues.createIssue(input),
    );

    if (data.issue_type == 'Xray Test' && data.test_type != null) {
      const token = await this.getAuthToken();

      const graphQLClient = new GraphQLClient(
        'https://xray.cloud.getxray.app/api/v2/graphql',
        {
          headers: {
            authorization: `Bearer ${token}`,
          },
        },
      );

      await this.retryRequest(async () => {
        await this.addTestType(data.id, data.test_type, graphQLClient);
      }, 3);

      if (data.steps != null && data.steps.length > 0) {
        await this.addSteps(data.steps, result.id, graphQLClient);
      }
    }
    return result as Issue;
  }

  private async catcher(fn: () => Promise<any>) {
    try {
      return await fn();
    } catch (e) {
      throw new RequestException(JSON.stringify(e.response.data.errors));
    }
  }

  public async updateIssue(data: IssueData): Promise<Issue> {
    const input = this.issueConverter.convertToJiraFormat(data);

    await this.catcher(
      async () =>
        await this.client.issues.editIssue({ ...input, issueIdOrKey: data.id }),
    );

    const issueInfo = await this.getIssue(data.id, false);

    if (data.test_type != null) {
      const token = await this.getAuthToken();

      const graphQLClient = new GraphQLClient(
        'https://xray.cloud.getxray.app/api/v2/graphql',
        {
          headers: {
            authorization: `Bearer ${token}`,
          },
        },
      );

      await this.retryRequest(async () => {
        await this.addTestType(issueInfo.id, data.test_type, graphQLClient);
      }, 3);

      if (data.steps != null && data.steps.length > 0) {
        await this.addSteps(data.steps, issueInfo.id, graphQLClient);
      }
      return new Issue(issueInfo);
    }
  }

  public async getIssue(id: string, getSteps = true): Promise<IssueData> {
    const input = {
      issueIdOrKey: id,
    };
    const result = await this.client.issues.getIssue(input);
    let steps;
    if (result.fields['issuetype'].name == 'Xray Test' && getSteps) {
      steps = await this.getSteps(result.id);
    }
    return this.issueConverter.convertResult(result, steps);
  }

  public async searchIssues(
    projectId: string,
    type = null,
    release = null,
    status = null,
    feasibility = null,
    epicLinkId = null,
    label = null,
  ): Promise<IssueData[]> {
    if (feasibility != null) {
      switch (feasibility.toLowerCase()) {
        case 'green':
          feasibility = 'Green - Looks Possible';
          break;
        case 'yellow':
          feasibility = 'Yellow - Stretch / Maybe';
          break;
        case 'orange':
          feasibility = 'Orange - Needs More Definition';
          break;
        case 'red':
          feasibility = 'Red - Not Possible';
          break;
      }
    }

    const optionalParams = {
      issueType: type,
      fixVersion: release,
      statusCategory: status,
      'cf[13031]': feasibility,
      'cf[10009]': epicLinkId,
      labels: label,
    };

    let jqlQuery = `project = '${projectId}'`;
    for (const key in optionalParams) {
      if (optionalParams[key] != null) {
        jqlQuery += ` AND ${key} = '${optionalParams[key]}'`;
      }
    }
    jqlQuery += ` ORDER BY key ASC`;

    const input = {};
    input['jql'] = jqlQuery;

    const result = await this.client.issueSearch.searchForIssuesUsingJql(input);

    const convertedResult = [];
    for (const issue of result.issues) {
      convertedResult.push(this.issueConverter.convertResult(issue));
    }
    return convertedResult;
  }

  public async updateEpicIssuesFeasibility(
    projectId: string,
    release: string,
  ): Promise<Issue[]> {
    const epics = await this.searchIssues(
      projectId,
      'Epic',
      release,
      null,
      null,
      null,
      null,
    );

    const redEpicStories = [];
    const yellowEpicStories = [];
    for (const epic of epics) {
      if (!epic.feasibility) {
        continue;
      }
      if (epic.feasibility.includes('Red')) {
        redEpicStories.push(
          await this.searchIssues(
            projectId,
            null,
            null,
            'To Do',
            null,
            epic.key,
            null,
          ),
        );
      }

      if (epic.feasibility.includes('Yellow')) {
        yellowEpicStories.push(
          await this.searchIssues(
            projectId,
            null,
            null,
            'To Do',
            null,
            epic.key,
            null,
          ),
        );
      }
    }

    const finalResult = [];
    for (const story of redEpicStories.flat()) {
      const issue = {
        id: `${story.key}`,
        labels: ['descoped'],
      } as IssueData;
      finalResult.push(await this.updateIssue(issue));
    }

    for (const story of yellowEpicStories.flat()) {
      const issue = {
        id: story.key,
        labels: ['spillover'],
      } as IssueData;
      finalResult.push(await this.updateIssue(issue));
    }

    return finalResult;
  }

  private async addSteps(
    steps: Step[],
    issueId: string,
    graphQLClient: GraphQLClient,
  ): Promise<any> {
    for (const step of steps) {
      await this.retryRequest(async () => {
        await this.addStep(issueId, step, graphQLClient);
      }, 3);
    }
  }

  private async retryRequest(fn: () => Promise<any>, maxAttempts = 3) {
    let error = null;
    do {
      try {
        return await fn();
      } catch (e) {
        error = e;
      }
      await this.sleep(1000);
      maxAttempts--;
    } while (maxAttempts > 0);
    throw new RequestException(JSON.stringify(error.response));
  }

  private async sleep(ms) {
    return await new Promise((resolve) => setTimeout(resolve, ms));
  }

  private async addTestType(
    issueId: string,
    testType: string,
    graphQLClient: GraphQLClient,
  ) {
    const query = gql`
      mutation {
        updateTestType(issueId: "${issueId}", testType: { name: "${
      testType || 'Manual'
    }" }) {
          issueId
          testType {
            name
            kind
          }
        }
      }
    `;
    await graphQLClient.request(query);
  }

  private async addStep(
    issueId: string,
    step: Step,
    graphQLClient: GraphQLClient,
  ) {
    if (step.action == null) {
      step.action = '';
    }
    if (step.data == null) {
      step.data = '';
    }
    if (step.result == null) {
      step.result = '';
    }

    const query = gql`
      mutation {
        addTestStep(
          issueId: "${issueId}"
          step: { 
            action: "${step.action.replace('\n', '\\n')}", 
            data: "${step.data.replace('\n', '\\n')}", 
            result: "${step.result.replace('\n', '\\n')}" }
        ) {
          id
          action
          data
          result
        }
      }
    `;
    await graphQLClient.request(query);
  }

  private async getSteps(issueId: string): Promise<any> {
    const token = await this.getAuthToken();

    const graphQLClient = new GraphQLClient(
      'https://xray.cloud.getxray.app/api/v2/graphql',
      {
        headers: {
          authorization: `Bearer ${token}`,
        },
      },
    );
    const query = gql`
      { getTest(issueId: "${issueId}") { 
        issueId
        testType {
          name
          kind
        }
        steps { 
            id 
            data 
            action 
            result 
            attachments { 
              id 
              filename 
            } 
          } 
        }
      }
    `;
    return await graphQLClient.request(query);
  }

  private async getAuthToken(): Promise<any> {
    return await this.axios
      .post('https://xray.cloud.getxray.app/api/v2/authenticate', {
        client_id: process.env.XRAY_CLIENT_ID,
        client_secret: process.env.XRAY_CLIENT_SECRET,
      })
      .then((response) => {
        return response.data;
      })
      .catch((error) => {
        console.log(error);
        return null;
      });
  }
}
