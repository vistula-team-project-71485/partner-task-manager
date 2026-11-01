# Task Manager

Practical Assignment 1 — Team Project IT.

## Student

Student ID: 73497
GitHub username: vistula-team-project-73497

## Application

https://vistula-team-project-73497.github.io/vistula-task-manager/

## Description

A simple task manager built with HTML, CSS and JavaScript.
Tasks are stored in a Supabase PostgreSQL database.
The application uses the Supabase REST API through JavaScript fetch().

Users can:
- View all tasks.
- Add a task with a title and description.
- Edit a task.
- Mark a task as completed or incomplete.
- Delete a task.

Changes remain saved after refreshing the page.

## Technologies

- HTML, CSS and JavaScript
- Supabase PostgreSQL and REST API
- Git and GitHub
- GitHub Pages

## How to use

Open the application link in a browser.
No installation or login is required.

Enter a title and an optional description, then click Add task.
Use Edit, Mark complete / Mark incomplete and Delete to manage tasks.

This is a public demonstration application. Use test data only.
Visitors share the same task list.

## Database

Table: tasks

- id: bigint, automatically generated primary key
- title: text, required
- description: text, optional
- completed: boolean, default false

Row Level Security is enabled with policies allowing public
read, insert, update and delete operations on the tasks table.

config.json contains the project URL, public publishable key
and table name. No secret keys or database passwords are included.

## Testing

Manually tested on the deployed GitHub Pages website:
- Adding a task.
- Keeping the task after refreshing.
- Editing the title and description.
- Changing the completion status.
- Deleting the task and checking after refreshing.

## Team collaboration

Pending — this section will be updated after both Pull Requests are merged.

- My merged Pull Request in my partner's repository: pending.
- My partner's merged Pull Request in this repository: pending.
