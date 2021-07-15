## Create Issues

The following command allows creating one or multiple issues from a file:

```bash
$ jira-cli create:issues -f <filepath> 
```

The file should contain JSON, as the [example file](./../file.json) shows.

You don't need to use all the fields that are in the example file. For creating issues, the mandatory fields are: 
- `project_key`;
- `issue_type`;
- `summary`.

If the issue type is Epic, then `epic_name` field is also mandatory.

Instead of writing JSON by yourself, you can follow this [link](https://t.ly/GvGS). It sends you to a JSON Schema Form, that will generate the JSON according to the fields you fill in. Then you just need to copy the JSON generated in the `formData` box to the file you will use in the command.


## Update Issues

The following command allows updating one or multiple issues from a file:

```bash
$ jira-cli update:issues -f <filepath> 
```

Just like for creating an issue, the file should contain JSON. For updating an issue, the only mandatory field is the `id`.

Once again, instead of writing JSON by yourself, you can follow this [link](https://t.ly/HiI7), which will send you to the right JSON Schema Form to update an issue. You just need to copy the JSON generated in the `formData` box to the file you will use in the command.

## Get Templates

If you need a quick shortcut to get the URLs for JSON Schema Forms to create and update issues, you can use the following command:

```bash
$ jira-cli get:templates 
```

## Get Issue

If you need to quickly retrieve the information of an issue, without having to go to the Jira platform, then you just need to know the issue ID and use it in the following command:

```bash
$ jira-cli get:issue -i <issue_id>
```

## Search Issues

Have you ever wanted to search for issues with specific characteristics and had troubles doing it directly in the Jira platform? If so, this command may be your solution. 

```bash
$ jira-cli search:issues -p <project_id> -t <issue_type> -l <label> -e <epic_link_id> -f <feasibility> -s <status> -r <release>
```

With this command, you can search for issues for a specific `project_id` (it is the only mandatory field in the command), along with other parameters:
- label;
- epic link ID;
- feasibility;
- status;
- release/fix version;
- issue type.

The logical operator behind this search is **AND**, which means it will list all the issues that correspond to all the conditions.

## Update Epic Issues Feasibility

This is a really specific command. It was designed by request and its sole purpose is to automate a process that was usually done by hand. 

If you have an epic, with the feasibility of **Yellow** or **Red**, this command will search for all the issues in those epics that have the status **To Do** and add to them the label `spillover` or `descoped`, respectively.

For running this command, it is only necessary to know the `project ID` and the `release/fix version ID`. 

```bash
$ jira-cli update:issues_feasibility -p <project_id> -r <release_id>
```
