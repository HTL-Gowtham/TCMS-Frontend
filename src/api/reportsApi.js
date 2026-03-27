/**
 * @file reportsApi.js
 * @description API functions for report generation.
 */

import axiosInstance from "./axiosInstance";

/**
 * Get the full execution history report for a test plan.
 * @param {number} planId
 */
export const getPlanHistoryReport = (planId) =>
  axiosInstance
    .get(`/reports/plan-history/${planId}/`)
    .then((r) => r.data);
