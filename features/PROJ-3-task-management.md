# PROJ-3: Task Management

## Status: In Review
**Created:** 2026-02-21
**Last Updated:** 2026-02-21

## Dependencies
- Requires: PROJ-1 (User Authentication) — tasks are always owned by a logged-in user
- Requires: PROJ-2 (Project Management) — tasks always belong to a project

## User Stories
- As a logged-in user, I want to create a task within a project so that I can track work items.
- As a logged-in user, I want to set a task status (Todo / In Progress / Done) so that I know what state each task is in.
- As a logged-in user, I want to edit a task's title and description so that I can update details as things change.
- As a logged-in user, I want to delete a task so that I can remove tasks that are no longer needed.
- As a logged-in user, I want to see all tasks for a project in a list so that I can see what needs to be done.
- As a logged-in user, I want to filter tasks by status so that I can focus on relevant tasks.
- As a logged-in user, I want to set a due date on a task so that I can track deadlines.

## Acceptance Criteria
- [ ] User can create a task with a required title (max. 200 characters)
- [ ] User can optionally add a description (max. 1000 characters)
- [ ] User can optionally set a due date
- [ ] Task has a status field with three values: "Todo", "In Progress", "Done"
- [ ] New tasks default to status "Todo"
- [ ] User can change task status via a dropdown or status selector
- [ ] Task list shows: title, status badge, due date (if set), creation date
- [ ] User can filter the task list by status (All / Todo / In Progress / Done)
- [ ] User can edit a task's title, description, status, and due date
- [ ] User can delete a task with a confirmation prompt
- [ ] Empty state is shown when a project has no tasks
- [ ] Tasks are sorted by creation date (newest first) by default

## Edge Cases
- What happens when a task title is empty on save? → Validation error: "Title is required"
- What happens when the due date is set in the past? → Show a warning badge "Overdue" but allow it
- What happens when a project has many tasks (50+)? → Paginate or lazy-load (no endless scroll required for MVP)
- What happens when the user filters by a status with no tasks? → Show empty state "No tasks with this status"
- What happens when a task title exceeds 200 characters? → Validation error with character count

## Technical Requirements
- Security: Users can only see and modify tasks in their own projects (RLS policy required)
- Performance: Task list loads within 300ms
- Browser Support: Chrome, Firefox, Safari, Edge

---
<!-- Sections below are added by subsequent skills -->

## Tech Design (Solution Architect)
_To be added by /architecture_

## QA Test Results

**Tested:** 2026-02-22
**App URL:** http://localhost:3000
**Tester:** QA Engineer (AI)
**Build Status:** PASS (compiles successfully, no TypeScript errors)

### Acceptance Criteria Status

#### AC-1: User can create a task with a required title (max. 200 characters)
- [x] POST `/api/projects/[id]/tasks` endpoint exists and requires authentication
- [x] Zod `taskSchema` enforces `title` as required string with `.min(1)` and `.max(200)`
- [x] HTML input has `maxLength={200}` attribute as client-side guard
- [x] TaskFormDialog uses react-hook-form with zodResolver for client validation
- [x] Server-side validation via `taskSchema.safeParse(body)` returns 422 on failure
- [x] Character counter displayed below title input (`{titleValue?.length ?? 0}/200`)
- **Result: PASS**

#### AC-2: User can optionally add a description (max. 1000 characters)
- [x] Zod schema allows description as optional with `.max(1000)`, or empty string via `.or(z.literal(""))`
- [x] HTML textarea has `maxLength={1000}` attribute
- [x] Character counter displayed below description textarea
- [x] API stores `description: description || null` (normalizes empty string to null)
- **Result: PASS**

#### AC-3: User can optionally set a due date
- [x] TaskFormDialog includes a date input field (`<Input type="date" />`)
- [x] Zod schema allows `due_date` as optional string, empty string, or null
- [x] API normalizes: `due_date: values.due_date || null`
- [x] Database column: `due_date DATE` (nullable)
- **Result: PASS**

