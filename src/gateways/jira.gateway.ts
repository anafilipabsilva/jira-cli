import { Inject, Injectable } from '@nestjs/common';
import {
  Issue,
  Step,
  IssueData
} from 'src/entities/issue.entity';
import { Version3Client } from 'jira.js';
import { AxiosInstance } from 'axios';
import { GraphQLClient, gql } from 'graphql-request';
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
      data.issue_type == 'Test' &&
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
      if (issueInfo.issue_type == 'Test') {
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
      fields: ['project', 'issuetype', 'summary', 'description', 'customfield_10040', 'customfield_10041', 'customfield_10011', 'status', 'customfield_10014', 'components', 'labels', 'fixVersions', 'issuelinks']
    };
    const result = await this.client.issues.getIssue(input);
    let steps;
    if (result.fields['issuetype'].name == 'Test' && getSteps) {
      steps = await this.getSteps(result.id);
    }
    return this.issueConverter.convertResult(result, steps);
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
          step: { action: "${step.action || ''}", data: "${step.data || ''}", result: "${step.result || ''}" }
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
