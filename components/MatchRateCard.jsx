export default function MatchRateCard({ matchRate, totalRecords, matchedCount }) {
  const rate = parseFloat(matchRate) || 0;
  const isHealthy = rate >= 90;
  const color = isHealthy ? '#34D399' : '#f5a623';

  return (
    <div className="card">
      <p className="card-label">Reconciliation Match Rate</p>
      <div className="row">
        <span className="rate" style={{ color }}>{rate.toFixed(1)}%</span>
        <span className="sub">{matchedCount} / {totalRecords} settled</span>
      </div>
      <div className="track"><div className="fill" style={{ width: `${rate}%`, background: color }} /></div>

      <style jsx>{`
        .card { background: var(--bg-card); border: 1px solid var(--border-card); border-radius: 16px; padding: 24px; margin-bottom: 20px; }
        .card-label { font-size: 12px; text-transform: uppercase; letter-spacing: 0.08em; color: var(--text-muted); margin: 0 0 10px 0; }
        .row { display: flex; align-items: baseline; gap: 12px; }
        .rate { font-size: 40px; font-weight: 700; font-family: 'Courier New', monospace; }
        .sub { font-size: 13px; color: var(--text-muted); font-family: 'Courier New', monospace; }
        .track { margin-top: 14px; height: 6px; background: var(--bg-card-elevated); border-radius: 999px; overflow: hidden; }
        .fill { height: 100%; transition: width 0.7s ease; }
        /* ===== LIGHT MODE ===== */
        :global(html[data-theme="light"]) .card { background: #ffffff; border-color: #e2e8f0; }
        :global(html[data-theme="light"]) .card-label { color: #64748b; }
        :global(html[data-theme="light"]) .rate { color: inherit; }
        :global(html[data-theme="light"]) .sub { color: #64748b; }
        :global(html[data-theme="light"]) .track { background: #e2e8f0; }
        /* ===== LIGHT MODE ===== */
        :global(html[data-theme="light"]) .card { background: #ffffff; border-color: #e2e8f0; }
        :global(html[data-theme="light"]) .rate { color: inherit; }
      `}</style>
    </div>
  );
}