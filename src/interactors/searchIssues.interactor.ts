import { Injectable } from '@nestjs/common';
import { JiraGateway } from '../gateways/jira.gateway';

@Injectable()
export class SearchIssuesInteractor {
  constructor(private readonly jiraGateway: JiraGateway) {}

  async call(
    projectId: string,
    issueType = null,
    release = null,
    status = null,
    feasibility = null,
    epicLinkId = null,
    label = null,
  ) {
    return await this.jiraGateway.searchIssues(
      projectId,
      issueType,
      release,
      status,
      feasibility,
      epicLinkId,
      label,
    );
  }
}
