# ALTCM Frontend — Design Document

> **Version:** 1.0  
> **Date:** March 21, 2026  
> **Stack:** React 18 · Vite 6 · React Router v6 · Axios · JWT

---

## 1. Project Overview

**ALTCM** (Agile Lifecycle & Test Case Management) is a web-based QA management platform. It provides end-to-end test management across the following workflow:

```
Project Setup → Test Design → Test Plan Management → Test Execution → Reporting
```

| Property | Value |
|----------|-------|
| Framework | React 18 + Vite 6.4.1 |
| Router | React Router v6 |
| HTTP Client | Axios (shared instance with interceptors) |
| Backend | Django REST Framework — `http://127.0.0.1:8002/api` |
| Auth | JWT Bearer tokens (access + refresh) |
| Dev Port | `5175` (New project) · `5178` (parent workspace) |
| Notifications | `react-hot-toast` (replaces all `alert()` calls) |

---

## 2. Folder Architecture

```
New/src/
├── api/                    # All HTTP calls (Axios-based, one file per domain)
│   ├── axiosInstance.js    # Shared Axios instance + auth/401 interceptors
│   ├── authApi.js          # Login, Register
│   ├── projectsApi.js      # Projects CRUD + normalise()
│   ├── suitesApi.js        # Test Suites CRUD
│   ├── testcasesApi.js     # Test Cases CRUD
│   ├── testplansApi.js     # Test Plans CRUD + assignment
│   ├── buildsApi.js        # Builds CRUD + close
│   ├── executionApi.js     # Execution save / fetch
│   └── reportsApi.js       # Plan history reports
│
├── context/
│   ├── AuthContext.jsx     # User session state (login / logout)
│   └── ProjectContext.jsx  # Active project + full project list
│
├── routes/
│   └── AppRoutes.jsx       # Centralised route definitions
│
├── components/
│   ├── layout/             # AppLayout, Header, Navigator, ProtectedRoute
│   ├── sidebar/            # TestDesignSidebar
│   └── ui/                 # Reusable UI atoms (buttons, modals, etc.)
│
├── pages/
│   ├── auth/               # LoginPage, RegisterPage
│   ├── dashboard/          # MainDashboard
│   ├── projects/           # ProjectListPage, ProjectCreatePage
│   ├── suites/             # TestDesignPage, CreateSuite, CreateTestCase
│   ├── testplans/          # TestPlanManagementPage, AssignTestCasesPage, PlanTestCasesPage
│   ├── execution/          # ExecutionPage
│   └── reports/            # PlanHistoryReport, RTMReport
│
├── hooks/                  # Custom React hooks
├── utils/                  # excelExport, helpers
└── styles/
    ├── variables.css       # Design tokens (colors, spacing, typography)
    └── layout.css          # Global layout grid
```

---

## 3. Authentication Flow

```
User fills email + password
        ↓
POST /api/token/  →  { email, password }
        ↓
Response: { access, refresh, user_id, user_name, role }
        ↓
localStorage stores:
  • access_token
  • refresh_token
  • user  (JSON: { username, user_id, role })
        ↓
AuthContext.login(userData)  →  user state set globally
        ↓
axiosInstance request interceptor
  →  Authorization: Bearer <access_token>  on EVERY request
        ↓
On 401 response:
  →  localStorage.clear()  →  redirect /login
```

**Key files involved:**
- `src/api/authApi.js` — API calls
- `src/api/axiosInstance.js` — interceptors
- `src/context/AuthContext.jsx` — state + helpers
- `src/pages/auth/LoginPage.jsx` — UI + token storage

---

## 4. State Management

### Global Contexts

| Context | Exported Hook | State Held | Consumers |
|---------|--------------|------------|-----------|
| `AuthContext` | `useAuth()` | `user` (null or `{username, user_id, role}`), `login()`, `logout()` | All protected pages, Navigator, Header |
| `ProjectContext` | `useProject()` | `activeProject`, `projects[]`, `setActiveProject()`, `refreshProjects()` | Dashboard, Navigator, all feature pages |

