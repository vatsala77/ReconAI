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
        .btn-secondary { background: var(--bg-card-elevated); color: var(--text-primary); border: 1px solid var(--border-card); }
        .btn-secondary:hover { background: var(--border-card); }
        button:disabled { opacity: 0.5; cursor: not-allowed; }

        /* ===== LIGHT MODE ===== */
        :global(html[data-theme="light"]) .btn-secondary { background: #f1f5f9; color: #0f172a; border-color: #e2e8f0; }
        :global(html[data-theme="light"]) .btn-secondary:hover { background: #e2e8f0; }
      `}</style>
    </button>
  );
}