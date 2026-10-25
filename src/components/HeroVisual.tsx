import React from 'react';

/**
 * Abstract blue-violet isometric "idea → product" illustration.
 * Pure SVG + CSS (no WebGL, no external assets): fast on mobile, respects
 * prefers-reduced-motion via the global rule in index.css, and is decorative
 * (aria-hidden) so screen readers skip it.
 */

interface CubeProps {
  cx: number;
  cy: number;
  s: number;
  top: string;
  left: string;
  right: string;
  delay?: string;
  float?: boolean;
}

const Cube: React.FC<CubeProps> = ({ cx, cy, s, top, left, right, delay = '0s', float = true }) => {
  const w = s * 0.866;
  const h = s * 0.5;
  return (
    <g className={float ? 'lx-float' : undefined} style={{ animationDelay: delay }}>
      <polygon points={`${cx},${cy - s} ${cx + w},${cy - s + h} ${cx},${cy - s + 2 * h} ${cx - w},${cy - s + h}`} fill={top} />
      <polygon points={`${cx - w},${cy - s + h} ${cx},${cy - s + 2 * h} ${cx},${cy + s} ${cx - w},${cy + s - h}`} fill={left} />
      <polygon points={`${cx},${cy - s + 2 * h} ${cx + w},${cy - s + h} ${cx + w},${cy + s - h} ${cx},${cy + s}`} fill={right} />
    </g>
  );
};

interface ChipProps {
  x: number;
  y: number;
  label: string;
  delay: string;
  accent: string;
}

const Chip: React.FC<ChipProps> = ({ x, y, label, delay, accent }) => (
  <g className="lx-float" style={{ animationDelay: delay }}>
    <rect x={x} y={y} width={78} height={34} rx={17} fill="#fff" stroke="#dbe7ff" filter="url(#hv-shadow)" />
    <circle cx={x + 17} cy={y + 17} r={5} fill={accent} />
    <text x={x + 30} y={y + 21.5} fontSize="12" fontWeight="600" fill="#102B59" fontFamily="Outfit, sans-serif">
      {label}
    </text>
  </g>
);

export const HeroVisual: React.FC = () => (
  <div className="relative w-full" aria-hidden="true">
    <div className="absolute -inset-6 rounded-[2.5rem] bg-gradient-to-br from-[#eaf1ff] via-white to-[#f1ecff]" />
    <div className="absolute top-8 right-8 w-52 h-52 rounded-full bg-[#155EEF]/15 blur-3xl" />
    <div className="absolute bottom-6 left-8 w-48 h-48 rounded-full bg-[#7C5CFA]/20 blur-3xl" />

    <svg viewBox="0 0 520 470" className="relative w-full h-auto max-h-[520px]" role="presentation" focusable="false">
      <defs>
        <linearGradient id="hv-top" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#8fb4ff" />
          <stop offset="100%" stopColor="#c9b8ff" />
        </linearGradient>
        <linearGradient id="hv-left" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#155EEF" />
          <stop offset="100%" stopColor="#0f3fae" />
        </linearGradient>
        <linearGradient id="hv-right" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#7C5CFA" />
          <stop offset="100%" stopColor="#4b2fd0" />
        </linearGradient>
        <linearGradient id="hv-slab" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#ffffff" />
          <stop offset="100%" stopColor="#e6eeff" />
        </linearGradient>
        <filter id="hv-shadow" x="-30%" y="-30%" width="160%" height="180%">
          <feDropShadow dx="0" dy="8" stdDeviation="8" floodColor="#102B59" floodOpacity="0.14" />
        </filter>
      </defs>

      {/* Stacked glass slabs (layers of a product) */}
      {[
        { y: 68, o: 0.55 },
        { y: 34, o: 0.8 },
        { y: 0, o: 1 },
      ].map((l, i) => (
        <g key={i} opacity={l.o} filter={i === 2 ? 'url(#hv-shadow)' : undefined}>
          <polygon points={`260,${230 + l.y} 440,${300 + l.y} 260,${370 + l.y} 80,${300 + l.y}`} fill="url(#hv-slab)" stroke="#cfdcff" />
          <polygon points={`80,${300 + l.y} 260,${370 + l.y} 260,${388 + l.y} 80,${318 + l.y}`} fill="#b9ccf7" />
          <polygon points={`260,${370 + l.y} 440,${300 + l.y} 440,${318 + l.y} 260,${388 + l.y}`} fill="#c9bdf5" />
        </g>
      ))}

      {/* Grid lines on top slab */}
      <g stroke="#cfdcff" strokeWidth="1" opacity="0.9">
        <line x1="170" y1="265" x2="350" y2="335" />
        <line x1="350" y1="265" x2="170" y2="335" />
        <line x1="215" y1="247" x2="395" y2="317" />
        <line x1="305" y1="247" x2="125" y2="317" />
      </g>

      {/* Connector dots */}
      <g fill="none" stroke="#155EEF" strokeOpacity="0.35" strokeDasharray="3 6" strokeWidth="1.5">
        <path d="M100 130 C 150 150, 190 140, 220 170" />
        <path d="M430 110 C 390 140, 340 130, 305 165" />
      </g>

      {/* Hero cube */}
      <Cube cx={260} cy={185} s={88} top="url(#hv-top)" left="url(#hv-left)" right="url(#hv-right)" delay="0s" />

      {/* Orbiting small cubes */}
      <Cube cx={92} cy={118} s={26} top="#a9c5ff" left="#155EEF" right="#7C5CFA" delay="-1.2s" />
      <Cube cx={438} cy={92} s={20} top="#d4c8ff" left="#7C5CFA" right="#4b2fd0" delay="-2.6s" />
      <Cube cx={420} cy={236} s={16} top="#a9c5ff" left="#155EEF" right="#0f3fae" delay="-3.8s" />

      {/* Floating capability chips */}
      <Chip x={30} y={214} label="UI/UX" delay="-0.8s" accent="#155EEF" />
      <Chip x={402} y={160} label="API" delay="-2s" accent="#7C5CFA" />
      <Chip x={210} y={40} label="AI" delay="-3.2s" accent="#155EEF" />
    </svg>
  </div>
);
