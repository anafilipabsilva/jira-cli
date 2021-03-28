import { Module } from '@nestjs/common';
import { CommandModule } from 'nestjs-command';
import { CreateTestsCommand } from './commands/createTests.command';
import { CreateTestsInteractor } from './interactors/createTests.interactor';
import { FileService } from './services/file.service';

@Module({
  imports: [CommandModule],
  controllers: [],
  providers: [CreateTestsCommand, CreateTestsInteractor, FileService],
})
export class AppModule {}
