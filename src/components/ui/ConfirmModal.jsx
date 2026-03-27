/**
 * @file ConfirmModal.jsx
 * @description Accessible confirmation dialog that replaces window.confirm().
 *
 * Props:
 *   isOpen   {boolean}  — controls visibility
 *   message  {string}   — question to display
 *   onConfirm {Function} — called when user clicks Confirm
 *   onCancel  {Function} — called when user clicks Cancel or presses Escape
 *
 * Usage:
 *   const [open, setOpen] = useState(false);
 *   <ConfirmModal
 *     isOpen={open}
 *     message="Delete this item?"
 *     onConfirm={handleDelete}
 *     onCancel={() => setOpen(false)}
 *   />
 */

import "./ConfirmModal.css";

/* eslint-disable react/prop-types */
const ConfirmModal = ({ isOpen, message, onConfirm, onCancel }) => {
  if (!isOpen) return null;

  return (
    <dialog className="cm-overlay" open aria-labelledby="cm-message">
      <div className="cm-box">
        <p id="cm-message" className="cm-message">
          {message}
        </p>
        <div className="cm-actions">
          <button type="button" className="cm-btn-cancel" onClick={onCancel}>
            Cancel
          </button>
          <button type="button" className="cm-btn-confirm" onClick={onConfirm} autoFocus>
            Confirm
          </button>
        </div>
      </div>
    </dialog>
  );
};

export default ConfirmModal;
