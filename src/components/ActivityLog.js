import { useEffect, useState } from 'react'
import { getActivity, clearActivity, subscribeToActivity } from '../lib/activityLog'

function shortHash(hash) {
  if (!hash) return ''
  return `${hash.slice(0, 8)}…${hash.slice(-6)}`
}

function statusLabel(item) {
  if (item.type === 'register') return 'Registered'
  return item.result === 'verified' ? 'Verified' : 'Not found'
}

function statusClass(item) {
  if (item.type === 'register') return 'ok'
  return item.result === 'verified' ? 'ok' : 'fail'
}

export default function ActivityLog({ open, onClose }) {
  const [items, setItems] = useState(getActivity())

  useEffect(() => subscribeToActivity(setItems), [])

  if (!open) return null

  return (
    <div className="activity-panel" role="dialog" aria-label="Recent activity">
      <div className="activity-panel-header">
        <span>Recent activity</span>
        <div className="activity-panel-actions">
          {items.length > 0 && (
            <button
              type="button"
              className="link-btn"
              onClick={() => {
                clearActivity()
              }}
            >
              Clear
            </button>
          )}
          <button type="button" className="link-btn" onClick={onClose} aria-label="Close">
            ✕
          </button>
        </div>
      </div>

      {items.length === 0 ? (
        <div className="activity-empty">
          Nothing yet — register or verify a document to see it here.
        </div>
      ) : (
        <ul className="activity-list">
          {items.map((item) => (
            <li key={item.id} className="activity-item">
              <span className={`activity-dot ${statusClass(item)}`} />
              <div className="activity-body">
                <div className="activity-line">
                  <strong>{statusLabel(item)}</strong>
                  {item.label ? ` — ${item.label}` : ''}
                </div>
                <div className="activity-meta">
                  <span className="activity-hash">{shortHash(item.hash)}</span>
                  <span>{new Date(item.timestamp).toLocaleString()}</span>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}