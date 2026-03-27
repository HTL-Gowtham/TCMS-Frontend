# ALTCM API Documentation

> **Base URL:** `http://127.0.0.1:8002`  
> **Auth:** JWT Bearer Token (except where noted as Public)  
> **Content-Type:** `application/json`

---

## ⚠️ Common 404 Mistakes

| ❌ Wrong URL | ✅ Correct URL |
|---|---|
| `POST /api/register` | `POST /api/users/signup/` |
| `POST /api/login` | `POST /api/token/` |
| `GET /api/user/me` | `GET /api/users/me/` |

> **There is no `/api/register` endpoint.**  
> Registration/user creation is at **`POST /api/users/signup/`** and requires a **PM** role JWT token.

---

## 1. Authentication

### 1.1 Login (Obtain Token)
| | |
|---|---|
| **URL** | `POST /api/token/` |
| **Auth** | Public |

**Request Body:**
```json
{
  "identifier": "john_doe",
  "password": "yourpassword"
}
```
> `identifier` accepts **username**, **email**, or **employee_id**.

**Response `200 OK`:**
```json
{
  "access": "<JWT access token>",
  "refresh": "<JWT refresh token>",
  "user_id": 1,
  "user_name": "John Doe",
  "role": "PM"
}
```

---

### 1.2 Refresh Token
| | |
|---|---|
| **URL** | `POST /api/token/refresh/` |
| **Auth** | Public |

**Request Body:**
```json
{
  "refresh": "<JWT refresh token>"
}
```

**Response `200 OK`:**
```json
{
  "access": "<new JWT access token>"
}
```

---

### 1.3 Microsoft OAuth Login
| | |
|---|---|
| **URL** | `POST /api/users/auth/microsoft/` |
| **Auth** | Public |

**Request Body:**
```json
{
  "access_token": "<Microsoft Graph access token>"
}
```

**Response `200 OK`:**
```json
{
  "access": "<JWT access token>",
  "refresh": "<JWT refresh token>",
  "user_id": 5,
  "user_name": "Jane Smith",
  "role": "DEV"
}
```

---

### 1.4 Logout
| | |
|---|---|
| **URL** | `POST /api/users/logout/` |
| **Auth** | 🔒 Required |

**Request Body:**
```json
{
  "refresh": "<JWT refresh token>"
}
```

**Response `200 OK`:**
```json
{
  "message": "Logged out successfully"
}
```

---

## 2. Users

> **Header for all protected endpoints:**  
> `Authorization: Bearer <access_token>`

### 2.1 Get My Profile
| | |
|---|---|
| **URL** | `GET /api/users/me/` |
| **Auth** | 🔒 Required |
| **Roles** | Any |

**Response `200 OK`:**
```json
{
  "id": 1,
  "username": "john_doe",
  "email": "john@example.com",
  "employee_id": "EMP001",
  "company_name": "ACME",
  "name": "John Doe",
  "role": "PM",
  "is_admin": false,
  "is_active": true,
  "is_staff": false,
  "is_superuser": false,
  "created_at": "2026-01-01T00:00:00Z",
  "updated_at": "2026-03-21T00:00:00Z"
}
```

---

### 2.2 Update My Profile
| | |
|---|---|
| **URL** | `PATCH /api/users/me/` |
| **Auth** | 🔒 Required |
| **Roles** | Any |

**Request Body (all fields optional):**
```json
{
  "name": "John Updated",
  "email": "new@example.com"
}
```

---

### 2.3 Create a New User *(formerly "register")*
| | |
|---|---|
| **URL** | `POST /api/users/signup/` |
| **Auth** | 🔒 Required |
| **Roles** | PM only |

**Request Body:**
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

> **`role` choices:** `PM`, `MGR`, `TL`, `DEV`, `QA`, `ADMIN`

**Response `201 Created`:**
```json
{
  "id": 2,
  "username": "jane_doe",
  "email": "jane@example.com",
  "employee_id": "EMP002",
  "company_name": "ACME",
  "name": "Jane Doe",
  "role": "DEV",
  "is_admin": false,
  "is_active": true,
  "created_at": "2026-03-21T00:00:00Z",
  "updated_at": "2026-03-21T00:00:00Z"
}
```

---

### 2.4 List All Users
| | |
|---|---|
| **URL** | `GET /api/users/` |
| **Auth** | 🔒 Required |
| **Roles** | PM or Manager |

**Response `200 OK`:**
```json
[
  {
    "id": 1,
    "username": "john_doe",
    "email": "john@example.com",
    "employee_id": "EMP001",
    "name": "John Doe",
    "role": "PM",
    "roles": ["TL", "QA"]
  }
]
```

---

### 2.5 Assign Roles to a User
| | |
|---|---|
| **URL** | `POST /api/users/{user_id}/roles/` |
| **Auth** | 🔒 Required |
| **Roles** | PM or Manager |

