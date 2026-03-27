/**
 * @file PlanTestCasesPage.jsx
 * @description Read-only view of all test cases assigned to a test plan,
 *              with expandable step details.
 */

/* eslint-disable */
import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getPlanById, getAssignedTestcases } from "../../api/testplansApi";
import { getBuildsByPlan } from "../../api/buildsApi";
import "./PlanTestCasesPage.css";

const PlanTestCasesPage = () => {
  const { planId } = useParams();
  const navigate   = useNavigate();

  const [testcases, setTestcases] = useState([]);
  const [planInfo, setPlanInfo] = useState(null);
  const [builds, setBuilds] = useState([]);
  const [expandedId, setExpandedId] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [planRes, buildRes, caseRes] = await Promise.all([
          getPlanById(planId),
          getBuildsByPlan(planId),
          getAssignedTestcases(planId),
        ]);
        setPlanInfo(planRes);
        setBuilds(buildRes);
        setTestcases(caseRes);
      } catch (err) {
        console.error(err);
      }
    };
    fetchData();
  }, [planId]);

  const toggleRow = (id) =>
    setExpandedId((prev) => (prev === id ? null : id));

  return (
    <div className="pt-page">
      {/* HEADER */}
      <div className="pt-header">
        <div className="pt-header-info">
          <h2 className="pt-title">{planInfo?.testplan_name || "Loading..."}</h2>
          <div className="pt-meta-row">
            <span className="meta-badge">
              Cases: <b>{testcases.length}</b>
            </span>
            <span className="meta-badge">
              Builds: <b>{builds.length}</b>
            </span>
          </div>
        </div>
        <div className="pt-header-actions">
          <button type="button" className="pt-btn-secondary" onClick={() => navigate(-1)}>
            ← Back
          </button>
          <button
            type="button"
            className="pt-btn-primary"
            onClick={() => navigate(`/assigntestcases/${planId}`)}
          >
            + Add / Assign
          </button>
        </div>
      </div>

      {/* CONTENT */}
      <div className="pt-body">
        <div className="pt-card">
          <div className="pt-table-wrapper">
            <table className="pt-table">
              <colgroup>
                <col style={{ width: "70px" }} />
                <col />
                <col style={{ width: "100px" }} />
                <col style={{ width: "100px" }} />
                <col style={{ width: "40px" }} />
              </colgroup>
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Test Case Name</th>
                  <th>Status</th>
                  <th>Importance</th>
                  <th />
                </tr>
              </thead>
              <tbody>
                {testcases.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="empty-row">
                      No test cases assigned.
                    </td>
                  </tr>
                ) : (
                  testcases.map((tc) => {
                    const isExpanded = expandedId === tc.id;
                    return (
                      <>
                        <tr
                          key={tc.id}
                          className={`pt-row ${isExpanded ? "expanded" : ""}`}
                          onClick={() => toggleRow(tc.id)}
                          style={{ cursor: "pointer" }}
                        >
                          <td className="id-cell">TC-{tc.id}</td>
                          <td className="name-cell">{tc.testcase_name}</td>
                          <td>
                            <span className={`status-badge ${tc.testcase_status?.toLowerCase() || "not-run"}`}>
                              {tc.testcase_status || "Not Run"}
                            </span>
                          </td>
                          <td>
                            <span className={`importance-text ${tc.testcase_importance?.toLowerCase()}`}>
                              {tc.testcase_importance}
                            </span>
                          </td>
                          <td className="expand-cell">{isExpanded ? "▼" : "▶"}</td>
                        </tr>

                        {isExpanded && (
                          <tr className="pt-detail-row">
                            <td colSpan={5}>
                              <div className="pt-detail-panel">
                                <div className="info-grid">
                                  <div className="info-block">
                                    <label>Summary</label>
                                    <div className="info-value">
                                      {tc.testcase_summary || "No summary provided."}
                                    </div>
                                  </div>
                                  <div className="info-block">
                                    <label>Precondition</label>
                                    <div className="info-value">
                                      {tc.testcase_precondition || "No specific preconditions."}
                                    </div>
                                  </div>
                                </div>

                                {tc.steps?.length > 0 && (
                                  <div className="steps-container">
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
                                        {tc.steps.map((step) => (
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
        </div>
      </div>
    </div>
  );
};

export default PlanTestCasesPage;
