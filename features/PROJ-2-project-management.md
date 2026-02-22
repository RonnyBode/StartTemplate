# PROJ-2: Project Management

## Status: In Review
**Created:** 2026-02-21
**Last Updated:** 2026-02-21

## Dependencies
- Requires: PROJ-1 (User Authentication) — all project operations require a logged-in user

## User Stories
- As a logged-in user, I want to create a new project with a name and optional description so that I can organize my tasks.
- As a logged-in user, I want to see a list of all my projects so that I can navigate between them.
- As a logged-in user, I want to edit a project's name and description so that I can keep information up to date.
- As a logged-in user, I want to delete a project so that I can remove projects I no longer need.
- As a logged-in user, I want to see how many tasks a project contains so that I can gauge project size.

## Acceptance Criteria
- [ ] User can create a project with a required name (max. 100 characters)
- [ ] User can optionally add a description (max. 500 characters)
- [ ] Project list shows all projects belonging to the logged-in user (no other users' projects)
- [ ] Each project card/row shows: name, description (truncated), task count, creation date
- [ ] User can open a project to view its tasks
- [ ] User can edit the project name and description
- [ ] User sees a validation error if the project name is empty on save
- [ ] User can delete a project with a confirmation dialog
- [ ] Deleting a project also deletes all associated tasks (cascade delete)
- [ ] Empty state is shown when the user has no projects yet

## Edge Cases
- What happens when a user tries to create a project with an empty name? → Validation error: "Name is required"
- What happens when a project name exceeds 100 characters? → Validation error with character count
- What happens when the user deletes a project that has tasks? → Confirmation dialog warns "This will also delete X tasks"
- What happens when there are no projects yet? → Show empty state with a "Create your first project" call-to-action
- What happens when two projects have the same name? → Allowed (no uniqueness constraint)

## Technical Requirements
- Security: Users can only see and modify their own projects (RLS policy required)
- Performance: Project list loads within 300ms
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

#### AC-1: User can create a project with a required name (max. 100 characters)
- [x] POST /api/projects endpoint exists and requires authentication
- [x] Zod schema enforces `name` as required string with max 100 chars
- [x] HTML input has `maxLength={100}` attribute as additional client-side guard
- [x] ProjectFormDialog uses react-hook-form with zodResolver for client validation
- [x] Server-side validation via `projectSchema.safeParse(body)` returns 422 on failure
- **Result: PASS**

#### AC-2: User can optionally add a description (max. 500 characters)
- [x] Zod schema allows description as optional with max 500 chars, or empty string
- [x] HTML textarea has `maxLength={500}` attribute
- [x] API stores `description: description || null` (normalizes empty string to null)
- **Result: PASS**

#### AC-3: Project list shows all projects belonging to the logged-in user (no other users' projects)
- [x] GET /api/projects checks `supabase.auth.getUser()` and returns 401 if not authenticated
- [x] RLS policy on `projects` table: `auth.uid() = user_id` for SELECT
- [x] Query uses `.select("*")` which inherits RLS filtering
- **Result: PASS**

#### AC-4: Each project card/row shows: name, description (truncated), task count, creation date
- [x] ProjectCard displays `project.name` (truncated via CSS `truncate`)
- [x] ProjectCard displays description with `line-clamp-2` or "No description" italic placeholder
- [x] ProjectCard displays creation date via `formatDate()` helper
- [ ] BUG: Task count is always 0 -- the API query uses `.select("*")` which does not include a task count. The `task_count` field on the Project interface is optional and never populated by the backend. There is no tasks table yet (PROJ-3 is Planned), and no join or count query.
- **Result: PARTIAL PASS (see BUG-1)**

#### AC-5: User can open a project to view its tasks
- [x] ProjectCard name is a Link to `/dashboard/projects/${project.id}`
- [x] Project detail page `/dashboard/projects/[id]/page.tsx` exists
- [x] Detail page checks auth and fetches project scoped to user_id
- [x] Shows 404 if project not found or not owned by user
- [x] Shows placeholder card "Task management is coming in the next update"
- **Result: PASS**

#### AC-6: User can edit the project name and description
- [x] ProjectCard dropdown menu has "Edit" option that opens ProjectFormDialog in edit mode
- [x] ProjectFormDialog pre-fills form with existing project data via `useEffect`
- [x] PATCH /api/projects/[id] endpoint validates input and scopes update to `user_id`
- **Result: PASS**

#### AC-7: User sees a validation error if the project name is empty on save
- [x] Zod schema: `z.string().min(1, "Name is required")` catches empty name
- [x] Client-side: react-hook-form shows inline error via FormMessage
- [x] Server-side: returns 422 with error message
- **Result: PASS**

#### AC-8: User can delete a project with a confirmation dialog
- [x] ProjectCard dropdown menu has "Delete" option that opens DeleteProjectDialog
- [x] DeleteProjectDialog uses shadcn AlertDialog with "Delete Project" title
- [x] Confirmation text says: "Are you sure you want to delete [name]? This will also delete all associated tasks."
- [x] Delete button is destructive variant, Cancel button available
- [x] DELETE /api/projects/[id] scoped to user_id
- **Result: PASS**

#### AC-9: Deleting a project also deletes all associated tasks (cascade delete)
- [x] Database: `projects` table has `user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE`
- [ ] BUG: There is no `tasks` table yet (PROJ-3 is Planned), so cascade delete for tasks cannot be verified. The cascade on projects is for user deletion (auth.users -> projects), NOT for project -> tasks.
- **Result: CANNOT VERIFY (see BUG-2)**

#### AC-10: Empty state is shown when the user has no projects yet
- [x] ProjectList renders empty state when `projects.length === 0`
- [x] Shows "No projects yet" message with descriptive text
- [x] Shows "Create your first project" CTA button
- [x] Empty state uses dashed border, icon, and proper styling
- **Result: PASS**

### Edge Cases Status

#### EC-1: Empty project name produces validation error "Name is required"
- [x] Zod message: `"Name is required"` for min(1)
- [x] Client-side and server-side both enforce this
- **Result: PASS**

#### EC-2: Project name exceeding 100 characters shows validation error
- [x] Zod message: `"Name must be 100 characters or less"` for max(100)
- [x] HTML maxLength prevents typing beyond 100 chars in the browser
- [ ] BUG: The spec says "Validation error with character count" but the error message does not show a live character count. It only shows the static message after submit attempt. The `maxLength` HTML attribute silently stops input, so the user never actually sees the Zod error in normal usage.
- **Result: PARTIAL PASS (see BUG-3)**

#### EC-3: Deleting a project with tasks warns "This will also delete X tasks"
- [ ] BUG: The confirmation dialog uses a static message "This will also delete all associated tasks" but does NOT show the actual task count (X). The spec requires "This will also delete X tasks" with the real number.
- **Result: FAIL (see BUG-4)**

#### EC-4: Empty state with "Create your first project" CTA
- [x] Implemented correctly with icon, text, and button
- **Result: PASS**

#### EC-5: Two projects with the same name are allowed
- [x] No uniqueness constraint in database schema (`name TEXT NOT NULL` without UNIQUE)
- [x] No uniqueness check in API code
- **Result: PASS**

### Cross-Browser Testing Notes
- [x] All components use standard shadcn/ui primitives (Dialog, AlertDialog, Card, DropdownMenu, Form, Input, Textarea, Button, Badge, Skeleton)
- [x] No browser-specific CSS or APIs used
- [x] Tailwind CSS is cross-browser compatible
- **Note:** Manual browser testing not performed (code review only). Components rely on well-tested shadcn/ui library.

### Responsive Testing Notes
- [x] Project grid uses responsive classes: `sm:grid-cols-2 lg:grid-cols-3` (1 col mobile, 2 tablet, 3 desktop)
- [x] Dashboard layout uses responsive padding: `px-4 sm:px-6 lg:px-8`
- [x] Dialog constrained to `sm:max-w-[425px]`
- [x] Profile link text hidden on mobile: `hidden sm:inline`
- **Note:** Layout appears correctly structured for 375px, 768px, 1440px based on code review.

### Security Audit Results

#### Authentication
- [x] All API routes (GET, POST, PATCH, DELETE) check `supabase.auth.getUser()` and return 401 if unauthenticated
- [x] Dashboard page (`/dashboard`) server-side redirects to `/login` if no user
- [x] Project detail page (`/dashboard/projects/[id]`) server-side redirects to `/login` if no user
- [x] Middleware protects `/dashboard` routes and redirects unauthenticated users
- **Result: PASS**

#### Authorization (User A cannot access User B's data)
- [x] RLS policies enforce `auth.uid() = user_id` for SELECT, INSERT, UPDATE, DELETE
- [x] API PATCH endpoint double-checks: `.eq("user_id", user.id)` in addition to RLS
- [x] API DELETE endpoint double-checks: `.eq("user_id", user.id)` in addition to RLS
- [x] Project detail page queries with `.eq("user_id", user.id)`
- [x] INSERT policy uses `WITH CHECK (auth.uid() = user_id)` to prevent user_id spoofing
- **Result: PASS**

#### Input Validation / Injection
- [x] All user input validated server-side with Zod before database operations
- [x] Supabase client uses parameterized queries (no raw SQL injection possible)
- [x] XSS: React auto-escapes all rendered content. Project names and descriptions are rendered as text nodes, not `dangerouslySetInnerHTML`
- [ ] BUG: The `id` parameter in PATCH and DELETE routes is not validated as UUID format. A malformed `id` (e.g., `../other-path` or SQL-like strings) is passed directly to `.eq("id", id)`. While Supabase parameterizes this, a non-UUID string will cause a PostgreSQL type error (UUID column expects UUID format), leading to a 500 error that leaks the Supabase error message to the client.
- **Result: PARTIAL PASS (see BUG-5)**

#### Rate Limiting
- [ ] BUG: No rate limiting on any API endpoint. An attacker could spam POST /api/projects to create thousands of projects, or rapidly call GET to cause load.
- **Result: FAIL (see BUG-6)**

#### Exposed Secrets / Data Leaks
- [x] No secrets in source code; environment variables used for Supabase credentials
- [x] `.env.local` is in `.gitignore`
- [x] `.env.local.example` contains only dummy placeholder values
- [x] `NEXT_PUBLIC_` prefix used only for Supabase URL and anon key (safe to expose)
- [ ] BUG: API error responses return raw Supabase error messages (`error.message`) which may leak internal schema details (table names, column types, constraint names) to the client.
- **Result: PARTIAL PASS (see BUG-7)**

#### Security Headers
- [x] X-Frame-Options: DENY
- [x] X-Content-Type-Options: nosniff
- [x] Referrer-Policy: origin-when-cross-origin
- [x] Strict-Transport-Security with includeSubDomains and preload
- [x] Permissions-Policy restricts camera, microphone, geolocation
- **Result: PASS**

### Regression Testing (PROJ-1: User Authentication)
- [x] Dashboard page still imports and renders correctly (no import errors)
- [x] Auth middleware still protects dashboard routes
- [x] Profile link in dashboard header still present
- [x] Login redirect still works for unauthenticated users
- **Result: PASS (no regressions detected)**

### Bugs Found

#### BUG-1: Task count always shows 0 (data never populated)
- **Severity:** Medium
- **Steps to Reproduce:**
  1. Log in and go to /dashboard
  2. Create a project
  3. Observe the project card shows "0 tasks"
  4. Expected: task count reflects actual tasks (once PROJ-3 is implemented)
  5. Actual: GET /api/projects uses `.select("*")` which does not join or count tasks
- **File:** `e:\VScode\TestProject-1\src\app\api\projects\route.ts` (line 15-18)
- **Priority:** Fix when PROJ-3 (Task Management) is implemented. The API will need to change to something like `.select("*, tasks(count)")` or a computed column.

#### BUG-2: Cascade delete for tasks cannot function (no tasks table exists)
- **Severity:** Low (currently non-impacting)
- **Steps to Reproduce:**
  1. No tasks table exists in migrations
  2. AC-9 requires cascade delete of tasks when a project is deleted
  3. The projects table only has a cascade from auth.users (user deletion cascades to projects), not from projects to tasks
- **File:** `e:\VScode\TestProject-1\supabase\migrations\20260222000001_create_projects_table.sql`
- **Priority:** Fix when PROJ-3 (Task Management) is implemented. The tasks table migration must include `project_id UUID REFERENCES projects(id) ON DELETE CASCADE`.

#### BUG-3: No live character counter on project name input
- **Severity:** Low
- **Steps to Reproduce:**
  1. Open the Create Project dialog
  2. Type a very long project name
  3. Expected: See a character counter (e.g., "95/100") as specified in edge case "Validation error with character count"
  4. Actual: HTML maxLength silently stops input at 100 chars; no visible character count
- **File:** `e:\VScode\TestProject-1\src\components\project-form-dialog.tsx` (line 122-128)
- **Priority:** Nice to have

#### BUG-4: Delete confirmation does not show actual task count
- **Severity:** Medium
- **Steps to Reproduce:**
  1. Create a project
  2. Click the dropdown menu and select "Delete"
  3. Expected: Dialog says "This will also delete X tasks" (with actual count)
  4. Actual: Dialog says "This will also delete all associated tasks" (generic, no count)
- **File:** `e:\VScode\TestProject-1\src\components\delete-project-dialog.tsx` (line 54-57)
- **Priority:** Fix when PROJ-3 is implemented (task count data must be available first)

#### BUG-5: No UUID validation on project ID parameter in API routes
- **Severity:** Medium
- **Steps to Reproduce:**
  1. Send PATCH or DELETE request to `/api/projects/not-a-uuid`
  2. Expected: 400 Bad Request with clear "Invalid project ID" message
  3. Actual: 500 Internal Server Error with raw Supabase error message (e.g., `invalid input syntax for type uuid: "not-a-uuid"`)
- **File:** `e:\VScode\TestProject-1\src\app\api\projects\[id]\route.ts` (lines 8, 54)
- **Priority:** Fix before deployment

#### BUG-6: No rate limiting on project API endpoints
- **Severity:** High
- **Steps to Reproduce:**
  1. Send 1000 rapid POST requests to `/api/projects` with valid auth
  2. Expected: Requests throttled after a reasonable limit
  3. Actual: All requests processed, creating 1000 projects
- **Files:** `e:\VScode\TestProject-1\src\app\api\projects\route.ts`, `e:\VScode\TestProject-1\src\app\api\projects\[id]\route.ts`
- **Note:** The security rules in `.claude/rules/security.md` explicitly require "rate limiting on authentication endpoints." While this is about project endpoints, the principle applies to all mutating endpoints.
- **Priority:** Fix before deployment

#### BUG-7: Raw Supabase error messages exposed to client
- **Severity:** Medium
- **Steps to Reproduce:**
  1. Trigger any database error (e.g., send malformed UUID as project ID)
  2. Expected: Generic error message like "Something went wrong"
  3. Actual: Response contains `error.message` from Supabase, potentially exposing table names, column names, and constraint details
- **Files:** `e:\VScode\TestProject-1\src\app\api\projects\route.ts` (lines 22, 60), `e:\VScode\TestProject-1\src\app\api\projects\[id]\route.ts` (lines 42, 70)
- **Priority:** Fix before deployment

#### BUG-8: Delete API returns no error feedback to user on failure
- **Severity:** Low
- **Steps to Reproduce:**
  1. Trigger a failed DELETE (e.g., network error or server error)
  2. Expected: User sees an error message in the delete dialog
  3. Actual: The `handleDelete` function in DeleteProjectDialog only acts on `res.ok`. If the request fails, loading state is reset but no error message is shown to the user.
- **File:** `e:\VScode\TestProject-1\src\components\delete-project-dialog.tsx` (lines 33-47)
- **Priority:** Fix in next sprint

#### BUG-9: npm run lint is broken
- **Severity:** Low
- **Steps to Reproduce:**
  1. Run `npm run lint`
  2. Expected: ESLint runs successfully
  3. Actual: Error: `Invalid project directory provided, no such directory: E:\VScode\TestProject-1\lint`
- **Note:** This is a project-wide issue, not specific to PROJ-2, but it prevents linting of the new code.
- **Priority:** Fix in next sprint

### Summary
- **Acceptance Criteria:** 8/10 passed (AC-4 partial, AC-9 cannot verify)
- **Edge Cases:** 3/5 passed (EC-2 partial, EC-3 failed)
- **Bugs Found:** 9 total (0 critical, 1 high, 4 medium, 4 low)
- **Security:** Issues found (no rate limiting, error message leakage, missing UUID validation)
- **Production Ready:** NO
- **Recommendation:** Fix BUG-5, BUG-6, and BUG-7 before deployment (security-related). BUG-1, BUG-2, BUG-3, BUG-4 can be deferred until PROJ-3 implementation. BUG-8 and BUG-9 are low priority.

## Deployment
_To be added by /deploy_
