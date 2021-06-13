import { Injectable } from '@nestjs/common';
import { Command, Option } from 'nestjs-command';
import { GetIssueInteractor } from '../interactors/getIssue.interactor';

@Injectable()
export class GetIssueCommand {
  constructor(private readonly getIssueInteractor: GetIssueInteractor) {}

  @Command({
    command: 'get:issue',
    describe: 'Gets the information of an issue',
    autoExit: true,
  })
  async create(
    @Option({
      name: 'id',
      describe: 'The ID of the issue (e.g. INT-1234)',
      type: 'string',
      alias: 'i',
      required: true,
    })
    id: string,
  ) {
    const result = await this.getIssueInteractor.call(id);
    console.dir(result);
  }
}
