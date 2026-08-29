'use client';
import Link from 'next/link';
import ThemeToggle from '@/components/ThemeToggle';

export default function Contact() {
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
          <h1>Contact</h1>

          <p>
            ReconAI was built as a submission for the Razorpay AI Buildathon, exploring
            Track 4: AI Finance Controller — multi-source reconciliation, tax-line
            verification, and an explainable settlement Q&amp;A agent for Route
            marketplaces.
          </p>

          <h2>Get in touch</h2>
          <p>
            For questions about this project, feedback, or collaboration —
            reach out via GitHub or email.
          </p>

          <div className="contact-links">
            <a
              href="https://github.com/vatsala77/ReconAI"
              target="_blank"
              rel="noopener noreferrer"
              className="contact-card"
            >
              <span className="contact-icon">⭐</span>
              <div>
                <p className="contact-label">GitHub</p>
                <p className="contact-value">github.com/vatsala77/ReconAI</p>
              </div>
            </a>

            <a href="mailto:your.email@example.com" className="contact-card">
              <span className="contact-icon">✉️</span>
              <div>
                <p className="contact-label">Email</p>
                <p className="contact-value">vatsalasahu77@gmail.com</p>
              </div>
            </a>
          </div>
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
          margin: 0 0 24px 0;
        }
        h2 {
          color: var(--text-primary);
          font-size: 18px;
          font-weight: 700;
          margin: 32px 0 12px 0;
        }
        p {
          color: var(--text-secondary);
          font-size: 15px;
          line-height: 1.7;
        }
        .contact-links {
          display: flex;
          flex-direction: column;
          gap: 12px;
          margin-top: 16px;
        }
        .contact-card {
          display: flex;
          align-items: center;
          gap: 14px;
          background: var(--bg-card);
          border: 1px solid var(--border-card);
          border-radius: 12px;
          padding: 16px 18px;
          text-decoration: none;
          transition: all 0.2s;
        }
        .contact-card:hover {
          border-color: var(--accent);
          transform: translateY(-2px);
        }
        .contact-icon { font-size: 20px; }
        .contact-label {
          font-size: 12px;
          color: var(--text-muted);
          margin: 0 0 2px 0;
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }
        .contact-value {
          font-size: 14px;
          color: var(--text-primary);
          margin: 0;
          font-weight: 500;
        }
      `}</style>
    </>
  );
}
