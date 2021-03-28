export class Step {
  action: string;
  data: string;
  result: string;
}

export class JiraTest {
  summary: string;
  projectKey: string;
  description: string;
  issueType: string;
  steps: Step[];
}