#### AC-4: Task has a status field with three values: "Todo", "In Progress", "Done"
- [x] `TASK_STATUSES = ["todo", "in_progress", "done"] as const` defined in validation
- [x] `TASK_STATUS_LABELS` maps to human-readable labels: "Todo", "In Progress", "Done"
- [x] Zod schema uses `z.enum(TASK_STATUSES)` -- only these three values accepted
- [x] Database CHECK constraint: `status IN ('todo', 'in_progress', 'done')`
- [x] TaskFormDialog has a Select dropdown with all three statuses
- **Result: PASS**

#### AC-5: New tasks default to status "Todo"
- [x] TaskFormDialog `defaultValues` sets `status: "todo"`
- [x] API POST route: `status: status || "todo"` (fallback to "todo")
- [x] Database: `status TEXT NOT NULL DEFAULT 'todo'`
- **Result: PASS**

#### AC-6: User can change task status via a dropdown or status selector
- [x] TaskItem renders a `<Select>` component with all three statuses
- [x] `onStatusChange` handler sends PATCH request with updated status
- [x] Optimistic update: UI updates immediately, reverts on failure
- [x] PATCH endpoint accepts status change via `taskSchema.safeParse(body)`
- **Result: PASS**

#### AC-7: Task list shows: title, status badge, due date (if set), creation date
- [x] TaskItem displays `task.title` (with line-through styling when done)
- [x] TaskItem displays TaskStatusBadge on mobile (`sm:hidden` div)
- [x] TaskItem displays due date with Calendar icon when `task.due_date` is set
- [x] TaskItem displays creation date: `"Created {formatDate(task.created_at)}"` (hidden on mobile via `hidden sm:inline`)
- [ ] BUG: Creation date is hidden on mobile (375px) -- spec says task list should show creation date (see BUG-1)
- **Result: PARTIAL PASS (see BUG-1)**

#### AC-8: User can filter the task list by status (All / Todo / In Progress / Done)
- [x] TaskList renders `<Tabs>` with filter values: "all", "todo", "in_progress", "done"
- [x] Each tab shows count: e.g., "All (5)", "Todo (2)", "In Progress (1)", "Done (2)"
- [x] `filteredTasks` variable applies client-side filtering based on selected tab
- [x] Tabs only appear when `tasks.length > 0` (hidden on empty state)
- **Result: PASS**

#### AC-9: User can edit a task's title, description, status, and due date
- [x] TaskItem dropdown menu has "Edit" option that calls `onEdit(task)`
- [x] TaskFormDialog opens in edit mode when `task` prop is provided
- [x] Form pre-fills with existing task data via `useEffect` on `open` change
- [x] Sends PATCH to `/api/projects/${projectId}/tasks/${task.id}` with all fields
- [x] PATCH endpoint validates all fields and scopes update to `user_id`, `project_id`, and `taskId`
- **Result: PASS**

#### AC-10: User can delete a task with a confirmation prompt
- [x] TaskItem dropdown menu has "Delete" option that calls `onDelete(task)`
- [x] DeleteTaskDialog uses shadcn AlertDialog with task title in confirmation message
- [x] Shows "Delete Task" title with "This action cannot be undone" warning
- [x] Delete button is destructive variant, Cancel button available
- [x] Sends DELETE to `/api/projects/${projectId}/tasks/${task.id}`
- [x] Loading state shown during deletion
- **Result: PASS**

#### AC-11: Empty state is shown when a project has no tasks
- [x] TaskList renders empty state when `tasks.length === 0`
- [x] Shows "No tasks yet" message with descriptive text
- [x] Shows "Create your first task" CTA button with Plus icon
- [x] Empty state uses dashed border and centered layout
- **Result: PASS**

#### AC-12: Tasks are sorted by creation date (newest first) by default
- [x] GET API query uses `.order("created_at", { ascending: false })`
- [x] Newest tasks appear at the top of the list
- **Result: PASS**

### Edge Cases Status

