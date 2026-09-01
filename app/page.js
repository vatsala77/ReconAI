'use client';
import { useEffect, useState } from 'react';
import { useSession, signOut } from 'next-auth/react';
import Link from 'next/link';
import ThemeToggle from '@/components/ThemeToggle';

const exceptionExamples = [
  {
    orderId: 'ORD1005',
    category: 'Tax-Line Discrepancy',
    color: '#ff6b6b',
    detail: 'Expected TDS ₹12.00 under Section 194-O (0.1% standard rate), but ₹6.00 was deducted.',
  },
  {
    orderId: 'ORD1002',
    category: 'Bank Amount Mismatch',
    color: '#f5a623',
    detail: 'Route transferred ₹850.00 but bank credited only ₹765.00 — likely intermediary bank charges.',
  },
  {
    orderId: 'ORD1012',
    category: 'GST TCS Mismatch',
    color: '#ff6b6b',
    detail: 'Expected TCS ₹8.50 (1% of net taxable value under Section 52 CGST), but ₹5.10 was filed.',
  },
  {
    orderId: 'ORD1013',
    category: 'Missing Payout',
    color: '#ff6b6b',
    detail: 'No Route transfer found for this order — customer paid, but settlement never initiated.',
  },
  {
    orderId: 'ORD1009',
    category: 'Bank Credit Delayed',
    color: '#f5a623',
    detail: 'Route shows settled, but bank credit (UTR) is still pending after 2 business days.',
  },
];

