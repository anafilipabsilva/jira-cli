import { Injectable } from '@nestjs/common';
import { IssueBean } from 'jira.js/out/version2/models';
import { Component, CreateIssue, Dependency, Step, UpdateIssue, FixVersion } from 'src/entities/issue.entity';

@Injectable()
export class IssueConverter {
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

  public convertToJiraFormat(data: CreateIssue): any {
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

  public convertResult(data: IssueBean, steps: any): UpdateIssue {
    const issue = new UpdateIssue();

    issue.id = data.id;
    issue.key = data.key;
    issue.self = data.self;
    issue.project_key = data.fields['project'].key;
    issue.issue_type = data.fields['issuetype'].name;
    issue.summary = data.fields['summary'];

    if (data.fields['description'] != null) {
      issue.description = data.fields['description'].content[0].content[0].text;
    } else {
      issue.description = '';
    }

    if (data.fields['customfield_10040'] != null) {
      issue.acceptance_criteria = data.fields['customfield_10040'].content[0].content[0].text;
    } else {
      issue.acceptance_criteria = '';
    }

    issue.components = (data.fields['components'] || []).map((component) => {
      const c = new Component();
      c.name = component.name;
      return c;
    });

    issue.labels = (data.fields['labels'] || []).map((label) => {
      return label;
    });

    issue.fix_versions = (data.fields['fixVersions'] || []).map((fixVersion) => {
      const fv = new FixVersion();
      fv.name = fixVersion.name;
      return fv;
    });

    issue.dependencies = (data.fields['issuelinks'] || []).map((issuelink) => {
      const dependency = new Dependency();
      if (issuelink.hasOwnProperty('outwardIssue')) {
        dependency.type = issuelink.type['outward'];
        dependency.key = issuelink.outwardIssue['key'];
      }
      if (issuelink.hasOwnProperty('inwardIssue')) {
        dependency.type = issuelink.type['inward'];
        dependency.key = issuelink.inwardIssue['key'];
      }
      return dependency;
    });

    if (steps == null) {
      issue.test_type = '';
      issue.steps = [];
    } else {
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
