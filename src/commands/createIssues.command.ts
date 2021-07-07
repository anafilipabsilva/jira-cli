import { Injectable } from '@nestjs/common';
import { Command, Option } from 'nestjs-command';
import { CreateIssuesInteractor } from '../interactors/createIssues.interactor';

@Injectable()
export class CreateIssuesCommand {
  constructor(
    private readonly createIssuesInteractor: CreateIssuesInteractor,
  ) {}

  @Command({
    command: 'create:issues',
    describe: 'Creates issues from a file',
    autoExit: true,
  })
  async create(
    @Option({
      name: 'filepath',
      describe: 'The path to the file containing the issues to be created',
      type: 'string',
      alias: 'f',
      required: true,
    })
    filepath: string,
  ) {
    const result = await this.createIssuesInteractor.call(filepath);
    console.dir(result);
  }
}
