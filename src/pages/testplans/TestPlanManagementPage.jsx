/**
 * @file TestPlanManagementPage.jsx
 * @description Lists all test plans for the active project with accordion builds.
 *
 * Create Plan modal is triggered from Navigator via isPlanModalOpen from Outlet context.
 * Search is also provided via Outlet context.
 */

/* eslint-disable */
import { useEffect, useState } from "react";
import { useNavigate, useOutletContext } from "react-router-dom";
import toast from "react-hot-toast";
import { useProject } from "../../context/ProjectContext";
import {
  getPlansByProject,
  createPlan,
  updatePlan,
  deletePlan,
} from "../../api/testplansApi";
import {
  getBuildsByPlan,
  createBuild,
  updateBuild,
  deleteBuild,
} from "../../api/buildsApi";
import ConfirmModal from "../../components/ui/ConfirmModal";
import "./TestPlanManagementPage.css";

const formatDate = (iso) => {
  if (!iso) return "";
  const [y, m, d] = iso.split("-");
  return `${d}/${m}/${y}`;
};

const TODAY = new Date().toISOString().split("T")[0];

const EMPTY_PLAN = {
  testplan_name: "", plandesc_name: "", plandesc_pmtid: "",
  plandesc_tested: "", plandesc_nottested: "", plandesc_references: "",
  plandesc_esttime: "", plan_active: true,
};

const EMPTY_BUILD = {
  build_version: "", build_desc: "",
  build_releaseDate: TODAY,
  build_active: true, build_open: true,
};

