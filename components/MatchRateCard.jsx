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
        .card { background: #101b33; border: 1px solid #1f2942; border-radius: 16px; padding: 24px; margin-bottom: 20px; }
        .card-label { font-size: 12px; text-transform: uppercase; letter-spacing: 0.08em; color: #7c8493; margin: 0 0 10px 0; }
        .row { display: flex; align-items: baseline; gap: 12px; }
        .rate { font-size: 40px; font-weight: 700; font-family: 'Courier New', monospace; }
        .sub { font-size: 13px; color: #7c8493; font-family: 'Courier New', monospace; }
        .track { margin-top: 14px; height: 6px; background: #0d1730; border-radius: 999px; overflow: hidden; }
        .fill { height: 100%; transition: width 0.7s ease; }
      `}</style>
    </div>
  );
}