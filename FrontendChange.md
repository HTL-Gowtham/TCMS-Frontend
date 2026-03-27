# Frontend API URL Change Guide

> **Purpose:** This document lists every URL mismatch between what the frontend currently calls (`frontendURL.md`) and what the backend actually exposes.  
> **Action Required:** Update the corresponding API file in the frontend with the corrected URLs below.  
> **Base URL stays the same:** `http://127.0.0.1:8002/api`

---

## ⚠️ Change Summary

| # | File | Method | ❌ Frontend Currently Calls | ✅ Backend Actual URL | Status |
|---|------|--------|----------------------------|-----------------------|--------|
| 1 | `authApi.js` | `POST` | `/login` | `/token/` | 🔴 **MUST FIX** |
| 2 | `authApi.js` | `POST` | `/register` | `/users/signup/` | 🔴 **MUST FIX** |
| 3 | `projectsApi.js` | `GET` | `/allprojects` | `/projects/` | 🔴 **MUST FIX** |
| 4 | `projectsApi.js` | `POST` | `/projectcreate` | `/projects/` | 🔴 **MUST FIX** |
| 5 | `projectsApi.js` | `PUT` | `/project/{id}` | `/projects/{id}/` | 🔴 **MUST FIX** |
| 6 | `projectsApi.js` | `DELETE` | `/project/{id}` | `/projects/{id}/` | 🔴 **MUST FIX** |
| 7 | `testplansApi.js` | `GET` | `/testplan/{planId}` | `/testplans/{planId}/` | 🔴 **MUST FIX** |
| 8 | `testplansApi.js` | `POST` | `/createtestplan` | `/testplans/` | 🔴 **MUST FIX** |
| 9 | `testplansApi.js` | `PUT` | `/testplan/{planId}` | `/testplans/{planId}/` | 🔴 **MUST FIX** |
| 10 | `testplansApi.js` | `DELETE` | `/testplan/{planId}` | `/testplans/{planId}/` | 🔴 **MUST FIX** |
| 11 | `buildsApi.js` | `POST` | `/createbuild` | `/testplans/{planId}/builds/` | 🔴 **MUST FIX** |
| 12 | `buildsApi.js` | `PUT` | `/build/{buildId}` | `/builds/{buildId}/` | 🔴 **MUST FIX** |
| 13 | `buildsApi.js` | `DELETE` | `/build/{buildId}` | `/builds/{buildId}/` | 🔴 **MUST FIX** |
| 14 | `executionApi.js` | `POST` | `/executions/{planId}/{buildId}` | `/testplans/{planId}/builds/{buildId}/execute/` | 🔴 **MUST FIX** |
| 15 | `executionApi.js` | `GET` | `/executions/{executionId}/issue` | `/executions/{executionId}/issue/` *(trailing slash)* | 🟡 **Minor Fix** |

---

## Detailed Changes by File

---

### 1. `authApi.js` — 2 changes

#### Change 1 — Login
```diff
- POST  /login
+ POST  /token/
```
- **Request body field rename:** The backend accepts `identifier` (not `username`) — it accepts username, email, or employee_id.
```diff
- { "username": "...", "password": "..." }
+ { "identifier": "...", "password": "..." }
```
- **Response is the same shape but adds extra fields:**
```json
{
  "access": "...",
  "refresh": "...",
  "user_id": 1,
  "user_name": "John Doe",
  "role": "PM"
}
```
- Store `access` as the Bearer token; store `refresh` for token refresh calls.

---

#### Change 2 — Register / Create User
```diff
- POST  /register
+ POST  /users/signup/
```
- **This endpoint is NOT public.** It requires:
  - `Authorization: Bearer <access_token>` header with a **PM-role** token.
- **Request body:**
```json
{
  "username": "jane_doe",
  "email": "jane@example.com",
  "password": "securePass123",
  "name": "Jane Doe",
  "employee_id": "EMP002",
  "company_name": "ACME",
  "role": "DEV"
}
```
- **Role choices:** `PM`, `MGR`, `TL`, `DEV`, `QA`, `ADMIN`

