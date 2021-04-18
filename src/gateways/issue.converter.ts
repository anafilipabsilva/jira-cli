import { Injectable } from '@nestjs/common';
import { CreateIssue, Dependency } from 'src/entities/issue.entity';

@Injectable()
export class IssueConverter {
  public convert(issue: CreateIssue) {
    return this.convertToJiraFormat(issue);
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
    const fields = {};
    fields['issuetype'] = data.issue_type && {
      name: data.issue_type,
    };
    fields['project'] = data.project_key && {
      key: data.project_key,
    };
    fields['summary'] = data.summary;
    fields['description'] = data.description && {
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
    };
    fields['customfield_10040'] = data.acceptance_criteria && {
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
    };
    fields['components'] = data.components;
    fields['labels'] = data.labels;
    fields['fixVersions'] = data.fix_versions;
    const update = {};
    update['issuelinks'] = (data.dependencies || []).map((dependency) =>
      this.convertDependency(dependency),
    );
    return {
      fields,
      update,
    };
  }
}