const TestPlanManagementPage = () => {
  const navigate = useNavigate();
  const { isPlanModalOpen, setPlanModalOpen, searchQuery } = useOutletContext() || {};
  const { activeProject } = useProject();

  const [testplans, setTestPlans] = useState([]);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [buildsCache, setBuildsCache] = useState({});
  const [expandedPlanId, setExpandedPlanId] = useState(null);
  const [actionMenuOpenId, setActionMenuOpenId] = useState(null);
  const [activeBuildMenu, setActiveBuildMenu] = useState(null);

  // Modals
  const [showEditPlanModal, setShowEditPlanModal] = useState(false);
  const [showBuildModal, setShowBuildModal] = useState(false);
  const [showEditBuildModal, setShowEditBuildModal] = useState(false);
  const [selectedPlanForAction, setSelectedPlanForAction] = useState(null);
  const [editPlanData, setEditPlanData] = useState({});
  const [editBuildData, setEditBuildData] = useState({});
  const [newPlan, setNewPlan] = useState({ ...EMPTY_PLAN });
  const [newBuild, setNewBuild] = useState({ ...EMPTY_BUILD });

  // Confirm modal
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [confirmConfig, setConfirmConfig] = useState({ message: "", onConfirm: () => {} });
  const openConfirm = (message, onConfirm) => { setConfirmConfig({ message, onConfirm }); setConfirmOpen(true); };
  const closeConfirm = () => setConfirmOpen(false);

  const currentProjectId = activeProject?.id;

  // Close dropdowns on outside click
  useEffect(() => {
    const close = () => { setActionMenuOpenId(null); setActiveBuildMenu(null); };
    document.addEventListener("click", close);
    return () => document.removeEventListener("click", close);
  }, []);

  // Fetch plans when project changes
  const fetchPlans = async (pid) => {
    try {
      const data = await getPlansByProject(pid);
      setTestPlans(data);
    } catch { console.error("Failed to fetch plans"); }
  };

  const fetchBuilds = async (planId) => {
    try {
      const data = await getBuildsByPlan(planId);
      setBuildsCache((prev) => ({ ...prev, [planId]: data }));
    } catch { console.error("Failed to fetch builds"); }
  };

  useEffect(() => {
    if (currentProjectId) {
      fetchPlans(currentProjectId);
      setSelectedPlan(null);
      setExpandedPlanId(null);
    } else {
      setTestPlans([]);
    }
  }, [currentProjectId]);

  // ── Plan Handlers ────────────────────────────────────────
  const handleCreatePlan = async () => {
    if (!newPlan.testplan_name.trim()) { toast.error("Plan Name Required"); return; }
    try {
      await createPlan({ ...newPlan, project_id: activeProject.id });
      toast.success("Test Plan Created!");
      if (setPlanModalOpen) setPlanModalOpen(false);
      setNewPlan({ ...EMPTY_PLAN });
      fetchPlans(activeProject.id);
    } catch { toast.error("Failed to create plan"); }
  };

  const handleUpdatePlan = async () => {
    try {
      await updatePlan(editPlanData.id, editPlanData);
      toast.success("Test Plan Updated!");
      setShowEditPlanModal(false);
      fetchPlans(activeProject.id);
    } catch { toast.error("Failed to update plan"); }
  };

  const handleDeletePlan = (e, planId) => {
    if (e) e.stopPropagation();
    openConfirm("Delete this Test Plan AND all its Builds?", async () => {
      closeConfirm();
      try {
        await deletePlan(planId);
        toast.success("Test Plan Deleted");
        if (selectedPlan?.id === planId) { setSelectedPlan(null); }
        fetchPlans(activeProject.id);
      } catch { toast.error("Failed to delete plan"); }
    });
  };

  // ── Build Handlers ───────────────────────────────────────
  const handleCreateBuild = async () => {
    if (!newBuild.build_version) { toast.error("Build Title Required"); return; }
    try {
      const targetPlanId = selectedPlanForAction?.id || selectedPlan?.id;
      await createBuild(targetPlanId, { ...newBuild });
      toast.success("Build Created!");
      setShowBuildModal(false);
      setNewBuild({ ...EMPTY_BUILD });
      fetchBuilds(targetPlanId);
      if (selectedPlanForAction) setExpandedPlanId(targetPlanId);
    } catch { toast.error("Failed to create build"); }
  };

  const handleUpdateBuild = async () => {
    try {
      await updateBuild(editBuildData.id, editBuildData);
      toast.success("Build Updated!");
      setShowEditBuildModal(false);
      const pid = selectedPlanForAction?.id || selectedPlan?.id;
      fetchBuilds(pid);
    } catch { toast.error("Failed to update build"); }
  };

  const handleDeleteBuild = (buildId, planId) => {
    openConfirm("Delete this Build?", async () => {
      closeConfirm();
      try {
        await deleteBuild(buildId);
        toast.success("Build Deleted");
        fetchBuilds(planId || selectedPlan?.id);
      } catch { toast.error("Failed to delete build"); }
    });
  };

  const toggleActionMenu = (e, planId) => {
    e.stopPropagation();
    setActionMenuOpenId((prev) => (prev === planId ? null : planId));
  };

  const handleShowBuilds = (e, plan) => {
    e.stopPropagation();
    if (expandedPlanId === plan.id) { setExpandedPlanId(null); }
    else { setExpandedPlanId(plan.id); fetchBuilds(plan.id); }
  };

  // Search filter
  const filteredPlans = testplans.filter((p) => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      (p.testplan_name   || "").toLowerCase().includes(q) ||
      (p.plandesc_pmtid  || "").toLowerCase().includes(q) ||
      (p.plandesc_name   || "").toLowerCase().includes(q)
    );
  });

  if (!activeProject) {
    return (
      <div className="tp-page" style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "80vh", color: "#9ca3af" }}>
        <h2>Please select a project from the header to manage test plans.</h2>
      </div>
    );
  }

  return (
    <div className="tp-page">
      <ConfirmModal isOpen={confirmOpen} message={confirmConfig.message} onConfirm={confirmConfig.onConfirm} onCancel={closeConfirm} />

      <div className="tp-content-area">
        <div className="tp-section">
          {filteredPlans.length === 0 ? (
            <p style={{ padding: "20px" }}>No Plans found.</p>
          ) : (
            <table className="tp-table">
              <thead className="tp-table-title">
                <tr>
                  <th style={{ width: "200px" }}>Plan Name</th>
                  <th>Desc. Name</th>
                  <th style={{ width: "100px" }}>AL PMT ID</th>
                  <th>Features Tested</th>
                  <th>Features Not Tested</th>
                  <th>References</th>
                  <th>Est. Time (hr)</th>
                  <th style={{ width: "80px" }}>Active</th>
                  <th style={{ width: "150px" }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredPlans.map((p) => (
                  <>
                    <tr
                      key={p.id}
                      className={`tp-plan-row ${selectedPlan?.id === p.id ? "tp-row-selected" : ""} ${expandedPlanId === p.id ? "active-plan" : ""}`}
                      onClick={() => setSelectedPlan(p)}
                      style={{ cursor: "pointer" }}
                    >
                      <td>{p.testplan_name}</td>
                      <td>{p.plandesc_name}</td>
                      <td>{p.plandesc_pmtid}</td>
                      <td>{p.plandesc_tested}</td>
                      <td>{p.plandesc_nottested}</td>
                      <td>{p.plandesc_references}</td>
                      <td>{p.plandesc_esttime}</td>
                      <td>{p.plan_active ? "Yes" : "No"}</td>
                      <td className="tp-action-cell">
                        <div className="tp-action-wrapper">
                          <button
                            type="button"
                            className={`btn-builds ${expandedPlanId === p.id ? "active" : ""}`}
                            onClick={(e) => handleShowBuilds(e, p)}
                          >
                            Builds {expandedPlanId === p.id ? "↑" : "↓"}
                          </button>
                          <button
                            type="button"
                            className="tp-dots-btn"
                            onClick={(e) => toggleActionMenu(e, p.id)}
                          >
                            •••
                          </button>
                          {actionMenuOpenId === p.id && (
                            <div className="action-menu-dropdown" onClick={(e) => e.stopPropagation()}>
                              <div className="menu-item" onClick={(e) => { e.stopPropagation(); setEditPlanData(p); setShowEditPlanModal(true); setActionMenuOpenId(null); }}>
                                <span className="icon">✏️</span> Edit
                              </div>
                              <div className="menu-item" onClick={() => { navigate(`/assigntestcases/${p.id}`); setActionMenuOpenId(null); }}>
                                <span className="icon">👤</span> Assign Cases
                              </div>
                              <div className="menu-item" onClick={() => { navigate(`/plantestcases/${p.id}`); setActionMenuOpenId(null); }}>
                                <span className="icon">👁</span> View Cases
                              </div>
                              <div className="menu-divider" />
                              <div className="menu-item delete-item" onClick={(e) => handleDeletePlan(e, p.id)}>
                                <span className="icon">🗑</span> Delete
                              </div>
                            </div>
                          )}
                        </div>
                      </td>
                    </tr>

                    {/* Expanded builds accordion */}
                    {expandedPlanId === p.id && (
                      <tr className="tp-builds-row-container">
                        <td colSpan={9} className="tp-builds-wrapper">
                          <div className="tp-builds-inner">
                            <table className="builds-table">
                              <thead>
                                <tr>
                                  <th>Build Title</th>
                                  <th>Notes</th>
                                  <th>Release Date</th>
                                  <th>Active</th>
                                  <th>Open</th>
                                  <th className="build-header-btn-cell">
                                    <button type="button" className="btn-add-build-solid" onClick={() => { setSelectedPlanForAction(p); setShowBuildModal(true); }}>
                                      + Add Build
                                    </button>
                                  </th>
                                </tr>
                              </thead>
                              <tbody>
                                {(!buildsCache[p.id] || buildsCache[p.id].length === 0) ? (
                                  <tr><td colSpan={6} style={{ textAlign: "center", padding: "20px", fontStyle: "italic", color: "#64748b" }}>No builds found. Add one to get started.</td></tr>
                                ) : (
                                  buildsCache[p.id].map((b) => (
                                    <tr key={b.id}>
                                      <td>{b.build_version}</td>
                                      <td>{b.build_desc}</td>
                                      <td>{formatDate(b.build_releaseDate)}</td>
                                      <td>{b.build_active ? "Yes" : "No"}</td>
                                      <td>{b.build_open ? "Yes" : "No"}</td>
                                      <td className="tp-action-cell">
                                        <div className="tp-action-wrapper">
                                          <button type="button" className="tp-dots-btn" onClick={(e) => { e.stopPropagation(); setActiveBuildMenu(activeBuildMenu === b.id ? null : b.id); }}>...</button>
                                          {activeBuildMenu === b.id && (
                                            <div className="action-menu-dropdown">
                                              <div className="menu-item" onClick={(e) => { e.stopPropagation(); setEditBuildData(b); setSelectedPlanForAction(p); setShowEditBuildModal(true); setActiveBuildMenu(null); }}>Edit</div>
                                              <div className="menu-divider" />
                                              <div className="menu-item delete" onClick={(e) => { e.stopPropagation(); handleDeleteBuild(b.id, p.id); setActiveBuildMenu(null); }}>Delete</div>
                                            </div>
                                          )}
                                        </div>
                                      </td>
                                    </tr>
                                  ))
                                )}
                              </tbody>
                            </table>
                          </div>
                        </td>
                      </tr>
                    )}
                  </>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* ── MODALS ── */}

      {/* Create Plan */}
      {isPlanModalOpen && (
        <div className="tp-modal-overlay">
          <div className="tp-modal-box large-modal">
            <h3>Create Test Plan</h3>
            <div className="tp-modal-scroll-content">
              {[["testplan_name","Test Plan Name *","text"],["plandesc_name","Description Name","text"],["plandesc_pmtid","PMT Reference ID","text"],["plandesc_esttime","Estimated Time (hr)","text"]].map(([key,label,type]) => (
                <div className="tp-form-row" key={key}>
                  <label>{label}</label>
                  <input className="tp-input-text" type={type} value={newPlan[key]} onChange={(e) => setNewPlan((p) => ({ ...p, [key]: e.target.value }))} />
                </div>
              ))}
              {[["plandesc_tested","Features to be Tested"],["plandesc_nottested","Features NOT to be Tested"],["plandesc_references","References"]].map(([key,label]) => (
                <div className="tp-form-row" key={key}>
                  <label>{label}</label>
                  <textarea className="tp-input-textarea" value={newPlan[key]} onChange={(e) => setNewPlan((p) => ({ ...p, [key]: e.target.value }))} />
                </div>
              ))}
              <div className="tp-checkbox-group"><label><input type="checkbox" checked={newPlan.plan_active} onChange={(e) => setNewPlan((p) => ({ ...p, plan_active: e.target.checked }))} /> Active</label></div>
            </div>
            <div className="tp-modal-actions">
              <button type="button" className="tp-btn-primary" onClick={handleCreatePlan}>Create</button>
              <button type="button" className="tp-btn-cancel" onClick={() => { if (setPlanModalOpen) setPlanModalOpen(false); }}>Cancel</button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Plan */}
      {showEditPlanModal && (
        <div className="tp-modal-overlay">
          <div className="tp-modal-box large-modal">
            <h3>Edit Test Plan</h3>
            <div className="tp-modal-scroll-content">
              {[["testplan_name","Test Plan Name *","text"],["plandesc_name","Description Name","text"],["plandesc_pmtid","PMT Reference ID","text"],["plandesc_esttime","Estimated Time (hr)","text"]].map(([key,label,type]) => (
                <div className="tp-form-row" key={key}>
                  <label>{label}</label>
                  <input className="tp-input-text" type={type} value={editPlanData[key] || ""} onChange={(e) => setEditPlanData((p) => ({ ...p, [key]: e.target.value }))} />
                </div>
              ))}
              {[["plandesc_tested","Features to be Tested"],["plandesc_nottested","Features NOT to be Tested"],["plandesc_references","References"]].map(([key,label]) => (
                <div className="tp-form-row" key={key}>
                  <label>{label}</label>
                  <textarea className="tp-input-textarea" value={editPlanData[key] || ""} onChange={(e) => setEditPlanData((p) => ({ ...p, [key]: e.target.value }))} />
                </div>
              ))}
              <div className="tp-checkbox-group"><label><input type="checkbox" checked={editPlanData.plan_active} onChange={(e) => setEditPlanData((p) => ({ ...p, plan_active: e.target.checked }))} /> Active</label></div>
            </div>
            <div className="tp-modal-actions">
              <button type="button" className="tp-btn-primary" onClick={handleUpdatePlan}>Save Changes</button>
              <button type="button" className="tp-btn-cancel" onClick={() => setShowEditPlanModal(false)}>Cancel</button>
            </div>
          </div>
        </div>
      )}

      {/* Create Build */}
      {showBuildModal && (
        <div className="tp-modal-overlay">
          <div className="tp-modal-box">
            <h3>Create Build</h3>
            <div className="tp-form-row"><label>Version *</label><input className="tp-input-text" value={newBuild.build_version} onChange={(e) => setNewBuild((b) => ({ ...b, build_version: e.target.value }))} /></div>
            <div className="tp-form-row"><label>Release Date</label><input className="tp-input-text" type="date" value={newBuild.build_releaseDate} onChange={(e) => setNewBuild((b) => ({ ...b, build_releaseDate: e.target.value }))} /></div>
            <div className="tp-form-row"><label>Notes</label><textarea className="tp-input-textarea" value={newBuild.build_desc} onChange={(e) => setNewBuild((b) => ({ ...b, build_desc: e.target.value }))} /></div>
            <div className="tp-checkbox-group">
              <label><input type="checkbox" checked={newBuild.build_active} onChange={(e) => setNewBuild((b) => ({ ...b, build_active: e.target.checked }))} /> Active</label>
              <label><input type="checkbox" checked={newBuild.build_open} onChange={(e) => setNewBuild((b) => ({ ...b, build_open: e.target.checked }))} /> Open</label>
            </div>
            <div className="tp-modal-actions">
              <button type="button" className="tp-btn-primary" onClick={handleCreateBuild}>Create</button>
              <button type="button" className="tp-btn-cancel" onClick={() => setShowBuildModal(false)}>Cancel</button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Build */}
      {showEditBuildModal && (
        <div className="tp-modal-overlay">
          <div className="tp-modal-box">
            <h3>Edit Build</h3>
            <div className="tp-form-row"><label>Version *</label><input className="tp-input-text" value={editBuildData.build_version} onChange={(e) => setEditBuildData((b) => ({ ...b, build_version: e.target.value }))} /></div>
            <div className="tp-form-row"><label>Release Date</label><input className="tp-input-text" type="date" value={editBuildData.build_releaseDate} onChange={(e) => setEditBuildData((b) => ({ ...b, build_releaseDate: e.target.value }))} /></div>
            <div className="tp-form-row"><label>Notes</label><textarea className="tp-input-textarea" value={editBuildData.build_desc} onChange={(e) => setEditBuildData((b) => ({ ...b, build_desc: e.target.value }))} /></div>
            <div className="tp-checkbox-group">
              <label><input type="checkbox" checked={editBuildData.build_active} onChange={(e) => setEditBuildData((b) => ({ ...b, build_active: e.target.checked }))} /> Active</label>
              <label><input type="checkbox" checked={editBuildData.build_open} onChange={(e) => setEditBuildData((b) => ({ ...b, build_open: e.target.checked }))} /> Open</label>
            </div>
            <div className="tp-modal-actions">
              <button type="button" className="tp-btn-primary" onClick={handleUpdateBuild}>Save Changes</button>
              <button type="button" className="tp-btn-cancel" onClick={() => setShowEditBuildModal(false)}>Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TestPlanManagementPage;
