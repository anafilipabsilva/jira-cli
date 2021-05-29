import { Injectable } from '@nestjs/common';
import { Command, Positional } from 'nestjs-command';
import { UpdateEpicIssuesFeasability } from '../interactors/updateEpicIssuesFeasability.interactor';

@Injectable()
export class ListIssuesCommand {
  constructor(
    private readonly updateEpicIssuesFeasability: UpdateEpicIssuesFeasability,
  ) {}

  @Command({
    command: 'update:epic_issues:feasability <projectId> <fixVersion>',
    describe:
      'Adds a label to the issues of an epic (for a certain project and fix version/release) depending on the epic feasability',
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
    @Positional({
      name: 'fixVersion',
      describe:
        "The ID of the fix version/release (e.g. Summer'21 has the id 33440; you can find the id in the Releases section, by hovering the mouse on the fix version",
      type: 'string',
    })
    fixVersion: string,
  ) {
    const result = await this.updateEpicIssuesFeasability.call(
      projectId,
      fixVersion,
    );
    console.dir(result);
  }
}