**Request Body:**
```json
{
  "roles": ["TL", "QA"]
}
```

**Response `200 OK`:**
```json
{
  "user_id": 2,
  "roles": ["TL", "QA"]
}
```

---

## 3. Projects

### 3.1 List Projects
| | |
|---|---|
| **URL** | `GET /api/projects/` |
| **Auth** | 🔒 Required |
| **Roles** | Any (members see their own; ADMIN sees all) |

### 3.2 Create Project
| | |
|---|---|
| **URL** | `POST /api/projects/` |
| **Auth** | 🔒 Required |
| **Roles** | PM or ADMIN |

**Request Body:**
```json
{
  "name": "My Project",
  "description": "Project description"
}
```

### 3.3 Get Project Detail
| | |
|---|---|
| **URL** | `GET /api/projects/{id}/` |
| **Auth** | 🔒 Required |

### 3.4 Update Project
| | |
|---|---|
| **URL** | `PUT /api/projects/{id}/` |
| **Auth** | 🔒 Required |
| **Roles** | PM or ADMIN |

### 3.5 Partial Update Project
| | |
|---|---|
| **URL** | `PATCH /api/projects/{id}/` |
| **Auth** | 🔒 Required |
| **Roles** | PM or ADMIN |

### 3.6 Delete Project
| | |
|---|---|
| **URL** | `DELETE /api/projects/{id}/` |
| **Auth** | 🔒 Required |
| **Roles** | PM or ADMIN |

---

## 4. Project Memberships

### 4.1 List Members
| | |
|---|---|
| **URL** | `GET /api/memberships/?project={id}` |
| **Auth** | 🔒 Required |

### 4.2 Add Member
| | |
|---|---|
| **URL** | `POST /api/memberships/` |
| **Auth** | 🔒 Required |
| **Roles** | PM or ADMIN |

**Request Body:**
```json
{
  "project": 1,
  "user": 3
}
```

### 4.3 Remove Member
| | |
|---|---|
| **URL** | `DELETE /api/memberships/{id}/` |
| **Auth** | 🔒 Required |
| **Roles** | PM or ADMIN |

---

## 5. Sprints

| Method | URL | Description |
|---|---|---|
| `GET` | `/api/sprints/` | List sprints |
| `POST` | `/api/sprints/` | Create sprint |
| `GET` | `/api/sprints/{id}/` | Get sprint |
| `PUT` | `/api/sprints/{id}/` | Update sprint |
| `PATCH` | `/api/sprints/{id}/` | Partial update |
| `DELETE` | `/api/sprints/{id}/` | Delete sprint |

> All require 🔒 authentication.

---

## 6. User Stories

| Method | URL | Description |
|---|---|---|
| `GET` | `/api/userstories/` | List user stories |
| `POST` | `/api/userstories/` | Create user story |
| `GET` | `/api/userstories/{id}/` | Get user story |
| `PUT` | `/api/userstories/{id}/` | Update user story |
| `PATCH` | `/api/userstories/{id}/` | Partial update |
| `DELETE` | `/api/userstories/{id}/` | Delete user story |

---

## 7. Tasks

| Method | URL | Description |
|---|---|---|
| `GET` | `/api/tasks/` | List tasks |
| `POST` | `/api/tasks/` | Create task |
| `GET` | `/api/tasks/{id}/` | Get task |
| `PUT` | `/api/tasks/{id}/` | Update task |
| `PATCH` | `/api/tasks/{id}/` | Partial update |
| `DELETE` | `/api/tasks/{id}/` | Delete task |

---

## 8. Issues

| Method | URL | Description |
|---|---|---|
| `GET` | `/api/issues/` | List all issues |
| `POST` | `/api/issues/` | Create issue |
| `GET` | `/api/issues/{id}/` | Get issue |
| `PUT` | `/api/issues/{id}/` | Update issue |
| `PATCH` | `/api/issues/{id}/` | Partial update |
| `DELETE` | `/api/issues/{id}/` | Delete issue |
| `GET` | `/api/issues/projects/{project_id}/issues/` | Issues by project |
| `GET` | `/api/issues/executions/{execution_id}/issue/` | Issue by execution |

---

## 9. Time Logs

| Method | URL | Description |
|---|---|---|
| `GET` | `/api/timelogs/` | List time logs |
| `POST` | `/api/timelogs/` | Create time log |
| `GET` | `/api/timelogs/{id}/` | Get time log |
| `PUT` | `/api/timelogs/{id}/` | Update time log |
| `PATCH` | `/api/timelogs/{id}/` | Partial update |
| `DELETE` | `/api/timelogs/{id}/` | Delete time log |

---

## 10. Test Cases (TCM)

