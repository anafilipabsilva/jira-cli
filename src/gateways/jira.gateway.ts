import { Inject, Injectable } from '@nestjs/common';
import {
  CreateIssue,
  Dependency,
  Issue,
  Step,
  UpdateIssue,
} from 'src/entities/issue.entity';
import { Version3Client } from 'jira.js';
import { AxiosInstance } from 'axios';
import { GraphQLClient, gql } from 'graphql-request';

@Injectable()
export class JiraGateway {
  constructor(
    private readonly client: Version3Client,
    @Inject('HTTP_AXIOS')
    private readonly axios: AxiosInstance,
  ) {}

  public async createIssue(data: CreateIssue): Promise<Issue> {
    const input = this.convertToJiraFormat(data);
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
    const input = this.convertToJiraFormat(data);
    console.log('this is the input new:');
    console.dir(input);
    await this.client.issues.editIssue({ ...input, issueIdOrKey: data.id });
  }

  private convertDependency(dependency: Dependency): any {
    switch (dependency.type.toLowerCase()) {
      case 'tests':
        return {
          add: {
            type: {
              name: 'Test',
              inward: 'is tested by',
              outward: 'tests',
            },
            outwardIssue: {
              key: dependency.key,
            },
          },
        };
      case 'tested':
        return {
          add: {
            type: {
              name: 'Test',
              inward: 'is tested by',
              outward: 'tests',
            },
            inwardIssue: {
              key: dependency.key,
            },
          },
        };
      case 'blocks':
        return {
          add: {
            type: {
              name: 'Blocks',
              inward: 'is blocked by',
              outward: 'blocks',
            },
            outwardIssue: {
              key: dependency.key,
            },
          },
        };
      case 'blocked':
        return {
          add: {
            type: {
              name: 'Blocks',
              inward: 'is blocked by',
              outward: 'blocks',
            },
            inwardIssue: {
              key: dependency.key,
            },
          },
        };
      case 'relates':
        return {
          add: {
            type: {
              name: 'Relates',
              inward: 'relates to',
              outward: 'relates to',
            },
            outwardIssue: {
              key: dependency.key,
            },
          },
        };
      case 'depends':
        return {
          add: {
            type: {
              name: 'Dependency',
              inward: 'is a dependency for',
              outward: 'blocks',
            },
            outwardIssue: {
              key: dependency.key,
            },
          },
        };
      case 'dependent':
        return {
          add: {
            type: {
              name: 'Dependency',
              inward: 'is a dependency for',
              outward: 'blocks',
            },
            inwardIssue: {
              key: dependency.key,
            },
          },
        };
      default:
        throw `The dependency "${dependency.type}" does not exist`;
    }
  }

  private convertToJiraFormat(data: CreateIssue): any {
    return {
      fields: {
        issuetype: {
          name: data.issue_type,
        },
        project: {
          key: data.project_key,
        },
        summary: data.summary,
        description: {
          version: 1,
          type: 'doc',
          content: [
            {
              type: 'paragraph',
              content: [
                {
                  type: 'text',
                  text: data.description,
                },
              ],
            },
          ],
        },
        customfield_10040: {
          version: 1,
          type: 'doc',
          content: [
            {
              type: 'paragraph',
              content: [
                {
                  type: 'text',
                  text: data.acceptance_criteria || ' ',
                },
              ],
            },
          ],
        },
        components: data.components,
        labels: data.labels,
        fixVersions: data.fix_versions,
      },
      update: {
        issuelinks: (data.dependencies || []).map((dependency) =>
          this.convertDependency(dependency),
        ),
      },
    };
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
