import { Injectable } from '@nestjs/common';
import { JiraGateway } from '../gateways/jira.gateway';

@Injectable()
export class UpdateEpicIssuesFeasability {
  constructor(private readonly jiraGateway: JiraGateway) {}

  async call(projectId: string, fixVersion: string) {
    return await this.jiraGateway.updateEpicIssuesFeasability(
      projectId,
      fixVersion,
    );
  }
}
