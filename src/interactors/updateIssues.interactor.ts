import { Injectable } from '@nestjs/common';
import { IssueData } from './../entities/issue.entity';
import { RequestException } from './../exceptions/request.exception';
import { JiraGateway } from './../gateways/jira.gateway';
import { FileService } from './../services/file.service';

@Injectable()
export class UpdateIssuesInteractor {
  constructor(
    private readonly fileService: FileService,
    private readonly jiraGateway: JiraGateway,
  ) {}

  async call(filepath: string) {
    const issues = await this.fileService.readFile<IssueData[]>(filepath);

    const result = [];
    for (const issue of issues) {
      if (issue.id == null) {
        throw `The required field id is not provided in the file`;
      }

      try {
        result.push(await this.jiraGateway.updateIssue(issue));
      } catch (e) {
        console.error(`There was an error updating the issue: '${issue.id}'`);
        if (e instanceof RequestException) {
          console.error(e.message);
        }
      }
    }
    return result;
  }
}
