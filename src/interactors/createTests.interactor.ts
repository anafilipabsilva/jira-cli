import { Injectable } from '@nestjs/common';
import { FileService } from './../services/file.service';

@Injectable()
export class CreateTestsInteractor {
  constructor(private readonly fileService: FileService) {}

  async call(filepath: string) {
    console.log(`Hello world ${filepath}!`);
    const tests = await this.fileService.readFile(filepath);
    console.dir(tests);
  }
}
