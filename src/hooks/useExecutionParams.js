/**
 * @file useExecutionParams.js
 * @description Custom hook that parses execution-related IDs from the URL path.
 *
 * React Router's useParams() cannot reliably extract segments from wildcard
 * routes like "/execution/*". This hook uses useLocation() instead and splits
 * the pathname manually.
 *
 * Expected URL shape:
 *   /execution/<projectId>/<sprintId>/<buildId>/<testcaseId>
 *
 * @returns {{ projectId, sprintId, planId, buildId, testcaseId }} — all strings or null
 */

import { useLocation } from "react-router-dom";

const useExecutionParams = () => {
  const { pathname } = useLocation();
  // Remove empty strings produced by leading slash
  const parts = pathname.split("/").filter(Boolean);
  // parts[0] === "execution"
  return {
    projectId:  parts[1] || null,
    sprintId:   parts[2] || null,
    // Backward-compatible alias for older callers.
    planId:     parts[2] || null,
    buildId:    parts[3] || null,
    testcaseId: parts[4] || null,
  };
};

export default useExecutionParams;
