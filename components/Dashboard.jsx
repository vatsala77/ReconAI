'use client';
import { useState, useEffect, useRef } from 'react';
import MatchRateCard from './MatchRateCard';
import StatsCards from './StatsCards';
import ExceptionTable from './ExceptionTable';
import AuditTimeline from './AuditTimeline';
import ReconcileButton from './ReconcileButton';
import ChatPanel from './ChatPanel';
import { downloadReconciliationCSV } from '@/lib/exportCSV';
export default function Dashboard({ uploadBatchId = null, autoRun = false }) {
  const [metrics, setMetrics] = useState(null);
  const [exceptions, setExceptions] = useState([]);
  const [auditLogs, setAuditLogs] = useState([]);
  const [analyzing, setAnalyzing] = useState(false);
  const [message, setMessage] = useState('');
  const hasAutoRun = useRef(false);

  const qs = uploadBatchId ? `?uploadBatchId=${uploadBatchId}` : '';

  async function loadData() {
    const [metricsRes, exceptionsRes, auditRes] = await Promise.all([
      fetch(`/api/metrics${qs}`).then((r) => r.json()),
      fetch(`/api/exceptions${qs}`).then((r) => r.json()),
      fetch(`/api/audit${qs}`).then((r) => r.json()),
    ]);
    setMetrics(metricsRes);
    setExceptions(exceptionsRes);
    setAuditLogs(auditRes);
  }

  async function handleReconcile(force = false) {
    if (!force && metrics?.total > 0) {
      setMessage('Data already reconciled. No new inputs to process.');
      setTimeout(() => setMessage(''), 4000);
      return;
    }
    setAnalyzing(true);
    setMessage('');
    try {
      await fetch(`/api/reconcile${qs}`, { method: 'POST' });
      await loadData();
    } finally {
      setAnalyzing(false);
    }
  }

  useEffect(() => {
    async function init() {
      const res = await fetch(`/api/metrics${qs}`).then((r) => r.json());
      if (autoRun && !hasAutoRun.current && res.total === 0) {
        hasAutoRun.current = true;
        setAnalyzing(true);
        await fetch(`/api/reconcile${qs}`, { method: 'POST' });
        setAnalyzing(false);
      }
      await loadData();
    }
    init();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [uploadBatchId]);

  if (!metrics || analyzing) {
    return (
      <div className="analyzing-state">
        <div className="spinner" />
        <p>{analyzing ? 'Analyzing your settlement data — this takes 15–30 seconds…' : 'Loading…'}</p>
        <style jsx>{`
          .analyzing-state {
            display: flex; flex-direction: column; align-items: center; justify-content: center;
            padding: 120px 20px; gap: 16px; min-height: 60vh;
          }
          .spinner {
            width: 32px; height: 32px; border: 3px solid #1f2942; border-top-color: #0070f3;
            border-radius: 50%; animation: spin 0.8s linear infinite;
          }
          p { color: #c1c6d7; font-size: 14px; }
          @keyframes spin { to { transform: rotate(360deg); } }
        `}</style>
      </div>
    );
  }

  return (
    <>
    <div className="dash-header">
  <div>
    <p className="dash-title">ReconAI</p>
    <p className="dash-subtitle">Route settlement reconciliation</p>
  </div>
  <div className="header-actions">
    <ReconcileButton onComplete={handleReconcile} alreadyReconciled={metrics.total > 0} />
    <button className="btn-download" onClick={() => downloadReconciliationCSV(exceptions, metrics)}>
      ⬇ Download Report
    </button>
  </div>
</div>

      {message && <p className="info-message">{message}</p>}

      <MatchRateCard matchRate={metrics.matchRate} totalRecords={metrics.total} matchedCount={metrics.matched} />
      <StatsCards stats={metrics} />

      <div className="dash-grid">
        <div className="dash-left">
          <ExceptionTable exceptions={exceptions} />
          <AuditTimeline logs={auditLogs} />
        </div>
        <div className="dash-right">
          <ChatPanel uploadBatchId={uploadBatchId} />
        </div>
      </div>

      <style jsx>{`
      .header-actions {
  display: flex;
  gap: 10px;
  align-items: center;
}
.btn-download {
  padding: 10px 18px;
  border-radius: 10px;
  background: #1f2942;
  border: 1px solid #2a344e;
  color: #ffffff;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
}
.btn-download:hover {
  background: #2a344e;
  border-color: #0070f3;
}
        .dash-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 24px;
        }
        .dash-title { font-size: 22px; font-weight: 700; color: #ffffff; margin: 0; letter-spacing: -0.01em; }
        .dash-subtitle { font-size: 13px; color: #7c8493; margin: 2px 0 0 0; }

        .info-message {
          color: #f5a623;
          font-size: 13px;
          margin-bottom: 16px;
          padding: 10px 14px;
          background: rgba(245,166,35,0.08);
          border: 1px solid rgba(245,166,35,0.2);
          border-radius: 8px;
        }

        .dash-grid {
          display: grid;
          grid-template-columns: 1fr;
          gap: 20px;
          margin-top: 24px;
          align-items: start;
        }
        @media (min-width: 1100px) {
          .dash-grid { grid-template-columns: 1.6fr 1fr; }
        }

        .dash-left {
          display: flex;
          flex-direction: column;
          gap: 20px;
        }

        .dash-right {
          position: sticky;
          top: 24px;
        }
      `}</style>
    </>
  );
}