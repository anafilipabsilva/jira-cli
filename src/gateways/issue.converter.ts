import { Injectable } from '@nestjs/common';
import { IssueBean } from 'jira.js/out/version2/models';
import { Component, Dependency, Step, FixVersion, IssueData } from 'src/entities/issue.entity';

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

  public convertToJiraFormat(data: IssueData): any {
    const fields = {};
    fields['issuetype'] = data.issue_type && {
      name: data.issue_type,
    };
    fields['project'] = data.project_key && {
      key: data.project_key,
    };
    fields['summary'] = data.summary;
    fields['customfield_10011'] = data.epic_name;
    fields['customfield_10009'] = data.epic_link_id;
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
    fields['status'] = data.status && {
      name: data.status,
    };
    fields['components'] = data.components;
    fields['labels'] = data.labels;
    fields['fixVersions'] = data.fix_versions;
    fields['customfield_10041'] = data.feasability && {
      value: data.feasability,
    }
    const update = {};
    update['issuelinks'] = (data.dependencies || []).map((dependency) =>
      this.convertDependency(dependency),
    );
    return {
      fields,
      update,
    };
  }

  public convertResult(data: IssueBean, steps: any): IssueData {
    const issue = new IssueData();

    issue.id = data.id;
    issue.key = data.key;
    issue.self = data.self;
    issue.project_key = data.fields['project'].key;
    issue.issue_type = data.fields['issuetype'].name;
    issue.status = data.fields['status'].name;
    if (data.fields['issuetype'].name == "Epic") {
      issue.epic_name = data.fields['customfield_10011'];
    } 
    if (data.fields['issuetype'].name != "Epic" && data.fields['customfield_10014'] != null) {
      issue.epic_link_id = data.fields['customfield_10014'];
    } 
    issue.summary = data.fields['summary'];
    if (data.fields['description'] != null) {
      issue.description = data.fields['description'].content[0].content[0].text;
    } 
    if (data.fields['customfield_10040'] != null) {
      issue.acceptance_criteria = data.fields['customfield_10040'].content[0].content[0].text;
    }
    if (data.fields['customfield_10041'] != null) {
      issue.feasability = data.fields['customfield_10041'].value;
    }
    if (data.fields['components'] != null && data.fields['components'].length > 0) {
      issue.components = data.fields['components'].map((component) => {
        const c = new Component();
        c.name = component.name;
        return c;
      });
    }
    if (data.fields['labels'] != null && data.fields['labels'].length > 0) {
      issue.labels = data.fields['labels'].map((label) => {
        return label;
      });
    }
    if (data.fields['fixVersions'] != null && data.fields['fixVersions'].length > 0) {
      issue.fix_versions = data.fields['fixVersions'].map((fixVersion) => {
        const fv = new FixVersion();
        fv.name = fixVersion.name;
        return fv;
      });
    }
    if (data.fields['issuelinks'] != null && data.fields['issuelinks'].length > 0) {
      issue.dependencies = data.fields['issuelinks'].map((issuelink) => {
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
    }
    if (steps != null && steps.length > 0) {
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
