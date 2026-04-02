/**
 * @file ExecutionPage.jsx
 * @description Test execution runner with step-level pass/fail/skip and build finalization.
 *
 * URL shape: /execution/<projectId>/<sprintId>/<buildId>/<testcaseId>
 * All IDs parsed via useExecutionParams() hook — zero useParams() dependency.
 *
 * VAPT: No hardcoded URLs. All axios calls via executionApi, sprintsApi, buildsApi.
 */

/* eslint-disable */
import { useState, useEffect, useMemo, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { useProject } from "../../context/ProjectContext";
import useExecutionParams from "../../hooks/useExecutionParams";
import { getSprints } from "../../api/sprintsApi";
import { getBuildsByPlan, closeBuild } from "../../api/buildsApi";
import { getAssignedTestcases } from "../../api/testplansApi";
import {
  getExecutionResults,
  getExecutionSteps,
  getExecutionIssue,
  saveExecution,
  getNextBugId,
} from "../../api/executionApi";
import { getTestcaseById } from "../../api/testcasesApi";
import "./ExecutionPage.css";

// ── Finalize Modal ────────────────────────────────────────
const FinalizeModal = ({ isOpen, onClose, onConfirm, unexecutedCount, hasFailures }) => {
  if (!isOpen) return null;
  return (
    <dialog className="modal-overlay" open>
      <div className="modal-content">
        <h3>🔒 Finalize Execution Cycle</h3>
        <div className="modal-body">
          {unexecutedCount > 0 && (
            <div className="warning-box">
              ⚠️ <strong>Warning:</strong> {unexecutedCount} test case(s) have NOT been run.
            </div>
          )}
          {hasFailures ? (
            <p className="status-fail-text">❌ Build has <strong>FAILURES</strong>.</p>
          ) : (
            <p className="status-pass-text">✅ All tests Passed! Release Candidate.</p>
          )}
          <p>Close this build? (Cannot be undone)</p>
        </div>
        <div className="modal-actions">
          <button type="button" className="btn-cancel" onClick={onClose}>Cancel</button>
          <button type="button" className="btn-confirm-danger" onClick={onConfirm}>Yes, Close Build</button>
        </div>
      </div>
    </dialog>
  );
};

// ── Main Component ────────────────────────────────────────
const ExecutionPage = () => {
  const navigate = useNavigate();
  const { activeProject } = useProject();
  const { projectId: urlProjectId, sprintId: urlSprintId, planId, buildId, testcaseId } = useExecutionParams();
  const projectId = urlProjectId || String(activeProject?.id || "");
  const sprintId = urlSprintId || planId;

  const [sprints,   setSprints]   = useState([]);
  const [builds,    setBuilds]    = useState([]);
  const [testcases, setTestcases] = useState([]);
  const [selectedTC, setSelectedTC] = useState(null);

  const [notes,             setNotes]            = useState("");
  const [overallAttachment, setOverallAttachment] = useState(null);
  const [executionDate,     setExecutionDate]     = useState("");
  const [issueTitle,        setIssueTitle]        = useState("");
  const [issueDescription,  setIssueDescription]  = useState("");
  const [issueType,         setIssueType]         = useState("BUG");
  const [issueStatus,       setIssueStatus]       = useState("OPEN");
  const [issueSeverity,     setIssueSeverity]     = useState("Medium");
  const [issuePriority,     setIssuePriority]     = useState("Medium");
  const [issueTaskId,       setIssueTaskId]       = useState("");
  const [showFinalizeModal, setShowFinalizeModal] = useState(false);

  const updateUrl = useCallback((proj, sprint, build, tc) => {
    const path = ["/execution", proj, sprint, build, tc]
      .map((s) => s || "")
      .join("/")
      .replace(/\/+$/, "");
    navigate(path);
  }, [navigate]);

  const selectedBuild = useMemo(() => builds.find((b) => b.id == buildId) || null, [builds, buildId]);
  const isLocked = selectedBuild ? !selectedBuild.build_open : false;

  const currentStatus = useMemo(() => {
    if (!selectedTC?.steps?.length) return "Not Run";
    if (selectedTC.steps.some((s) => s.status === "Fail")) return "Fail";
    if (selectedTC.steps.every((s) => s.status === "Pass" || s.status === "Skipped")) return "Pass";
    return "Not Run";
  }, [selectedTC]);

  const executionStats = useMemo(() => ({
    unexecuted: testcases.filter((tc) => tc.status === "Not Run").length,
    hasFailures: testcases.some((tc) => tc.status === "Fail"),
  }), [testcases]);

  const getSprintName = (s) => s?.sprint_name || s?.sprint?.sprint_name || s?.sprint?.name || s?.testplan_name || `Sprint #${s?.id}`;

  // 1. Load sprints
  useEffect(() => {
    if (!activeProject?.id) return;
    getSprints(activeProject.id)
      .then((data) => setSprints(data || []))
      .catch((err) => console.error("Sprints load error:", err));
  }, [activeProject?.id]);

  // 2. Load builds when sprint changes
  useEffect(() => {
    if (!sprintId) { setBuilds([]); setTestcases([]); return; }
    getBuildsByPlan(sprintId)
      .then((data) => {
        const active = (data || []).filter((b) => b.build_active);
        setBuilds(active);
        if (active.length === 0) { setTestcases([]); return; }
        if (!buildId) {
          const latest = [...active].sort((a, b) => b.id - a.id)[0];
          updateUrl(projectId, sprintId, String(latest.id), "");
        }
      })
      .catch((err) => console.error("Builds load error:", err));
  }, [sprintId]); // eslint-disable-line react-hooks/exhaustive-deps

  // 3. Load test cases when build changes
  useEffect(() => {
    if (!sprintId || !buildId) { setTestcases([]); return; }
    const fetchTCs = async () => {
      try {
        const [tcRes, resRes] = await Promise.all([
          getAssignedTestcases(sprintId),
          getExecutionResults(sprintId, buildId),
        ]);
        const merged = (tcRes || []).map((tc) => {
          const saved = (resRes || []).find((r) => r.testcase_id === tc.id);
          return { ...tc, status: saved ? saved.status : "Not Run", savedData: saved };
        });
        setTestcases(merged);
      } catch (err) {
        console.error("Test-case load error:", err);
      }
    };
    fetchTCs();
  }, [sprintId, buildId]);

  // 4. Load single test case detail
  useEffect(() => {
    if (!testcaseId || testcases.length === 0) { setSelectedTC(null); return; }
    const load = async () => {
      try {
        const staticData = await getTestcaseById(testcaseId);
        const savedCtx = testcases.find((t) => t.id == testcaseId)?.savedData;

        setNotes(savedCtx?.notes || "");
        setExecutionDate(savedCtx?.executed_at ? new Date(savedCtx.executed_at).toLocaleString() : "");
        setIssueTitle(""); setIssueDescription(""); setIssueTaskId(staticData.task_id || "");
        setIssueType("BUG"); setIssueStatus("OPEN"); setIssueSeverity("Medium"); setIssuePriority("Medium");

        let savedSteps = [];
        if (savedCtx?.id) {
          try {
            savedSteps = await getExecutionSteps(savedCtx.id);
            if (savedCtx.status === "Fail") {
              const issue = await getExecutionIssue(savedCtx.id);
              if (issue) {
                setIssueTitle(issue.title || "");
                setIssueDescription(issue.description || "");
                setIssueTaskId(issue.task_id || "");
                setIssueType(issue.issue_type || "BUG");
                setIssueStatus(issue.status || "OPEN");
                setIssueSeverity(issue.severity || "Medium");
                setIssuePriority(issue.priority || "Medium");
              }
            }
          } catch (e) { console.warn("Detail fetch warning:", e); }
        }

        const mergedSteps = (staticData.steps || []).map((step) => {
          const result = savedSteps.find((s) => s.step_no === step.step_no);
          return { ...step, actual_result: result?.actual_result || "", status: result?.status || "" };
        });

        setSelectedTC({ ...staticData, steps: mergedSteps });
      } catch (err) { console.error("TC detail error:", err); }
    };
    load();
  }, [testcaseId, testcases]);

  // 5. Auto-fetch next bug ID when status becomes Fail and no issue task ID is set yet
  useEffect(() => {
    if (currentStatus === "Fail" && !issueTaskId) {
      getNextBugId()
        .then((data) => setIssueTaskId(data?.next_bug_id || data?.bug_id || data?.id || ""))
        .catch((err) => console.warn("Could not fetch next bug ID:", err));
    }
  }, [currentStatus]); // eslint-disable-line react-hooks/exhaustive-deps

  const updateStep = (index, field, val) => {
    if (isLocked) return;
    setSelectedTC((prev) => {
      if (!prev) return null;
      const steps = [...prev.steps];
      steps[index] = { ...steps[index], [field]: val };
      if (field === "status" && val === "Fail") {
        for (let i = index + 1; i < steps.length; i++) {
          steps[i] = { ...steps[i], status: "Skipped", actual_result: "Skipped due to previous failure" };
        }
      }
      return { ...prev, steps };
    });
  };

  const handleSave = async (moveNext) => {
    if (!selectedTC || !buildId) return;
    if (selectedTC.steps.some((s) => !s.status)) { toast.error("Please set a Status for all steps."); return; }
    if (currentStatus === "Fail" && !issueDescription.trim()) { toast.error("Failure requires an Issue Description."); return; }

    const formData = new FormData();
    formData.append("testcase_id", selectedTC.id);
    formData.append("status", currentStatus);
    formData.append("notes", notes);
    formData.append("steps", JSON.stringify(selectedTC.steps.map((s) => ({
      step_no: s.step_no, action: s.action, expected_result: s.expected_result,
      actual_result: s.actual_result || "", status: s.status,
    }))));

    if (currentStatus === "Fail") {
      const userId = JSON.parse(localStorage.getItem("user") || "{}")?.user_id;
      formData.append("create_issue",      "true");
      formData.append("issue_testcase_id", selectedTC.id);
      formData.append("issue_title",       issueTitle || `Fail: ${selectedTC.testcase_name}`);
      formData.append("issue_description", issueDescription);
      formData.append("issue_type",        issueType);
      formData.append("issue_status",      issueStatus);
      formData.append("issue_severity",    issueSeverity);
      formData.append("issue_priority",    issuePriority);
      formData.append("issue_task_id",     issueTaskId);
      if (userId) formData.append("created_by_id", userId);
    }
    if (overallAttachment) formData.append("attachment", overallAttachment);

    try {
      await saveExecution(sprintId, buildId, formData);
      setTestcases((prev) => prev.map((t) => t.id === selectedTC.id ? { ...t, status: currentStatus } : t));
      toast.success("Saved!");
      if (moveNext) {
        const idx = testcases.findIndex((t) => t.id === selectedTC.id);
        if (idx !== -1 && idx < testcases.length - 1) {
          updateUrl(projectId, sprintId, buildId, testcases[idx + 1].id);
        }
      }
    } catch (err) {
      toast.error("Save Failed: " + (err.response?.data?.detail || err.message));
    }
  };

  const handleFinalize = async () => {
    try {
      await closeBuild(buildId);
      globalThis.location.reload();
    } catch { toast.error("Failed to close build."); }
  };

  if (!activeProject) return <div className="tp-page empty-msg">Please select a project.</div>;

  return (
    <div className="tp-page">
      <FinalizeModal
        isOpen={showFinalizeModal}
        onClose={() => setShowFinalizeModal(false)}
        onConfirm={handleFinalize}
        unexecutedCount={executionStats.unexecuted}
        hasFailures={executionStats.hasFailures}
      />

      <div className="execution-body">
        {/* LEFT: Test Case List */}
        <div className="execution-left">
          <h3>Test Execution</h3>
          <div className="tc-list-scroll">
            {testcases.length === 0 ? (
              <div className="empty-msg-box">
                {!sprintId ? "Select a sprint to begin." : builds.length === 0 ? "No Builds found. Create one in Sprints." : "No Test Cases assigned to this sprint."}
              </div>
            ) : (
              testcases.map((tc) => (
                <div
                  key={tc.id}
                  className={`exec-tc-item ${testcaseId == tc.id ? "active" : ""}`}
                  onClick={() => updateUrl(projectId, sprintId, buildId, tc.id)}
                  style={{ cursor: "pointer" }}
                >
                  <span className="tc-name">{tc.testcase_name}</span>
                  <span className={`status-pill ${tc.status?.toLowerCase().replace(/\s/g, "")}`}>
                    {tc.status}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>

        {/* RIGHT: Execution Panel */}
        <div className="execution-right">
          {/* Top bar: selectors */}
          <div className="top-bar">
            <div className="selectors">
              <select value={sprintId || ""} onChange={(e) => updateUrl(activeProject.id, e.target.value, "", "")}>
                <option value="">Select Sprint...</option>
                {sprints.map((s) => <option key={s.id} value={s.id}>{getSprintName(s)}</option>)}
              </select>
              <select value={buildId || ""} disabled={!sprintId || builds.length === 0} onChange={(e) => updateUrl(activeProject.id, sprintId, e.target.value, "")}>
                <option value="">{builds.length === 0 && sprintId ? "No builds available" : "Select Build..."}</option>
                {builds.map((b) => <option key={b.id} value={b.id}>{b.build_version} {b.build_open ? "" : "(Closed)"}</option>)}
              </select>
            </div>
            {selectedBuild?.build_open && (
              <button type="button" className="btn-finalize" onClick={() => setShowFinalizeModal(true)}>
                🔒 Finalize
              </button>
            )}
          </div>

          {/* Main content */}
          {!selectedTC ? (
            <div className="empty-content">Select a Test Case to Execute</div>
          ) : (
            <div className="form-scroll-area">
              <div className="tc-header">
                <h2>{selectedTC.testcase_name}</h2>
                {executionDate && <span className="date-badge">📅 {executionDate}</span>}
                {isLocked && <span className="locked-badge">🔒 Build Closed — Read Only</span>}
              </div>

              {/* Steps table */}
              <table className="steps-exec-table">
                <thead>
                  <tr>
                    <th width="40">#</th>
                    <th width="25%">Action</th>
                    <th width="25%">Expected</th>
                    <th>Actual Result</th>
                    <th width="110">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {selectedTC.steps.map((step, idx) => (
                    <tr key={idx} className={step.status === "Fail" ? "step-fail" : ""}>
                      <td>{step.step_no}</td>
                      <td>{step.action}</td>
                      <td>{step.expected_result}</td>
                      <td>
                        <textarea disabled={isLocked} value={step.actual_result} onChange={(e) => updateStep(idx, "actual_result", e.target.value)} placeholder="Actual result..." />
                      </td>
                      <td>
                        <select disabled={isLocked} value={step.status} onChange={(e) => updateStep(idx, "status", e.target.value)} className={`status-select ${step.status?.toLowerCase()}`}>
                          <option value="">--</option>
                          <option value="Pass">Pass</option>
                          <option value="Fail">Fail</option>
                          <option value="Skipped">Skip</option>
                        </select>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {/* Footer */}
              <div className="footer-panel">
                <div className="footer-grid">
                  <div className="footer-item">
                    <label>Overall Status</label>
                    <div className={`status-display ${currentStatus.toLowerCase().replace(/\s/g, "")}`}>{currentStatus}</div>
                  </div>
                  <div className="footer-item grow">
                    <label>Notes</label>
                    <input disabled={isLocked} value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Overall notes..." />
                  </div>
                  <div className="footer-item">
                    <label>Attachment</label>
                    <input type="file" disabled={isLocked} onChange={(e) => setOverallAttachment(e.target.files[0] || null)} />
                  </div>
                </div>

                {currentStatus === "Fail" && (
                  <div className="issue-panel">
                    <div className="issue-row">
                      <div className="issue-item"><label className="issue-label">Task ID</label><input disabled type="text" value={issueTaskId} className="issue-input" placeholder="Auto-populated" /></div>
                      <div className="issue-item"><label className="issue-label">Title</label><input disabled={isLocked} type="text" value={issueTitle} onChange={(e) => setIssueTitle(e.target.value)} className="issue-input" placeholder="Issue title..." /></div>
                    </div>
                    <label className="issue-label">Description</label>
                    <textarea disabled={isLocked} value={issueDescription} onChange={(e) => setIssueDescription(e.target.value)} className="issue-input" placeholder="Describe the bug..." />
                    <div className="issue-row">
                      <select disabled={isLocked} value={issueType} onChange={(e) => setIssueType(e.target.value)}><option value="BUG">Bug</option><option value="ENHANCEMENT">Enhancement</option><option value="TASK">Task</option></select>
                      <select disabled={isLocked} value={issueStatus} onChange={(e) => setIssueStatus(e.target.value)}><option value="OPEN">Open</option><option value="IN_PROGRESS">In Progress</option><option value="RESOLVED">Resolved</option><option value="CLOSED">Closed</option></select>
                      <select disabled={isLocked} value={issueSeverity} onChange={(e) => setIssueSeverity(e.target.value)}><option>Low</option><option>Medium</option><option>High</option><option>Critical</option></select>
                      <select disabled={isLocked} value={issuePriority} onChange={(e) => setIssuePriority(e.target.value)}><option>Low</option><option>Medium</option><option>High</option></select>
                    </div>
                  </div>
                )}

                {!isLocked && (
                  <div className="btn-row">
                    <button type="button" className="btn-save" onClick={() => handleSave(false)}>💾 Save</button>
                    <button type="button" className="btn-next" onClick={() => handleSave(true)}>Save &amp; Next →</button>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ExecutionPage;
