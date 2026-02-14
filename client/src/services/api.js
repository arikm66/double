export async function request({ path = '/', method = 'GET', body = null }) {
  const isFullUrl = /^https?:\/\//i.test(path)
  const url = isFullUrl ? path : path.startsWith('/') ? path : `/${path}`

  const options = { method, headers: {} }
  // attach JSON body when appropriate
  if (body && ['POST','PUT','PATCH'].includes(method.toUpperCase())) {
    options.headers['Content-Type'] = 'application/json'
    options.body = JSON.stringify(body)
  }

  // attach Authorization header from localStorage token if present
  try {
    const token = localStorage.getItem('double_token')
    if (token) options.headers['Authorization'] = `Bearer ${token}`
  } catch (e) {
    /* ignore (no localStorage) */
  }

  const res = await fetch(url, options)
  const text = await res.text()
  let parsed = text
  try { parsed = JSON.parse(text) } catch (e) { /* keep text */ }
  return { status: res.status, ok: res.ok, body: parsed }
}
