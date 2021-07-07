<h1><p align="center">JIRA CLI</p></h1>

**JIRA CLI** was born from the need to have a tool that would allow to easily create Xray tests in bulk. For those who ever tried to create Xray tests in Jira, you know how painful and time consuming it can be.
From that need to all the features that are now available in this CLI, it was just a small step.

With **JIRA CLI**, you can:
- create and update issues, individually or in bulk;
- get the information of a certain issue;
- search for issues that match certain conditions;
- add a defined label to the issues belonging to a certain epic, with a certain feasability.

The great advantage resides in automating some processes, which saves a lot of time. 

This project is open for contributions and new ideas, so don't be shy and share your thoughts with me!


## Requirements

In order to run JIRA CLI, it is necessary to have:
- Node.js (at least v12);
- yarn;
- an Atlassian account;
- if you want to add Xray tests, you also need to have the Xray plugin added to your Jira.

## Setting Up

To install and build the project, run the following commands:

```bash
$ yarn install
```

```bash
$ yarn build
```

In order to run the project and invoke the commands globally, you need to:
-  give execution permissions to the binary file `jira-cli.js`

```bash
$ chmod +x ./bin/jira-cli.js
```

- add the binary file path to your shell script (e.g. zshrc)

```bash
$ export PATH=<project_path>/bin:$PATH
```

## Adding Env Vars

So you can run the app, first it is necessary to set up a `.env` file. You can find [here](./.env.example) the an example of the env vars needed for the project.

| Env Var      | Description |
| --------- | --------- |
| Jira Host     | The Atlassian account URL       |
| Jira Email   | The email you have associated with the Atlassian account        |
| Jira Token   | Necessary to perform authentication in the Atlassian account. You can generate a token in the [Atlassian account settings](https://id.atlassian.com/manage-profile/security/api-tokens)        |
| Xray Client ID / Xray Client Secret   | Necessary to make requests to Xray (to create/update/get Xray tests). You can generate them following the next steps: Jira > Apps > Manage you apps > (Xray label menu) > Api Keys > Create Api Key > Choose the user > Generate. If you don't have the permissions, you need to ask these to an Atlassian account admin.        |
| Epic Name / Epic Link ID / Acceptance Criteria / Feasability   | These are all custom fields that can be added to Jira issues to allow having more information. Therefore, they are identified as `customfield_XXXXX` (the XXXXX is a number) and these IDs are different for every Atlassian account. To find what are the IDs for your custom fields, follow this [link](https://confluence.atlassian.com/jirakb/how-to-find-id-for-custom-field-s-744522503.html).          |

## Running the App

To know more on the commands available, you can run:

```bash
$ jira-cli --help 
```

To have some more insights about each command, you can either run the command or follow the links for each feature below.

```bash
$ jira-cli <command> --help 
```

| Commands      | Description |
| --------- | --------- |
| [Create Issues](./docs/features.md#CreateIssues)     | Creates issues from a file       |
| [Update Issues](./docs/features.md#UpdateIssues)   | Updates issues from a file        |
| [Get Templates](./docs/features.md#GetTemplates)   | Presents the URLs for the template forms to create and update issues        |
| [Get Issue](./docs/features.md#GetIssue)   | Gets the information of an issue        |
| [Search Issues](./docs/features.md#SearchIssues)   | Searches for issues using specific parameters        |
| [Update Epic Issues Feasability](./docs/features.md#UpdateEpicIssuesFeasability)   | Adds a label (spillover or descoped) to the issues of an epic (for a certain project and release/fix version) if the epic feasability is Yellow or Red (respectively)     |
