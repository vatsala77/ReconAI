'use client';
import { use, useState, useEffect } from 'react';
import Dashboard from '@/components/Dashboard';
import DashboardHeader from '@/components/DashboardHeader';
import Link from 'next/link';

export default function BatchDashboard({ params }) {
  const { batchId } = use(params);
  const [companyId, setCompanyId] = useState(null);

  useEffect(() => {
    fetch(`/api/uploads/${batchId}`)
      .then((r) => r.json())
      .then((data) => setCompanyId(data.companyId))
      .catch(() => {});
  }, [batchId]);

  return (
    <>
      <DashboardHeader />

      <main className="dash-page">
        <div className="dash-container">
                    <Link href="/dashboard" 
            className="back-btn"
          >
            Back to uploads
          </Link>
          <Dashboard uploadBatchId={batchId} autoRun={true} />
        </div>
      </main>
      
      <style jsx>{`
        :global(body) {
          background-color: #07122a;
          color: #ffffff;
          background-image:
            linear-gradient(to right, rgba(255,255,255,0.02) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(255,255,255,0.02) 1px, transparent 1px);
          background-size: 50px 50px;
          font-family: 'Segoe UI', -apple-system, sans-serif;
        }
        .navbar {
          position: sticky; top: 0; z-index: 50;
          background: rgba(7,18,42,0.9);
          backdrop-filter: blur(12px);
          border-bottom: 1px solid #151f37;
        }
        .navbar-inner { display: flex; align-items: center; padding: 16px 24px; max-width: 1400px; margin: 0 auto; }
        .brand { display: flex; align-items: center; gap: 8px; text-decoration: none; }
        .brand-icon { width: 24px; height: 24px; border-radius: 6px; background: linear-gradient(135deg, #0070f3, #0059c5); }
        .brand-name { font-size: 20px; font-weight: 800; color: #ffffff; letter-spacing: -0.02em; }

        .dash-page { padding: 32px 24px 64px; }
        .dash-container { max-width: 1400px; margin: 0 auto; }

        /* :global pseudo-class Next.js Link elements me style pass karne me help karta hai */
        :global(.back-btn) {
          display: inline-flex;
          align-items: center;
          padding: 10px 16px;
          border-radius: 10px;
          background: #101c38;
          border: 1px solid #253154;
          color: #e2e8f0;
          font-size: 14px;
          font-weight: 600;
          text-decoration: none;
          margin-bottom: 24px;
          box-shadow: 0 1px 2px rgba(0,0,0,0.2);
          transition: all 0.15s ease;
        }
        :global(.back-btn:hover) {
          background: #16234a;
          border-color: #0070f3;
          color: #ffffff;
          transform: translateY(-1px);
          box-shadow: 0 4px 12px rgba(0,112,243,0.15);
        }
        :global(.back-btn:active) {
          transform: translateY(0);
        }
      `}</style>
    </>
  );
}