'use client';
import { useState, useEffect } from 'react';

const TAB_ICONS = {
  Orders: '📋',
  Transfers: '💸',
  BankSettlements: '🏦',
  GSTFilings: '🧾',
};

export default function DemoDataPreview() {
  const [data, setData] = useState(null);
  const [activeTab, setActiveTab] = useState('Orders');
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState(false);

  useEffect(() => {
    fetch('/api/demo-preview')
      .then((r) => r.json())
      .then((d) => { setData(d); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  if (loading) return null;
  if (!data || data.error) return null;

  const tabs = Object.keys(data);
  const current = data[activeTab];

  return (
    <div className="preview-panel">
      <button className="preview-toggle" onClick={() => setExpanded(!expanded)}>
        <span className="toggle-left">
          <span className="file-icon">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
              <polyline points="14 2 14 8 20 8"/>
              <line x1="16" y1="13" x2="8" y2="13"/>
              <line x1="16" y1="17" x2="8" y2="17"/>
            </svg>
          </span>
          <span className="toggle-text">
            <strong>Demo Seed File</strong>
            <span className="file-name">reconai_full_demo_batch_50plus.xlsx</span>
          </span>
        </span>
        <span className="toggle-right">
          <span className="row-counts">
            {tabs.map((t) => (
              <span key={t} className="count-chip">{data[t].totalRows} {t === 'Orders' ? 'orders' : t === 'Transfers' ? 'transfers' : t === 'BankSettlements' ? 'bank' : 'GST'}</span>
            ))}
          </span>
          <span className="chevron">{expanded ? '▾' : '▸'}</span>
        </span>
      </button>

      {expanded && (
        <div className="preview-body">
          <div className="tabs">
            {tabs.map((t) => (
              <button key={t} className={'tab' + (activeTab === t ? ' active' : '')} onClick={() => setActiveTab(t)}>
                <span className="tab-icon">{TAB_ICONS[t] || '📄'}</span>
                <span className="tab-name">{t}</span>
                <span className="tab-count">{data[t].totalRows}</span>
              </button>
            ))}
          </div>

          <div className="table-wrap">
            <table className="data-table">
              <thead>
                <tr>
                  <th className="row-num">#</th>
                  {current.columns.map((col) => (
                    <th key={col}>{col}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {current.rows.map((row, i) => (
                  <tr key={i}>
                    <td className="row-num">{i + 1}</td>
                    {current.columns.map((col) => (
                      <td key={col}>{row[col] !== undefined && row[col] !== '' ? String(row[col]) : '—'}</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {current.totalRows > 8 && (
            <p className="more-rows">+ {current.totalRows - 8} more rows loaded during reconciliation</p>
          )}
        </div>
      )}

      <style jsx>{`
        .preview-panel {
          background: var(--bg-card);
          border: 1px solid var(--border-card);
          border-radius: 14px;
          overflow: hidden;
        }
        .preview-toggle {
          width: 100%;
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 14px 20px;
          background: none;
          border: none;
          cursor: pointer;
          color: inherit;
          text-align: left;
          transition: background 0.15s;
        }
        .preview-toggle:hover { background: var(--bg-card-elevated); }
        .toggle-left { display: flex; align-items: center; gap: 12px; }
        .toggle-right { display: flex; align-items: center; gap: 12px; }
        .file-icon {
          width: 36px; height: 36px; border-radius: 8px;
          background: rgba(52,211,153,0.1); color: #34D399;
          display: flex; align-items: center; justify-content: center;
          flex-shrink: 0;
        }
        .toggle-text { display: flex; flex-direction: column; gap: 2px; }
        .toggle-text strong { font-size: 13px; font-weight: 600; color: var(--text-primary); }
        .file-name { font-size: 11px; font-family: 'Courier New', monospace; color: var(--text-muted, #7c8493); }
        .row-counts { display: flex; gap: 6px; flex-wrap: wrap; }
        .count-chip {
          font-size: 10px; font-weight: 600; padding: 3px 8px; border-radius: 6px;
          background: rgba(0,112,243,0.06); color: #60a5fa; white-space: nowrap;
        }
        .chevron { font-size: 14px; color: var(--text-muted, #7c8493); transition: transform 0.2s; }

        .preview-body { border-top: 1px solid var(--border-card); }
        .tabs { display: flex; gap: 2px; padding: 8px 16px 0; overflow-x: auto; }
        .tab {
          display: flex; align-items: center; gap: 6px;
          padding: 8px 14px; border-radius: 8px 8px 0 0;
          border: 1px solid transparent; border-bottom: none;
          background: transparent; color: var(--text-muted, #7c8493);
          font-size: 12px; font-weight: 600; cursor: pointer;
          transition: all 0.15s; white-space: nowrap;
        }
        .tab:hover { color: var(--text-primary); background: var(--bg-card-elevated); }
        .tab.active {
          background: var(--bg-card-elevated);
          border-color: var(--border-card);
          color: var(--text-primary);
        }
        .tab-icon { font-size: 13px; }
        .tab-count {
          font-size: 10px; padding: 1px 6px; border-radius: 4px;
          background: rgba(0,112,243,0.08); color: #60a5fa;
        }

        .table-wrap { overflow-x: auto; padding: 0 16px 12px; }
        .data-table {
          width: 100%; border-collapse: collapse;
          font-size: 11.5px; font-family: 'Courier New', monospace;
          margin-top: 8px;
        }
        .data-table th {
          text-align: left; padding: 8px 10px;
          font-size: 10px; font-weight: 700; text-transform: uppercase;
          letter-spacing: 0.05em; color: var(--text-muted, #7c8493);
          border-bottom: 1px solid var(--border-card);
          white-space: nowrap; position: sticky; top: 0;
          background: var(--bg-card);
        }
        .data-table td {
          padding: 7px 10px; border-bottom: 1px solid var(--border-card);
          color: var(--text-secondary, #c1c6d7); white-space: nowrap;
        }
        .data-table tr:hover td { background: var(--bg-card-elevated); }
        .row-num { color: var(--text-muted, #4a5578); width: 30px; text-align: center; }

        .more-rows {
          text-align: center; font-size: 11px; color: var(--text-muted, #7c8493);
          padding: 8px 16px 14px; margin: 0;
        }

        :global(html[data-theme="light"]) .file-icon { background: rgba(16,185,129,0.08); color: #10b981; }
        :global(html[data-theme="light"]) .count-chip { background: rgba(37,99,235,0.06); color: #2563eb; }
        :global(html[data-theme="light"]) .tab-count { background: rgba(37,99,235,0.06); color: #2563eb; }
        :global(html[data-theme="light"]) .data-table td { border-bottom-color: #e2e8f0; color: #475569; }
        :global(html[data-theme="light"]) .data-table th { background: var(--bg-card); border-bottom-color: #e2e8f0; }
        :global(html[data-theme="light"]) .data-table tr:hover td { background: #f8fafc; }
      `}</style>
    </div>
  );
}
