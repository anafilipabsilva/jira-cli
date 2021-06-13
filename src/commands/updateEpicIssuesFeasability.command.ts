import { Injectable } from '@nestjs/common';
import { Command, Option } from 'nestjs-command';
import { UpdateEpicIssuesFeasabilityInteractor } from '../interactors/updateEpicIssuesFeasability.interactor';

@Injectable()
export class UpdateEpicIssuesFeasabilityCommand {
  constructor(
    private readonly updateEpicIssuesFeasabilityInteractor: UpdateEpicIssuesFeasabilityInteractor,
  ) {}

  @Command({
    command: 'update:issues_feasability',
    describe:
      'Adds a label (spillover or descoped) to the issues of an epic (for a certain project and release/fix version) if the epic feasability is Yellow or Red (respectively)',
    autoExit: true,
  })
  async create(
    @Option({
      name: 'projectId',
      describe:
        'The ID of the project (e.g. for the Integrations project, the id is INT or 10301)',
      type: 'string',
      alias: 'p',
      required: true,
    })
    projectId: string,
    @Option({
      name: 'release',
      describe:
        "The ID of the release/fix version (e.g. Summer'21 has the id 33440; you can find the id in the Releases section, by hovering the mouse on the fix version",
      type: 'string',
      alias: 'r',
      required: false,
    })
    release: string,
  ) {
    const result = await this.updateEpicIssuesFeasabilityInteractor.call(
      projectId,
      release,
    );

    if (result.length == 0) {
      console.log(
        'There are no issues to add the labels spillover or descoped',
      );
    } else {
      console.log(result);
    }
  }
}
