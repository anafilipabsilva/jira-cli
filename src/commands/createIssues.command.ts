import { Command, Positional } from 'nestjs-command';
import { Injectable } from '@nestjs/common';
import { CreateIssuesInteractor } from '../interactors/createIssues.interactor';

@Injectable()
export class CreateIssuesCommand {
  constructor(
    private readonly createIssuesInteractor: CreateIssuesInteractor,
  ) {}

  @Command({
    command: 'create:issues <filepath>',
    describe: 'Creates issues from a file',
    autoExit: true,
  })
  async create(
    @Positional({
      name: 'filepath',
      describe: 'The path to the file containing the issues to be created',
      type: 'string',
    })
    filepath: string,
  ) {
    const result = await this.createIssuesInteractor.call(filepath);
    console.dir(result);
  }
}
