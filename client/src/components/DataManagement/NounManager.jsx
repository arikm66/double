import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import NounModal from './NounModal';

function NounManager({ isAdmin, categories, onError, onDeleteRequest, onNounUpdate }) {
  const NOUNS_PAGE_SIZE = 50;
  const [nouns, setNouns] = useState([]);
  const [nounsTotal, setNounsTotal] = useState(0);
  const [nounsPage, setNounsPage] = useState(1);
  const [nounsHasMore, setNounsHasMore] = useState(true);
  const [nounsLoading, setNounsLoading] = useState(false);
  const [nounsLoadingMore, setNounsLoadingMore] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [filterCategory, setFilterCategory] = useState('');
  const [loadingAllNouns, setLoadingAllNouns] = useState(false);
  const [showNounModal, setShowNounModal] = useState(false);
  const [editingNoun, setEditingNoun] = useState(null);
  const [loading, setLoading] = useState(false);
  const nounsLoadMoreRef = useRef(null);

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
      onError('Failed to fetch nouns');
    }

    if (isFirstPage) {
      setNounsLoading(false);
    } else {
      setNounsLoadingMore(false);
    }
  }, [NOUNS_PAGE_SIZE, onError]);

  const resetNouns = useCallback(() => {
    setNouns([]);
    setNounsPage(1);
    setNounsHasMore(true);
    fetchNouns(1, true);
    if (onNounUpdate) {
      onNounUpdate();
    }
  }, [fetchNouns, onNounUpdate]);

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

  useEffect(() => {
    fetchNouns(1, true);
  }, [fetchNouns]);

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
    if (!nounsLoadMoreRef.current) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        if (!entry.isIntersecting) return;
        if (!nounsHasMore || nounsLoading || nounsLoadingMore) return;
        if (searchText || filterCategory) return; // Don't auto-load when filtering
        fetchNouns(nounsPage + 1);
      },
      { rootMargin: '200px' }
    );

    observer.observe(nounsLoadMoreRef.current);

    return () => observer.disconnect();
  }, [nounsHasMore, nounsLoading, nounsLoadingMore, nounsPage, searchText, filterCategory, fetchNouns]);

  const openNounModal = (noun = null) => {
    setEditingNoun(noun);
    setShowNounModal(true);
  };

  const handleNounSave = async (nounFormData, editingNoun) => {
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
        body: JSON.stringify(nounFormData)
      });

      if (response.ok) {
        resetNouns();
        setShowNounModal(false);
        setEditingNoun(null);
      } else {
        onError('Failed to save noun');
      }
    } catch (err) {
      onError('Error saving noun');
    }
    setLoading(false);
  };

  const handleDeleteNoun = (id) => {
    if (!isAdmin) {
      onError('Only admins can delete nouns');
      return;
    }
    
    onDeleteRequest(
      'Are you sure you want to delete this noun?',
      () => performDeleteNoun(id)
    );
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
        onError('Only admins can delete nouns');
      } else {
        onError('Failed to delete noun');
      }
    } catch (err) {
      onError('Error deleting noun');
    }
  };

  return (
    <>
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
              disabled={loadingAllNouns}
              style={{cursor: loadingAllNouns ? 'wait' : 'text'}}
            />
            <select
              className="filter-select"
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              disabled={loadingAllNouns}
              style={{cursor: loadingAllNouns ? 'wait' : 'pointer'}}
            >
              <option value="">{loadingAllNouns ? '⏳ Loading...' : 'All Categories'}</option>
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
        
        <div className="data-table" style={{position: 'relative', opacity: loadingAllNouns ? 0.6 : 1}}>
          {nounsLoading && <div className="loading-row">Loading nouns...</div>}
          {loadingAllNouns && !nounsLoading && (
            <div className="loading-row" style={{backgroundColor: '#fff3cd', border: '1px solid #ffc107', padding: '15px', fontWeight: 'bold'}}>
              ⏳ Loading all nouns for filtering... Please wait.
            </div>
          )}
          {!nounsLoading && !loadingAllNouns && (searchText || filterCategory) && (
            <div className="filter-results-info">
              Showing {filteredNouns.length} of {nouns.length} nouns
            </div>
          )}
          <table style={{pointerEvents: loadingAllNouns ? 'none' : 'auto'}}>
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

      <NounModal
        show={showNounModal}
        onClose={() => setShowNounModal(false)}
        noun={editingNoun}
        categories={categories}
        onSave={handleNounSave}
        loading={loading}
        onError={onError}
      />
    </>
  );
}

export default NounManager;
