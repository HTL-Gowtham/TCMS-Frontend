/**
 * @file RTMReport.jsx
 * @description Requirements Traceability Matrix — maps Task IDs to Test Cases by type.
 */

/* eslint-disable */
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { getTestcasesByProject } from "../../api/testcasesApi";
import { exportToExcel } from "../../utils/excelExport";
import { useProject } from "../../context/ProjectContext";
import toast from "react-hot-toast";
import "./RTMReport.css";

const RTMReport = () => {
  const { projectId } = useParams();
  const { activeProject } = useProject();
  const targetId = activeProject?.id || projectId;

  const [loading, setLoading]   = useState(false);
  const [rtmRows, setRtmRows]   = useState([]);
  const [error, setError]       = useState(null);

  /* ── 1. Fetch & process ─────────────────────────────────────── */
  useEffect(() => {
    if (!targetId) return;
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await getTestcasesByProject(targetId);
        if (Array.isArray(data)) {
          processRTMData(data);
        } else {
          setError("Invalid data format from server.");
        }
      } catch {
        setError("Failed to load Test Cases. Ensure the backend endpoint exists.");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [targetId]);

  /* ── 2. Pivot logic ─────────────────────────────────────────── */
  const processRTMData = (testCases) => {
    const grouped = {};
    testCases.forEach((tc) => {
      const rawTaskID = tc.task_id ? String(tc.task_id).trim() : "";
      const taskID = rawTaskID === "" ? "Unassigned" : rawTaskID;
      if (!grouped[taskID]) {
        grouped[taskID] = { task_id: taskID, Unit: [], Integration: [], System: [], Other: [] };
      }
      const type = (tc.testcase_type || "").toLowerCase();
      if      (type.includes("unit"))        grouped[taskID].Unit.push(tc);
      else if (type.includes("integration")) grouped[taskID].Integration.push(tc);
      else if (type.includes("system"))      grouped[taskID].System.push(tc);
      else                                   grouped[taskID].Other.push(tc);
    });

    const rows = Object.values(grouped).sort((a, b) => {
      if (a.task_id === "Unassigned") return 1;
      if (b.task_id === "Unassigned") return -1;
      return a.task_id.localeCompare(b.task_id, undefined, { numeric: true });
    });
    setRtmRows(rows);
  };

  /* ── 3. Excel export ────────────────────────────────────────── */
  const exportRTMToExcel = async () => {
    try {
      const excelData = rtmRows.map((row) => ({
        "Task ID":           row.task_id,
        "Unit Tests":        row.Unit.map((tc) => `TC-${tc.id}`).join(", ")        || "-",
        "Integration Tests": row.Integration.map((tc) => `TC-${tc.id}`).join(", ") || "-",
        "System Tests":      row.System.map((tc) => `TC-${tc.id}`).join(", ")      || "-",
        "Acceptance Tests":  row.Other.map((tc) => `TC-${tc.id}`).join(", ")       || "-",
      }));
      await exportToExcel(excelData, "RTM_Report.xlsx");
      toast.success("RTM Report exported successfully!");
    } catch (err) {
      toast.error("Error exporting to Excel: " + err.message);
    }
  };

  /* ── 4. Render helpers ──────────────────────────────────────── */
  const renderBadges = (list, typeClass) => {
    if (!list || list.length === 0) return <span className="empty-dash">-</span>;
    return (
      <div className="id-container">
        {list.map((tc) => (
          <span key={tc.id} className={`tc-badge ${typeClass}`} title={tc.testcase_name}>
            TC-{tc.id}
          </span>
        ))}
      </div>
    );
  };

  /* ── 5. View ────────────────────────────────────────────────── */
  if (!targetId) {
    return <div className="rtm-page"><div className="empty-state">Select a project to view the RTM.</div></div>;
  }

  return (
    <div className="rtm-page">
      <div className="content-card">
        {/* Header */}
        <div className="header-row">
          <h3>📊 Requirements Traceability Matrix</h3>
          {activeProject && <div className="meta-badge">{activeProject.project_name}</div>}
          {!loading && !error && rtmRows.length > 0 && (
            <button type="button" className="export-btn" onClick={exportRTMToExcel} title="Export to Excel">
              📥 Export to Excel
            </button>
          )}
        </div>

        {loading && <div className="loading">Generating Matrix...</div>}

        {error && (
          <div className="error-box">
            <p>❌ {error}</p>
            <small>Check console for details.</small>
          </div>
        )}

        {!loading && !error && (
          <div className="rtm-table-wrapper">
            <table className="rtm-table">
              <thead>
                <tr>
                  <th className="th-task">Task ID</th>
                  <th className="th-type">Unit Tests</th>
                  <th className="th-type">Integration Tests</th>
                  <th className="th-type">System Tests</th>
                  <th className="th-type">Acceptance Tests</th>
                </tr>
              </thead>
              <tbody>
                {rtmRows.length === 0 ? (
                  <tr><td colSpan="5" className="empty-row">No Test Cases found for this project.</td></tr>
                ) : (
                  rtmRows.map((row) => (
                    <tr key={row.task_id}>
                      <td className="task-id-cell">{row.task_id}</td>
                      <td>{renderBadges(row.Unit,        "unit")}</td>
                      <td>{renderBadges(row.Integration, "integration")}</td>
                      <td>{renderBadges(row.System,      "system")}</td>
                      <td>{renderBadges(row.Other,       "other")}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default RTMReport;
