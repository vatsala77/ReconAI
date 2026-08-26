'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

const ORDER_FIELDS = ['order_id', 'amount', 'platform_fee', 'tds', 'refund', 'customer_id', 'seller_id', 'seller_type', 'pan_available'];
const TRANSFER_FIELDS = ['transfer_id', 'source', 'recipient', 'amount', 'on_hold', 'on_hold_until', 'amount_reversed', 'settlement_status', 'fee', 'tax', 'error_description'];
const BANK_FIELDS = ['utr', 'transfer_id', 'amount_credited', 'credited_at', 'status'];
const GST_FIELDS = ['vendor_gstin', 'order_id', 'tcs_reported', 'filing_period', 'status'];

export default function UploadPage() {
  const [uploadMode, setUploadMode] = useState('single'); // 'single' or 'separate'
  const [step, setStep] = useState('upload');

  // Single-file mode
  const [file, setFile] = useState(null);
  const [fileName, setFileName] = useState('');

  // Separate-files mode
  const [ordersFile, setOrdersFile] = useState(null);
  const [transfersFile, setTransfersFile] = useState(null);
  const [bankFile, setBankFile] = useState(null);
  const [gstFile, setGstFile] = useState(null);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [previewData, setPreviewData] = useState(null);
  const [orderMapping, setOrderMapping] = useState({});
  const [transferMapping, setTransferMapping] = useState({});
  const [bankMapping, setBankMapping] = useState({});
  const [gstMapping, setGstMapping] = useState({});
  const router = useRouter();

  async function handlePreview(e) {
    e.preventDefault();
    setError('');

    const formData = new FormData();

    if (uploadMode === 'single') {
      if (!file) {
        setError('Please select a file.');
        return;
      }
      formData.append('mode', 'single');
      formData.append('file', file);
    } else {
      if (!ordersFile || !transfersFile) {
        setError('Orders and Transfers files are required.');
        return;
      }
      formData.append('mode', 'separate');
      formData.append('ordersFile', ordersFile);
      formData.append('transfersFile', transfersFile);
      if (bankFile) formData.append('bankFile', bankFile);
      if (gstFile) formData.append('gstFile', gstFile);
    }

    setLoading(true);
    try {
      const res = await fetch('/api/upload/preview', { method: 'POST', body: formData });
      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Failed to read file(s)');
        setLoading(false);
        return;
      }

      setPreviewData(data);
      setOrderMapping(data.orderMapping);
      setTransferMapping(data.transferMapping);
      setBankMapping(data.bankMapping || {});
      setGstMapping(data.gstMapping || {});
      setStep('mapping');
    } catch (err) {
      setError('Something went wrong reading the file(s).');
    } finally {
      setLoading(false);
    }
  }

  async function handleConfirm() {
    setError('');
    setLoading(true);
    try {
      const res = await fetch('/api/upload/confirm', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fileName: previewData.fileName,
          ordersRaw: previewData.ordersRaw,
          transfersRaw: previewData.transfersRaw,
          bankRaw: previewData.bankRaw || [],
          gstRaw: previewData.gstRaw || [],
          orderMapping,
          transferMapping,
          bankMapping,
          gstMapping,
        }),
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Failed to process upload');
        setLoading(false);
        return;
      }

      router.push(`/dashboard/${data.batchId}`);
    } catch (err) {
      setError('Something went wrong confirming the upload.');
      setLoading(false);
    }
  }

  function isLowConfidence(field, mapping) {
    return !mapping[field];
  }

  function renderMappingSection(title, fields, mapping, setMapping, headers) {
    if (!headers || headers.length === 0) return null;
    return (
      <div className="mapping-section">
        <h3>{title}</h3>
        {fields.map((field) => (
          <div key={field} className="mapping-row">
            <label className={isLowConfidence(field, mapping) ? 'label-warn' : ''}>
              {field} {isLowConfidence(field, mapping) && '⚠ not detected'}
            </label>
            <select
              value={mapping[field] || ''}
              onChange={(e) => setMapping({ ...mapping, [field]: e.target.value })}
            >
              <option value="">— none —</option>
              {headers.map((h) => (
                <option key={h} value={h}>{h}</option>
              ))}
            </select>
          </div>
        ))}
      </div>
    );
  }

  return (
    <>
      <div className="ambient-glow top left" />
      <div className="ambient-glow bottom right" />

      <nav className="navbar">
        <div className="navbar-inner">
          <Link href="/" className="brand">
            <div className="brand-icon" />
            <span className="brand-name">ReconAI</span>
          </Link>
        </div>
      </nav>

      <main className="upload-page">
        <div className="upload-card">
          {step === 'upload' && (
            <>
              <div className="badge">
                <span className="badge-dot" />
                STEP 1 OF 2
              </div>
              <h1>Upload Settlement Data</h1>
              <p className="subtitle">
                Upload one Excel with all sheets, or separate files — whichever matches how your data is organized.
              </p>

              <div className="mode-toggle">
                <button
                  type="button"
                  className={uploadMode === 'single' ? 'mode-btn active' : 'mode-btn'}
                  onClick={() => setUploadMode('single')}
                >
                  Single Excel File
                </button>
                <button
                  type="button"
                  className={uploadMode === 'separate' ? 'mode-btn active' : 'mode-btn'}
                  onClick={() => setUploadMode('separate')}
                >
                  Separate Files
                </button>
              </div>

              <form onSubmit={handlePreview}>
                {uploadMode === 'single' ? (
                  <>
                    <label>Excel File (.xlsx) — Orders, Transfers, and optionally Bank Settlements &amp; GST Filings as separate sheets</label>
                    <div className="file-drop">
                      <input
                        type="file"
                        id="file-input"
                        accept=".xlsx,.xls"
                        onChange={(e) => {
                          setFile(e.target.files[0]);
                          setFileName(e.target.files[0]?.name || '');
                        }}
                      />
                      <label htmlFor="file-input" className="file-label">
                        <span className="file-icon">📄</span>
                        <span>{fileName || 'Click to choose a file, or drag it here'}</span>
                      </label>
                    </div>
                  </>
                ) : (
                  <>
                    <label>Orders File (required)</label>
                    <input type="file" accept=".xlsx,.xls,.csv" onChange={(e) => setOrdersFile(e.target.files[0])} className="simple-file-input" />

                    <label>Transfers File (required)</label>
                    <input type="file" accept=".xlsx,.xls,.csv" onChange={(e) => setTransfersFile(e.target.files[0])} className="simple-file-input" />

                    <label>Bank Settlements (optional)</label>
                    <input type="file" accept=".xlsx,.xls,.csv" onChange={(e) => setBankFile(e.target.files[0])} className="simple-file-input" />

                    <label>GST Filings (optional)</label>
                    <input type="file" accept=".xlsx,.xls,.csv" onChange={(e) => setGstFile(e.target.files[0])} className="simple-file-input" />
                  </>
                )}

                {error && <p className="error-text">{error}</p>}

                <button type="submit" disabled={loading} className="btn-primary lg">
                  {loading ? 'Reading file(s)...' : 'Continue →'}
                </button>
              </form>
            </>
          )}

          {step === 'mapping' && previewData && (
            <>
              <div className="badge">
                <span className="badge-dot" />
                STEP 2 OF 2
              </div>
              <h1>Confirm Column Mapping</h1>
              <p className="subtitle">
                We&apos;ve matched your columns automatically. Review and adjust anything below.
              </p>

              {renderMappingSection('Orders', ORDER_FIELDS, orderMapping, setOrderMapping, previewData.orderHeaders)}
              {renderMappingSection('Transfers', TRANSFER_FIELDS, transferMapping, setTransferMapping, previewData.transferHeaders)}
              {renderMappingSection('Bank Settlements', BANK_FIELDS, bankMapping, setBankMapping, previewData.bankHeaders)}
              {renderMappingSection('GST Filings', GST_FIELDS, gstMapping, setGstMapping, previewData.gstHeaders)}

              {error && <p className="error-text">{error}</p>}

              <div className="mapping-actions">
                <button type="button" className="btn-ghost lg" onClick={() => setStep('upload')}>Back</button>
                <button type="button" className="btn-primary lg" onClick={handleConfirm} disabled={loading}>
                  {loading ? 'Processing...' : 'Confirm & Analyze'}
                </button>
              </div>
            </>
          )}
        </div>
      </main>

      <style jsx>{`
        :global(body) {
          background-color: #07122a;
          color: #ffffff;
          overflow-x: hidden;
          background-image:
            linear-gradient(to right, rgba(255,255,255,0.02) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(255,255,255,0.02) 1px, transparent 1px);
          background-size: 50px 50px;
          font-family: 'Segoe UI', -apple-system, sans-serif;
        }
        .ambient-glow {
          position: absolute; width: 800px; height: 800px;
          background: radial-gradient(circle, rgba(0,112,243,0.08) 0%, rgba(7,18,42,0) 60%);
          border-radius: 50%; z-index: -1; pointer-events: none;
        }
        .ambient-glow.top { top: -20%; left: -10%; }
        .ambient-glow.bottom { bottom: 10%; right: -10%; }

        .navbar {
          position: fixed; top: 0; width: 100%; z-index: 50;
          background: rgba(7,18,42,0.9); backdrop-filter: blur(12px);
          border-bottom: 1px solid #151f37;
        }
        .navbar-inner { display: flex; align-items: center; padding: 16px 24px; max-width: 1280px; margin: 0 auto; }
        .brand { display: flex; align-items: center; gap: 8px; text-decoration: none; color: inherit; }
        .brand-icon { width: 24px; height: 24px; border-radius: 6px; background: linear-gradient(135deg, #0070f3, #0059c5); }
        .brand-name { font-size: 22px; font-weight: 800; letter-spacing: -0.02em; color: #ffffff; }

        .upload-page { min-height: 100vh; display: flex; align-items: center; justify-content: center; padding: 120px 24px 60px; }
        .upload-card {
          background: #101b33; border: 1px solid #1f2942; border-radius: 24px;
          padding: 44px; max-width: 580px; width: 100%; max-height: 82vh; overflow-y: auto;
          box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1);
        }
        .upload-card::-webkit-scrollbar { width: 6px; }
        .upload-card::-webkit-scrollbar-track { background: #101b33; }
        .upload-card::-webkit-scrollbar-thumb { background: #2a344e; border-radius: 4px; }

        .badge {
          display: inline-flex; align-items: center; gap: 8px; margin-bottom: 20px;
          color: #aec6ff; font-size: 11px; font-weight: 700; letter-spacing: 0.15em;
        }
        .badge-dot { width: 6px; height: 6px; border-radius: 50%; background: #aec6ff; box-shadow: 0 0 8px rgba(0,112,243,0.8); }

        h1 { color: #ffffff; font-size: 32px; margin: 0 0 12px 0; font-weight: 800; letter-spacing: -0.01em; }
        h3 { color: #ffffff; font-size: 16px; margin: 0 0 16px 0; font-weight: 700; border-bottom: 1px solid #2a344e; padding-bottom: 8px; }
        .subtitle { color: #c1c6d7; font-size: 16px; line-height: 1.6; margin: 0 0 24px 0; }

        .mode-toggle { display: flex; gap: 8px; margin-bottom: 24px; background: #0d1730; padding: 4px; border-radius: 12px; }
        .mode-btn {
          flex: 1; padding: 10px; border-radius: 9px; border: none; background: transparent;
          color: #7c8493; font-size: 13px; font-weight: 600; cursor: pointer; transition: all 0.2s;
        }
        .mode-btn.active { background: #0070f3; color: #ffffff; }

        label { display: block; color: #ffffff; font-size: 13px; font-weight: 500; margin-bottom: 8px; margin-top: 18px; }

        .simple-file-input {
          width: 100%; padding: 10px 14px; background: #151f37; border: 1px solid #2a344e;
          border-radius: 10px; color: #c1c6d7; font-size: 13px;
        }

        .file-drop { position: relative; margin-top: 8px; }
        .file-drop input[type="file"] { position: absolute; opacity: 0; width: 100%; height: 100%; cursor: pointer; }
        .file-label {
          display: flex; align-items: center; gap: 12px; padding: 16px; background: #151f37;
          border: 1.5px dashed #2a344e; border-radius: 10px; color: #c1c6d7; font-size: 14px;
          cursor: pointer; transition: border-color 0.2s, background 0.2s; margin: 0;
        }
        .file-drop:hover .file-label { border-color: #0070f3; background: #17203c; }
        .file-icon { font-size: 20px; }

        .error-text {
          color: #f87171; font-size: 13px; margin: 16px 0 0 0; padding: 10px 14px;
          background: rgba(248,113,113,0.08); border: 1px solid rgba(248,113,113,0.2); border-radius: 8px;
        }

        .btn-primary {
          background: #0070f3; box-shadow: 0 4px 14px rgba(0,112,243,0.2); color: white;
          padding: 12px 20px; border-radius: 12px; font-weight: 600; font-size: 15px;
          display: flex; align-items: center; justify-content: center; gap: 8px;
          transition: all 0.3s ease; border: none; cursor: pointer; width: 100%;
        }
        .btn-primary:hover:not(:disabled) { box-shadow: 0 6px 20px rgba(0,112,243,0.35); transform: translateY(-2px); background: #0059c5; }
        .btn-primary:disabled { opacity: 0.5; cursor: not-allowed; }

        .btn-ghost {
          background: #1f2942; border: 1px solid #2a344e; color: #ffffff;
          padding: 12px 20px; border-radius: 12px; font-weight: 600; font-size: 15px;
          display: flex; align-items: center; justify-content: center; transition: all 0.3s ease; cursor: pointer;
        }
        .btn-ghost:hover { background: #2a344e; border-color: #414754; }

        form button[type="submit"] { margin-top: 28px; }

        .mapping-section { background: #151f37; border: 1px solid #2a344e; border-radius: 14px; padding: 24px; margin-bottom: 24px; }

        .mapping-row {
          display: flex;
          flex-direction: column;
          gap: 6px;
          margin-bottom: 16px;
          min-width: 0;
        }
        .mapping-row:last-child { margin-bottom: 0; }
        .mapping-row label {
          min-width: 0;
          margin: 0;
          font-size: 11px;
          font-weight: 600;
          color: #9db4e0;
          text-transform: uppercase;
          letter-spacing: 0.06em;
          overflow-wrap: anywhere;
        }
        .label-warn { color: #f5a623 !important; }

        select {
          width: 100%;
          min-width: 0;
          padding: 11px 36px 11px 14px;
          background-color: #0d1730;
          border: 1px solid #2a344e;
          border-radius: 8px;
          color: #ffffff;
          font-size: 14px;
          transition: border-color 0.2s;
          appearance: none;
          -webkit-appearance: none;
          background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='8' viewBox='0 0 12 8'%3E%3Cpath fill='%237c8493' d='M6 8L0 0h12z'/%3E%3C/svg%3E");
          background-repeat: no-repeat;
          background-position: right 14px center;
        }
        select:focus { outline: none; border-color: #0070f3; }
        select option { background: #0d1730; color: #ffffff; }

        .mapping-actions { display: flex; gap: 12px; margin-top: 28px; }
        .mapping-actions button { flex: 1; }
        @media (max-width: 560px) {
          .upload-card { padding: 28px 20px; }
        }
      `}</style>
    </>
  );
}