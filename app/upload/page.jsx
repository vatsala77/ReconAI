'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

const ORDER_FIELDS = ['order_id', 'amount', 'platform_fee', 'tds', 'refund', 'customer_id'];
const TRANSFER_FIELDS = ['transfer_id', 'source', 'recipient', 'amount', 'on_hold', 'on_hold_until', 'amount_reversed', 'settlement_status', 'fee', 'tax', 'error_description'];

export default function UploadPage() {
  const [step, setStep] = useState('upload');
  const [companyName, setCompanyName] = useState('');
  const [companyEmail, setCompanyEmail] = useState('');
  const [file, setFile] = useState(null);
  const [fileName, setFileName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [previewData, setPreviewData] = useState(null);
  const [orderMapping, setOrderMapping] = useState({});
  const [transferMapping, setTransferMapping] = useState({});
  const router = useRouter();

  async function handlePreview(e) {
    e.preventDefault();
    setError('');
    if (!file || !companyName || !companyEmail) {
      setError('Please fill all fields and select a file.');
      return;
    }

    setLoading(true);
    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await fetch('/api/upload/preview', { method: 'POST', body: formData });
      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Failed to read file');
        setLoading(false);
        return;
      }

      setPreviewData(data);
      setOrderMapping(data.orderMapping);
      setTransferMapping(data.transferMapping);
      setStep('mapping');
    } catch (err) {
      setError('Something went wrong reading the file.');
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
          companyName,
          companyEmail,
          fileName: previewData.fileName,
          ordersRaw: previewData.ordersRaw,
          transfersRaw: previewData.transfersRaw,
          orderMapping,
          transferMapping,
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
                Upload your Excel file as it is — two sheets, any column names.
                Our AI figures out the mapping for you.
              </p>

              <form onSubmit={handlePreview}>
                <label>Company Name</label>
                <input
                  type="text"
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  placeholder="Your company name"
                  required
                />

                <label>Company Email</label>
                <input
                  type="email"
                  value={companyEmail}
                  onChange={(e) => setCompanyEmail(e.target.value)}
                  placeholder="you@company.com"
                  required
                />

                <label>Excel File (.xlsx)</label>
                <div className="file-drop">
                  <input
                    type="file"
                    id="file-input"
                    accept=".xlsx,.xls"
                    onChange={(e) => {
                      setFile(e.target.files[0]);
                      setFileName(e.target.files[0]?.name || '');
                    }}
                    required
                  />
                  <label htmlFor="file-input" className="file-label">
                    <span className="file-icon">📄</span>
                    <span>{fileName || 'Click to choose a file, or drag it here'}</span>
                  </label>
                </div>

                {error && <p className="error-text">{error}</p>}

                <button type="submit" disabled={loading} className="btn-primary lg">
                  {loading ? 'Reading file...' : 'Continue →'}
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

              <div className="mapping-section">
                <h3>Orders Sheet</h3>
                {ORDER_FIELDS.map((field) => (
                  <div key={field} className="mapping-row">
                    <label className={isLowConfidence(field, orderMapping) ? 'label-warn' : ''}>
                      {field} {isLowConfidence(field, orderMapping) && '⚠ not detected'}
                    </label>
                    <select
                      value={orderMapping[field] || ''}
                      onChange={(e) => setOrderMapping({ ...orderMapping, [field]: e.target.value })}
                    >
                      <option value="">— none —</option>
                      {previewData.orderHeaders.map((h) => (
                        <option key={h} value={h}>{h}</option>
                      ))}
                    </select>
                  </div>
                ))}
              </div>

              <div className="mapping-section">
                <h3>Transfers Sheet</h3>
                {TRANSFER_FIELDS.map((field) => (
                  <div key={field} className="mapping-row">
                    <label className={isLowConfidence(field, transferMapping) ? 'label-warn' : ''}>
                      {field} {isLowConfidence(field, transferMapping) && '⚠ not detected'}
                    </label>
                    <select
                      value={transferMapping[field] || ''}
                      onChange={(e) => setTransferMapping({ ...transferMapping, [field]: e.target.value })}
                    >
                      <option value="">— none —</option>
                      {previewData.transferHeaders.map((h) => (
                        <option key={h} value={h}>{h}</option>
                      ))}
                    </select>
                  </div>
                ))}
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
          position: absolute;
          width: 800px;
          height: 800px;
          background: radial-gradient(circle, rgba(0,112,243,0.08) 0%, rgba(7,18,42,0) 60%);
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
          background: rgba(7,18,42,0.9);
          backdrop-filter: blur(12px);
          border-bottom: 1px solid #151f37;
        }
        .navbar-inner {
          display: flex;
          align-items: center;
          padding: 16px 24px;
          max-width: 1280px;
          margin: 0 auto;
        }
        .brand { display: flex; align-items: center; gap: 8px; text-decoration: none; color: inherit; }
        .brand-icon {
          width: 24px; height: 24px; border-radius: 6px;
          background: linear-gradient(135deg, #0070f3, #0059c5);
        }
        .brand-name { font-size: 22px; font-weight: 800; letter-spacing: -0.02em; color: #ffffff; }

        .upload-page {
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 120px 24px 60px;
        }

        .upload-card {
          background: #101b33;
          border: 1px solid #1f2942;
          border-radius: 24px;
          padding: 44px;
          max-width: 580px;
          width: 100%;
          max-height: 82vh;
          overflow-y: auto;
          box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1);
        }

        .upload-card::-webkit-scrollbar {
          width: 6px;
        }
        .upload-card::-webkit-scrollbar-track {
          background: #101b33;
        }
        .upload-card::-webkit-scrollbar-thumb {
          background: #2a344e;
          border-radius: 4px;
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
        h3 { color: #ffffff; font-size: 16px; margin: 0 0 16px 0; font-weight: 700; border-bottom: 1px solid #2a344e; padding-bottom: 8px; }
        .subtitle { color: #c1c6d7; font-size: 16px; line-height: 1.6; margin: 0 0 32px 0; }

        label { display: block; color: #ffffff; font-size: 14px; font-weight: 500; margin-bottom: 8px; margin-top: 20px; }

        input[type="text"], input[type="email"] {
          width: 100%;
          padding: 12px 16px;
          background: #151f37;
          border: 1px solid #2a344e;
          border-radius: 10px;
          color: #ffffff;
          font-size: 14px;
          transition: border-color 0.2s;
        }
        input[type="text"]:focus, input[type="email"]:focus {
          outline: none;
          border-color: #0070f3;
          box-shadow: 0 0 0 3px rgba(0,112,243,0.15);
        }
        input[type="text"]::placeholder, input[type="email"]::placeholder { color: #6b7690; }

        .file-drop { position: relative; margin-top: 8px; }
        .file-drop input[type="file"] {
          position: absolute;
          opacity: 0;
          width: 100%;
          height: 100%;
          cursor: pointer;
        }
        .file-label {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 16px;
          background: #151f37;
          border: 1.5px dashed #2a344e;
          border-radius: 10px;
          color: #c1c6d7;
          font-size: 14px;
          cursor: pointer;
          transition: border-color 0.2s, background 0.2s;
          margin: 0;
        }
        .file-drop:hover .file-label { border-color: #0070f3; background: #17203c; }
        .file-icon { font-size: 20px; }

        .error-text {
          color: #f87171;
          font-size: 13px;
          margin: 16px 0 0 0;
          padding: 10px 14px;
          background: rgba(248,113,113,0.08);
          border: 1px solid rgba(248,113,113,0.2);
          border-radius: 8px;
        }

        .btn-primary {
          background: #0070f3;
          box-shadow: 0 4px 14px rgba(0,112,243,0.2);
          color: white;
          text-decoration: none;
          padding: 12px 20px;
          border-radius: 12px;
          font-weight: 600;
          font-size: 15px;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          transition: all 0.3s ease;
          border: none;
          cursor: pointer;
          width: 100%;
        }
        .btn-primary:hover:not(:disabled) { box-shadow: 0 6px 20px rgba(0,112,243,0.35); transform: translateY(-2px); background: #0059c5; }
        .btn-primary:disabled { opacity: 0.5; cursor: not-allowed; }

        .btn-ghost {
          background: #1f2942;
          border: 1px solid #2a344e;
          color: #ffffff;
          text-decoration: none;
          padding: 12px 20px;
          border-radius: 12px;
          font-weight: 600;
          font-size: 15px;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.3s ease;
          cursor: pointer;
        }
        .btn-ghost:hover { background: #2a344e; border-color: #414754; }

        form button[type="submit"] { margin-top: 28px; }

        .mapping-section {
          background: #151f37;
          border: 1px solid #2a344e;
          border-radius: 14px;
          padding: 20px;
          margin-bottom: 20px;
        }
        .mapping-row { margin-bottom: 12px; }
        .mapping-row label { margin-top: 0; margin-bottom: 6px; font-size: 12px; font-weight: 600; color: #c1c6d7; text-transform: uppercase; letter-spacing: 0.05em; }
        .label-warn { color: #f5a623 !important; }

        select {
          width: 100%;
          padding: 10px 14px;
          background: #0d1730;
          border: 1px solid #2a344e;
          border-radius: 8px;
          color: #ffffff;
          font-size: 14px;
          transition: border-color 0.2s;
        }
        select:focus { outline: none; border-color: #0070f3; }

        .mapping-actions { display: flex; gap: 12px; margin-top: 28px; }
        .mapping-actions button { flex: 1; }
      `}</style>
    </>
  );
}