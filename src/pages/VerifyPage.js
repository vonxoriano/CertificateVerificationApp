import { useState } from 'react'
import { hashFile } from '../lib/hash'
import { supabase } from '../lib/supabaseClient'
import { verifyOnChain } from '../lib/chain'
import { logActivity } from '../lib/activityLog'

export default function VerifyPage() {
  const [file, setFile] = useState(null)
  const [dragActive, setDragActive] = useState(false)
  const [status, setStatus] = useState('idle') // idle | checking | done | error
  const [result, setResult] = useState(null)
  const [errorMsg, setErrorMsg] = useState('')

  async function handleFile(selected) {
    if (!selected) return
    setFile(selected)
    setResult(null)
    setErrorMsg('')
    setStatus('checking')
    try {
      const hash = await hashFile(selected)

      const chainResult = await verifyOnChain(hash)

      const { data, error } = await supabase
        .from('documents')
        .select('*')
        .eq('hash', hash)
        .maybeSingle()

      if (error) throw error

      setResult({
        hash,
        found: !!data,
        record: data,
        chainOnline: chainResult.onChain,
      })
      setStatus('done')
      logActivity({
        type: 'verify',
        hash,
        label: data?.label || null,
        result: data ? 'verified' : 'failed',
      })
    } catch (err) {
      setErrorMsg(`Something went wrong: ${err.message}`)
      setStatus('error')
    }
  }

  function onDrop(e) {
    e.preventDefault()
    setDragActive(false)
    handleFile(e.dataTransfer.files?.[0])
  }

  function reset() {
    setFile(null)
    setResult(null)
    setStatus('idle')
    setErrorMsg('')
  }

  return (
    <div className="card">
      <h2>Verify a document</h2>
      <p className="subtitle">
        Upload a file to check whether it matches a registered record. No
        login needed — this fingerprint check works for anyone.
      </p>

      {!file ? (
        <div
          className={`dropzone ${dragActive ? 'drag-active' : ''}`}
          onDragOver={(e) => { e.preventDefault(); setDragActive(true) }}
          onDragLeave={() => setDragActive(false)}
          onDrop={onDrop}
        >
          <label className="dropzone-label" htmlFor="verify-file-input">
            Choose a file
          </label>
          <input
            id="verify-file-input"
            type="file"
            onChange={(e) => handleFile(e.target.files?.[0])}
          />
          <div className="hint">or drag one in to check it</div>
        </div>
      ) : (
        <div className="file-chip">
          <span>{file.name}</span>
          <button onClick={reset}>Remove</button>
        </div>
      )}

      {status === 'checking' && <div className="note pending">Checking fingerprint…</div>}
      {status === 'error' && <div className="note" style={{ color: 'var(--seal)' }}>{errorMsg}</div>}

      {result && (
        <div className={`result ${result.found ? 'verified' : 'failed'}`}>
          <div className="headline">
            {result.found ? '✓ Verified' : '✕ Not found'}
          </div>
          {result.found ? (
            <dl>
              <dt>Hash</dt>
              <dd>{result.hash}</dd>
              <dt>Label</dt>
              <dd>{result.record.label || '—'}</dd>
              <dt>Registered</dt>
              <dd>{new Date(result.record.created_at).toLocaleString()}</dd>
            </dl>
          ) : (
            <p style={{ margin: 0, fontSize: '0.88rem' }}>
              This file's fingerprint doesn't match any registered record.
              Even a single changed character would cause this — check
              you have the exact original file.
            </p>
          )}
          {!result.chainOnline && (
            <div className="note pending">
              Checked against Supabase only — blockchain verification not yet connected.
            </div>
          )}
        </div>
      )}
    </div>
  )
}