import React, { useState, useEffect } from 'react'
import { Card, Button, Progress } from '@heroui/react'

export default function NounImaging() {
  const [loading, setLoading] = useState(false)
  const [status, setStatus] = useState('')
  const [progress, setProgress] = useState(0)
  const [result, setResult] = useState(null)
  const [error, setError] = useState(null)

  const runImaging = () => {
    // 1. Reset state
    setError(null)
    setResult(null)
    setProgress(0)
    setLoading(true)
    setStatus('Connecting to server...')

    // 2. Initialize EventSource pointing to your SSE route
    // Note: EventSource only supports GET requests
    const eventSource = new EventSource('/api/utils/nounimaging');

    // 3. Listen for specific events defined in your controller
    
    // Capture 'progress' events
    eventSource.addEventListener('progress', (event) => {
      const data = JSON.parse(event.data);
      setProgress(data.progress * 100); // Progress is 0-1, HeroUI needs 0-100
      setStatus(data.status || data.message);
    });

    // Capture 'complete' events
    eventSource.addEventListener('complete', (event) => {
      const data = JSON.parse(event.data);
      setResult(data.data);
      setStatus('Completed');
      setLoading(false);
      eventSource.close(); // Important: Close the connection when done
    });

    // Capture 'error' events
    eventSource.addEventListener('error', (event) => {
      // EventSource error objects don't always contain the message directly
      // If the server sent a JSON error event:
      if (event.data) {
        const data = JSON.parse(event.data);
        setError(data.message || 'An error occurred during processing');
      } else {
        setError('Connection to server failed.');
      }
      setLoading(false);
      eventSource.close();
    });
  }

  return (
    <Card className="max-w-3xl w-full p-6">
      <h3 className="text-xl font-bold text-[#1d3557]">Noun Imaging Tool</h3>
      <p className="text-sm text-slate-500 mb-6">Batch-audit and repair noun image links.</p>

      <div className="space-y-4">
        {!loading && !result && (
          <Button 
            color="primary" 
            onClick={runImaging}
            className="bg-[#457b9d]"
          >
            Run Noun Imaging
          </Button>
        )}

        {loading && (
          <div className="space-y-2">
            <div className="flex justify-between text-xs">
              <span>{status}</span>
              <span>{Math.round(progress)}%</span>
            </div>
            <Progress 
              value={progress} 
              color="primary" 
              className="max-w-md"
              isStriped
            />
          </div>
        )}

        {error && <div className="p-3 bg-red-50 text-red-700 rounded-lg text-sm">{error}</div>}

        {result && (
          <div className="mt-4 p-4 bg-green-50 rounded-lg border border-green-200">
            <h4 className="text-sm font-bold text-green-800">Imaging Results</h4>
            <ul className="text-xs mt-2 space-y-1">
              <li>Matched Images: {result.files?.length}</li>
              <li>Cleaned URLs: {result.cleanedUrls?.length}</li>
            </ul>
          </div>
        )}
      </div>
    </Card>
  )
}