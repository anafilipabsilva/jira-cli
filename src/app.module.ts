import { Module } from '@nestjs/common';
import { CommandModule } from 'nestjs-command';
import { CreateIssuesCommand } from './commands/createIssues.command';
import { UpdateIssuesCommand } from './commands/updateIssues.command';
import { CreateIssuesInteractor } from './interactors/createIssues.interactor';
import { UpdateIssuesInteractor } from './interactors/updateIssues.interactor';
import { FileService } from './services/file.service';
import { JiraGateway } from './gateways/jira.gateway';
import { Version3Client } from 'jira.js';
import axios from 'axios';
import 'dotenv/config';
import { IssueConverter } from './gateways/issue.converter';
import { GetIssueCommand } from './commands/getIssue.command';
import { GetIssueInteractor } from './interactors/getIssue.interactor';

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
    FileService,
    JiraGateway,
    jiraClientProvider,
    axiosProvider,
    IssueConverter,
  ],
})
export class AppModule {}