#### EC-1: Empty task title produces validation error "Title is required"
- [x] Zod message: `"Title is required"` for `.min(1)`
- [x] Client-side: react-hook-form shows inline error via FormMessage
- [x] Server-side: returns 422 with error message
- **Result: PASS**

#### EC-2: Due date in the past shows "Overdue" warning badge
- [x] `isOverdue()` function compares due date with today (midnight-normalized comparison)
- [x] Overdue badge rendered in red: `"Overdue"` text with red background
- [x] Overdue check excludes tasks with status "done" (`task.status !== "done"`)
- [x] Due date styling turns red when overdue (`text-red-600` / `dark:text-red-400`)
- **Result: PASS**

#### EC-3: Project with many tasks (50+) -- pagination or lazy-load
- [ ] BUG: No pagination implemented. The GET API has `.limit(100)` which prevents loading more than 100 tasks, but there is no pagination UI or mechanism to load additional pages if a project exceeds 100 tasks. For projects with 50-100 tasks, all tasks load at once with no lazy loading. (see BUG-2)
- **Result: FAIL (see BUG-2)**

#### EC-4: Filter by status with no tasks shows empty state
- [x] When `filteredTasks.length === 0` but `tasks.length > 0`, shows "No tasks with this status" message
- [x] Includes "Show all tasks" ghost button to reset filter
- **Result: PASS**

#### EC-5: Task title exceeding 200 characters shows validation error with character count
- [x] Zod message: `"Title must be 200 characters or less"` for `.max(200)`
- [x] HTML `maxLength={200}` prevents typing beyond 200 chars
- [x] Live character counter shown: `{titleValue?.length ?? 0}/200`
- **Result: PASS**

### Cross-Browser Testing (Static Analysis)

- [x] All components use standard shadcn/ui primitives (Dialog, AlertDialog, Select, Tabs, Badge, Button, Input, Textarea, Form, DropdownMenu, Skeleton)
- [x] No browser-specific CSS or APIs used
- [x] Tailwind CSS is cross-browser compatible
- [x] `Date` object usage is standard (no Intl APIs beyond `toLocaleDateString` which is well-supported)
- **Note:** Manual browser testing not performed (code review only). Components rely on well-tested shadcn/ui library.

### Responsive Testing (Static Analysis)

- [x] TaskItem uses flex layout with `min-w-0` for text truncation on narrow screens
- [x] TaskFormDialog uses responsive grid: `grid-cols-1 sm:grid-cols-2` for status/due-date row
- [x] Dialog constrained to `sm:max-w-[500px]`
- [x] Status badge shown on mobile (`sm:hidden` div), Select dropdown for desktop
- [x] Filter tabs use responsive text sizes: `text-xs sm:text-sm`
- [ ] BUG: Creation date hidden on mobile via `hidden sm:inline` (see BUG-1)
- [ ] BUG: Task action buttons use `opacity-0 group-hover:opacity-100` which does not work on touch devices -- no tap mechanism visible (see BUG-3)
- **Result: PARTIAL PASS (mobile usability issues)**

### Security Audit Results

#### SEC-1: Authentication
- [x] GET `/api/projects/[id]/tasks` checks `supabase.auth.getUser()` and returns 401 if unauthenticated
- [x] POST `/api/projects/[id]/tasks` checks authentication before processing
- [x] PATCH `/api/projects/[id]/tasks/[taskId]` checks authentication
- [x] DELETE `/api/projects/[id]/tasks/[taskId]` checks authentication
- [x] Project detail page (`/dashboard/projects/[id]`) server-side redirects to `/login` if no user
- [x] Middleware protects `/dashboard` routes
- **Result: PASS**

#### SEC-2: Authorization (User A cannot access User B's data)
- [x] RLS policies enforce `auth.uid() = user_id` for SELECT, INSERT, UPDATE, DELETE on tasks table
- [x] GET API verifies project ownership first: `.eq("user_id", user.id)` on project lookup
- [x] POST API verifies project ownership before creating task, inserts `user_id: user.id`
- [x] PATCH API scopes update to `.eq("user_id", user.id)` in addition to `.eq("id", taskId)` and `.eq("project_id", projectId)` -- triple-scoped
- [x] DELETE API scopes delete to `.eq("user_id", user.id)` in addition to task and project IDs
- [x] INSERT policy uses `WITH CHECK (auth.uid() = user_id)` to prevent user_id spoofing
- **Result: PASS**

