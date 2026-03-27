/**
 * @file ProjectContext.jsx
 * @description Provides the currently-active project and the full project list
 *              to all pages without prop-drilling.
 *
 * Usage:
 *   const { activeProject, setActiveProject, projects, refreshProjects } = useProject();
 */

import { createContext, useContext, useState, useEffect, useCallback, useMemo } from "react";
import { getAllProjects } from "../api/projectsApi";
import { useAuth } from "./AuthContext";

const ProjectContext = createContext(null);

/** @returns {{ activeProject, setActiveProject, projects, refreshProjects }} */
export const useProject = () => {
  const ctx = useContext(ProjectContext);
  if (!ctx) throw new Error("useProject must be used inside <ProjectProvider>");
  return ctx;
};

export const ProjectProvider = ({ children }) => { // eslint-disable-line react/prop-types
  const { user } = useAuth();
  const [projects, setProjects] = useState([]);

  const [activeProject, setActiveProjectState] = useState(() => {
    try {
      const saved = localStorage.getItem("activeProject");
      return saved && saved !== "undefined" ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  /** Fetches the full project list from the backend. */
  const refreshProjects = useCallback(async () => {
    try {
      const data = await getAllProjects();
      setProjects(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Failed to load projects:", err);
    }
  }, []);

  // Load projects on mount — only when a user is authenticated
  useEffect(() => {
    if (user) {
      refreshProjects();
    } else {
      setProjects([]);
    }
  }, [user, refreshProjects]);

  /**
   * Select a project as active. Persists to localStorage.
   * Pass null to deselect.
   * @param {object|null} project
   */
  const setActiveProject = useCallback((project) => {
    setActiveProjectState(project);
    if (project) {
      localStorage.setItem("activeProject", JSON.stringify(project));
    } else {
      localStorage.removeItem("activeProject");
    }
  }, []);

  const value = useMemo(
    () => ({ activeProject, setActiveProject, projects, refreshProjects }),
    [activeProject, setActiveProject, projects, refreshProjects]
  );

  return (
    <ProjectContext.Provider value={value}>
      {children}
    </ProjectContext.Provider>
  );
};
