'use client';
import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setLoading(true);

    const result = await signIn('credentials', {
      email,
      password,
      redirect: false,
    });

    setLoading(false);

    if (result?.error) {
      setError('Invalid email or password');
      return;
    }

    router.push('/dashboard');
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
        </div>
      </nav>

      <main className="auth-page">
        <div className="auth-card">
          <div className="badge">
            <span className="badge-dot" />
            WELCOME BACK
          </div>
          <h1>Log in to ReconAI</h1>
          <p className="subtitle">Enter your credentials to access your company dashboard.</p>

          <form onSubmit={handleSubmit}>
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
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />

            {error && <p className="error-text">{error}</p>}

            <button type="submit" disabled={loading} className="btn-primary lg">
              {loading ? 'Logging in…' : 'Log in →'}
            </button>
          </form>

          <p className="switch-link">
            Don't have an account? <Link href="/signup">Sign up</Link>
          </p>
        </div>
      </main>

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
        .navbar-inner { display: flex; align-items: center; padding: 16px 24px; max-width: 1280px; margin: 0 auto; }
        .brand { display: flex; align-items: center; gap: 8px; text-decoration: none; }
        .brand-icon { width: 24px; height: 24px; border-radius: 6px; background: linear-gradient(135deg, #0070f3, #0059c5); }
        .brand-name { font-size: 22px; font-weight: 800; color: #ffffff; letter-spacing: -0.02em; }

        .auth-page {
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 140px 24px 60px;
        }

        .auth-card {
          background: #101b33;
          border: 1px solid #1f2942;
          border-radius: 24px;
          padding: 48px;
          max-width: 440px;
          width: 100%;
          box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1);
        }

        .badge {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          margin-bottom: 20px;
          color: #aec6ff;
          font-size: 11px;
          font-weight: 700;
          letter-spacing: 0.15em;
        }
        .badge-dot {
          width: 6px; height: 6px; border-radius: 50%;
          background: #aec6ff;
          box-shadow: 0 0 8px rgba(0,112,243,0.8);
        }

        h1 { color: #ffffff; font-size: 32px; margin: 0 0 12px 0; font-weight: 800; letter-spacing: -0.01em; }
        .subtitle { color: #c1c6d7; font-size: 16px; line-height: 1.6; margin: 0 0 28px 0; }

        form { display: flex; flex-direction: column; }
        label { display: block; color: #ffffff; font-size: 14px; font-weight: 500; margin-bottom: 8px; margin-top: 20px; }
        label:first-of-type { margin-top: 0; }

        input {
          width: 100%;
          padding: 12px 16px;
          background: #151f37;
          border: 1px solid #2a344e;
          border-radius: 10px;
          color: #ffffff;
          font-size: 14px;
          transition: border-color 0.2s;
        }
        input:focus {
          outline: none;
          border-color: #0070f3;
          box-shadow: 0 0 0 3px rgba(0,112,243,0.15);
        }
        input::placeholder { color: #6b7690; }

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
          color: #c1c6d7;
          text-align: center;
        }
        .switch-link a { color: #aec6ff; text-decoration: none; font-weight: 500; }
        .switch-link a:hover { text-decoration: underline; }
      `}</style>
    </>
  );
}