
import { useEffect, useState } from 'react';

function ServerFileList() {
  const [files, setFiles] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [downloading, setDownloading] = useState('');

  useEffect(() => {
    setLoading(true);
    const token = localStorage.getItem('token');
    fetch('/api/utils/list', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    })
      .then(res => res.json().then(data => ({ ok: res.ok, data })))
      .then(({ ok, data }) => {
        if (ok) {
          setFiles(data.files || []);
        } else {
          setError(data.message || 'Not authorized or error fetching files');
        }
        setLoading(false);
      })
      .catch(err => {
        setError('Failed to fetch files');
        setLoading(false);
      });
  }, []);

  const handleDownload = async (file) => {
    setDownloading(file);
    setError('');
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/utils/file/${encodeURIComponent(file)}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        setError(data.message || 'Failed to download file');
        setDownloading('');
        return;
      }
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = file;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      setError('Failed to download file');
    }
    setDownloading('');
  };

  if (loading) return <div>Loading server files...</div>;
  if (error) return <div style={{ color: 'red' }}>Error: {error}</div>;

  return (
    <div>
      <h3>Server Files</h3>
      <ul>
        {files.map(file => (
          <li key={file}>
            <button
              onClick={() => handleDownload(file)}
              disabled={!!downloading}
              style={{ marginRight: 8 }}
            >
              {downloading === file ? 'Downloading...' : 'Download'}
            </button>
            {file}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default ServerFileList;
