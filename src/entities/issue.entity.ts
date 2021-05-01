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

export class IssueData {
  project_key: string;
  issue_type: string;
  epic_name: string;
  summary: string;
  description: string;
  acceptance_criteria: string;
  epic_link_id: string;
  components: Component[];
  labels: string[];
  fix_versions: FixVersion[];
  feasability: string;
  dependencies: Dependency[];
  test_type: string;
  steps: Step[];
  id: string;
  key: string;
  self: string;
  status: string;
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
