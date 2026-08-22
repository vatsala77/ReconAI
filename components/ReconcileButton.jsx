'use client';
import { useState } from 'react';

export default function ReconcileButton({ onComplete }) {
  const [loading, setLoading] = useState(false);

  async function runReconciliation() {
    setLoading(true);
    try {
      const res = await fetch('/api/reconcile', { method: 'POST' });
      await res.json();
      await onComplete();
    } catch (err) {
      console.error('Reconciliation failed:', err);
    } finally {
      setLoading(false);
    }
  }

  return (
    <button className="btn-primary" onClick={runReconciliation} disabled={loading}>
      {loading ? 'Reconciling…' : 'Run Reconciliation'}
    </button>
  );
}