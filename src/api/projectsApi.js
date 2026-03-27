/**
 * @file projectsApi.js
 * @description CRUD operations for Projects.
 *
 * The backend returns paginated responses { count, results: [...] } and uses
 * `name` as the project name field. This file normalises both so the rest of
 * the frontend can continue to use a plain array and `project_name`.
 */

import axiosInstance from "./axiosInstance";

/**
 * Normalise a single project object from the backend shape to the frontend shape.
 * Backend: { id, name, slug, description, project_active, ... }
 * Frontend expects: { id, project_name, project_active, ... }
 */
const normalise = (p) => ({
  ...p,
  project_name: p.name ?? p.project_name ?? "",
});

/** Fetch all projects (handles paginated response). */
export const getAllProjects = () =>
  axiosInstance.get("/projects/").then((r) => {
    const data = r.data;
    // Backend returns { count, results: [...] }
    const list = Array.isArray(data) ? data : (data.results ?? []);
    return list.map(normalise);
  });

/**
 * Create a new project.
 * Maps frontend `project_name` → backend `name`.
 * @param {object} payload
 */
export const createProject = (payload) => {
  const body = { ...payload, name: payload.project_name ?? payload.name };
  return axiosInstance.post("/projects/", body).then((r) => normalise(r.data));
};

/**
 * Update an existing project.
 * @param {number} id
 * @param {object} payload
 */
export const updateProject = (id, payload) => {
  const body = { ...payload, name: payload.project_name ?? payload.name };
  return axiosInstance.put(`/projects/${id}/`, body).then((r) => normalise(r.data));
};

/**
 * Delete a project by ID.
 * @param {number} id
 */
export const deleteProject = (id) =>
  axiosInstance.delete(`/projects/${id}/`).then((r) => r.data);
