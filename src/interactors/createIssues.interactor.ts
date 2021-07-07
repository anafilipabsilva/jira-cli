import { Injectable } from '@nestjs/common';
import { IssueData } from './../entities/issue.entity';
import { RequestException } from './../exceptions/request.exception';
import { JiraGateway } from './../gateways/jira.gateway';
import { FileService } from './../services/file.service';

@Injectable()
export class CreateIssuesInteractor {
  constructor(
    private readonly fileService: FileService,
    private readonly jiraGateway: JiraGateway,
  ) {}

  async call(filepath: string) {
    const issues = await this.fileService.readFile<IssueData[]>(filepath);

    const result = [];
    for (const issue of issues) {
      this.validRequiredFields(issue);

      try {
        result.push(await this.jiraGateway.createIssue(issue));
      } catch (e) {
        console.error(
          `There was an error creating the issue: '${issue.summary}'`,
        );
        if (e instanceof RequestException) {
          console.error(e.message);
        }
      }
    }
    return result;
  }

  private validRequiredFields(issue: IssueData): void {
    const requiredFields = ['summary', 'project_key', 'issue_type'];
    if (issue.issue_type == 'Epic') {
      requiredFields.push('epic_name');
    }
    for (const field of requiredFields) {
      if (issue[field] == null) {
        throw `The required field "${field}" is not provided in the file`;
      }
    }
  }
}
