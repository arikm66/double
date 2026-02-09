import { useState, useEffect, useCallback, useRef } from 'react';
import CategoryModal from './CategoryModal';

function CategoryManager({ isAdmin, onError, onDeleteRequest, onCategoryUpdate }) {
  const CATEGORIES_PAGE_SIZE = 50;
  const [categories, setCategories] = useState([]);
  const [categoriesTotal, setCategoriesTotal] = useState(0);
  const [categoriesPage, setCategoriesPage] = useState(1);
  const [categoriesHasMore, setCategoriesHasMore] = useState(true);
  const [categoriesLoading, setCategoriesLoading] = useState(false);
  const [categoriesLoadingMore, setCategoriesLoadingMore] = useState(false);
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [loading, setLoading] = useState(false);
  const categoriesLoadMoreRef = useRef(null);

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
      onError('Failed to fetch categories');
    }

    if (isFirstPage) {
      setCategoriesLoading(false);
    } else {
      setCategoriesLoadingMore(false);
    }
  }, [CATEGORIES_PAGE_SIZE, onError]);

  const resetCategories = useCallback(() => {
    setCategories([]);
    setCategoriesPage(1);
    setCategoriesHasMore(true);
    fetchCategories(1, true);
    if (onCategoryUpdate) {
      onCategoryUpdate();
    }
  }, [fetchCategories, onCategoryUpdate]);

  useEffect(() => {
    fetchCategories(1, true);
  }, [fetchCategories]);

  useEffect(() => {
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
  }, [categoriesHasMore, categoriesLoading, categoriesLoadingMore, categoriesPage, fetchCategories]);

  const openCategoryModal = (category = null) => {
    setEditingCategory(category);
    setShowCategoryModal(true);
  };

  const handleCategorySave = async (categoryForm, editingCategory) => {
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
        setEditingCategory(null);
      } else {
        onError('Failed to save category');
      }
    } catch (err) {
      onError('Error saving category');
    }
    setLoading(false);
  };

  const handleDeleteCategory = (id) => {
    if (!isAdmin) {
      onError('Only admins can delete categories');
      return;
    }
    
    onDeleteRequest(
      'Are you sure you want to delete this category? All nouns in this category will also be deleted.',
      () => performDeleteCategory(id)
    );
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
        setCategories((prev) => {
          const filtered = prev.filter((cat) => cat._id !== id);
          const removedCount = prev.length - filtered.length;
          if (removedCount > 0) {
            setCategoriesTotal((total) => Math.max(total - removedCount, 0));
          }
          return filtered;
        });
      } else if (response.status === 403) {
        onError('Only admins can delete categories');
      } else {
        onError('Failed to delete category');
      }
    } catch (err) {
      onError('Error deleting category');
    }
  };

  return (
    <>
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

      <CategoryModal
        show={showCategoryModal}
        onClose={() => setShowCategoryModal(false)}
        category={editingCategory}
        onSave={handleCategorySave}
        loading={loading}
      />
    </>
  );
}

export default CategoryManager;
