import { useState, useEffect, useRef } from 'react';
import ImportProgressModal from './ImportProgressModal';

function ImportManager({ isAdmin, onError, onImportComplete }) {
  const [importFile, setImportFile] = useState(null);
  const [importLoading, setImportLoading] = useState(false);
  const [importResults, setImportResults] = useState(null);
  const [importProgress, setImportProgress] = useState({ 
    current: 0, 
    total: 0, 
    percentage: 0, 
    currentNoun: '', 
    message: '', 
    stats: null 
  });
  const [elapsedTime, setElapsedTime] = useState(0);
  const importFileInputRef = useRef(null);
  const importResultsRef = useRef(null);
  const timerRef = useRef(null);
  const startTimeRef = useRef(null);

  // Elapsed time timer for import progress
  useEffect(() => {
    if (importLoading && importProgress.total > 0) {
      // Start timer
      startTimeRef.current = Date.now();
      setElapsedTime(0);
      timerRef.current = setInterval(() => {
        const elapsed = Math.floor((Date.now() - startTimeRef.current) / 1000);
        setElapsedTime(elapsed);
      }, 1000);
    } else {
      // Stop timer
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [importLoading, importProgress.total]);

  // Auto-scroll to results after import completes
  useEffect(() => {
    if (importResults && !importLoading && importResultsRef.current) {
      setTimeout(() => {
        importResultsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 300);
    }
  }, [importResults, importLoading]);

  const formatElapsedTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleImportFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.type !== 'application/json') {
        onError('Please select a JSON file');
        return;
      }
      setImportFile(file);
      setImportResults(null);
      setImportProgress({ current: 0, total: 0, percentage: 0, currentNoun: '', message: '', stats: null });
      onError('');
    }
  };

  const handleImportNouns = async () => {
    if (!importFile) {
      onError('Please select a file first');
      return;
    }

    setImportLoading(true);
    onError('');
    setImportResults(null);
    setImportProgress({ current: 0, total: 0, percentage: 0, currentNoun: '', message: 'Reading file...', stats: null });

    try {
      // Read the file
      const fileContent = await importFile.text();
      const jsonData = JSON.parse(fileContent);

      // Validate it's an array
      if (!Array.isArray(jsonData)) {
        onError('Invalid JSON format. Expected a direct array of noun objects.');
        setImportLoading(false);
        setImportProgress({ current: 0, total: 0, percentage: 0, currentNoun: '', message: '', stats: null });
        return;
      }

      const token = localStorage.getItem('token');
      
      // Create a fetch request to get the stream
      const response = await fetch('http://localhost:5000/api/import/nouns-sse', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(jsonData)
      });

      if (!response.ok) {
        throw new Error('Server returned error status: ' + response.status);
      }

      // Read the stream
      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';

      while (true) {
        const { value, done } = await reader.read();
        
        if (done) break;
        
        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n\n');
        buffer = lines.pop() || ''; // Keep incomplete message in buffer

        for (const line of lines) {
          if (!line.trim()) continue;
          
          // Parse SSE format: "event: eventName\ndata: jsonData"
          const eventMatch = line.match(/event:\s*(.+)/);
          const dataMatch = line.match(/data:\s*(.+)/);
          
          if (eventMatch && dataMatch) {
            const eventType = eventMatch[1].trim();
            const eventData = JSON.parse(dataMatch[1]);
            
            switch (eventType) {
              case 'progress':
                setImportProgress({
                  current: eventData.current,
                  total: eventData.total,
                  percentage: eventData.percentage,
                  currentNoun: eventData.currentNoun || '',
                  message: eventData.message || '',
                  stats: eventData.stats
                });
                break;
                
              case 'complete':
                setImportResults(eventData);
                setImportProgress({ 
                  current: eventData.stats.total, 
                  total: eventData.stats.total, 
                  percentage: 100, 
                  currentNoun: '',
                  message: 'Import completed!',
                  stats: eventData.stats
                });
                // Notify parent to refresh data
                if (onImportComplete) {
                  onImportComplete();
                }
                break;
                
              case 'error':
                onError(eventData.message || 'Import failed');
                if (eventData.stats) {
                  setImportResults(eventData);
                }
                break;
            }
          }
        }
      }

    } catch (err) {
      console.error('Import error:', err);
      // Better error messages
      if (err.name === 'SyntaxError') {
        onError('Invalid JSON in file. Please check the file format.');
      } else if (err.message.includes('Failed to fetch')) {
        onError('Cannot connect to server. Please ensure the server is running.');
      } else {
        onError('Error importing nouns: ' + err.message);
      }
    } finally {
      setImportLoading(false);
    }
  };

  const clearImport = () => {
    setImportFile(null);
    setImportResults(null);
    setImportProgress({ current: 0, total: 0, percentage: 0, currentNoun: '', message: '', stats: null });
    onError('');
    // Reset the file input to allow reselecting the same file
    if (importFileInputRef.current) {
      importFileInputRef.current.value = '';
    }
  };

  if (!isAdmin) {
    return null;
  }

  return (
    <>
      <div className="tab-content">
        <div className="content-header">
          <h2>Import Nouns from JSON</h2>
        </div>
        
        <div className="import-section">
          <div className="import-instructions">
            <h3>Instructions</h3>
            <p>Upload a JSON file with the following format:</p>
            <pre>{`[
  {
    "nameEn": "apple",
    "nameHe": "תפוח",
    "categoryHe": "פירות",
    "imageUrl": "optional"
  },
  {
    "nameEn": "banana",
    "nameHe": "בננה",
    "categoryHe": "פירות"
  }
]`}</pre>
            <ul>
              <li>Upload a direct JSON array of noun objects</li>
              <li>Nouns with existing <code>nameEn</code> will be skipped</li>
              <li>Use <code>categoryHe</code> field with Hebrew category name</li>
              <li>Categories will be automatically created if they don't exist</li>
              <li>Nouns without a <code>categoryHe</code> field will be ignored</li>
              <li>A detailed log file will be generated on the server</li>
            </ul>
          </div>

          <div className="import-upload">
            <div className="form-group">
              <label>Select JSON File</label>
              <input
                ref={importFileInputRef}
                type="file"
                accept=".json"
                onChange={handleImportFileChange}
                disabled={importLoading}
              />
              {importFile && (
                <div className="file-info">
                  <span>📄 {importFile.name}</span>
                  <button 
                    onClick={clearImport}
                    className="clear-file-btn"
                    disabled={importLoading}
                  >
                    ✕
                  </button>
                </div>
              )}
            </div>

            <button
              onClick={handleImportNouns}
              className="import-btn"
              disabled={!importFile || importLoading}
            >
              {importLoading ? '⏳ Importing...' : '📥 Import Nouns'}
            </button>
          </div>

          {importResults && importResults.stats && (
            <div className="import-results" ref={importResultsRef}>
              <h3>Import Results</h3>
              <div className="results-stats">
                <div className="stat-card">
                  <div className="stat-number">{importResults.stats.total}</div>
                  <div className="stat-label">Total Processed</div>
                </div>
                <div className="stat-card success">
                  <div className="stat-number">{importResults.stats.imported}</div>
                  <div className="stat-label">Imported</div>
                </div>
                <div className="stat-card skipped">
                  <div className="stat-number">{importResults.stats.skipped}</div>
                  <div className="stat-label">Skipped (Exists)</div>
                </div>
                <div className="stat-card created">
                  <div className="stat-number">{importResults.stats.categoriesCreated || 0}</div>
                  <div className="stat-label">Categories Created</div>
                </div>
                <div className="stat-card error">
                  <div className="stat-number">{importResults.stats.errors}</div>
                  <div className="stat-label">Errors</div>
                </div>
              </div>
              <div className="results-info">
                <p><strong>Duration:</strong> {importResults.duration}</p>
                <p><strong>Log file:</strong> {importResults.logFile}</p>
                <p className="log-note">Log file saved on server in the server root directory</p>
              </div>
            </div>
          )}
        </div>
      </div>

      <ImportProgressModal
        show={importLoading}
        progress={importProgress}
        elapsedTime={elapsedTime}
        formatElapsedTime={formatElapsedTime}
      />
    </>
  );
}

export default ImportManager;
