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
  const [suggestions, setSuggestions] = useState({});
  const [loadingSuggestion, setLoadingSuggestion] = useState(null);
  const [resolving, setResolving] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('open');
  const [selectedIds, setSelectedIds] = useState(new Set());
  const [bulkResolving, setBulkResolving] = useState(false);

  const filteredExceptions = exceptions.filter((exc) => {
    if (statusFilter === 'open' && exc.status === 'resolved') return false;
    if (statusFilter === 'resolved' && exc.status !== 'resolved') return false;
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      (exc.reconciliation?.orderId || '').toLowerCase().includes(q) ||
      (exc.reconciliation?.order?.sellerId || '').toLowerCase().includes(q) ||
      (exc.reconciliation?.transfer?.recipient || '').toLowerCase().includes(q) ||
      (exc.category || '').toLowerCase().includes(q)
    );
  });

  const openCount = exceptions.filter((e) => e.status !== 'resolved').length;
  const resolvedCount = exceptions.filter((e) => e.status === 'resolved').length;
  const selectableIds = filteredExceptions.filter((e) => e.status !== 'resolved').map((e) => e.id);

  function toggleSelect(id) {
    setSelectedIds((prev) => { const n = new Set(prev); n.has(id) ? n.delete(id) : n.add(id); return n; });
  }

  async function handleSuggest(exceptionId) {
    setLoadingSuggestion(exceptionId);
    try {
      const res = await fetch('/api/exceptions/' + exceptionId + '/suggest-action', { method: 'POST' });
      const data = await res.json();
      setSuggestions((prev) => ({ ...prev, [exceptionId]: data }));
    } catch {
      setSuggestions((prev) => ({ ...prev, [exceptionId]: { suggestedAction: 'Manual review required', reasoning: 'Could not generate a suggestion right now.' } }));
    } finally {
      setLoadingSuggestion(null);
    }
  }

  async function handleAction(exceptionId, action) {
    const suggestion = suggestions[exceptionId];
    setResolving(exceptionId);
    try {
      const res = await fetch('/api/exceptions/' + exceptionId + '/resolve', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action, reasoning: suggestion?.reasoning || 'Manually ' + action + 'd by user' }),
      });
      const data = await res.json();
      if (data.success) {
        setExceptions((prev) => prev.map((e) => e.id === exceptionId ? { ...e, status: 'resolved', resolvedAt: data.resolvedAt, resolvedBy: data.resolvedBy, resolutionAction: action } : e));
        setSelectedIds((prev) => { const n = new Set(prev); n.delete(exceptionId); return n; });
      }
    } catch { alert('Failed to update exception.'); } finally { setResolving(null); }
  }

  async function handleBulkResolve(action) {
    const ids = [...selectedIds];
    if (ids.length === 0) return;
    if (!confirm(action + ' ' + ids.length + ' exception(s)?')) return;
    setBulkResolving(true);
    try {
      await Promise.all(ids.map((id) => fetch('/api/exceptions/' + id + '/resolve', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ action, reasoning: 'Bulk ' + action + ' - ' + ids.length + ' exceptions' }) })));
      const now = new Date().toISOString();
      setExceptions((prev) => prev.map((e) => ids.includes(e.id) ? { ...e, status: 'resolved', resolvedAt: now, resolvedBy: 'Bulk action', resolutionAction: action } : e));
      setSelectedIds(new Set());
    } catch { alert('Bulk action failed.'); } finally { setBulkResolving(false); }
  }

  return (
    <div className="panel">
      <div className="ph">
        <div className="phl">
          <p className="pt">Exceptions</p>
          <div className="pills">
            <button className={'p' + (statusFilter === 'all' ? ' a' : '')} onClick={() => setStatusFilter('all')}>All ({exceptions.length})</button>
            <button className={'p' + (statusFilter === 'open' ? ' a' : '')} onClick={() => setStatusFilter('open')}>Open ({openCount})</button>
            <button className={'p' + (statusFilter === 'resolved' ? ' a' : '')} onClick={() => setStatusFilter('resolved')}>Resolved ({resolvedCount})</button>
          </div>
        </div>
        <div className="phr">
          <div className="sw">
            <svg className="si" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" /></svg>
            <input className="sinp" type="text" placeholder="Search Order ID, Vendor..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
            {searchQuery && <button className="sc" onClick={() => setSearchQuery('')}>x</button>}
          </div>
        </div>
      </div>

      {selectedIds.size > 0 && (
        <div className="bb">
          <span className="bc">{selectedIds.size} selected</span>
          <div className="ba">
            <button className="bbt br" onClick={() => handleBulkResolve('resolved')} disabled={bulkResolving}>{bulkResolving ? 'Processing...' : 'Resolve All'}</button>
            <button className="bbt be" onClick={() => handleBulkResolve('escalated')} disabled={bulkResolving}>Escalate All</button>
            <button className="bbt bi" onClick={() => handleBulkResolve('ignored')} disabled={bulkResolving}>Ignore All</button>
            <button className="bbt bx" onClick={() => setSelectedIds(new Set())}>Clear</button>
          </div>
        </div>
      )}

      {searchQuery && filteredExceptions.length === 0 && <p className="emp">No exceptions match &quot;{searchQuery}&quot;.</p>}
      {!searchQuery && statusFilter === 'all' && exceptions.length === 0 && <p className="emp">No exceptions found.</p>}
      {!searchQuery && statusFilter !== 'all' && filteredExceptions.length === 0 && <p className="emp">No {statusFilter} exceptions.</p>}

      {filteredExceptions.map((exc) => {
        const style = CATEGORY_STYLES[exc.category] || { label: exc.category, color: '#7c8493' };
        const isO = expandedId === exc.id;
        const oid = exc.reconciliation?.orderId;
        const isR = exc.status === 'resolved';
        const sg = suggestions[exc.id];
        const isSel = selectedIds.has(exc.id);
        return (
          <div key={exc.id}>
            <button className={'rw' + (isSel ? ' rws' : '')} onClick={() => setExpandedId(isO ? null : exc.id)}>
              <div className="lf">
                {!isR && (
                  <span className="cww" onClick={(e) => { e.stopPropagation(); toggleSelect(exc.id); }}>
                    <span className={'cb' + (isSel ? ' cbs' : '')}>{isSel && <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><polyline points="20 6 9 17 4 12" /></svg>}</span>
                  </span>
                )}
                <span className="bdg" style={{ color: style.color, background: style.color + '1A' }}>{style.label}</span>
                <span className="oid">{oid}</span>
                {isR && <span className="rb">{'\u2713 ' + (exc.resolutionAction || 'Resolved')}</span>}
              </div>
              <span className="cf">{((exc.confidenceScore || 0) * 100).toFixed(0)}%</span>
            </button>
            {isO && (
              <div className="dtl">
                <p>{exc.aiExplanation}</p>
                {exc.amountDiscrepancy > 0 && <p className="amt">Discrepancy: {'\u20B9'}{(exc.amountDiscrepancy / 100).toLocaleString('en-IN')}</p>}
                {exc.taxLineBreakdown && exc.taxLineBreakdown.length > 0 && (
                  <table className="tt"><thead><tr><th>Tax Line</th><th>Expected</th><th>Actual</th><th>Rule</th></tr></thead><tbody>
                    {exc.taxLineBreakdown.map((l, i) => <tr key={i}><td>{l.line}</td><td>{'\u20B9'}{(l.expected / 100).toFixed(2)}</td><td>{'\u20B9'}{(l.actual / 100).toFixed(2)}</td><td>{l.rule}</td></tr>)}
                  </tbody></table>
                )}
                <div className="asect">
                  {isR ? (
                    <div className="rtl"><p className="rl">{'\u2713 '} <strong>{exc.resolutionAction || 'Resolved'}</strong> by <strong>{exc.resolvedBy}</strong></p><p className="rd">{exc.resolvedAt ? new Date(exc.resolvedAt).toLocaleString('en-IN') : ''}</p></div>
                  ) : sg ? (
                    <div className="sbox">
                      <p className="slb">AI-Suggested Resolution</p>
                      <p className="sa">{sg.suggestedAction}</p>
                      <p className="sr">{sg.reasoning}</p>
                      <div className="abt">
                        <button className="abtn abr" onClick={() => handleAction(exc.id, 'resolved')} disabled={resolving === exc.id}>{resolving === exc.id ? '...' : '\u2713 Resolve'}</button>
                        <button className="abtn abe" onClick={() => handleAction(exc.id, 'escalated')} disabled={resolving === exc.id}>Escalate</button>
                        <button className="abtn abi" onClick={() => handleAction(exc.id, 'ignored')} disabled={resolving === exc.id}>Ignore</button>
                      </div>
                    </div>
                  ) : (
                    <button className="sgb" onClick={() => handleSuggest(exc.id)} disabled={loadingSuggestion === exc.id}>
                      {loadingSuggestion === exc.id ? 'Generating suggestion...' : 'Get AI Suggestion'}
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>
        );
      })}

      <style jsx>{`
        .panel{background:var(--bg-card);border:1px solid var(--border-card);border-radius:16px;overflow:hidden}
        .ph{display:flex;justify-content:space-between;align-items:center;padding:12px 20px;border-bottom:1px solid var(--border-card);gap:12px;flex-wrap:wrap}
        .phl{display:flex;align-items:center;gap:14px;flex-wrap:wrap}
        .phr{display:flex;align-items:center;gap:10px}
        .pt{font-size:14px;font-weight:600;color:var(--text-primary);margin:0}
        .pills{display:flex;gap:4px}
        .p{font-size:11px;font-weight:600;padding:4px 10px;border-radius:6px;border:1px solid var(--border-card);background:transparent;color:var(--text-muted,#7c8493);cursor:pointer;transition:all .15s}
        .p:hover{border-color:#0070f3;color:var(--text-primary)}
        .p.a{background:rgba(0,112,243,.1);border-color:rgba(0,112,243,.3);color:#60a5fa}
        .bb{display:flex;align-items:center;justify-content:space-between;gap:12px;padding:10px 20px;background:rgba(0,112,243,.06);border-bottom:1px solid rgba(0,112,243,.12);flex-wrap:wrap}
        .bc{font-size:12px;font-weight:600;color:#60a5fa}
        .ba{display:flex;gap:8px;flex-wrap:wrap}
        .bbt{font-size:12px;font-weight:600;padding:6px 14px;border-radius:8px;border:1px solid transparent;cursor:pointer;transition:all .15s}
        .bbt.br{background:rgba(52,211,153,.1);border-color:rgba(52,211,153,.25);color:#34D399}
        .bbt.be{background:rgba(245,166,35,.1);border-color:rgba(245,166,35,.25);color:#f5a623}
        .bbt.bi{background:rgba(124,132,147,.1);border-color:rgba(124,132,147,.25);color:#94a3b8}
        .bbt.bx{background:rgba(248,113,113,.08);border-color:rgba(248,113,113,.2);color:#f87171}
        .bbt:disabled{opacity:.5;cursor:not-allowed}
        .sw{position:relative;display:flex;align-items:center;flex:0 1 220px}
        .si{position:absolute;left:10px;color:var(--text-muted,#7c8493);pointer-events:none}
        .sinp{width:100%;padding:7px 28px 7px 30px;font-size:12.5px;color:var(--text-primary);background:var(--bg-card-elevated);border:1px solid var(--border-card);border-radius:8px;outline:none;transition:border-color .2s;font-family:inherit}
        .sinp::placeholder{color:var(--text-muted,#7c8493)}
        .sinp:focus{border-color:#0070f3;box-shadow:0 0 0 2px rgba(0,112,243,.15)}
        .sc{position:absolute;right:6px;background:none;border:none;color:var(--text-muted,#7c8493);font-size:16px;cursor:pointer;padding:0 4px;line-height:1}
        .emp{padding:20px;color:#7c8493;font-size:13px;margin:0}
        .rw{width:100%;display:flex;justify-content:space-between;align-items:center;padding:14px 20px;background:none;border:none;border-bottom:1px solid var(--border-card);cursor:pointer;text-align:left;color:inherit;transition:background .1s}
        .rw:hover{background:var(--bg-card-elevated)}
        .rws{background:rgba(0,112,243,.06)!important}
        .lf{display:flex;align-items:center;gap:10px}
        .cww{display:flex;align-items:center;cursor:pointer}
        .cb{width:16px;height:16px;border-radius:4px;display:flex;align-items:center;justify-content:center;border:1.5px solid var(--border-card,#2a344e);background:transparent;transition:all .15s}
        .cb.cbs{background:#0070f3;border-color:#0070f3;color:white}
        .cb:hover{border-color:#0070f3}
        .bdg{font-size:11px;font-family:'Courier New',monospace;padding:4px 8px;border-radius:6px;white-space:nowrap}
        .oid{font-size:13px;font-family:'Courier New',monospace;color:var(--text-primary)}
        .rb{font-size:10.5px;color:#34D399;background:rgba(52,211,153,.1);padding:3px 8px;border-radius:6px;font-weight:600;text-transform:capitalize}
        .cf{font-size:12px;color:#7c8493;font-family:'Courier New',monospace}
        .dtl{padding:0 20px 16px 20px;font-size:13.5px;color:var(--text-secondary,#c1c6d7);line-height:1.6}
        .amt{margin-top:8px;font-size:12px;color:#7c8493;font-family:'Courier New',monospace}
        .tt{margin-top:12px;width:100%;border-collapse:collapse;font-size:12px}
        .tt th,.tt td{text-align:left;padding:6px 10px;border-bottom:1px solid var(--border-card);color:var(--text-secondary)}
        .tt th{color:#7c8493;font-weight:600;text-transform:uppercase;font-size:10px}
        .asect{margin-top:16px;padding-top:14px;border-top:1px solid var(--border-card)}
        .sgb{background:var(--bg-card-elevated);border:1px solid var(--border-card);color:#aec6ff;font-size:13px;font-weight:600;padding:9px 16px;border-radius:10px;cursor:pointer;transition:all .2s}
        .sgb:hover:not(:disabled){background:var(--border-card);border-color:#0070f3}
        .sgb:disabled{opacity:.5;cursor:not-allowed}
        .sbox{background:#0d1730;border:1px solid #253154;border-radius:10px;padding:14px 16px}
        .slb{font-size:10px;font-weight:700;color:#7c8493;text-transform:uppercase;letter-spacing:.06em;margin:0 0 6px 0}
        .sa{font-size:14px;font-weight:600;color:#fff;margin:0 0 6px 0}
        .sr{font-size:12.5px;color:#c1c6d7;line-height:1.5;margin:0 0 14px 0}
        .abt{display:flex;gap:8px;flex-wrap:wrap}
        .abtn{font-size:12.5px;font-weight:700;padding:8px 16px;border-radius:8px;border:1px solid transparent;cursor:pointer;transition:all .15s}
        .abtn.abr{background:#34D399;color:#0B0E14}
        .abtn.abr:hover:not(:disabled){background:#2bc08a}
        .abtn.abe{background:rgba(245,166,35,.15);border-color:rgba(245,166,35,.3);color:#f5a623}
        .abtn.abe:hover:not(:disabled){background:rgba(245,166,35,.25)}
        .abtn.abi{background:rgba(124,132,147,.1);border-color:rgba(124,132,147,.25);color:#94a3b8}
        .abtn.abi:hover:not(:disabled){background:rgba(124,132,147,.2)}
        .abtn:disabled{opacity:.5;cursor:not-allowed}
        .rtl{background:rgba(52,211,153,.06);border:1px solid rgba(52,211,153,.2);border-radius:10px;padding:12px 16px}
        .rl{font-size:12.5px;color:#34D399;margin:0 0 4px 0}
        .rl strong{color:#fff}
        .rd{font-size:11px;color:#7c8493;margin:0}

        :global(html[data-theme="light"]) .panel{background:#fff;border-color:#e2e8f0}
        :global(html[data-theme="light"]) .ph{border-bottom-color:#e2e8f0}
        :global(html[data-theme="light"]) .pt{color:#0f172a}
        :global(html[data-theme="light"]) .sinp{background:#f8fafc;border-color:#e2e8f0;color:#0f172a}
        :global(html[data-theme="light"]) .sinp::placeholder{color:#94a3b8}
        :global(html[data-theme="light"]) .si{color:#94a3b8}
        :global(html[data-theme="light"]) .emp{color:#64748b}
        :global(html[data-theme="light"]) .rw:hover{background:#f8fafc}
        :global(html[data-theme="light"]) .rw{border-bottom-color:#e2e8f0}
        :global(html[data-theme="light"]) .rws{background:rgba(37,99,235,.04)!important}
        :global(html[data-theme="light"]) .oid{color:#0f172a}
        :global(html[data-theme="light"]) .dtl{color:#475569}
        :global(html[data-theme="light"]) .sgb{background:#f1f5f9;border-color:#e2e8f0;color:#0070f3}
        :global(html[data-theme="light"]) .sbox{background:#f0f9ff;border-color:#bae6fd}
        :global(html[data-theme="light"]) .slb{color:#64748b}
        :global(html[data-theme="light"]) .sa{color:#0f172a}
        :global(html[data-theme="light"]) .sr{color:#475569}
        :global(html[data-theme="light"]) .abtn.abr{color:#fff}
        :global(html[data-theme="light"]) .tt th,:global(html[data-theme="light"]) .tt td{border-bottom-color:#e2e8f0;color:#475569}
        :global(html[data-theme="light"]) .tt th{color:#64748b}
        :global(html[data-theme="light"]) .amt{color:#64748b}
        :global(html[data-theme="light"]) .cf{color:#64748b}
        :global(html[data-theme="light"]) .rtl{background:rgba(52,211,153,.06);border-color:rgba(52,211,153,.2)}
        :global(html[data-theme="light"]) .rl{color:#16a34a}
        :global(html[data-theme="light"]) .rl strong{color:#0f172a}
        :global(html[data-theme="light"]) .rd{color:#64748b}
        :global(html[data-theme="light"]) .p{border-color:#e2e8f0;color:#64748b}
        :global(html[data-theme="light"]) .p:hover{border-color:#2563eb;color:#0f172a}
        :global(html[data-theme="light"]) .p.a{background:rgba(37,99,235,.08);border-color:rgba(37,99,235,.25);color:#2563eb}
        :global(html[data-theme="light"]) .cb{border-color:#cbd5e1}
        :global(html[data-theme="light"]) .cb.cbs{background:#2563eb;border-color:#2563eb}
        :global(html[data-theme="light"]) .bb{background:rgba(37,99,235,.04);border-bottom-color:rgba(37,99,235,.1)}
        :global(html[data-theme="light"]) .bc{color:#2563eb}
      `}</style>
    </div>
  );
}
