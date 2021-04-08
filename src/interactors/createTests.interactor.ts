import { Injectable } from '@nestjs/common';
import { CreateIssue } from 'src/entities/issue.entity';
import { FileService } from './../services/file.service';
import { JiraGateway } from './../gateways/jira.gateway';

@Injectable()
export class CreateTestsInteractor {
  constructor(
    private readonly fileService: FileService,
    private readonly jiraGateway: JiraGateway,
  ) {}

  async call(filepath: string) {
    const tests = await this.fileService.readFile<CreateIssue[]>(filepath);

    const result = [];
    for (const test of tests) {
      this.validRequiredFields(test);

      result.push(await this.jiraGateway.createIssue(test));
    }
    return result;
  }

  private validRequiredFields(test: CreateIssue): void {
    const requiredFields = [
      'summary',
      'description',
      'project_key',
      'issue_type',
    ];
    for (const field of requiredFields) {
      if (test[field] == null) {
        throw `The required field "${field}" is not provided in the file`;
      }
    }
  }
}
