/**
 * @file CreateSuite.jsx
 * @description Form component for creating a new test suite.
 *              Embedded inside TestDesignPage when mode === "createSuite".
 *
 * Props:
 *   project   {object}   — active project
 *   onSuccess {Function} — called after successful creation
 *   onCancel  {Function} — called when user cancels
 */

/* eslint-disable */
import { useState } from "react";
import toast from "react-hot-toast";
import { createSuite } from "../../api/suitesApi";
import "./CreateSuite.css";

const CreateSuite = ({ project, onSuccess, onCancel }) => {
  const [suiteName, setSuiteName] = useState("");
  const [description, setDescription] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!suiteName.trim()) {
      setError("Suite name is required");
      return;
    }
    setIsSubmitting(true);
    try {
      const newSuite = await createSuite(project.id, {
        suite_name:        suiteName,
        suite_description: description,
      });
      toast.success("Suite created!");
      onSuccess(newSuite);
    } catch {
      setError("Failed to create suite.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="cs-centered-container">
      <div className="cs-compact-card">
        <div className="cs-card-header">
          <h3 className="cs-card-title">Create Test Suite</h3>
          <span className="cs-text-muted cs-text-sm">{project.project_name}</span>
        </div>

        <form onSubmit={handleSubmit} className="cs-card-body">
          <div className="cs-form-group">
            <label>
              Suite Name <span style={{ color: "#ef4444" }}>*</span>
            </label>
            <input
              className="cs-input"
              value={suiteName}
              onChange={(e) => setSuiteName(e.target.value)}
              placeholder="e.g. User Authentication"
              autoFocus
            />
          </div>

          <div className="cs-form-group">
            <label>Description</label>
            <textarea
              className="cs-input-textarea cs-short-text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Optional description..."
            />
          </div>

          {error && <div className="cs-error-msg">{error}</div>}

          <div className="cs-card-actions">
            <button
              type="button"
              className="cs-btn-secondary"
              onClick={onCancel}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="cs-btn-primary"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Saving..." : "Create"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateSuite;
