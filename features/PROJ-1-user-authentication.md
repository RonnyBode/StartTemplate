# PROJ-1: User Authentication

## Status: In Review
**Created:** 2026-02-21
**Last Updated:** 2026-02-21

## Dependencies
- None

## User Stories
- As a new user, I want to register with email and password so that I can create my own account.
- As a returning user, I want to log in with my credentials so that I can access my projects and tasks.
- As a logged-in user, I want to log out so that my account is protected on shared devices.
- As a logged-in user, I want to see my profile (name, email) so that I know which account I'm using.
- As a user who forgot their password, I want to reset it via email so that I can regain access.

## Acceptance Criteria
- [ ] User can register with a valid email and password (min. 8 characters)
- [ ] User receives a validation error for invalid email format
- [ ] User receives a validation error if password is too short
- [ ] User can log in with correct credentials
- [ ] User sees an error message on incorrect credentials
- [ ] User is redirected to the dashboard after successful login
- [ ] User can log out and is redirected to the login page
- [ ] Logged-in user can view their email on a profile/settings page
- [ ] User can request a password reset email
- [ ] Authenticated routes redirect unauthenticated users to login

## Edge Cases
- What happens when a user tries to register with an already-existing email? → Show "Email already in use" error
- What happens when the user submits the form with empty fields? → Show required-field validation errors
- What happens when the password reset email link has expired? → Show "Link expired, request a new one" message
- What happens when the user accesses a protected page while logged out? → Redirect to /login
- What happens when the session expires during a session? → Redirect to /login with a toast notification

## Technical Requirements
- Security: Passwords are never stored in plaintext (Supabase handles this)
- Security: Use Supabase Auth (email/password provider)
- Performance: Login/register form responds within 300ms
- Browser Support: Chrome, Firefox, Safari, Edge

---
<!-- Sections below are added by subsequent skills -->

## Tech Design (Solution Architect)

### Pages & Routes
| Route | Access | Purpose |
|---|---|---|
| `/login` | Public | Login form |
| `/register` | Public | Registration form |
| `/forgot-password` | Public | Request password reset email |
| `/auth/callback` | Public | Supabase auth redirect handler |
| `/dashboard` | Protected | Landing page after login |
| `/profile` | Protected | View email, display name, logout |

### Component Structure
```
/login
└── LoginForm
    ├── Email Input (shadcn Input)
    ├── Password Input (shadcn Input)
    ├── Submit Button (shadcn Button)
    ├── Error Alert (shadcn Alert)
    └── Links → /register | /forgot-password

/register
└── RegisterForm
    ├── Email Input
    ├── Password Input
    ├── Confirm Password Input
    ├── Submit Button
    └── Error Alert ("Email already in use")

/forgot-password
└── ForgotPasswordForm
    ├── Email Input
    ├── Submit Button
    └── Success Alert ("Check your inbox")

/profile
└── ProfileCard (shadcn Card)
    ├── Email display (read-only)
    └── Logout Button (shadcn Button)

Middleware (runs automatically before page load)
└── Checks session on every protected route
    └── No session → redirect to /login
```

### Data Model
**Supabase Auth (auto-managed — no setup required):**
- `id` — Unique user ID
- `email` — Email address
- `password` — Encrypted (never visible)
- `created_at` — Registration timestamp

**`profiles` table (custom — for display name):**
- `id` — References auth user ID
- `display_name` — Optional display name
- `created_at` — Creation timestamp

### Tech Decisions
| Decision | Reason |
|---|---|
| Supabase Auth | Free, secure, handles password hashing, sessions, and password reset emails automatically |
| `@supabase/ssr` | Required for server-side session access in Next.js App Router — prevents flash of unauthenticated content |
| Next.js Middleware | Route protection runs before page load — fast, invisible to user |
| React Hook Form + Zod | Already installed; provides instant client-side validation feedback |
| shadcn/ui | Button, Input, Alert, Card already available — no custom components needed |

