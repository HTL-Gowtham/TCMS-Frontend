/**
 * @file AppRoutes.jsx
 * @description Centralises all application routes.
 *
 * Structure:
 *   Public  → /login, /register (no auth guard)
 *   Private → everything else inside <ProtectedRoute> + <AppLayout>
 */

import { Routes, Route, Navigate } from "react-router-dom";
import ProtectedRoute from "../components/layout/ProtectedRoute";
import AppLayout from "../components/layout/AppLayout";

// --- Auth pages ---
import LoginPage from "../pages/auth/LoginPage";
import RegisterPage from "../pages/auth/RegisterPage";

// --- Protected pages ---
import MainDashboard from "../pages/dashboard/MainDashboard";
import ProjectListPage from "../pages/projects/ProjectListPage";
import ProjectCreatePage from "../pages/projects/ProjectCreatePage";
import TestDesignPage from "../pages/suites/TestDesignPage";
import TestPlanManagementPage from "../pages/testplans/TestPlanManagementPage";
import AssignTestCasesPage from "../pages/testplans/AssignTestCasesPage";
import PlanTestCasesPage from "../pages/testplans/PlanTestCasesPage";
import ExecutionPage from "../pages/execution/ExecutionPage";
import PlanHistoryReport from "../pages/reports/PlanHistoryReport";
import RTMReport from "../pages/reports/RTMReport";

const AppRoutes = () => (
  <Routes>
    {/* ── Root redirect ── */}
    <Route path="/" element={<Navigate to="/login" replace />} />

    {/* ── Public ── */}
    <Route path="/login"    element={<LoginPage />} />
    <Route path="/register" element={<RegisterPage />} />

    {/* ── Protected (all inside AppLayout which renders Outlet) ── */}
    <Route
      element={
        <ProtectedRoute>
          <AppLayout />
        </ProtectedRoute>
      }
    >
      <Route path="/dashboard"    element={<MainDashboard />} />
      <Route path="/projectlist"  element={<ProjectListPage />} />
      <Route path="/projectcreate" element={<ProjectCreatePage />} />

      {/* TestDesign — single route that catches all sub-paths */}
      <Route path="/testdesign/:projectId?/:suiteId?/:testcaseId?" element={<TestDesignPage />} />

      {/* Test Plans */}
      <Route path="/testplanmanagement/:projectId" element={<TestPlanManagementPage />} />
      <Route path="/assigntestcases/:planId"        element={<AssignTestCasesPage />} />
      <Route path="/plantestcases/:planId"          element={<PlanTestCasesPage />} />

      {/* Execution — wildcard to support deep URL segments */}
      <Route path="/execution/*" element={<ExecutionPage />} />

      {/* Reports */}
      <Route path="/reports/history/:projectId" element={<PlanHistoryReport />} />
      <Route path="/reports/rtm/:projectId"     element={<RTMReport />} />
    </Route>
  </Routes>
);

export default AppRoutes;
