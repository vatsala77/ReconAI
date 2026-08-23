'use client';

import { useState, useRef, useEffect } from 'react';
import { signOut } from 'next-auth/react';
import Link from 'next/link';

export default function DashboardUI({ session, uploads }) {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  const userEmail = session?.user?.email || 'user@company.com';
  const userInitial = userEmail.charAt(0).toUpperCase();

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <>
      <div className="ambient-glow top left" />
      <div className="ambient-glow bottom right" />

      {/* NAVBAR WITH PROFILE DROPDOWN */}
      <nav className="navbar">
        <div className="navbar-inner">
          <Link href="/" className="brand">
            <div className="brand-icon" />
            <span className="brand-name">ReconAI</span>
          </Link>

          <div className="nav-right">
            <Link href="/upload" className="btn-primary">
              + New Batch
            </Link>

            {/* Premium Profile Dropdown Container */}
            <div className="profile-container" ref={dropdownRef}>
              <button 
                className="profile-btn" 
                onClick={() => setDropdownOpen(!dropdownOpen)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  background: 'rgba(18, 28, 51, 0.85)',
                  border: '1px solid rgba(255, 255, 255, 0.15)',
                  padding: '5px 12px 5px 5px',
                  borderRadius: '999px',
                  cursor: 'pointer',
                  backdropFilter: 'blur(8px)',
                  transition: 'all 0.2s ease',
                }}
              >
                <div 
                  className="avatar"
                  style={{
                    width: '32px',
                    height: '32px',
                    borderRadius: '50%',
                    background: 'linear-gradient(135deg, #f8fafc 0%, #cbd5e1 100%)',
                    color: '#0f172a',
                    fontWeight: '800',
                    fontSize: '13px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.25)',
                  }}
                >
                  {userInitial}
                </div>
                <span style={{ fontSize: '9px', color: '#cbd5e1' }}>
                  {dropdownOpen ? '▲' : '▼'}
                </span>
              </button>

              {dropdownOpen && (
                <div 
                  className="dropdown-menu"
                  style={{
                    position: 'absolute',
                    right: 0,
                    top: '48px',
                    width: '230px',
                    backgroundColor: '#0b1324',
                    border: '1px solid rgba(255, 255, 255, 0.15)',
                    borderRadius: '16px',
                    padding: '12px',
                    boxShadow: '0 20px 40px -10px rgba(0, 0, 0, 0.8)',
                    zIndex: 100,
                  }}
                >
                  <div 
                    className="dropdown-header"
                    style={{
                      padding: '10px',
                      backgroundColor: 'rgba(255, 255, 255, 0.04)',
                      borderRadius: '10px',
                      border: '1px solid rgba(255, 255, 255, 0.05)',
                    }}
                  >
                    <p style={{ fontSize: '13px', fontWeight: '600', color: '#f8fafc', margin: 0, wordBreak: 'break-all' }}>
                      {userEmail}
                    </p>
                    <p style={{ fontSize: '11px', color: '#94a3b8', margin: '4px 0 0 0', display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <span style={{ width: '6px', height: '6px', backgroundColor: '#10b981', borderRadius: '50%', display: 'inline-block' }} />
                      Company Admin
                    </p>
                  </div>

                  <div style={{ height: '1px', backgroundColor: 'rgba(255, 255, 255, 0.1)', margin: '10px 0' }} />

                  <button 
                    onClick={() => signOut({ callbackUrl: '/' })}
                    style={{
                      width: '100%',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '10px',
                      padding: '10px 12px',
                      backgroundColor: 'transparent',
                      border: 'none',
                      color: '#f87171',
                      fontSize: '13px',
                      fontWeight: '600',
                      borderRadius: '8px',
                      cursor: 'pointer',
                      textAlign: 'left',
                    }}
                  >
                    <span>🚪</span> Log out
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </nav>

      <main className="dashboard-page">
        <div className="dashboard-header">
          <div>
            <div className="badge">
              <span className="badge-dot" />
              COMPANY DASHBOARD
            </div>
            <h1>Settlement Batches</h1>
            <p className="subtitle">
              Manage your uploaded Razorpay Route settlements and track AI reconciliation explanations.
            </p>
          </div>
        </div>

        <div className="uploads-card-wrap">
          <div className="uploads-card">
            {uploads.length === 0 ? (
              <div className="empty-state">
                <p className="empty-title">No settlement batches uploaded yet</p>
                <p className="empty-sub">Upload your marketplace orders and Route settlement data to start AI analysis.</p>
                <Link href="/upload" className="btn-primary lg">
                  Upload First Batch →
                </Link>
              </div>
            ) : (
              <div className="table-wrapper">
                <table className="uploads-table">
                  <thead>
                    <tr>
                      <th className="label-caps">BATCH / FILE NAME</th>
                      <th className="label-caps">DATE</th>
                      <th className="label-caps">STATUS</th>
                      <th className="label-caps text-right">ACTION</th>
                    </tr>
                  </thead>
                  <tbody>
                    {uploads.map((batch) => (
                      <tr key={batch.id}>
                        <td>
                          <div className="file-name">{batch.fileName || `Settlement Batch #${batch.id.slice(-6)}`}</div>
                          <div className="batch-id">ID: {batch.id}</div>
                        </td>
                        <td className="table-date">
                          {new Date(batch.createdAt).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric',
                          })}
                        </td>
                        <td>
                          <span className="status-badge">
                            <span className="status-dot" /> Processed
                          </span>
                        </td>
                        <td className="text-right">
                          <Link href={`/dashboard/${batch.id}`} className="btn-ghost">
                            View Analysis →
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </main>

      <style jsx global>{`
        body {
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
          justify-content: space-between;
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

        .nav-right { display: flex; align-items: center; gap: 16px; }

        .profile-container {
          position: relative;
        }

        .btn-primary {
          background: #0070f3;
          box-shadow: 0 4px 14px rgba(0,112,243,0.2);
          color: white !important;
          text-decoration: none !important;
          padding: 10px 20px;
          border-radius: 10px;
          font-weight: 500;
          font-size: 14px;
          display: inline-flex;
          align-items: center;
          gap: 8px;
          transition: all 0.3s ease;
          border: none;
          cursor: pointer;
        }
        .btn-primary:hover { box-shadow: 0 6px 20px rgba(0,112,243,0.35); transform: translateY(-2px); background: #0059c5; }
        .btn-primary.lg { padding: 14px 32px; border-radius: 12px; font-size: 15px; }

        .btn-ghost {
          background: #1f2942;
          border: 1px solid #2a344e;
          color: #ffffff;
          text-decoration: none;
          padding: 8px 16px;
          border-radius: 10px;
          font-weight: 500;
          font-size: 13px;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          transition: all 0.3s ease;
        }
        .btn-ghost:hover { background: #2a344e; border-color: #414754; }

        .dashboard-page {
          max-width: 1280px;
          margin: 0 auto;
          padding: 140px 24px 96px;
        }

        .dashboard-header { margin-bottom: 48px; }

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

        h1 {
          font-size: 48px;
          font-weight: 800;
          line-height: 1;
          letter-spacing: -0.03em;
          margin: 0 0 16px 0;
          color: #ffffff;
        }
        @media (min-width: 768px) { h1 { font-size: 64px; } }

        .subtitle {
          font-size: 18px;
          line-height: 28px;
          color: #c1c6d7;
          max-width: 640px;
          margin: 0;
        }

        .uploads-card-wrap { max-width: 1280px; }
        .uploads-card {
          background: #101b33;
          border: 1px solid #1f2942;
          border-radius: 20px;
          padding: 32px;
          box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1);
        }

        .empty-state { text-align: center; padding: 64px 24px; }
        .empty-title { font-size: 20px; font-weight: 700; color: #ffffff; margin: 0 0 8px 0; }
        .empty-sub { color: #c1c6d7; font-size: 15px; margin: 0 0 32px 0; }

        .table-wrapper { overflow-x: auto; }
        .uploads-table { width: 100%; border-collapse: collapse; text-align: left; }

        .label-caps {
          font-size: 11px;
          letter-spacing: 0.15em;
          font-weight: 700;
          color: #aec6ff;
          padding: 0 16px 16px 16px;
          border-bottom: 1px solid #1f2942;
        }

        .uploads-table td {
          padding: 20px 16px;
          border-bottom: 1px solid #151f37;
          vertical-align: middle;
        }

        .file-name { font-size: 16px; font-weight: 600; color: #ffffff; }
        .batch-id { font-size: 12px; color: #6b7690; margin-top: 4px; font-family: monospace; }
        .table-date { color: #c1c6d7; font-size: 14px; }

        .status-badge {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 6px 12px;
          background: rgba(16, 185, 129, 0.08);
          border: 1px solid rgba(16, 185, 129, 0.2);
          color: #34d399;
          border-radius: 999px;
          font-size: 12px;
          font-weight: 600;
        }
        .status-dot {
          width: 6px; height: 6px; border-radius: 50%;
          background: #34d399;
          box-shadow: 0 0 6px rgba(52, 211, 153, 0.6);
        }

        .text-right { text-align: right; }
      `}</style>
    </>
  );
}