'use client';
import { useState } from 'react';

export default function ReconcileButton({ onComplete, alreadyReconciled }) {
  const [loading, setLoading] = useState(false);

  async function handleClick(force) {
    setLoading(true);
    try { await onComplete(force); } finally { setLoading(false); }
  }

  return (
    <button className={alreadyReconciled ? 'btn-secondary' : 'btn-primary'} onClick={() => handleClick(!alreadyReconciled)} disabled={loading}>
      {loading ? 'Working…' : alreadyReconciled ? 'Check for Updates' : 'Run Reconciliation'}

      <style jsx>{`
        button {
          padding: 10px 20px; border-radius: 10px; font-weight: 500; font-size: 14px; border: none; cursor: pointer;
        }
        .btn-primary { background: #0070f3; color: white; box-shadow: 0 4px 14px rgba(0,112,243,0.2); }
        .btn-primary:hover { background: #0059c5; }
        .btn-secondary { background: #1f2942; color: #ffffff; border: 1px solid #2a344e; }
        .btn-secondary:hover { background: #2a344e; }
        button:disabled { opacity: 0.5; cursor: not-allowed; }
      `}</style>
    </button>
  );
}