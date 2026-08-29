'use client';
import { useMemo } from 'react';
import {
  PieChart, Pie, Cell, Tooltip, ResponsiveContainer,
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
} from 'recharts';

const COLORS = ['#ff6b6b', '#f5a623', '#60a5fa', '#34D399', '#a78bfa', '#f472b6', '#fb923c', '#38bdf8'];

const CATEGORY_LABELS = {
  missing_payout: 'Missing Payout',
  duplicate_payout: 'Duplicate Payout',
  chargeback_hold: 'Hold Expired',
  reversal_pending: 'Reversal Pending',
  settlement_failed: 'Settlement Failed',
  amount_mismatch: 'Amount Mismatch',
  bank_credit_delayed: 'Bank Delay',
  bank_amount_mismatch: 'Bank Mismatch',
  gst_tcs_mismatch: 'GST TCS Mismatch',
  tax_line_discrepancy: 'Tax Line Discrepancy',
};

function CustomTooltip({ active, payload }) {
  if (!active || !payload || !payload.length) return null;
  const d = payload[0];
  return (
    <div className="chart-tooltip">
      <p className="tooltip-label">{d.name || d.payload?.label}</p>
      <p className="tooltip-value">{d.value} {d.payload?.unit || ''}</p>
    </div>
  );
}

