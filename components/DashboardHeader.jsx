'use client';
import { signOut } from 'next-auth/react';
import Link from 'next/link';

export default function DashboardHeader({ companyName }) {
  return (
    <nav className="navbar">
      <div className="navbar-inner">
        <Link href="/" className="brand">
          <div className="brand-icon" />
          <span className="brand-name">ReconAI</span>
        </Link>
        <div className="header-right">
          {companyName && <span className="company-name">{companyName}</span>}
          <button onClick={() => signOut({ callbackUrl: '/login' })} className="logout-btn">
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
        .brand-icon { width: 24px; height: 24px; border-radius: 6px; background: linear-gradient(135deg, #0070f3, #0059c5); }
        .brand-name { font-size: 20px; font-weight: 800; color: #ffffff; letter-spacing: -0.02em; }
        .header-right { display: flex; align-items: center; gap: 16px; }
        .company-name { font-size: 13px; color: #9db4e0; }
        .logout-btn {
          padding: 8px 14px;
          border-radius: 8px;
          background: #101c38;
          border: 1px solid #253154;
          color: #e2e8f0;
          font-size: 13px;
          cursor: pointer;
          transition: all 0.15s ease;
        }
        .logout-btn:hover { background: #16234a; border-color: #f87171; color: #f87171; }
      `}</style>
    </nav>
  );
}