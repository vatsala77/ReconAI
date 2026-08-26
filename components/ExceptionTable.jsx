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

export default function ExceptionTable({ exceptions }) {
  const [expandedId, setExpandedId] = useState(null);

  return (
    <div className="panel">
      <p className="panel-title">Exceptions</p>
      {exceptions.length === 0 && <p className="empty">No exceptions found in this run.</p>}
      {exceptions.map((exc) => {
        const style = CATEGORY_STYLES[exc.category] || { label: exc.category, color: '#7c8493' };
        const isOpen = expandedId === exc.id;
        const orderId = exc.reconciliation?.orderId;
        return (
          <div key={exc.id}>
            <button className="row" onClick={() => setExpandedId(isOpen ? null : exc.id)}>
              <div className="left">
                <span className="badge" style={{ color: style.color, background: `${style.color}1A` }}>{style.label}</span>
                <span className="order-id">{orderId}</span>
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
              </div>
            )}
          </div>
        );
      })}

      <style jsx>{`
        .panel { background: #101b33; border: 1px solid #1f2942; border-radius: 16px; overflow: hidden; }
        .panel-title { font-size: 14px; font-weight: 600; color: #ffffff; padding: 16px 20px; margin: 0; border-bottom: 1px solid #1f2942; }
        .empty { padding: 20px; color: #7c8493; font-size: 13px; margin: 0; }
        .row {
          width: 100%; display: flex; justify-content: space-between; align-items: center;
          padding: 14px 20px; background: none; border: none; border-bottom: 1px solid #1f2942;
          cursor: pointer; text-align: left; color: inherit;
        }
        .row:hover { background: #151f37; }
        .left { display: flex; align-items: center; gap: 12px; }
        .badge { font-size: 11px; font-family: 'Courier New', monospace; padding: 4px 8px; border-radius: 6px; white-space: nowrap; }
        .order-id { font-size: 13px; font-family: 'Courier New', monospace; color: #e4e7ec; }
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
      `}</style>
    </div>
  );
}