export default function Home() {
  const { data: session, status } = useSession();
  const isLoggedIn = status === 'authenticated';
  const dashboardHref = isLoggedIn ? '/dashboard' : '/login';

  const [activeExample, setActiveExample] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveExample((prev) => (prev + 1) % exceptionExamples.length);
    }, 3500);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) entry.target.classList.add('is-visible');
        });
      },
      { threshold: 0.1 }
    );
    document.querySelectorAll('.reveal-on-scroll').forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  const current = exceptionExamples[activeExample];

  return (
    <>
      <div className="ambient-glow top left" />
      <div className="ambient-glow bottom right" />

      <nav className="navbar">
        <div className="navbar-inner">
          <div className="brand">
            <div className="brand-icon" />
            <span className="brand-name">ReconAI</span>
          </div>

          <div className="nav-right">
            <ThemeToggle />
            <a
              href="https://github.com/vatsala77/ReconAI"
              target="_blank"
              rel="noopener noreferrer"
              className="btn-ghost"
            >
              ⭐ GitHub
            </a>
            {isLoggedIn ? (
              <>
                <Link className="btn-primary" href="/dashboard">
                  Dashboard →
                </Link>
                <button className="btn-logout" onClick={() => signOut({ callbackUrl: '/' })}>
                  Log out
                </button>
              </>
            ) : (
              <>
                <div className="nav-links">
                  <a href="#how-it-works">How It Works</a>
                  <a href="#differentiators">Features</a>
                  <a href="#pain-section">Why ReconAI</a>
                </div>
                <Link className="btn-primary" href="/login">
                  Get Started <span className="arrow">→</span>
                </Link>
              </>
            )}
          </div>
        </div>
      </nav>

      <main>
        {/* HERO */}
        <section className="hero reveal-on-scroll is-visible">
          <div className="badge">
            <span className="badge-dot" />
            BUILT ON RAZORPAY ROUTE
          </div>
          <h1 className="hero-title">ReconAI</h1>
          <p className="hero-tagline">Route splits your payments. AI explains where they went.</p>
          <p className="hero-subtext">
            The purpose-built AI reconciliation agent for Razorpay Route marketplaces — matching
            orders across bank settlements and GST filings, verifying every tax line, and
            explaining every exception in plain English.
          </p>
          <div className="hero-ctas">
            <Link className="btn-primary lg" href={dashboardHref}>
              {isLoggedIn ? 'Go to Dashboard 🚀' : 'Get Started'}
            </Link>
            <a className="btn-ghost lg" href="#how-it-works">See how it works</a>
          </div>

          <div className="hero-card-wrap">
            <div className="hero-card">
              <div className="hero-card-top">
                <div>
                  <p className="label-caps">SAMPLE EXCEPTION DETECTED</p>
                  <h3 className="hero-card-title" key={`title-${activeExample}`}>
                    Order #{current.orderId}
                  </h3>
                </div>
                <span
                  key={`badge-${activeExample}`}
                  className="hero-card-badge"
                  style={{
                    color: current.color,
                    background: `${current.color}1A`,
                    borderColor: `${current.color}40`,
                  }}
                >
                  {current.category}
                </span>
              </div>
              <p className="hero-card-explanation" key={`text-${activeExample}`}>
                {current.detail}
              </p>
              <div className="hero-card-dots">
                {exceptionExamples.map((_, i) => (
                  <span key={i} className={`dot ${i === activeExample ? 'active' : ''}`} />
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* HOW IT WORKS — 4 steps */}
        <section id="how-it-works" className="how-section reveal-on-scroll">
          <div className="section-header">
            <h2>How It Works</h2>
            <p>From messy settlements to clear, audit-ready answers — four steps.</p>
          </div>
          <div className="how-panel">
            <div className="how-grid">
              <div className="how-card">
                <div className="how-num">01</div>
                <h3>Upload or Sync</h3>
                <p>Upload your settlement Excel — any column format, AI maps it automatically — or sync directly from Razorpay&apos;s Route API in test mode.</p>
              </div>
              <div className="how-card">
                <div className="how-num">02</div>
                <h3>Multi-Source Match</h3>
                <p>Every order is reconciled against Route transfers, bank settlement UTRs, and GST filings — three independent data sources, not just a single ledger check.</p>
              </div>
              <div className="how-card">
                <div className="how-num">03</div>
                <h3>AI Explains, Tax-Line by Tax-Line</h3>
                <p>Each exception gets a plain-English explanation grounded in real TDS, GST, and chargeback regulations — with individual tax-line verification, not just a total-amount mismatch.</p>
              </div>
              <div className="how-card">
                <div className="how-num">04</div>
                <h3>Ask, Resolve, Export</h3>
                <p>Chat with your data using natural language, approve AI-suggested resolutions with a full audit trail, and export a compliance-ready report — all human-gated, nothing auto-executes.</p>
              </div>
            </div>
          </div>
        </section>

        {/* WHAT MAKES RECONAI DIFFERENT */}
        <section id="differentiators" className="diff-section reveal-on-scroll">
          <div className="section-header">
            <h2>What Makes ReconAI Different</h2>
            <p>Not a generic ledger-matcher — built specifically for Route marketplace settlements.</p>
          </div>
          <div className="diff-panel">
            <div className="diff-grid">
              <div className="diff-card">
                <div className="diff-icon">🔗</div>
                <h3>Multi-Source Reconciliation</h3>
                <p>Orders, Route Transfers, Bank UTRs, and GST Filings — cross-verified, not siloed.</p>
              </div>
              <div className="diff-card">
                <div className="diff-icon">🧾</div>
                <h3>Tax-Line Verification</h3>
                <p>TDS and GST-on-fee checked individually against exact regulatory formulas — not estimated.</p>
              </div>
              <div className="diff-card">
                <div className="diff-icon">💬</div>
                <h3>Settlement Q&amp;A Agent</h3>
                <p>Query-routed AI chat that fetches only the relevant data for each question — not a generic chatbot.</p>
              </div>
              <div className="diff-card">
                <div className="diff-icon">✅</div>
                <h3>Explainable Action Agent</h3>
                <p>AI suggests resolutions, humans approve — every decision is bounded, gated, and audit-logged.</p>
              </div>
              <div className="diff-card">
                <div className="diff-icon">⚡</div>
                <h3>Live Razorpay Sync</h3>
                <p>Connect your own test-mode account, or try the built-in demo sandbox instantly.</p>
              </div>
            </div>
          </div>
        </section>

        {/* CAROUSEL */}
        <section id="pain-section" className="pain-section reveal-on-scroll">
          <div className="section-header">
            <h2>Real Problem, Real Pain</h2>
            <p>Multi-vendor reconciliation is where efficiency goes to die. Here&apos;s what the industry is saying.</p>
          </div>

          <div className="carousel-wrap">
            <div className="fade-edge left" />
            <div className="fade-edge right" />
            <div className="carousel-track">
              {[...painPoints, ...painPoints].map((p, i) => (
                <a
                  key={i}
                  href={p.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="pain-card"
                >
                  <div className="pain-card-head">
                    <div className="pain-icon">{p.icon}</div>
                    <div>
                      <p className="pain-source">{p.source}</p>
                      <p className="pain-domain">{p.domain}</p>
                    </div>
                  </div>
                  <p className="pain-quote">&ldquo;{p.quote}&rdquo;</p>
                  <p className="pain-link">Read source →</p>
                </a>
              ))}
            </div>
          </div>
        </section>

        {/* FINAL CTA */}
        <section className="final-cta reveal-on-scroll">
          <div className="final-cta-panel">
            <h2>Ready to see where your money really goes?</h2>
            <p>Bring AI-powered clarity to your Razorpay Route settlements.</p>
            <Link className="btn-primary lg" href={dashboardHref}>
              {isLoggedIn ? 'Go to Dashboard 🚀' : 'Get Started Now 🚀'}
            </Link>
          </div>
        </section>
      </main>

      <footer className="footer">
        <div className="footer-wave">
          <svg viewBox="0 0 1440 120" fill="none" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="none">
            <path d="M0,64 C360,120 720,0 1080,64 C1260,96 1380,80 1440,64 L1440,0 L0,0 Z" fill="currentColor" className="wave-fill" />
          </svg>
        </div>
        <div className="footer-inner">
          <div className="footer-brand">
            <div className="brand-icon small" /> ReconAI
          </div>
          <div className="footer-links">
            <a href="https://github.com/vatsala77/ReconAI" target="_blank" rel="noopener noreferrer">GitHub</a>
            <Link href="/privacy">Privacy Policy</Link>
            <Link href="/terms">Terms of Service</Link>
            <Link href="/contact">Contact</Link>
          </div>
          <div className="footer-copy">© 2026 ReconAI — Built for Razorpay AI Buildathon</div>
        </div>
      </footer>

      <style jsx global>{`
        /* ===== NAVBAR ===== */
        .ambient-glow {
          position: absolute;
          width: 800px; height: 800px;
          background: radial-gradient(circle, var(--accent-soft) 0%, transparent 60%);
          border-radius: 50%;
          z-index: -1;
          pointer-events: none;
        }
        :global(html[data-theme='light']) .ambient-glow { display: none; }
        .ambient-glow.top { top: -20%; left: -10%; }
        .ambient-glow.bottom { bottom: 10%; right: -10%; }

        .navbar {
          position: fixed; top: 0; width: 100%; z-index: 50;
          background: rgba(7,18,42,0.9);
          backdrop-filter: blur(12px);
          border-bottom: 1px solid #151f37;
          transition: background 0.2s, border-color 0.2s;
        }
        :global(html[data-theme='light']) .navbar {
          background: rgba(248,250,252,0.95);
          border-bottom-color: #e2e8f0;
        }
        .navbar-inner {
          display: flex; justify-content: space-between; align-items: center;
          padding: 16px 24px; max-width: 1280px; margin: 0 auto;
        }
        .brand { display: flex; align-items: center; gap: 8px; }
        .brand-icon {
          width: 24px; height: 24px; border-radius: 6px;
          background: linear-gradient(135deg, #0070f3, #0059c5);
        }
        .brand-icon.small { width: 20px; height: 20px; }
        .brand-name { font-size: 22px; font-weight: 800; letter-spacing: -0.02em; color: var(--text-primary); }
        .nav-links { display: none; gap: 32px; }
        .nav-links a { color: var(--text-secondary); text-decoration: none; transition: color 0.2s; }
        .nav-links a:hover { color: var(--text-primary); }
        @media (min-width: 768px) { .nav-links { display: flex; } }

        .nav-right { display: flex; align-items: center; gap: 12px; }
        .btn-logout {
          background: transparent;
          border: 1px solid #253154;
          color: #e2e8f0;
          padding: 8px 14px; border-radius: 10px;
          font-size: 13px; cursor: pointer;
          transition: all 0.15s ease;
        }
        :global(html[data-theme='light']) .btn-logout { border-color: #e2e8f0; color: var(--text-secondary); }
        .btn-logout:hover { background: rgba(248,113,113,0.08); border-color: #f87171; color: #f87171; }

        .btn-primary {
          background: var(--accent);
          box-shadow: 0 4px 14px rgba(0,112,243,0.2);
          color: white !important;
          text-decoration: none !important;
          padding: 10px 20px; border-radius: 10px;
          font-weight: 500; font-size: 14px;
          display: inline-flex; align-items: center; gap: 8px;
          transition: all 0.3s ease;
          border: none; cursor: pointer;
        }
        .btn-primary:hover {
          text-decoration: none !important;
          box-shadow: 0 6px 20px rgba(0,112,243,0.35);
          transform: translateY(-2px);
          background: var(--accent-hover);
        }
        .btn-primary.lg { padding: 14px 32px; border-radius: 12px; font-size: 15px; }

        .btn-ghost {
          background: var(--bg-card-elevated);
          border: 1px solid var(--border-card);
          color: var(--text-primary);
          text-decoration: none;
          padding: 10px 20px; border-radius: 10px;
          font-weight: 500; font-size: 14px;
          display: inline-flex; align-items: center; justify-content: center;
          transition: all 0.3s ease;
        }
        :global(html[data-theme='dark']) .btn-ghost { background: #1f2942; border-color: #2a344e; color: #ffffff; }
        .btn-ghost:hover { background: #2a344e; border-color: #414754; }
        :global(html[data-theme='light']) .btn-ghost:hover { background: #e0f2fe; border-color: #38bdf8; }
        .btn-ghost.lg { padding: 14px 32px; border-radius: 12px; font-size: 15px; }

        main { padding-top: 140px; padding-bottom: 96px; }

        /* ===== HERO ===== */
        .hero {
          max-width: 1280px; margin: 0 auto;
          padding: 0 24px 64px;
          min-height: 60vh;
          display: flex; flex-direction: column; justify-content: center;
        }

        .badge {
          display: inline-flex; align-items: center; gap: 8px;
          padding: 6px 14px;
          border-radius: 9999px;
          font-size: 11px; font-weight: 700;
          letter-spacing: 0.08em;
          width: fit-content;
          background: var(--badge-bg);
          color: var(--badge-text);
          border: 1px solid var(--badge-border);
          box-shadow: 0 1px 2px rgba(0,0,0,0.05);
          transition: all 0.2s;
        }
        .badge-dot {
          width: 6px; height: 6px; border-radius: 50%;
          background: var(--badge-dot);
          box-shadow: 0 0 8px var(--badge-dot-glow);
        }

        .hero-title {
          font-size: 80px; font-weight: 800;
          line-height: 0.9; letter-spacing: -0.04em;
          margin: 0 0 24px 0;
          background: linear-gradient(135deg, #2563eb, #4f46e5, #9333ea, #2563eb);
          background-size: 200% auto;
          -webkit-background-clip: text;
          background-clip: text;
          -webkit-text-fill-color: transparent;
          animation: textGradientShift 4s linear infinite;
        }
        @keyframes textGradientShift {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
        @media (min-width: 768px) { .hero-title { font-size: 120px; } }

        .hero-tagline {
          font-size: 24px; font-weight: 600; line-height: 1.2;
          max-width: 720px; margin: 0 0 40px 0;
          color: var(--text-primary);
        }
        @media (min-width: 768px) { .hero-tagline { font-size: 32px; } }

        .hero-subtext {
          font-size: 18px; line-height: 28px;
          color: var(--text-secondary);
          max-width: 640px; margin: 0 0 48px 0;
        }

        .hero-ctas { display: flex; flex-direction: column; gap: 16px; width: fit-content; }
        @media (min-width: 640px) { .hero-ctas { flex-direction: row; } }

        .hero-card-wrap { margin-top: 80px; max-width: 720px; }
        .hero-card {
          background: var(--bg-card);
          border: 1px solid var(--border-card);
          border-radius: 16px; padding: 32px;
          box-shadow: var(--shadow-card);
          transition: background 0.2s, border-color 0.2s, box-shadow 0.2s;
          min-height: 168px;
        }
        .hero-card-top {
          display: flex; justify-content: space-between;
          align-items: flex-start; margin-bottom: 20px;
          gap: 16px;
        }
        .label-caps {
          font-size: 12px; letter-spacing: 0.15em;
          font-weight: 600; color: var(--text-secondary);
          margin: 0 0 8px 0;
        }
        .label-caps.small { font-size: 10px; color: var(--badge-text); margin-top: 8px; }
        .hero-card-title {
          font-size: 24px; font-weight: 600; margin: 0; color: var(--text-primary);
          animation: fadeSlideIn 0.4s ease;
        }
        .hero-card-badge {
          font-size: 12px;
          font-weight: 700;
          padding: 6px 12px;
          border-radius: 8px;
          border: none;
          white-space: nowrap;
          flex-shrink: 0;
          animation: fadeSlideIn 0.4s ease;
        }
        .hero-card-explanation {
          color: var(--text-secondary);
          font-size: 15px;
          line-height: 1.6;
          margin: 0 0 20px 0;
          min-height: 48px;
          animation: fadeSlideIn 0.4s ease;
        }
        @keyframes fadeSlideIn {
          from { opacity: 0; transform: translateY(6px); }
          to { opacity: 1; transform: translateY(0); }
        }

        .hero-card-dots {
          display: flex;
          gap: 6px;
        }
        .dot {
          width: 6px; height: 6px; border-radius: 50%;
          background: var(--border-card);
          transition: all 0.3s ease;
        }
        .dot.active {
          background: var(--accent);
          width: 18px;
          border-radius: 999px;
        }

        /* ===== SECTIONS ===== */
        .section-header { text-align: center; margin-bottom: 64px; padding: 0 24px; }
        .section-header h2 {
          font-size: 32px; font-weight: 700;
          letter-spacing: -0.01em; margin: 0 0 16px 0;
          color: var(--text-primary);
        }
        .section-header p { color: var(--text-secondary); font-size: 18px; max-width: 640px; margin: 0 auto; }

        .how-section, .diff-section { margin-bottom: 96px; }
        .how-panel, .diff-panel { max-width: 1280px; margin: 0 auto; padding: 0 24px; }
        .how-grid { display: grid; grid-template-columns: 1fr; gap: 24px; }
        @media (min-width: 768px) { .how-grid { grid-template-columns: repeat(4, 1fr); } }

        .diff-grid { display: grid; grid-template-columns: 1fr; gap: 40px; }
        @media (min-width: 768px) { .diff-grid { grid-template-columns: repeat(3, 1fr); } }
        @media (min-width: 1024px) { .diff-grid { grid-template-columns: repeat(5, 1fr); } }

        .how-card, .diff-card {
          background: var(--bg-card);
          border: 1px solid var(--border-card);
          border-radius: 16px; padding: 32px;
          transition: all 0.25s ease;
        }

        :global(html[data-theme='light']) .hero-card,
        :global(html[data-theme='light']) .final-cta-panel,
        :global(html[data-theme='light']) .how-card,
        :global(html[data-theme='light']) .diff-card,
        :global(html[data-theme='light']) .pain-card {
          background: #f0f9ff !important;
          border: 1px solid #7dd3fc !important;
          box-shadow: 0 4px 14px rgba(2, 132, 199, 0.08) !important;
        }

        :global(html[data-theme='light']) .how-card:hover,
        :global(html[data-theme='light']) .diff-card:hover,
        :global(html[data-theme='light']) .pain-card:hover {
          background: #e0f2fe !important;
          border-color: #0284c7 !important;
          transform: translateY(-4px);
          box-shadow: 0 8px 20px rgba(2, 132, 199, 0.16) !important;
        }

        .how-num {
          font-size: 14px; font-weight: 700;
          color: var(--badge-text); margin-bottom: 16px;
        }
        .diff-icon { font-size: 28px; margin-bottom: 16px; }
        .how-card h3, .diff-card h3 { font-size: 20px; font-weight: 700; margin: 0 0 12px 0; color: var(--text-primary); }
        .how-card p, .diff-card p { color: var(--text-secondary); font-size: 15px; line-height: 1.6; margin: 0; }

        /* ===== CAROUSEL ===== */
        .pain-section { margin-bottom: 96px; }
        .carousel-wrap { position: relative; overflow: hidden; padding: 32px 0; }
        .fade-edge {
          position: absolute; top: 0; bottom: 0;
          width: 128px; z-index: 10; pointer-events: none;
        }
        .fade-edge.left { left: 0; background: linear-gradient(to right, var(--bg-primary), transparent); }
        .fade-edge.right { right: 0; background: linear-gradient(to left, var(--bg-primary), transparent); }
        .carousel-track {
          display: flex; width: max-content; gap: 24px;
          padding: 0 24px;
          animation: scroll 45s linear infinite;
        }
        .carousel-track:hover { animation-play-state: paused; }
        @keyframes scroll {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        .pain-card {
          width: 340px; flex-shrink: 0;
          background: var(--bg-card);
          border: 1px solid var(--border-card);
          border-radius: 16px; padding: 28px;
          text-decoration: none; color: inherit;
          display: block; transition: all 0.2s;
        }
        :global(html[data-theme='dark']) .pain-card:hover { border-color: var(--accent); transform: translateY(-4px); box-shadow: 0 12px 24px rgba(0,0,0,0.1); }
        .pain-card-head { display: flex; align-items: center; gap: 12px; margin-bottom: 20px; }
        .pain-icon {
          width: 40px; height: 40px; border-radius: 50%;
          background: var(--bg-card-elevated);
          display: flex; align-items: center; justify-content: center;
          font-size: 18px;
        }
        :global(html[data-theme='light']) .pain-icon { background: #e0f2fe; }
        .pain-source { font-weight: 600; margin: 0; font-size: 15px; color: var(--text-primary); }
        .pain-domain { color: var(--text-muted); font-size: 13px; margin: 2px 0 0 0; }
        .pain-quote { color: var(--text-secondary); font-style: italic; font-size: 14px; line-height: 1.6; margin: 0 0 16px 0; }
        .pain-link { color: var(--accent); font-size: 13px; margin: 0; }

        /* ===== CTA ===== */
        .final-cta { max-width: 1280px; margin: 0 auto; padding: 0 24px; }
        .final-cta-panel {
          background: var(--bg-card);
          border: 1px solid var(--border-card);
          border-radius: 24px; padding: 64px 32px;
          text-align: center;
          box-shadow: var(--shadow-card);
        }
        .final-cta-panel h2 { font-size: 32px; margin: 0 0 16px 0; letter-spacing: -0.01em; color: var(--text-primary); }
        @media (min-width: 768px) { .final-cta-panel h2 { font-size: 40px; } }
        .final-cta-panel p { color: var(--text-secondary); font-size: 18px; margin: 0 0 32px 0; }

        /* ===== FOOTER ===== */
        .footer {
          position: relative;
          background: linear-gradient(135deg, #e0f2fe 0%, #bae6fd 30%, #7dd3fc 60%, #38bdf8 100%);
          padding: 0 24px 48px;
          transition: background 0.2s;
          overflow: hidden;
        }
        :global(html[data-theme='dark']) .footer {
          background: linear-gradient(135deg, #0c1929 0%, #0f2744 35%, #163a5f 65%, #1a4971 100%);
        }
        .footer-wave {
          position: relative;
          width: 100%;
          height: 80px;
          margin-bottom: -1px;
        }
        .footer-wave svg {
          position: absolute;
          bottom: 0;
          width: 100%;
          height: 100%;
        }
        .wave-fill { color: var(--bg-primary); }
        :global(html[data-theme='dark']) .wave-fill { color: #07122a; }
        .footer-inner {
          max-width: 1280px; margin: 0 auto;
          display: flex; flex-direction: column; align-items: center; gap: 24px;
        }
        @media (min-width: 768px) { .footer-inner { flex-direction: row; justify-content: space-between; } }
        .footer-brand {
          display: flex; align-items: center; gap: 8px;
          font-weight: 700; font-size: 18px; color: #0c4a6e;
        }
        :global(html[data-theme='dark']) .footer-brand { color: #e0f2fe; }
        .footer-links {
          display: flex; flex-wrap: wrap; justify-content: center; gap: 28px;
        }
        .footer-links a {
          color: #0369a1; text-decoration: underline; text-underline-offset: 3px; font-size: 14px; font-weight: 500;
          transition: color 0.2s;
        }
        :global(html[data-theme='dark']) .footer-links a { color: #7dd3fc; text-decoration-color: rgba(125, 211, 252, 0.4); }
        .footer-links a:hover { color: #0f172a; text-decoration-color: #0f172a; }
        :global(html[data-theme='dark']) .footer-links a:hover { color: #ffffff; text-decoration-color: #ffffff; }
        .footer-copy { color: #0369a1; font-size: 13px; opacity: 0.7; }
        :global(html[data-theme='dark']) .footer-copy { color: #7dd3fc; opacity: 0.6; }

        /* ===== MISC ===== */
        .reveal-on-scroll { opacity: 0; transform: translateY(20px); transition: opacity 0.8s ease-out, transform 0.8s ease-out; }
        .reveal-on-scroll.is-visible { opacity: 1; transform: translateY(0); }
        .arrow { font-size: 14px; }


      `}</style>
    </>
  );
}

const painPoints = [
  {
    source: 'Ultra Commerce',
    domain: 'Marketplace Ops',
    icon: '🏢',
    quote: 'Multi-vendor cart complexity — where one customer order spans multiple vendors requiring simultaneous splits — is a documented reconciliation failure point.',
    url: 'https://ultracommerce.co/blog/how-to-optimise-your-marketplace-settlement-workflow',
  },
  {
    source: 'Unicommerce',
    domain: 'E-commerce Research',
    icon: '📉',
    quote: 'Small discrepancies that seem trivial at low scale multiply into lakhs of unrecovered revenue as marketplaces grow.',
    url: 'https://unicommerce.com/blog/marketplace-payment-reconciliation-the-invisible-margin-leak-killing-your-profitability/',
  },
  {
    source: 'PKC India',
    domain: 'Audit & Compliance',
    icon: '⚠️',
    quote: 'Delayed settlements, hidden deductions, multiple gateways, and GST mismatches make manual reconciliation time-consuming and error-prone.',
    url: 'https://www.pkcindia.com/blogs/ecommerce-payment-reconciliation/',
  },
  {
    source: 'OneFinOps',
    domain: 'Financial Operations',
    icon: '🏦',
    quote: 'TDS discrepancies point to missed deductions — short-deduction attracts monthly interest penalties under Section 201(1A).',
    url: 'https://onefinops.com/blog/vendor-payment-reconciliation-guide',
  },
  {
    source: 'Appscrip',
    domain: 'Marketplace Tech',
    icon: '👥',
    quote: 'Vendor payout delays from manual reconciliation frustrate sellers and drive them to competing platforms.',
    url: 'https://appscrip.com/blog/payment-processing-in-multivendor-marketplace/',
  },
  {
    source: 'ReconPe',
    domain: 'Industry Analysis',
    icon: '🤖',
    quote: 'AI-powered reconciliation engines are already replacing manual spreadsheet-based processes at scale across Indian e-commerce.',
    url: 'https://reconpe.com/blog/best-reconciliation-software-indian-ecommerce-sellers-2026/',
  },
];