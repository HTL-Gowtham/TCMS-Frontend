/**
 * @file TestDesignPage.jsx
 * @description Main test-design view — a state machine with modes:
 *   dashboard | createSuite | viewSuite | editSuite | createTestcase | viewTestcase
 *
 * Uses useOutletContext() to call refreshSidebar after mutations.
 * All API calls go through suitesApi and testcasesApi — no hardcoded URLs.
 */

/* eslint-disable */
import { useEffect, useState, useCallback } from "react";
import { useParams, useNavigate, useOutletContext } from "react-router-dom";
import toast from "react-hot-toast";
import { useProject } from "../../context/ProjectContext";
import {
  getSuiteById,
  getSuitesByProject,
  updateSuite,
  deleteSuite,
} from "../../api/suitesApi";
import { getTestcaseById, deleteTestcase, getTestcasesBySuite } from "../../api/testcasesApi";
import CreateSuite from "./CreateSuite";
import CreateTestCase from "./CreateTestCase";
import ConfirmModal from "../../components/ui/ConfirmModal";
import "./TestDesignPage.css";

const TestDesignPage = () => {
  const { activeProject } = useProject();
  const { projectId, suiteId, testcaseId } = useParams();
  const navigate = useNavigate();
  const { refreshSidebar } = useOutletContext() || {};

  const notifySidebar = (sid) => {
    if (refreshSidebar) refreshSidebar(sid);
  };

  // ── State ─────────────────────────────────────────────────
  const [mode, setMode] = useState("dashboard");
  const [loading, setLoading] = useState(false);
  const [selectedSuite, setSelectedSuite] = useState(null);
  const [selectedTestcase, setSelectedTestcase] = useState(null);
  const [suites, setSuites] = useState([]);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editSuiteData, setEditSuiteData] = useState({ suite_name: "", suite_description: "" });

  // Accordion state
  const [expandedSuiteId, setExpandedSuiteId] = useState(null);
  const [suiteTestcasesMap, setSuiteTestcasesMap] = useState({});
  const [loadingSuiteId, setLoadingSuiteId] = useState(null);

  const toggleSuiteAccordion = async (suite) => {
    const id = suite.id;
    if (expandedSuiteId === id) {
      setExpandedSuiteId(null);
      return;
    }
    setExpandedSuiteId(id);
    if (!suiteTestcasesMap[id]) {
      setLoadingSuiteId(id);
      try {
        const tcs = await getTestcasesBySuite(id);
        setSuiteTestcasesMap((prev) => ({ ...prev, [id]: tcs }));
      } catch {
        setSuiteTestcasesMap((prev) => ({ ...prev, [id]: [] }));
      } finally {
        setLoadingSuiteId(null);
      }
    }
  };

  // Confirm modal
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [confirmConfig, setConfirmConfig] = useState({ message: "", onConfirm: () => {} });

  const openConfirm = (message, onConfirm) => {
    setConfirmConfig({ message, onConfirm });
    setConfirmOpen(true);
  };
  const closeConfirm = () => setConfirmOpen(false);

  // ── Data fetching driven by URL params ───────────────────
  const refreshData = useCallback(async () => {
    if (!activeProject) return;
    setLoading(true);
    try {
      if (testcaseId) {
        const [tc, suite] = await Promise.all([
          getTestcaseById(testcaseId),
          getSuiteById(suiteId),
        ]);
        setSelectedTestcase(tc);
        setSelectedSuite(suite);
        setMode("viewTestcase");
      } else if (suiteId) {
        const suite = await getSuiteById(suiteId);
        setSelectedSuite(suite);
        setSelectedTestcase(null);
        setMode((prev) => (prev === "createTestcase" ? "createTestcase" : "viewSuite"));
      } else {
        setSelectedSuite(null);
        setSelectedTestcase(null);
        const projectSuites = await getSuitesByProject(activeProject.id);
        setSuites(projectSuites);
        setMode((prev) => (prev === "createSuite" ? "createSuite" : "dashboard"));
      }
    } catch (err) {
      console.error("Error fetching data:", err);
    } finally {
      setLoading(false);
    }
  }, [activeProject, suiteId, testcaseId]);

  useEffect(() => {
    refreshData();
  }, [refreshData]);

  // ── Handlers ─────────────────────────────────────────────
  const handleUpdateSuite = async () => {
    try {
      await updateSuite(selectedSuite.id, editSuiteData);
      toast.success("Suite updated");
      notifySidebar(null);
      refreshData();
    } catch {
      toast.error("Update failed");
    }
  };

  const handleDeleteSuite = () => {
    openConfirm("Delete this Suite and all its test cases?", async () => {
      closeConfirm();
      try {
        await deleteSuite(selectedSuite.id);
        toast.success("Suite deleted");
        notifySidebar(null);
        navigate(`/testdesign/${activeProject.id}`);
      } catch {
        toast.error("Delete failed");
      }
    });
  };

  const handleDeleteTestcase = () => {
    openConfirm("Delete this Test Case?", async () => {
      closeConfirm();
      try {
        await deleteTestcase(selectedTestcase.id);
        toast.success("Test case deleted");
        notifySidebar(selectedTestcase.suite_id || suiteId);
        navigate(`/testdesign/${activeProject.id}/${selectedSuite.id}`);
      } catch {
        toast.error("Delete failed");
      }
    });
  };

  // ── Guards ───────────────────────────────────────────────
  if (!activeProject)
    return <div className="tp-page empty-state">Please select a project.</div>;
  if (loading)
    return <div className="tp-page loading-state">Loading...</div>;

  return (
    <div className="tp-page">
      <ConfirmModal
        isOpen={confirmOpen}
        message={confirmConfig.message}
        onConfirm={confirmConfig.onConfirm}
        onCancel={closeConfirm}
      />

      {/* 1. DASHBOARD */}
      {mode === "dashboard" && (
        <div className="tp-content-column">
          <div className="tp-header-row">
            <div className="tp-title-group">
              <span className="tp-icon-large">📁</span>
              <h3 className="tp-page-title">{activeProject.project_name}</h3>
            </div>
            <div className="tp-header-actions">
              <button
                type="button"
                className="tp-btn-create"
                onClick={() => setMode("createSuite")}
              >
                + Create New Suite
              </button>
            </div>
          </div>

          {suites.length === 0 ? (
            <div className="tp-empty-placeholder">
              <p>No suites yet. Create your first suite to get started.</p>
            </div>
          ) : (
            <div className="tp-suite-list">
              {suites.map((suite) => {
                const isOpen = expandedSuiteId === suite.id;
                const testcases = suiteTestcasesMap[suite.id] || [];
                const isLoadingTcs = loadingSuiteId === suite.id;
                return (
                  <div key={suite.id} className={`tp-accordion-item${isOpen ? " open" : ""}`}>
                    {/* Header row */}
                    <div
                      className="tp-suite-card"
                      onClick={() => toggleSuiteAccordion(suite)}
                      role="button"
                      tabIndex={0}
                      onKeyDown={(e) => e.key === "Enter" && toggleSuiteAccordion(suite)}
                    >
                      <div className="tp-suite-card-icon">{isOpen ? "📂" : "📁"}</div>
                      <div className="tp-suite-card-body">
                        <span className="tp-suite-card-name">{suite.suite_name}</span>
                        {suite.suite_description && (
                          <span className="tp-suite-card-desc">{suite.suite_description}</span>
                        )}
                      </div>
                      <div className="tp-suite-card-actions" onClick={(e) => e.stopPropagation()}>
                        <button
                          type="button"
                          className="tp-btn-small"
                          onClick={() => navigate(`/testdesign/${activeProject.id}/${suite.id}`)}
                        >
                          Open
                        </button>
                      </div>
                      <span className={`tp-accordion-chevron${isOpen ? " rotated" : ""}`}>›</span>
                    </div>

                    {/* Accordion panel */}
                    {isOpen && (
                      <div className="tp-accordion-panel">
                        {isLoadingTcs ? (
                          <div className="tp-accordion-loading">Loading test cases…</div>
                        ) : testcases.length === 0 ? (
                          <div className="tp-accordion-empty">No test cases in this suite yet.</div>
                        ) : (
                          <table className="tp-accordion-table">
                            <thead>
                              <tr>
                                <th style={{ width: 40 }}>#</th>
                                <th>Test Case</th>
                                <th style={{ width: 80 }}>Status</th>
                                <th style={{ width: 70 }}>Importance</th>
                              </tr>
                            </thead>
                            <tbody>
                              {testcases.map((tc) => (
                                <tr
                                  key={tc.id}
                                  className="tp-accordion-row"
                                  onClick={() =>
                                    navigate(`/testdesign/${activeProject.id}/${suite.id}/${tc.id}`)
                                  }
                                >
                                  <td className="tp-id-cell center-text">{tc.id}</td>
                                  <td className="tp-accordion-tc-name">{tc.testcase_name}</td>
                                  <td>
                                    <span className={`status-badge ${tc.testcase_status?.toLowerCase()}`}>
                                      {tc.testcase_status}
                                    </span>
                                  </td>
                                  <td>
                                    <span className={`importance-text ${tc.testcase_importance?.toLowerCase()}`}>
                                      {tc.testcase_importance}
                                    </span>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* 2. CREATE SUITE */}
      {mode === "createSuite" && (
        <div className="tp-form-wrapper">
          <CreateSuite
            project={activeProject}
            onCancel={() => setMode("dashboard")}
            onSuccess={(newSuite) => {
              notifySidebar(null);
              navigate(`/testdesign/${activeProject.id}/${newSuite.id}`);
            }}
          />
        </div>
      )}

      {/* 3. VIEW SUITE */}
      {mode === "viewSuite" && selectedSuite && (
        <div className="tp-content-column">
          <div className="tp-header-row">
            <div className="tp-title-group">
              <span className="tp-icon-large">📂</span>
              <h3 className="tp-page-title">{selectedSuite.suite_name}</h3>
            </div>
            <div className="tp-header-actions">
              <button
                type="button"
                className="tp-btn-secondary"
                onClick={() => {
                  setEditSuiteData(selectedSuite);
                  setMode("editSuite");
                }}
              >
                Edit
              </button>
              <button
                type="button"
                className="tp-btn-danger-ghost"
                onClick={handleDeleteSuite}
              >
                Delete
              </button>
            </div>
          </div>
          <div className="tp-info-box">
            <label>Description</label>
            <p>{selectedSuite.suite_description || "No description provided."}</p>
          </div>
          <div className="tp-sub-actions">
            <p className="tp-text-muted">
              Test Cases in this suite are listed in the sidebar.
            </p>
            <button
              type="button"
              className="tp-btn-create"
              onClick={() => setMode("createTestcase")}
            >
              + Create Test Case
            </button>
          </div>
        </div>
      )}

      {/* 4. EDIT SUITE */}
      {mode === "editSuite" && (
        <div className="tp-content-column">
          <div className="tp-header-row">
            <h3 className="tp-page-title">Edit Suite</h3>
          </div>
          <div className="tp-form-container">
            <div className="tp-form-group">
              <label>Suite Name</label>
              <input
                className="tp-input"
                value={editSuiteData.suite_name}
                onChange={(e) =>
                  setEditSuiteData((prev) => ({ ...prev, suite_name: e.target.value }))
                }
              />
            </div>
            <div className="tp-form-group">
              <label>Description</label>
              <textarea
                className="tp-input-textarea"
                value={editSuiteData.suite_description}
                onChange={(e) =>
                  setEditSuiteData((prev) => ({
                    ...prev,
                    suite_description: e.target.value,
                  }))
                }
              />
            </div>
            <div className="tp-footer-actions">
              <button
                type="button"
                className="tp-btn-secondary"
                onClick={() => setMode("viewSuite")}
              >
                Cancel
              </button>
              <button
                type="button"
                className="tp-btn-primary"
                onClick={handleUpdateSuite}
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 5. CREATE / EDIT TEST CASE */}
      {mode === "createTestcase" && selectedSuite && (
        <div className="tp-form-wrapper">
          <CreateTestCase
            suite={selectedSuite}
            editingTestcase={isEditMode ? selectedTestcase : null}
            onCancel={() => {
              setMode("viewTestcase");
              setIsEditMode(false);
            }}
            onSuccess={() => {
              notifySidebar(selectedSuite?.id);
              refreshData();
              setMode("viewTestcase");
              setIsEditMode(false);
            }}
          />
        </div>
      )}

      {/* 6. VIEW TEST CASE */}
      {mode === "viewTestcase" && selectedTestcase && (
        <div className="tp-content-column">
          <div className="tp-header-row">
            <div className="tp-title-group">
              <span className="tp-id-badge">#{selectedTestcase.id}</span>
              <h3 className="tp-page-title">{selectedTestcase.testcase_name}</h3>
            </div>
            <div className="tp-header-actions">
              <button
                type="button"
                className="tp-btn-primary"
                onClick={() => {
                  setSelectedTestcase(null);
                  setIsEditMode(false);
                  setMode("createTestcase");
                }}
              >
                + New
              </button>
              <button
                type="button"
                className="tp-btn-secondary"
                onClick={() => {
                  setIsEditMode(true);
                  setMode("createTestcase");
                }}
              >
                Edit
              </button>
              <button
                type="button"
                className="tp-btn-danger-ghost"
                onClick={handleDeleteTestcase}
              >
                Delete
              </button>
            </div>
          </div>

          {/* Meta grid */}
          <div className="tp-meta-grid">
            <div className="tp-meta-item">
              <label>Task ID</label>
              <span>{selectedTestcase.task_id || "N/A"}</span>
            </div>
            <div className="tp-meta-item">
              <label>Status</label>
              <span className={`status-badge ${selectedTestcase.testcase_status?.toLowerCase()}`}>
                {selectedTestcase.testcase_status}
              </span>
            </div>
            <div className="tp-meta-item">
              <label>Importance</label>
              <span className={`importance-text ${selectedTestcase.testcase_importance?.toLowerCase()}`}>
                {selectedTestcase.testcase_importance}
              </span>
            </div>
            <div className="tp-meta-item">
              <label>Type</label>
              <span>{selectedTestcase.testcase_type}</span>
            </div>
          </div>

          {/* Summary / Precondition */}
          {(selectedTestcase.testcase_summary || selectedTestcase.testcase_precondition) && (
            <div className="tp-details-grid">
              {selectedTestcase.testcase_summary && (
                <div className="tp-info-box compact">
                  <label>Summary</label>
                  <p>{selectedTestcase.testcase_summary}</p>
                </div>
              )}
              {selectedTestcase.testcase_precondition && (
                <div className="tp-info-box compact">
                  <label>Pre-conditions</label>
                  <p>{selectedTestcase.testcase_precondition}</p>
                </div>
              )}
            </div>
          )}

          {/* Steps table */}
          <div className="tp-table-header-label">TEST STEPS</div>
          <div className="tp-table-container view-mode">
            <div className="tp-table-scroll">
              <table className="tp-table tp-view-table">
                <thead>
                  <tr>
                    <th style={{ width: "50px" }}>#</th>
                    <th style={{ width: "40%" }}>Action</th>
                    <th style={{ width: "40%" }}>Expected Result</th>
                    <th>Precondition</th>
                  </tr>
                </thead>
                <tbody>
                  {(selectedTestcase.steps || []).length === 0 ? (
                    <tr>
                      <td colSpan={4} className="tp-empty-cell">
                        No steps defined
                      </td>
                    </tr>
                  ) : (
                    selectedTestcase.steps.map((step) => (
                      <tr key={step.step_no}>
                        <td className="tp-id-cell center-text">{step.step_no}</td>
                        <td className="tp-text-cell">{step.action}</td>
                        <td className="tp-text-cell">{step.expected_result}</td>
                        <td className="tp-text-muted-cell">{step.precondition}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TestDesignPage;
