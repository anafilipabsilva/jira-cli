import { Command, Positional } from 'nestjs-command';
import { Injectable } from '@nestjs/common';
import { UpdateIssuesInteractor } from '../interactors/updateIssues.interactor';

@Injectable()
export class UpdateIssuesCommand {
  constructor(
    private readonly updateIssuesInteractor: UpdateIssuesInteractor,
  ) {}

  @Command({
    command: 'update:issues <filepath>',
    describe: 'Update issues from a file',
    autoExit: true,
  })
  async update(
    @Positional({
      name: 'filepath',
      describe: 'The path to the file containing the issues to be updated',
      type: 'string',
    })
    filepath: string,
  ) {
    const result = await this.updateIssuesInteractor.call(filepath);
    console.log('Issues updated successfully');
    console.log(result);
  }
}
