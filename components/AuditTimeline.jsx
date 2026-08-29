export default function AuditTimeline({ logs }) {
  return (
    <div className="panel">
      <p className="panel-title">Audit Trail</p>
      <div className="list">
        {logs.length === 0 && <p className="empty">No activity yet.</p>}
        {logs.map((log) => (
          <div key={log.id} className="item">
            <div className="dot-col">
              <div className="dot" style={{ background: log.action === 'MATCHED' ? '#34D399' : '#f5a623' }} />
              <div className="line" />
            </div>
            <div>
              <p className="action">{log.action === 'MATCHED' ? 'Matched' : 'Exception detected'} — {log.reconciliation?.orderId}</p>
              <p className="meta">{log.actor} · {new Date(log.createdAt).toLocaleString('en-IN')}</p>
            </div>
          </div>
        ))}
      </div>

      <style jsx>{`
        .panel { background: var(--bg-card); border: 1px solid var(--border-card); border-radius: 16px; overflow: hidden; }
        .panel-title { font-size: 14px; font-weight: 600; color: var(--text-primary); padding: 16px 20px; margin: 0; border-bottom: 1px solid var(--border-card); }
        .empty { padding: 20px; color: #7c8493; font-size: 13px; margin: 0; }
        .list { display: flex; flex-direction: column; gap: 14px; max-height: 320px; overflow-y: auto; padding: 18px 20px; }
        .item { display: flex; gap: 10px; }
        .dot-col { display: flex; flex-direction: column; align-items: center; }
        .dot { width: 7px; height: 7px; border-radius: 50%; margin-top: 5px; }
        .line { width: 1px; flex: 1; background: var(--border-card); margin-top: 4px; }
        .action { font-size: 13px; color: var(--text-primary); margin: 0; }
        .meta { font-size: 11.5px; color: var(--text-muted); font-family: 'Courier New', monospace; margin: 2px 0 0 0; }
        /* ===== LIGHT MODE ===== */
        :global(html[data-theme="light"]) .panel { background: #ffffff; border-color: #e2e8f0; }
        :global(html[data-theme="light"]) .panel-title { color: #0f172a; border-bottom-color: #e2e8f0; }
        :global(html[data-theme="light"]) .empty { color: #64748b; }
        :global(html[data-theme="light"]) .line { background: #e2e8f0; }
        :global(html[data-theme="light"]) .action { color: #0f172a; }
        :global(html[data-theme="light"]) .meta { color: #64748b; }
      `}</style>
    </div>
  );
}