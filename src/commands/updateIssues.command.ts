import { Injectable } from '@nestjs/common';
import { Command, Option } from 'nestjs-command';
import { UpdateIssuesInteractor } from '../interactors/updateIssues.interactor';

@Injectable()
export class UpdateIssuesCommand {
  constructor(
    private readonly updateIssuesInteractor: UpdateIssuesInteractor,
  ) {}

  @Command({
    command: 'update:issues',
    describe: 'Updates issues from a file',
    autoExit: true,
  })
  async update(
    @Option({
      name: 'filepath',
      describe: 'The path to the file containing the issues to be updated',
      type: 'string',
      alias: 'f',
      required: true,
    })
    filepath: string,
  ) {
    const result = await this.updateIssuesInteractor.call(filepath);
    if (result.length == 0) {
      console.log('No issues updated');
    } else {
      console.log('Issues updated successfully');
      console.log(result);
    }
  }
}