### Behaviour Rules
- Both contexts **hydrate from `localStorage`** on page refresh — session survives a reload.
- `ProjectContext` only calls `GET /projects/` when `user` is truthy — prevents an unauthorized request on the login page.
- `setActiveProject(project)` persists the selection to `localStorage` so it survives navigation.
- On `logout()`, `localStorage.clear()` removes all tokens and user data.

---

## 5. Routing Structure

All protected routes are wrapped in `<ProtectedRoute>` → `<AppLayout>` (Header + Navigator + `<Outlet>`).

| Path | Page Component | Access |
|------|---------------|--------|
| `/` | → redirect `/login` | Public |
| `/login` | `LoginPage` | Public |
| `/register` | `RegisterPage` | Public |
| `/dashboard` | `MainDashboard` | ✅ Protected |
| `/projectlist` | `ProjectListPage` | ✅ Protected |
| `/projectcreate` | `ProjectCreatePage` | ✅ Protected |
| `/testdesign/:projectId?/:suiteId?/:testcaseId?` | `TestDesignPage` | ✅ Protected |
| `/testplanmanagement/:projectId` | `TestPlanManagementPage` | ✅ Protected |
| `/assigntestcases/:planId` | `AssignTestCasesPage` | ✅ Protected |
| `/plantestcases/:planId` | `PlanTestCasesPage` | ✅ Protected |
| `/execution/*` | `ExecutionPage` | ✅ Protected |
| `/reports/history/:projectId` | `PlanHistoryReport` | ✅ Protected |
| `/reports/rtm/:projectId` | `RTMReport` | ✅ Protected |

> **Note on `/execution/*`:** The route uses a wildcard because the URL carries deep segments (`/execution/:projectId/:planId/:buildId/:testcaseId`). `useParams()` cannot extract these from a wildcard route, so the page uses `useLocation()` and manually splits `pathname`.

---

## 6. UI Layout

```
┌─────────────────────────────────────────────────────┐
│              Header                                  │
│   [Logo] [Active Project]        [Role] [Logout]     │
├─────────────┬───────────────────────────────────────┤
│             │                                        │
│  Navigator  │         Page Content  (<Outlet>)       │
│  (left nav) │                                        │
│             │                                        │
│  • Dashboard│                                        │
│  • Projects │                                        │
│  • Design   │                                        │
│  • Plans    │                                        │
│  • Execute  │                                        │
│  • Reports  │                                        │
│             │                                        │
└─────────────┴───────────────────────────────────────┘
```

- **Header** — Brand logo, currently active project name, user role badge, logout button.
- **Navigator** — Left sidebar navigation links. Search bar is shown only on the test plan page.
- **AppLayout** — Flex-row container rendering `<Navigator>` + `<Outlet>`. Defined in `layout.css`.

---

## 7. Feature Module Data Flows

### 7.1 Projects

```
On login:
  ProjectContext → GET /projects/
                → { count, results: [...] }  (paginated)
                → normalise(): p.name → p.project_name
                → projects[] stored in context

ProjectListPage:
  Displays table — Name | Slug | Status | Visibility | Actions (Delete)

MainDashboard:
  Lists active projects → click → setActiveProject(project)
                                → navigate /testdesign/:projectId
```

### 7.2 Test Design (Suites & Test Cases)

```
TestDesignPage
  ├── TestDesignSidebar (left panel)
  │     ├── Project dropdown (from ProjectContext)
  │     └── Tree view: Suites → Test Cases
  │           GET /projects/:id/suites-with-testcases/
  │
  ├── viewMode = "createSuite"
  │     └── CreateSuite form
  │           POST /projects/:id/suites/
  │           → onSuccess(newSuite)
  │           → navigate /testdesign/:projectId/:newSuite.id
  │
  ├── viewMode = "viewSuite"
  │     └── CreateTestCase form
  │           POST /suites/:id/testcases/
  │           → refreshData()
  │
  └── viewMode = "viewTestcase"
        └── Test case detail view (read/edit)
```

