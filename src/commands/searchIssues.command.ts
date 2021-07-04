import { Injectable } from '@nestjs/common';
import { Command, Option } from 'nestjs-command';
import { SearchIssuesInteractor } from '../interactors/searchIssues.interactor';

@Injectable()
export class SearchIssuesCommand {
  constructor(
    private readonly searchIssuesInteractor: SearchIssuesInteractor,
  ) {}

  @Command({
    command: 'search:issues',
    describe: 'Searches for issues using specific parameters',
    autoExit: true,
  })
  async create(
    @Option({
      name: 'projectId',
      describe:
        'The ID of the project (e.g. for the Integrations project, the id is INT or 10301)',
      type: 'string',
      alias: 'p',
      required: true,
    })
    projectId: string,
    @Option({
      name: 'issueType',
      describe:
        'The issue type to search for issues (e.g. Epic, Story, Xray Test...) (make sure you use single quotation marks if the string has more than one word)',
      type: 'string',
      alias: 't',
      required: false,
    })
    issueType: string,
    @Option({
      name: 'release',
      describe:
        "The ID of the release/fix version (e.g. Summer'21 has the id 33440; you can find the id in the Releases section, by hovering the mouse on the fix version",
      type: 'string',
      alias: 'r',
      required: false,
    })
    release: string,
    @Option({
      name: 'status',
      describe:
        'The status of the issue (e.g. To Do, In Progress...) (make sure you use single quotation marks if the string has more than one word)',
      type: 'string',
      alias: 's',
      required: false,
    })
    status: string,
    @Option({
      name: 'feasability',
      describe:
        'The feasability of the issue (e.g. Green, Yellow, Red, Orange)',
      type: 'string',
      alias: 'f',
      required: false,
    })
    feasability: string,
    @Option({
      name: 'epicLinkId',
      describe:
        'The ID for the epic link associated to the issue (e.g. INT-123)',
      type: 'string',
      alias: 'e',
      required: false,
    })
    epicLinkId: string,
    @Option({
      name: 'label',
      describe: 'A label of the issue (e.g. asgard, mordor, rivendell...)',
      type: 'string',
      alias: 'l',
      required: false,
    })
    label: string,
  ) {
    const result = await this.searchIssuesInteractor.call(
      projectId,
      issueType,
      release,
      status,
      feasability,
      epicLinkId,
      label,
    );
    if (result.length == 0) {
      console.log('There are no issues corresponding to your search');
    } else {
      console.log(JSON.stringify(result, null, 2));
    }
  }
}
