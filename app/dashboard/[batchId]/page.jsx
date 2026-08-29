'use client';
import { use, useState, useEffect } from 'react';
import Dashboard from '@/components/Dashboard';
import DashboardHeader from '@/components/DashboardHeader';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

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
          <Link href="/dashboard" className="back-btn">
            <ArrowLeft size={16} />
            Back to uploads
          </Link>
          <Dashboard uploadBatchId={batchId} autoRun={true} />
        </div>
      </main>
      
      <style jsx global>{`
        .dash-page {
          padding: 32px 24px 64px;
          min-height: 100vh;
        }

        .dash-container {
          max-width: 1400px;
          margin: 0 auto;
        }

        .back-btn {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 8px 16px;
          border-radius: 8px;
          font-size: 14px;
          font-weight: 500;
          text-decoration: none;
          color: var(--text-primary);
          background: var(--bg-card);
          border: 1px solid var(--border-card);
          box-shadow: 0 1px 2px rgba(0,0,0,0.05);
          transition: all 0.2s ease;
          margin-bottom: 20px;
        }
        .back-btn:hover {
          background: var(--bg-card-elevated);
          border-color: var(--accent);
          box-shadow: 0 2px 6px rgba(0,0,0,0.08);
        }
      `}</style>
    </>
  );
}