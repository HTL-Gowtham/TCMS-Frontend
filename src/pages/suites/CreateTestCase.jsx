/**
 * @file CreateTestCase.jsx
 * @description Form for creating or editing a test case with drag-and-drop steps.
 *
 * Props:
 *   suite           {object}      — parent suite
 *   onCancel        {Function}
 *   onSuccess       {Function}
 *   editingTestcase {object|null} — if provided, form is in edit mode
 */

/* eslint-disable */
import { useState, useEffect } from "react";
import toast from "react-hot-toast";
import { createTestcase, updateTestcase } from "../../api/testcasesApi";
import "./CreateTestCase.css";

const DEFAULT_STEP = { step_no: 1, action: "", expected_result: "", precondition: "" };

const CreateTestCase = ({ suite, onCancel, onSuccess, editingTestcase }) => {
  const [formData, setFormData] = useState({
    testcase_name:        "",
    testcase_summary:     "",
    testcase_precondition: "",
    task_id:              "",
    testcase_status:      "Draft",
    testcase_importance:  "Medium",
    testcase_executiontype: "Manual",
    testcase_type:        "System",
    steps:                [{ ...DEFAULT_STEP }],
  });

  const [draggedIndex, setDraggedIndex] = useState(null);

  // Populate form when editing
  useEffect(() => {
    if (editingTestcase) {
      setFormData({
        testcase_name:          editingTestcase.testcase_name        || "",
        testcase_summary:       editingTestcase.testcase_summary     || "",
        testcase_precondition:  editingTestcase.testcase_precondition|| "",
        task_id:                editingTestcase.task_id              || "",
        testcase_status:        editingTestcase.testcase_status      || "Draft",
        testcase_importance:    editingTestcase.testcase_importance  || "Medium",
        testcase_executiontype: editingTestcase.testcase_executiontype|| "Manual",
        testcase_type:          editingTestcase.testcase_type        || "System",
        steps:
          editingTestcase.steps && editingTestcase.steps.length > 0
            ? editingTestcase.steps
            : [{ ...DEFAULT_STEP }],
      });
    }
  }, [editingTestcase]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // ── Steps CRUD ────────────────────────────────────────────
  const addStep = () =>
    setFormData((prev) => ({
      ...prev,
      steps: [
        ...prev.steps,
        { step_no: prev.steps.length + 1, action: "", expected_result: "", precondition: "" },
      ],
    }));

  const removeStep = (index) => {
    if (formData.steps.length === 1) return;
    const updated = formData.steps
      .filter((_, i) => i !== index)
      .map((s, i) => ({ ...s, step_no: i + 1 }));
    setFormData((prev) => ({ ...prev, steps: updated }));
  };

  const updateStep = (index, field, value) => {
    const updated = [...formData.steps];
    updated[index] = { ...updated[index], [field]: value };
    setFormData((prev) => ({ ...prev, steps: updated }));
  };

  // ── Drag & Drop ───────────────────────────────────────────
  const onDragStart = (e, index) => {
    setDraggedIndex(index);
    e.dataTransfer.effectAllowed = "move";
  };

  const onDragOver = (e, index) => {
    e.preventDefault();
    if (draggedIndex === null || draggedIndex === index) return;
    const updatedSteps = [...formData.steps];
    const [item] = updatedSteps.splice(draggedIndex, 1);
    updatedSteps.splice(index, 0, item);
    const reordered = updatedSteps.map((s, i) => ({ ...s, step_no: i + 1 }));
    setDraggedIndex(index);
    setFormData((prev) => ({ ...prev, steps: reordered }));
  };

  const onDragEnd = () => setDraggedIndex(null);

  // ── Submit ────────────────────────────────────────────────
  const handleSave = async () => {
    if (!formData.testcase_name.trim()) {
      toast.error("Test case name is required");
      return;
    }
    if (!formData.task_id.trim()) {
      toast.error("Task ID is required");
      return;
    }
    if (!/^[A-Za-z0-9_-]+$/.test(formData.task_id.trim())) {
      toast.error("Task ID may only contain letters, numbers, hyphens, and underscores");
      return;
    }
    try {
      if (editingTestcase) {
        await updateTestcase(editingTestcase.id, formData);
      } else {
        await createTestcase(suite.id, formData);
      }
      onSuccess();
    } catch {
      toast.error("Failed to save test case");
    }
  };

  return (
    <div className="ctc-content-column">
      {/* HEADER */}
      <div className="ctc-header-row ctc-compact">
        <h3 className="ctc-page-title">
          {editingTestcase ? "Edit Test Case" : "New Test Case"}{" "}
          <span className="ctc-text-muted ctc-text-xs">/ {suite.suite_name}</span>
        </h3>
        <div className="ctc-header-actions">
          <button type="button" className="ctc-btn-secondary ctc-compact" onClick={onCancel}>
            Cancel
          </button>
          <button type="button" className="ctc-btn-primary ctc-compact" onClick={handleSave}>
            {editingTestcase ? "Update" : "Save"} Case
          </button>
        </div>
      </div>

      <div className="ctc-form-container ctc-scrollable">
        {/* ROW 1: Name | Summary | Precondition */}
        <div className="ctc-row-flex">
          <div className="ctc-form-group" style={{ flex: "0 0 30%" }}>
            <label className="ctc-label-small">Name</label>
            <input
              name="testcase_name"
              className="ctc-input-compact"
              placeholder="Test Case Name"
              value={formData.testcase_name}
              onChange={handleChange}
              autoFocus
            />
          </div>
          <div className="ctc-form-group" style={{ flex: 1 }}>
            <label className="ctc-label-small">Summary</label>
            <input
              name="testcase_summary"
              className="ctc-input-compact"
              placeholder="Brief summary..."
              value={formData.testcase_summary}
              onChange={handleChange}
            />
          </div>
          <div className="ctc-form-group" style={{ flex: 1 }}>
            <label className="ctc-label-small">Pre-condition</label>
            <input
              name="testcase_precondition"
              className="ctc-input-compact"
              placeholder="Prerequisites..."
              value={formData.testcase_precondition}
              onChange={handleChange}
            />
          </div>
        </div>

        {/* ROW 2: Dropdowns */}
        <div className="ctc-grid-4 ctc-compact-grid">
          <div className="ctc-form-group">
            <label className="ctc-label-small">Task ID</label>
            <input
              name="task_id"
              className="ctc-input-compact"
              placeholder="Task ID"
              value={formData.task_id}
              onChange={handleChange}
            />
          </div>
          <div className="ctc-form-group">
            <label className="ctc-label-small">Status</label>
            <select
              name="testcase_status"
              className="ctc-input-compact"
              value={formData.testcase_status}
              onChange={handleChange}
            >
              <option>Draft</option>
              <option>Ready</option>
            </select>
          </div>
          <div className="ctc-form-group">
            <label className="ctc-label-small">Severity</label>
            <select
              name="testcase_importance"
              className="ctc-input-compact"
              value={formData.testcase_importance}
              onChange={handleChange}
            >
              <option>Low</option>
              <option>Medium</option>
              <option>High</option>
            </select>
          </div>
          <div className="ctc-form-group">
            <label className="ctc-label-small">Execution</label>
            <select
              name="testcase_executiontype"
              className="ctc-input-compact"
              value={formData.testcase_executiontype}
              onChange={handleChange}
            >
              <option>Manual</option>
              <option>Automated</option>
            </select>
          </div>
        </div>

        {/* ROW 3: Type */}
        <div className="ctc-grid-4 ctc-compact-grid">
          <div className="ctc-form-group">
            <label className="ctc-label-small">Type</label>
            <select
              name="testcase_type"
              className="ctc-input-compact"
              value={formData.testcase_type}
              onChange={handleChange}
            >
              <option>Unit</option>
              <option>System</option>
              <option>Integration</option>
              <option>Acceptance</option>
            </select>
          </div>
        </div>

        {/* Steps header */}
        <div className="ctc-section-header">
          <label className="ctc-label-small" style={{ color: "#1e293b" }}>
            TEST STEPS
          </label>
          <button type="button" className="ctc-btn-small" onClick={addStep}>
            + Add Step
          </button>
        </div>

        {/* Steps table */}
        <div className="ctc-table-container ctc-steps-container">
          <table className="ctc-table ctc-fixed-layout">
            <thead>
              <tr>
                <th style={{ width: "30px" }} />
                <th style={{ width: "35px" }}>#</th>
                <th style={{ width: "30%" }}>Action</th>
                <th style={{ width: "30%" }}>Expected Result</th>
                <th style={{ width: "25%" }}>Precondition (Step)</th>
                <th style={{ width: "30px" }} />
              </tr>
            </thead>
            <tbody>
              {formData.steps.map((step, index) => (
                <tr
                  key={index}
                  draggable
                  onDragStart={(e) => onDragStart(e, index)}
                  onDragOver={(e) => onDragOver(e, index)}
                  onDragEnd={onDragEnd}
                  className={draggedIndex === index ? "ctc-row-dragging" : "ctc-step-row"}
                >
                  <td className="ctc-drag-handle">⠿</td>
                  <td className="ctc-id-cell ctc-center-text">{step.step_no}</td>
                  <td className="ctc-p-0">
                    <textarea
                      className="ctc-cell-input"
                      placeholder="Action..."
                      value={step.action}
                      onChange={(e) => updateStep(index, "action", e.target.value)}
                    />
                  </td>
                  <td className="ctc-p-0">
                    <textarea
                      className="ctc-cell-input"
                      placeholder="Expected..."
                      value={step.expected_result}
                      onChange={(e) => updateStep(index, "expected_result", e.target.value)}
                    />
                  </td>
                  <td className="ctc-p-0">
                    <textarea
                      className="ctc-cell-input"
                      placeholder="(Optional)"
                      value={step.precondition}
                      onChange={(e) => updateStep(index, "precondition", e.target.value)}
                    />
                  </td>
                  <td className="ctc-center-text">
                    {formData.steps.length > 1 && (
                      <button
                        type="button"
                        className="ctc-btn-icon-danger"
                        tabIndex={-1}
                        onClick={() => removeStep(index)}
                      >
                        ×
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default CreateTestCase;
