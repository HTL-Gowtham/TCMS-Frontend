/**
 * @file testplansApi.js
 * @description CRUD operations for Test Plans and test-case assignment.
 */

import axiosInstance from "./axiosInstance";

/**
 * Get all test plans for a project.
 * @param {number} projectId
 */
export const getPlansByProject = (projectId) =>
  axiosInstance
    .get(`/projects/${projectId}/testplans/`)
    .then((r) => r.data);

/**
 * Get a single test plan by ID.
 * @param {number} planId
 */
export const getPlanById = (planId) =>
  axiosInstance.get(`/testplans/${planId}/`).then((r) => r.data);

/**
 * Create a new test plan.
 * @param {object} payload — must include project_id
 */
export const createPlan = (payload) =>
  axiosInstance.post("/testplans/", payload).then((r) => r.data);

/**
 * Update a test plan.
 * @param {number} planId
 * @param {object} payload
 */
export const updatePlan = (planId, payload) =>
  axiosInstance.put(`/testplans/${planId}/`, payload).then((r) => r.data);

/**
 * Delete a test plan (and all its builds).
 * @param {number} planId
 */
export const deletePlan = (planId) =>
  axiosInstance.delete(`/testplans/${planId}/`).then((r) => r.data);

/**
 * Get test cases assigned to a plan.
 * @param {number} planId
 */
export const getAssignedTestcases = (planId) =>
  axiosInstance
    .get(`/testplans/${planId}/testcases/`)
    .then((r) => r.data);

/**
 * Save (replace) the full set of assigned test cases for a plan.
 * @param {number} planId
 * @param {number[]} testcaseIds
 */
export const saveAssignedTestcases = (planId, testcaseIds) =>
  axiosInstance
    .post(`/testplans/${planId}/testcases/`, { testcase_ids: testcaseIds })
    .then((r) => r.data);
