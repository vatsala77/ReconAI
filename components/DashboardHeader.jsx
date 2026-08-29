'use client';
import { signOut } from 'next-auth/react';
import Link from 'next/link';
import { Activity, LogOut } from 'lucide-react';
import ThemeToggle from './ThemeToggle';

export default function DashboardHeader({ companyName }) {
  return (
    <nav className="navbar">
      <div className="navbar-inner">
        <Link href="/" className="brand">
          <div className="brand-icon">
            <Activity size={16} color="#ffffff" />
          </div>
          <span className="brand-name">ReconAI</span>
        </Link>
        <div className="header-right">
          <ThemeToggle />
          {companyName && <span className="company-name">{companyName}</span>}
          <button onClick={() => signOut({ callbackUrl: '/login' })} className="logout-btn">
            <LogOut size={14} style={{ marginRight: 6 }} />
            Log out
          </button>
        </div>
      </div>

      <style jsx>{`
        .navbar {
          position: sticky; top: 0; z-index: 50;
          background: rgba(7,18,42,0.9);
          backdrop-filter: blur(12px);
          border-bottom: 1px solid #151f37;
        }
        .navbar-inner {
          display: flex; align-items: center; justify-content: space-between;
          padding: 16px 24px; max-width: 1400px; margin: 0 auto;
        }
        .brand { display: flex; align-items: center; gap: 8px; text-decoration: none; }
        .brand-icon {
          width: 28px; height: 28px; border-radius: 8px;
          background: linear-gradient(135deg, #0070f3, #0059c5);
          display: flex; align-items: center; justify-content: center;
        }
        .brand-name { font-size: 20px; font-weight: 800; color: #ffffff; letter-spacing: -0.02em; }
        .header-right { display: flex; align-items: center; gap: 16px; }
        .company-name { font-size: 13px; color: #9db4e0; }
        .logout-btn {
          display: flex; align-items: center;
          padding: 8px 14px;
          border-radius: 8px;
          background: var(--bg-card-elevated);
          border: 1px solid var(--border-card);
          color: var(--text-primary);
          font-size: 13px;
          cursor: pointer;
          transition: all 0.15s ease;
        }
        .logout-btn:hover { background: rgba(248,113,113,0.08); border-color: #f87171; color: #f87171; }

        /* ===== LIGHT MODE ===== */
        :global(html[data-theme="light"]) .navbar {
          background: rgba(248,250,252,0.95);
          border-bottom-color: #e2e8f0;
        }
        :global(html[data-theme="light"]) .brand-name { color: #0f172a; }
        :global(html[data-theme="light"]) .company-name { color: #475569; }
        :global(html[data-theme="light"]) .logout-btn { background: #f1f5f9; border-color: #e2e8f0; color: var(--text-secondary); }
        :global(html[data-theme="light"]) .logout-btn:hover { background: rgba(248,113,113,0.08); border-color: #f87171; color: #f87171; }
      `}</style>
    </nav>
  );
}