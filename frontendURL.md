# Frontend API Endpoints Reference

**Base URL:** `http://127.0.0.1:8002/api`  
**Config file:** `New/.env` → `VITE_API_BASE_URL`

---

## 🔐 Auth — `authApi.js`

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/login` | Login user |
| `POST` | `/register` | Register new user |

---

## 📁 Projects — `projectsApi.js`

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/allprojects` | Get all projects |
| `POST` | `/projectcreate` | Create a project |
| `PUT` | `/project/{id}` | Update a project |
| `DELETE` | `/project/{id}` | Delete a project |

---

## 🗂️ Suites — `suitesApi.js`

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/projects/{projectId}/suites` | Get suites by project |
| `GET` | `/projects/{projectId}/suites-with-testcases` | Get suites with test cases (assign page) |
| `GET` | `/suites/{suiteId}` | Get single suite |
| `POST` | `/projects/{projectId}/suites` | Create suite |
| `PUT` | `/suites/{suiteId}` | Update suite |
| `DELETE` | `/suites/{suiteId}` | Delete suite |

---

## 🧪 Test Cases — `testcasesApi.js`

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/suites/{suiteId}/testcases` | Get test cases by suite |
| `GET` | `/projects/{projectId}/testcases` | Get all test cases by project (RTM) |
| `GET` | `/testcases/{testcaseId}` | Get single test case |
| `POST` | `/suites/{suiteId}/testcases` | Create test case |
| `PUT` | `/testcases/{testcaseId}` | Update test case |
| `DELETE` | `/testcases/{testcaseId}` | Delete test case |

---

## 📋 Test Plans — `testplansApi.js`

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/projects/{projectId}/testplans` | Get plans by project |
| `GET` | `/testplan/{planId}` | Get single plan |
| `POST` | `/createtestplan` | Create test plan |
| `PUT` | `/testplan/{planId}` | Update test plan |
| `DELETE` | `/testplan/{planId}` | Delete test plan |
| `GET` | `/testplans/{planId}/testcases` | Get assigned test cases for a plan |
| `POST` | `/testplans/{planId}/testcases` | Save/replace assigned test cases |

---

## 🏗️ Builds — `buildsApi.js`

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/testplans/{planId}/builds` | Get builds by plan |
| `POST` | `/createbuild` | Create build |
| `PUT` | `/build/{buildId}` | Update build |
| `DELETE` | `/build/{buildId}` | Delete build |
| `POST` | `/builds/{buildId}/close` | Finalize / close a build |

---

## ▶️ Execution — `executionApi.js`

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/reports/executions?plan_id={planId}&build_id={buildId}` | Get execution results for a build |
| `GET` | `/executions/{executionId}/steps` | Get step-level results |
| `GET` | `/executions/{executionId}/issue` | Get linked issue for an execution |
| `POST` | `/executions/{planId}/{buildId}` | Save execution result (`multipart/form-data`) |

---

## 📊 Reports — `reportsApi.js`

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/reports/plan-history/{planId}` | Get full execution history report for a plan |

---

## Summary

| Module | File | Endpoints |
|--------|------|-----------|
| Auth | `authApi.js` | 2 |
| Projects | `projectsApi.js` | 4 |
| Suites | `suitesApi.js` | 6 |
| Test Cases | `testcasesApi.js` | 6 |
| Test Plans | `testplansApi.js` | 7 |
| Builds | `buildsApi.js` | 5 |
| Execution | `executionApi.js` | 4 |
| Reports | `reportsApi.js` | 1 |
| **Total** | | **35** |
