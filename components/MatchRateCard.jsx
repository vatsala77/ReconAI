export default function MatchRateCard({ matchRate, totalRecords, matchedCount }) {
  const rate = parseFloat(matchRate) || 0;
  const isHealthy = rate >= 90;
  const color = isHealthy ? '#34D399' : '#F59E0B';

  return (
    <div className="card">
      <p className="card-label">Reconciliation Match Rate</p>
      <div className="match-rate-row">
        <span className="match-rate-value" style={{ color }}>{rate.toFixed(1)}%</span>
        <span className="match-rate-sub">{matchedCount} / {totalRecords} settled</span>
      </div>
      <div className="progress-track">
        <div className="progress-fill" style={{ width: `${rate}%`, background: color }} />
      </div>
    </div>
  );
}