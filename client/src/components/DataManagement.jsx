import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import './DataManagement.css';

function DataManagement() {
  const CATEGORIES_PAGE_SIZE = 50;
  const NOUNS_PAGE_SIZE = 50;
  const { user } = useAuth();
  const navigate = useNavigate();
  const isAdmin = user?.role === 'admin';
  const [activeTab, setActiveTab] = useState('categories');
  const [categories, setCategories] = useState([]);
  const [categoriesTotal, setCategoriesTotal] = useState(0);
  const [categoriesPage, setCategoriesPage] = useState(1);
  const [categoriesHasMore, setCategoriesHasMore] = useState(true);
  const [categoriesLoading, setCategoriesLoading] = useState(false);
  const [categoriesLoadingMore, setCategoriesLoadingMore] = useState(false);
  const [nouns, setNouns] = useState([]);
  const [nounsTotal, setNounsTotal] = useState(0);
  const [nounsPage, setNounsPage] = useState(1);
  const [nounsHasMore, setNounsHasMore] = useState(true);
  const [nounsLoading, setNounsLoading] = useState(false);
  const [nounsLoadingMore, setNounsLoadingMore] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [showNounModal, setShowNounModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [editingNoun, setEditingNoun] = useState(null);
  const [categoryForm, setCategoryForm] = useState({ categoryHe: '' });
  const [nounForm, setNounForm] = useState({ nameEn: '', nameHe: '', category: '' });
  const categoriesLoadMoreRef = useRef(null);
  const nounsLoadMoreRef = useRef(null);

  useEffect(() => {
    fetchCategories(1, true);
    fetchNouns(1, true);
  }, []);

  const fetchCategories = useCallback(async (page = 1, replace = false) => {
    const isFirstPage = page === 1;
    if (isFirstPage) {
      setCategoriesLoading(true);
    } else {
      setCategoriesLoadingMore(true);
    }

    try {
      const response = await fetch(
        `http://localhost:5000/api/categories?page=${page}&limit=${CATEGORIES_PAGE_SIZE}`
      );
      const data = await response.json();
      const newCategories = data.categories || [];

      setCategoriesTotal(typeof data.total === 'number' ? data.total : newCategories.length);
      setCategoriesHasMore(Boolean(data.hasMore));
      setCategoriesPage(page);
      setCategories((prev) => (replace ? newCategories : [...prev, ...newCategories]));
    } catch (err) {
      setError('Failed to fetch categories');
    }

    if (isFirstPage) {
      setCategoriesLoading(false);
    } else {
      setCategoriesLoadingMore(false);
    }
  }, [CATEGORIES_PAGE_SIZE]);

  const fetchNouns = useCallback(async (page = 1, replace = false) => {
    const isFirstPage = page === 1;
    if (isFirstPage) {
      setNounsLoading(true);
    } else {
      setNounsLoadingMore(true);
    }

    try {
      const response = await fetch(
        `http://localhost:5000/api/nouns?page=${page}&limit=${NOUNS_PAGE_SIZE}`
      );
      const data = await response.json();
      const newNouns = data.nouns || [];

      setNounsTotal(typeof data.total === 'number' ? data.total : newNouns.length);
      setNounsHasMore(Boolean(data.hasMore));
      setNounsPage(page);
      setNouns((prev) => (replace ? newNouns : [...prev, ...newNouns]));
    } catch (err) {
      setError('Failed to fetch nouns');
    }

    if (isFirstPage) {
      setNounsLoading(false);
    } else {
      setNounsLoadingMore(false);
    }
  }, [NOUNS_PAGE_SIZE]);

  const resetNouns = () => {
    setNouns([]);
    setNounsPage(1);
    setNounsHasMore(true);
    fetchNouns(1, true);
  };

  const resetCategories = () => {
    setCategories([]);
    setCategoriesPage(1);
    setCategoriesHasMore(true);
    fetchCategories(1, true);
  };

  const sortedNouns = useMemo(() => {
    const getCategoryName = (noun) => noun.category?.categoryHe || '';
    return [...nouns].sort((a, b) => {
      const categoryCompare = getCategoryName(a).localeCompare(getCategoryName(b), 'he');
      if (categoryCompare !== 0) {
        return categoryCompare;
      }
      return (a.nameHe || '').localeCompare(b.nameHe || '', 'he');
    });
  }, [nouns]);

  useEffect(() => {
    if (activeTab !== 'categories') return;
    if (!categoriesLoadMoreRef.current) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        if (!entry.isIntersecting) return;
        if (!categoriesHasMore || categoriesLoading || categoriesLoadingMore) return;
        fetchCategories(categoriesPage + 1);
      },
      { rootMargin: '200px' }
    );

    observer.observe(categoriesLoadMoreRef.current);

    return () => observer.disconnect();
  }, [
    activeTab,
    categoriesHasMore,
    categoriesLoading,
    categoriesLoadingMore,
    categoriesPage,
    fetchCategories
  ]);

  useEffect(() => {
    if (activeTab !== 'nouns') return;
    if (!nounsLoadMoreRef.current) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        if (!entry.isIntersecting) return;
        if (!nounsHasMore || nounsLoading || nounsLoadingMore) return;
        fetchNouns(nounsPage + 1);
      },
      { rootMargin: '200px' }
    );

    observer.observe(nounsLoadMoreRef.current);

    return () => observer.disconnect();
  }, [activeTab, fetchNouns, nounsHasMore, nounsLoading, nounsLoadingMore, nounsPage]);

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
        resetCategories();
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
        resetNouns();
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
    if (!isAdmin) {
      setError('Only admins can delete categories');
      return;
    }
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
        resetCategories();
      } else if (response.status === 403) {
        setError('Only admins can delete categories');
      } else {
        setError('Failed to delete category');
      }
    } catch (err) {
      setError('Error deleting category');
    }
  };

  const handleDeleteNoun = async (id) => {
    if (!isAdmin) {
      setError('Only admins can delete nouns');
      return;
    }
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
        resetNouns();
      } else if (response.status === 403) {
        setError('Only admins can delete nouns');
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
      <div className="data-header">
        <button className="back-button" onClick={() => navigate('/manage')}>
          ← Back to Manage
        </button>
        <h1>Data Management</h1>
      </div>

      <div className="data-content">
        {error && <div className="error-banner">{error}</div>}
        
        <div className="tabs">
          <button 
            className={`tab-button ${activeTab === 'categories' ? 'active' : ''}`}
            onClick={() => setActiveTab('categories')}
          >
            Categories ({categoriesTotal || categories.length})
          </button>
          <button 
            className={`tab-button ${activeTab === 'nouns' ? 'active' : ''}`}
            onClick={() => setActiveTab('nouns')}
          >
            Nouns ({nounsTotal || nouns.length})
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
              {categoriesLoading && <div className="loading-row">Loading categories...</div>}
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
                          disabled={!isAdmin}
                          title={isAdmin ? 'Delete category' : 'Admin only'}
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                  {!categoriesLoading && categories.length === 0 && (
                    <tr>
                      <td colSpan="2" className="empty-row">No categories found.</td>
                    </tr>
                  )}
                </tbody>
              </table>
              <div className="load-more" ref={categoriesLoadMoreRef}>
                {categoriesLoadingMore && <span>Loading more...</span>}
                {!categoriesHasMore && categories.length > 0 && <span>End of list</span>}
              </div>
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
              {nounsLoading && <div className="loading-row">Loading nouns...</div>}
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
                  {sortedNouns.map(noun => (
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
                          disabled={!isAdmin}
                          title={isAdmin ? 'Delete noun' : 'Admin only'}
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                  {!nounsLoading && nouns.length === 0 && (
                    <tr>
                      <td colSpan="4" className="empty-row">No nouns found.</td>
                    </tr>
                  )}
                </tbody>
              </table>
              <div className="load-more" ref={nounsLoadMoreRef}>
                {nounsLoadingMore && <span>Loading more...</span>}
                {!nounsHasMore && nouns.length > 0 && <span>End of list</span>}
              </div>
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