---

### 2. `projectsApi.js` — 4 changes

All project endpoints are now under a single resource path `/projects/`.

#### Change 3 — List All Projects
```diff
- GET  /allprojects
+ GET  /projects/
```

#### Change 4 — Create Project
```diff
- POST  /projectcreate
+ POST  /projects/
```
> Same request body. **Requires PM or ADMIN role.**

#### Change 5 — Update Project
```diff
- PUT  /project/{id}
+ PUT  /projects/{id}/
```
> Note the plural `projects` and trailing slash.

#### Change 6 — Delete Project
```diff
- DELETE  /project/{id}
+ DELETE  /projects/{id}/
```
> Note the plural `projects` and trailing slash.

---

### 3. `testplansApi.js` — 4 changes

#### Change 7 — Get Single Test Plan
```diff
- GET  /testplan/{planId}
+ GET  /testplans/{planId}/
```

#### Change 8 — Create Test Plan
```diff
- POST  /createtestplan
+ POST  /testplans/
```
> Same request body. **Requires Test Lead (TL) role.**

#### Change 9 — Update Test Plan
```diff
- PUT  /testplan/{planId}
+ PUT  /testplans/{planId}/
```

#### Change 10 — Delete Test Plan
```diff
- DELETE  /testplan/{planId}
+ DELETE  /testplans/{planId}/
```

---

### 4. `buildsApi.js` — 3 changes

#### Change 11 — Create Build
```diff
- POST  /createbuild
+ POST  /testplans/{planId}/builds/
```
> ⚠️ `planId` is now **part of the URL**, not the request body. Make sure the frontend passes `planId` in the URL path.  
> **Requires Test Lead (TL) role.**

#### Change 12 — Update Build
```diff
- PUT  /build/{buildId}
+ PUT  /builds/{buildId}/
```
> Note the plural `builds` and trailing slash.

#### Change 13 — Delete Build
```diff
- DELETE  /build/{buildId}
+ DELETE  /builds/{buildId}/
```
> Note the plural `builds` and trailing slash.

> **No change needed:**
> - `GET /testplans/{planId}/builds/` ✅ already correct
> - `POST /builds/{buildId}/close/` ✅ already correct

---

### 5. `executionApi.js` — 2 changes

#### Change 14 — Save Execution Result
```diff
- POST  /executions/{planId}/{buildId}
+ POST  /testplans/{planId}/builds/{buildId}/execute/
```
> - Content-Type stays `multipart/form-data` ✅
> - The route structure has changed: `planId` and `buildId` are now nested under `/testplans/.../builds/.../execute/`

#### Change 15 — Get Issue by Execution (Minor — trailing slash)
```diff
- GET  /executions/{executionId}/issue
+ GET  /executions/{executionId}/issue/
```
> Django returns a 301 redirect for missing trailing slashes (can cause CORS issues in some setups). Add the trailing slash to avoid it.

> **No change needed:**
> - `GET /reports/executions?plan_id={planId}&build_id={buildId}` ✅ already correct
> - `GET /executions/{executionId}/steps` → should be `/executions/{executionId}/steps/` *(add trailing slash)* 🟡

---

## Endpoints Already Correct ✅

These frontend URLs already match the backend — **no changes needed:**

