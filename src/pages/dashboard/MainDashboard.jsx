/**
 * @file MainDashboard.jsx
 * @description Landing page after login. Lists all active projects to select.
 */

/* eslint-disable */
import { useNavigate } from "react-router-dom";
import { useProject } from "../../context/ProjectContext";
import "./MainDashboard.css";

const MainDashboard = () => {
  const navigate = useNavigate();
  const { activeProject, setActiveProject, projects } = useProject();

  // Show latest (highest ID) active projects first
  const activeProjectsList = projects
    ? [...projects].filter((p) => p.project_active).sort((a, b) => b.id - a.id)
    : [];

  const selectAndNavigate = (project) => {
    setActiveProject(project);
    navigate(`/testdesign/${project.id}`);
  };

  return (
    <div className="dashboard-container">
      <div className="dashboard-projects-panel">
        <div className="dashboard-panel-header">
          <h2>Select a Project</h2>
          {activeProject && (
            <div className="active-badge">
              Current: <strong>{activeProject.project_name}</strong>
            </div>
          )}
        </div>

        <div className="project-grid-list">
          {activeProjectsList.length > 0 ? (
            activeProjectsList.map((proj) => (
              <button
                key={proj.id}
                type="button"
                className="project-choice-btn"
                onClick={() => selectAndNavigate(proj)}
              >
                <span className="proj-icon">📁</span>
                <span className="proj-name">{proj.project_name}</span>
                <span className="proj-arrow">➜</span>
              </button>
            ))
          ) : (
            <p className="no-proj-msg">No active projects found.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default MainDashboard;