export default function ChartsPanel({ exceptions = [], metrics = {} }) {
  const { categoryData, sellerData, matchRate } = useMemo(() => {
    // Category breakdown
    const catMap = {};
    exceptions.forEach((exc) => {
      const cat = exc.category || 'unknown';
      catMap[cat] = (catMap[cat] || 0) + 1;
    });
    const categoryData = Object.entries(catMap)
      .map(([key, value]) => ({ name: CATEGORY_LABELS[key] || key, value }))
      .sort((a, b) => b.value - a.value);

    // Seller-wise exceptions
    const sellerMap = {};
    exceptions.forEach((exc) => {
      const seller = exc.reconciliation?.order?.sellerId || exc.reconciliation?.transfer?.recipient || 'Unknown';
      const shortName = seller.replace('acc_', '').substring(0, 12);
      sellerMap[shortName] = (sellerMap[shortName] || 0) + 1;
    });
    const sellerData = Object.entries(sellerMap)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 8);

    const matchRate = Number(metrics.matchRate) || 0;

    return { categoryData, sellerData, matchRate };
  }, [exceptions, metrics]);

  if (exceptions.length === 0) return null;

  const resolvedCount = exceptions.filter((e) => e.status === 'resolved').length;
  const openCount = exceptions.length - resolvedCount;

  return (
    <div className="charts-grid">
      {/* Exception Categories Pie */}
      <div className="chart-card">
        <p className="chart-title">Exception Breakdown</p>
        <div className="chart-body">
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie
                data={categoryData}
                cx="50%" cy="50%"
                innerRadius={50} outerRadius={80}
                paddingAngle={3}
                dataKey="value"
              >
                {categoryData.map((_, i) => (
                  <Cell key={i} fill={COLORS[i % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
            </PieChart>
          </ResponsiveContainer>
          <div className="legend">
            {categoryData.map((d, i) => (
              <span key={i} className="legend-item">
                <span className="legend-dot" style={{ background: COLORS[i % COLORS.length] }} />
                {d.name} ({d.value})
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Seller-wise Bar Chart */}
      <div className="chart-card">
        <p className="chart-title">Seller-wise Exceptions</p>
        <div className="chart-body">
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={sellerData} layout="vertical" margin={{ left: 10, right: 20, top: 5, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
              <XAxis type="number" tick={{ fontSize: 11, fill: '#7c8493' }} />
              <YAxis type="category" dataKey="name" tick={{ fontSize: 11, fill: '#94a3b8', fontFamily: 'Courier New' }} width={100} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="count" radius={[0, 6, 6, 0]} barSize={18}>
                {sellerData.map((_, i) => (
                  <Cell key={i} fill={COLORS[i % COLORS.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Match Rate + Status Donut */}
      <div className="chart-card stat-card">
        <p className="chart-title">Reconciliation Health</p>
        <div className="stat-grid">
          <div className="donut-wrap">
            <svg viewBox="0 0 120 120" className="donut">
              <circle cx="60" cy="60" r="50" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="10" />
              <circle
                cx="60" cy="60" r="50" fill="none"
                stroke="#34D399" strokeWidth="10"
                strokeDasharray={`${(matchRate / 100) * 314} 314`}
                strokeLinecap="round"
                transform="rotate(-90 60 60)"
              />
              <text x="60" y="56" textAnchor="middle" className="donut-text">{matchRate.toFixed(1)}%</text>
              <text x="60" y="72" textAnchor="middle" className="donut-sub">Match Rate</text>
            </svg>
          </div>
          <div className="stat-rows">
            <div className="stat-row">
              <span className="stat-dot" style={{ background: '#ff6b6b' }} />
              <span className="stat-label">Open</span>
              <span className="stat-val">{openCount}</span>
            </div>
            <div className="stat-row">
              <span className="stat-dot" style={{ background: '#34D399' }} />
              <span className="stat-label">Resolved</span>
              <span className="stat-val">{resolvedCount}</span>
            </div>
            <div className="stat-row">
              <span className="stat-dot" style={{ background: '#60a5fa' }} />
              <span className="stat-label">Total</span>
              <span className="stat-val">{exceptions.length}</span>
            </div>
            {metrics.total > 0 && (
              <div className="stat-row">
                <span className="stat-dot" style={{ background: '#a78bfa' }} />
                <span className="stat-label">Orders</span>
                <span className="stat-val">{metrics.total}</span>
              </div>
            )}
          </div>
        </div>
      </div>

      <style jsx>{`
        .charts-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 20px;
          margin-bottom: 24px;
        }
        @media (max-width: 900px) { .charts-grid { grid-template-columns: 1fr; } }
        .chart-card {
          background: var(--bg-card);
          border: 1px solid var(--border-card);
          border-radius: 16px;
          padding: 20px;
          overflow: hidden;
        }
        .chart-title {
          font-size: 13px; font-weight: 600; color: var(--text-primary);
          margin: 0 0 16px 0;
        }
        .chart-body { display: flex; flex-direction: column; gap: 12px; }
        .legend { display: flex; flex-wrap: wrap; gap: 8px 14px; }
        .legend-item {
          display: flex; align-items: center; gap: 5px;
          font-size: 11px; color: var(--text-muted, #94a3b8);
        }
        .legend-dot { width: 8px; height: 8px; border-radius: 2px; flex-shrink: 0; }

        .stat-card { grid-column: span 1; }
        .stat-grid { display: flex; align-items: center; gap: 24px; }
        .donut-wrap { flex-shrink: 0; }
        .donut { width: 120px; height: 120px; }
        .donut-text { font-size: 18px; font-weight: 800; fill: var(--text-primary); }
        .donut-sub { font-size: 10px; fill: var(--text-muted, #7c8493); }
        .stat-rows { display: flex; flex-direction: column; gap: 10px; flex: 1; }
        .stat-row { display: flex; align-items: center; gap: 8px; }
        .stat-dot { width: 8px; height: 8px; border-radius: 50%; flex-shrink: 0; }
        .stat-label { font-size: 12px; color: var(--text-muted, #94a3b8); flex: 1; }
        .stat-val { font-size: 14px; font-weight: 700; color: var(--text-primary); font-family: 'Courier New', monospace; }

        :global(.chart-tooltip) {
          background: #0b1324; border: 1px solid #253154; border-radius: 8px;
          padding: 8px 12px; box-shadow: 0 8px 24px rgba(0,0,0,0.4);
        }
        :global(.tooltip-label) { font-size: 11px; color: #94a3b8; margin: 0; }
        :global(.tooltip-value) { font-size: 13px; font-weight: 600; color: #fff; margin: 2px 0 0; }

        :global(html[data-theme="light"]) :global(.chart-tooltip) {
          background: #fff; border-color: #e2e8f0;
        }
        :global(html[data-theme="light"]) :global(.tooltip-label) { color: #64748b; }
        :global(html[data-theme="light"]) :global(.tooltip-value) { color: #0f172a; }
        :global(html[data-theme="light"]) .donut-text { fill: #0f172a; }
        :global(html[data-theme="light"]) .donut-sub { fill: #64748b; }
      `}</style>
    </div>
  );
}
