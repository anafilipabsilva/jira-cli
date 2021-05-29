import { Injectable } from '@nestjs/common';
import { JiraGateway } from './../gateways/jira.gateway';

@Injectable()
export class ListIssuesInteractor {
  constructor(private readonly jiraGateway: JiraGateway) {}

  async call(projectId: string, issueType: string, fixVersion = null) {
    return await this.jiraGateway.listIssues(projectId, issueType, fixVersion);
  }
}
