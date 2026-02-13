import { useParams, useNavigate } from 'react-router-dom';

import { useEffect, useState } from 'react';
import Navbar from '../Navbar';

function PackEdit() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [pack, setPack] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [name, setName] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const fetchPack = async () => {
      setLoading(true);
      setError('');
      try {
        const token = localStorage.getItem('token');
        const response = await fetch(`/api/packs/${id}`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        if (!response.ok) throw new Error('Failed to fetch pack');
        const data = await response.json();
        setPack(data);
        setName(data.name || '');
      } catch (err) {
        setError('Failed to fetch pack');
      }
      setLoading(false);
    };
    fetchPack();
  }, [id]);

  const handleSave = async (e) => {
    e.preventDefault();
    if (!pack) return;
    setSaving(true);
    setError('');
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/packs/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ name })
      });
      if (!response.ok) throw new Error('Failed to save pack');
      navigate('/packs');
    } catch (err) {
      setError('Failed to save pack');
    }
    setSaving(false);
  };

  return (
    <div className="user-management-container">
      <Navbar />
      <div className="user-sticky">
        <div className="user-management-header packs-header">
          <button className="back-button" onClick={() => navigate('/packs')}>
            ← Back to Packs
          </button>
          <h1>Edit Pack</h1>
        </div>
      </div>
      <div className="user-management-content">
        <div className="packs-edit-form">
          {loading ? (
            <p>Loading pack...</p>
          ) : error ? (
            <p style={{ color: 'red' }}>{error}</p>
          ) : !pack ? (
            <p>Pack not found.</p>
          ) : (
            <form onSubmit={handleSave}>
                <div className="form-row">
                  <label htmlFor="pack-name">Name:</label>
                  <input
                    id="pack-name"
                    type="text"
                    value={name}
                    onChange={e => setName(e.target.value)}
                    required
                  />
                  <button type="submit" className="save-btn inline-save" disabled={saving}>
                    {saving ? 'Saving...' : 'Save'}
                  </button>
                </div>
              <div className="form-row">
                <label>Creator:</label>
                <span>{pack.creator?.username || 'N/A'}</span>
              </div>
              <div className="form-row">
                <label>Cards:</label>
                <span>{pack.cards?.length ?? 0}</span>
              </div>

            </form>
          )}
        </div>
      </div>
    </div>
  );
}

export default PackEdit;