#### SEC-3: Input Validation / Injection
- [x] All user input validated server-side with Zod before database operations
- [x] Supabase client uses parameterized queries (no raw SQL injection possible)
- [x] XSS: React auto-escapes all rendered content. Task titles and descriptions rendered as text nodes, not `dangerouslySetInnerHTML`
- [x] Status field validated against enum -- cannot inject arbitrary status values
- [ ] BUG: The `taskId` and `id` (projectId) parameters in PATCH and DELETE routes are not validated as UUID format. A malformed ID passed to `.eq("id", taskId)` will cause a PostgreSQL type error, resulting in a 500 error that leaks the raw Supabase error message to the client. (see BUG-4)
- **Result: PARTIAL PASS (see BUG-4)**

#### SEC-4: Rate Limiting
- [ ] BUG: No rate limiting on task API endpoints. An attacker could spam POST `/api/projects/[id]/tasks` to create thousands of tasks, or rapidly call PATCH to flood the database with updates. (see BUG-5)
- **Result: FAIL (see BUG-5)**

#### SEC-5: Exposed Secrets / Data Leaks
- [x] No secrets in source code
- [ ] BUG: API error responses return raw Supabase `error.message` (e.g., on GET line 38, POST line 93, PATCH line 45, DELETE line 75) which may leak internal schema details (table names, column types, constraint names) to the client. (see BUG-6)
- **Result: PARTIAL PASS (see BUG-6)**

#### SEC-6: IDOR (Insecure Direct Object Reference) on task manipulation
- [x] PATCH and DELETE endpoints require all three: `taskId`, `projectId`, and `user_id` to match -- prevents cross-project task manipulation
- [x] GET endpoint verifies project ownership before returning tasks
- [x] POST endpoint verifies project ownership before creating tasks
- **Result: PASS**

#### SEC-7: Optimistic update revert on failure
- [x] `handleStatusChange` in TaskList reverts status on both fetch error and non-ok response
- [ ] BUG: No user feedback (toast/alert) is shown when status change fails -- the revert happens silently. The user may not realize the change did not persist. (see BUG-7)
- **Result: PARTIAL PASS (see BUG-7)**

### Regression Testing

#### PROJ-1: User Authentication
- [x] Auth middleware still protects `/dashboard` and `/dashboard/projects/[id]` routes
- [x] Login redirect still works for unauthenticated users
- [x] Profile link in dashboard header still present
- **Result: PASS (no regressions detected)**

#### PROJ-2: Project Management
- [x] Project detail page `/dashboard/projects/[id]` still renders project name and description
- [x] Project detail page now includes `<TaskList projectId={id} />` component (previously showed placeholder)
- [x] "Back to Projects" navigation link still works
- [x] Project CRUD operations not affected by task implementation
- [ ] BUG: Project card still shows "0 tasks" because GET `/api/projects` still uses `.select("*")` which does not include a task count join. Now that tasks table exists, this should be updated. (see BUG-8)
- **Result: PARTIAL PASS (see BUG-8 -- regression from PROJ-2 BUG-1 now fixable)**

### Bugs Found

#### BUG-1: Creation date hidden on mobile (375px)
- **Severity:** Low
- **Steps to Reproduce:**
  1. Open a project with tasks on a 375px viewport
  2. Observe the task items
  3. Expected: Creation date visible per AC-7 ("Task list shows: title, status badge, due date, creation date")
  4. Actual: Creation date uses `hidden sm:inline` class, so it is completely invisible below 640px
- **File:** `e:\VScode\TestProject-1\src\components\task-item.tsx` (line 118)
- **Priority:** Nice to have (reasonable mobile space optimization, but contradicts spec)

