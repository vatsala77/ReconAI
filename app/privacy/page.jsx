'use client';
import Link from 'next/link';
import ThemeToggle from '@/components/ThemeToggle';

export default function PrivacyPolicy() {
  return (
    <>
      <nav className="navbar">
        <div className="navbar-inner">
          <Link href="/" className="brand">
            <div className="brand-icon" />
            <span className="brand-name">ReconAI</span>
          </Link>
          <ThemeToggle />
        </div>
      </nav>

      <main className="legal-page">
        <div className="legal-container">
          <Link href="/" className="back-link">← Back to home</Link>
          <h1>Privacy Policy</h1>
          <p className="updated">Last updated: August 2026</p>

          <p>
            ReconAI is a prototype built for the Razorpay AI Buildathon to demonstrate
            AI-powered settlement reconciliation for Razorpay Route marketplaces. This
            document explains what data the app handles and how.
          </p>

          <h2>What data we collect</h2>
          <ul>
            <li>Account details you provide at signup (company name, email, password — stored as a hash, never in plain text)</li>
            <li>Settlement data you upload via Excel, or sync from a connected Razorpay test-mode account</li>
            <li>Razorpay test-mode API credentials, if you choose to connect your own account (encrypted at rest)</li>
          </ul>

          <h2>How we use it</h2>
          <p>
            Uploaded or synced data is used solely to run reconciliation, generate AI
            explanations, and power the chat assistant within your own account. Data is
            not shared with any other user or third party, and is not used to train any
            AI model.
          </p>

          <h2>Third-party services</h2>
          <p>
            ReconAI uses Groq and HuggingFace for AI processing, and Razorpay&apos;s test-mode
            APIs for settlement data. No real financial transactions are processed — all
            Razorpay interactions in this app use test-mode sandbox data only.
          </p>

          <h2>Data retention</h2>
          <p>
            As a hackathon prototype, data may be periodically reset or cleared without
            notice. Please don&apos;t upload real production or customer data.
          </p>

          <h2>Contact</h2>
          <p>
            Questions about this policy? Reach out via the <Link href="/contact">contact page</Link>.
          </p>
        </div>
      </main>

      <style jsx>{`
        .navbar {
          position: fixed;
          top: 0;
          width: 100%;
          z-index: 50;
          background: rgba(7,18,42,0.9);
          backdrop-filter: blur(12px);
          border-bottom: 1px solid var(--border-card);
        }
        :global(html[data-theme="light"]) .navbar {
          background: rgba(248,250,252,0.95);
          border-bottom-color: #e2e8f0;
          box-shadow: 0 1px 3px rgba(0,0,0,0.05);
        }
        .navbar-inner {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 16px 24px;
          max-width: 1280px;
          margin: 0 auto;
        }
        .brand { display: flex; align-items: center; gap: 8px; text-decoration: none; }
        .brand-icon { width: 24px; height: 24px; border-radius: 6px; background: linear-gradient(135deg, #0070f3, #0059c5); }
        .brand-name { font-size: 22px; font-weight: 800; color: var(--text-primary); letter-spacing: -0.02em; }

        .legal-page {
          min-height: 100vh;
          padding: 120px 24px 80px;
        }
        .legal-container {
          max-width: 720px;
          margin: 0 auto;
        }
        .back-link {
          display: inline-block;
          color: var(--accent);
          font-size: 13px;
          text-decoration: none;
          margin-bottom: 32px;
        }
        .back-link:hover { text-decoration: underline; }
        h1 {
          color: var(--text-primary);
          font-size: 32px;
          font-weight: 800;
          margin: 0 0 8px 0;
        }
        .updated {
          color: var(--text-muted);
          font-size: 13px;
          margin: 0 0 32px 0;
        }
        h2 {
          color: var(--text-primary);
          font-size: 18px;
          font-weight: 700;
          margin: 32px 0 12px 0;
        }
        p, li {
          color: var(--text-secondary);
          font-size: 15px;
          line-height: 1.7;
        }
        ul { padding-left: 20px; margin: 0; }
        li { margin-bottom: 8px; }
        a { color: var(--accent); }
      `}</style>
    </>
  );
}
