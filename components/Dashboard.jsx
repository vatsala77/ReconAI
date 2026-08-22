'use client';
import { useState, useEffect } from 'react';
import MatchRateCard from './MatchRateCard';
import StatsCards from './StatsCards';
import ExceptionTable from './ExceptionTable';
import AuditTimeline from './AuditTimeline';
import ReconcileButton from './ReconcileButton';

export default function Dashboard() {
  const [metrics, setMetrics] = useState(null);
  const [exceptions, setExceptions] = useState([]);
  const [auditLogs, setAuditLogs] = useState([]);

  async function loadData() {
    const [metricsRes, exceptionsRes, auditRes] = await Promise.all([
      fetch('/api/metrics').then((r) => r.json()),
      fetch('/api/exceptions').then((r) => r.json()),
      fetch('/api/audit').then((r) => r.json()),
    ]);
    setMetrics(metricsRes);
    setExceptions(exceptionsRes);
    setAuditLogs(auditRes);
  }

  useEffect(() => { loadData(); }, []);

  if (!metrics) return <div className="loading-text">Loading reconciliation data…</div>;

  return (
    <div>
      <div className="header">
        <div>
          <p className="title">ReconAI</p>
          <p className="subtitle">Route settlement reconciliation</p>
        </div>
        <ReconcileButton onComplete={loadData} />
      </div>

      <MatchRateCard matchRate={metrics.matchRate} totalRecords={metrics.total} matchedCount={metrics.matched} />
      <StatsCards stats={metrics} />

      <div className="main-grid">
        <ExceptionTable exceptions={exceptions} />
        <AuditTimeline logs={auditLogs} />
      </div>
    </div>
  );
}