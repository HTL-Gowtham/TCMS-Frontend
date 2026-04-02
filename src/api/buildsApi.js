/**
 * @file buildsApi.js
 * @description CRUD operations for Builds within a Test Plan/Sprint context.
 */

import axiosInstance from "./axiosInstance";

/**
 * Get all builds for a plan.
 * @param {number} planId
 */
export const getBuildsByPlan = (planId) =>
  axiosInstance.get(`/testplans/${planId}/builds/`).then((r) => r.data);

/**
 * Create a build under a plan.
 * @param {number} planId  — used in the URL path
 * @param {object} payload — build fields (build_version, build_desc, etc.)
 */
export const createBuild = (planId, payload) =>
  axiosInstance
    .post(`/testplans/${planId}/builds/`, {
      ...payload,
      testplan_id: payload?.testplan_id ?? payload?.sprint_id ?? planId,
      sprint_id: payload?.sprint_id ?? payload?.testplan_id ?? planId,
    })
    .then((r) => r.data);

/**
 * Update a build.
 * @param {number} buildId
 * @param {object} payload
 */
export const updateBuild = (buildId, payload) =>
  axiosInstance.put(`/builds/${buildId}/`, payload).then((r) => r.data);

/**
 * Delete a build.
 * @param {number} buildId
 */
export const deleteBuild = (buildId) =>
  axiosInstance.delete(`/builds/${buildId}/`).then((r) => r.data);

/**
 * Close / finalize a build (marks it as closed — cannot be re-opened).
 * @param {number} buildId
 */
export const closeBuild = (buildId) =>
  axiosInstance.post(`/builds/${buildId}/close/`).then((r) => r.data);
