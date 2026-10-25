import React, { useState } from 'react';

interface LovanstrixMarkProps {
  isDark: boolean;
}

export const LovanstrixMark: React.FC<LovanstrixMarkProps> = ({ isDark }) => {
  return (
    <span className="inline-flex items-center gap-3 whitespace-nowrap shrink-0 select-none">
      <svg
        width="30"
        height="30"
        viewBox="0 0 36 36"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
        className="shrink-0"
      >
        <defs>
          <linearGradient id="lovanstrix-prism-a" x1="4" y1="4" x2="32" y2="32" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#155EEF" />
            <stop offset="55%" stopColor="#4f5bf0" />
            <stop offset="100%" stopColor="#7C5CFA" />
          </linearGradient>
          <linearGradient id="lovanstrix-prism-b" x1="30" y1="6" x2="8" y2="30" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#60A5FA" />
            <stop offset="100%" stopColor="#4F46E5" stopOpacity="0.35" />
          </linearGradient>
        </defs>
        {/* Outer isometric hexagon frame */}
        <path
          d="M18 2.5L31.5 10.25V25.75L18 33.5L4.5 25.75V10.25L18 2.5Z"
          stroke="url(#lovanstrix-prism-a)"
          strokeWidth="2"
          fill="url(#lovanstrix-prism-b)"
          fillOpacity="0.16"
        />
        {/* Inner geometric L-vector ascending into an innovation prism */}
        <path
          d="M12 10.5V22.5L23.5 22.5"
          stroke="url(#lovanstrix-prism-a)"
          strokeWidth="2.6"
          strokeLinecap="square"
        />
        <path
          d="M18 7.5L26.5 12.5V22.5L18 17.5V7.5Z"
          fill="url(#lovanstrix-prism-a)"
          fillOpacity="0.88"
        />
        <circle cx="18" cy="17.5" r="2" fill="#F8FAFC" />
      </svg>
      <span
        className={`font-display text-lg font-bold tracking-tight ${
          isDark ? 'text-white' : 'text-slate-950'
        }`}
      >
        LOVANSTRIX
      </span>
    </span>
  );
};

interface HeroIllustrationProps {
  isDark: boolean;
  onSelectPhase?: (phaseIndex: number) => void;
}

const INNOVATION_NODES = [
  {
    step: '01',
    label: 'Discover',
    caption: 'Clarify problem scope, target users, and practical constraints.',
    architecture: 'Requirements · User Journey Map · Feasibility Check',
    cx: 95,
    cy: 95,
  },
  {
    step: '02',
    label: 'Plan',
    caption: 'Define data schemas, API boundaries, and iterative milestones.',
    architecture: 'System Blueprint · Database Schema · Sprint Plan',
    cx: 240,
    cy: 75,
  },
  {
    step: '03',
    label: 'Design',
    caption: 'Craft accessible interfaces, responsive grids, and clear user flows.',
    architecture: 'Wireframes · Component Tokens · WCAG AA Contrast',
    cx: 385,
    cy: 115,
  },
  {
    step: '04',
    label: 'Develop',
    caption: 'Build clean TypeScript frontends, validated APIs, and AI integrations.',
    architecture: 'React + TypeScript · Node.js API · Server-Side AI',
    cx: 355,
    cy: 230,
  },
  {
    step: '05',
    label: 'Test',
    caption: 'Verify form validation, cross-device responsiveness, and edge states.',
    architecture: 'Input Validation · Device Audit · Error Handling',
    cx: 205,
    cy: 250,
  },
  {
    step: '06',
    label: 'Launch',
    caption: 'Deploy to cloud infrastructure with clean documentation and handover.',
    architecture: 'Cloud Deployment · SSL & SEO · Ongoing Support',
    cx: 85,
    cy: 205,
  },
];

