import React from 'react';

import { useEffect, useState } from 'react';

function ImageRetrieval() {
    const [data, setData] = useState(null);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        setLoading(true);
        setError('');
        const token = localStorage.getItem('token');
        fetch('/api/utils/imageret', {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        })
            .then(res => res.json().then(data => ({ ok: res.ok, data })))
            .then(({ ok, data }) => {
                if (ok) {
                    setData(data);
                } else {
                    setError(data.message || 'Error fetching image retrieval data');
                }
                setLoading(false);
            })
            .catch(() => {
                setError('Failed to fetch image retrieval data');
                setLoading(false);
            });
    }, []);

    return (
        <div>
            <h3>Image Retrieval</h3>
            {loading && <div>Loading...</div>}
            {error && <div style={{ color: 'red' }}>Error: {error}</div>}
            {/* Data display will be defined later */}
            {data && <pre>{JSON.stringify(data, null, 2)}</pre>}
        </div>
    );
}

export default ImageRetrieval;
