import React, { useState } from 'react'
import { Card, Button } from '@heroui/react'
import { request } from '../../services/api'

export default function NounImaging() {
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState(null)
  const [error, setError] = useState(null)

  const runImaging = async () => {
    setError(null)
    setResult(null)
    setLoading(true)
    try {
      const res = await request({ path: '/api/utils/nounimaging', method: 'GET' })
      if (res.ok) setResult(res.body)
      else setError(res.body?.message || `Server returned ${res.status}`)
    } catch (err) {
      setError(err.message || 'Request failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card className="max-w-3xl w-full">
      <div className="p-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h3 className="text-xl font-bold" style={{ color: '#1d3557' }}>Noun Imaging Tool</h3>
            <div className="text-sm text-slate-500 mt-2">Batch-audit images in Cloud Storage and compare to DB nouns.</div>
          </div>
        </div>

        <div className="mt-6 bg-white/50 border-2 border-dashed border-slate-300 rounded-lg p-4 min-h-32 text-sm text-slate-500">
          {error && <div className="text-sm text-red-600 mb-3">{error}</div>}

          {!result && !error && (
            <div className="text-center py-12 text-sm text-slate-500">
              Click the <Button color="ghost" radius="full" onClick={runImaging} disabled={loading} aria-label="Run Noun Imaging" className="font-semibold text-deep-ocean">
                Run Noun Imaging
              </Button> control to scan Cloud Storage and compare images with DB nouns — results (matched images & cleaned URLs) will appear below.
            </div>
          )}

          {result && (
            <div className="space-y-4">
              <div className="text-sm text-slate-700 font-medium">Matched images: {Array.isArray(result.files) ? result.files.length : '—'}</div>
              <div className="text-xs text-slate-600">Cleaned URLs: {Array.isArray(result.cleanedUrls) ? result.cleanedUrls.length : '—'}</div>
              <pre className="overflow-auto max-h-64 bg-white p-2 rounded text-xs">{JSON.stringify(result, null, 2)}</pre>
            </div>
          )}
        </div>
      </div>
    </Card>
  )
}