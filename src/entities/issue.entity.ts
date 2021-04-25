export class Component {
  name: string;
}

export class FixVersion {
  name: string;
}

export class Dependency {
  type: string; //Test, Blocker...
  key: string;
}

export class Step {
  action: string;
  data: string;
  result: string;
}

export class CreateIssue {
  project_key: string;
  issue_type: string;
  summary: string;
  description: string;
  acceptance_criteria: string;
  components: Component[];
  labels: string[];
  fix_versions: FixVersion[];
  dependencies: Dependency[];
  test_type: string;
  steps: Step[];
}

export class UpdateIssue extends CreateIssue {
  id: string;
  key: string;
  self: string;
}

export class Issue {
  id: string;
  key: string;
  self: string;

  public constructor(data: Partial<Issue> = null) {
    if (data != null) {
      this.id = data.id;
      this.key = data.key;
      this.self = data.self;
    }
  }
}
