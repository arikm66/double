import React, { useState, useEffect } from 'react'
import { Card, Button, Progress } from '@heroui/react'

export default function NounImaging() {
  const [loading, setLoading] = useState(false)
  const [status, setStatus] = useState('')
  const [progress, setProgress] = useState(0)
  const [result, setResult] = useState(null)
  const [error, setError] = useState(null)

  // --- Results / table state ---
  const [filesData, setFilesData] = useState([])
  const [cleanedUrls, setCleanedUrls] = useState([])
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const rowsPerPage = 15
  const [totalNouns, setTotalNouns] = useState(null)

  const filteredFiles = React.useMemo(() => {
    const q = (search || '').trim().toLowerCase()
    if (!q) return filesData
    return filesData.filter(f =>
      (f.original || '').toLowerCase().includes(q) ||
      (f.descriptor || '').toLowerCase().includes(q)
    )
  }, [filesData, search])

  const totalPages = Math.max(1, Math.ceil(filteredFiles.length / rowsPerPage))
  const currentPage = Math.min(page, totalPages)

  const paginatedFiles = React.useMemo(() => {
    const start = (currentPage - 1) * rowsPerPage
    return filteredFiles.slice(start, start + rowsPerPage)
  }, [filteredFiles, currentPage])

  const repairsCount = React.useMemo(() => filesData.filter(f => f.status !== 'VALID' || (f.action && f.action !== 'KEEP')).length, [filesData])

  useEffect(() => { setPage(1) }, [search, filesData])

  // Helper chips (small, themed)
  const renderStatusChip = (status) => {
    if (!status) return null
    const s = String(status).toUpperCase()
    if (s === 'VALID') return <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800">Valid</span>
    if (s === 'REPAIRED') return <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-800">Repaired</span>
    return <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-700">{status}</span>
  }

  const renderActionChip = (action) => {
    if (!action) return null
    const a = String(action).toUpperCase()
    const base = "inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium max-w-xs truncate inline-block"
    if (a === 'KEEP') return <span className={`${base} bg-sky-100 text-sky-800`}>Keep</span>
    if (a.includes('RENAME') || a.includes('RENAMED') || a.includes('UPDATED') || a.includes('REPAIRED')) return <span className={`${base} bg-amber-100 text-amber-800`}>{action}</span>
    if (a.includes('REMOVE') || a.includes('REMOVED') || a.includes('FAILED')) return <span className={`${base} bg-red-100 text-red-800`}>{action}</span>
    return <span className={`${base} bg-slate-100 text-slate-700`}>{action}</span>
  }

  const runImaging = () => {
    // 1. Reset state
    setError(null)
    setResult(null)
    setProgress(0)
    setLoading(true)
    setStatus('Connecting to server...')

    // 1. Token retrieval (authenticate EventSource via query param)
    const token = localStorage.getItem('token');
    if (!token) {
      setError('No authentication token found. Please log in again.');
      setLoading(false);
      return;
    }

    // 2. Initialize authenticated EventSource (token passed as query param)
    const eventSource = new EventSource(`/api/utils/nounimaging?token=${encodeURIComponent(token)}`);

    // 3. Listen for specific events defined in your controller
    
    // Capture 'progress' events
    eventSource.addEventListener('progress', (event) => {
      try {
        const data = JSON.parse(event.data || '{}');
        if (typeof data.progress === 'number') setProgress(data.progress * 100);
        setStatus(data.status || data.message || '');
        // capture total nouns when emitted by server during cleaning step
        if (data.total && /clean/i.test(data.status || data.message || '')) {
          setTotalNouns(data.total);
        }
      } catch (e) {
        console.warn('Malformed SSE progress', e);
      }
    });

    // Capture 'complete' events
    eventSource.addEventListener('complete', (event) => {
      try {
        const data = JSON.parse(event.data || '{}');
        const payload = data.data || {};
        setFilesData(payload.files || []);
        setCleanedUrls(payload.cleanedUrls || []);
        setResult(payload);
      } catch (e) {
        console.warn('Malformed SSE complete', e);
      }
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
    <Card className="max-w-6xl w-full p-6">
      <h3 className="text-xl font-bold text-[#1d3557]">Noun Imaging Tool</h3>
      <p className="text-sm text-slate-500 mb-6">Batch-audit and repair noun image links.</p>

      <div className="space-y-4">
        <Button 
          color="primary" 
          onClick={runImaging}
          className={`bg-[#457b9d] ${loading ? 'opacity-60 cursor-not-allowed' : 'hover:brightness-105'}`}
          disabled={loading}
          aria-disabled={loading}
        >
          {loading ? 'Loading...' : 'Run Noun Imaging'}
        </Button>

        {loading && (
          <div className="space-y-2">
            <div className="flex justify-between text-xs">
              <span aria-live="polite" role="status">{status}</span>
              <span>{Math.round(progress)}%</span>
            </div>
            <Progress 
              value={progress} 
              color="primary" 
              className="max-w-md"
              isStriped
              aria-label="Noun imaging progress"
              aria-valuemin={0}
              aria-valuemax={100}
              aria-valuenow={Math.round(progress)}
            />
          </div>
        )}

        {error && <div className="p-3 bg-red-50 text-red-700 rounded-lg text-sm">{error}</div>}

        {result && (
          <div className="mt-4 space-y-4">
            {/* Summary cards */}
            <div className="grid grid-cols-3 gap-4">
              <Card className="p-3 text-center">
                <div className="text-xs text-slate-500">Total Files Scanned</div>
                <div className="text-xl font-bold text-[#1d3557]">{filesData.length}</div>
              </Card>

              <Card className="p-3 text-center">
                <div className="text-xs text-slate-500">Total Nouns Audited</div>
                <div className="text-xl font-bold text-[#1d3557]">{totalNouns ?? cleanedUrls.length ?? '—'}</div>
              </Card>

              <Card className="p-3 text-center">
                <div className="text-xs text-slate-500">Total Repairs Needed</div>
                <div className="text-xl font-bold text-[#1d3557]">{repairsCount}</div>
              </Card>
            </div>

            {/* Search + meta */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <input
                  type="search"
                  value={search}
                  onChange={e => { setSearch(e.target.value) }}
                  placeholder="Search filename or descriptor"
                  className="px-3 py-2 border rounded-md text-sm w-80"
                  aria-label="Search matched files"
                />
                <Button color="primary" onClick={() => { setSearch(''); setPage(1); }} className="bg-[#457b9d]">Clear</Button>
              </div>

              <div className="text-xs text-slate-500">
                Showing {filteredFiles.length ? ((page - 1) * rowsPerPage + 1) : 0}–{Math.min(page * rowsPerPage, filteredFiles.length)} of {filteredFiles.length}
              </div>
            </div>

            {/* Results table */}
            <div className="overflow-x-auto shadow-sm rounded-lg border border-slate-100 w-full">
              <table className="min-w-full w-full divide-y divide-slate-100 table-auto">
                <thead className="bg-[#f8fafc]">
                  <tr>
                    <th className="px-4 py-2 text-left text-xs font-semibold text-slate-600">Original Filename</th>
                    <th className="px-4 py-2 text-left text-xs font-semibold text-slate-600">Descriptor</th>
                    <th className="px-4 py-2 text-left text-xs font-semibold text-slate-600">Status</th>
                    <th className="px-4 py-2 text-left text-xs font-semibold text-slate-600">Action</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-slate-100">
                  {paginatedFiles.map((f, idx) => (
                    <tr key={(f.original || '') + idx}>
                      <td className="px-4 py-2 text-xs text-[#1d3557] wrap-break-word whitespace-normal">{f.original}</td>
                      <td className="px-4 py-2 text-xs text-slate-600 whitespace-normal wrap-break-word">{f.descriptor}</td>
                      <td className="px-4 py-2">{renderStatusChip(f.status)}</td>
                      <td className="px-4 py-2">{renderActionChip(f.action)}</td>
                    </tr>
                  ))}

                  {paginatedFiles.length === 0 && (
                    <tr>
                      <td colSpan={4} className="px-4 py-6 text-center text-sm text-slate-500">No files match your search</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination controls */}
            <div className="flex items-center justify-between">
              <div className="text-xs text-slate-500">Page {page} of {totalPages}</div>
              <div className="flex items-center gap-2">
                <Button size="sm" onClick={() => setPage(1)} disabled={page === 1} aria-label="Go to first page">First</Button>
                <Button size="sm" onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} aria-label="Previous page">Prev</Button>

                <div className="text-xs px-2">{page}</div>

                <Button size="sm" onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages} aria-label="Next page">Next</Button>
                <Button size="sm" onClick={() => setPage(totalPages)} disabled={page === totalPages} aria-label="Go to last page">Last</Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </Card>
  )
}