### 7.3 Test Plan Management

```
TestPlanManagementPage
  ├── GET  /projects/:id/testplans/        → plan list
  ├── POST /testplans/                     → create plan
  ├── POST /testplans/:planId/builds/      → create build
  │         body: { ...payload, testplan_id: planId }
  │         (backend requires planId in BOTH URL and body)
  └── POST /builds/:id/close/             → close/finalize build

AssignTestCasesPage
  └── POST /testplans/:planId/testcases/  → assign test cases to plan

PlanTestCasesPage
  └── GET  /testplans/:planId/testcases/  → view assigned test cases
```

### 7.4 Execution

```
ExecutionPage
  ├── GET  /projects/:id/testplans/                     → plan dropdown
  ├── GET  /testplans/:planId/builds/                   → build dropdown (active only)
  ├── GET  /testplans/:planId/testcases/                → test case list
  ├── GET  /reports/executions?plan_id=&build_id=       → saved results (merged with TCs)
  │
  ├── On test case select:
  │     GET /testcases/:id/                             → step definitions
  │     GET /executions/:id/steps/                      → saved step results
  │     GET /executions/:id/issue/  (if status=Fail)   → saved issue data
  │
  ├── POST /testplans/:planId/builds/:buildId/execute/  → save result (multipart/form-data)
  │         Payload includes: testcase_id, status, notes, steps (JSON), attachment
  │         If status=Fail: also includes issue fields (title, description, type, severity, priority)
  │
  └── POST /builds/:buildId/close/                      → finalize build (irreversible)
```

### 7.5 Reports

```
PlanHistoryReport  →  GET /reports/plan-history/:planId/
RTMReport          →  GET /projects/:id/testcases/  +  plan/build assignment data
```

---

## 8. API Layer Reference

| File | Domain | Base Path | Key Functions |
|------|--------|-----------|---------------|
| `axiosInstance.js` | HTTP client | `http://127.0.0.1:8002/api` | Request interceptor (Bearer token), Response interceptor (401 → logout) |
| `authApi.js` | Auth | `/token/`, `/users/signup/` | `loginUser`, `registerUser` |
| `projectsApi.js` | Projects | `/projects/` | `getAllProjects`, `createProject`, `updateProject`, `deleteProject` + `normalise()` |
| `suitesApi.js` | Suites | `/projects/:id/suites/` | `getSuites`, `getSuitesWithTestCases`, `getSuite`, `createSuite`, `updateSuite`, `deleteSuite` |
| `testcasesApi.js` | Test Cases | `/suites/:id/testcases/` | `getTestCases`, `getAllProjectTestCases`, `getTestCase`, `createTestCase`, `updateTestCase`, `deleteTestCase` |
| `testplansApi.js` | Test Plans | `/testplans/` | `getTestPlansByProject`, `getTestPlan`, `createTestPlan`, `updateTestPlan`, `deleteTestPlan`, `getTestCasesForPlan`, `assignTestCases` |
| `buildsApi.js` | Builds | `/testplans/:id/builds/` | `getBuildsByPlan`, `createBuild`, `updateBuild`, `deleteBuild`, `closeBuild` |
| `executionApi.js` | Execution | `/testplans/:p/builds/:b/execute/` | `saveExecution`, `getExecutionResults`, `getExecutionSteps`, `getExecutionIssue` |
| `reportsApi.js` | Reports | `/reports/` | `getPlanHistoryReport` |

### Axios Interceptors (`axiosInstance.js`)

**Request interceptor** — Attaches Bearer token to every outgoing request:
```js
config.headers.Authorization = `Bearer ${localStorage.getItem("access_token")}`;
```

**Response interceptor** — Handles session expiry:
```js
// On 401: clear localStorage → redirect to /login
```