| File | Method | URL |
|------|--------|-----|
| `suitesApi.js` | `GET` | `/projects/{projectId}/suites/` |
| `suitesApi.js` | `GET` | `/projects/{projectId}/suites-with-testcases/` |
| `suitesApi.js` | `GET` | `/suites/{suiteId}/` |
| `suitesApi.js` | `POST` | `/projects/{projectId}/suites/` |
| `suitesApi.js` | `PUT` | `/suites/{suiteId}/` |
| `suitesApi.js` | `DELETE` | `/suites/{suiteId}/` |
| `testcasesApi.js` | `GET` | `/suites/{suiteId}/testcases/` |
| `testcasesApi.js` | `GET` | `/projects/{projectId}/testcases/` |
| `testcasesApi.js` | `GET` | `/testcases/{testcaseId}/` |
| `testcasesApi.js` | `POST` | `/suites/{suiteId}/testcases/` |
| `testcasesApi.js` | `PUT` | `/testcases/{testcaseId}/` |
| `testcasesApi.js` | `DELETE` | `/testcases/{testcaseId}/` |
| `testplansApi.js` | `GET` | `/projects/{projectId}/testplans/` |
| `testplansApi.js` | `GET` | `/testplans/{planId}/testcases/` |
| `testplansApi.js` | `POST` | `/testplans/{planId}/testcases/` |
| `buildsApi.js` | `GET` | `/testplans/{planId}/builds/` |
| `buildsApi.js` | `POST` | `/builds/{buildId}/close/` |
| `executionApi.js` | `GET` | `/reports/executions?plan_id=...&build_id=...` |
| `reportsApi.js` | `GET` | `/reports/plan-history/{planId}/` |

---

## New Endpoints Available (Not in Frontend Yet)

These backend endpoints exist but are **not listed in `frontendURL.md`** — frontend may want to use them:

| Method | URL | Description | File Suggestion |
|--------|-----|-------------|-----------------|
| `GET` | `/api/users/me/` | Get current logged-in user profile | `authApi.js` |
| `PATCH` | `/api/users/me/` | Update current user profile | `authApi.js` |
| `POST` | `/api/users/logout/` | Logout (blacklist refresh token) | `authApi.js` |
| `POST` | `/api/token/refresh/` | Get new access token using refresh token | `authApi.js` |
| `POST` | `/api/users/auth/microsoft/` | Microsoft OAuth login | `authApi.js` |
| `GET` | `/api/users/` | List all users (PM/MGR only) | `usersApi.js` |
| `POST` | `/api/users/{id}/roles/` | Assign roles to a user | `usersApi.js` |
| `GET/POST/DELETE` | `/api/memberships/` | Manage project members | `projectsApi.js` |
| `GET/POST` | `/api/sprints/` | Sprint management | `sprintsApi.js` |
| `GET/POST` | `/api/userstories/` | User story management | `userStoriesApi.js` |
| `GET/POST` | `/api/tasks/` | Task management | `tasksApi.js` |
| `GET/POST` | `/api/issues/` | Issue management | `issuesApi.js` |
| `GET/POST` | `/api/timelogs/` | Time log management | `timelogApi.js` |
| `GET` | `/api/testplans/` | List all test plans | `testplansApi.js` |
| `GET` | `/api/testplans/{planId}/testcases-for-execution/` | Test cases ready for execution | `testplansApi.js` |
| `GET` | `/api/testplans/{planId}/builds/{buildId}/summary/` | Execution summary for a build | `executionApi.js` |
| `GET` | `/api/utils/next-bug-id/` | Get next bug ID | `executionApi.js` |
| `GET` | `/api/utils/resolve-execution-context/` | Resolve execution context | `executionApi.js` |
| `GET` | `/api/keywords/` | List keywords | `testcasesApi.js` |
| `POST` | `/api/keywords/` | Create keyword | `testcasesApi.js` |
| `GET` | `/api/issues/projects/{projectId}/issues/` | Issues by project | `issuesApi.js` |
| `GET` | `/api/issues/executions/{executionId}/issue/` | Issue linked to execution | `issuesApi.js` |

---

## Token / Auth Header — How to Use

Every protected endpoint needs this header:
```
Authorization: Bearer <access_token>
```

- Get `access_token` from `POST /api/token/` response.
- When `access_token` expires (401), call `POST /api/token/refresh/` with `{ "refresh": "<refresh_token>" }` to get a new one.
- On logout, call `POST /api/users/logout/` with `{ "refresh": "<refresh_token>" }`.
