<h1><p align="center">JIRA CLI</p></h1>

**JIRA CLI** was born from the need to have a tool that would allow to easily create Xray tests in bulk. For those who ever tried to create Xray tests in Jira, you know how painful and time consuming it can be.
From that need to all the features that are now available in this CLI, it was just a small step.

With **JIRA CLI**, you can:
- create and update issues, individually or in bulk;
- get the information of a certain issue;
- search for issues that match certain conditions;
- add a defined label to the issues belonging to a certain epic, with a certain feasability.

The great advantage resides in automationg some processes, which saves a lot of time. 

This project is open for contributions and new ideas, so don't be shy and share your thoughts with me!


## Requirements

In order to run JIRA CLI, it is necessary to have:
- Node.js (at least v12)
- yarn

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

## Running the app

```bash
# development
$ npm run start

# watch mode
$ npm run start:dev

# production mode
$ npm run start:prod
```
