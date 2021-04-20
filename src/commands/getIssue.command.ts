import { Command, Positional } from 'nestjs-command';
import { Injectable } from '@nestjs/common';
import { GetIssueInteractor } from '../interactors/getIssue.interactor';

@Injectable()
export class GetIssueCommand {
  constructor(
    private readonly getIssueInteractor: GetIssueInteractor,
  ) {}

  @Command({
    command: 'get:issue <id>',
    describe: 'Get the information of an issue',
    autoExit: true,
  })
  async create(
    @Positional({
      name: 'id',
      describe: 'The ID of the issue (e.g. INT-1234)',
      type: 'string',
    })
    id: string,
  ) {
    const result = await this.getIssueInteractor.call(id);
    console.dir(result);
  }
}
