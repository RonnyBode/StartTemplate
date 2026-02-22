# PROJ-4: Dashboard & Overview

## Status: Planned
**Created:** 2026-02-21
**Last Updated:** 2026-02-21

## Dependencies
- Requires: PROJ-1 (User Authentication) — dashboard shows data for the logged-in user
- Requires: PROJ-2 (Project Management) — dashboard displays project data
- Requires: PROJ-3 (Task Management) — dashboard displays task statistics

## User Stories
- As a logged-in user, I want to see a dashboard after login so that I get an immediate overview of my work.
- As a logged-in user, I want to see summary statistics (total projects, tasks by status) so that I understand my overall progress.
- As a logged-in user, I want to see my most recent projects so that I can quickly navigate to active work.
- As a logged-in user, I want to see tasks that are due soon or overdue so that I can prioritize.
- As a logged-in user, I want a quick-action button to create a new project or task from the dashboard.

## Acceptance Criteria
- [ ] Dashboard is the first page shown after successful login
- [ ] Dashboard shows total number of projects
- [ ] Dashboard shows task count broken down by status: Todo, In Progress, Done
- [ ] Dashboard shows up to 5 most recently created/updated projects
- [ ] Dashboard shows up to 5 tasks with the nearest due dates (or overdue)
- [ ] Overdue tasks (due date in the past, status not "Done") are highlighted
- [ ] Each project/task in the lists is clickable and navigates to the correct detail view
- [ ] Dashboard has a "New Project" quick-action button
- [ ] Dashboard shows an empty state with guidance when the user has no projects yet
- [ ] Statistics update in real-time after creating/updating tasks (or on page reload)

## Edge Cases
- What happens when the user has no projects or tasks yet? → Show a welcome empty state with prompts to create first project
- What happens when all tasks are "Done"? → Statistics still display correctly (0 Todo, 0 In Progress, X Done)
- What happens when there are no upcoming due dates? → "Due Soon" section shows empty state or is hidden
- What happens when the user has more than 5 projects? → Show only the 5 most recent with a "View all" link

## Technical Requirements
- Performance: Dashboard loads within 500ms (aggregation queries)
- Security: Only the logged-in user's data is shown (RLS enforced)
- Browser Support: Chrome, Firefox, Safari, Edge

---
<!-- Sections below are added by subsequent skills -->

## Tech Design (Solution Architect)
_To be added by /architecture_

## QA Test Results
_To be added by /qa_

## Deployment
_To be added by /deploy_
