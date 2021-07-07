import { Injectable } from '@nestjs/common';
import { JiraGateway } from '../gateways/jira.gateway';

@Injectable()
export class UpdateEpicIssuesFeasibilityInteractor {
  constructor(private readonly jiraGateway: JiraGateway) {}

  async call(projectId: string, release: string) {
    return await this.jiraGateway.updateEpicIssuesFeasibility(
      projectId,
      release,
    );
  }
}
