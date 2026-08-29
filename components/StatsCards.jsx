export default function StatsCards({ stats }) {
  const items = [
    { label: 'Total Orders', value: stats.total ?? 0, color: '#0f172a', colorVar: true },
    { label: 'Matched', value: stats.matched ?? 0, color: '#22c55e' },
    { label: 'Exceptions', value: stats.exceptions ?? 0, color: '#f59e0b' },
    { label: 'Amount at Risk', value: `₹${((stats.amountAtRisk || 0) / 100).toLocaleString('en-IN')}`, color: '#ef4444' },
  ];
  return (
    <div className="grid">
      {items.map((item) => (
        <div key={item.label} className="stat">
          <p className="label">{item.label}</p>
          <p className="value" style={item.colorVar ? {} : { color: item.color }}>{item.value}</p>
        </div>
      ))}
      <style jsx>{`
        .grid { display: grid; grid-template-columns: repeat(2,1fr); gap: 14px; margin-bottom: 20px; }
        @media (min-width: 640px) { .grid { grid-template-columns: repeat(4,1fr); } }
        .stat { background: var(--bg-card); border: 1px solid var(--border-card); border-radius: 14px; padding: 16px; }
        .label { font-size: 12px; color: var(--text-muted); margin: 0 0 6px 0; }
        .value { font-size: 20px; font-weight: 600; font-family: 'Courier New', monospace; margin: 0; color: var(--text-primary); }
        /* ===== LIGHT MODE ===== */
        :global(html[data-theme="light"]) .stat { background: #ffffff; border-color: #e2e8f0; }
        :global(html[data-theme="light"]) .label { color: #64748b; }
        :global(html[data-theme="light"]) .value { color: #0f172a; }
      `}</style>
    </div>
  );
}