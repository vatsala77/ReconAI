'use client';
import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import ThemeToggle from '@/components/ThemeToggle';

export default function SignupPage() {
  const router = useRouter();
  const [companyName, setCompanyName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ companyName, email, password }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Signup failed');
        setLoading(false);
        return;
      }
      const result = await signIn('credentials', { email, password, redirect: false });
      if (result?.error) {
        setError('Signup succeeded but login failed. Try logging in manually.');
        setLoading(false);
        return;
      }
      router.push('/dashboard');
    } catch (err) {
      setError('Something went wrong');
      setLoading(false);
    }
  }

  return (
    <>
      <div className="ambient-glow top left" />
      <div className="ambient-glow bottom right" />

      <nav className="navbar">
        <div className="navbar-inner">
          <Link href="/" className="brand">
            <div className="brand-icon" />
            <span className="brand-name">ReconAI</span>
          </Link>
          <ThemeToggle />
        </div>
      </nav>

      <main className="auth-page">
        <div className="auth-card">
          <div className="badge">
            <span className="badge-dot" />
            GET STARTED
          </div>
          <h1>Create your ReconAI account</h1>
          <p className="subtitle">Set up your company to start reconciling Route settlements.</p>

          <form onSubmit={handleSubmit}>
            <label>Company Name</label>
            <input
              type="text"
              placeholder="Your company name"
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
              required
            />

            <label>Email</label>
            <input
              type="email"
              placeholder="you@company.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />

            <label>Password</label>
            <input
              type="password"
              placeholder="At least 8 characters"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={8}
            />

            {error && <p className="error-text">{error}</p>}

            <button type="submit" disabled={loading} className="btn-primary lg">
              {loading ? 'Creating account…' : 'Sign up →'}
            </button>
          </form>

          <p className="switch-link">
            Already have an account? <Link href="/login">Log in</Link>
          </p>
        </div>
      </main>

      <style jsx>{`
        .ambient-glow {
          position: absolute;
          width: 800px;
          height: 800px;
          background: radial-gradient(circle, var(--accent-soft) 0%, transparent 60%);
          border-radius: 50%;
          z-index: -1;
          pointer-events: none;
        }
        .ambient-glow.top { top: -20%; left: -10%; }
        .ambient-glow.bottom { bottom: 10%; right: -10%; }

        :global(.ambient-glow) {
          transition: opacity 0.3s;
        }
        :global(html[data-theme="light"]) .ambient-glow {
          display: none;
        }

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
        .navbar-inner { display: flex; align-items: center; justify-content: space-between; padding: 16px 24px; max-width: 1280px; margin: 0 auto; }
        .brand { display: flex; align-items: center; gap: 8px; text-decoration: none; }
        .brand-icon { width: 24px; height: 24px; border-radius: 6px; background: linear-gradient(135deg, #0070f3, #0059c5); }
        .brand-name { font-size: 22px; font-weight: 800; color: var(--text-primary); letter-spacing: -0.02em; }

        .auth-page {
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 140px 24px 60px;
        }

        .auth-card {
          background: var(--bg-card);
          border: 1px solid var(--border-card);
          border-radius: 24px;
          padding: 48px;
          max-width: 440px;
          width: 100%;
          box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1);
          transition: background 0.2s, border-color 0.2s;
        }
        :global(html[data-theme="light"]) .auth-card {
          box-shadow: 0 4px 24px rgba(0,0,0,0.08);
        }

        .badge {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          margin-bottom: 20px;
          color: var(--badge-text);
          font-size: 11px;
          font-weight: 700;
          letter-spacing: 0.15em;
        }
        .badge-dot {
          width: 6px; height: 6px; border-radius: 50%;
          background: var(--badge-dot);
          box-shadow: 0 0 8px var(--badge-dot-glow);
        }

        h1 { color: var(--text-primary); font-size: 32px; margin: 0 0 12px 0; font-weight: 800; letter-spacing: -0.01em; }
        .subtitle { color: var(--text-secondary); font-size: 16px; line-height: 1.6; margin: 0 0 28px 0; }

        form { display: flex; flex-direction: column; }
        label { display: block; color: var(--text-primary); font-size: 14px; font-weight: 500; margin-bottom: 8px; margin-top: 20px; }
        label:first-of-type { margin-top: 0; }

        input {
          width: 100%;
          padding: 12px 16px;
          background: var(--bg-card-elevated);
          border: 1px solid var(--border-card);
          border-radius: 10px;
          color: var(--text-primary);
          font-size: 14px;
          transition: border-color 0.2s, background 0.2s;
        }
        input:focus {
          outline: none;
          border-color: var(--accent);
          box-shadow: 0 0 0 3px rgba(0,112,243,0.15);
        }
        input::placeholder { color: var(--text-muted); }

        .error-text {
          color: #f87171;
          font-size: 13px;
          margin: 16px 0 0 0;
          padding: 10px 14px;
          background: rgba(248,113,113,0.08);
          border: 1px solid rgba(248,113,113,0.2);
          border-radius: 8px;
        }

        .btn-primary {
          background: #0070f3;
          box-shadow: 0 4px 14px rgba(0,112,243,0.2);
          color: white;
          text-decoration: none;
          padding: 12px 20px;
          border-radius: 12px;
          font-weight: 600;
          font-size: 15px;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          transition: all 0.3s ease;
          border: none;
          cursor: pointer;
          margin-top: 28px;
          width: 100%;
        }
        .btn-primary:hover:not(:disabled) { box-shadow: 0 6px 20px rgba(0,112,243,0.35); transform: translateY(-2px); background: #0059c5; }
        .btn-primary:disabled { opacity: 0.5; cursor: not-allowed; }

        .switch-link {
          margin-top: 24px;
          font-size: 14px;
          color: var(--text-secondary);
          text-align: center;
        }
        .switch-link a { color: var(--accent); text-decoration: none; font-weight: 500; }
        .switch-link a:hover { text-decoration: underline; }
      `}</style>
    </>
  );
}