#### BUG-2: No pagination for projects with many tasks (50+)
- **Severity:** Medium
- **Steps to Reproduce:**
  1. Create a project with more than 100 tasks (e.g., via API)
  2. Open the project detail page
  3. Expected: Pagination or lazy-load mechanism to handle 50+ tasks
  4. Actual: API returns max 100 tasks (`.limit(100)`), no way to see tasks beyond the first 100. For 50-100 tasks, all load at once with potential performance issues.
- **File:** `e:\VScode\TestProject-1\src\app\api\projects\[id]\tasks\route.ts` (line 35)
- **Priority:** Fix in next sprint (MVP acceptable for small task counts, but spec explicitly mentions this)

#### BUG-3: Task action buttons invisible on touch devices
- **Severity:** Medium
- **Steps to Reproduce:**
  1. Open a project with tasks on a mobile device (or touch-enabled device)
  2. Try to access the task action menu (Edit/Delete)
  3. Expected: Action buttons accessible via tap
  4. Actual: Action button uses `opacity-0 group-hover:opacity-100` -- on touch devices without hover, the button is invisible (opacity-0). The `focus:opacity-100` class helps if the user tabs to it, but there is no natural way to tap an invisible element on mobile.
- **File:** `e:\VScode\TestProject-1\src\components\task-item.tsx` (line 131)
- **Priority:** Fix before deployment (core functionality inaccessible on mobile)

#### BUG-4: No UUID validation on taskId and projectId parameters in task API routes
- **Severity:** Medium
- **Steps to Reproduce:**
  1. Send PATCH request to `/api/projects/not-a-uuid/tasks/also-not-a-uuid`
  2. Expected: 400 Bad Request with clear "Invalid ID" message
  3. Actual: 500 Internal Server Error with raw Supabase error message (e.g., `invalid input syntax for type uuid: "not-a-uuid"`)
- **Files:** `e:\VScode\TestProject-1\src\app\api\projects\[id]\tasks\route.ts`, `e:\VScode\TestProject-1\src\app\api\projects\[id]\tasks\[taskId]\route.ts`
- **Priority:** Fix before deployment

#### BUG-5: No rate limiting on task API endpoints
- **Severity:** High
- **Steps to Reproduce:**
  1. Send 1000 rapid POST requests to `/api/projects/[id]/tasks` with valid auth
  2. Expected: Requests throttled after a reasonable limit
  3. Actual: All requests processed, creating 1000 tasks
- **Files:** `e:\VScode\TestProject-1\src\app\api\projects\[id]\tasks\route.ts`, `e:\VScode\TestProject-1\src\app\api\projects\[id]\tasks\[taskId]\route.ts`
- **Note:** Required per `.claude/rules/security.md`
- **Priority:** Fix before deployment

#### BUG-6: Raw Supabase error messages exposed to client in task APIs
- **Severity:** Medium
- **Steps to Reproduce:**
  1. Trigger any database error in task APIs (e.g., send malformed UUID)
  2. Expected: Generic error message like "Something went wrong"
  3. Actual: Response contains `error.message` from Supabase, potentially exposing table names, column names, and constraint details
- **Files:** `e:\VScode\TestProject-1\src\app\api\projects\[id]\tasks\route.ts` (lines 38, 93), `e:\VScode\TestProject-1\src\app\api\projects\[id]\tasks\[taskId]\route.ts` (lines 45, 75)
- **Priority:** Fix before deployment

#### BUG-7: No user feedback on failed status change (silent revert)
- **Severity:** Low
- **Steps to Reproduce:**
  1. Change a task's status via the dropdown
  2. Simulate a network error or server failure during the PATCH request
  3. Expected: User sees an error toast or message indicating the change failed
  4. Actual: The status silently reverts to the previous value with no indication of failure
- **File:** `e:\VScode\TestProject-1\src\components\task-list.tsx` (lines 72-108)
- **Priority:** Fix in next sprint

