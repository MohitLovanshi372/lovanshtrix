import React, { useEffect, useState } from 'react';

const SEEN_KEY = 'lx_intro_seen';

const safeGet = (): boolean => {
  try {
    return window.sessionStorage.getItem(SEEN_KEY) === '1';
  } catch {
    return false;
  }
};
const safeSet = () => {
  try {
    window.sessionStorage.setItem(SEEN_KEY, '1');
  } catch {
    /* storage can be unavailable (private mode); the intro simply shows again next load */
  }
};

/**
 * Brand intro shown once per browser session on the home page: animated logo, letter-by-letter
 * wordmark, tagline and a progress line, then the curtain slides up. Skippable, never blocks
 * for more than ~3 seconds, and skipped entirely for reduced-motion users.
 */
export const IntroSplash: React.FC<{ enabled: boolean }> = ({ enabled }) => {
  const [phase, setPhase] = useState<'show' | 'leave' | 'done'>(() => {
    if (!enabled || typeof window === 'undefined') return 'done';
    const reduce =
      typeof window.matchMedia === 'function' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    return reduce || safeGet() ? 'done' : 'show';
  });

  useEffect(() => {
    if (phase !== 'show') return;
    document.body.style.overflow = 'hidden';
    const t1 = window.setTimeout(() => setPhase('leave'), 2900);
    return () => {
      window.clearTimeout(t1);
    };
  }, [phase]);

  useEffect(() => {
    if (phase === 'leave') {
      const t = window.setTimeout(() => {
        setPhase('done');
      }, 900);
      return () => window.clearTimeout(t);
    }
    if (phase === 'done') {
      document.body.style.overflow = '';
      safeSet();
    }
  }, [phase]);

  useEffect(() => () => {
    document.body.style.overflow = '';
  }, []);

  if (phase === 'done') return null;

  const word = 'LOVANSTRIX'.split('');
  return (
    <div
      role="dialog"
      aria-label="LOVANSTRIX intro"
      className={`lx-intro ${phase === 'leave' ? 'lx-intro-leave' : ''}`}
    >
      <div className="lx-intro-glow lx-intro-glow-a" aria-hidden="true" />
      <div className="lx-intro-glow lx-intro-glow-b" aria-hidden="true" />

      <div className="relative z-10 flex flex-col items-center px-6 text-center">
        <svg width="96" height="96" viewBox="0 0 36 36" fill="none" aria-hidden="true" className="lx-intro-logo">
          <defs>
            <linearGradient id="intro-g" x1="4" y1="4" x2="32" y2="32" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#7fb0ff" />
              <stop offset="100%" stopColor="#a78bfa" />
            </linearGradient>
          </defs>
          <path className="lx-draw" d="M18 2.5L31.5 10.25V25.75L18 33.5L4.5 25.75V10.25L18 2.5Z" stroke="url(#intro-g)" strokeWidth="1.6" />
          <path className="lx-draw lx-draw-2" d="M12 10.5V22.5H23.5" stroke="#fff" strokeWidth="2.2" strokeLinecap="square" />
          <path className="lx-fade-in" d="M18 7.5L26.5 12.5V22.5L18 17.5V7.5Z" fill="url(#intro-g)" fillOpacity="0.95" />
          <circle className="lx-fade-in" cx="18" cy="17.5" r="2" fill="#fff" />
        </svg>

        <h1 className="mt-7 font-display text-4xl sm:text-6xl font-bold tracking-[0.18em] text-white" aria-label="LOVANSTRIX">
          {word.map((ch, i) => (
            <span
              key={i}
              aria-hidden="true"
              className="lx-intro-letter inline-block"
              style={{ animationDelay: `${500 + i * 70}ms` }}
            >
              {ch}
            </span>
          ))}
        </h1>
        <p className="mt-4 text-base sm:text-lg text-[#c9dcff] lx-intro-tag">Ideas Into Innovation.</p>

        <div className="mt-10 h-[3px] w-56 overflow-hidden rounded-full bg-white/15" aria-hidden="true">
          <div className="lx-intro-bar h-full rounded-full bg-gradient-to-r from-[#5b8cff] to-[#a78bfa]" />
        </div>

        <button
          type="button"
          onClick={() => setPhase('leave')}
          className="mt-8 rounded-full border border-white/30 px-5 py-2 text-xs font-semibold text-white/90 hover:bg-white/10 focus:outline-none focus-visible:ring-2 focus-visible:ring-white"
        >
          Skip intro
        </button>
      </div>
    </div>
  );
};
