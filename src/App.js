import { NavLink, Routes, Route, Navigate } from 'react-router-dom';
import IssuePage from './pages/IssuePage';
import VerifyPage from './pages/VerifyPage';

export default function App() {
  return (
    <div className="app-shell">
      <header className="app-header">
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