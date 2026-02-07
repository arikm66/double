import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import './DataManagement.css';

function DataManagement() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('categories');
  const [categories, setCategories] = useState([]);
  const [nouns, setNouns] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [showNounModal, setShowNounModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [editingNoun, setEditingNoun] = useState(null);
  const [categoryForm, setCategoryForm] = useState({ categoryHe: '' });
  const [nounForm, setNounForm] = useState({ nameEn: '', nameHe: '', category: '' });

  useEffect(() => {
    fetchCategories();
    fetchNouns();
  }, []);

  const fetchCategories = async () => {
    setLoading(true);
    try {
      const response = await fetch('http://localhost:5000/api/categories');
      const data = await response.json();
      setCategories(data.categories || []);
    } catch (err) {
      setError('Failed to fetch categories');
    }
    setLoading(false);
  };

  const fetchNouns = async () => {
    setLoading(true);
    try {
      const response = await fetch('http://localhost:5000/api/nouns');
      const data = await response.json();
      setNouns(data.nouns || []);
    } catch (err) {
      setError('Failed to fetch nouns');
    }
    setLoading(false);
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleCategorySubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const url = editingCategory 
        ? `http://localhost:5000/api/categories/${editingCategory._id}`
        : 'http://localhost:5000/api/categories';
      
      const response = await fetch(url, {
        method: editingCategory ? 'PUT' : 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(categoryForm)
      });

      if (response.ok) {
        fetchCategories();
        setShowCategoryModal(false);
        setCategoryForm({ categoryHe: '' });
        setEditingCategory(null);
      } else {
        setError('Failed to save category');
      }
    } catch (err) {
      setError('Error saving category');
    }
    setLoading(false);
  };

  const handleNounSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const url = editingNoun 
        ? `http://localhost:5000/api/nouns/${editingNoun._id}`
        : 'http://localhost:5000/api/nouns';
      
      const response = await fetch(url, {
        method: editingNoun ? 'PUT' : 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(nounForm)
      });

      if (response.ok) {
        fetchNouns();
        setShowNounModal(false);
        setNounForm({ nameEn: '', nameHe: '', category: '' });
        setEditingNoun(null);
      } else {
        setError('Failed to save noun');
      }
    } catch (err) {
      setError('Error saving noun');
    }
    setLoading(false);
  };

  const handleDeleteCategory = async (id) => {
    if (!window.confirm('Are you sure you want to delete this category?')) return;
    
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:5000/api/categories/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        fetchCategories();
      } else {
        setError('Failed to delete category');
      }
    } catch (err) {
      setError('Error deleting category');
    }
  };

  const handleDeleteNoun = async (id) => {
    if (!window.confirm('Are you sure you want to delete this noun?')) return;
    
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:5000/api/nouns/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        fetchNouns();
      } else {
        setError('Failed to delete noun');
      }
    } catch (err) {
      setError('Error deleting noun');
    }
  };

  const openCategoryModal = (category = null) => {
    if (category) {
      setEditingCategory(category);
      setCategoryForm({ categoryHe: category.categoryHe });
    } else {
      setEditingCategory(null);
      setCategoryForm({ categoryHe: '' });
    }
    setShowCategoryModal(true);
  };

  const openNounModal = (noun = null) => {
    if (noun) {
      setEditingNoun(noun);
      setNounForm({
        nameEn: noun.nameEn,
        nameHe: noun.nameHe,
        category: noun.category._id
      });
    } else {
      setEditingNoun(null);
      setNounForm({ nameEn: '', nameHe: '', category: '' });
    }
    setShowNounModal(true);
  };

  return (
    <div className="data-management-container">
      <nav className="navbar">
        <div className="navbar-brand">
          <h2>Data Management</h2>
        </div>
        <div className="navbar-menu">
          <button onClick={() => navigate('/dashboard')} className="nav-button">
            Dashboard
          </button>
          <button onClick={() => navigate('/manage')} className="nav-button">
            Manage
          </button>
          <span className="navbar-user">{user?.username}</span>
          <button onClick={handleLogout} className="logout-button">
            Logout
          </button>
        </div>
      </nav>

      <div className="data-content">
        {error && <div className="error-banner">{error}</div>}
        
        <div className="tabs">
          <button 
            className={`tab-button ${activeTab === 'categories' ? 'active' : ''}`}
            onClick={() => setActiveTab('categories')}
          >
            Categories ({categories.length})
          </button>
          <button 
            className={`tab-button ${activeTab === 'nouns' ? 'active' : ''}`}
            onClick={() => setActiveTab('nouns')}
          >
            Nouns ({nouns.length})
          </button>
        </div>

        {activeTab === 'categories' && (
          <div className="tab-content">
            <div className="content-header">
              <h2>Categories</h2>
              <button onClick={() => openCategoryModal()} className="add-button">
                + Add Category
              </button>
            </div>
            
            <div className="data-table">
              <table>
                <thead>
                  <tr>
                    <th>Hebrew Name</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {categories.map(category => (
                    <tr key={category._id}>
                      <td>{category.categoryHe}</td>
                      <td>
                        <button 
                          onClick={() => openCategoryModal(category)}
                          className="edit-btn"
                        >
                          Edit
                        </button>
                        <button 
                          onClick={() => handleDeleteCategory(category._id)}
                          className="delete-btn"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'nouns' && (
          <div className="tab-content">
            <div className="content-header">
              <h2>Nouns</h2>
              <button onClick={() => openNounModal()} className="add-button">
                + Add Noun
              </button>
            </div>
            
            <div className="data-table">
              <table>
                <thead>
                  <tr>
                    <th>English</th>
                    <th>Hebrew</th>
                    <th>Category</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {nouns.map(noun => (
                    <tr key={noun._id}>
                      <td>{noun.nameEn}</td>
                      <td>{noun.nameHe}</td>
                      <td>{noun.category?.categoryHe || 'N/A'}</td>
                      <td>
                        <button 
                          onClick={() => openNounModal(noun)}
                          className="edit-btn"
                        >
                          Edit
                        </button>
                        <button 
                          onClick={() => handleDeleteNoun(noun._id)}
                          className="delete-btn"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* Category Modal */}
      {showCategoryModal && (
        <div className="modal-overlay" onClick={() => setShowCategoryModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h3>{editingCategory ? 'Edit Category' : 'Add Category'}</h3>
            <form onSubmit={handleCategorySubmit}>
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
                  onClick={() => setShowCategoryModal(false)}
                  className="cancel-btn"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Noun Modal */}
      {showNounModal && (
        <div className="modal-overlay" onClick={() => setShowNounModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h3>{editingNoun ? 'Edit Noun' : 'Add Noun'}</h3>
            <form onSubmit={handleNounSubmit}>
              <div className="form-group">
                <label>English Name</label>
                <input
                  type="text"
                  value={nounForm.nameEn}
                  onChange={(e) => setNounForm({ ...nounForm, nameEn: e.target.value })}
                  required
                  placeholder="Enter English name"
                />
              </div>
              <div className="form-group">
                <label>Hebrew Name</label>
                <input
                  type="text"
                  value={nounForm.nameHe}
                  onChange={(e) => setNounForm({ ...nounForm, nameHe: e.target.value })}
                  required
                  placeholder="Enter Hebrew name"
                />
              </div>
              <div className="form-group">
                <label>Category</label>
                <select
                  value={nounForm.category}
                  onChange={(e) => setNounForm({ ...nounForm, category: e.target.value })}
                  required
                >
                  <option value="">Select a category</option>
                  {categories.map(cat => (
                    <option key={cat._id} value={cat._id}>{cat.categoryHe}</option>
                  ))}
                </select>
              </div>
              <div className="modal-actions">
                <button type="submit" className="save-btn" disabled={loading}>
                  {loading ? 'Saving...' : 'Save'}
                </button>
                <button 
                  type="button" 
                  onClick={() => setShowNounModal(false)}
                  className="cancel-btn"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default DataManagement;
