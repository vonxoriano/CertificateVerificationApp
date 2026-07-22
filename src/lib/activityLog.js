/**
 * ------------------------------------------------------------------
 * RECENT ACTIVITY LOG
 * ------------------------------------------------------------------
 * Tracks the last few register/verify actions in the browser's
 * localStorage — nothing is sent to a server, so this stays true to
 * the app's "never store your file" philosophy. Only the hash,
 * label, and outcome are recorded, same data that's already public
 * once something is registered.
 * ------------------------------------------------------------------
 */

const STORAGE_KEY = 'ledger:activity'
const MAX_ENTRIES = 10
const EVENT_NAME = 'ledger:activity-updated'

export function getActivity() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

/**
 * @param {object} entry
 * @param {'register'|'verify'} entry.type
 * @param {string} entry.hash
 * @param {string|null} entry.label
 * @param {'registered'|'verified'|'failed'} entry.result
 */
export function logActivity(entry) {
  const activity = getActivity()
  const next = [
    {
      id: (crypto.randomUUID && crypto.randomUUID()) || String(Date.now() + Math.random()),
      timestamp: Date.now(),
      ...entry,
    },
    ...activity,
  ].slice(0, MAX_ENTRIES)

  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
  } catch {
    // localStorage unavailable or full — activity just won't persist
  }

  window.dispatchEvent(new Event(EVENT_NAME))
  return next
}

export function clearActivity() {
  try {
    localStorage.removeItem(STORAGE_KEY)
  } catch {
    // ignore
  }
  window.dispatchEvent(new Event(EVENT_NAME))
}

export function subscribeToActivity(callback) {
  const handler = () => callback(getActivity())
  window.addEventListener(EVENT_NAME, handler)
  window.addEventListener('storage', handler) // cross-tab updates
  return () => {
    window.removeEventListener(EVENT_NAME, handler)
    window.removeEventListener('storage', handler)
  }
}