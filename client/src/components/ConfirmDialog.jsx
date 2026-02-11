import React, { useState } from 'react';
import './ConfirmDialog.css';


const ConfirmDialog = ({ message, onConfirm, onCancel, showDontAskAgain = true }) => {
  const [dontAskAgain, setDontAskAgain] = useState(false);

  const handleConfirm = () => {
    if (dontAskAgain) {
      localStorage.setItem('skipDeleteConfirmation', 'true');
    }
    onConfirm();
  };

  return (
    <div className="confirm-overlay">
      <div className="confirm-dialog">
        <div className="confirm-content">
          <h3>Confirm Delete</h3>
          <p>{message}</p>
          {showDontAskAgain && (
            <div className="confirm-checkbox">
              <label>
                <input
                  type="checkbox"
                  checked={dontAskAgain}
                  onChange={(e) => setDontAskAgain(e.target.checked)}
                />
                <span>Don't ask me again</span>
              </label>
            </div>
          )}
        </div>
        <div className="confirm-actions">
          <button onClick={onCancel} className="btn-cancel">
            Cancel
          </button>
          <button onClick={handleConfirm} className="btn-confirm">
            Delete
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmDialog;
