import { Injectable } from '@nestjs/common';
import { JiraGateway } from './../gateways/jira.gateway';

@Injectable()
export class GetIssueInteractor {
  constructor(
    private readonly jiraGateway: JiraGateway,
  ) {}

  async call(id: string) {
    return await this.jiraGateway.getIssue(id);
  }
}
