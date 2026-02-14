import { useParams, useNavigate } from 'react-router-dom';

import { useEffect, useState } from 'react';
import Navbar from '../Navbar';

// MUI
import { Card, CardContent, TextField, Button, Typography, Box, Container, Alert } from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';

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
    <Container maxWidth="md" sx={{ pt: 9, pb: 6 }}>
      <Navbar />

      <Box component="header" sx={{ mt: 2, mb: 4, display: 'flex', alignItems: 'center', gap: 2 }}>
        <Button startIcon={<ArrowBackIcon />} variant="text" onClick={() => navigate('/packs')}>
          Back to Packs
        </Button>
        <Typography variant="h4" sx={{ flex: 1, textAlign: 'left', ml: 1 }}>Edit Pack</Typography>
      </Box>

      <Box>
        {loading ? (
          <Card sx={{ py: 6, textAlign: 'center' }}>Loading pack...</Card>
        ) : error ? (
          <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>
        ) : !pack ? (
          <Card sx={{ py: 6, textAlign: 'center' }}>Pack not found.</Card>
        ) : (
          <Card sx={{ mt: 6, mx: 'auto', width: '90%', maxWidth: 920, p: 2, borderRadius: 2, boxShadow: '0 4px 12px rgba(0,0,0,0.06)' }}>
            <CardContent>
              <form onSubmit={handleSave}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2, flexWrap: 'wrap' }}>
                  <TextField
                    id="pack-name"
                    label="Name"
                    value={name}
                    onChange={e => setName(e.target.value)}
                    required
                    variant="outlined"
                    size="small"
                    sx={{ flex: '0 1 420px', maxWidth: '100%' }}
                  />
                  <Button type="submit" variant="contained" color="primary" disabled={saving} sx={{ height: 40 }}>
                    {saving ? 'Saving...' : 'Save & Return'}
                  </Button>
                </Box>

                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1 }}>
                  <Typography variant="subtitle2" sx={{ minWidth: 80 }}>Creator:</Typography>
                  <Typography variant="body2">{pack.creator?.username || 'N/A'}</Typography>
                </Box>

                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1 }}>
                  <Typography variant="subtitle2" sx={{ minWidth: 80 }}>Cards:</Typography>
                  <Typography variant="body2">{pack.cards?.length ?? 0}</Typography>
                </Box>
              </form>
            </CardContent>
          </Card>
        )}
      </Box>
    </Container>
  );
}

export default PackEdit;
