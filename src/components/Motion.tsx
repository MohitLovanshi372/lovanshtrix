import React, { useEffect, useRef, useState } from 'react';

const prefersReducedMotion = (): boolean =>
  typeof window !== 'undefined' &&
  typeof window.matchMedia === 'function' &&
  window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/** Headline whose words rise and un-blur one after another. Text stays one readable string for screen readers. */
export const AnimatedHeadline: React.FC<{ text: string; className?: string; startDelay?: number }> = ({
  text,
  className = '',
  startDelay = 120,
}) => (
  <span className={className} aria-label={text}>
    {text.split(' ').map((word, i) => (
      <span
        key={`${word}-${i}`}
        aria-hidden="true"
        className="lx-word inline-block mr-[0.28em]"
        style={{ animationDelay: `${startDelay + i * 110}ms` }}
      >
        {word}
      </span>
    ))}
  </span>
);

/** Types and erases a rotating list of phrases. Shows the first phrase statically with reduced motion. */
export const Typewriter: React.FC<{ phrases: string[]; className?: string }> = ({ phrases, className = '' }) => {
  const [idx, setIdx] = useState(0);
  const [len, setLen] = useState(0);
  const [deleting, setDeleting] = useState(false);
  const reduced = useRef(prefersReducedMotion()).current;

  useEffect(() => {
    if (reduced || phrases.length === 0) return;
    const full = phrases[idx];
    let delay = deleting ? 35 : 70;
    if (!deleting && len === full.length) delay = 1600;
    if (deleting && len === 0) delay = 350;
    const t = window.setTimeout(() => {
      if (!deleting && len === full.length) setDeleting(true);
      else if (deleting && len === 0) {
        setDeleting(false);
        setIdx((idx + 1) % phrases.length);
      } else setLen(len + (deleting ? -1 : 1));
    }, delay);
    return () => window.clearTimeout(t);
  }, [reduced, phrases, idx, len, deleting]);

  if (reduced || phrases.length === 0) {
    return <span className={className}>{phrases[0] ?? ''}</span>;
  }
  return (
    <span className={className}>
      <span className="sr-only">{phrases.join(', ')}</span>
      <span aria-hidden="true">
        {phrases[idx].slice(0, len)}
        <span className="lx-caret" />
      </span>
    </span>
  );
};

/** Wraps children in a 3D perspective tilt that follows the pointer (fine pointers only). */
export const Tilt: React.FC<{
  children: React.ReactNode;
  className?: string;
  max?: number;
  as?: 'div';
}> = ({ children, className = '', max = 8 }) => {
  const ref = useRef<HTMLDivElement | null>(null);
  const enabled = useRef(
    typeof window !== 'undefined' &&
      typeof window.matchMedia === 'function' &&
      window.matchMedia('(pointer: fine)').matches &&
      !prefersReducedMotion()
  ).current;

  const onMove = (e: React.PointerEvent<HTMLDivElement>) => {
    const el = ref.current;
    if (!el || !enabled) return;
    const r = el.getBoundingClientRect();
    const px = (e.clientX - r.left) / r.width - 0.5;
    const py = (e.clientY - r.top) / r.height - 0.5;
    el.style.setProperty('--rx', `${(-py * max).toFixed(2)}deg`);
    el.style.setProperty('--ry', `${(px * max).toFixed(2)}deg`);
    el.style.setProperty('--tx', `${(px * 10).toFixed(1)}px`);
    el.style.setProperty('--ty', `${(py * 10).toFixed(1)}px`);
  };
  const reset = () => {
    const el = ref.current;
    if (!el) return;
    ['--rx', '--ry', '--tx', '--ty'].forEach((v) => el.style.setProperty(v, '0'));
  };

  return (
    <div className={`lx-tilt-wrap ${className}`} onPointerMove={onMove} onPointerLeave={reset}>
      <div ref={ref} className="lx-tilt">
        {children}
      </div>
    </div>
  );
};

/**
 * Fixed premium background: soft blue/violet glow layers and a fine grid that drift at different
 * speeds while scrolling (parallax). Also drives a thin scroll-progress bar. One rAF-throttled
 * scroll listener writes CSS variables; no React re-render per scroll event.
 */
export const ScrollBackdrop: React.FC = () => {
  useEffect(() => {
    const root = document.documentElement;
    let ticking = false;
    const update = () => {
      ticking = false;
      const y = window.scrollY;
      const max = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
      root.style.setProperty('--sy', String(Math.round(y)));
      root.style.setProperty('--sp', (Math.min(1, y / max)).toFixed(4));
    };
    const onScroll = () => {
      if (!ticking) {
        ticking = true;
        window.requestAnimationFrame(update);
      }
    };
    update();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
    };
  }, []);

  return (
    <>
      <div className="lx-progress" aria-hidden="true" />
      <div className="lx-backdrop" aria-hidden="true">
        <div className="lx-grid" />
        <div className="lx-blob lx-blob-a" />
        <div className="lx-blob lx-blob-b" />
        <div className="lx-blob lx-blob-c" />
      </div>
    </>
  );
};
