'use client';
import { useState, useEffect } from 'react';
import { useTheme } from '@/lib/ThemeContext';

export default function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return <div className="theme-pill-toggle" style={{ width: 64, height: 34 }} />;
  }

  const isDark = theme === 'dark';

  return (
    <button
      onClick={toggleTheme}
      className="theme-pill-toggle"
      title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
      aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
    >
      <span className="pill-icons">
        {/* Sun icon */}
        <span className={`pill-icon sun ${!isDark ? 'active' : ''}`}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="5" />
            <line x1="12" y1="1" x2="12" y2="3" />
            <line x1="12" y1="21" x2="12" y2="23" />
            <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
            <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
            <line x1="1" y1="12" x2="3" y2="12" />
            <line x1="21" y1="12" x2="23" y2="12" />
            <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
            <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
          </svg>
        </span>
        {/* Moon icon */}
        <span className={`pill-icon moon ${isDark ? 'active' : ''}`}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
          </svg>
        </span>
      </span>
      <span className={`pill-thumb ${isDark ? 'dark' : ''}`} />

      <style jsx>{`
        .theme-pill-toggle {
          position: relative;
          width: 64px;
          height: 34px;
          border-radius: 999px;
          border: 2px solid #0070f3;
          cursor: pointer;
          padding: 0;
          flex-shrink: 0;
          overflow: hidden;
          transition: background 0.3s ease;
          background: var(--pill-bg);
          box-shadow: 0 2px 8px rgba(0, 112, 243, 0.25), inset 0 1px 2px rgba(0, 0, 0, 0.06);
        }

        :global(html[data-theme='dark']) .theme-pill-toggle {
          background: var(--pill-bg);
        }

        .pill-icons {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 0 8px;
          z-index: 1;
        }

        .pill-icon {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 22px;
          height: 22px;
          border-radius: 50%;
          transition: all 0.3s ease;
          opacity: 0.35;
          transform: scale(0.85);
        }

        .pill-icon.active {
          opacity: 1;
          transform: scale(1);
        }

        .pill-icon.sun {
          color: #f59e0b;
        }

        .pill-icon.sun.active {
          color: #f59e0b;
          filter: drop-shadow(0 0 4px rgba(245, 158, 11, 0.4));
        }

        .pill-icon.moon {
          color: #94a3b8;
        }

        .pill-icon.moon.active {
          color: #e2e8f0;
          filter: drop-shadow(0 0 4px rgba(148, 163, 184, 0.3));
        }

        .pill-thumb {
          position: absolute;
          top: 3px;
          left: 3px;
          width: 28px;
          height: 28px;
          border-radius: 50%;
          background: white;
          box-shadow: 0 2px 6px rgba(0, 0, 0, 0.15);
          transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          z-index: 2;
        }

        .pill-thumb.dark {
          transform: translateX(30px);
          background: #1e293b;
          box-shadow: 0 2px 6px rgba(0, 0, 0, 0.3);
        }
      `}</style>
    </button>
  );
}
