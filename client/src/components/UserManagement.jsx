import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from './Navbar';
import ConfirmDialog from './ConfirmDialog';
import './UserManagement.css';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import ReplayIcon from '@mui/icons-material/Replay';
import CloseIcon from '@mui/icons-material/Close';

function UserManagement() {
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [userToDelete, setUserToDelete] = useState(null);
  const [form, setForm] = useState({
    username: '',
    email: '',
    role: 'player',
    password: ''
  });

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/users', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();
      if (response.ok) {
        setUsers(data.users || []);
      } else {
        setError(data.message || 'Failed to fetch users');
      }
    } catch (err) {
      setError('Failed to fetch users');
    }
    setLoading(false);
  };

  const openCreateModal = () => {
    setEditingUser(null);
    setForm({ username: '', email: '', role: 'player', password: '' });
    setShowModal(true);
  };

  const openEditModal = (user) => {
    setEditingUser(user);
    setForm({
      username: user.username,
      email: user.email,
      role: user.role,
      password: ''
    });
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const token = localStorage.getItem('token');
      const url = editingUser
        ? `/api/users/${editingUser._id}`
        : '/api/users';

      const payload = {
        username: form.username.trim(),
        email: form.email.trim(),
        role: form.role
      };

      if (!editingUser || form.password.trim()) {
        payload.password = form.password;
      }

      const response = await fetch(url, {
        method: editingUser ? 'PUT' : 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });

      const data = await response.json();

      if (response.ok) {
        setShowModal(false);
        setForm({ username: '', email: '', role: 'player', password: '' });
        setEditingUser(null);
        fetchUsers();
      } else {
        setError(data.message || 'Failed to save user');
      }
    } catch (err) {
      setError('Failed to save user');
    }

    setLoading(false);
  };

  const handleDelete = (userId) => {
    const skipConfirmation = localStorage.getItem('skipDeleteConfirmation') === 'true';
    
    if (skipConfirmation) {
      performDelete(userId);
    } else {
      setUserToDelete(userId);
      setShowConfirmDialog(true);
    }
  };

  const performDelete = async (userId) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/users/${userId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();

      if (response.ok) {
        fetchUsers();
      } else {
        setError(data.message || 'Failed to delete user');
      }
    } catch (err) {
      setError('Failed to delete user');
    }
  };

  const handleConfirmDelete = () => {
    setShowConfirmDialog(false);
    if (userToDelete) {
      performDelete(userToDelete);
      setUserToDelete(null);
    }
  };

  const handleCancelDelete = () => {
    setShowConfirmDialog(false);
    setUserToDelete(null);
  };

  const handleRestoreDefaults = () => {
    localStorage.removeItem('skipDeleteConfirmation');
    setError('');
    setSuccessMessage('Delete confirmations restored! You will be asked for confirmation on future deletions.');
    setTimeout(() => setSuccessMessage(''), 4000);
  };

  return (
    <div className="user-management-container">
      <Navbar />

      <div className="user-sticky">
        <div className="user-management-header">
          <button className="back-button" onClick={() => navigate('/manage')}>
            ← Back to Manage
          </button>
          <h1>User Management</h1>
          <div className="header-buttons">
            <button className="restore-button" onClick={handleRestoreDefaults} title="Restore delete confirmation prompts">
              <ReplayIcon style={{ verticalAlign: 'middle', marginRight: 8 }} /> Restore Confirmations
            </button>
            <button className="primary-button" onClick={openCreateModal}>
              + Add User
            </button>
          </div>
        </div>
      </div>

      <div className="user-management-content">
        {error && (
          <div className="error-banner">
            <span>{error}</span>
            <button className="error-close" onClick={() => setError('')}><CloseIcon /></button>
          </div>
        )}
        {successMessage && <div className="success-banner">{successMessage}</div>}

        <div className="user-management-card">
          {loading && <div className="loading-row">Loading users...</div>}
          <div className="data-table">
            <table>
              <thead>
                <tr>
                  <th>Username</th>
                  <th>Email</th>
                  <th>Role</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <tr key={user._id}>
                    <td>{user.username}</td>
                    <td>{user.email}</td>
                    <td className="role-cell">{user.role}</td>
                    <td>
                      <button
                        className="icon-btn"
                        title="Edit User"
                        style={{ marginRight: 8 }}
                        onClick={() => openEditModal(user)}
                      >
                        <EditIcon />
                      </button>
                      <button
                        className="icon-btn delete-btn"
                        title="Delete User"
                        onClick={() => handleDelete(user._id)}
                      >
                        <DeleteIcon />
                      </button>
                    </td>
                  </tr>
                ))}
                {!loading && users.length === 0 && (
                  <tr>
                    <td colSpan="4" className="empty-row">No users found.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h3>{editingUser ? 'Edit User' : 'Add User'}</h3>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Username</label>
                <input
                  type="text"
                  value={form.username}
                  onChange={(e) => setForm({ ...form, username: e.target.value })}
                  required
                />
              </div>
              <div className="form-group">
                <label>Email</label>
                <input
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  required
                />
              </div>
              <div className="form-group">
                <label>Role</label>
                <select
                  value={form.role}
                  onChange={(e) => setForm({ ...form, role: e.target.value })}
                >
                  <option value="admin">Admin</option>
                  <option value="therapist">Therapist</option>
                  <option value="player">Player</option>
                </select>
              </div>
              <div className="form-group">
                <label>Password</label>
                <input
                  type="password"
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  placeholder={editingUser ? 'Leave blank to keep current' : 'Enter password'}
                  required={!editingUser}
                />
              </div>
              <div className="modal-actions">
                <button type="submit" className="save-btn" disabled={loading}>
                  {loading ? 'Saving...' : 'Save'}
                </button>
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="cancel-btn"
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
          message="Are you sure you want to delete this user?"
          onConfirm={handleConfirmDelete}
          onCancel={handleCancelDelete}
        />
      )}
    </div>
  );
}

export default UserManagement;
