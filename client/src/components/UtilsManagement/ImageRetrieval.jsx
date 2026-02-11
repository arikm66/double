import React, { useState } from 'react';

function ImageRetrieval() {
    const [data, setData] = useState(null);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [progress, setProgress] = useState(0);
    const [status, setStatus] = useState('');
    const [folderFiles, setFolderFiles] = useState([]);
    const [folderName, setFolderName] = useState('');
    const folderInputRef = React.useRef(null);

    const handleFolderChange = (e) => {
        const files = Array.from(e.target.files);
        setFolderFiles(files);
        if (files.length > 0) {
            const fakePath = files[0].webkitRelativePath || files[0].name;
            const folder = fakePath.split('/')[0];
            setFolderName(folder);
        } else {
            setFolderName('');
        }
    };

    const clearFolder = () => {
        setFolderFiles([]);
        setFolderName('');
        if (folderInputRef.current) {
            folderInputRef.current.value = '';
        }
    };

    const handleRetrieve = () => {
        let isMounted = true;
        setLoading(true);
        setError('');
        setProgress(0);
        setStatus('');
        setData(null);
        const token = localStorage.getItem('token');

        fetch('/api/utils/imageret', {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        })
            .then(async res => {
                if (!res.ok) {
                    const data = await res.json().catch(() => ({}));
                    throw new Error(data.message || 'Error fetching image retrieval data');
                }
                // Handle SSE stream
                const reader = res.body.getReader();
                const decoder = new TextDecoder();
                let buffer = '';
                while (true) {
                    const { value, done } = await reader.read();
                    if (done) break;
                    buffer += decoder.decode(value, { stream: true });
                    const lines = buffer.split('\n\n');
                    buffer = lines.pop() || '';
                    for (const line of lines) {
                        if (!line.trim()) continue;
                        const eventMatch = line.match(/event:\s*(.+)/);
                        const dataMatch = line.match(/data:\s*(.+)/);
                        if (eventMatch && dataMatch) {
                            const eventType = eventMatch[1].trim();
                            const eventData = JSON.parse(dataMatch[1]);
                            if (!isMounted) return;
                            switch (eventType) {
                                case 'progress':
                                    setProgress(eventData.progress || 0);
                                    setStatus(eventData.status || '');
                                    break;
                                case 'complete':
                                    setData(eventData.data || null);
                                    setProgress(1);
                                    setStatus(eventData.status || 'Completed');
                                    setLoading(false);
                                    break;
                                case 'error':
                                    setError(eventData.message || 'Image retrieval failed');
                                    setStatus(eventData.status || 'Error');
                                    setLoading(false);
                                    break;
                                default:
                                    break;
                            }
                        }
                    }
                }
                setLoading(false);
            })
            .catch((err) => {
                if (!isMounted) return;
                setError(err.message || 'Failed to fetch image retrieval data');
                setLoading(false);
            });
    };

    return (
        <div className="import-section">
            <div className="import-upload">
                <div className="form-group">
                    <label>Select Images Folder</label>
                    <input
                        ref={folderInputRef}
                        type="file"
                        webkitdirectory="true"
                        directory="true"
                        multiple
                        onChange={handleFolderChange}
                        disabled={loading}
                    />
                    {folderFiles.length > 0 && (
                        <div className="file-info">
                            <span>📁 {folderName}</span>
                            <button
                                onClick={clearFolder}
                                className="clear-file-btn"
                                disabled={loading}
                            >
                                ✕
                            </button>
                        </div>
                    )}
                </div>
                <button
                    onClick={handleRetrieve}
                    className="import-btn"
                    disabled={folderFiles.length === 0 || loading}
                >
                    {loading ? '⏳ Retrieving...' : '📂 Retrieve'}
                </button>
            </div>
            {loading && <div>Loading...</div>}
            {status && <div>Status: {status}</div>}
            {typeof progress === 'number' && progress < 1 && (
                <div>Progress: {(progress * 100).toFixed(1)}%</div>
            )}
            {error && <div style={{ color: 'red' }}>Error: {error}</div>}
            {/* Data display will be defined later */}
            {data && <pre>{JSON.stringify(data, null, 2)}</pre>}
        </div>
    );
}

export default ImageRetrieval;