---

## 9. Color Theme

### New Project (port 5175) — `styles/variables.css`

| Token | Value | Usage |
|-------|-------|-------|
| Body background | `#f0f2f5` | App shell |
| Body text | `#1a2a3a` | Default text |
| Primary blue | `#0066cc` | Buttons, active states, links |
| Sidebar background | `#1a2a3a` | TestDesignSidebar |
| Sidebar panel bg | `#243447` | Dropdown, hover states |
| Sidebar text | `#94a3b8` | Tree item default |
| Sidebar active item | `#0066cc` bg + `#ffffff` text | Active suite |
| Header brand text | `#1a3c5e` | `.brand-text` |
| Dashboard heading | `#1a3c5e` | `.popup-header h2` |

---

## 10. Key Design Decisions

| Decision | Rationale |
|----------|-----------|
| Single shared `axiosInstance` | One place to attach auth headers and handle 401 — no per-call token logic needed |
| `ProjectContext` gated behind `user` check | Prevents an unauthorized `GET /projects/` call when the login page mounts |
| `normalise()` in `projectsApi.js` | Backend returns field `name`; the entire frontend uses `project_name` — mapping happens once at the API boundary |
| `createBuild` sends `testplan_id` in both URL path and request body | Django backend validation requires the field in both places |
| Execution URL parsed via `useLocation()` | Route is declared as `execution/*` wildcard — `useParams()` cannot extract deep path segments from it |
| `onSuccess(newSuite)` from `CreateSuite` | The parent page needs the new suite's `id` immediately to navigate to it without a second API call |
| `react-hot-toast` for notifications | Replaces all `window.alert()` calls with non-blocking, styled toasts |
| `strictPort: true` in `vite.config.js` | Ensures the dev server always starts on port 5175 and fails fast if blocked |

---

## 11. Environment Configuration

### `.env`
```
VITE_API_BASE_URL=http://127.0.0.1:8002/api
```

### `vite.config.js`
```js
server: {
  port: 5175,
  strictPort: true
}
```

---

## 12. Backend API — Quick Reference

> Full documentation: see `API_DOCUMENTATION.md`  
> Base URL: `http://127.0.0.1:8002/api`  
> All protected endpoints require: `Authorization: Bearer <access_token>`

### Endpoint Summary

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/token/` | Login — returns access + refresh tokens |
| `POST` | `/token/refresh/` | Refresh expired access token |
| `POST` | `/users/signup/` | Register new user (PM role required) |
| `GET/POST` | `/projects/` | List / create projects |
| `GET/PUT/DELETE` | `/projects/:id/` | Get / update / delete project |
| `GET/POST` | `/projects/:id/suites/` | List / create suites |
| `GET` | `/projects/:id/suites-with-testcases/` | Full tree for sidebar |
| `GET/PUT/DELETE` | `/suites/:id/` | Get / update / delete suite |
| `GET/POST` | `/suites/:id/testcases/` | List / create test cases |
| `GET/PUT/DELETE` | `/testcases/:id/` | Get / update / delete test case |
| `GET/POST` | `/projects/:id/testplans/` | List / create test plans |
| `GET/PUT/DELETE` | `/testplans/:id/` | Get / update / delete test plan |
| `GET/POST` | `/testplans/:id/testcases/` | List / assign test cases to plan |
| `GET/POST` | `/testplans/:id/builds/` | List / create builds |
| `PUT/DELETE` | `/builds/:id/` | Update / delete build |
| `POST` | `/builds/:id/close/` | Finalize (close) a build |
| `POST` | `/testplans/:p/builds/:b/execute/` | Save execution result |
| `GET` | `/executions/:id/steps/` | Get saved step results |
| `GET` | `/executions/:id/issue/` | Get issue linked to execution |
| `GET` | `/reports/executions/` | Execution results (plan + build filter) |
| `GET` | `/reports/plan-history/:id/` | Plan history report |
