### Create Issues

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

Instead of writing JSON by yourself, you can follow this [link](t.ly/BGRx). It sends you to a JSON Schema Form, that will generate the JSON according to the fields you fill in. Then you just need to copy the JSON generated in the `formData` box to the file you will use in the command.


### Update Issues

The following command allows updating one or multiple issues from a file:

```bash
$ jira-cli update:issues -f <filepath> 
```

Just like for creating an issue, the file should contain JSON. For updating an issue, the only mandatory field is the `id`.

Once again, instead of writing JSON by yourself, you can follow this [link](t.ly/MNUG), which will send you to the right JSON Schema Form to update an issue. You just need to copy the JSON generated in the `formData` box to the file you will use in the command.

### Get Templates

If you need a quick shortcut to get the URLs for JSON Schema Forms to create and update issues, you can use the following command:

```bash
$ jira-cli get:templates 
```

### Get Issue

If you need to quickly retrieve the information of an issue, without having to go to Jira platform, then you just need to know the issue ID and use it in the following command:

```bash
$ jira-cli get:issue -i <issue_id>
```

### Search Issues

### Update Epic Issues Feasibility
