import { useEffect, useState } from 'react';
import Navbar from '../Navbar';
import { useAuth } from '../../context/AuthContext';
import ConfirmDialog from '../ConfirmDialog';
import { useNavigate } from 'react-router-dom';

// MUI
import { Grid, Card, CardContent, Button, Typography, IconButton, Box, Container, Alert } from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import CloseIcon from '@mui/icons-material/Close';

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
    <Container maxWidth="lg" sx={{ pt: 9, pb: 6 }}>
      <Navbar />
      <Box component="header" sx={{ mt: 2, mb: 4, textAlign: 'center' }}>
        <Typography variant="h3" sx={{ m: 0 }}>Packs Management</Typography>
        <Box sx={{ mt: 2 }}>
          <Button variant="contained" color="primary" onClick={() => navigate('/packs/create')}>
            + Create Pack
          </Button>
        </Box>
      </Box>

      <Box component="section">
        {error && (
          <Alert severity="error" sx={{ mb: 2 }} action={<IconButton size="small" color="inherit" onClick={() => setError('')}><CloseIcon fontSize="small" /></IconButton>}>
            {error}
          </Alert>
        )}

        {loading ? (
          <Box sx={{ textAlign: 'center', py: 4 }}>Loading packs...</Box>
        ) : (
          <Grid container spacing={3} sx={{ mt: 4, alignItems: 'flex-start' }}>
            {packs.length === 0 ? (
              <div>No packs found.</div>
            ) : (
              packs.map(pack => {
                const canDelete = user && (user.role === 'admin' || String(user._id) === String(pack.creator?._id));
                return (
                  <Grid item xs={12} sm={6} md={4} lg={3} key={pack._id}>
                    <Card
                      sx={{
                        width: 200,
                        height: 200,
                        borderRadius: '50%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        p: 1.5,
                        boxShadow: '0 6px 18px rgba(0,0,0,0.12)'
                      }}
                    >
                      <CardContent sx={{ height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', p: 1 }}>
                        <Box sx={{ width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <Typography variant="subtitle1" component="div" sx={{ fontSize: 16, fontWeight: 700, textAlign: 'center', wordBreak: 'break-word', flex: 1 }}>
                            {pack.name}
                          </Typography>
                          <Box sx={{ ml: 1, display: 'flex', gap: 0.5 }}>
                            <IconButton size="small" onClick={() => navigate(`/packs/${pack._id}/edit`)} title="Edit Pack" sx={{ color: 'text.primary' }}>
                              <EditIcon fontSize="small" />
                            </IconButton>
                            {canDelete && (
                              <IconButton
                                size="small"
                                onClick={() => handleDeletePack(pack._id, pack.name)}
                                disabled={deletingId === pack._id}
                                title="Delete Pack"
                                sx={{ color: 'error.main' }}
                              >
                                <DeleteIcon fontSize="small" />
                              </IconButton>
                            )}
                          </Box>
                        </Box>
                        <Box mt={2} sx={{ textAlign: 'center' }}>
                          <Typography variant="body2"><b>Creator:</b> {pack.creator?.username || 'N/A'}</Typography>
                          <Typography variant="body2"><b>Cards:</b> {pack.cards?.length ?? 0}</Typography>
                        </Box>
                      </CardContent>
                    </Card>
                  </Grid>
                );
              })
            )}
          </Grid>
        )}
      </Box>

      {showConfirmDialog && (
        <ConfirmDialog
          message={packToDelete ? `Are you sure you want to delete the pack "${packToDelete.name}"? This cannot be undone.` : ''}
          onConfirm={performDeletePack}
          onCancel={cancelDeletePack}
          showDontAskAgain={false}
        />
      )}
    </Container>
  );
}

export default PacksList;
