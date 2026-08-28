'use client';
import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { signOut } from 'next-auth/react';
import Link from 'next/link';
import ConnectRazorpayModal from './ConnectRazorpayModal';

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
                  📊 Dashboard
                </button>
                <button className="dropdown-item logout" onClick={() => signOut({ callbackUrl: '/' })}>
                  🚪 Log out
                </button>
              </div>
            )}
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
              <button className="btn-ghost" onClick={handleSyncClick} disabled={syncing}>
                {syncing ? 'Syncing…' : connected ? '🔄 Sync from Razorpay' : '🔗 Connect Razorpay'}
              </button>
              <button className="btn-primary" onClick={() => router.push('/upload')}>+ New Upload</button>
            </div>
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
          position: fixed;
          width: 800px;
          height: 800px;
          background: radial-gradient(circle, rgba(0,112,243,0.08) 0%, rgba(7,18,42,0) 60%);
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
          border-bottom: 1px solid #151f37;
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
        .brand-name { font-size: 20px; font-weight: 800; color: #ffffff; letter-spacing: -0.02em; }

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
          background: #101b33;
          border: 1px solid #1f2942;
          border-radius: 14px;
          box-shadow: 0 8px 24px rgba(0,0,0,0.35);
          overflow: hidden;
          z-index: 60;
        }
        .dropdown-header { padding: 14px 16px; }
        .dropdown-name { color: #ffffff; font-size: 14px; font-weight: 600; margin: 0 0 2px 0; }
        .dropdown-email { color: #7c8493; font-size: 12px; margin: 0; word-break: break-all; }
        .dropdown-divider { height: 1px; background: #1f2942; }
        .dropdown-item {
          width: 100%;
          text-align: left;
          padding: 11px 16px;
          background: none;
          border: none;
          color: #c1c6d7;
          font-size: 13px;
          cursor: pointer;
          transition: background 0.15s;
        }
        .dropdown-item:hover { background: #151f37; }
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

        h1 { color: #ffffff; font-size: 30px; margin: 0 0 8px 0; font-weight: 800; letter-spacing: -0.01em; }
        .subtitle { color: #c1c6d7; font-size: 15px; margin: 0; }

        .header-actions { display: flex; align-items: center; gap: 12px; flex-wrap: wrap; }

        .connection-badge {
          display: flex; align-items: center; gap: 6px;
          font-size: 12px; color: #34D399; background: rgba(52,211,153,0.08);
          border: 1px solid rgba(52,211,153,0.2); padding: 8px 14px; border-radius: 10px;
        }
        .dot { width: 6px; height: 6px; border-radius: 50%; background: #34D399; }
        .disconnect-link {
          background: none; border: none; color: #7c8493; font-size: 11px;
          text-decoration: underline; cursor: pointer; margin-left: 6px;
        }

        .btn-primary {
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
        .btn-primary:disabled { opacity: 0.5; cursor: not-allowed; }

        .btn-ghost {
          background: #1f2942;
          border: 1px solid #2a344e;
          color: #ffffff;
          padding: 11px 20px;
          border-radius: 12px;
          font-weight: 600;
          font-size: 14px;
          cursor: pointer;
          transition: all 0.3s ease;
        }
        .btn-ghost:hover:not(:disabled) { background: #2a344e; border-color: #414754; }
        .btn-ghost:disabled { opacity: 0.5; cursor: not-allowed; }

        .empty-state-card {
          margin-top: 24px;
          background: #101b33;
          border: 1px solid #1f2942;
          border-radius: 24px;
          padding: 64px 32px;
          text-align: center;
        }
        .empty-icon { font-size: 40px; margin-bottom: 16px; }
        .empty-title { font-size: 18px; font-weight: 700; color: #ffffff; margin: 0 0 6px 0; }
        .empty-subtitle { font-size: 14px; color: #c1c6d7; margin: 0 0 24px 0; }

        .uploads-list { display: flex; flex-direction: column; gap: 12px; }
        .upload-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          background: #101b33;
          border: 1px solid #1f2942;
          border-radius: 14px;
          padding: 18px 22px;
          cursor: pointer;
          text-align: left;
          color: inherit;
          width: 100%;
          transition: border-color 0.2s;
        }
        .upload-item:hover { border-color: rgba(0,112,243,0.3); }
        .upload-name { color: #ffffff; font-size: 15px; margin: 0 0 4px 0; font-weight: 500; }
        .upload-meta { color: #7c8493; font-size: 13px; margin: 0; font-family: 'Courier New', monospace; }
        .status-badge {
          font-size: 12px;
          padding: 5px 12px;
          border-radius: 8px;
          background: rgba(52,211,153,0.1);
          color: #34D399;
          text-transform: capitalize;
          font-weight: 500;
        }
      `}</style>
    </>
  );
}