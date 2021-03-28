import { Injectable } from '@nestjs/common';
import { JiraTest } from 'src/entities/jiraTest.entity';
import { FileService } from './../services/file.service';

@Injectable()
export class CreateTestsInteractor {
  constructor(private readonly fileService: FileService) {}

  async call(filepath: string) {
    const tests = await this.fileService.readFile(filepath);
    console.log(`Hello world ${filepath}!`);
    console.dir(tests);

    this.validRequiredFields(tests);
  }

  private validRequiredFields(test: JiraTest): void {
    const requiredFields = [
      'summary',
      'description',
      'projectKey',
      'issueType',
    ];
    for (const field of requiredFields) {
      if (test[field] == null) {
        throw `The required field "${field}" is not provided in the file`;
      }
    }
  }
}
