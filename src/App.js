import { useState, useEffect } from 'react';
import { NavLink, Routes, Route, Navigate } from 'react-router-dom';
import { CardanoWallet } from '@meshsdk/react';
import IssuePage from './pages/IssuePage';
import VerifyPage from './pages/VerifyPage';
import ActivityLog from './components/ActivityLog';

export default function App() {
  const [theme, setTheme] = useState(
    () => localStorage.getItem('theme') || 'light'
  );
  const [activityOpen, setActivityOpen] = useState(false);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
  }, [theme]);

  function toggleTheme() {
    setTheme((t) => (t === 'light' ? 'dark' : 'light'));
  }

  return (
    <div className="app-shell">
      <header className="app-header">
        <div className="header-controls">
          <CardanoWallet label="Connect wallet" />
          <button
            type="button"
            className="icon-btn"
            onClick={() => setActivityOpen((o) => !o)}
            aria-label="Recent activity"
            title="Recent activity"
          >
            🕐
          </button>
          <button
            type="button"
            className="icon-btn"
            onClick={toggleTheme}
            aria-label="Toggle dark mode"
            title={theme === 'light' ? 'Switch to dark mode' : 'Switch to light mode'}
          >
            {theme === 'light' ? '🌙' : '☀️'}
          </button>

          <ActivityLog open={activityOpen} onClose={() => setActivityOpen(false)} />
        </div>

        <div className="mark">Ledger · Document Registry</div>
        <h1>Prove it hasn't changed.</h1>
        <p>
          Register a document's fingerprint once. Anyone can verify it
          matches, forever — without ever seeing the file itself.
        </p>
        <nav className="tab-bar">
          <NavLink to="/issue" className={({ isActive }) => (isActive ? 'active' : '')}>
            Register
          </NavLink>
          <NavLink to="/verify" className={({ isActive }) => (isActive ? 'active' : '')}>
            Verify
          </NavLink>
        </nav>
      </header>

      <main>
        <Routes>
          <Route path="/" element={<Navigate to="/issue" replace />} />
          <Route path="/issue" element={<IssuePage />} />
          <Route path="/verify" element={<VerifyPage />} />
        </Routes>
      </main>

      <footer>fingerprinted client-side · sha-256 · never stores your file</footer>
    </div>
  );
}