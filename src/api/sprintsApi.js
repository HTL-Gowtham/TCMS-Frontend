/**
 * @file sprintsApi.js
 * @description Read operations for sprint-based feature flow.
 */

import axiosInstance from "./axiosInstance";

const toArray = (payload) => {
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload?.results)) return payload.results;
  return [];
};

const normalizeSprint = (sprint) => ({
  ...sprint,
  sprint_name:
    sprint?.sprint_name ||
    sprint?.name ||
    sprint?.title ||
    (sprint?.id ? `Sprint #${sprint.id}` : ""),
});

const resolveSprintProjectId = (sprint) =>
  sprint?.project_id ??
  sprint?.projectId ??
  sprint?.project?.id ??
  sprint?.project ??
  sprint?.project_ref;

/**
 * Get sprints (optionally filtered by project) for sprint-based build flow.
 * @param {number|string} [projectId]
 */
export const getSprints = (projectId) =>
  axiosInstance
    .get("/sprints/", {
      params: projectId ? { project_id: projectId, project: projectId } : undefined,
    })
    .then((r) => {
      const data = toArray(r.data).map(normalizeSprint);
      if (!projectId) return data;
      return data.filter((s) => String(resolveSprintProjectId(s)) === String(projectId));
    });
