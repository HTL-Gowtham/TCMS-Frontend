/**
 * @file executionApi.js
 * @description API functions for test execution (saving results, step details).
 */

import axiosInstance from "./axiosInstance";

/**
 * Get all saved execution results for a plan + build combo.
 * @param {string|number} planId
 * @param {string|number} buildId
 */
export const getExecutionResults = (planId, buildId) =>
  axiosInstance
    .get(`/reports/executions/?plan_id=${planId}&build_id=${buildId}`)
    .then((r) => r.data);

/**
 * Get step-level results for a single execution record.
 * @param {number} executionId
 */
export const getExecutionSteps = (executionId) =>
  axiosInstance
    .get(`/executions/${executionId}/steps/`)
    .then((r) => r.data);

/**
 * Get the issue linked to an execution (only exists on Fail status).
 * @param {number} executionId
 */
export const getExecutionIssue = (executionId) =>
  axiosInstance
    .get(`/executions/${executionId}/issue/`)
    .then((r) => r.data);

/**
 * Get the next auto-generated bug/issue task ID.
 */
export const getNextBugId = () =>
  axiosInstance
    .get(`/utils/next-bug-id/`)
    .then((r) => r.data);

/**
 * Save execution results for a test case.
 * Uses multipart/form-data to support optional file attachment.
 *
 * @param {string|number} planId
 * @param {string|number} buildId
 * @param {FormData} formData
 */
export const saveExecution = (planId, buildId, formData) =>
  axiosInstance
    .post(`/testplans/${planId}/builds/${buildId}/execute/`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    })
    .then((r) => r.data);
