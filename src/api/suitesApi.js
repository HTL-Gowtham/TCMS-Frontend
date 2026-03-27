/**
 * @file suitesApi.js
 * @description CRUD operations for Test Suites.
 */

import axiosInstance from "./axiosInstance";

/**
 * Get all suites for a project.
 * @param {number} projectId
 */
export const getSuitesByProject = (projectId) =>
  axiosInstance.get(`/projects/${projectId}/suites/`).then((r) => r.data);

/**
 * Get suites with their test cases (for assign-test-cases page).
 * @param {number} projectId
 */
export const getSuitesWithTestcases = (projectId) =>
  axiosInstance
    .get(`/projects/${projectId}/suites-with-testcases/`)
    .then((r) => r.data);

/**
 * Get a single suite by ID.
 * @param {number} suiteId
 */
export const getSuiteById = (suiteId) =>
  axiosInstance.get(`/suites/${suiteId}/`).then((r) => r.data);

/**
 * Create a suite under a project.
 * @param {number} projectId
 * @param {{ suite_name: string, suite_description: string }} payload
 */
export const createSuite = (projectId, payload) =>
  axiosInstance
    .post(`/projects/${projectId}/suites/`, payload)
    .then((r) => r.data);

/**
 * Update a suite.
 * @param {number} suiteId
 * @param {object} payload
 */
export const updateSuite = (suiteId, payload) =>
  axiosInstance.put(`/suites/${suiteId}/`, payload).then((r) => r.data);

/**
 * Delete a suite.
 * @param {number} suiteId
 */
export const deleteSuite = (suiteId) =>
  axiosInstance.delete(`/suites/${suiteId}/`).then((r) => r.data);
