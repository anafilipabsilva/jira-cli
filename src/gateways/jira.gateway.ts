import { Injectable } from '@nestjs/common';
import {
  CreateIssue,
  Dependency,
  Issue,
  UpdateIssue,
} from 'src/entities/issue.entity';
import { Version3Client } from 'jira.js';

@Injectable()
export class JiraGateway {
  constructor(private readonly client: Version3Client) {}

  public async createIssue(data: CreateIssue): Promise<Issue> {
    const input = this.convertToJiraFormat(data);
    const result = await this.client.issues.createIssue(input);
    return result as Issue;
  }

  public async updateIssue(data: UpdateIssue): Promise<void> {
    const input = this.convertToJiraFormat(data);
    await this.client.issues.editIssue({ ...input, id: data.id });
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
}
