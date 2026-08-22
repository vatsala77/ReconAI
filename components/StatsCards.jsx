export default function StatsCards({ stats }) {
  const items = [
    { label: 'Total Orders', value: stats.total ?? 0, color: '#E4E7EC' },
    { label: 'Matched', value: stats.matched ?? 0, color: '#34D399' },
    { label: 'Exceptions', value: stats.exceptions ?? 0, color: '#F59E0B' },
    { label: 'Amount at Risk', value: `₹${((stats.amountAtRisk || 0) / 100).toLocaleString('en-IN')}`, color: '#F87171' },
  ];
  return (
    <div className="stats-grid">
      {items.map((item) => (
        <div key={item.label} className="stat-card">
          <p className="stat-label">{item.label}</p>
          <p className="stat-value" style={{ color: item.color }}>{item.value}</p>
        </div>
      ))}
    </div>
  );
}