/**
 * @file testcasesApi.js
 * @description CRUD operations for Test Cases.
 */

import axiosInstance from "./axiosInstance";

/**
 * Get all test cases for a suite.
 * @param {number} suiteId
 */
export const getTestcasesBySuite = (suiteId) =>
  axiosInstance.get(`/suites/${suiteId}/testcases/`).then((r) => r.data);

/**
 * Get all test cases for a project (used for RTM report).
 * @param {number} projectId
 */
export const getTestcasesByProject = (projectId) =>
  axiosInstance.get(`/projects/${projectId}/testcases/`).then((r) => r.data);

/**
 * Get a single test case by ID.
 * @param {number} testcaseId
 */
export const getTestcaseById = (testcaseId) =>
  axiosInstance.get(`/testcases/${testcaseId}/`).then((r) => r.data);

/**
 * Create a test case under a suite.
 * @param {number} suiteId
 * @param {object} payload
 */
export const createTestcase = (suiteId, payload) =>
  axiosInstance
    .post(`/suites/${suiteId}/testcases/`, payload)
    .then((r) => r.data);

/**
 * Update a test case.
 * @param {number} testcaseId
 * @param {object} payload
 */
export const updateTestcase = (testcaseId, payload) =>
  axiosInstance.put(`/testcases/${testcaseId}/`, payload).then((r) => r.data);

/**
 * Delete a test case.
 * @param {number} testcaseId
 */
export const deleteTestcase = (testcaseId) =>
  axiosInstance.delete(`/testcases/${testcaseId}/`).then((r) => r.data);
