import { Injectable } from '@nestjs/common';
import { Command, Positional, Option } from 'nestjs-command';
import { ListIssuesInteractor } from './../interactors/listIssues.interactor';

@Injectable()
export class ListIssuesCommand {
  constructor(private readonly listIssuesInteractor: ListIssuesInteractor) {}

  @Command({
    command: 'list:issues <projectId> <issueType> [<fixVersion>]',
    describe:
      'Lists all the issues for a specific project and issue type, with the possibility to filter by fix versions (optional)',
    autoExit: true,
  })
  async create(
    @Positional({
      name: 'projectId',
      describe:
        'The ID of the project (e.g. for the Integrations project, the id is INT or 10301)',
      type: 'string',
    })
    projectId: string,
    // @Option({
    //   flags: '-issueType',
    //   describe:
    //     'The issue type to search for issues (e.g. Epic, Story, Xray Test...) (make sure you use single quotation marks if the string has more than one word)',
    //   type: 'string',
    // })
    issueType: string,
    @Positional({
      name: 'fixVersion',
      describe:
        "The ID of the fix version/release (e.g. Summer'21 has the id 33440; you can find the id in the Releases section, by hovering the mouse on the fix version",
      type: 'string',
    })
    fixVersion: string,
  ) {
    const result = await this.listIssuesInteractor.call(
      projectId,
      issueType,
      fixVersion,
    );
    console.dir(result);
  }
}