export const HeroGeometricIllustration: React.FC<HeroIllustrationProps> = ({ isDark }) => {
  const [activeNode, setActiveNode] = useState<number>(3); // Default to 'Develop'
  const current = INNOVATION_NODES[activeNode];

  return (
    <div
      className={`relative h-full w-full rounded-2xl border p-6 flex flex-col justify-between transition-colors ${
        isDark
          ? 'bg-[#090F21]/90 border-slate-800/90'
          : 'bg-slate-900 border-slate-800 text-white'
      }`}
    >
      {/* Top header inside illustration frame */}
      <div className="flex items-center justify-between gap-4 border-b border-slate-800/80 pb-4">
        <div>
          <p className="text-xs font-medium text-blue-400">Interactive Architecture Blueprint</p>
          <h3 className="font-display text-base font-semibold text-white mt-0.5">
            Ideas Into Innovation Pipeline
          </h3>
        </div>
        <span className="text-xs font-mono text-slate-400 tabular-nums">
          Stage {current.step} / 06
        </span>
      </div>

      {/* Interactive SVG Geometric Canvas */}
      <div className="my-4 relative flex items-center justify-center">
        <svg
          viewBox="0 0 480 310"
          className="w-full h-auto max-h-[260px] select-none"
          role="img"
          aria-label="Interactive geometric illustration showing Lovanstrix engineering stages from Discover to Launch"
        >
          <defs>
            <linearGradient id="hero-grid-grad" x1="0" y1="0" x2="480" y2="310" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#3B82F6" stopOpacity="0.22" />
              <stop offset="50%" stopColor="#6366F1" stopOpacity="0.12" />
              <stop offset="100%" stopColor="#8B5CF6" stopOpacity="0.22" />
            </linearGradient>
            <linearGradient id="hero-active-path" x1="60" y1="60" x2="420" y2="260" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#3B82F6" />
              <stop offset="50%" stopColor="#6366F1" />
              <stop offset="100%" stopColor="#8B5CF6" />
            </linearGradient>
            <radialGradient id="hero-core-glow" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#3B82F6" stopOpacity="0.32" />
              <stop offset="65%" stopColor="#7C3AED" stopOpacity="0.08" />
              <stop offset="100%" stopColor="#050814" stopOpacity="0" />
            </radialGradient>
          </defs>

          {/* Subtle ambient radial light */}
          <circle cx="240" cy="160" r="135" fill="url(#hero-core-glow)" />

          {/* Architectural perspective rings */}
          <ellipse
            cx="240"
            cy="165"
            rx="175"
            ry="95"
            stroke="url(#hero-grid-grad)"
            strokeWidth="1"
            strokeDasharray="4 4"
            fill="none"
          />
          <ellipse
            cx="240"
            cy="165"
            rx="115"
            ry="62"
            stroke="url(#hero-grid-grad)"
            strokeWidth="1"
            fill="none"
          />

          {/* Central Isometric Core Prism */}
          <g transform="translate(240, 162)">
            <polygon
              points="0,-42 38,-20 38,22 0,44 -38,22 -38,-20"
              fill="#0F172A"
              stroke="url(#hero-active-path)"
              strokeWidth="1.75"
            />
            <polyline
              points="-38,-20 0,2 38,-20"
              fill="none"
              stroke="#60A5FA"
              strokeWidth="1.2"
              strokeOpacity="0.6"
            />
            <line
              x1="0"
              y1="2"
              x2="0"
              y2="44"
              stroke="#8B5CF6"
              strokeWidth="1.2"
              strokeOpacity="0.6"
            />
            <circle cx="0" cy="-8" r="3.5" fill="#60A5FA" />
          </g>

          {/* Connecting circuit lines between sequential nodes */}
          <polygon
            points={INNOVATION_NODES.map((n) => `${n.cx},${n.cy}`).join(' ')}
            fill="none"
            stroke="url(#hero-active-path)"
            strokeWidth="1.5"
            strokeOpacity="0.55"
          />

          {/* Spoke lines from center prism to each node */}
          {INNOVATION_NODES.map((node, idx) => {
            const isSelected = idx === activeNode;
            return (
              <line
                key={`spoke-${node.step}`}
                x1={240}
                y1={162}
                x2={node.cx}
                y2={node.cy}
                stroke={isSelected ? '#60A5FA' : '#334155'}
                strokeWidth={isSelected ? '2' : '1'}
                strokeDasharray={isSelected ? undefined : '3 3'}
              />
            );
          })}

          {/* Interactive Nodes */}
          {INNOVATION_NODES.map((node, idx) => {
            const isSelected = idx === activeNode;
            return (
              <g
                key={node.step}
                onClick={() => setActiveNode(idx)}
                className="cursor-pointer"
                role="button"
                tabIndex={0}
                aria-label={`Inspect stage ${node.step}: ${node.label}`}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    setActiveNode(idx);
                  }
                }}
              >
                {isSelected && (
                  <circle
                    cx={node.cx}
                    cy={node.cy}
                    r="24"
                    fill="#3B82F6"
                    fillOpacity="0.18"
                    stroke="#60A5FA"
                    strokeWidth="1.2"
                  />
                )}
                <circle
                  cx={node.cx}
                  cy={node.cy}
                  r={isSelected ? '15' : '12'}
                  fill={isSelected ? '#2563EB' : '#0F172A'}
                  stroke={isSelected ? '#93C5FD' : '#475569'}
                  strokeWidth="1.75"
                />
                <text
                  x={node.cx}
                  y={node.cy + 4}
                  textAnchor="middle"
                  className="text-[10px] font-mono fill-white font-medium"
                >
                  {node.step}
                </text>
                <text
                  x={node.cx}
                  y={node.cy + (node.cy > 180 ? 32 : -22)}
                  textAnchor="middle"
                  className={`text-[11px] font-medium ${
                    isSelected ? 'fill-blue-300 font-semibold' : 'fill-slate-400'
                  }`}
                >
                  {node.label}
                </text>
              </g>
            );
          })}
        </svg>
      </div>

      {/* Interactive Stage Inspector Footer */}
      <div className="border-t border-slate-800/80 pt-4">
        <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
          <span className="text-sm font-semibold text-white">
            {current.step}. {current.label} Phase
          </span>
          <span className="text-xs text-slate-400">{current.architecture}</span>
        </div>
        <p className="text-xs text-slate-300 leading-relaxed mb-3">{current.caption}</p>
        <div className="grid grid-cols-6 gap-1.5" role="tablist" aria-label="Engineering Lifecycle Stages">
          {INNOVATION_NODES.map((node, idx) => (
            <button
              key={node.step}
              type="button"
              onClick={() => setActiveNode(idx)}
              className={`py-1.5 px-2 rounded text-[11px] font-medium transition-colors whitespace-nowrap shrink-0 truncate ${
                idx === activeNode
                  ? 'bg-blue-600 text-white'
                  : 'bg-slate-800/70 text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              {node.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

interface ProjectVisualCanvasProps {
  visualType: 'webapp' | 'ai' | 'website' | 'iot';
  title: string;
}

export const ProjectVisualCanvas: React.FC<ProjectVisualCanvasProps> = ({ visualType, title }) => {
  return (
    <div className="relative w-full aspect-[16/9] bg-gradient-to-br from-[#102B59] to-[#2d2f9a] border-b border-[#e2e8f4] overflow-hidden flex items-center justify-center p-6">
      <svg
        viewBox="0 0 400 200"
        className="w-full h-full max-h-[160px]"
        role="img"
        aria-label={`Architectural schematic for ${title}`}
      >
        <defs>
          <linearGradient id={`grad-${visualType}`} x1="0" y1="0" x2="400" y2="200" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#2563EB" stopOpacity="0.85" />
            <stop offset="100%" stopColor="#7C3AED" stopOpacity="0.85" />
          </linearGradient>
        </defs>

        {/* Subtle structural grid lines */}
        <line x1="20" y1="40" x2="380" y2="40" stroke="#1E293B" strokeWidth="1" />
        <line x1="20" y1="100" x2="380" y2="100" stroke="#1E293B" strokeWidth="1" />
        <line x1="20" y1="160" x2="380" y2="160" stroke="#1E293B" strokeWidth="1" />

        {visualType === 'webapp' && (
          <g>
            <rect x="45" y="24" width="310" height="152" rx="8" fill="#0F172A" stroke="#334155" strokeWidth="1.5" />
            <line x1="45" y1="48" x2="355" y2="48" stroke="#1E293B" strokeWidth="1.5" />
            <rect x="60" y="62" width="75" height="98" rx="4" fill="#1E293B" />
            <rect x="148" y="62" width="190" height="44" rx="4" fill="url(#grad-webapp)" fillOpacity="0.22" stroke="#3B82F6" strokeWidth="1" />
            <rect x="148" y="116" width="90" height="44" rx="4" fill="#1E293B" stroke="#334155" strokeWidth="1" />
            <rect x="248" y="116" width="90" height="44" rx="4" fill="#1E293B" stroke="#334155" strokeWidth="1" />
          </g>
        )}

        {visualType === 'ai' && (
          <g>
            <rect x="45" y="68" width="84" height="64" rx="8" fill="#0F172A" stroke="#3B82F6" strokeWidth="1.5" />
            <text x="87" y="104" textAnchor="middle" className="text-[10px] font-mono fill-slate-300">
              Client Brief
            </text>
            <line x1="129" y1="100" x2="165" y2="100" stroke="#60A5FA" strokeWidth="2" />
            <polygon points="200,52 242,76 242,124 200,148 158,124 158,76" fill="url(#grad-ai)" fillOpacity="0.25" stroke="#8B5CF6" strokeWidth="1.75" />
            <text x="200" y="104" textAnchor="middle" className="text-[10px] font-mono fill-white">
              API Proxy
            </text>
            <line x1="242" y1="100" x2="275" y2="100" stroke="#8B5CF6" strokeWidth="2" />
            <rect x="275" y="68" width="84" height="64" rx="8" fill="#0F172A" stroke="#6366F1" strokeWidth="1.5" />
            <text x="317" y="104" textAnchor="middle" className="text-[10px] font-mono fill-slate-300">
              JSON Scope
            </text>
          </g>
        )}

        {visualType === 'website' && (
          <g>
            <rect x="55" y="26" width="290" height="148" rx="8" fill="#0F172A" stroke="#3B82F6" strokeWidth="1.5" />
            <rect x="75" y="46" width="150" height="16" rx="3" fill="#3B82F6" fillOpacity="0.45" />
            <rect x="75" y="70" width="210" height="10" rx="2" fill="#334155" />
            <rect x="75" y="88" width="175" height="10" rx="2" fill="#334155" />
            <rect x="75" y="116" width="76" height="36" rx="4" fill="#1E293B" stroke="#475569" strokeWidth="1" />
            <rect x="162" y="116" width="76" height="36" rx="4" fill="#1E293B" stroke="#475569" strokeWidth="1" />
            <rect x="249" y="116" width="76" height="36" rx="4" fill="#1E293B" stroke="#475569" strokeWidth="1" />
          </g>
        )}

        {visualType === 'iot' && (
          <g>
            <circle cx="105" cy="65" r="22" fill="#0F172A" stroke="#3B82F6" strokeWidth="1.5" />
            <circle cx="105" cy="135" r="22" fill="#0F172A" stroke="#3B82F6" strokeWidth="1.5" />
            <text x="105" y="69" textAnchor="middle" className="text-[9px] font-mono fill-blue-300">
              NODE 01
            </text>
            <text x="105" y="139" textAnchor="middle" className="text-[9px] font-mono fill-blue-300">
              NODE 02
            </text>
            <line x1="127" y1="65" x2="215" y2="95" stroke="#3B82F6" strokeWidth="1.5" strokeDasharray="4 3" />
            <line x1="127" y1="135" x2="215" y2="105" stroke="#3B82F6" strokeWidth="1.5" strokeDasharray="4 3" />
            <rect x="215" y="64" width="125" height="72" rx="8" fill="#0F172A" stroke="#8B5CF6" strokeWidth="1.75" />
            <polyline points="232,114 252,96 272,108 298,82 322,90" fill="none" stroke="#60A5FA" strokeWidth="2" />
          </g>
        )}
      </svg>
    </div>
  );
};