| Method | URL | Description |
|---|---|---|
| `GET` | `/api/projects/{project_id}/suites/` | List suites for a project |
| `GET` | `/api/suites/{suite_id}/` | Get suite detail |
| `DELETE` | `/api/suites/{suite_id}/` | Delete suite |
| `GET` | `/api/projects/{project_id}/suites-with-testcases/` | Suites with test cases |
| `GET` | `/api/suites/{suite_id}/testcases/` | List test cases in suite |
| `POST` | `/api/suites/{suite_id}/testcases/` | Create test case in suite |
| `GET` | `/api/testcases/{testcase_id}/` | Get test case detail |
| `PUT` | `/api/testcases/{testcase_id}/` | Update test case |
| `DELETE` | `/api/testcases/{testcase_id}/` | Delete test case |
| `GET` | `/api/projects/{project_id}/testcases/` | All test cases in project |
| `GET` | `/api/keywords/` | List keywords |
| `POST` | `/api/keywords/` | Create keyword |

---

## 11. Test Plans & Builds (TCM)

| Method | URL | Description |
|---|---|---|
| `GET` | `/api/projects/{project_id}/testplans/` | List plans for a project |
| `GET` | `/api/testplans/` | List all test plans |
| `POST` | `/api/testplans/` | Create test plan |
| `GET` | `/api/testplans/{plan_id}/` | Get test plan detail |
| `PUT` | `/api/testplans/{plan_id}/` | Update test plan |
| `DELETE` | `/api/testplans/{plan_id}/` | Delete test plan |
| `GET` | `/api/testplans/{plan_id}/testcases/` | Test cases in plan |
| `POST` | `/api/testplans/{plan_id}/testcases/` | Add test case to plan |
| `GET` | `/api/testplans/{plan_id}/testcases-for-execution/` | Test cases ready for execution |
| `GET` | `/api/testplans/{plan_id}/builds/` | List builds for a plan |
| `POST` | `/api/testplans/{plan_id}/builds/` | Create build |
| `GET` | `/api/builds/{build_id}/` | Get build detail |
| `PUT` | `/api/builds/{build_id}/` | Update build |
| `DELETE` | `/api/builds/{build_id}/` | Delete build |
| `POST` | `/api/builds/{build_id}/close/` | Close a build |

---

## 12. Executions & Reports (TCM)

| Method | URL | Description |
|---|---|---|
| `POST` | `/api/testplans/{plan_id}/builds/{build_id}/execute/` | Save execution results |
| `GET` | `/api/executions/{execution_id}/steps/` | Get steps for an execution |
| `GET` | `/api/testplans/{plan_id}/builds/{build_id}/summary/` | Execution summary |
| `GET` | `/api/reports/executions/` | Execution report |
| `GET` | `/api/reports/plan-history/{plan_id}/` | Plan history report |
| `GET` | `/api/utils/next-bug-id/` | Get next bug ID |
| `POST` | `/api/utils/resolve-execution-context/` | Resolve execution context |

---

## Quick Reference — All Endpoints

| Method | Endpoint | Auth | Role |
|---|---|---|---|
| `POST` | `/api/token/` | Public | — |
| `POST` | `/api/token/refresh/` | Public | — |
| `POST` | `/api/users/auth/microsoft/` | Public | — |
| `POST` | `/api/users/signup/` | 🔒 | PM |
| `GET` | `/api/users/me/` | 🔒 | Any |
| `PATCH` | `/api/users/me/` | 🔒 | Any |
| `GET` | `/api/users/` | 🔒 | PM/MGR |
| `POST` | `/api/users/{id}/roles/` | 🔒 | PM/MGR |
| `POST` | `/api/users/logout/` | 🔒 | Any |
| `GET/POST` | `/api/projects/` | 🔒 | Any/PM |
| `GET/PUT/PATCH/DELETE` | `/api/projects/{id}/` | 🔒 | Any/PM |
| `GET/POST` | `/api/memberships/` | 🔒 | Any/PM |
| `DELETE` | `/api/memberships/{id}/` | 🔒 | PM |
| `GET/POST` | `/api/sprints/` | 🔒 | Any |
| `GET/POST` | `/api/userstories/` | 🔒 | Any |
| `GET/POST` | `/api/tasks/` | 🔒 | Any |
| `GET/POST` | `/api/issues/` | 🔒 | Any |
| `GET/POST` | `/api/timelogs/` | 🔒 | Any |

---

## Error Responses

| Status | Meaning |
|---|---|
| `400 Bad Request` | Invalid request body / validation error |
| `401 Unauthorized` | Missing or invalid JWT token |
| `403 Forbidden` | Authenticated but insufficient role |
| `404 Not Found` | Resource does not exist |

**Example 401:**
```json
{
  "detail": "Authentication credentials were not provided."
}
```

**Example 403:**
```json
{
  "detail": "You do not have permission to perform this action."
}
```
