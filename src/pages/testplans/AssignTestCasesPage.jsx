/**
 * @file AssignTestCasesPage.jsx
 * @description Assign/unassign test cases to a test plan.
 *              Only "Ready" status test cases can be assigned.
 */

/* eslint-disable */
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import toast from "react-hot-toast";
import { getPlanById, getAssignedTestcases, saveAssignedTestcases } from "../../api/testplansApi";
import { getSuitesWithTestcases } from "../../api/suitesApi";
import { getTestcaseById } from "../../api/testcasesApi";
import "./AssignTestCasesPage.css";

const AssignTestCasesPage = () => {
  const navigate = useNavigate();
  const { planId } = useParams();

  const [planInfo, setPlanInfo] = useState(null);
  const [suites, setSuites] = useState([]);
  const [selectedSuiteId, setSelectedSuiteId] = useState(null);
  const [selectedTestcases, setSelectedTestcases] = useState([]);
  const [viewingTestcase, setViewingTestcase] = useState(null);

  // ── Data loading ─────────────────────────────────────────
  const fetchPlanInfo = async () => {
    try {
      const data = await getPlanById(planId);
      setPlanInfo(data);
    } catch (e) { console.error(e); }
  };

  const fetchSuites = async (projectId) => {
    try {
      const data = await getSuitesWithTestcases(projectId);
      setSuites(data);
      if (data.length > 0) setSelectedSuiteId(data[0].id);
    } catch (e) { console.error(e); }
  };

  const fetchAssignedTestcases = async () => {
    try {
      const data = await getAssignedTestcases(planId);
      setSelectedTestcases(data.map((tc) => tc.id));
    } catch (e) { console.error(e); }
  };

  useEffect(() => {
    fetchPlanInfo();
    fetchAssignedTestcases();
  }, [planId]);

  useEffect(() => {
    if (planInfo?.project_id) fetchSuites(planInfo.project_id);
  }, [planInfo]);

  // ── Save ─────────────────────────────────────────────────
  const handleSave = async () => {
    try {
      await saveAssignedTestcases(planId, selectedTestcases);
      toast.success("Assignment Saved Successfully!");
      navigate(-1);
    } catch { toast.error("Error saving assignment"); }
  };

  // ── Toggle detail view ───────────────────────────────────
  const handleToggleDetails = async (tcId) => {
    if (viewingTestcase?.id === tcId) { setViewingTestcase(null); return; }
    try {
      const data = await getTestcaseById(tcId);
      setViewingTestcase(data);
    } catch (e) { console.error(e); }
  };

  // ── Selection logic ──────────────────────────────────────
  const currentSuite  = suites.find((s) => s.id === selectedSuiteId);
  const visibleCases  = currentSuite?.testcases || [];
  const selectableCases = visibleCases.filter(
    (tc) => (tc.testcase_status || "").toLowerCase() === "ready"
  );
  const isAllSelected =
    selectableCases.length > 0 &&
    selectableCases.every((tc) => selectedTestcases.includes(tc.id));

  const handleSelectAll = () => {
    const ids = selectableCases.map((tc) => tc.id);
    if (isAllSelected) {
      setSelectedTestcases((prev) => prev.filter((id) => !ids.includes(id)));
    } else {
      setSelectedTestcases((prev) => [...new Set([...prev, ...ids])]);
    }
  };

  const toggleTestcase = (id) =>
    setSelectedTestcases((prev) =>
      prev.includes(id) ? prev.filter((tid) => tid !== id) : [...prev, id]
    );

  return (
    <div className="at-page">
      {/* HEADER */}
      <div className="at-header">
        <div className="at-header-left">
          <h2 className="at-page-title">Assign Test Cases</h2>
          {planInfo && (
            <div className="at-context-badges">
              <span className="ctx-badge">Plan: {planInfo.testplan_name}</span>
              <span className="ctx-badge">ID: {planInfo.project_id}</span>
            </div>
          )}
        </div>
        <div className="at-header-right">
          <span className="selection-info">
            Selected: <b>{selectedTestcases.length}</b>
          </span>
          <button type="button" className="at-btn-cancel" onClick={() => navigate(-1)}>
            Cancel
          </button>
          <button type="button" className="at-btn-save" onClick={handleSave}>
            Save
          </button>
        </div>
      </div>

      {/* BODY */}
      <div className="at-body-container">
        {/* Sidebar: Suites */}
        <div className="at-sidebar-suites">
          <div className="sidebar-header">TEST SUITES</div>
          <div className="sidebar-scroll">
            {suites.map((s) => (
              <div
                key={s.id}
                className={`suite-item ${selectedSuiteId === s.id ? "active" : ""}`}
                onClick={() => { setSelectedSuiteId(s.id); setViewingTestcase(null); }}
              >
                <span className="folder-icon">📁</span>
                <span className="suite-text">{s.suite_name}</span>
                <span className="count-badge">{s.testcases?.length || 0}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Main: Test Cases */}
        <div className="at-main-content">
          <div className="at-table-card">
            {!currentSuite ? (
              <div className="empty-placeholder">Select a suite to view test cases</div>
            ) : (
              <div className="table-scroll-area">
                <table className="at-table">
                  <colgroup>
                    <col style={{ width: "40px" }} />
                    <col style={{ width: "90px" }} />
                    <col />
                    <col style={{ width: "100px" }} />
                    <col style={{ width: "50px" }} />
                  </colgroup>
                  <thead>
                    <tr>
                      <th className="text-center">
                        <input
                          type="checkbox"
                          className="at-checkbox"
                          checked={isAllSelected}
                          onChange={handleSelectAll}
                          disabled={selectableCases.length === 0}
                        />
                      </th>
                      <th>ID</th>
                      <th>Case Name</th>
                      <th>Status</th>
                      <th />
                    </tr>
                  </thead>
                  <tbody>
                    {visibleCases.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="empty-row">
                          No test cases found.
                        </td>
                      </tr>
                    ) : (
                      visibleCases.map((tc) => {
                        const isExpanded  = viewingTestcase?.id === tc.id;
                        const isSelected  = selectedTestcases.includes(tc.id);
                        const isDraft     = (tc.testcase_status || "").toLowerCase() !== "ready";
                        return (
                          <>
                            <tr
                              key={tc.id}
                              className={`at-row ${isSelected ? "selected" : ""} ${isExpanded ? "expanded" : ""} ${isDraft ? "row-draft" : ""}`}
                            >
                              <td className="text-center">
                                <input
                                  type="checkbox"
                                  className="at-checkbox"
                                  checked={isSelected}
                                  onChange={() => toggleTestcase(tc.id)}
                                  disabled={isDraft}
                                />
                              </td>
                              <td className="id-text">TC-{tc.id}</td>
                              <td
                                className="name-text"
                                onClick={() => handleToggleDetails(tc.id)}
                                style={{ cursor: "pointer" }}
                              >
                                {tc.testcase_name}
                              </td>
                              <td>
                                <span className={`status-label ${isDraft ? "draft" : "ready"}`}>
                                  {tc.testcase_status || "Draft"}
                                </span>
                              </td>
                              <td
                                className="text-center"
                                style={{ cursor: "pointer" }}
                                onClick={() => handleToggleDetails(tc.id)}
                              >
                                {isExpanded ? "▼" : "▶"}
                              </td>
                            </tr>
                            {isExpanded && (
                              <tr className="detail-row-container">
                                <td colSpan={5} className="detail-cell-wrapper">
                                  <div className="detail-panel">
                                    <div className="info-grid">
                                      <div className="info-block">
                                        <label>Summary</label>
                                        <div className="info-value">{viewingTestcase.testcase_summary || "—"}</div>
                                      </div>
                                      <div className="info-block">
                                        <label>Preconditions</label>
                                        <div className="info-value">{viewingTestcase.testcase_precondition || "—"}</div>
                                      </div>
                                    </div>
                                    {viewingTestcase.steps?.length > 0 && (
                                      <div className="steps-wrapper">
                                        <label className="section-label">Test Steps</label>
                                        <table className="inner-steps-table">
                                          <thead>
                                            <tr>
                                              <th style={{ width: "40px" }}>#</th>
                                              <th>Action</th>
                                              <th>Expected Result</th>
                                            </tr>
                                          </thead>
                                          <tbody>
                                            {viewingTestcase.steps.map((step) => (
                                              <tr key={step.step_no}>
                                                <td>{step.step_no}</td>
                                                <td>{step.action}</td>
                                                <td>{step.expected_result}</td>
                                              </tr>
                                            ))}
                                          </tbody>
                                        </table>
                                      </div>
                                    )}
                                  </div>
                                </td>
                              </tr>
                            )}
                          </>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AssignTestCasesPage;
