'use client';
import { useRouter } from 'next/navigation';

export default function UploadsList({ uploads }) {
  const router = useRouter();

  return (
    <main className="page">
      <div className="container">
        <div className="header">
          <div>
            <p className="title">Your Uploads</p>
            <p className="subtitle">Select an upload to view its reconciliation analysis</p>
          </div>
          <button className="btn-primary" onClick={() => router.push('/upload')}>+ New Upload</button>
        </div>

        {uploads.length === 0 ? (
          <div className="empty-state-card">
            <div className="empty-icon">📊</div>
            <p className="empty-title">No uploads yet</p>
            <p className="empty-subtitle">Upload your first route settlement file to start reconciling.</p>
            <button className="btn-primary" onClick={() => router.push('/upload')}>+ Upload your first file</button>
          </div>
        ) : (
          <div className="uploads-list">
            {uploads.map((u) => (
              <button
                key={u.id}
                className="upload-item"
                onClick={() => router.push(`/dashboard/${u.id}`)}
              >
                <div>
                  <p className="upload-name">{u.fileName}</p>
                  <p className="upload-meta">{u.orderCount} orders · {new Date(u.createdAt).toLocaleDateString('en-IN')}</p>
                </div>
                <span className={`status-badge ${u.status}`}>{u.status}</span>
              </button>
            ))}
          </div>
        )}
      </div>

      <style jsx>{`
        .uploads-list { display: flex; flex-direction: column; gap: 12px; margin-top: 24px; }
        .upload-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          background: #12161F;
          border: 1px solid #232838;
          border-radius: 10px;
          padding: 16px 20px;
          cursor: pointer;
          text-align: left;
          color: inherit;
          width: 100%;
        }
        .upload-item:hover { background: #171B26; }
        .upload-name { color: #E4E7EC; font-size: 15px; margin: 0 0 4px 0; }
        .upload-meta { color: #7C8493; font-size: 13px; margin: 0; font-family: 'Courier New', monospace; }
        .status-badge {
          font-size: 12px;
          padding: 4px 10px;
          border-radius: 6px;
          background: rgba(52,211,153,0.1);
          color: #34D399;
          text-transform: capitalize;
        }
        .btn-primary {
          padding: 10px 20px;
          border-radius: 8px;
          background: #34D399;
          color: #0B0E14;
          font-weight: 500;
          font-size: 14px;
          border: none;
          cursor: pointer;
        }

        .empty-state-card {
          margin-top: 40px;
          background: #101b33;
          border: 1px solid #1f2942;
          border-radius: 20px;
          padding: 64px 32px;
          text-align: center;
        }
        .empty-icon { font-size: 40px; margin-bottom: 16px; }
        .empty-title { font-size: 18px; font-weight: 600; color: #E4E7EC; margin-bottom: 6px; }
        .empty-subtitle { font-size: 14px; color: #7C8493; margin-bottom: 24px; }
      `}</style>
    </main>
  );
}