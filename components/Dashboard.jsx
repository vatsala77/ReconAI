'use client';
import { useState, useEffect, useRef } from 'react';
import MatchRateCard from './MatchRateCard';
import StatsCards from './StatsCards';
import ExceptionTable from './ExceptionTable';
import AuditTimeline from './AuditTimeline';
import ReconcileButton from './ReconcileButton';
import ChatPanel from './ChatPanel';
import HealthSummaryCard from './HealthSummaryCard';
import ChartsPanel from './ChartsPanel';
import { downloadReconciliationCSV } from '@/lib/exportCSV';
import { generatePDF } from '@/lib/exportPDF';
export default function Dashboard({ uploadBatchId = null, autoRun = false }) {
  const [metrics, setMetrics] = useState(null);
  const [exceptions, setExceptions] = useState([]);
  const [auditLogs, setAuditLogs] = useState([]);
  const [analyzing, setAnalyzing] = useState(false);
  const [message, setMessage] = useState('');
  const [progressCurrent, setProgressCurrent] = useState(0);
  const [progressTotal, setProgressTotal] = useState(0);
  const hasAutoRun = useRef(false);
  const progressIntervalRef = useRef(null);

  const qs = uploadBatchId ? `?uploadBatchId=${uploadBatchId}` : '';

  async function loadData() {
    // Retry logic for fetching data - helps with timing issues after reconciliation
    let retries = 3;
    let lastError = null;

    while (retries > 0) {
      try {
        const [metricsRes, exceptionsRes, auditRes] = await Promise.all([
          fetch(`/api/metrics${qs}`).then((r) => r.json()),
          fetch(`/api/exceptions${qs}`).then((r) => r.json()),
          fetch(`/api/audit${qs}`).then((r) => r.json()),
        ]);

        if (metricsRes && Array.isArray(exceptionsRes) && Array.isArray(auditRes)) {
          setMetrics(metricsRes);
          setExceptions(exceptionsRes);
          setAuditLogs(auditRes);
          return; // Success - exit retry loop
        }
      } catch (error) {
        lastError = error;
      }

      retries--;
      if (retries > 0) {
        // Wait before retrying
        await new Promise(resolve => setTimeout(resolve, 500));
      }
    }

    if (lastError) console.error('Failed to load data after retries:', lastError);
  }

  function startFakeProgress(total) {
    setProgressTotal(total);
    setProgressCurrent(0);

    if (total === 0) return;

    const estimatedDuration = Math.min(Math.max(total * 1200, 6000), 25000);
    const stepInterval = estimatedDuration / total;

    let current = 0;
    progressIntervalRef.current = setInterval(() => {
      current += 1;
      if (current >= total) {
        current = total - 1;
      }
      setProgressCurrent(current);
    }, stepInterval);
  }

  function stopFakeProgress(finalTotal) {
    if (progressIntervalRef.current) {
      clearInterval(progressIntervalRef.current);
      progressIntervalRef.current = null;
    }
    setProgressCurrent(finalTotal);
  }

  async function runReconcileWithProgress() {
    let total = 0;
    try {
      const info = await fetch(`/api/upload/batch-info${qs}`).then((r) => r.json());
      total = info.orderCount || 0;
    } catch (e) {
      total = 0;
    }

    startFakeProgress(total);

    try {
      await fetch(`/api/reconcile${qs}`, { method: 'POST' });
    } finally {
      stopFakeProgress(total);
    }
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
      await runReconcileWithProgress();
      // Small delay to ensure database writes are fully committed before fetching
      await new Promise(resolve => setTimeout(resolve, 1000));
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
        await runReconcileWithProgress();
        setAnalyzing(false);
      }
      await loadData();
    }
    init();

    return () => {
      if (progressIntervalRef.current) clearInterval(progressIntervalRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [uploadBatchId]);

  if (!metrics || analyzing) {
    const showCounter = progressTotal > 0;
    const percent = showCounter ? Math.round((progressCurrent / progressTotal) * 100) : 0;

    return (
      <div className="analyzing-state">
        <div className="spinner" />
        {analyzing ? (
          <>
            <p>
              {showCounter
                ? `Processing order ${progressCurrent} of ${progressTotal}…`
                : 'Analyzing your settlement data — this takes 15–30 seconds…'}
            </p>
            {showCounter && (
              <div className="progress-track">
                <div className="progress-fill" style={{ width: `${percent}%` }} />
              </div>
            )}
          </>
        ) : (
          <p>Loading…</p>
        )}
        <style jsx>{`
          .analyzing-state {
            display: flex; flex-direction: column; align-items: center; justify-content: center;
            padding: 120px 20px; gap: 16px; min-height: 60vh;
          }
          .spinner {
            width: 32px; height: 32px; border: 3px solid var(--border-card); border-top-color: #0070f3;
            border-radius: 50%; animation: spin 0.8s linear infinite;
          }
          p { color: var(--text-secondary); font-size: 14px; }
          .progress-track {
            width: 240px; height: 5px; background: var(--bg-card-elevated); border-radius: 999px; overflow: hidden;
          }
          .progress-fill {
            height: 100%; background: #0070f3; transition: width 0.3s ease;
          }
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
      ⬇ CSV
    </button>
    <button className="btn-download btn-pdf" onClick={() => generatePDF(exceptions, metrics, auditLogs)}>
      📄 PDF Report
    </button>
  </div>
</div>

      <HealthSummaryCard uploadBatchId={uploadBatchId} />

      {message && <p className="info-message">{message}</p>}

      <MatchRateCard matchRate={metrics.matchRate} totalRecords={metrics.total} matchedCount={metrics.matched} />
      <StatsCards stats={metrics} />

      <ChartsPanel exceptions={exceptions} metrics={metrics} />

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
}        .btn-download {
  display: inline-flex; align-items: center; gap: 6px;
  padding: 10px 18px;
  border-radius: 10px;
  background: var(--bg-card-elevated);
  border: 1px solid var(--border-card);
  color: var(--text-primary);
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
}
.btn-download:hover {
  background: var(--border-card);
  border-color: #0070f3;
}
.btn-pdf {
  background: rgba(255,107,107,0.08);
  border-color: rgba(255,107,107,0.2);
  color: #ff6b6b;
}
.btn-pdf:hover {
  background: rgba(255,107,107,0.15);
  border-color: #ff6b6b;
}
        .dash-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 24px;
        }
        .dash-title { font-size: 22px; font-weight: 700; color: var(--text-primary); margin: 0; letter-spacing: -0.01em; }
        .dash-subtitle { font-size: 13px; color: var(--text-muted); margin: 2px 0 0 0; }

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

        /* ===== LIGHT MODE ===== */
        :global(html[data-theme='light']) .spinner { border-color: #e2e8f0; border-top-color: #0070f3; }
        :global(html[data-theme='light']) .progress-track { background: #e2e8f0; }
      `}</style>
    </>
  );
}