/**
 * @file PlanHistoryReport.jsx
 * @description Execution history report per sprint, with Excel export.
 */

/* eslint-disable */
import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { getSprints } from "../../api/sprintsApi";
import { getPlanHistoryReport } from "../../api/reportsApi";
import { exportToExcel } from "../../utils/excelExport";
import toast from "react-hot-toast";
import { useProject } from "../../context/ProjectContext";
import "./PlanHistoryReport.css";

const PlanHistoryReport = () => {
  const { projectId } = useParams();
  const { activeProject } = useProject();
  const targetProjectId = projectId || activeProject?.id;

  const [sprints, setSprints] = useState([]);
  const [selectedSprintId, setSelectedSprintId] = useState("");
  const [reportData, setReportData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const [expandedBuilds, setExpandedBuilds] = useState({});
  const [expandedTCs, setExpandedTCs] = useState({});
  const [expandedIssues, setExpandedIssues] = useState({});

  const getSprintName = (s) => s?.sprint_name || s?.sprint?.sprint_name || s?.sprint?.name || s?.testplan_name || `Sprint #${s?.id}`;

  useEffect(() => {
    if (!targetProjectId) return;
    getSprints(targetProjectId)
      .then((data) => {
        const list = Array.isArray(data) ? data : [];
        setSprints(list);
      })
      .catch((err) => console.error("Error fetching sprints:", err));
  }, [targetProjectId]);

  const handleSprintSelect = async (e) => {
    const sprintSelectionId = e.target.value;
    setSelectedSprintId(sprintSelectionId);
    setReportData(null);
    setError(null);
    if (!sprintSelectionId) return;
    setLoading(true);
    try {
      const data = await getPlanHistoryReport(sprintSelectionId);
      setReportData(data);
      if (data.builds?.length > 0) {
        setExpandedBuilds({ [data.builds[0].build_id]: true });
        if (data.builds[0].issues?.length > 0) {
          setExpandedIssues({ [data.builds[0].build_id]: true });
        }
      }
    } catch {
      setError("Failed to load report data.");
    }
    setLoading(false);
  };

  const toggleBuild  = (id) => setExpandedBuilds((p)  => ({ ...p, [id]: !p[id] }));
  const toggleTC     = (id) => setExpandedTCs((p)     => ({ ...p, [id]: !p[id] }));
  const toggleIssue  = (id) => setExpandedIssues((p)  => ({ ...p, [id]: !p[id] }));

  const exportPlanHistoryToExcel = async () => {
    if (!reportData?.builds) { toast.error("No data to export"); return; }
    try {
      const excelData = [];
      const allTestcases = [];
      reportData.builds.forEach((build) => {
        build.executions?.forEach((exec) => {
          if (!allTestcases.find((tc) => tc.testcase_id === exec.testcase_id)) {
            allTestcases.push({ testcase_id: exec.testcase_id, testcase_name: exec.testcase_name });
          }
        });
      });

      allTestcases.forEach((tc) => {
        reportData.builds.forEach((build) => {
          const exec = build.executions?.find((e) => e.testcase_id === tc.testcase_id);
          if (exec?.steps?.length > 0) {
            exec.steps.forEach((step) => {
              const row = {
                "Test Case ID": tc.testcase_id, "Task ID": exec.task_id || "N/A",
                "Project Name": reportData.project_name || "", "Suite Name": exec.suite_name || "N/A",
                "Test Case Name": exec.testcase_name, "Steps Action": step.action || step.description || "",
                "Step Expected": step.expected_result || step.expected || "",
                "Step Actual": step.actual_result || step.actual || "",
                "Test Case Type": exec.testcase_type || "", "Test Case Status": exec.testcase_status || "",
                "Written By": exec.created_by || "N/A",
                "Written On": exec.created_at ? new Date(exec.created_at).toLocaleDateString() : "N/A",
              };
              reportData.builds.forEach((b) => {
                const be = b.executions?.find((e) => e.testcase_id === tc.testcase_id);
                const defect = b.issues?.find((iss) => iss.testcase_id === tc.testcase_id);
                row[`${b.build_version} - Executed By`] = be?.executed_by || "";
                row[`${b.build_version} - Executed Status`] = be?.status || "";
                row[`${b.build_version} - Defect ID`] = defect?.id || "";
                row[`${b.build_version} - Defect Description`] = defect?.title || "";
                row[`${b.build_version} - Defect Status`] = defect?.status || "";
                row[`${b.build_version} - Priority`] = defect?.priority || "";
              });
              excelData.push(row);
            });
          } else if (exec) {
            const row = {
              "Test Case ID": tc.testcase_id, "Task ID": exec.task_id || "N/A",
              "Project Name": reportData.project_name || "", "Suite Name": exec.suite_name || "N/A",
              "Test Case Name": exec.testcase_name, "Steps Action": "", "Step Expected": "", "Step Actual": "",
              "Test Case Type": exec.testcase_type || "", "Test Case Status": exec.testcase_status || "",
              "Written By": exec.created_by || "N/A",
              "Written On": exec.created_at ? new Date(exec.created_at).toLocaleDateString() : "N/A",
            };
            reportData.builds.forEach((b) => {
              const be = b.executions?.find((e) => e.testcase_id === tc.testcase_id);
              const defect = b.issues?.find((iss) => iss.testcase_id === tc.testcase_id);
              row[`${b.build_version} - Executed By`] = be?.executed_by || "";
              row[`${b.build_version} - Executed Status`] = be?.status || "";
              row[`${b.build_version} - Defect ID`] = defect?.id || "";
              row[`${b.build_version} - Defect Description`] = defect?.title || "";
              row[`${b.build_version} - Defect Status`] = defect?.status || "";
              row[`${b.build_version} - Priority`] = defect?.priority || "";
            });
            excelData.push(row);
          }
        });
      });

      if (excelData.length === 0) { toast.error("No execution data to export"); return; }
      const reportLabel = reportData.sprint_name || reportData.plan_name || selectedSprintId || "sprint";
      await exportToExcel(excelData, `Execution_History_${reportLabel}.xlsx`);
      toast.success("Report exported successfully!");
    } catch (err) {
      toast.error("Error exporting report: " + err.message);
    }
  };

  return (
    <div className="ph-container-full">
      {/* Header bar */}
      <div className="ph-header-bar no-print">
        <div className="ph-header-left">
          <h2>📊 Execution History Report</h2>
          <div className="ph-breadcrumbs">
            <span>{reportData?.project_name || "Project"}</span>
            <span className="sep">/</span>
            <span>{reportData?.sprint_name || reportData?.plan_name || "Sprint"}</span>
          </div>
        </div>
        <div className="ph-header-right">
          <select onChange={handleSprintSelect} value={selectedSprintId} className="ph-select-modern">
            <option value="">-- Select Sprint --</option>
            {sprints.map((s) => <option key={s.id} value={s.id}>{getSprintName(s)}</option>)}
          </select>
          {reportData?.builds?.length > 0 && (
            <button type="button" className="ph-export-btn" onClick={exportPlanHistoryToExcel}>
              📥 Export to Excel
            </button>
          )}
        </div>
      </div>

      {loading && <div className="ph-loading">Generating Report...</div>}
      {error   && <div className="ph-error">{error}</div>}

      {reportData && (
        <div className="ph-main-content">
          {(!reportData.builds || reportData.builds.length === 0) && (
            <div className="ph-empty-state">No execution history found for this sprint.</div>
          )}
          <div className="ph-build-stack">
            {reportData.builds?.map((build) => {
              const hasIssues  = build.issues?.length > 0;
              const isExpanded = expandedBuilds[build.build_id];
              return (
                <div key={build.build_id} className={`ph-build-block ${hasIssues ? "status-fail" : "status-pass"}`}>
                  <div className="ph-build-header-row" onClick={() => toggleBuild(build.build_id)} style={{ cursor: "pointer" }}>
                    <div className="ph-bhr-left">
                      <button type="button" className={`ph-toggle-btn ${isExpanded ? "open" : ""}`}>▼</button>
                      <div className="ph-build-title">
                        <h3>{build.build_version}</h3>
                        <span className="ph-build-date">Released: {build.release_date || "N/A"}</span>
                      </div>
                    </div>
                    <div className="ph-bhr-stats">
                      {hasIssues ? <span className="ph-pill danger">{build.issues.length} Defects</span> : <span className="ph-pill success">Clean Build</span>}
                      <span className="ph-pill neutral">{build.executions?.length || 0} Tests</span>
                    </div>
                  </div>

                  {isExpanded && (
                    <div className="ph-build-body">
                      {hasIssues && (
                        <div className="ph-section issues-section">
                          <div className="ph-section-header warning-bg" onClick={() => toggleIssue(build.build_id)} style={{ cursor: "pointer" }}>
                            <div className="ph-sh-title"><span>🚨 Known Defects</span><span className="ph-count-badge">{build.issues.length}</span></div>
                            <span className="ph-text-toggle">{expandedIssues[build.build_id] ? "Hide" : "Show"}</span>
                          </div>
                          {expandedIssues[build.build_id] && (
                            <div className="ph-table-wrapper">
                              <table className="ph-data-table issues-table">
                                <thead>
                                  <tr><th width="60px">ID</th><th width="80px">Task ID</th><th width="100px">Type</th><th>Title</th><th width="100px">Severity</th><th width="100px">Priority</th><th width="100px">Status</th><th width="120px">Created At</th></tr>
                                </thead>
                                <tbody>
                                  {build.issues.map((iss) => (
                                    <tr key={iss.id}>
                                      <td className="fw-bold">#{iss.id}</td>
                                      <td>{iss.task_id || "N/A"}</td>
                                      <td><span className={`type-tag ${iss.issue_type?.toLowerCase()}`}>{iss.issue_type || "BUG"}</span></td>
                                      <td>{iss.title}</td>
                                      <td><span className={`severity-tag ${iss.severity?.toLowerCase()}`}>{iss.severity}</span></td>
                                      <td><span className={`priority-tag ${iss.priority?.toLowerCase()}`}>{iss.priority}</span></td>
                                      <td><span className={`status-tag ${iss.status?.toLowerCase()}`}>{iss.status}</span></td>
                                      <td>{iss.created_at ? new Date(iss.created_at).toLocaleDateString() : "N/A"}</td>
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                            </div>
                          )}
                        </div>
                      )}

                      <div className="ph-section exec-section">
                        <div className="ph-section-header">🧪 Test Execution Log</div>
                        <div className="ph-exec-grid">
                          <div className="ph-exec-row header-row">
                            <div className="col-status">Status</div>
                            <div className="col-name">Test Case Name</div>
                            <div className="col-user">Executed By</div>
                            <div className="col-action">Details</div>
                          </div>
                          {build.executions?.map((exec, idx) => {
                            const uniqueId = `${build.build_id}-${exec.testcase_id}-${idx}`;
                            const isTcExpanded = expandedTCs[uniqueId];
                            const statusClass = exec.status?.toLowerCase();
                            return (
                              <div key={uniqueId} className="ph-exec-group">
                                <div className={`ph-exec-row ${statusClass}-border`} onClick={() => toggleTC(uniqueId)} style={{ cursor: "pointer" }}>
                                  <div className="col-status"><span className={`status-dot ${statusClass}`} /><span className={`status-text ${statusClass}`}>{exec.status}</span></div>
                                  <div className="col-name"><strong>{exec.testcase_name}</strong></div>
                                  <div className="col-user">{exec.executed_by}</div>
                                  <div className="col-action"><span className={`arrow ${isTcExpanded ? "down" : "right"}`}>›</span></div>
                                </div>
                                {isTcExpanded && (
                                  <div className="ph-exec-details">
                                    {exec.notes && <div className="ph-notes-box">📝 <strong>Notes:</strong> {exec.notes}</div>}
                                    <table className="ph-steps-table-full">
                                      <thead><tr><th width="50px">#</th><th>Action</th><th>Expected</th><th>Actual</th><th width="80px">Result</th></tr></thead>
                                      <tbody>
                                        {exec.steps?.map((s) => (
                                          <tr key={s.step_no} className={s.status === "Fail" ? "row-fail" : ""}>
                                            <td>{s.step_no}</td>
                                            <td>{s.description}</td>
                                            <td>{s.expected}</td>
                                            <td className="mono-font">{s.actual}</td>
                                            <td><span className={`step-badge ${s.status?.toLowerCase()}`}>{s.status}</span></td>
                                          </tr>
                                        ))}
                                      </tbody>
                                    </table>
                                  </div>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default PlanHistoryReport;
