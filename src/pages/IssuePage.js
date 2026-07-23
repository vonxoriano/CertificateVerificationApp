import { useState } from 'react'
import { useWallet } from '@meshsdk/react'
import { hashFile } from '../lib/hash'
import { supabase } from '../lib/supabaseClient'
import { registerOnChain } from '../lib/chain'
import { logActivity } from '../lib/activityLog'

export default function IssuePage() {
  const { connected, wallet } = useWallet()
  const [file, setFile] = useState(null)
  const [label, setLabel] = useState('')
  const [hash, setHash] = useState('')
  const [dragActive, setDragActive] = useState(false)
  const [status, setStatus] = useState('idle') // idle | hashing | saving | done | error
  const [result, setResult] = useState(null)
  const [errorMsg, setErrorMsg] = useState('')

  async function handleFile(selected) {
    if (!selected) return
    setFile(selected)
    setResult(null)
    setStatus('hashing')
    try {
      const digest = await hashFile(selected)
      setHash(digest)
      setStatus('idle')
    } catch (err) {
      setErrorMsg('Could not read this file. Try a different one.')
      setStatus('error')
    }
  }

  function onDrop(e) {
    e.preventDefault()
    setDragActive(false)
    handleFile(e.dataTransfer.files?.[0])
  }

  async function handleRegister() {
    if (!hash || !connected) return
    setStatus('saving')
    setErrorMsg('')
    try {
      const chainResult = await registerOnChain(wallet, hash, label)

      const { data, error } = await supabase
        .from('documents')
        .insert({
          hash,
          label: label || null,
          tx_hash: chainResult.txHash,
        })
        .select()
        .single()

      if (error) throw error

      setResult({ ...data, chainNote: chainResult.note, onChain: chainResult.onChain })
      setStatus('done')
      logActivity({ type: 'register', hash, label: label || null, result: 'registered' })
    } catch (err) {
      setErrorMsg(
        err.message?.includes('duplicate')
          ? 'This exact document has already been registered.'
          : `Something went wrong: ${err.message}`
      )
      setStatus('error')
    }
  }

  function reset() {
    setFile(null)
    setLabel('')
    setHash('')
    setResult(null)
    setStatus('idle')
    setErrorMsg('')
  }

  return (
    <div className="card">
      <h2>Register a document</h2>
      <p className="subtitle">
        Upload a certificate, diploma, or contract. We fingerprint it in your
        browser — the file itself is never uploaded anywhere unless you add
        storage later.
      </p>

      {!file ? (
        <div
          className={`dropzone ${dragActive ? 'drag-active' : ''}`}
          onDragOver={(e) => { e.preventDefault(); setDragActive(true) }}
          onDragLeave={() => setDragActive(false)}
          onDrop={onDrop}
        >
          <label className="dropzone-label" htmlFor="file-input">
            Choose a file
          </label>
          <input
            id="file-input"
            type="file"
            onChange={(e) => handleFile(e.target.files?.[0])}
          />
          <div className="hint">or drag one in — PDF, image, or any document</div>
        </div>
      ) : (
        <div className="file-chip">
          <span>{file.name}</span>
          <button onClick={reset}>Remove</button>
        </div>
      )}

      {status === 'hashing' && <div className="note pending">Computing fingerprint…</div>}

      {hash && status !== 'hashing' && (
        <div className="hash-box">
          <span className="tag">SHA-256 fingerprint</span>
          {hash}
        </div>
      )}

      {file && (
        <div className="field">
          <label htmlFor="label-input">Label (optional)</label>
          <input
            id="label-input"
            type="text"
            placeholder="e.g. BSc Computer Science — Jane Doe"
            value={label}
            onChange={(e) => setLabel(e.target.value)}
          />
        </div>
      )}

      {file && hash && status !== 'done' && (
        <>
          <button
            className="btn-primary"
            disabled={status === 'saving' || !connected}
            onClick={handleRegister}
          >
            {status === 'saving' ? 'Registering…' : 'Register document'}
          </button>
          {!connected && (
            <div className="hint">Connect a Cardano wallet above to register on-chain.</div>
          )}
        </>
      )}

      {status === 'error' && <div className="note" style={{ color: 'var(--seal)' }}>{errorMsg}</div>}

      {result && (
        <div className="result verified">
          <div className="headline">✓ Registered</div>
          <dl>
            <dt>Hash</dt>
            <dd>{result.hash}</dd>
            <dt>Label</dt>
            <dd>{result.label || '—'}</dd>
            <dt>Registered</dt>
            <dd>{new Date(result.created_at).toLocaleString()}</dd>
            {result.tx_hash && (
              <>
                <dt>Cardano Tx Hash</dt>
                <dd>{result.tx_hash}</dd>
              </>
            )}
          </dl>
          <div className="note pending">{result.chainNote}</div>
        </div>
      )}
    </div>
  )
}