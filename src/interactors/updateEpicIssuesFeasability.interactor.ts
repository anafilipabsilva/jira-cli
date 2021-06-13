import { Injectable } from '@nestjs/common';
import { JiraGateway } from '../gateways/jira.gateway';

@Injectable()
export class UpdateEpicIssuesFeasabilityInteractor {
  constructor(private readonly jiraGateway: JiraGateway) {}

  async call(projectId: string, release: string) {
    return await this.jiraGateway.updateEpicIssuesFeasability(
      projectId,
      release,
    );
  }
}
