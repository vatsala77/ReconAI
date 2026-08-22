'use client';
import { useState } from 'react';

const CATEGORY_STYLES = {
  missing_payout: { label: 'Missing Payout', color: '#F87171' },
  duplicate_payout: { label: 'Duplicate Payout', color: '#F87171' },
  chargeback_hold: { label: 'Hold Expired', color: '#F59E0B' },
  reversal_pending: { label: 'Reversal Pending', color: '#F59E0B' },
  settlement_failed: { label: 'Settlement Failed', color: '#F87171' },
  amount_mismatch: { label: 'Amount Mismatch', color: '#F87171' },
};

export default function ExceptionTable({ exceptions }) {
  const [expandedId, setExpandedId] = useState(null);

  return (
    <div className="card" style={{ padding: 0 }}>
      <p className="panel-title">Exceptions</p>
      {exceptions.length === 0 && <p className="empty-text">No exceptions found in this run.</p>}
      {exceptions.map((exc) => {
        const style = CATEGORY_STYLES[exc.category] || { label: exc.category, color: '#7C8493' };
        const isOpen = expandedId === exc.id;
        const orderId = exc.reconciliation?.orderId;
        return (
          <div key={exc.id}>
            <button className="exception-row" onClick={() => setExpandedId(isOpen ? null : exc.id)}>
              <div className="exception-left">
                <span className="badge" style={{ color: style.color, background: `${style.color}1A` }}>
                  {style.label}
                </span>
                <span className="order-id">{orderId}</span>
              </div>
              <span className="confidence-text">{((exc.confidenceScore || 0) * 100).toFixed(0)}% confidence</span>
            </button>
            {isOpen && (
              <div className="exception-detail">
                <p>{exc.aiExplanation}</p>
                {exc.amountDiscrepancy > 0 && (
                  <p className="discrepancy-amount">
                    Discrepancy: ₹{(exc.amountDiscrepancy / 100).toLocaleString('en-IN')}
                  </p>
                )}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}