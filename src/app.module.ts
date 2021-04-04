import { Module } from '@nestjs/common';
import { CommandModule } from 'nestjs-command';
import { CreateTestsCommand } from './commands/createTests.command';
import { CreateTestsInteractor } from './interactors/createTests.interactor';
import { FileService } from './services/file.service';
import { JiraGateway } from './gateways/jira.gateway';
import { Version3Client } from 'jira.js';
import 'dotenv/config';

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

@Module({
  imports: [CommandModule],
  controllers: [],
  providers: [
    CreateTestsCommand,
    CreateTestsInteractor,
    FileService,
    JiraGateway,
    jiraClientProvider,
  ],
})
export class AppModule {}
