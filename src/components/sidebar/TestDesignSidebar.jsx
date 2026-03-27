/**
 * @file TestDesignSidebar.jsx
 * @description Left-side tree view — project selector dropdown, suite list,
 *              and test case items with expand/collapse.
 */

/* eslint-disable */
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./TestDesignSidebar.css";

const TestDesignSidebar = ({
  activeProject,
  projects = [],
  onProjectSelect,
  suites = [],
  suiteTestCases = {},
  expandedSuites = {},
  toggleSuite,
  selectedSuiteId,
  selectedTestCaseId,
  onAddSuite,
  onAddTestCase,
}) => {
  const navigate = useNavigate();
  const [isProjectExpanded, setIsProjectExpanded] = useState(true);

  // Only show active projects in the dropdown
  const activeProjectsOnly = projects.filter((p) => p.project_active === true);

  const handleDropdownChange = (e) => {
    const id = parseInt(e.target.value);
    const project = projects.find((p) => p.id === id);
    if (project && onProjectSelect) {
      onProjectSelect(project);
    }
  };

  return (
    <aside className="td-sidebar">
      {/* --- DROPDOWN HEADER --- */}
      <div className="sidebar-header-section">
        <div className="custom-dropdown-wrapper">
          <select
            className="custom-dropdown"
            value={activeProject?.id || ""}
            onChange={handleDropdownChange}
          >
            <option value="" disabled>
              Select Project
            </option>
            {activeProjectsOnly.map((proj) => (
              <option key={proj.id} value={proj.id}>
                {proj.project_name}
              </option>
            ))}
          </select>
          <span className="dropdown-arrow">▼</span>
        </div>
      </div>

      {/* --- TREE CONTENT --- */}
      <div className="sidebar-content">
        {!activeProject && (
          <div className="empty-msg">Please select a project.</div>
        )}

        {activeProject && (
          <div className="tree-structure">
            <div className="project-group">
              {/* LEVEL 0: PROJECT ROOT */}
              <div
                className={`tree-item project-item ${
                  !selectedSuiteId && !selectedTestCaseId ? "active" : ""
                }`}
                onClick={() => {
                  setIsProjectExpanded((v) => !v);
                  navigate(`/testdesign/${activeProject.id}`);
                }}
              >
                <span className="arrow-icon">
                  {isProjectExpanded ? "▲" : "▼"}
                </span>
                <span className="folder-icon icon-yellow">📂</span>
                <span className="item-text text-bold">
                  {activeProject.project_name}
                </span>
                <button
                  type="button"
                  className="icon-btn-add"
                  onClick={(e) => {
                    e.stopPropagation();
                    onAddSuite();
                  }}
                  title="Create New Suite"
                >
                  +
                </button>
              </div>

              {/* LEVEL 1: SUITES */}
              {isProjectExpanded && (
                <div className="project-children">
                  {suites.length === 0 && (
                    <div className="empty-leaf">No suites created.</div>
                  )}
                  {suites.map((suite) => {
                    const currentCases = suiteTestCases[suite.id] || [];
                    const isExpanded = expandedSuites[suite.id];
                    const isSuiteActive =
                      Number(selectedSuiteId) === suite.id &&
                      !selectedTestCaseId;

                    return (
                      <div key={suite.id} className="suite-group">
                        <div
                          className={`tree-item suite-item ${
                            isSuiteActive ? "active" : ""
                          }`}
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleSuite(suite.id);
                            navigate(
                              `/testdesign/${activeProject.id}/${suite.id}`
                            );
                          }}
                        >
                          <span className="arrow-icon">
                            {isExpanded ? "▲" : "▼"}
                          </span>
                          <span className="folder-icon icon-blue">📂</span>
                          <span className="item-text">{suite.suite_name}</span>
                          <button
                            type="button"
                            className="icon-btn-add"
                            onClick={(e) => {
                              e.stopPropagation();
                              if (onAddTestCase) onAddTestCase(suite);
                            }}
                            title="Create Test Case"
                          >
                            +
                          </button>
                        </div>

                        {/* LEVEL 2: TEST CASES */}
                        {isExpanded && (
                          <div className="suite-children">
                            <div className="tree-line-wrapper">
                              {currentCases.length === 0 ? (
                                <div className="empty-leaf">No test cases</div>
                              ) : (
                                currentCases.map((tc) => {
                                  const isTcActive =
                                    Number(selectedTestCaseId) === tc.id;
                                  return (
                                    <div
                                      key={tc.id}
                                      className={`tree-item tc-item ${
                                        isTcActive ? "active" : ""
                                      }`}
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        navigate(
                                          `/testdesign/${activeProject.id}/${suite.id}/${tc.id}`
                                        );
                                      }}
                                    >
                                      <span className="tree-dot" />
                                      <span className="item-text">
                                        {tc.testcase_name}
                                      </span>
                                    </div>
                                  );
                                })
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </aside>
  );
};

export default TestDesignSidebar;
