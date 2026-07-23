import { useState } from 'react'
import { hashFile } from '../lib/hash'
import { supabase } from '../lib/supabaseClient'
import { verifyCertificateOnChain } from '../lib/blockfrost'
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

      const { data, error } = await supabase
        .from('documents')
        .select('*')
        .eq('hash', hash)
        .maybeSingle()

      if (error) throw error

      // If the record has a Cardano tx hash, confirm the on-chain metadata
      // actually matches this file's hash — not just that a tx exists.
      let chainCheck = null
      if (data && data.tx_hash) {
        try {
          chainCheck = await verifyCertificateOnChain(data.tx_hash, hash)
        } catch (bfErr) {
          console.warn('Blockfrost query failed:', bfErr)
        }
      }

      setResult({
        hash,
        found: !!data,
        record: data,
        chainCheck,
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
              {result.record.tx_hash && (
                <>
                  <dt>Cardano Tx Hash</dt>
                  <dd>{result.record.tx_hash}</dd>
                </>
              )}
            </dl>
          ) : (
            <p style={{ margin: 0, fontSize: '0.88rem' }}>
              This file's fingerprint doesn't match any registered record.
              Even a single changed character would cause this — check
              you have the exact original file.
            </p>
          )}

          {result.record?.tx_hash && result.chainCheck?.found && result.chainCheck.matches && (
            <div className="note" style={{ marginTop: '1rem', textAlign: 'left' }}>
              <strong>✓ Confirmed on Cardano</strong> — the hash in this transaction's
              metadata matches this file exactly.
              <pre style={{ fontSize: '0.75rem', overflowX: 'auto', marginTop: '0.5rem' }}>
                {JSON.stringify(result.chainCheck.metadata, null, 2)}
              </pre>
            </div>
          )}

          {result.record?.tx_hash && result.chainCheck?.found && !result.chainCheck.matches && (
            <div className="note" style={{ marginTop: '1rem', color: 'var(--seal)' }}>
              ⚠ On-chain record found, but its hash does not match this file.
            </div>
          )}

          {result.record?.tx_hash && result.chainCheck && !result.chainCheck.found && (
            <div className="note pending">
              Checked against Supabase — couldn't find matching metadata on that Cardano transaction yet.
            </div>
          )}

          {result.found && !result.record?.tx_hash && (
            <div className="note pending">
              Checked against Supabase — no Cardano on-chain record for this entry.
            </div>
          )}
        </div>
      )}
    </div>
  )
}
