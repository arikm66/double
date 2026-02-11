import React, { useEffect, useState } from 'react';

function ImageRetrieval() {
    const [data, setData] = useState(null);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [progress, setProgress] = useState(0);
    const [status, setStatus] = useState('');

    useEffect(() => {
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
        return () => {
            isMounted = false;
        };
    }, []);

    return (
        <div>
            <h3>Image Retrieval</h3>
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
