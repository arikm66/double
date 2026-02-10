import { useNavigate } from 'react-router-dom';
import Navbar from './Navbar';
import ServerFileList from './ServerFileList';
import './Utils.css';

function Utils() {
  const navigate = useNavigate();
  return (
    <div className="utils-container">
      <Navbar />
      <div className="utils-sticky">
        <div className="utils-header">
          <button className="utils-back-button" onClick={() => navigate('/manage')}>
            ← Back to Manage
          </button>
          <h1>Utils</h1>
        </div>
        <div className="utils-description">
          Admin utilities and server files
        </div>
      </div>
      <div className="utils-content">
        <div className="utils-card">
          <ServerFileList />
        </div>
      </div>
    </div>
  );
}

export default Utils;
