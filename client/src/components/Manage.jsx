import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import Navbar from './Navbar';
import './Manage.css';

function Manage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';

  return (
    <div className="manage-container">
      <Navbar />
      
      <div className="manage-content">
        <h1>Manage Section</h1>
        <p>This is the manage section where you can manage your resources.</p>
        
        <div className="manage-grid">
          {isAdmin && (
            <>
              <div className="manage-card">
                <h3>Users</h3>
                <p>Manage user accounts</p>
                <button 
                  className="manage-card-button"
                  onClick={() => navigate('/user-management')}
                >
                  View Users
                </button>
              </div>
              <div className="manage-card">
                <h3>Utils</h3>
                <p>Admin utilities and server files</p>
                <button 
                  className="manage-card-button"
                  onClick={() => navigate('/utils')}
                >
                  View Utils
                </button>
              </div>
            </>
          )}
          
          <div className="manage-card">
            <h3>Settings</h3>
            <p>Configure application settings</p>
            <button className="manage-card-button">View Settings</button>
          </div>
          
            <div className="manage-card">
              <h3>Packs</h3>
              <p>Manage packs and collections</p>
              <button 
                className="manage-card-button"
                onClick={() => navigate('/packs')}
              >
                View Packs
              </button>
            </div>

          <div className="manage-card">
            <h3>Reports</h3>
            <p>View analytics and reports</p>
            <button className="manage-card-button">View Reports</button>
          </div>
          
          <div className="manage-card">
            <h3>Data</h3>
            <p>Manage nouns and categories</p>
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
