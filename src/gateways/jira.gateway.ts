import { Inject, Injectable } from '@nestjs/common';
import {
  CreateIssue,
  Issue,
  Step,
  UpdateIssue,
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

  public async createIssue(data: CreateIssue): Promise<Issue> {
    const input = this.issueConverter.convert(data);
    const result = await this.client.issues.createIssue(input);
    if (
      data.issue_type == 'Test' &&
      data.steps != null &&
      data.steps.length >= 1
    ) {
      await this.createSteps(data.steps, result.id, data.test_type);
    }
    return result as Issue;
  }

  public async updateIssue(data: UpdateIssue): Promise<void> {
    const input = this.issueConverter.convert(data);
    await this.client.issues.editIssue({ ...input, issueIdOrKey: data.id });
  }

  private async createSteps(
    steps: Step[],
    issueId: string,
    testType: string,
  ): Promise<any> {
    const token = await this.axios
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
          step: { action: "${step.action}", data: "${step.data}", result: "${step.result}" }
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
}
