import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import './Manage.css';

function Manage() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="manage-container">
      <nav className="navbar">
        <div className="navbar-brand">
          <h2>Manage</h2>
        </div>
        <div className="navbar-menu">
          <button onClick={() => navigate('/dashboard')} className="nav-button">
            Dashboard
          </button>
          <span className="navbar-user">
            {user?.username}
          </span>
          <button onClick={handleLogout} className="logout-button">
            Logout
          </button>
        </div>
      </nav>
      
      <div className="manage-content">
        <h1>Manage Section</h1>
        <p>This is the manage section where you can manage your resources.</p>
        
        <div className="manage-grid">
          <div className="manage-card">
            <h3>Users</h3>
            <p>Manage user accounts and permissions</p>
            <button className="manage-card-button">View Users</button>
          </div>
          
          <div className="manage-card">
            <h3>Settings</h3>
            <p>Configure application settings</p>
            <button className="manage-card-button">View Settings</button>
          </div>
          
          <div className="manage-card">
            <h3>Reports</h3>
            <p>View analytics and reports</p>
            <button className="manage-card-button">View Reports</button>
          </div>
          
          <div className="manage-card">
            <h3>Data</h3>
            <p>Manage application data</p>
            <button 
              className="manage-card-button"
              onClick={() => navigate('/data-management')}
            >
              View Data
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Manage;
