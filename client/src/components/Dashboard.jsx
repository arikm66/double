import { useAuth } from '../context/AuthContext';
import Navbar from './Navbar';
import './Dashboard.css';

function Dashboard() {
  const { user } = useAuth();

  return (
    <div className="dashboard-container">
      <Navbar />
      
      <div className="dashboard-content">
        <div className="user-info-card">
          <h2>User Information</h2>
          <div className="info-item">
            <span className="info-label">Username:</span>
            <span className="info-value">{user?.username}</span>
          </div>
          <div className="info-item">
            <span className="info-label">Email:</span>
            <span className="info-value">{user?.email}</span>
          </div>
          <div className="info-item">
            <span className="info-label">Role:</span>
            <span className="info-value" style={{ textTransform: 'capitalize' }}>{user?.role}</span>
          </div>
          <div className="info-item">
            <span className="info-label">User ID:</span>
            <span className="info-value">{user?.id}</span>
          </div>
        </div>

        <div className="welcome-message">
          <h3>🎉 You're logged in!</h3>
          <p>This is a protected route that only authenticated users can access.</p>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