### New Dependencies
| Package | Purpose |
|---|---|
| `@supabase/ssr` | Server-side session management for Next.js App Router |

## QA Test Results

**Tested:** 2026-02-21
**App URL:** http://localhost:3000
**Tester:** QA Engineer (AI)
**Method:** Static code analysis + build verification + security audit

### Acceptance Criteria Status

#### AC-1: User can register with a valid email and password (min. 8 characters)
- [x] RegisterForm exists at `/register` with email, password, and confirmPassword fields
- [x] Zod `registerSchema` enforces `min(8)` on password field
- [x] Form submits to `supabase.auth.signUp()` with email and password
- [x] On success with email confirmation required, shows "Check your email" card
- [x] On success with auto-confirm, redirects to `/dashboard` via `window.location.href`
- **Result: PASS**

#### AC-2: User receives a validation error for invalid email format
- [x] Zod `loginSchema` and `registerSchema` both include `.email("Please enter a valid email address")`
- [x] `forgotPasswordSchema` also validates email format
- [x] FormMessage component renders validation errors below the field
- **Result: PASS**

#### AC-3: User receives a validation error if password is too short
- [x] `registerSchema` enforces `.min(8, "Password must be at least 8 characters")`
- [ ] BUG: `loginSchema` only enforces `.min(1, "Password is required")` -- no minimum length check on login (see BUG-1)
- **Result: PASS (registration enforces it; login correctly defers to server)**

#### AC-4: User can log in with correct credentials
- [x] LoginForm calls `supabase.auth.signInWithPassword()` with email and password
- [x] Checks `data.session` before redirecting
- [x] Uses `window.location.href` for redirect (per frontend rules)
- **Result: PASS**

#### AC-5: User sees an error message on incorrect credentials
- [x] `authError.message` is displayed in a destructive Alert component
- [x] Catch block also shows generic error message
- [x] Loading state is properly reset in `finally` block
- **Result: PASS**

#### AC-6: User is redirected to the dashboard after successful login
- [x] `window.location.href = "/dashboard"` is used after verifying `data.session` exists
- **Result: PASS**

#### AC-7: User can log out and is redirected to the login page
- [x] ProfileCard has a logout button calling `supabase.auth.signOut()`
- [x] After signout, redirects to `/login` via `window.location.href`
- [x] Loading state shown during logout
- **Result: PASS**

#### AC-8: Logged-in user can view their email on a profile/settings page
- [x] `/profile` page fetches user via `supabase.auth.getUser()` server-side
- [x] Email is passed to ProfileCard as a prop and displayed as read-only
- [x] Display name is also shown and editable via `/api/profile` PUT endpoint
- **Result: PASS**

#### AC-9: User can request a password reset email
- [x] ForgotPasswordForm at `/forgot-password` calls `supabase.auth.resetPasswordForEmail()`
- [x] Includes `redirectTo` parameter pointing to `/auth/callback?next=/profile`
- [x] Shows success message "Check your inbox!" after successful request
- [x] Button is disabled after success to prevent duplicate requests
- **Result: PASS**

#### AC-10: Authenticated routes redirect unauthenticated users to login
- [x] Middleware at `src/middleware.ts` delegates to `updateSession()` in `src/lib/supabase/middleware.ts`
- [x] Protected routes (`/dashboard`, `/profile`) redirect to `/login` when no user session
- [x] Dashboard page also has server-side `redirect("/login")` guard as a second layer
- [x] Profile page also has server-side `redirect("/login")` guard
- [x] Root `/` redirects to `/dashboard` which then hits the auth check
- **Result: PASS**

### Edge Cases Status

#### EC-1: Register with already-existing email
- [x] RegisterForm checks for "already registered" in error message and shows "This email is already in use. Please sign in instead."
- **Result: PASS**

#### EC-2: Submit form with empty fields
- [x] All schemas have `.min(1, "... is required")` for required fields
- [x] Forms use `noValidate` attribute to disable browser validation, relying on Zod
- [x] `FormMessage` components display validation errors
- **Result: PASS**

