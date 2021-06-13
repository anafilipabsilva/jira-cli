import { Inject, Injectable } from '@nestjs/common';
import { AxiosInstance } from 'axios';
import { gql, GraphQLClient } from 'graphql-request';
import { Version3Client } from 'jira.js';
import { Issue, IssueData, Step } from './../entities/issue.entity';
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
    const result = await this.client.issues.createIssue(input);
    if (
      data.issue_type == 'Xray Test' &&
      data.steps != null &&
      data.steps.length >= 1
    ) {
      await this.addSteps(data.steps, result.id, data.test_type);
    }
    return result as Issue;
  }

  public async updateIssue(data: IssueData): Promise<Issue> {
    const input = this.issueConverter.convertToJiraFormat(data);
    await this.client.issues.editIssue({ ...input, issueIdOrKey: data.id });
    const issueInfo = await this.getIssue(data.id, false);
    if (data.steps != null && data.steps.length > 0) {
      if (issueInfo.issue_type == 'Xray Test') {
        await this.addSteps(data.steps, issueInfo.id, issueInfo.test_type);
      } else {
        throw `There was an error while updating test steps on issue ${issueInfo.key}`;
      }
    }
    return new Issue(issueInfo);
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
    feasability = null,
    epicLinkId = null,
    label = null,
  ): Promise<IssueData[]> {
    if (feasability != null) {
      switch (feasability.toLowerCase()) {
        case 'green':
          feasability = 'Green - Looks Possible';
          break;
        case 'yellow':
          feasability = 'Yellow - Stretch / Maybe';
          break;
        case 'orange':
          feasability = 'Orange - Needs More Definition';
          break;
        case 'red':
          feasability = 'Red - Not Possible';
          break;
      }
    }

    const optionalParams = {
      issueType: type,
      fixVersion: release,
      statusCategory: status,
      'cf[13031]': feasability,
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

  public async updateEpicIssuesFeasability(
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
      if (!epic.feasability) {
        continue;
      }
      if (epic.feasability.includes('Red')) {
        redEpicStories.push(
          await this.searchIssues(
            projectId,
            'Story',
            null,
            'To Do',
            null,
            epic.key,
            null,
          ),
        );
      }

      if (epic.feasability.includes('Yellow')) {
        yellowEpicStories.push(
          await this.searchIssues(
            projectId,
            'Story',
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
        id: story.key,
        labels: ['descoped'],
      } as IssueData;
      finalResult.push(this.updateIssue(issue));
    }

    for (const story of yellowEpicStories.flat()) {
      const issue = {
        id: story.key,
        labels: ['spillover'],
      } as IssueData;
      finalResult.push(this.updateIssue(issue));
    }

    return finalResult;
  }

  private async addSteps(
    steps: Step[],
    issueId: string,
    testType: string,
  ): Promise<any> {
    const token = await this.getAuthToken();

    const graphQLClient = new GraphQLClient(
      'https://xray.cloud.xpand-it.com/api/v2/graphql',
      {
        headers: {
          authorization: `Bearer ${token}`,
        },
      },
    );
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
    for (const step of steps) {
      const query = gql`
      mutation {
        addTestStep(
          issueId: "${issueId}"
          step: { action: "${step.action || ''}", data: "${
        step.data || ''
      }", result: "${step.result || ''}" }
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
  }

  private async getSteps(issueId: string): Promise<any> {
    const token = await this.getAuthToken();

    const graphQLClient = new GraphQLClient(
      'https://xray.cloud.xpand-it.com/api/v2/graphql',
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
      .post('https://xray.cloud.xpand-it.com/api/v2/authenticate', {
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
