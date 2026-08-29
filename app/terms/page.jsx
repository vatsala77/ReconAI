'use client';
import Link from 'next/link';
import ThemeToggle from '@/components/ThemeToggle';

export default function TermsOfService() {
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
          <h1>Terms of Service</h1>
          <p className="updated">Last updated: August 2026</p>

          <p>
            ReconAI is a prototype built for the Razorpay AI Buildathon. By using this
            app, you agree to the following terms.
          </p>

          <h2>Nature of the product</h2>
          <p>
            This is a demonstration project, not a commercially supported product.
            It is provided &ldquo;as is&rdquo; without warranties of any kind. Features, data,
            and availability may change or be removed without notice.
          </p>

          <h2>Test-mode only</h2>
          <p>
            All Razorpay integrations in this app operate in test mode. No real
            payments, transfers, or financial transactions are processed. Do not
            connect live/production Razorpay credentials — the app explicitly
            rejects non-test-mode keys.
          </p>

          <h2>Acceptable use</h2>
          <ul>
            <li>Don&apos;t upload real customer, financial, or production data</li>
            <li>Don&apos;t use this app to make actual business or compliance decisions</li>
            <li>Don&apos;t attempt to misuse the AI chat or resolution features for purposes outside evaluating this prototype</li>
          </ul>

          <h2>No liability</h2>
          <p>
            Since this is a hackathon prototype, we make no guarantees about
            accuracy, uptime, or data persistence. Use it to explore the concept,
            not for real financial reconciliation.
          </p>

          <h2>Contact</h2>
          <p>
            Questions? Reach out via the <Link href="/contact">contact page</Link>.
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
