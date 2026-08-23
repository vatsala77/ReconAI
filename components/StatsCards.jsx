export default function StatsCards({ stats }) {
  const items = [
    { label: 'Total Orders', value: stats.total ?? 0, color: '#ffffff' },
    { label: 'Matched', value: stats.matched ?? 0, color: '#34D399' },
    { label: 'Exceptions', value: stats.exceptions ?? 0, color: '#f5a623' },
    { label: 'Amount at Risk', value: `₹${((stats.amountAtRisk || 0) / 100).toLocaleString('en-IN')}`, color: '#ff6b6b' },
  ];
  return (
    <div className="grid">
      {items.map((item) => (
        <div key={item.label} className="stat">
          <p className="label">{item.label}</p>
          <p className="value" style={{ color: item.color }}>{item.value}</p>
        </div>
      ))}
      <style jsx>{`
        .grid { display: grid; grid-template-columns: repeat(2,1fr); gap: 14px; margin-bottom: 20px; }
        @media (min-width: 640px) { .grid { grid-template-columns: repeat(4,1fr); } }
        .stat { background: #101b33; border: 1px solid #1f2942; border-radius: 14px; padding: 16px; }
        .label { font-size: 12px; color: #7c8493; margin: 0 0 6px 0; }
        .value { font-size: 20px; font-weight: 600; font-family: 'Courier New', monospace; margin: 0; }
      `}</style>
    </div>
  );
}