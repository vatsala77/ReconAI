'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import ThemeToggle from '@/components/ThemeToggle';

const ORDER_FIELDS = ['order_id', 'amount', 'platform_fee', 'tds', 'refund', 'customer_id', 'seller_id', 'seller_type', 'pan_available'];
const TRANSFER_FIELDS = ['transfer_id', 'source', 'recipient', 'amount', 'on_hold', 'on_hold_until', 'amount_reversed', 'settlement_status', 'fee', 'tax', 'error_description'];
const BANK_FIELDS = ['utr', 'transfer_id', 'amount_credited', 'credited_at', 'status'];
const GST_FIELDS = ['vendor_gstin', 'order_id', 'tcs_reported', 'filing_period', 'status'];

export default function UploadPage() {
  const [uploadMode, setUploadMode] = useState('single');
  const [step, setStep] = useState('upload');

  const [file, setFile] = useState(null);
  const [fileName, setFileName] = useState('');

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
      <div className="mapping-card">
        <h3 className="card-title">{title}</h3>
        <div className="fields-list">
          {fields.map((field) => (
            <div key={field} className="field-row">
              <div className="field-label-group">
                <span className="field-name">{field}</span>
                {isLowConfidence(field, mapping) && (
                  <span className="warn-badge">⚠️ not detected</span>
                )}
              </div>
              <select
                className="select-box"
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
          <ThemeToggle />
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
                  <div className="form-group">
                    <label className="form-label">
                      Excel File (.xlsx) — Orders, Transfers, and optionally Bank Settlements &amp; GST Filings
                    </label>
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
                        <div className="file-text-group">
                          <span className="file-main-text">{fileName || 'Choose a file or drag it here'}</span>
                          <span className="file-sub-text">XLSX, XLS files supported</span>
                        </div>
                      </label>
                    </div>
                  </div>
                ) : (
                  <div className="separate-files-grid">
                    <div className="form-group">
                      <label className="form-label">Orders File <span className="req">*</span></label>
                      <input type="file" accept=".xlsx,.xls,.csv" onChange={(e) => setOrdersFile(e.target.files[0])} className="simple-file-input" />
                    </div>

                    <div className="form-group">
                      <label className="form-label">Transfers File <span className="req">*</span></label>
                      <input type="file" accept=".xlsx,.xls,.csv" onChange={(e) => setTransfersFile(e.target.files[0])} className="simple-file-input" />
                    </div>

                    <div className="form-group">
                      <label className="form-label">Bank Settlements <span className="opt">(optional)</span></label>
                      <input type="file" accept=".xlsx,.xls,.csv" onChange={(e) => setBankFile(e.target.files[0])} className="simple-file-input" />
                    </div>

                    <div className="form-group">
                      <label className="form-label">GST Filings <span className="opt">(optional)</span></label>
                      <input type="file" accept=".xlsx,.xls,.csv" onChange={(e) => setGstFile(e.target.files[0])} className="simple-file-input" />
                    </div>
                  </div>
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

              <div className="mapping-grid-2col">
                {renderMappingSection('Orders', ORDER_FIELDS, orderMapping, setOrderMapping, previewData.orderHeaders)}
                {renderMappingSection('Transfers', TRANSFER_FIELDS, transferMapping, setTransferMapping, previewData.transferHeaders)}
                {renderMappingSection('Bank Settlements', BANK_FIELDS, bankMapping, setBankMapping, previewData.bankHeaders)}
                {renderMappingSection('GST Filings', GST_FIELDS, gstMapping, setGstMapping, previewData.gstHeaders)}
              </div>

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

      <style jsx global>{`
        body {
          background-color: var(--bg-primary) !important;
          color: #ffffff !important;
          overflow-x: hidden;
          background-image:
            linear-gradient(to right, rgba(255, 255, 255, 0.02) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(255, 255, 255, 0.02) 1px, transparent 1px) !important;
          background-size: 50px 50px !important;
          font-family: 'Segoe UI', -apple-system, sans-serif !important;
        }

        .ambient-glow {
          position: absolute;
          width: 800px;
          height: 800px;
          background: radial-gradient(circle, rgba(0, 112, 243, 0.08) 0%, rgba(7, 18, 42, 0) 60%);
          border-radius: 50%;
          z-index: -1;
          pointer-events: none;
        }
        .ambient-glow.top { top: -20%; left: -10%; }
        .ambient-glow.bottom { bottom: 10%; right: -10%; }

        .navbar {
          position: fixed;
          top: 0;
          width: 100%;
          z-index: 50;
          background: rgba(7, 18, 42, 0.9);
          backdrop-filter: blur(12px);
          border-bottom: 1px solid var(--border-card);
        }
        .navbar-inner { display: flex; align-items: center; justify-content: space-between; padding: 16px 24px; max-width: 1280px; margin: 0 auto; }
        .brand { display: flex; align-items: center; gap: 8px; text-decoration: none; }
        .brand-icon { width: 24px; height: 24px; border-radius: 6px; background: linear-gradient(135deg, #0070f3, #0059c5); }
        .brand-name { font-size: 22px; font-weight: 800; color: var(--text-primary); letter-spacing: -0.02em; }

        .upload-page {
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 120px 24px 60px;
        }
        
        .upload-card {
          background: var(--bg-card) !important;
          border: 1px solid var(--border-card) !important;
          border-radius: 24px !important;
          padding: 40px !important;
          max-width: 1100px !important;
          width: 100% !important;
          box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1) !important;
          box-sizing: border-box;
        }

        .badge {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          margin-bottom: 20px;
          color: #aec6ff;
          font-size: 11px;
          font-weight: 700;
          letter-spacing: 0.15em;
        }
        .badge-dot {
          width: 6px; height: 6px; border-radius: 50%;
          background: #aec6ff;
          box-shadow: 0 0 8px rgba(0,112,243,0.8);
        }

        h1 { color: #ffffff; font-size: 32px; margin: 0 0 12px 0; font-weight: 800; letter-spacing: -0.01em; }
        .subtitle { color: #c1c6d7; font-size: 16px; line-height: 1.6; margin: 0 0 28px 0; }

        .mode-toggle { display: flex; gap: 6px; margin-bottom: 28px; background: var(--bg-card-elevated); padding: 4px; border-radius: 10px; border: 1px solid var(--border-card); }
        .mode-btn {
          flex: 1; padding: 10px; border-radius: 8px; border: none; background: transparent;
          color: #c1c6d7; font-size: 13px; font-weight: 600; cursor: pointer; transition: all 0.2s ease;
        }
        .mode-btn.active { background: #0070f3; color: #ffffff; box-shadow: 0 4px 12px rgba(0, 112, 243, 0.3); }

        .form-group { margin-bottom: 20px; }
        .form-label { display: block; color: #ffffff; font-size: 14px; font-weight: 500; margin-bottom: 8px; }
        .req { color: #f87171; }
        .opt { color: #6b7690; font-weight: 400; }

        .separate-files-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 16px; }

        .simple-file-input {
          width: 100%; padding: 12px 16px; background: var(--bg-card-elevated); border: 1px solid var(--border-card);
          border-radius: 10px; color: #ffffff; font-size: 14px; transition: border-color 0.2s;
        }

        .file-drop { position: relative; margin-top: 4px; }
        .file-drop input[type="file"] { position: absolute; opacity: 0; width: 100%; height: 100%; cursor: pointer; z-index: 2; }
        .file-label {
          display: flex; align-items: center; gap: 16px; padding: 24px; background: var(--bg-card-elevated);
          border: 1.5px dashed var(--border-card); border-radius: 12px; color: var(--text-primary);
          cursor: pointer; transition: all 0.2s ease;
        }
        .file-icon { font-size: 28px; }
        .file-text-group { display: flex; flex-direction: column; gap: 2px; }
        .file-main-text { font-size: 14px; font-weight: 600; color: #ffffff; }
        .file-sub-text { font-size: 12px; color: #6b7690; }

        .error-text {
          color: #f87171; font-size: 13px; margin: 16px 0 0 0; padding: 10px 14px;
          background: rgba(248, 113, 113, 0.08); border: 1px solid rgba(248, 113, 113, 0.2); border-radius: 8px;
        }

        .btn-primary {
          background: #0070f3; color: white; padding: 12px 20px; border-radius: 12px;
          font-weight: 600; font-size: 15px; display: flex; align-items: center; justify-content: center;
          transition: all 0.3s ease; border: none; cursor: pointer; width: 100%; margin-top: 28px;
          box-shadow: 0 4px 14px rgba(0, 112, 243, 0.2);
        }
        .btn-primary:hover:not(:disabled) { box-shadow: 0 6px 20px rgba(0, 112, 243, 0.35); transform: translateY(-2px); background: #0059c5; }
        .btn-primary:disabled { opacity: 0.5; cursor: not-allowed; }

        .btn-ghost {
          background: var(--bg-card-elevated); border: 1px solid var(--border-card); color: var(--text-primary);
          padding: 12px 20px; border-radius: 12px; font-weight: 600; font-size: 15px;
          display: flex; align-items: center; justify-content: center; cursor: pointer;
        }

        /* ------------------------------------------------------------- */
        /* MATCHING LOGIN CARD THEME & 2-COLUMN GRID FOR STEP 2 (MAPPING) */
        /* ------------------------------------------------------------- */
        .mapping-grid-2col {
          display: grid !important;
          grid-template-columns: repeat(2, 1fr) !important;
          gap: 20px !important;
          width: 100% !important;
          margin-bottom: 24px !important;
          box-sizing: border-box !important;
        }

        .mapping-card {
          background: #151f37 !important; /* Exact input/inner card background from LoginPage */
          border: 1px solid #2a344e !important; /* Matching border color */
          border-radius: 16px !important;
          padding: 20px !important;
          display: flex !important;
          flex-direction: column !important;
          box-sizing: border-box !important;
        }

        .card-title {
          color: #ffffff !important;
          font-size: 18px !important;
          font-weight: 700 !important;
          margin: 0 0 16px 0 !important;
          padding-bottom: 8px !important;
          border-bottom: 1px solid var(--border-card) !important;
        }

        .fields-list {
          display: flex !important;
          flex-direction: column !important;
          gap: 10px !important;
          width: 100% !important;
        }

        .field-row {
          display: flex !important;
          flex-direction: row !important;
          align-items: center !important;
          justify-content: space-between !important;
          gap: 12px !important;
          width: 100% !important;
          background: var(--bg-card) !important;
          border: 1px solid var(--border-card) !important;
          border-radius: 8px !important;
          padding: 8px 12px !important;
          box-sizing: border-box !important;
        }

        .field-label-group {
          display: flex !important;
          align-items: center !important;
          gap: 6px !important;
          flex: 1 !important;
          min-width: 0 !important;
        }

        .field-name {
          font-family: monospace !important;
          font-size: 13px !important;
          color: #ffffff !important;
          white-space: nowrap !important;
          overflow: hidden !important;
          text-overflow: ellipsis !important;
        }

        .warn-badge {
          font-size: 11px !important;
          color: #fbbf24 !important;
          white-space: nowrap !important;
        }

        .select-box {
          width: 170px !important;
          flex-shrink: 0 !important;
          padding: 6px 12px !important;
          background-color: #151f37 !important;
          border: 1px solid #2a344e !important;
          border-radius: 8px !important;
          color: #ffffff !important;
          font-size: 13px !important;
          outline: none !important;
          cursor: pointer !important;
        }
        .select-box:focus {
          border-color: #0070f3 !important;
          box-shadow: 0 0 0 3px rgba(0,112,243,0.15) !important;
        }

      /* Buttons wrapper alignment */
.mapping-actions {
  display: flex !important;
  justify-content: flex-end !important; /* Buttons ko right-align karne ke liye */
  align-items: center !important;
  gap: 12px !important;
  margin-top: 28px !important;
  width: 100% !important;
}

/* Back button ka clean compact size */
.mapping-actions .btn-ghost {
  width: auto !important;
  min-width: 120px !important;
  padding: 10px 20px !important;
  margin-top: 0 !important;
}

/* Confirm & Analyze button ka matching size */
.mapping-actions .btn-primary {
  width: auto !important;
  min-width: 180px !important;
  padding: 10px 24px !important;
  margin-top: 0 !important;
}
        @media (max-width: 800px) {
          .mapping-grid-2col {
            grid-template-columns: 1fr !important;
          }
        }

        /* ===== LIGHT MODE ===== */
        :global(html[data-theme="light"]) body {
          background-color: #f8fafc !important;
          color: #0f172a !important;
          background-image:
            linear-gradient(to right, rgba(15,23,42,0.06) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(15,23,42,0.06) 1px, transparent 1px) !important;
          background-size: 32px 32px !important;
        }
        :global(html[data-theme="light"]) .ambient-glow { display: none !important; }
        :global(html[data-theme="light"]) .navbar { background: rgba(248,250,252,0.95) !important; border-bottom-color: #e2e8f0 !important; }
        :global(html[data-theme="light"]) .brand-name { color: #0f172a !important; }
        :global(html[data-theme="light"]) .upload-card { background: #ffffff !important; border-color: #e2e8f0 !important; }
        :global(html[data-theme="light"]) .badge { color: #0369a1 !important; }
        :global(html[data-theme="light"]) .badge-dot { background: #0369a1 !important; box-shadow: 0 0 8px rgba(3,105,161,0.5) !important; }
        :global(html[data-theme="light"]) h1 { color: #0f172a !important; }
        :global(html[data-theme="light"]) .step-sub { color: #475569 !important; }
        :global(html[data-theme="light"]) .mode-toggle { background: #f1f5f9 !important; border-color: #e2e8f0 !important; }
        :global(html[data-theme="light"]) .mode-btn { color: #64748b !important; }
        :global(html[data-theme="light"]) .mode-btn.active { background: #0070f3 !important; color: white !important; }
        :global(html[data-theme="light"]) .form-label { color: #0f172a !important; }
        :global(html[data-theme="light"]) .file-zone { background: #f8fafc !important; border-color: #e2e8f0 !important; }
        :global(html[data-theme="light"]) .file-zone.drag { border-color: #0070f3 !important; background: rgba(0,112,243,0.04) !important; }
        :global(html[data-theme="light"]) .file-zone p { color: #475569 !important; }
        :global(html[data-theme="light"]) .file-zone .hint { color: #64748b !important; }
        :global(html[data-theme="light"]) .field-label { color: #0f172a !important; }
        :global(html[data-theme="light"]) .field-value { color: #0369a1 !important; }
        :global(html[data-theme="light"]) .select-box { background-color: #f1f5f9 !important; border-color: #e2e8f0 !important; color: #0f172a !important; }
        :global(html[data-theme="light"]) .select-box option { background: #ffffff !important; color: #0f172a !important; }
        :global(html[data-theme="light"]) .btn-ghost { background: #f1f5f9 !important; border-color: #e2e8f0 !important; color: #0f172a !important; }
        :global(html[data-theme="light"]) .btn-ghost:hover { background: #e2e8f0 !important; }
        :global(html[data-theme="light"]) .upload-status { color: #0f172a !important; }
        :global(html[data-theme="light"]) .order-id { color: #0369a1 !important; }

      `}</style>
    </>
  );
}