import { Injectable } from '@nestjs/common';
import { JiraTest } from 'src/entities/jiraTest.entity';
import { Version3Client } from 'jira.js';

@Injectable()
export class JiraGateway {
  constructor(private readonly client: Version3Client) {}

  public async createIssue(data: any): Promise<any> {
    const result = await this.client.issues.createIssue(data);
    console.dir(result);
    return result;
  }
}
