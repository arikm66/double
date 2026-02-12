import React, { useState } from 'react';

function NounImaging() {
    const [response, setResponse] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleMatchImages = async () => {
        setLoading(true);
        setError('');
        setResponse(null);
        const token = localStorage.getItem('token');
        try {
            const res = await fetch('/api/utils/nounimaging', {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            const data = await res.json();
            if (!res.ok) {
                throw new Error(data.error || 'Server error');
            }
            setResponse(data);
        } catch (err) {
            setError(err.message || 'Failed to call nounimaging');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="noun-imaging-section">
            <h2>Noun Imaging Util</h2>
            <div className="import-section">
                <div className="import-upload">
                    <button
                        className="import-btn"
                        onClick={handleMatchImages}
                        disabled={loading}
                    >
                        {loading ? '⏳ Matching...' : <><span role="img" aria-label="match">🔗</span> Match Images</>}
                    </button>
                </div>
                {error && <div style={{ color: 'red' }}>Error: {error}</div>}
                {response && <pre>{JSON.stringify(response, null, 2)}</pre>}
            </div>
        </div>
    );
}

export default NounImaging;
