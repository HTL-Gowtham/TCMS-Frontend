/**
 * @file ProjectListPage.jsx
 * @description Displays all projects in a table with CRUD actions.
 *
 * Reads searchQuery from Outlet context (set via Navigator search bar).
 */

/* eslint-disable */
import { useEffect, useState } from "react";
import { useOutletContext } from "react-router-dom";
import toast from "react-hot-toast";
import {
  getAllProjects,
  updateProject,
  deleteProject,
} from "../../api/projectsApi";
import ConfirmModal from "../../components/ui/ConfirmModal";
import "./ProjectListPage.css";

const ProjectListPage = () => {
  const { searchQuery, refreshSidebar } = useOutletContext() || {};

  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [actionMenuOpenId, setActionMenuOpenId] = useState(null);

  // Confirm modal state
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [pendingDeleteId, setPendingDeleteId] = useState(null);

  const fetchProjects = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getAllProjects();
      setProjects(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err.response?.data?.detail || "Failed to load projects");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  // Close action menu on outside click
  useEffect(() => {
    const close = () => setActionMenuOpenId(null);
    document.addEventListener("click", close);
    return () => document.removeEventListener("click", close);
  }, []);

  const toggleActionMenu = (e, id) => {
    e.stopPropagation();
    setActionMenuOpenId((prev) => (prev === id ? null : id));
  };

  const handleToggleActive = async (project) => {
    try {
      const updated = { ...project, project_active: !project.project_active };
      await updateProject(project.id, updated);
      setProjects((prev) =>
        prev.map((p) =>
          p.id === project.id ? { ...p, project_active: updated.project_active } : p
        )
      );
      if (refreshSidebar) refreshSidebar();
    } catch {
      toast.error("Failed to toggle status");
    }
  };

  const handleDeleteConfirm = (e, id) => {
    e.stopPropagation();
    setPendingDeleteId(id);
    setConfirmOpen(true);
    setActionMenuOpenId(null);
  };

  const handleDelete = async () => {
    setConfirmOpen(false);
    if (!pendingDeleteId) return;
    try {
      await deleteProject(pendingDeleteId);
      setProjects((prev) => prev.filter((p) => p.id !== pendingDeleteId));
      toast.success("Project deleted");
      if (refreshSidebar) refreshSidebar();
    } catch {
      toast.error("Failed to delete project");
    } finally {
      setPendingDeleteId(null);
    }
  };

  // Search filter
  const filteredProjects = projects.filter((p) => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      (p.project_name || "").toLowerCase().includes(q) ||
      (p.prefix || "").toLowerCase().includes(q)
    );
  });

  return (
    <div className="tp-page">
      <ConfirmModal
        isOpen={confirmOpen}
        message="Are you sure you want to delete this project? This cannot be undone."
        onConfirm={handleDelete}
        onCancel={() => { setConfirmOpen(false); setPendingDeleteId(null); }}
      />

      <div className="tp-content">
        {loading && <div className="info-msg">Loading projects...</div>}
        {error   && <div className="error-msg">{error}</div>}

        {!loading && !error && (
          <div className="table-card">
            <div className="tp-table-scroll">
              <table className="tp-table">
                <thead>
                  <tr>
                    <th style={{ width: "40%" }}>Project Name</th>
                    <th>Slug</th>
                    <th>Status</th>
                    <th>Visibility</th>
                    <th style={{ width: "80px", textAlign: "center" }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredProjects.map((p) => (
                    <tr key={p.id}>
                      <td style={{ fontWeight: "600", color: "#163860" }}>
                        {p.project_name}
                      </td>
                      <td>
                        <code className="prefix-tag">{p.slug}</code>
                      </td>
                      <td>
                        <span
                          className={`pill ${p.project_active ? "active" : "inactive"}`}
                          onClick={() => handleToggleActive(p)}
                          style={{ cursor: "pointer" }}
                          title="Toggle Status"
                        >
                          {p.project_active ? "Active" : "Inactive"}
                        </span>
                      </td>
                      <td>
                        <span className={`pill ${p.project_public ? "public" : "private"}`}>
                          {p.project_public ? "Public" : "Private"}
                        </span>
                      </td>

                      {/* Action menu */}
                      <td className="tp-action-cell">
                        <div
                          className="tp-action-wrapper"
                          style={{ justifyContent: "center" }}
                        >
                          <button
                            type="button"
                            className="tp-dots-btn"
                            onClick={(e) => toggleActionMenu(e, p.id)}
                          >
                            •••
                          </button>
                          {actionMenuOpenId === p.id && (
                            <div
                              className="action-menu-dropdown"
                              onClick={(e) => e.stopPropagation()}
                            >
                              <div
                                className="menu-item delete-item"
                                onClick={(e) => handleDeleteConfirm(e, p.id)}
                              >
                                <span className="icon">🗑</span> Delete
                              </div>
                            </div>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {filteredProjects.length === 0 && (
                <div className="info-msg" style={{ padding: "20px" }}>
                  No projects found.
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProjectListPage;