#### EC-3: Password reset link expired
- [ ] BUG: No dedicated handling for expired reset links (see BUG-2)
- **Result: FAIL**

#### EC-4: Access protected page while logged out
- [x] Middleware redirects to `/login` when no session detected
- [x] Server components also check and redirect as secondary guard
- **Result: PASS**

#### EC-5: Session expires during active session
- [ ] BUG: No toast notification when session expires (see BUG-3). Middleware refreshes tokens silently, but there is no client-side mechanism to detect session expiry and show a toast.
- **Result: FAIL**

### Cross-Browser Testing (Static Analysis)

- [x] No browser-specific APIs used (only standard DOM, fetch)
- [x] CSS uses Tailwind utility classes (cross-browser compatible)
- [x] No vendor-prefixed CSS used directly
- [ ] Cannot fully verify runtime behavior without manual browser testing
- **Note:** Next.js 16 deprecated "middleware" in favor of "proxy" -- build warning present but non-blocking

### Responsive Testing (Static Analysis)

- [x] Login, Register, Forgot Password pages use `flex min-h-screen items-center justify-center px-4 py-12 sm:px-6 lg:px-8` -- responsive layout
- [x] Cards use `w-full max-w-md` -- constrains width on large screens, fills on mobile
- [x] Dashboard header uses `hidden sm:inline` for profile label (icon-only on mobile)
- [x] Dashboard content uses `max-w-5xl px-4 sm:px-6 lg:px-8` -- responsive padding
- **Result: PASS (structure is responsive; manual verification recommended)**

### Security Audit Results

#### SEC-1: Authentication bypass
- [x] Server-side `getUser()` check on all protected pages (dashboard, profile)
- [x] Middleware intercepts protected routes before page load
- [x] API route `/api/profile` verifies authentication before any data access
- **Result: PASS**

#### SEC-2: Authorization (user data isolation)
- [x] Profile API queries use `.eq("id", user.id)` -- scoped to authenticated user
- [ ] BUG: No RLS policies verified on `profiles` table (see BUG-4). Code relies solely on application-level `.eq("id", user.id)` filtering. If RLS is not enabled on the `profiles` table, any authenticated user with the anon key could potentially query other users' profiles directly via the Supabase client.
- **Result: NEEDS VERIFICATION**

#### SEC-3: Input validation (XSS)
- [x] No `dangerouslySetInnerHTML` usage anywhere in the codebase
- [x] React's JSX auto-escapes rendered content
- [x] Zod validation on all form inputs
- [x] Server-side Zod validation on `/api/profile` PUT endpoint
- [x] Display name is trimmed via `.transform((val) => val.trim())`
- **Result: PASS**

#### SEC-4: Open redirect vulnerability
- [ ] BUG: `/auth/callback` route accepts a `next` query parameter without validation (see BUG-5). An attacker could craft a URL like `/auth/callback?code=X&next=https://evil.com` and the server would redirect to that URL after session exchange.
- **Result: FAIL**

#### SEC-5: Rate limiting
- [ ] BUG: No rate limiting on any authentication endpoints (see BUG-6). Login, register, and forgot-password forms can be submitted unlimited times. Supabase has built-in rate limiting on its auth endpoints, but there is no application-level rate limiting.
- **Result: FAIL**

#### SEC-6: Security headers
- [ ] BUG: No security headers configured (see BUG-7). The `next.config.ts` is empty -- no X-Frame-Options, X-Content-Type-Options, Referrer-Policy, or Strict-Transport-Security headers are set, which are required per `.claude/rules/security.md`.
- **Result: FAIL**

#### SEC-7: Secrets management
- [x] `.env.local` is in `.gitignore` and NOT tracked by git
- [x] `.env.local.example` contains only placeholder values
- [x] Environment variables use `NEXT_PUBLIC_` prefix (Supabase URL and anon key are designed to be public)
- [x] No hardcoded secrets in source code
- **Result: PASS**

