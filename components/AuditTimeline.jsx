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
        .panel { background: #101b33; border: 1px solid #1f2942; border-radius: 16px; overflow: hidden; }
        .panel-title { font-size: 14px; font-weight: 600; color: #ffffff; padding: 16px 20px; margin: 0; border-bottom: 1px solid #1f2942; }
        .empty { padding: 20px; color: #7c8493; font-size: 13px; margin: 0; }
        .list { display: flex; flex-direction: column; gap: 14px; max-height: 320px; overflow-y: auto; padding: 18px 20px; }
        .item { display: flex; gap: 10px; }
        .dot-col { display: flex; flex-direction: column; align-items: center; }
        .dot { width: 7px; height: 7px; border-radius: 50%; margin-top: 5px; }
        .line { width: 1px; flex: 1; background: #1f2942; margin-top: 4px; }
        .action { font-size: 13px; color: #e4e7ec; margin: 0; }
        .meta { font-size: 11.5px; color: #7c8493; font-family: 'Courier New', monospace; margin: 2px 0 0 0; }
      `}</style>
    </div>
  );
}