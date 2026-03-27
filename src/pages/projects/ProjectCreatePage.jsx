/**
 * @file ProjectCreatePage.jsx
 * @description Create or edit a project. Supports edit mode when
 *              navigated with location.state.editProject.
 */

/* eslint-disable */
import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import toast from "react-hot-toast";
import { createProject, updateProject } from "../../api/projectsApi";
import { useProject } from "../../context/ProjectContext";
import "./ProjectCreatePage.css";

const ProjectCreatePage = () => {
  const navigate  = useNavigate();
  const location  = useLocation();
  const { refreshProjects } = useProject();

  const editModeData = location.state?.editProject;

  const [projectDetails, setProjectDetails] = useState({
    project_name:            "",
    prefix:                  "",
    project_description:     "",
    enable_requirements:     false,
    enable_testing_priority: false,
    enable_test_automation:  false,
    enable_inventory:        false,
    project_active:          true,
    project_public:          false,
  });

  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (editModeData) setProjectDetails(editModeData);
  }, [editModeData]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setProjectDetails((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const newErrors = {};
    if (!projectDetails.project_name.trim()) newErrors.project_name = "Required";
    if (!projectDetails.prefix.trim())       newErrors.prefix        = "Required";
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    try {
      if (editModeData) {
        await updateProject(editModeData.id, projectDetails);
        toast.success("Project updated successfully");
      } else {
        await createProject(projectDetails);
        toast.success("Project created successfully");
      }
      await refreshProjects();
      navigate("/projectlist");
    } catch (err) {
      toast.error(err.response?.data?.detail || "Error saving project");
    }
  };

  return (
    <div className="tp-page full-width-layout">
      <div className="tp-form-card wide-card">
        <div className="tp-card-header">
          <h2>{editModeData ? "Edit Project" : "Create New Project"}</h2>
        </div>

        <form onSubmit={handleSubmit} className="tp-form-body">
          {/* ROW 1: Name, Prefix, Description */}
          <div className="form-row-linear">
            <div className="linear-group" style={{ flex: 2 }}>
              <label>
                Project Name <span className="req">*</span>
              </label>
              <input
                type="text"
                name="project_name"
                placeholder="Project Name"
                value={projectDetails.project_name}
                onChange={handleChange}
                className={`tp-input sharp ${errors.project_name ? "input-error" : ""}`}
              />
              {errors.project_name && (
                <span className="error-msg">{errors.project_name}</span>
              )}
            </div>

            <div className="linear-group" style={{ flex: 1 }}>
              <label>
                Prefix <span className="req">*</span>
              </label>
              <input
                type="text"
                name="prefix"
                placeholder="Prefix"
                value={projectDetails.prefix}
                onChange={handleChange}
                className={`tp-input sharp ${errors.prefix ? "input-error" : ""}`}
                maxLength={10}
              />
              {errors.prefix && (
                <span className="error-msg">{errors.prefix}</span>
              )}
            </div>

            <div className="linear-group" style={{ flex: 3 }}>
              <label>Description</label>
              <input
                type="text"
                name="project_description"
                placeholder="Brief description..."
                value={projectDetails.project_description}
                onChange={handleChange}
                className="tp-input sharp"
              />
            </div>
          </div>

          <div className="form-divider" />

          {/* ROW 2: Checkboxes */}
          <div className="form-row-checks">
            <label className="section-label">Settings:</label>
            <div className="checks-container">
              {[
                ["enable_requirements",     "Enable Requirements"],
                ["enable_testing_priority", "Testing Priority"],
                ["enable_test_automation",  "Test Automation"],
                ["enable_inventory",        "Enable Inventory"],
                ["project_public",          "Public Project"],
                ["project_active",          "Active"],
              ].map(([key, label]) => (
                <label key={key} className="checkbox-pill">
                  <input
                    type="checkbox"
                    name={key}
                    checked={projectDetails[key]}
                    onChange={handleChange}
                  />
                  {label}
                </label>
              ))}
            </div>
          </div>

          {/* Footer */}
          <div className="tp-form-actions">
            <button
              type="button"
              className="btn-secondary sharp"
              onClick={() => navigate("/projectlist")}
            >
              Cancel
            </button>
            <button type="submit" className="primary-btn sharp">
              {editModeData ? "Save Update" : "Create Project"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProjectCreatePage;
