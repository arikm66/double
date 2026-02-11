import { useParams, useNavigate } from 'react-router-dom';

import { useEffect, useState } from 'react';
import Navbar from '../Navbar';

function PackEdit() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [pack, setPack] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

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
      } catch (err) {
        setError('Failed to fetch pack');
      }
      setLoading(false);
    };
    fetchPack();
  }, [id]);

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
            <>
              <p>Pack editing UI for pack ID: <b>{id}</b> goes here.</p>
              <p><b>Name:</b> {pack.name}</p>
              <p><b>Creator:</b> {pack.creator?.username || 'N/A'}</p>
              <p><b>Cards:</b> {pack.cards?.length ?? 0}</p>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default PackEdit;