#### SEC-8: CSRF protection
- [x] Supabase uses cookie-based sessions with built-in CSRF protection
- [x] API routes use server-side Supabase client which validates session cookies
- **Result: PASS**

### Bugs Found

#### BUG-1: Login form does not enforce minimum password length client-side
- **Severity:** Low
- **Steps to Reproduce:**
  1. Go to `/login`
  2. Enter a valid email and a 1-character password
  3. Expected: Client-side validation error "Password must be at least 8 characters"
  4. Actual: Form submits to Supabase (which will reject it server-side, but UX is suboptimal)
- **Analysis:** The `loginSchema` only checks `.min(1)` (not empty), while `registerSchema` properly enforces `.min(8)`. This is arguably correct behavior since login should not enforce password policy (the user already set their password), but it means a wasted API call. This is a minor UX inconsistency rather than a real bug.
- **Priority:** Nice to have

#### BUG-2: No handling for expired password reset links
- **Severity:** Medium
- **Steps to Reproduce:**
  1. Request a password reset email
  2. Wait for the reset link to expire (Supabase default: 1 hour)
  3. Click the expired link, which hits `/auth/callback`
  4. Expected: Show "Link expired, request a new one" message (per edge case spec)
  5. Actual: Redirects to `/login?error=auth_callback_error` -- no user-friendly message, and the login page does not display the `error` query parameter
- **Analysis:** The `/auth/callback` route redirects to `/login?error=auth_callback_error` on failure, but the LoginForm component does not read or display URL query parameters. The user sees a plain login page with no indication of what went wrong.
- **Priority:** Fix before deployment

#### BUG-3: No toast notification on session expiry
- **Severity:** Medium
- **Steps to Reproduce:**
  1. Log in and navigate to `/dashboard`
  2. Wait for the session to expire (or manually clear cookies)
  3. Attempt to navigate to another protected page
  4. Expected: Redirect to `/login` with a toast notification explaining the session expired
  5. Actual: Silent redirect to `/login` with no explanation
- **Analysis:** The middleware correctly redirects to `/login`, but there is no mechanism to pass a "session expired" message. No toast or query parameter is used to inform the user.
- **Priority:** Fix before deployment

#### BUG-4: RLS policies on profiles table not verified
- **Severity:** High
- **Steps to Reproduce:**
  1. This requires verifying the Supabase database configuration
  2. If RLS is not enabled on the `profiles` table, an authenticated user could use the Supabase JavaScript client directly (via browser console) to query `supabase.from("profiles").select("*")` and see all users' display names
  3. Expected: Each user can only read/write their own profile row
  4. Actual: Unknown -- depends on Supabase configuration
- **Analysis:** The application code correctly filters by `user.id`, but per `.claude/rules/backend.md`, RLS must be enabled on every table as a defense-in-depth measure. There is no SQL migration file or RLS policy definition in the codebase, so it is unclear whether RLS is configured.
- **Priority:** Fix before deployment (verify and document RLS policies)

#### BUG-5: Open redirect vulnerability in /auth/callback
- **Severity:** Critical
- **Steps to Reproduce:**
  1. Craft a URL: `/auth/callback?code=VALID_CODE&next=https://evil-site.com/phishing`
  2. If a user clicks this link (e.g., via a phishing email), after successful auth exchange the server redirects to `https://evil-site.com/phishing`
  3. Expected: The `next` parameter should only allow relative paths on the same origin
  4. Actual: `NextResponse.redirect(\`${origin}${next}\`)` -- while `origin` is prepended, a `next` value like `//evil.com` would result in `https://yourdomain.com//evil.com` which browsers interpret as `https://evil.com` (protocol-relative URL bypass)
- **Analysis:** The `next` parameter from `searchParams` is not validated. It should be restricted to paths starting with `/` and not starting with `//`. Additionally, values like `/\evil.com` could be exploited on some platforms.
- **Code location:** `src/app/auth/callback/route.ts` line 7-13
- **Priority:** Fix before deployment

