import { useNavigate } from 'react-router-dom';
import Navbar from '../Navbar';
import ServerFileList from './ServerFileList';
import './UtilsManagement.css';

function UtilsManagement() {
	const navigate = useNavigate();
	return (
		<div className="utils-container">
			<Navbar />
			<div className="utils-sticky">
				<div className="utils-header">
					<button className="utils-back-button" onClick={() => navigate('/manage')}>
						← Back to Manage
					</button>
					<h1>UtilsManagement</h1>
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

export default UtilsManagement;
