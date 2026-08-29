'use client';
import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { signOut } from 'next-auth/react';
import Link from 'next/link';
import { Link2, RefreshCw, Plus, FileText, LayoutDashboard, LogOut } from 'lucide-react';
import ConnectRazorpayModal from './ConnectRazorpayModal';
import ThemeToggle from './ThemeToggle';

export default function UploadsList({ uploads, isRazorpayConnected, razorpayKeyId, user }) {
  const router = useRouter();
  const [syncing, setSyncing] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [connected, setConnected] = useState(isRazorpayConnected);
  const [connectedKeyId, setConnectedKeyId] = useState(razorpayKeyId);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const profileRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(e) {
      if (profileRef.current && !profileRef.current.contains(e.target)) {
        setShowProfileMenu(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  async function handleSyncClick() {
    if (!connected) {
      setShowModal(true);
      return;
    }
    await runSync();
  }

  async function runSync(mode = 'own') {
    setSyncing(true);
    try {
      const res = await fetch('/api/sync-razorpay', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mode }),
      });
      const data = await res.json();

      if (data.success) {
        router.push(`/dashboard/${data.batchId}`);
      } else {
        alert(data.error || 'Sync failed');
      }
    } catch (err) {
      alert('Something went wrong syncing with Razorpay');
    } finally {
      setSyncing(false);
    }
  }

  function handleConnected(keyId) {
    setConnected(true);
    setConnectedKeyId(keyId);
    setShowModal(false);
    runSync('own');
  }

  async function handleDisconnect() {
    await fetch('/api/razorpay/disconnect', { method: 'POST' });
    setConnected(false);
    setConnectedKeyId(null);
  }

  const maskedKey = connectedKeyId ? `••••${connectedKeyId.slice(-4)}` : '';
  const userInitial = (user?.email || user?.name || 'U').charAt(0).toUpperCase();

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

          <div className="nav-actions">
            <ThemeToggle />
            <div className="profile-wrap" ref={profileRef}>
            <button className="profile-avatar" onClick={() => setShowProfileMenu((v) => !v)}>
              {userInitial}
            </button>

            {showProfileMenu && (
              <div className="profile-dropdown">
                <div className="dropdown-header">
                  <p className="dropdown-name">{user?.name || 'Account'}</p>
                  <p className="dropdown-email">{user?.email}</p>
                </div>
                <div className="dropdown-divider" />
                <button className="dropdown-item" onClick={() => router.push('/dashboard')}>
                  <LayoutDashboard size={14} style={{ marginRight: 8 }} /> Dashboard
                </button>
                <button className="dropdown-item logout" onClick={() => signOut({ callbackUrl: '/' })}>
                  <LogOut size={14} style={{ marginRight: 8 }} /> Log out
                </button>
              </div>
            )}
            </div>
          </div>
        </div>
      </nav>

      <main className="uploads-page">
        <div className="uploads-container">
          <div className="header">
            <div>
              <div className="badge">
                <span className="badge-dot" />
                YOUR WORKSPACE
              </div>
              <h1>Your Uploads</h1>
              <p className="subtitle">Select an upload to view its reconciliation analysis</p>
            </div>
            <div className="header-actions">
              {connected && (
                <div className="connection-badge">
                  <span className="dot" /> Connected: {maskedKey}
                  <button className="disconnect-link" onClick={handleDisconnect}>Disconnect</button>
                </div>
              )}
              <button className="btn-demo" onClick={() => runSync('demo')} disabled={syncing}>
                {syncing ? <><RefreshCw size={14} className="spin" /> Syncing…</> : <>🧪 Try Demo</>}
              </button>
              <button className="btn-ghost" onClick={handleSyncClick} disabled={syncing}>
                {syncing ? <><RefreshCw size={14} className="spin" /> Syncing…</> : connected ? <><RefreshCw size={14} /> Sync from Razorpay</> : <><Link2 size={14} /> Connect Razorpay</>}
              </button>
              <button className="btn-primary" onClick={() => router.push('/upload')}><Plus size={14} /> New Upload</button>
            </div>
          </div>

          <div className="demo-file-banner">
            <span className="demo-file-icon">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
            </span>
            <span className="demo-file-text">
              Demo dataset: <a href="/reconai_full_demo_batch_50plus.xlsx" target="_blank" rel="noopener noreferrer" className="file-link"><code>reconai_full_demo_batch_50plus.xlsx</code> <span className="open-icon">↗</span></a> — 52 orders, 51 transfers, 43 bank settlements, 43 GST filings across 4 sheets
            </span>
          </div>

          {uploads.length === 0 ? (
            <div className="empty-state-card">
              <div className="empty-icon"><FileText size={40} strokeWidth={1.5} /></div>
              <p className="empty-title">No uploads yet</p>
              <p className="empty-subtitle">Upload your first route settlement file to start reconciling.</p>
              <div className="empty-actions">
                <button className="btn-primary" onClick={() => router.push('/upload')}><Plus size={14} /> Upload your first file</button>
              </div>
              <div className="empty-demo-hint">
                <span>🧪</span> Or click <strong>"Try Demo"</strong> above to load the bundled seed file (<code>reconai_full_demo_batch_50plus.xlsx</code>) with 52 sample orders and full reconciliation data.
              </div>
            </div>
          ) : (
            <div className="uploads-list">
              {uploads.map((u) => (
                <button
                  key={u.id}
                  className="upload-item"
                  onClick={() => router.push(`/dashboard/${u.id}`)}
                >
                  <div className="upload-item-left">
                    <div className="upload-file-icon"><FileText size={18} /></div>
                    <div>
                      <p className="upload-name">{u.fileName}</p>
                      <p className="upload-meta">{u.orderCount} orders · {new Date(u.createdAt).toLocaleDateString('en-IN')}</p>
                    </div>
                  </div>
                  <span className={`status-badge ${u.status}`}>{u.status}</span>
                </button>
              ))}
            </div>
          )}
        </div>
      </main>

      {showModal && (
        <ConnectRazorpayModal
          onClose={() => setShowModal(false)}
          onConnected={handleConnected}
          onUseDemoSandbox={() => runSync('demo')}
        />
      )}

      <style jsx>{`
        :global(body) {
          background-color: var(--bg-primary);
          color: var(--text-primary);
          overflow-x: hidden;
          background-image:
            linear-gradient(to right, var(--bg-grid-line) 1px, transparent 1px),
            linear-gradient(to bottom, var(--bg-grid-line) 1px, transparent 1px);
          background-size: 32px 32px;
          font-family: 'Segoe UI', -apple-system, sans-serif;
          transition: background-color 0.2s, color 0.2s;
        }

        .ambient-glow {
          position: fixed;
          width: 800px;
          height: 800px;
          background: radial-gradient(circle, var(--accent-soft) 0%, transparent 60%);
          border-radius: 50%;
          z-index: -1;
          pointer-events: none;
        }
        .ambient-glow.top { top: -20%; left: -10%; }
        .ambient-glow.bottom { bottom: -20%; right: -10%; }

        .navbar {
          position: fixed;
          top: 0;
          width: 100%;
          z-index: 50;
          background: rgba(7,18,42,0.9);
          backdrop-filter: blur(12px);
          border-bottom: 1px solid var(--border-card);
          transition: background 0.2s, border-color 0.2s;
        }
        :global(html[data-theme='light']) .navbar {
          background: rgba(248,250,252,0.95);
          border-bottom-color: #e2e8f0;
        }
        .navbar-inner {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 16px 24px;
          max-width: 1280px;
          margin: 0 auto;
        }
        .brand { display: flex; align-items: center; gap: 8px; text-decoration: none; }
        .brand-icon {
          width: 24px; height: 24px; border-radius: 6px;
          background: linear-gradient(135deg, #0070f3, #0059c5);
        }
        .brand-name { font-size: 20px; font-weight: 800; color: var(--text-primary); letter-spacing: -0.02em; }

        .profile-wrap { position: relative; }
        .profile-avatar {
          width: 36px; height: 36px;
          border-radius: 50%;
          background: linear-gradient(135deg, #0070f3, #0059c5);
          border: none;
          color: white;
          font-size: 14px;
          font-weight: 700;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: box-shadow 0.2s;
        }
        .profile-avatar:hover { box-shadow: 0 0 0 3px rgba(0,112,243,0.25); }

        .profile-dropdown {
          position: absolute;
          top: 46px;
          right: 0;
          width: 220px;
          background: var(--bg-card);
          border: 1px solid var(--border-card);
          border-radius: 14px;
          box-shadow: 0 8px 24px rgba(0,0,0,0.35);
          overflow: hidden;
          z-index: 60;
        }
        .dropdown-header { padding: 14px 16px; }
        .dropdown-name { color: var(--text-primary); font-size: 14px; font-weight: 600; margin: 0 0 2px 0; }
        .dropdown-email { color: var(--text-muted); font-size: 12px; margin: 0; word-break: break-all; }
        .dropdown-divider { height: 1px; background: var(--border-card); }
        .dropdown-item {
          width: 100%;
          text-align: left;
          padding: 11px 16px;
          background: none;
          border: none;
          color: var(--text-secondary);
          font-size: 13px;
          cursor: pointer;
          transition: background 0.15s;
          display: flex; align-items: center;
        }
        .dropdown-item:hover { background: var(--bg-card-elevated); }
        .dropdown-item.logout { color: #f87171; }
        .dropdown-item.logout:hover { background: rgba(248,113,113,0.08); }

        .uploads-page { min-height: 100vh; padding: 120px 24px 64px; }
        .uploads-container { max-width: 1000px; margin: 0 auto; }

        .header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          flex-wrap: wrap;
          gap: 20px;
          margin-bottom: 32px;
        }

        .badge {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          margin-bottom: 12px;
          color: var(--badge-text);
          font-size: 11px;
          font-weight: 700;
          letter-spacing: 0.15em;
        }
        .badge-dot {
          width: 6px; height: 6px; border-radius: 50%;
          background: var(--badge-dot);
          box-shadow: 0 0 8px var(--badge-dot-glow);
        }

        h1 {
          color: #ffffff; font-size: 30px; margin: 0 0 8px 0;
          font-weight: 800; letter-spacing: -0.01em;
          background: linear-gradient(90deg, #60a5fa, #818cf8);
          -webkit-background-clip: text; background-clip: text;
          -webkit-text-fill-color: transparent;
        }
        .subtitle { color: var(--text-secondary); font-size: 15px; margin: 0; }

        .header-actions { display: flex; align-items: center; gap: 12px; flex-wrap: wrap; }

        .connection-badge {
          display: flex; align-items: center; gap: 6px;
          font-size: 12px; color: #34D399; background: rgba(52,211,153,0.08);
          border: 1px solid rgba(52,211,153,0.2); padding: 8px 14px; border-radius: 10px;
        }
        .dot { width: 6px; height: 6px; border-radius: 50%; background: #34D399; }
        .disconnect-link {
          background: none; border: none; color: var(--text-muted); font-size: 11px;
          text-decoration: underline; cursor: pointer; margin-left: 6px;
        }

        .btn-primary {
          display: inline-flex; align-items: center; gap: 6px;
          background: #0070f3;
          box-shadow: 0 4px 14px rgba(0,112,243,0.2);
          color: white;
          padding: 11px 20px;
          border-radius: 12px;
          font-weight: 600;
          font-size: 14px;
          border: none;
          cursor: pointer;
          transition: all 0.3s ease;
        }
        .btn-primary:hover:not(:disabled) {
          box-shadow: 0 6px 20px rgba(0,112,243,0.35);
          transform: translateY(-2px);
          background: #0059c5;
        }
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        .spin { animation: spin 1s linear infinite; }
        .btn-primary:disabled { opacity: 0.5; cursor: not-allowed; }

        .btn-demo {
          display: inline-flex; align-items: center; gap: 6px;
          background: rgba(0,112,243,0.08);
          border: 1px solid rgba(0,112,243,0.25);
          color: #60a5fa;
          padding: 11px 20px;
          border-radius: 12px;
          font-weight: 600;
          font-size: 14px;
          cursor: pointer;
          transition: all 0.3s ease;
        }
        .btn-demo:hover:not(:disabled) { background: rgba(0,112,243,0.16); border-color: rgba(0,112,243,0.45); }
        .btn-demo:disabled { opacity: 0.5; cursor: not-allowed; }

        .btn-ghost {
          display: inline-flex; align-items: center; gap: 6px;
          background: var(--bg-card-elevated);
          border: 1px solid var(--border-card);
          color: var(--text-primary);
          padding: 11px 20px;
          border-radius: 12px;
          font-weight: 600;
          font-size: 14px;
          cursor: pointer;
          transition: all 0.3s ease;
        }
        .btn-ghost:hover:not(:disabled) { background: var(--border-card); border-color: var(--accent); }
        .btn-ghost:disabled { opacity: 0.5; cursor: not-allowed; }

        .empty-state-card {
          margin-top: 24px;
          background: var(--bg-card);
          border: 1px solid var(--border-card);
          border-radius: 24px;
          padding: 64px 32px;
          text-align: center;
        }
        .empty-icon { font-size: 40px; margin-bottom: 16px; }
        .empty-title { font-size: 18px; font-weight: 700; color: var(--text-primary); margin: 0 0 6px 0; }
        .empty-subtitle { font-size: 14px; color: var(--text-secondary); margin: 0 0 24px 0; }
        .empty-actions { margin-bottom: 20px; }
        .empty-demo-hint {
          display: inline-flex; align-items: center; gap: 8px;
          font-size: 12px; color: var(--text-muted);
          background: rgba(0,112,243,0.04);
          border: 1px dashed rgba(0,112,243,0.2);
          border-radius: 10px;
          padding: 10px 16px;
          max-width: 480px;
          line-height: 1.5;
          text-align: left;
        }
        .empty-demo-hint code {
          background: var(--bg-card-elevated);
          padding: 1px 5px;
          border-radius: 4px;
          font-size: 11px;
        }

        .demo-file-banner {
          display: flex; align-items: center; gap: 10px;
          padding: 10px 16px;
          background: rgba(0,112,243,0.04);
          border: 1px solid rgba(0,112,243,0.12);
          border-radius: 10px;
          margin-bottom: 24px;
        }
        .demo-file-icon {
          color: #60a5fa;
          flex-shrink: 0;
          display: flex;
        }
        .demo-file-text {
          font-size: 12px; color: var(--text-muted); line-height: 1.5;
        }
        .demo-file-text code {
          background: var(--bg-card-elevated);
          padding: 1px 5px;
          border-radius: 4px;
          font-size: 11px;
          font-weight: 600;
          color: var(--text-primary);
        }
        .file-link {
          color: inherit;
          text-decoration: none;
          border-bottom: 1.5px dashed rgba(96,165,250,0.4);
          transition: all 0.15s;
          cursor: pointer;
        }
        .file-link:hover {
          border-bottom-color: #60a5fa;
          color: #60a5fa;
        }
        .file-link:hover code {
          color: #60a5fa;
          background: rgba(96,165,250,0.1);
        }
        .open-icon {
          font-size: 10px;
          opacity: 0.6;
          margin-left: 2px;
        }
        .file-link:hover .open-icon { opacity: 1; }

        .uploads-list { display: flex; flex-direction: column; gap: 12px; }
        .upload-item-left { display: flex; align-items: center; gap: 14px; }
        .upload-file-icon {
          width: 40px; height: 40px; border-radius: 10px;
          background: rgba(0,112,243,0.1); color: #0070f3;
          display: flex; align-items: center; justify-content: center; flex-shrink: 0;
        }
        .upload-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          background: var(--bg-card);
          border: 1px solid var(--border-card);
          border-radius: 14px;
          padding: 18px 22px;
          cursor: pointer;
          text-align: left;
          color: inherit;
          width: 100%;
          transition: border-color 0.2s;
        }
        .upload-item:hover { border-color: rgba(0,112,243,0.3); }
        .upload-name { color: var(--text-primary); font-size: 15px; margin: 0 0 4px 0; font-weight: 500; }
        .upload-meta { color: var(--text-muted); font-size: 13px; margin: 0; font-family: 'Courier New', monospace; }
        .status-badge {
          font-size: 12px;
          padding: 5px 12px;
          border-radius: 8px;
          background: rgba(52,211,153,0.1);
          color: #34D399;
          text-transform: capitalize;
          font-weight: 500;
        }

        .nav-actions { display: flex; align-items: center; gap: 8px; }

        /* ===== LIGHT MODE ===== */
        :global(html[data-theme='light']) .ambient-glow { display: none; }
        :global(html[data-theme='light']) .brand-name { color: var(--text-primary); }
        :global(html[data-theme='light']) .profile-avatar { box-shadow: none; }
        :global(html[data-theme='light']) .profile-dropdown { background: var(--bg-card); border-color: #e2e8f0; box-shadow: 0 8px 24px rgba(0,0,0,0.1); }
        :global(html[data-theme='light']) .dropdown-name { color: var(--text-primary); }
        :global(html[data-theme='light']) .dropdown-email { color: var(--text-muted); }
        :global(html[data-theme='light']) .dropdown-divider { background: #e2e8f0; }
        :global(html[data-theme='light']) .dropdown-item { color: var(--text-secondary); }
        :global(html[data-theme='light']) .dropdown-item:hover { background: var(--bg-card-elevated); }
        :global(html[data-theme='light']) .badge { color: var(--badge-text); }
        :global(html[data-theme='light']) .badge-dot { background: var(--badge-dot); box-shadow: 0 0 8px var(--badge-dot-glow); }
        :global(html[data-theme='light']) .subtitle { color: var(--text-secondary); }
        :global(html[data-theme='light']) .connection-badge { background: rgba(52,211,153,0.06); border-color: rgba(52,211,153,0.2); }
        :global(html[data-theme='light']) .disconnect-link { color: var(--text-muted); }
        :global(html[data-theme='light']) .empty-state-card { background: var(--bg-card); border-color: #e2e8f0; }
        :global(html[data-theme='light']) .empty-title { color: var(--text-primary); }
        :global(html[data-theme='light']) .empty-subtitle { color: var(--text-secondary); }
        :global(html[data-theme='light']) .upload-item { background: var(--bg-card); border-color: #e2e8f0; box-shadow: 0 1px 3px rgba(0,0,0,0.04); }
        :global(html[data-theme='light']) .upload-item:hover { border-color: #0070f3; box-shadow: 0 4px 12px rgba(0,0,0,0.06); }
        :global(html[data-theme='light']) .upload-file-icon { background: rgba(0,112,243,0.08); color: #0070f3; }
        :global(html[data-theme='light']) .upload-name { color: var(--text-primary); }
        :global(html[data-theme='light']) .upload-meta { color: var(--text-muted); }
        :global(html[data-theme='light']) .status-badge { background: rgba(52,211,153,0.08); }

        :global(html[data-theme='light']) .btn-primary { background: #2563eb; box-shadow: 0 4px 14px rgba(37,99,235,0.2); }
        :global(html[data-theme='light']) .btn-primary:hover { background: #1d4ed8; box-shadow: 0 6px 20px rgba(37,99,235,0.3); }
        :global(html[data-theme='light']) .btn-demo { background: rgba(37,99,235,0.06); border-color: rgba(37,99,235,0.2); color: #2563eb; }
        :global(html[data-theme='light']) .btn-demo:hover:not(:disabled) { background: rgba(37,99,235,0.12); border-color: rgba(37,99,235,0.35); }
        :global(html[data-theme='light']) .empty-icon { color: var(--text-muted); }
        :global(html[data-theme='light']) .demo-file-banner { background: rgba(37,99,235,0.04); border-color: rgba(37,99,235,0.12); }
        :global(html[data-theme='light']) .demo-file-icon { color: #2563eb; }
        :global(html[data-theme='light']) .empty-demo-hint { background: rgba(37,99,235,0.04); border-color: rgba(37,99,235,0.15); }
      `}</style>
    </>
  );
}