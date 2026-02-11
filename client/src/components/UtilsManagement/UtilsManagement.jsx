import { useNavigate } from 'react-router-dom';
import { useState } from 'react';
import Navbar from '../Navbar';
import ServerFileList from './ServerFileList';
import './UtilsManagement.css';

function UtilsManagement() {
	const navigate = useNavigate();
	const [selectedUtil, setSelectedUtil] = useState('ServerFileList');

	// Add more utils here as needed
	const utils = [
		{
			key: 'ServerFileList',
			label: 'Server File List',
			component: <ServerFileList />,
		},
		// Future utils can be added here
	];

	const renderUtil = () => {
		const util = utils.find(u => u.key === selectedUtil);
		return util ? util.component : <div>Select a util from the sidebar</div>;
	};

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
			<div className="utils-content utils-flex">
				<div className="utils-sidebar">
					{utils.map(util => (
						<button
							key={util.key}
							className={`utils-sidebar-btn${selectedUtil === util.key ? ' selected' : ''}`}
							onClick={() => setSelectedUtil(util.key)}
						>
							{util.label}
						</button>
					))}
				</div>
				<div className="utils-card">
					{renderUtil()}
				</div>
			</div>
		</div>
	);
}

export default UtilsManagement;