#### BUG-8: Project card task count still shows 0 (PROJ-2 regression now fixable)
- **Severity:** Medium
- **Steps to Reproduce:**
  1. Create a project and add tasks to it
  2. Navigate back to the dashboard
  3. Observe the project card badge shows "0 tasks"
  4. Expected: Badge shows actual task count now that tasks table exists
  5. Actual: GET `/api/projects` uses `.select("*")` which does not join task count
- **File:** `e:\VScode\TestProject-1\src\app\api\projects\route.ts` (line 15-19)
- **Note:** This was originally PROJ-2 BUG-1, deferred because the tasks table did not exist. Now that PROJ-3 has created the tasks table and migration, this can and should be fixed.
- **Priority:** Fix before deployment

#### BUG-9: Delete task dialog shows no error feedback on failure
- **Severity:** Low
- **Steps to Reproduce:**
  1. Trigger a failed DELETE (e.g., network error)
  2. Expected: User sees an error message in the dialog
  3. Actual: The `handleDelete` function only acts on `res.ok`. If the request fails, loading state resets but no error message is shown.
- **File:** `e:\VScode\TestProject-1\src\components\delete-task-dialog.tsx` (lines 35-49)
- **Priority:** Fix in next sprint

#### BUG-10: PATCH endpoint requires all fields (not partial update)
- **Severity:** Medium
- **Steps to Reproduce:**
  1. The `handleStatusChange` function in TaskList sends the entire task object for a simple status change (title, description, status, due_date)
  2. The PATCH endpoint uses `taskSchema.safeParse(body)` which requires `title` (min 1 char) and `status` (enum) -- effectively requiring all fields for any partial update
  3. Expected: A status-only change should only need the status field (PATCH semantics)
  4. Actual: If any required field is missing from the PATCH body, the request fails with 422
- **Analysis:** While the current frontend always sends all fields, this is fragile. If a future client sends only the changed field (standard REST PATCH behavior), the request will fail. The `taskSchema` should use `.partial()` for PATCH operations, or a separate `taskUpdateSchema` should be created.
- **File:** `e:\VScode\TestProject-1\src\app\api\projects\[id]\tasks\[taskId]\route.ts` (line 19)
- **Priority:** Fix in next sprint

#### BUG-11: Tasks migration has same timestamp prefix as projects migration
- **Severity:** High
- **Steps to Reproduce:**
  1. Check migration filenames: `20260222000001_create_projects_table.sql` and `20260222000001_create_tasks_table.sql`
  2. Both share the exact same timestamp prefix `20260222000001`
  3. Expected: Each migration has a unique timestamp to guarantee execution order (tasks must run after projects because tasks references `projects(id)`)
  4. Actual: Supabase CLI sorts migrations by filename. With identical timestamps, the alphabetical ordering happens to work (`create_projects` before `create_tasks`), but this is fragile and violates migration best practices. If any migration tool uses strict timestamp ordering, this could cause a collision or skip.
- **Files:** `e:\VScode\TestProject-1\supabase\migrations\20260222000001_create_projects_table.sql`, `e:\VScode\TestProject-1\supabase\migrations\20260222000001_create_tasks_table.sql`
- **Priority:** Fix before deployment (rename tasks migration to `20260222000002_create_tasks_table.sql` to guarantee order)

### Summary
- **Acceptance Criteria:** 11/12 passed, 1 partial (AC-7 creation date hidden on mobile)
- **Edge Cases:** 4/5 passed, 1 failed (EC-3 no pagination)
- **Bugs Found:** 11 total (0 critical, 2 high, 5 medium, 4 low)
- **Security:** Issues found (no rate limiting, error message leakage, missing UUID validation)
- **Production Ready:** NO
- **Recommendation:** Fix BUG-5 (high: rate limiting) and BUG-11 (high: migration timestamp collision) first. Then fix BUG-3, BUG-4, BUG-6, BUG-8, BUG-10 (medium) before deployment. After fixes, run `/qa` again to verify.

## Deployment
_To be added by /deploy_
