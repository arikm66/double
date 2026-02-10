import { useState, useCallback, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import Navbar from '../Navbar';
import ConfirmDialog from '../ConfirmDialog';
import CategoryManager from './CategoryManager';
import NounManager from './NounManager';
import ImportManager from './ImportManager';
import './DataManagement.css';

function DataManagement() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const isAdmin = user?.role === 'admin';
  const [activeTab, setActiveTab] = useState('categories');
  const [error, setError] = useState('');
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [deleteAction, setDeleteAction] = useState(null);
  const [deleteMessage, setDeleteMessage] = useState('');
  const [categories, setCategories] = useState([]);
  const [categoriesTotal, setCategoriesTotal] = useState(0);
  const [nounsTotal, setNounsTotal] = useState(0);

  // Fetch categories for nouns dropdown and tab count
  const fetchCategories = useCallback(async () => {
    try {
      const response = await fetch('/api/categories?page=1&limit=1000');
      const data = await response.json();
      setCategories(data.categories || []);
      setCategoriesTotal(typeof data.total === 'number' ? data.total : data.categories.length);
    } catch (err) {
      console.error('Failed to fetch categories:', err);
    }
  }, []);

  // Fetch nouns count for tab display
  const fetchNounsTotal = useCallback(async () => {
    try {
      const response = await fetch('/api/nouns?page=1&limit=1');
      const data = await response.json();
      setNounsTotal(typeof data.total === 'number' ? data.total : 0);
    } catch (err) {
      console.error('Failed to fetch nouns total:', err);
    }
  }, []);

  useEffect(() => {
    fetchCategories();
    fetchNounsTotal();
  }, [fetchCategories, fetchNounsTotal]);

  const handleError = useCallback((message) => {
    setError(message);
  }, []);

  const handleDeleteRequest = useCallback((message, action) => {
    setDeleteMessage(message);
    setDeleteAction(() => action);
    setShowConfirmDialog(true);
  }, []);

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

  const handleCategoryUpdate = useCallback(() => {
    fetchCategories();
  }, [fetchCategories]);

  const handleNounUpdate = useCallback(() => {
    fetchNounsTotal();
  }, [fetchNounsTotal]);

  const handleImportComplete = useCallback(() => {
    fetchCategories();
    fetchNounsTotal();
  }, [fetchCategories, fetchNounsTotal]);

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
            Categories ({categoriesTotal})
          </button>
          <button 
            className={`tab-button ${activeTab === 'nouns' ? 'active' : ''}`}
            onClick={() => setActiveTab('nouns')}
          >
            Nouns ({nounsTotal})
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
          <CategoryManager
            isAdmin={isAdmin}
            onError={handleError}
            onDeleteRequest={handleDeleteRequest}
            onCategoryUpdate={handleCategoryUpdate}
          />
        )}

        {activeTab === 'nouns' && (
          <NounManager
            isAdmin={isAdmin}
            categories={categories}
            onError={handleError}
            onDeleteRequest={handleDeleteRequest}
            onNounUpdate={handleNounUpdate}
          />
        )}

        {activeTab === 'import' && (
          <ImportManager
            isAdmin={isAdmin}
            onError={handleError}
            onImportComplete={handleImportComplete}
          />
        )}
      </div>

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
