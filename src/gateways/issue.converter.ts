import { Injectable } from '@nestjs/common';
import { IssueBean } from 'jira.js/out/version2/models';
import { Dependency, IssueData, Step } from './../entities/issue.entity';

@Injectable()
export class IssueConverter {
  private convertDependency(dependency: Dependency): any {
    switch (dependency.dependency_type.toLowerCase()) {
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
      case 'is tested by':
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
              name: 'Blocker',
              inward: 'is blocked by',
              outward: 'blocks',
            },
            outwardIssue: {
              key: dependency.key,
            },
          },
        };
      case 'is blocked by':
        return {
          add: {
            type: {
              name: 'Blocker',
              inward: 'is blocked by',
              outward: 'blocks',
            },
            inwardIssue: {
              key: dependency.key,
            },
          },
        };
      case 'relates to':
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
      case 'depends on':
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
      case 'is dependent of':
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
        throw `The dependency "${dependency.dependency_type}" does not exist`;
    }
  }

  public convertToJiraFormat(data: IssueData): any {
    const fields = {};
    fields['issuetype'] = data.issue_type && {
      name: data.issue_type,
    };
    fields['project'] = data.project_key && {
      key: data.project_key,
    };
    fields['summary'] = data.summary;
    fields[process.env.EPIC_NAME] = data.epic_name;
    fields[process.env.EPIC_LINK_ID] = data.epic_link_id;
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
    fields[process.env.ACCEPTANCE_CRITERIA] = data.acceptance_criteria && {
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
    fields['components'] = (data.components || []).filter(
      (component) => component != null && Object.keys(component).length > 0,
    );
    fields['labels'] = (data.labels || []).filter((label) => label != null);
    fields['fixVersions'] = (data.releases || []).filter(
      (release) => release != null && Object.keys(release).length > 0,
    );
    fields[process.env.FEASABILITY] = data.feasability && {
      value: data.feasability,
    };
    const update = {};
    update['issuelinks'] = (data.dependencies || [])
      .filter(
        (dependency) =>
          dependency != null && Object.keys(dependency).length > 0,
      )
      .map((dependency) => this.convertDependency(dependency));
    return {
      fields,
      update,
    };
  }

  public convertResult(data: IssueBean, steps = null): IssueData {
    const issue = new IssueData();

    issue.id = data.id;
    issue.key = data.key;
    issue.self = data.self;
    issue.project_key = data.fields['project'].key;
    issue.issue_type = data.fields['issuetype'].name;
    issue.status = data.fields['status'].name;
    if (data.fields['issuetype'].name == 'Epic') {
      issue.epic_name = data.fields[process.env.EPIC_NAME];
    }
    if (
      data.fields['issuetype'].name != 'Epic' &&
      data.fields[process.env.EPIC_LINK_ID] != null
    ) {
      issue.epic_link_id = data.fields[process.env.EPIC_LINK_ID];
    }
    issue.summary = data.fields['summary'];
    if (
      data.fields['description'] != null &&
      data.fields['description'].content.length > 0
    ) {
      issue.description = data.fields['description'].content[0].content[0].text;
    }
    if (
      data.fields[process.env.ACCEPTANCE_CRITERIA] != null &&
      data.fields[process.env.ACCEPTANCE_CRITERIA].content.length > 0
    ) {
      issue.acceptance_criteria =
        data.fields[process.env.ACCEPTANCE_CRITERIA].content[0].content[0].text;
    }
    if (data.fields[process.env.FEASABILITY] != null) {
      issue.feasability = data.fields[process.env.FEASABILITY].value;
    }
    if (
      data.fields['components'] != null &&
      data.fields['components'].length > 0
    ) {
      issue.components = data.fields['components'].map((component) => {
        return component.name;
      });
    }
    if (data.fields['labels'] != null && data.fields['labels'].length > 0) {
      issue.labels = data.fields['labels'].map((label) => {
        return label;
      });
    }
    if (
      data.fields['fixVersions'] != null &&
      data.fields['fixVersions'].length > 0
    ) {
      issue.releases = data.fields['fixVersions'].map((fixVersion) => {
        return fixVersion.name;
      });
    }
    if (
      data.fields['issuelinks'] != null &&
      data.fields['issuelinks'].length > 0
    ) {
      issue.dependencies = data.fields['issuelinks'].map((issuelink) => {
        const dependency = {};
        if (issuelink.hasOwnProperty('outwardIssue')) {
          dependency['dependency_type'] = issuelink.type['outward'];
          dependency['key'] = issuelink.outwardIssue['key'];
        }
        if (issuelink.hasOwnProperty('inwardIssue')) {
          dependency['dependency_type'] = issuelink.type['inward'];
          dependency['key'] = issuelink.inwardIssue['key'];
        }
        return dependency;
      });
    }
    if (steps != null && steps.getTest['steps'].length > 0) {
      issue.test_type = steps.getTest['testType'].name;
      issue.steps = steps.getTest['steps'].map((step) => {
        const s = new Step();
        s.action = step.action;
        s.data = step.data;
        s.result = step.result;
        return s;
      });
    }
    return issue;
  }
}