#### BUG-6: No application-level rate limiting on auth endpoints
- **Severity:** Medium
- **Steps to Reproduce:**
  1. Open the login page
  2. Submit the login form rapidly (e.g., 100 times in quick succession using browser dev tools or a script)
  3. Expected: After N failed attempts, the user is temporarily blocked or shown a CAPTCHA
  4. Actual: All requests are forwarded to Supabase without any throttling
- **Analysis:** While Supabase has its own rate limiting (typically 30 requests/minute for auth), the application does not implement any client-side or server-side rate limiting. This is required per `.claude/rules/security.md`. An attacker could brute-force passwords up to Supabase's limits.
- **Priority:** Fix before deployment

#### BUG-7: Missing security headers
- **Severity:** High
- **Steps to Reproduce:**
  1. Run the app and check HTTP response headers in browser dev tools
  2. Expected: X-Frame-Options: DENY, X-Content-Type-Options: nosniff, Referrer-Policy: origin-when-cross-origin, Strict-Transport-Security with includeSubDomains
  3. Actual: `next.config.ts` is empty -- no custom headers configured
- **Analysis:** The security rules (`.claude/rules/security.md`) explicitly require these headers. They should be added to `next.config.ts` under the `headers()` configuration.
- **Code location:** `next.config.ts` (empty config)
- **Priority:** Fix before deployment

#### BUG-8: Login page does not display auth callback errors from URL
- **Severity:** Medium
- **Steps to Reproduce:**
  1. Navigate to `/login?error=auth_callback_error`
  2. Expected: An error message is displayed (e.g., "Authentication failed. Please try again.")
  3. Actual: The login form renders with no error message -- the `error` query parameter is ignored
- **Analysis:** The `/auth/callback` route redirects to `/login?error=auth_callback_error` on failure, but the LoginForm does not read URL search params. This makes the error redirect pointless.
- **Code location:** `src/components/login-form.tsx` (no searchParams handling)
- **Priority:** Fix before deployment

#### BUG-9: Next.js middleware deprecation warning
- **Severity:** Low
- **Steps to Reproduce:**
  1. Run `npm run build`
  2. Observe warning: `The "middleware" file convention is deprecated. Please use "proxy" instead.`
- **Analysis:** Next.js 16 has deprecated the `middleware.ts` convention in favor of "proxy". While the middleware still works, it should be migrated to avoid future breakage.
- **Priority:** Fix in next sprint

#### BUG-10: .env.local.example was deleted from git staging
- **Severity:** Low
- **Steps to Reproduce:**
  1. Run `git status` and observe `.env.local.example` shows as deleted (D)
  2. Expected: `.env.local.example` should be tracked in git with dummy values (per security rules)
  3. Actual: The file has been modified (content changed) and git shows it as modified, not deleted. The new content is simpler but still valid.
- **Analysis:** Looking at `git diff`, the file was modified (not deleted) -- the content changed from a verbose example with comments to a simpler version. This is acceptable. However, `git status` shows `D .env.local.example` which suggests it may have been staged for deletion. This needs verification.
- **Priority:** Nice to have (verify staging state)

### Summary
- **Acceptance Criteria:** 10/10 passed (code analysis)
- **Edge Cases:** 3/5 passed, 2 failed (EC-3: expired reset link, EC-5: session expiry toast)
- **Bugs Found:** 10 total (1 critical, 2 high, 4 medium, 3 low)
- **Security:** Issues found (open redirect, missing headers, unverified RLS, no rate limiting)
- **Production Ready:** NO
- **Recommendation:** Fix BUG-5 (critical open redirect), BUG-4 and BUG-7 (high), and BUG-2/BUG-3/BUG-6/BUG-8 (medium) before deployment. Then run `/qa` again to verify fixes.

## Deployment
_To be added by /deploy_
