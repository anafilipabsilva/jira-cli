import { Command, Positional } from 'nestjs-command';
import { Injectable } from '@nestjs/common';
import { CreateTestsInteractor } from '../interactors/createTests.interactor';

@Injectable()
export class CreateTestsCommand {
  constructor(private readonly createTestsInteractor: CreateTestsInteractor) {}

  @Command({
    command: 'create:tests <filepath>',
    describe: 'Create tests from a file',
    autoExit: true,
  })
  async create(
    @Positional({
      name: 'filepath',
      describe: 'The path to the file containing the tests to be created',
      type: 'string',
    })
    filepath: string,
  ) {
    const result = await this.createTestsInteractor.call(filepath);
    console.dir(result);
  }
}
