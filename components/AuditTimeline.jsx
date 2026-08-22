export default function AuditTimeline({ logs }) {
  return (
    <div className="card" style={{ padding: 0 }}>
      <p className="panel-title">Audit Trail</p>
      <div className="audit-list">
        {logs.length === 0 && <p className="empty-text">No activity yet.</p>}
        {logs.map((log) => (
          <div key={log.id} className="audit-item">
            <div className="audit-dot-col">
              <div className="audit-dot" style={{ background: log.action === 'MATCHED' ? '#34D399' : '#F59E0B' }} />
              <div className="audit-line" />
            </div>
            <div>
              <p className="audit-action">
                {log.action === 'MATCHED' ? 'Matched' : 'Exception detected'} — {log.reconciliation?.orderId}
              </p>
              <p className="audit-meta">{log.actor} · {new Date(log.createdAt).toLocaleString('en-IN')}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}