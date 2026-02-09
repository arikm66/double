import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import Navbar from './Navbar';
import ConfirmDialog from './ConfirmDialog';
import { uploadImage, deleteImage } from '../utils/imageUpload';
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
  const [nounForm, setNounForm] = useState({ nameEn: '', nameHe: '', category: '', imageUrl: '' });
  const [selectedImage, setSelectedImage] = useState(null);
  const [imagePreview, setImagePreview] = useState('');
  const [uploadingImage, setUploadingImage] = useState(false);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [deleteAction, setDeleteAction] = useState(null);
  const [deleteMessage, setDeleteMessage] = useState('');
  const [searchText, setSearchText] = useState('');
  const [filterCategory, setFilterCategory] = useState('');
  const [loadingAllNouns, setLoadingAllNouns] = useState(false);
  const [importFile, setImportFile] = useState(null);
  const [importLoading, setImportLoading] = useState(false);
  const [importResults, setImportResults] = useState(null);
  const categoriesLoadMoreRef = useRef(null);
  const nounsLoadMoreRef = useRef(null);
  const importFileInputRef = useRef(null);

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

  const filteredNouns = useMemo(() => {
    let filtered = sortedNouns;

    // Filter by search text
    if (searchText.trim()) {
      const search = searchText.toLowerCase();
      filtered = filtered.filter(noun => 
        noun.nameEn.toLowerCase().includes(search) ||
        noun.nameHe.includes(searchText.trim()) ||
        noun.category?.categoryHe?.includes(searchText.trim())
      );
    }

    // Filter by category
    if (filterCategory) {
      filtered = filtered.filter(noun => noun.category?._id === filterCategory);
    }

    return filtered;
  }, [sortedNouns, searchText, filterCategory]);

  // Load all nouns when filters are applied
  useEffect(() => {
    const loadAllNouns = async () => {
      if ((searchText || filterCategory) && nounsHasMore && !loadingAllNouns) {
        setLoadingAllNouns(true);
        
        // Fetch all remaining nouns
        let currentPage = nounsPage;
        let hasMore = nounsHasMore;
        
        while (hasMore) {
          currentPage++;
          try {
            const response = await fetch(
              `http://localhost:5000/api/nouns?page=${currentPage}&limit=${NOUNS_PAGE_SIZE}`
            );
            const data = await response.json();
            const newNouns = data.nouns || [];
            
            hasMore = Boolean(data.hasMore);
            setNounsHasMore(hasMore);
            setNounsPage(currentPage);
            setNouns((prev) => [...prev, ...newNouns]);
            
            if (!hasMore) break;
          } catch (err) {
            console.error('Error loading all nouns:', err);
            break;
          }
        }
        
        setLoadingAllNouns(false);
      }
    };
    
    loadAllNouns();
  }, [searchText, filterCategory, nounsHasMore, nounsPage, loadingAllNouns, NOUNS_PAGE_SIZE]);

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
    // Disable infinite scroll when filters are active
    if (searchText || filterCategory) return;

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
  }, [activeTab, fetchNouns, nounsHasMore, nounsLoading, nounsLoadingMore, nounsPage, searchText, filterCategory]);

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
      let imageUrl = nounForm.imageUrl;
      
      // Upload new image if selected
      if (selectedImage) {
        setUploadingImage(true);
        try {
          imageUrl = await uploadImage(selectedImage, 'nouns');
          
          // Delete old image if updating and had a previous image
          if (editingNoun && editingNoun.imageUrl && editingNoun.imageUrl !== imageUrl) {
            try {
              await deleteImage(editingNoun.imageUrl);
            } catch (deleteError) {
              console.error('Error deleting old image:', deleteError);
              // Continue even if delete fails
            }
          }
        } catch (uploadError) {
          setError('Failed to upload image: ' + uploadError.message);
          setUploadingImage(false);
          setLoading(false);
          return;
        }
        setUploadingImage(false);
      }
      
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
        body: JSON.stringify({ ...nounForm, imageUrl })
      });

      if (response.ok) {
        resetNouns();
        setShowNounModal(false);
        setNounForm({ nameEn: '', nameHe: '', category: '', imageUrl: '' });
        setSelectedImage(null);
        setImagePreview('');
        setEditingNoun(null);
      } else {
        setError('Failed to save noun');
      }
    } catch (err) {
      setError('Error saving noun');
    }
    setLoading(false);
  };

  const handleDeleteCategory = (id) => {
    if (!isAdmin) {
      setError('Only admins can delete categories');
      return;
    }
    
    const skipConfirmation = localStorage.getItem('skipDeleteConfirmation') === 'true';
    
    if (skipConfirmation) {
      performDeleteCategory(id);
    } else {
      setDeleteMessage('Are you sure you want to delete this category?');
      setDeleteAction(() => () => performDeleteCategory(id));
      setShowConfirmDialog(true);
    }
  };

  const performDeleteCategory = async (id) => {
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
        setNouns((prev) => {
          const filtered = prev.filter((noun) => noun.category?._id !== id);
          const removedCount = prev.length - filtered.length;
          if (removedCount > 0) {
            setNounsTotal((total) => Math.max(total - removedCount, 0));
          }
          return filtered;
        });
      } else if (response.status === 403) {
        setError('Only admins can delete categories');
      } else {
        setError('Failed to delete category');
      }
    } catch (err) {
      setError('Error deleting category');
    }
  };

  const handleDeleteNoun = (id) => {
    if (!isAdmin) {
      setError('Only admins can delete nouns');
      return;
    }
    
    const skipConfirmation = localStorage.getItem('skipDeleteConfirmation') === 'true';
    
    if (skipConfirmation) {
      performDeleteNoun(id);
    } else {
      setDeleteMessage('Are you sure you want to delete this noun?');
      setDeleteAction(() => () => performDeleteNoun(id));
      setShowConfirmDialog(true);
    }
  };

  const performDeleteNoun = async (id) => {
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

  const handleConfirmDelete = () => {
    setShowConfirmDialog(false);
    if (deleteAction) {
      deleteAction();
      setDeleteAction(null);
    }
  };

  const handleCancelDelete = () => {
    setShowConfirmDialog(false);
    setDeleteAction(null);
  };

  const handleImportFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.type !== 'application/json') {
        setError('Please select a JSON file');
        return;
      }
      setImportFile(file);
      setImportResults(null);
      setError('');
    }
  };

  const handleImportNouns = async () => {
    if (!importFile) {
      setError('Please select a file first');
      return;
    }

    setImportLoading(true);
    setError('');
    setImportResults(null);

    try {
      // Read the file
      const fileContent = await importFile.text();
      const jsonData = JSON.parse(fileContent);

      // Validate it's an array
      if (!Array.isArray(jsonData)) {
        setError('Invalid JSON format. Expected a direct array of noun objects.');
        setImportLoading(false);
        return;
      }

      // Call the import API
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/import/nouns', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(jsonData)
      });

      const result = await response.json();

      if (response.ok) {
        setImportResults(result);
        // Refresh nouns and categories lists
        resetNouns();
        resetCategories();
      } else {
        setError(result.message || 'Import failed');
        // Only set results if stats exist (for partial imports)
        if (result.stats) {
          setImportResults(result);
          // Refresh lists even on partial success
          resetNouns();
          resetCategories();
        }
      }
    } catch (err) {
      console.error('Import error:', err);
      setError('Error importing nouns: ' + err.message);
    } finally {
      setImportLoading(false);
    }
  };

  const clearImport = () => {
    setImportFile(null);
    setImportResults(null);
    setError('');
    // Reset the file input to allow reselecting the same file
    if (importFileInputRef.current) {
      importFileInputRef.current.value = '';
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

  const handleImageSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedImage(file);
      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveImage = () => {
    setSelectedImage(null);
    setImagePreview('');
    setNounForm({ ...nounForm, imageUrl: '' });
  };

  const openNounModal = (noun = null) => {
    if (noun) {
      setEditingNoun(noun);
      setNounForm({
        nameEn: noun.nameEn,
        nameHe: noun.nameHe,
        category: noun.category._id,
        imageUrl: noun.imageUrl || ''
      });
      setImagePreview(noun.imageUrl || '');
      setSelectedImage(null);
    } else {
      setEditingNoun(null);
      setNounForm({ nameEn: '', nameHe: '', category: '', imageUrl: '' });
      setImagePreview('');
      setSelectedImage(null);
    }
    setShowNounModal(true);
  };

  return (
    <div className="data-management-container">
      <Navbar />

      <div className="data-sticky">
        <div className="data-header">
          <button className="back-button" onClick={() => navigate('/manage')}>
            ← Back to Manage
          </button>
          <h1>Data Management</h1>
        </div>

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
          {isAdmin && (
            <button 
              className={`tab-button ${activeTab === 'import' ? 'active' : ''}`}
              onClick={() => setActiveTab('import')}
            >
              Import
            </button>
          )}
        </div>
      </div>

      <div className="data-content">
        {error && (
          <div className="error-banner">
            <span>{error}</span>
            <button className="error-close" onClick={() => setError('')}>✕</button>
          </div>
        )}

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
              <div className="filters-container">
                <input
                  type="text"
                  className="search-input"
                  placeholder="🔍 Search nouns..."
                  value={searchText}
                  onChange={(e) => setSearchText(e.target.value)}
                />
                <select
                  className="filter-select"
                  value={filterCategory}
                  onChange={(e) => setFilterCategory(e.target.value)}
                >
                  <option value="">All Categories</option>
                  {categories.map(cat => (
                    <option key={cat._id} value={cat._id}>{cat.categoryHe}</option>
                  ))}
                </select>
                {(searchText || filterCategory) && (
                  <button 
                    className="clear-filters-btn"
                    onClick={() => {
                      setSearchText('');
                      setFilterCategory('');
                    }}
                    title="Clear filters"
                  >
                    ✕
                  </button>
                )}
              </div>
              <button onClick={() => openNounModal()} className="add-button">
                + Add Noun
              </button>
            </div>
            
            <div className="data-table">
              {nounsLoading && <div className="loading-row">Loading nouns...</div>}
              {loadingAllNouns && !nounsLoading && (
                <div className="loading-row">Loading all nouns for filtering...</div>
              )}
              {!nounsLoading && !loadingAllNouns && (searchText || filterCategory) && (
                <div className="filter-results-info">
                  Showing {filteredNouns.length} of {nouns.length} nouns
                </div>
              )}
              <table>
                <thead>
                  <tr>
                    <th>Image</th>
                    <th>English</th>
                    <th>Hebrew</th>
                    <th>Category</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredNouns.map(noun => (
                    <tr key={noun._id}>
                      <td>
                        {noun.imageUrl ? (
                          <img 
                            src={noun.imageUrl} 
                            alt={noun.nameEn} 
                            className="noun-thumbnail"
                          />
                        ) : (
                          <span className="no-image">No image</span>
                        )}
                      </td>
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
                      <td colSpan="5" className="empty-row">No nouns found.</td>
                    </tr>
                  )}
                  {!nounsLoading && nouns.length > 0 && filteredNouns.length === 0 && (
                    <tr>
                      <td colSpan="5" className="empty-row">No nouns match your filters.</td>
                    </tr>
                  )}
                </tbody>
              </table>
              {!searchText && !filterCategory && (
                <div className="load-more" ref={nounsLoadMoreRef}>
                  {nounsLoadingMore && <span>Loading more...</span>}
                  {!nounsHasMore && nouns.length > 0 && <span>End of list</span>}
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'import' && isAdmin && (
          <div className="tab-content">
            <div className="content-header">
              <h2>Import Nouns from JSON</h2>
            </div>
            
            <div className="import-section">
              <div className="import-instructions">
                <h3>Instructions</h3>
                <p>Upload a JSON file with the following format:</p>
                <pre>{`[
  {
    "nameEn": "apple",
    "nameHe": "תפוח",
    "categoryHe": "פירות",
    "imageUrl": "optional"
  },
  {
    "nameEn": "banana",
    "nameHe": "בננה",
    "categoryHe": "פירות"
  }
]`}</pre>
                <ul>
                  <li>Upload a direct JSON array of noun objects</li>
                  <li>Nouns with existing <code>nameEn</code> will be skipped</li>
                  <li>Use <code>categoryHe</code> field with Hebrew category name</li>
                  <li>Categories will be automatically created if they don't exist</li>
                  <li>Nouns without a <code>categoryHe</code> field will be ignored</li>
                  <li>A detailed log file will be generated on the server</li>
                </ul>
              </div>

              <div className="import-upload">
                <div className="form-group">
                  <label>Select JSON File</label>
                  <input
                    ref={importFileInputRef}
                    type="file"
                    accept=".json"
                    onChange={handleImportFileChange}
                    disabled={importLoading}
                  />
                  {importFile && (
                    <div className="file-info">
                      <span>📄 {importFile.name}</span>
                      <button 
                        onClick={clearImport}
                        className="clear-file-btn"
                        disabled={importLoading}
                      >
                        ✕
                      </button>
                    </div>
                  )}
                </div>

                <button
                  onClick={handleImportNouns}
                  className="import-btn"
                  disabled={!importFile || importLoading}
                >
                  {importLoading ? '⏳ Importing...' : '📥 Import Nouns'}
                </button>
              </div>

              {importResults && importResults.stats && (
                <div className="import-results">
                  <h3>Import Results</h3>
                  <div className="results-stats">
                    <div className="stat-card">
                      <div className="stat-number">{importResults.stats.total}</div>
                      <div className="stat-label">Total Processed</div>
                    </div>
                    <div className="stat-card success">
                      <div className="stat-number">{importResults.stats.imported}</div>
                      <div className="stat-label">Imported</div>
                    </div>
                    <div className="stat-card skipped">
                      <div className="stat-number">{importResults.stats.skipped}</div>
                      <div className="stat-label">Skipped (Exists)</div>
                    </div>
                    <div className="stat-card created">
                      <div className="stat-number">{importResults.stats.categoriesCreated || 0}</div>
                      <div className="stat-label">Categories Created</div>
                    </div>
                    <div className="stat-card error">
                      <div className="stat-number">{importResults.stats.errors}</div>
                      <div className="stat-label">Errors</div>
                    </div>
                  </div>
                  <div className="results-info">
                    <p><strong>Duration:</strong> {importResults.duration}</p>
                    <p><strong>Log file:</strong> {importResults.logFile}</p>
                    <p className="log-note">Log file saved on server in the server root directory</p>
                  </div>
                </div>
              )}
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
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{cursor: uploadingImage ? 'wait' : 'default'}}>
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
              <div className="form-group">
                <label>Image {uploadingImage && <span className="uploading-indicator">⏳ Uploading...</span>}</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageSelect}
                  disabled={uploadingImage}
                  style={{cursor: uploadingImage ? 'wait' : 'pointer'}}
                />
                {imagePreview && (
                  <div className="image-preview" style={{opacity: uploadingImage ? 0.6 : 1}}>
                    {uploadingImage && (
                      <div className="upload-spinner">
                        <div className="spinner"></div>
                        <p>Uploading image...</p>
                      </div>
                    )}
                    <img src={imagePreview} alt="Preview" style={{filter: uploadingImage ? 'blur(2px)' : 'none'}} />
                    <button 
                      type="button" 
                      onClick={handleRemoveImage}
                      className="remove-image-btn"
                      disabled={uploadingImage}
                      style={{cursor: uploadingImage ? 'wait' : 'pointer'}}
                    >
                      Remove Image
                    </button>
                  </div>
                )}
                <small>Supported formats: JPEG, PNG, GIF, WebP (Max 5MB)</small>
              </div>
              <div className="modal-actions">
                <button type="submit" className="save-btn" disabled={loading || uploadingImage} style={{cursor: (loading || uploadingImage) ? 'wait' : 'pointer'}}>
                  {uploadingImage ? '⏳ Uploading Image...' : loading ? '💾 Saving...' : 'Save'}
                </button>
                <button 
                  type="button" 
                  onClick={() => setShowNounModal(false)}
                  className="cancel-btn"
                  disabled={uploadingImage}
                  style={{cursor: uploadingImage ? 'not-allowed' : 'pointer'}}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showConfirmDialog && (
        <ConfirmDialog
          message={deleteMessage}
          onConfirm={handleConfirmDelete}
          onCancel={handleCancelDelete}
        />
      )}
    </div>
  );
}

export default DataManagement;
