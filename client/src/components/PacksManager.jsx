
import { useEffect, useState } from 'react';
import { fetchAllPacks } from '../api';
import Navbar from './Navbar';
import { useAuth } from '../context/AuthContext';
import './PacksManager.css';

function PacksManager() {
  const [packs, setPacks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { user } = useAuth();

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
        <div className="user-management-header packs-header">
          <h1>Packs Management</h1>
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
                        <button className="icon-btn" title="Edit Pack" style={{ marginRight: 8 }}>
                          <span role="img" aria-label="edit">✏️</span>
                        </button>
                        {canDelete && (
                          <button className="icon-btn" title="Delete Pack">
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
    </div>
  );
}

export default PacksManager;
