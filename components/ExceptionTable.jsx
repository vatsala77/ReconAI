'use client';
import { useState } from 'react';

const CATEGORY_STYLES = {
  missing_payout: { label: 'Missing Payout', color: '#ff6b6b' },
  duplicate_payout: { label: 'Duplicate Payout', color: '#ff6b6b' },
  chargeback_hold: { label: 'Hold Expired', color: '#f5a623' },
  reversal_pending: { label: 'Reversal Pending', color: '#f5a623' },
  settlement_failed: { label: 'Settlement Failed', color: '#ff6b6b' },
  amount_mismatch: { label: 'Amount Mismatch', color: '#ff6b6b' },
  bank_credit_delayed: { label: 'Bank Credit Delayed', color: '#f5a623' },
  bank_amount_mismatch: { label: 'Bank Amount Mismatch', color: '#ff6b6b' },
  gst_tcs_mismatch: { label: 'GST TCS Mismatch', color: '#ff6b6b' },
  tax_line_discrepancy: { label: 'Tax Line Discrepancy', color: '#ff6b6b' },
};

export default function ExceptionTable({ exceptions: initialExceptions }) {
  const [exceptions, setExceptions] = useState(initialExceptions);
  const [expandedId, setExpandedId] = useState(null);
  const [suggestions, setSuggestions] = useState({}); // { [exceptionId]: { suggestedAction, reasoning } }
  const [loadingSuggestion, setLoadingSuggestion] = useState(null);
  const [resolving, setResolving] = useState(null);

  async function handleSuggest(exceptionId) {
    setLoadingSuggestion(exceptionId);
    try {
      const res = await fetch(`/api/exceptions/${exceptionId}/suggest-action`, { method: 'POST' });
      const data = await res.json();
      setSuggestions((prev) => ({ ...prev, [exceptionId]: data }));
    } catch (err) {
      setSuggestions((prev) => ({
        ...prev,
        [exceptionId]: { suggestedAction: 'Manual review required', reasoning: 'Could not generate a suggestion right now.' },
      }));
    } finally {
      setLoadingSuggestion(null);
    }
  }

  async function handleApprove(exceptionId) {
    const suggestion = suggestions[exceptionId];
    if (!suggestion) return;

    setResolving(exceptionId);
    try {
      const res = await fetch(`/api/exceptions/${exceptionId}/resolve`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: suggestion.suggestedAction, reasoning: suggestion.reasoning }),
      });
      const data = await res.json();

      if (data.success) {
        setExceptions((prev) =>
          prev.map((e) =>
            e.id === exceptionId
              ? { ...e, status: 'resolved', resolvedAt: data.resolvedAt, resolvedBy: data.resolvedBy, resolutionAction: suggestion.suggestedAction }
              : e
          )
        );
      }
    } catch (err) {
      alert('Failed to resolve exception. Please try again.');
    } finally {
      setResolving(null);
    }
  }

  return (
    <div className="panel">
      <p className="panel-title">Exceptions</p>
      {exceptions.length === 0 && <p className="empty">No exceptions found in this run.</p>}
      {exceptions.map((exc) => {
        const style = CATEGORY_STYLES[exc.category] || { label: exc.category, color: '#7c8493' };
        const isOpen = expandedId === exc.id;
        const orderId = exc.reconciliation?.orderId;
        const isResolved = exc.status === 'resolved';
        const suggestion = suggestions[exc.id];

        return (
          <div key={exc.id}>
            <button className="row" onClick={() => setExpandedId(isOpen ? null : exc.id)}>
              <div className="left">
                <span className="badge" style={{ color: style.color, background: `${style.color}1A` }}>{style.label}</span>
                <span className="order-id">{orderId}</span>
                {isResolved && <span className="resolved-badge">✓ Resolved</span>}
              </div>
              <span className="conf">{((exc.confidenceScore || 0) * 100).toFixed(0)}% confidence</span>
            </button>

            {isOpen && (
              <div className="detail">
                <p>{exc.aiExplanation}</p>
                {exc.amountDiscrepancy > 0 && (
                  <p className="amt">Discrepancy: ₹{(exc.amountDiscrepancy / 100).toLocaleString('en-IN')}</p>
                )}
                {exc.taxLineBreakdown && exc.taxLineBreakdown.length > 0 && (
                  <table className="tax-table">
                    <thead>
                      <tr><th>Tax Line</th><th>Expected</th><th>Actual</th><th>Rule</th></tr>
                    </thead>
                    <tbody>
                      {exc.taxLineBreakdown.map((line, i) => (
                        <tr key={i}>
                          <td>{line.line}</td>
                          <td>₹{(line.expected / 100).toFixed(2)}</td>
                          <td>₹{(line.actual / 100).toFixed(2)}</td>
                          <td>{line.rule}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}

                {/* Explainable Action Agent section */}
                <div className="action-section">
                  {isResolved ? (
                    <div className="resolved-trail">
                      <p className="resolved-line">
                        ✓ Resolved by <strong>{exc.resolvedBy}</strong> on {new Date(exc.resolvedAt).toLocaleString('en-IN')}
                      </p>
                      <p className="resolved-action">Action taken: {exc.resolutionAction}</p>
                    </div>
                  ) : suggestion ? (
                    <div className="suggestion-box">
                      <p className="suggestion-label">Suggested Resolution</p>
                      <p className="suggestion-action">{suggestion.suggestedAction}</p>
                      <p className="suggestion-reasoning">{suggestion.reasoning}</p>
                      <button
                        className="approve-btn"
                        onClick={() => handleApprove(exc.id)}
                        disabled={resolving === exc.id}
                      >
                        {resolving === exc.id ? 'Resolving…' : '✓ Approve & Resolve'}
                      </button>
                    </div>
                  ) : (
                    <button
                      className="suggest-btn"
                      onClick={() => handleSuggest(exc.id)}
                      disabled={loadingSuggestion === exc.id}
                    >
                      {loadingSuggestion === exc.id ? 'Generating suggestion…' : '✦ Suggest Resolution'}
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>
        );
      })}

      <style jsx>{`
        .panel { background: var(--bg-card); border: 1px solid var(--border-card); border-radius: 16px; overflow: hidden; }
        .panel-title { font-size: 14px; font-weight: 600; color: var(--text-primary); padding: 16px 20px; margin: 0; border-bottom: 1px solid var(--border-card); }
        .empty { padding: 20px; color: #7c8493; font-size: 13px; margin: 0; }
        .row {
          width: 100%; display: flex; justify-content: space-between; align-items: center;
          padding: 14px 20px; background: none; border: none; border-bottom: 1px solid var(--border-card);
          cursor: pointer; text-align: left; color: inherit;
        }
        .row:hover { background: var(--bg-card-elevated); }
        .left { display: flex; align-items: center; gap: 12px; }
        .badge { font-size: 11px; font-family: 'Courier New', monospace; padding: 4px 8px; border-radius: 6px; white-space: nowrap; }
        .order-id { font-size: 13px; font-family: 'Courier New', monospace; color: #e4e7ec; }
        .resolved-badge {
          font-size: 10.5px; color: #34D399; background: rgba(52,211,153,0.1);
          padding: 3px 8px; border-radius: 6px; font-weight: 600;
        }
        .conf { font-size: 12px; color: #7c8493; font-family: 'Courier New', monospace; }
        .detail { padding: 0 20px 16px 20px; font-size: 13.5px; color: #c1c6d7; line-height: 1.6; }
        .amt { margin-top: 8px; font-size: 12px; color: #7c8493; font-family: 'Courier New', monospace; }
        .tax-table {
          margin-top: 12px;
          width: 100%;
          border-collapse: collapse;
          font-size: 12px;
        }
        .tax-table th, .tax-table td {
          text-align: left;
          padding: 6px 10px;
          border-bottom: 1px solid #1f2942;
          color: #c1c6d7;
        }
        .tax-table th {
          color: #7c8493;
          font-weight: 600;
          text-transform: uppercase;
          font-size: 10px;
        }

        .action-section { margin-top: 16px; padding-top: 14px; border-top: 1px solid var(--border-card); }

        .suggest-btn {
          background: var(--bg-card-elevated);
          border: 1px solid var(--border-card);
          color: #aec6ff;
          font-size: 13px;
          font-weight: 600;
          padding: 9px 16px;
          border-radius: 10px;
          cursor: pointer;
          transition: all 0.2s;
        }
        .suggest-btn:hover:not(:disabled) { background: var(--border-card); border-color: #0070f3; }
        .suggest-btn:disabled { opacity: 0.5; cursor: not-allowed; }

        .suggestion-box {
          background: #0d1730;
          border: 1px solid #253154;
          border-radius: 10px;
          padding: 14px 16px;
        }
        .suggestion-label {
          font-size: 10px; font-weight: 700; color: #7c8493;
          text-transform: uppercase; letter-spacing: 0.06em; margin: 0 0 6px 0;
        }
        .suggestion-action { font-size: 14px; font-weight: 600; color: #ffffff; margin: 0 0 6px 0; }
        .suggestion-reasoning { font-size: 12.5px; color: #c1c6d7; line-height: 1.5; margin: 0 0 14px 0; }

        .approve-btn {
          background: #34D399;
          color: #0B0E14;
          border: none;
          font-size: 13px;
          font-weight: 700;
          padding: 9px 18px;
          border-radius: 10px;
          cursor: pointer;
          transition: all 0.2s;
        }
        .approve-btn:hover:not(:disabled) { background: #2bc08a; }
        .approve-btn:disabled { opacity: 0.6; cursor: not-allowed; }

        .resolved-trail {
          background: rgba(52,211,153,0.06);
          border: 1px solid rgba(52,211,153,0.2);
          border-radius: 10px;
          padding: 12px 16px;
        }
        .resolved-line { font-size: 12.5px; color: #34D399; margin: 0 0 4px 0; }
        .resolved-line strong { color: #ffffff; }
        .resolved-action { font-size: 12.5px; color: #c1c6d7; margin: 0; }
        .resolved-line strong { color: #ffffff; }

        /* ===== LIGHT MODE ===== */
        :global(html[data-theme="light"]) .panel { background: #ffffff; border-color: #e2e8f0; }
        :global(html[data-theme="light"]) .panel-title { color: #0f172a; border-bottom-color: #e2e8f0; }
        :global(html[data-theme="light"]) .empty { color: #64748b; }
        :global(html[data-theme="light"]) .row:hover { background: #f8fafc; }
        :global(html[data-theme="light"]) .row { border-bottom-color: #e2e8f0; }
        :global(html[data-theme="light"]) .order-id { color: #0f172a; }
        :global(html[data-theme="light"]) .confidence-text { color: #64748b; }
        :global(html[data-theme="light"]) .detail { color: #475569; }
        :global(html[data-theme="light"]) .suggest-btn { background: #f1f5f9; border-color: #e2e8f0; color: #0070f3; }
        :global(html[data-theme="light"]) .suggest-btn:hover { background: #e2e8f0; border-color: #0070f3; }
        :global(html[data-theme="light"]) .reasoning { color: #475569; background: #f8fafc; border-color: #e2e8f0; }
        :global(html[data-theme="light"]) .suggestion-box { background: #f0f9ff; border-color: #bae6fd; }
        :global(html[data-theme="light"]) .suggestion-label { color: #64748b; }
        :global(html[data-theme="light"]) .suggestion-action { color: #0f172a; }
        :global(html[data-theme="light"]) .suggestion-reasoning { color: #475569; }
        :global(html[data-theme="light"]) .approve-btn { color: #ffffff; }
        :global(html[data-theme="light"]) .tax-table th, :global(html[data-theme="light"]) .tax-table td { border-bottom-color: #e2e8f0; color: #475569; }
        :global(html[data-theme="light"]) .tax-table th { color: #64748b; }
        :global(html[data-theme="light"]) .amt { color: #64748b; }
        :global(html[data-theme="light"]) .conf { color: #64748b; }
        :global(html[data-theme="light"]) .resolved-trail { background: rgba(52,211,153,0.06); border-color: rgba(52,211,153,0.2); }
        :global(html[data-theme="light"]) .resolved-line { color: #16a34a; }
        :global(html[data-theme="light"]) .resolved-line strong { color: #0f172a; }
        :global(html[data-theme="light"]) .resolved-action { color: #475569; }
      `}</style>
    </div>
  );
}