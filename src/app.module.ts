import { Module } from '@nestjs/common';
import axios from 'axios';
import 'dotenv/config';
import { Version3Client } from 'jira.js';
import { CommandModule } from 'nestjs-command';
import { CreateIssuesCommand } from './commands/createIssues.command';
import { GetIssueCommand } from './commands/getIssue.command';
import { SearchIssuesCommand } from './commands/searchIssues.command';
import { UpdateEpicIssuesFeasibilityCommand } from './commands/updateEpicIssuesFeasibility.command';
import { UpdateIssuesCommand } from './commands/updateIssues.command';
import { GetTemplatesCommand } from './commands/getTemplates.command';
import { IssueConverter } from './gateways/issue.converter';
import { JiraGateway } from './gateways/jira.gateway';
import { CreateIssuesInteractor } from './interactors/createIssues.interactor';
import { GetIssueInteractor } from './interactors/getIssue.interactor';
import { SearchIssuesInteractor } from './interactors/searchIssues.interactor';
import { UpdateEpicIssuesFeasibilityInteractor } from './interactors/updateEpicIssuesFeasibility.interactor';
import { UpdateIssuesInteractor } from './interactors/updateIssues.interactor';
import { FileService } from './services/file.service';

const jiraClientProvider = {
  provide: Version3Client,
  useValue: new Version3Client({
    host: process.env.JIRA_HOST,
    authentication: {
      basic: {
        email: process.env.JIRA_EMAIL,
        apiToken: process.env.JIRA_TOKEN,
      },
    },
  }),
};

const axiosProvider = {
  provide: 'HTTP_AXIOS',
  useValue: axios,
};

@Module({
  imports: [CommandModule],
  controllers: [],
  providers: [
    CreateIssuesCommand,
    CreateIssuesInteractor,
    UpdateIssuesCommand,
    UpdateIssuesInteractor,
    GetIssueCommand,
    GetIssueInteractor,
    SearchIssuesCommand,
    SearchIssuesInteractor,
    UpdateEpicIssuesFeasibilityCommand,
    UpdateEpicIssuesFeasibilityInteractor,
    GetTemplatesCommand,
    FileService,
    JiraGateway,
    jiraClientProvider,
    axiosProvider,
    IssueConverter,
  ],
})
export class AppModule {}
