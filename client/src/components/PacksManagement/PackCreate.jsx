import Navbar from '../Navbar';
import { useNavigate } from 'react-router-dom';
import './PacksManagement.css';

function PackCreate() {
  const navigate = useNavigate();

  return (
    <div className="user-management-container">
      <Navbar />
      <div className="user-sticky">
        <div className="user-management-header packs-header">
          <button className="back-button" onClick={() => navigate('/packs')}>
            ← Back to Packs
          </button>
          <h1>Create Pack</h1>
        </div>
      </div>
      <div className="user-management-content">
        <div className="packs-create-form">
          <p>Pack creation UI goes here.</p>
        </div>
      </div>
    </div>
  );
}

export default PackCreate;
