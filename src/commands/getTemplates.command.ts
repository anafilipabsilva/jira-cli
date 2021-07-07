import { Injectable } from '@nestjs/common';
import { Command } from 'nestjs-command';

@Injectable()
export class GetTemplatesCommand {
  @Command({
    command: 'get:templates',
    describe:
      'Presents the URLs for the template forms to create and update issues',
    autoExit: true,
  })
  async create() {
    console.info('Template form URL to create issues: t.ly/BGRx');
    console.info('Template form URL to update issues: t.ly/MNUG');
  }
}
