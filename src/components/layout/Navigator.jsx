/**
 * @file Navigator.jsx
 * @description Secondary navigation bar — shows current project, page tabs,
 *              context-sensitive search and action buttons.
 */

/* eslint-disable */
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useProject } from "../../context/ProjectContext";
import "./Navigator.css";

const Navigator = ({ onCreatePlanClick, searchQuery, onSearchChange }) => { // eslint-disable-line
  const navigate = useNavigate();
  const location = useLocation();
  const { activeProject } = useProject();

  const isLocked = !activeProject;
  const isActive = (path) => location.pathname.toLowerCase().startsWith(path.toLowerCase());

  const isTestPlanPage   = isActive("/testplanmanagement");

  return (
    <div className="navigator-container">
      {/* LINE 1: Project Title */}
      <div className="nav-project-row">
        <span className="nav-folder-icon">📂</span>
        <span className="nav-project-name">
          {activeProject ? activeProject.project_name : "Select Project"}
        </span>
      </div>

      {/* LINE 2: Navigation tabs + Actions */}
      <div className="nav-links-row">
        <ul className="nav-links">
          <li>
            <Link
              to={isLocked ? "#" : "/testdesign"}
              className={`nav-item ${isLocked ? "disabled" : ""} ${isActive("/testdesign") ? "active" : ""}`}
              onClick={(e) => isLocked && e.preventDefault()}
            >
              Test Case
            </Link>
          </li>
          <li>
            <Link
              to={isLocked ? "#" : `/testplanmanagement/${activeProject?.id}`}
              className={`nav-item ${isLocked ? "disabled" : ""} ${isActive("/testplanmanagement") ? "active" : ""}`}
              onClick={(e) => isLocked && e.preventDefault()}
            >
              Test Plan
            </Link>
          </li>
          <li>
            <Link
              to={isLocked ? "#" : "/execution"}
              className={`nav-item ${isLocked ? "disabled" : ""} ${isActive("/execution") ? "active" : ""}`}
              onClick={(e) => isLocked && e.preventDefault()}
            >
              Execute
            </Link>
          </li>
          <li>
            <Link
              to={isLocked ? "#" : `/reports/rtm/${activeProject?.id}`}
              className={`nav-item ${isLocked ? "disabled" : ""} ${isActive("/reports/rtm") ? "active" : ""}`}
              onClick={(e) => isLocked && e.preventDefault()}
            >
              RTM
            </Link>
          </li>
          <li>
            <Link
              to={isLocked ? "#" : `/reports/history/${activeProject?.id}`}
              className={`nav-item ${isLocked ? "disabled" : ""} ${isActive("/reports/history") ? "active" : ""}`}
              onClick={(e) => isLocked && e.preventDefault()}
            >
              Reports
            </Link>
          </li>
        </ul>

        {/* Right-side actions */}
        <div className="nav-right-actions">
          {/* Shared search bar — shown on Test Plan page */}
          {isTestPlanPage && (
            <input
              type="text"
              className="nav-search-input"
              placeholder="Search plans..."
              value={searchQuery || ""}
              onChange={(e) => onSearchChange(e.target.value)}
            />
          )}

          {/* Test Plan page: Create Plan */}
          {/* {isTestPlanPage && !isLocked && (
            <button type="button" className="nav-action-btn" onClick={onCreatePlanClick}>
              + Create Plan
            </button>
          )} */}
        </div>
      </div>
    </div>
  );
};

export default Navigator;
