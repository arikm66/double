import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Navbar.css';

function Navbar() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="navbar">
      <div className="navbar-main">
        <div className="navbar-brand">
          <button
            type="button"
            className="navbar-brand-button"
            onClick={() => navigate('/dashboard')}
          >
            Double Cards Game
          </button>
        </div>
        <div className="navbar-links">
          <NavLink
            to="/dashboard"
            className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`}
          >
            Dashboard
          </NavLink>
          <NavLink
            to="/manage"
            className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`}
          >
            Manage
          </NavLink>
        </div>
        <div className="navbar-actions">
          <span className="navbar-user">{user?.username}</span>
          <button type="button" onClick={handleLogout} className="navbar-link-button">
            Log out
          </button>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;
