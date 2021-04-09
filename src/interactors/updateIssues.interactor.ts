import { Injectable } from '@nestjs/common';
import { UpdateIssue } from 'src/entities/issue.entity';
import { FileService } from './../services/file.service';
import { JiraGateway } from './../gateways/jira.gateway';

@Injectable()
export class UpdateIssuesInteractor {
  constructor(
    private readonly fileService: FileService,
    private readonly jiraGateway: JiraGateway,
  ) {}

  async call(filepath: string) {
    const issues = await this.fileService.readFile<UpdateIssue[]>(filepath);

    const result = [];
    for (const issue of issues) {
      if (issue.id == null) {
        throw `The required field id is not provided in the file`;
      }

      result.push(await this.jiraGateway.updateIssue(issue));
    }
    return result;
  }
}
