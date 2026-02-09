import { useState, useEffect } from 'react';

function CategoryModal({ show, onClose, category, onSave, loading }) {
  const [categoryForm, setCategoryForm] = useState({ categoryHe: '' });

  useEffect(() => {
    if (category) {
      setCategoryForm({ categoryHe: category.categoryHe });
    } else {
      setCategoryForm({ categoryHe: '' });
    }
  }, [category]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    await onSave(categoryForm, category);
  };

  if (!show) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <h3>{category ? 'Edit Category' : 'Add Category'}</h3>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Hebrew Name</label>
            <input
              type="text"
              value={categoryForm.categoryHe}
              onChange={(e) => setCategoryForm({ categoryHe: e.target.value })}
              required
              placeholder="Enter Hebrew name"
            />
          </div>
          <div className="modal-actions">
            <button type="submit" className="save-btn" disabled={loading}>
              {loading ? 'Saving...' : 'Save'}
            </button>
            <button 
              type="button" 
              onClick={onClose}
              className="cancel-btn"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default CategoryModal;
