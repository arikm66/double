function ImportProgressModal({ show, progress, elapsedTime, formatElapsedTime }) {
  if (!show || progress.total === 0) return null;

  return (
    <div className="modal-overlay progress-modal-overlay">
      <div className="modal-content progress-modal-content">
        <div className="import-progress">
          <h3>Import in Progress</h3>
          <div className="progress-info">
            <div className="progress-text">
              <strong>{progress.current} / {progress.total}</strong> nouns processed
              {progress.currentNoun && (
                <span className="progress-current-noun">Currently processing: <strong>{progress.currentNoun}</strong></span>
              )}
              {progress.message && <span className="progress-message">{progress.message}</span>}
            </div>
            <div className="progress-percentage">{progress.percentage}%</div>
          </div>
          <div className="progress-bar">
            <div 
              className="progress-bar-fill" 
              style={{ width: `${progress.percentage}%` }}
            ></div>
          </div>
          {progress.stats && (
            <div className="progress-stats">
              <span className="stat-item">⏱️ Elapsed: {formatElapsedTime(elapsedTime)}</span>
              <span className="stat-item">✅ Imported: {progress.stats.imported}</span>
              <span className="stat-item">⏭️ Skipped: {progress.stats.skipped}</span>
              <span className="stat-item">🆕 Categories Created: {progress.stats.categoriesCreated}</span>
              <span className="stat-item">❗ Errors: {progress.stats.errors}</span>
            </div>
          )}
          <p className="progress-warning">⚠️ Please do not close or refresh this page</p>
        </div>
      </div>
    </div>
  );
}

export default ImportProgressModal;
