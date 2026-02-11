import { useEffect, useState } from 'react';
import Navbar from '../Navbar';
import { useAuth } from '../../context/AuthContext';
import ConfirmDialog from '../ConfirmDialog';
import './PacksManagement.css';
import { useNavigate } from 'react-router-dom';

// API functions implemented locally
const fetchAllPacks = async () => {
  try {
    const token = localStorage.getItem('token');
    const response = await fetch('/api/packs', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    if (!response.ok) throw new Error('Failed to fetch packs');
    return await response.json();
  } catch (error) {
    console.error('Error fetching packs:', error);
    throw error;
  }
};

const deletePack = async (id) => {
  try {
    const token = localStorage.getItem('token');
    const response = await fetch(`/api/packs/${id}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    if (!response.ok) {
      const data = await response.json();
      throw new Error(data.error || 'Failed to delete pack');
    }
    return await response.json();
  } catch (error) {
    console.error('Error deleting pack:', error);
    throw error;
  }
};

function PacksList() {
  const [packs, setPacks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [deletingId, setDeletingId] = useState(null);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [packToDelete, setPackToDelete] = useState(null);
  const { user } = useAuth();
  const navigate = useNavigate();

  const handleDeletePack = (id, name) => {
    setPackToDelete({ id, name });
    setShowConfirmDialog(true);
  };

  const performDeletePack = async () => {
    if (!packToDelete) return;
    setDeletingId(packToDelete.id);
    setError('');
    try {
      await deletePack(packToDelete.id);
      setPacks(prev => prev.filter(p => p._id !== packToDelete.id));
    } catch (err) {
      setError(err.message || 'Failed to delete pack');
    }
    setDeletingId(null);
    setShowConfirmDialog(false);
    setPackToDelete(null);
  };

  const cancelDeletePack = () => {
    setShowConfirmDialog(false);
    setPackToDelete(null);
  };

  useEffect(() => {
    const getPacks = async () => {
      setLoading(true);
      setError('');
      try {
        const data = await fetchAllPacks();
        setPacks(data);
      } catch (err) {
        setError('Failed to fetch packs');
      }
      setLoading(false);
    };
    getPacks();
  }, []);

  return (
    <div className="user-management-container">
      <Navbar />
      <div className="user-sticky">
        <div className="user-management-header packs-header" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <h1 style={{ margin: 0 }}>Packs Management</h1>
          <div className="header-buttons">
            <button className="primary-button" onClick={() => navigate('/packs/create')}>
              + Add Pack
            </button>
          </div>
        </div>
      </div>
      <div className="user-management-content">
        {error && (
          <div className="error-banner">
            <span>{error}</span>
            <button className="error-close" onClick={() => setError('')}>✕</button>
          </div>
        )}
        {loading ? (
          <div className="loading-row">Loading packs...</div>
        ) : (
          <div className="packs-grid">
            {packs.length === 0 ? (
              <div>No packs found.</div>
            ) : (
              packs.map(pack => {
                const canDelete = user && (user.role === 'admin' || String(user._id) === String(pack.creator?._id));
                return (
                  <div className="packs-card" key={pack._id}>
                    <div className="manage-card-header">
                      <h3 style={{ margin: 0 }}>{pack.name}</h3>
                      <span>
                        <button
                          className="icon-btn"
                          title="Edit Pack"
                          style={{ marginRight: 8 }}
                          onClick={() => navigate(`/packs/${pack._id}/edit`)}
                        >
                          <span role="img" aria-label="edit">✏️</span>
                        </button>
                        {canDelete && (
                          <button
                            className="icon-btn delete-btn"
                            title="Delete Pack"
                            onClick={() => handleDeletePack(pack._id, pack.name)}
                            disabled={deletingId === pack._id}
                          >
                            <span role="img" aria-label="delete">🗑️</span>
                          </button>
                        )}
                      </span>
                    </div>
                    <div className="manage-card-body">
                      <p><b>Creator:</b> {pack.creator?.username || 'N/A'}</p>
                      <p><b>Cards:</b> {pack.cards?.length ?? 0}</p>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        )}
      </div>
      {showConfirmDialog && (
        <ConfirmDialog
          message={packToDelete ? `Are you sure you want to delete the pack "${packToDelete.name}"? This cannot be undone.` : ''}
          onConfirm={performDeletePack}
          onCancel={cancelDeletePack}
        />
      )}
    </div>
  );
}

export default PacksList;
