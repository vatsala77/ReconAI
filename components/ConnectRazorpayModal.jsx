'use client';
import { useState } from 'react';

export default function ConnectRazorpayModal({ onClose, onConnected, onUseDemoSandbox }) {
  const [keyId, setKeyId] = useState('');
  const [keySecret, setKeySecret] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [demoLoading, setDemoLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await fetch('/api/razorpay/connect', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ keyId, keySecret }),
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Failed to connect');
        setLoading(false);
        return;
      }

      onConnected(data.keyId);
    } catch (err) {
      setError('Something went wrong');
      setLoading(false);
    }
  }

  async function handleDemoClick() {
    setError('');
    setDemoLoading(true);
    try {
      await onUseDemoSandbox();
    } finally {
      setDemoLoading(false);
    }
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-box" onClick={(e) => e.stopPropagation()}>
        <h2>Connect Razorpay (Test Mode)</h2>
        <p className="modal-subtitle">
          This connects to Razorpay&apos;s <strong>test-mode sandbox</strong> — no real money is involved.
          Enter your own test-mode API credentials to sync live Route transfer data. Find these under
          Razorpay Dashboard → Settings → API Keys.
        </p>

        <form onSubmit={handleSubmit}>
          <label>Key ID</label>
          <input
            type="text"
            placeholder="rzp_test_xxxxxxxxxxxxx"
            value={keyId}
            onChange={(e) => setKeyId(e.target.value)}
            required
          />

          <label>Key Secret</label>
          <input
            type="password"
            placeholder="Your test key secret"
            value={keySecret}
            onChange={(e) => setKeySecret(e.target.value)}
            required
          />

          {error && <p className="error-text">{error}</p>}

          <div className="modal-actions">
            <button type="button" className="btn-ghost" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn-primary" disabled={loading || demoLoading}>
              {loading ? 'Verifying…' : 'Connect & Sync'}
            </button>
          </div>
        </form>

        <div className="demo-divider">
          <span>or</span>
        </div>

        <button className="btn-demo" onClick={handleDemoClick} disabled={loading || demoLoading}>
          {demoLoading ? 'Syncing demo data…' : "🧪 Don't have test credentials? Use our demo sandbox"}
        </button>
        <p className="demo-note">Uses developer's test Razorpay account — sample Route transfer data, no real money or live keys involved.</p>

        <p className="modal-note">
          🔒 Test-mode credentials only (must start with <code>rzp_test_</code>) — used solely to fetch Route transfer data for reconciliation. No live/production keys accepted.
        </p>
      </div>

      <style jsx>{`
        .modal-overlay {
          position: fixed; inset: 0; background: rgba(0,0,0,0.6);
          display: flex; align-items: center; justify-content: center; z-index: 100;
          padding: 20px;
        }
        .modal-box {
          background: var(--bg-card); border: 1px solid var(--border-card); border-radius: 16px;
          padding: 32px; max-width: 440px; width: 100%;
        }
        h2 { color: #fff; font-size: 18px; margin-bottom: 8px; }
        .modal-subtitle { color: #9db4e0; font-size: 13px; margin-bottom: 20px; line-height: 1.5; }
        label { display: block; color: #c1c6d7; font-size: 13px; margin-bottom: 6px; margin-top: 14px; }
        input {
          width: 100%; padding: 10px 12px; border-radius: 8px;
          background: #0b1428; border: 1px solid #253154; color: #fff; font-size: 14px;
        }
        input:focus { outline: none; border-color: #0070f3; }
        .error-text { color: #f87171; font-size: 13px; margin-top: 10px; }
        .modal-actions { display: flex; justify-content: flex-end; gap: 10px; margin-top: 24px; }
        .btn-primary {
          padding: 10px 20px; border-radius: 8px; background: #0070f3; color: #fff;
          border: none; font-weight: 600; cursor: pointer;
        }
        .btn-primary:disabled { opacity: 0.6; cursor: not-allowed; }
        .btn-ghost {
          padding: 10px 20px; border-radius: 8px; background: transparent;
          border: 1px solid var(--border-card); color: var(--text-secondary); cursor: pointer;
        }

        .demo-divider {
          display: flex;
          align-items: center;
          text-align: center;
          margin: 22px 0 14px 0;
          color: #4a5578;
          font-size: 11px;
          text-transform: uppercase;
          letter-spacing: 0.08em;
        }
        .demo-divider::before, .demo-divider::after {
          content: '';
          flex: 1;
          border-bottom: 1px solid var(--border-card);
        }
        .demo-divider span { padding: 0 12px; }

        .btn-demo {
          width: 100%;
          padding: 11px 14px;
          border-radius: 8px;
          background: rgba(0,112,243,0.08);
          border: 1px solid rgba(0,112,243,0.25);
          color: #aec6ff;
          font-size: 13px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s;
        }
        .btn-demo:hover:not(:disabled) {
          background: rgba(0,112,243,0.14);
          border-color: rgba(0,112,243,0.4);
        }
        .btn-demo:disabled { opacity: 0.6; cursor: not-allowed; }

        .demo-note {
          color: #7c8493;
          font-size: 11px;
          margin-top: 8px;
          text-align: center;
          line-height: 1.4;
        }

        .modal-note { color: #7c8493; font-size: 12px; margin-top: 18px; line-height: 1.5; }
        .modal-note code { background: var(--bg-card-elevated); padding: 1px 5px; border-radius: 4px; }
      `}</style>
    </div>
  );
}