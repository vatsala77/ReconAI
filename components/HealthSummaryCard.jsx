'use client';
import { useState, useEffect } from 'react';

export default function HealthSummaryCard({ uploadBatchId }) {
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function fetchSummary() {
      setLoading(true);
      try {
        const res = await fetch(`/api/health-summary?uploadBatchId=${uploadBatchId}`);
        const data = await res.json();
        if (!cancelled) setSummary(data.summary || 'Summary unavailable.');
      } catch (err) {
        if (!cancelled) setSummary('Summary unavailable.');
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    if (uploadBatchId) fetchSummary();

    return () => { cancelled = true; };
  }, [uploadBatchId]);

  return (
    <div className="health-card">
      <div className="health-icon">✦</div>
      <div className="health-content">
        <p className="health-label">Batch Health Summary</p>
        {loading ? (
          <div className="health-skeleton">
            <span></span>
            <span></span>
          </div>
        ) : (
          <p className="health-text">{summary}</p>
        )}
      </div>

      <style jsx>{`
        .health-card {
          display: flex;
          gap: 14px;
          background: var(--bg-card);
          border: 1px solid var(--border-card);
          border-radius: 16px;
          padding: 20px 22px;
          margin-bottom: 20px;
          transition: background 0.2s, border-color 0.2s;
        }
        .health-icon {
          width: 32px;
          height: 32px;
          border-radius: 10px;
          background: linear-gradient(135deg, #0070f3, #0059c5);
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 14px;
          color: white;
          flex-shrink: 0;
        }
        .health-content {
          flex: 1;
        }
        .health-label {
          font-size: 11px;
          font-weight: 700;
          color: var(--text-muted);
          text-transform: uppercase;
          letter-spacing: 0.06em;
          margin: 0 0 6px 0;
        }
        .health-text {
          font-size: 14px;
          line-height: 1.6;
          color: var(--text-secondary);
          margin: 0;
        }
        .health-skeleton {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }
        .health-skeleton span {
          display: block;
          height: 12px;
          border-radius: 4px;
          background: linear-gradient(90deg, var(--bg-card-elevated) 25%, var(--border-card) 50%, var(--bg-card-elevated) 75%);
          background-size: 200% 100%;
          animation: shimmer 1.4s infinite;
        }
        .health-skeleton span:first-child {
          width: 90%;
        }
        .health-skeleton span:last-child {
          width: 60%;
        }
        @keyframes shimmer {
          0% { background-position: 200% 0; }
          100% { background-position: -200% 0; }
        }
      `}</style>
    </div>
  );
}
