'use client';
import { useEffect } from 'react';
import { useSession, signOut } from 'next-auth/react';
import Link from 'next/link';

export default function Home() {
  const { data: session, status } = useSession();
  const isLoggedIn = status === 'authenticated';
  const dashboardHref = isLoggedIn ? '/dashboard' : '/login';

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
            The purpose-built AI reconciliation agent for Razorpay Route marketplaces. Stop
            manually tracking split settlements across thousands of sub-vendors.
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
                  <p className="label-caps">RECON STATUS</p>
                  <h3 className="hero-card-title">Settlement Batch #8892</h3>
                </div>
                <div className="hero-card-stat">
                  <span className="stat-num">94.7%</span>
                  <p className="label-caps small">MATCHED AUTOMATICALLY</p>
                </div>
              </div>
              <div className="progress-track">
                <div className="progress-fill" style={{ width: '94.7%' }} />
              </div>
            </div>
          </div>
        </section>

        {/* HOW IT WORKS */}
        <section id="how-it-works" className="how-section reveal-on-scroll">
          <div className="section-header">
            <h2>How It Works</h2>
            <p>Three steps from messy settlements to clear answers.</p>
          </div>
          <div className="how-panel">
            <div className="how-grid">
              <div className="how-card">
                <div className="how-num">01</div>
                <h3>Upload</h3>
                <p>Upload your marketplace orders and Route settlement data — we handle the format.</p>
              </div>
              <div className="how-card">
                <div className="how-num">02</div>
                <h3>Match & Detect</h3>
                <p>Our engine matches every order to its Route transfer and flags discrepancies automatically.</p>
              </div>
              <div className="how-card">
                <div className="how-num">03</div>
                <h3>AI Explains</h3>
                <p>Each exception gets a plain-English explanation, grounded in real TDS/GST/chargeback rules.</p>
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
        <div className="footer-inner">
          <div className="footer-brand">
            <div className="brand-icon small" /> ReconAI
          </div>
          <div className="footer-links">
            <a href="#">Privacy Policy</a>
            <a href="#">Terms of Service</a>
            <a href="#">Security</a>
            <a href="#">Contact</a>
          </div>
          <div className="footer-copy">© 2026 ReconAI — Built for Razorpay AI Buildathon</div>
        </div>
      </footer>

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
        .brand { display: flex; align-items: center; gap: 8px; }
        .brand-icon {
          width: 24px; height: 24px; border-radius: 6px;
          background: linear-gradient(135deg, #0070f3, #0059c5);
        }
        .brand-icon.small { width: 20px; height: 20px; }
        .brand-name { font-size: 22px; font-weight: 800; letter-spacing: -0.02em; }
        .nav-links { display: none; gap: 32px; }
        .nav-links a { color: #c1c6d7; text-decoration: none; transition: color 0.2s; }
        .nav-links a:hover { color: #ffffff; }
        @media (min-width: 768px) { .nav-links { display: flex; } }

        .nav-right { display: flex; align-items: center; gap: 12px; }
        .btn-logout {
          background: transparent;
          border: 1px solid #253154;
          color: #e2e8f0;
          padding: 8px 14px;
          border-radius: 10px;
          font-size: 13px;
          cursor: pointer;
          transition: all 0.15s ease;
        }
        .btn-logout:hover { background: rgba(248,113,113,0.08); border-color: #f87171; color: #f87171; }

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
        .btn-primary:hover {
          text-decoration: none !important;
          box-shadow: 0 6px 20px rgba(0,112,243,0.35);
          transform: translateY(-2px);
          background: #0059c5;
        }
        .btn-primary.lg { padding: 14px 32px; border-radius: 12px; font-size: 15px; }

        .btn-ghost {
          background: #1f2942;
          border: 1px solid #2a344e;
          color: #ffffff;
          text-decoration: none;
          padding: 10px 20px;
          border-radius: 10px;
          font-weight: 500;
          font-size: 14px;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          transition: all 0.3s ease;
        }
        .btn-ghost:hover { background: #2a344e; border-color: #414754; }
        .btn-ghost.lg { padding: 14px 32px; border-radius: 12px; font-size: 15px; }

        main { padding-top: 140px; padding-bottom: 96px; }

        .hero {
          max-width: 1280px;
          margin: 0 auto;
          padding: 0 24px 64px;
          min-height: 60vh;
          display: flex;
          flex-direction: column;
          justify-content: center;
        }
        .badge {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          margin-bottom: 24px;
          color: #aec6ff;
          font-size: 11px;
          font-weight: 700;
          letter-spacing: 0.15em;
          width: fit-content;
        }
        .badge-dot {
          width: 6px; height: 6px; border-radius: 50%;
          background: #aec6ff;
          box-shadow: 0 0 8px rgba(0,112,243,0.8);
        }
        .hero-title {
          font-size: 80px;
          font-weight: 800;
          line-height: 0.9;
          letter-spacing: -0.04em;
          margin: 0 0 24px 0;
        }
        @media (min-width: 768px) { .hero-title { font-size: 120px; } }
        .hero-tagline {
          font-size: 24px;
          font-weight: 600;
          line-height: 1.2;
          max-width: 720px;
          margin: 0 0 40px 0;
        }
        @media (min-width: 768px) { .hero-tagline { font-size: 32px; } }
        .hero-subtext {
          font-size: 18px;
          line-height: 28px;
          color: #c1c6d7;
          max-width: 640px;
          margin: 0 0 48px 0;
        }
        .hero-ctas { display: flex; flex-direction: column; gap: 16px; width: fit-content; }
        @media (min-width: 640px) { .hero-ctas { flex-direction: row; } }

        .hero-card-wrap { margin-top: 80px; max-width: 720px; }
        .hero-card {
          background: #101b33;
          border: 1px solid #1f2942;
          border-radius: 16px;
          padding: 32px;
          box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1);
        }
        .hero-card-top {
          display: flex;
          justify-content: space-between;
          align-items: flex-end;
          margin-bottom: 24px;
        }
        .label-caps {
          font-size: 12px;
          letter-spacing: 0.15em;
          font-weight: 600;
          color: #c1c6d7;
          margin: 0 0 8px 0;
        }
        .label-caps.small { font-size: 10px; color: rgba(174,198,255,0.8); margin-top: 8px; }
        .hero-card-title { font-size: 24px; font-weight: 600; margin: 0; }
        .hero-card-stat { text-align: right; }
        .stat-num { font-size: 56px; font-weight: 700; color: #aec6ff; line-height: 1; }
        .progress-track {
          height: 6px;
          width: 100%;
          background: #2a344e;
          border-radius: 999px;
          overflow: hidden;
        }
        .progress-fill {
          height: 100%;
          background: #aec6ff;
          box-shadow: 0 0 10px rgba(0,112,243,0.3);
        }

        .section-header { text-align: center; margin-bottom: 64px; padding: 0 24px; }
        .section-header h2 {
          font-size: 32px;
          font-weight: 700;
          letter-spacing: -0.01em;
          margin: 0 0 16px 0;
        }
        .section-header p { color: #c1c6d7; font-size: 18px; max-width: 640px; margin: 0 auto; }

        .how-section { margin-bottom: 96px; }
        .how-panel { max-width: 1280px; margin: 0 auto; padding: 0 24px; }
        .how-grid { display: grid; grid-template-columns: 1fr; gap: 24px; }
        @media (min-width: 768px) { .how-grid { grid-template-columns: repeat(3, 1fr); } }
        .how-card {
          background: #101b33;
          border: 1px solid #1f2942;
          border-radius: 16px;
          padding: 32px;
        }
        .how-num {
          font-size: 14px;
          font-weight: 700;
          color: #aec6ff;
          margin-bottom: 16px;
        }
        .how-card h3 { font-size: 20px; font-weight: 700; margin: 0 0 12px 0; }
        .how-card p { color: #c1c6d7; font-size: 15px; line-height: 1.6; margin: 0; }

        .pain-section { margin-bottom: 96px; }

        .carousel-wrap { position: relative; overflow: hidden; padding: 32px 0; }
        .fade-edge {
          position: absolute;
          top: 0; bottom: 0;
          width: 128px;
          z-index: 10;
          pointer-events: none;
        }
        .fade-edge.left { left: 0; background: linear-gradient(to right, #07122a, transparent); }
        .fade-edge.right { right: 0; background: linear-gradient(to left, #07122a, transparent); }

        .carousel-track {
          display: flex;
          width: max-content;
          gap: 24px;
          padding: 0 24px;
          animation: scroll 45s linear infinite;
        }
        .carousel-track:hover { animation-play-state: paused; }
        @keyframes scroll {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }

        .pain-card {
          width: 340px;
          flex-shrink: 0;
          background: #101b33;
          border: 1px solid #1f2942;
          border-radius: 16px;
          padding: 28px;
          text-decoration: none;
          color: inherit;
          display: block;
          transition: border-color 0.2s;
        }
        .pain-card:hover { border-color: rgba(0,112,243,0.3); }
        .pain-card-head { display: flex; align-items: center; gap: 12px; margin-bottom: 20px; }
        .pain-icon {
          width: 40px; height: 40px;
          border-radius: 50%;
          background: #1f2942;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 18px;
        }
        .pain-source { font-weight: 600; margin: 0; font-size: 15px; }
        .pain-domain { color: #c1c6d7; font-size: 13px; margin: 2px 0 0 0; }
        .pain-quote { color: #c1c6d7; font-style: italic; font-size: 14px; line-height: 1.6; margin: 0 0 16px 0; }
        .pain-link { color: #aec6ff; font-size: 13px; margin: 0; }

        .final-cta { max-width: 1280px; margin: 0 auto; padding: 0 24px; }
        .final-cta-panel {
          background: #101b33;
          border: 1px solid #1f2942;
          border-radius: 24px;
          padding: 64px 32px;
          text-align: center;
        }
        .final-cta-panel h2 { font-size: 32px; margin: 0 0 16px 0; letter-spacing: -0.01em; }
        @media (min-width: 768px) { .final-cta-panel h2 { font-size: 40px; } }
        .final-cta-panel p { color: #c1c6d7; font-size: 18px; margin: 0 0 32px 0; }

        .footer {
          background: #030d25;
          border-top: 1px solid #151f37;
          padding: 48px 24px;
        }
        .footer-inner {
          max-width: 1280px;
          margin: 0 auto;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 32px;
        }
        @media (min-width: 768px) { .footer-inner { flex-direction: row; justify-content: space-between; } }
        .footer-brand { display: flex; align-items: center; gap: 8px; font-weight: 700; font-size: 18px; }
        .footer-links { display: flex; flex-wrap: wrap; justify-content: center; gap: 32px; }
        .footer-links a { color: #c1c6d7; text-decoration: none; font-size: 14px; }
        .footer-links a:hover { color: #ffffff; }
        .footer-copy { color: #c1c6d7; font-size: 14px; text-align: center; }

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