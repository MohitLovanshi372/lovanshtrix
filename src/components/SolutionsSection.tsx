import React, { useState } from 'react';
import { ArrowRight, Check, Layers, ShieldCheck, Sparkles } from 'lucide-react';
import {
  BusinessSolutionItem,
  ExplorationArea,
  INITIAL_STORE,
  SystemConfigStatus,
} from '../types/lovanstrix';

interface SolutionsSectionProps {
  solutions?: BusinessSolutionItem[];
  explorations: ExplorationArea[];
  configStatus: SystemConfigStatus;
  isDark: boolean;
  onStartQuoteWithService: (serviceTitle: string, prefillDescription?: string) => void;
}

interface ScopeResult {
  mode: string;
  summary: string;
  recommendedStack: string[];
  milestones: string[];
  honestConsiderations: string;
}

export const SolutionsSection: React.FC<SolutionsSectionProps> = ({
  solutions = INITIAL_STORE.solutions,
  explorations,
  configStatus,
  isDark,
  onStartQuoteWithService,
}) => {
  const [filterStage, setFilterStage] = useState<string>('all');
  const [projectGoal, setProjectGoal] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('Web Application Development');
  const [timeline, setTimeline] = useState<string>('4–8 Weeks');
  const [loadingScope, setLoadingScope] = useState<boolean>(false);
  const [scopeError, setScopeError] = useState<string | null>(null);
  const [scopeResult, setScopeResult] = useState<ScopeResult | null>(null);

  const filteredExplorations = explorations.filter((item) => {
    if (filterStage === 'all') return true;
    if (filterStage === 'active') return item.statusLabel === 'Active Service Track';
    if (filterStage === 'prototype') return item.statusLabel === 'Internal Prototype Stage';
    return (
      item.statusLabel === 'Concept Exploration' ||
      item.statusLabel === 'Long-Term Research Horizon'
    );
  });

  const handleGenerateScope = async (e: React.FormEvent) => {
    e.preventDefault();
    setScopeError(null);
    if (projectGoal.trim().length < 10) {
      setScopeError('Please enter at least 10 characters describing what you want to build.');
      return;
    }

    setLoadingScope(true);
    try {
      const resp = await fetch('/api/scope-estimator', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          projectGoal: projectGoal.trim(),
          category: selectedCategory,
          timeline,
        }),
      });
      const data = await resp.json();
      if (!resp.ok) {
        setScopeError(data.error || 'Could not generate project scope.');
      } else {
        setScopeResult(data);
      }
    } catch {
      setScopeError('Network error while generating project scope.');
    } finally {
      setLoadingScope(false);
    }
  };

  return (
    <div className="space-y-24">
      {/* =====================================================================
          PART 1: E-COMMERCE & CUSTOM BUSINESS SOLUTIONS (7 SOLUTIONS)
      ===================================================================== */}
      <section className="space-y-10">
        <div className="max-w-3xl">
          <p className="text-xs font-medium text-blue-400 mb-2">
            E-Commerce, Portals &amp; Custom Software Solutions
          </p>
          <h1
            className={`font-display text-3xl sm:text-4xl font-bold tracking-tight text-balance ${
              isDark ? 'text-white' : 'text-slate-950'
            }`}
          >
            Practical Digital Solutions Built Around Real Business Workflows
          </h1>
          <p
            className={`mt-4 text-base leading-relaxed ${
              isDark ? 'text-slate-300' : 'text-slate-600'
            }`}
          >
            Explore how Lovanstrix structures custom software, digital transformation portals,
            product catalogues, and AI workflows for startups, educators, and growing businesses.
            We never claim pre-packaged third-party integrations unless they are explicitly
            implemented and tested for your project.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {solutions.map((sol) => (
            <article
              key={sol.id}
              className={`rounded-2xl border p-7 sm:p-8 flex flex-col justify-between transition-colors ${
                isDark
                  ? 'bg-[#0B1224] border-slate-800 hover:border-blue-500/40'
                  : 'bg-white border-slate-200 hover:border-blue-300'
              }`}
            >
              <div>
                <div className="flex flex-wrap items-center justify-between gap-2 text-xs mb-3">
                  <span className="font-mono text-blue-400 tabular-nums">
                    Solution {sol.index} · {sol.category}
                  </span>
                  <span
                    className={`font-medium ${
                      sol.readinessStatus === 'Available for Scoping'
                        ? 'text-emerald-400'
                        : sol.readinessStatus === 'Prototype & Custom Build'
                        ? 'text-blue-400'
                        : 'text-amber-400'
                    }`}
                  >
                    {sol.readinessStatus}
                  </span>
                </div>

                <h2
                  className={`font-display text-2xl font-bold tracking-tight ${
                    isDark ? 'text-white' : 'text-slate-900'
                  }`}
                >
                  {sol.title}
                </h2>

                <p
                  className={`mt-2.5 text-sm leading-relaxed ${
                    isDark ? 'text-slate-300' : 'text-slate-600'
                  }`}
                >
                  {sol.summary}
                </p>

                {/* Use Case */}
                <div
                  className={`mt-4 rounded-xl border p-4 text-xs leading-relaxed ${
                    isDark
                      ? 'bg-[#050814] border-slate-800/80 text-slate-300'
                      : 'bg-slate-50 border-slate-200 text-slate-700'
                  }`}
                >
                  <strong className="text-blue-400">Primary Use Case: </strong>
                  {sol.useCase}
                </div>

                {/* Potential Features */}
                <div className="mt-5 pt-4 border-t border-slate-800/60">
                  <p
                    className={`text-xs font-semibold mb-2.5 ${
                      isDark ? 'text-slate-200' : 'text-slate-800'
                    }`}
                  >
                    Potential Features &amp; Modules
                  </p>
                  <ul className="space-y-2">
                    {sol.potentialFeatures.map((feat, idx) => (
                      <li
                        key={idx}
                        className={`text-xs flex items-start gap-2.5 leading-relaxed ${
                          isDark ? 'text-slate-300' : 'text-slate-600'
                        }`}
                      >
                        <Check className="w-3.5 h-3.5 text-blue-400 shrink-0 mt-0.5" />
                        <span>{feat}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Honest Integration Note & Enquiry CTA */}
              <div className="mt-6 pt-5 border-t border-slate-800/60 space-y-4">
                <p className="text-xs text-slate-400 leading-relaxed flex items-start gap-2">
                  <ShieldCheck className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
                  <span>
                    <strong className={isDark ? 'text-slate-200' : 'text-slate-700'}>
                      Integration Note:
                    </strong>{' '}
                    {sol.integrationDisclosure}
                  </span>
                </p>

                <div className="flex items-center justify-between gap-4">
                  <span className="text-xs font-mono text-slate-400">
                    Track: {sol.recommendedService}
                  </span>
                  <button
                    type="button"
                    onClick={() =>
                      onStartQuoteWithService(
                        sol.recommendedService,
                        `Solution Enquiry: ${sol.title}\nUse Case: ${sol.useCase}`
                      )
                    }
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold transition-colors whitespace-nowrap shrink-0"
                  >
                    <span>Enquire About Solution</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>

      {/* =====================================================================
          PART 2: INTERACTIVE MVP ARCHITECTURE & SCOPE PLANNER
      ===================================================================== */}
      <section
        className={`rounded-2xl border p-8 ${
          isDark
            ? 'bg-[#090F21] border-slate-800'
            : 'bg-slate-50 border-slate-200'
        }`}
      >
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          <div className="lg:col-span-5">
            <div className="flex items-center gap-2 text-xs text-blue-400 font-medium mb-2">
              <Layers className="w-4 h-4" />
              <span>Interactive Architecture Planner</span>
              <span aria-hidden="true">·</span>
              <span>
                {configStatus.geminiConfigured
                  ? 'AI-assisted project planning'
                  : 'Guided project planning'}
              </span>
            </div>
            <h2
              className={`font-display text-2xl font-bold tracking-tight text-balance ${
                isDark ? 'text-white' : 'text-slate-900'
              }`}
            >
              Structure Your Idea Into Technical Milestones
            </h2>
            <p
              className={`mt-3 text-sm leading-relaxed ${
                isDark ? 'text-slate-300' : 'text-slate-600'
              }`}
            >
              Test how Lovanstrix scopes early-stage software ideas. Describe your objective below
              to generate a suggested technology stack and 4-phase delivery roadmap, then transfer
              it directly into a project quote request.
            </p>

            <form onSubmit={handleGenerateScope} className="mt-6 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label
                    htmlFor="scope-category"
                    className={`block text-xs font-medium mb-1.5 ${
                      isDark ? 'text-slate-300' : 'text-slate-700'
                    }`}
                  >
                    Primary Service Track
                  </label>
                  <select
                    id="scope-category"
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className={`w-full rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      isDark
                        ? 'bg-[#050814] border-slate-700 text-white'
                        : 'bg-white border-slate-300 text-slate-900'
                    }`}
                  >
                    <option value="Website Design and Development">
                      Website Design and Development
                    </option>
                    <option value="Business Websites and Landing Pages">
                      Business Websites and Landing Pages
                    </option>
                    <option value="Web Application Development">
                      Web Application Development
                    </option>
                    <option value="E-commerce Website Development">
                      E-commerce Website Development
                    </option>
                    <option value="AI Chatbots and AI Integration">
                      AI Chatbots and AI Integration
                    </option>
                    <option value="UI/UX Design">UI/UX Design</option>
                    <option value="Backend and API Development">
                      Backend and API Development
                    </option>
                    <option value="Custom Software Solutions">
                      Custom Software Solutions
                    </option>
                  </select>
                </div>

                <div>
                  <label
                    htmlFor="scope-timeline"
                    className={`block text-xs font-medium mb-1.5 ${
                      isDark ? 'text-slate-300' : 'text-slate-700'
                    }`}
                  >
                    Target Timeline
                  </label>
                  <select
                    id="scope-timeline"
                    value={timeline}
                    onChange={(e) => setTimeline(e.target.value)}
                    className={`w-full rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      isDark
                        ? 'bg-[#050814] border-slate-700 text-white'
                        : 'bg-white border-slate-300 text-slate-900'
                    }`}
                  >
                    <option value="2–4 Weeks">2–4 Weeks</option>
                    <option value="4–8 Weeks">4–8 Weeks</option>
                    <option value="2–3 Months">2–3 Months</option>
                    <option value="Flexible / Phased">Flexible / Phased</option>
                  </select>
                </div>
              </div>

              <div>
                <label
                  htmlFor="scope-goal"
                  className={`block text-xs font-medium mb-1.5 ${
                    isDark ? 'text-slate-300' : 'text-slate-700'
                  }`}
                >
                  Brief Project Idea
                </label>
                <textarea
                  id="scope-goal"
                  rows={3}
                  value={projectGoal}
                  onChange={(e) => setProjectGoal(e.target.value)}
                  placeholder="Example: A web portal for a local training institute where students can view courses, submit enquiries, and administrators can manage schedules."
                  className={`w-full rounded-lg border px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    isDark
                      ? 'bg-[#050814] border-slate-700 text-white placeholder:text-slate-500'
                      : 'bg-white border-slate-300 text-slate-900 placeholder:text-slate-400'
                  }`}
                />
              </div>

              {scopeError && (
                <p className="text-xs text-rose-400 font-medium" role="alert">
                  {scopeError}
                </p>
              )}

              <div className="flex flex-wrap items-center gap-3">
                <button
                  type="submit"
                  disabled={loadingScope}
                  className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-blue-600 hover:bg-blue-500 disabled:opacity-60 text-white text-xs font-semibold transition-colors whitespace-nowrap shrink-0"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>{loadingScope ? 'Structuring Scope...' : 'Generate Technical Scope'}</span>
                </button>
                <button
                  type="button"
                  onClick={() =>
                    setProjectGoal(
                      'We need a responsive booking and client enquiry web application with an admin dashboard to track incoming requests.'
                    )
                  }
                  className={`text-xs underline underline-offset-4 ${
                    isDark ? 'text-slate-400 hover:text-white' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Load sample brief
                </button>
              </div>
            </form>
          </div>

          <div className="lg:col-span-7">
            <div
              className={`rounded-xl border p-6 h-full ${
                isDark
                  ? 'bg-[#050814] border-slate-800'
                  : 'bg-white border-slate-200'
              }`}
            >
              {!scopeResult ? (
                <div className="py-12 text-center max-w-md mx-auto">
                  <p
                    className={`text-sm font-medium ${
                      isDark ? 'text-slate-200' : 'text-slate-800'
                    }`}
                  >
                    Ready to Outline Your Project Architecture
                  </p>
                  <p
                    className={`mt-2 text-xs leading-relaxed ${
                      isDark ? 'text-slate-400' : 'text-slate-500'
                    }`}
                  >
                    Enter a brief project description on the left to preview recommended stack
                    components, sequential delivery milestones, and practical considerations.
                  </p>
                </div>
              ) : (
                <div className="space-y-5">
                  <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800/70 pb-3">
                    <span className="text-xs font-semibold text-blue-400">
                      Recommended MVP Architecture
                    </span>
                    <span className="text-xs text-slate-400">
                      Engine ·{' '}
                      {scopeResult.mode === 'gemini-server-side'
                        ? 'Server-Side Gemini API'
                        : 'Deterministic Engineering Template'}
                    </span>
                  </div>

                  <p
                    className={`text-sm leading-relaxed ${
                      isDark ? 'text-slate-200' : 'text-slate-800'
                    }`}
                  >
                    {scopeResult.summary}
                  </p>

                  <div>
                    <p className="text-xs font-medium text-slate-400 mb-1.5">
                      Suggested Technology Stack
                    </p>
                    <p
                      className={`text-xs font-mono ${
                        isDark ? 'text-blue-300' : 'text-blue-700'
                      }`}
                    >
                      {scopeResult.recommendedStack.join(' · ')}
                    </p>
                  </div>

                  <div>
                    <p className="text-xs font-medium text-slate-400 mb-2">
                      Phased Delivery Milestones
                    </p>
                    <ol className="space-y-2">
                      {scopeResult.milestones.map((m, idx) => (
                        <li
                          key={idx}
                          className={`text-xs leading-relaxed flex items-start gap-2.5 ${
                            isDark ? 'text-slate-300' : 'text-slate-700'
                          }`}
                        >
                          <span className="font-mono text-blue-400 tabular-nums shrink-0">
                            0{idx + 1}.
                          </span>
                          <span>{m}</span>
                        </li>
                      ))}
                    </ol>
                  </div>

                  <div className="pt-3 border-t border-slate-800/70 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <p className="text-xs text-slate-400 leading-relaxed">
                      {scopeResult.honestConsiderations}
                    </p>
                    <button
                      type="button"
                      onClick={() =>
                        onStartQuoteWithService(
                          selectedCategory,
                          `${projectGoal}\n\nSuggested Stack: ${scopeResult.recommendedStack.join(', ')}`
                        )
                      }
                      className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold transition-colors whitespace-nowrap shrink-0 self-start sm:self-center"
                    >
                      <span>Use in Quote Form</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* =====================================================================
          PART 3: LONG-TERM TECHNOLOGY & R&D EXPLORATION HORIZON
      ===================================================================== */}
      <section className="space-y-10">
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-8 border-b pb-8 border-slate-800/80">
          <div className="max-w-2xl">
            <p className="text-xs font-medium text-blue-400 mb-2">
              Technology Roadmap &amp; R&amp;D Horizon
            </p>
            <h2
              className={`font-display text-2xl sm:text-3xl font-bold tracking-tight text-balance ${
                isDark ? 'text-white' : 'text-slate-950'
              }`}
            >
              Active Engineering Domains &amp; Future Innovation Tracks
            </h2>
            <p
              className={`mt-3 text-sm leading-relaxed ${
                isDark ? 'text-slate-300' : 'text-slate-600'
              }`}
            >
              We distinguish transparently between active commercial tracks and emerging domains
              where Lovanstrix is conducting internal software prototyping.
            </p>
          </div>

          <div
            className={`inline-flex items-center gap-1 p-1 rounded-lg border self-start ${
              isDark
                ? 'bg-[#090F21] border-slate-800'
                : 'bg-slate-100 border-slate-200'
            }`}
            role="tablist"
            aria-label="Filter exploration areas by maturity stage"
          >
            {[
              { id: 'all', label: 'All Tracks' },
              { id: 'active', label: 'Active Now' },
              { id: 'prototype', label: 'Prototypes' },
              { id: 'research', label: 'Future R&D' },
            ].map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setFilterStage(tab.id)}
                className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap shrink-0 ${
                  filterStage === tab.id
                    ? 'bg-blue-600 text-white'
                    : isDark
                    ? 'text-slate-400 hover:text-white'
                    : 'text-slate-600 hover:text-slate-950'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredExplorations.map((area) => {
            const isImmediate = area.statusLabel === 'Active Service Track';
            return (
              <article
                key={area.id}
                className={`rounded-2xl border p-7 flex flex-col justify-between transition-colors ${
                  isDark
                    ? 'bg-[#0B1224] border-slate-800/90 hover:border-slate-700'
                    : 'bg-white border-slate-200 hover:border-slate-300'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between gap-4 text-xs mb-3">
                    <span className="font-mono text-blue-400 tabular-nums">
                      Track {area.index}
                    </span>
                    <span
                      className={`font-medium ${
                        isImmediate
                          ? 'text-blue-400'
                          : isDark
                          ? 'text-slate-400'
                          : 'text-slate-500'
                      }`}
                    >
                      Maturity Stage · {area.statusLabel}
                    </span>
                  </div>

                  <h3
                    className={`font-display text-xl font-semibold tracking-tight ${
                      isDark ? 'text-white' : 'text-slate-900'
                    }`}
                  >
                    {area.index}. {area.title}
                  </h3>

                  <p
                    className={`mt-3 text-sm leading-relaxed ${
                      isDark ? 'text-slate-300' : 'text-slate-600'
                    }`}
                  >
                    {area.summary}
                  </p>

                  <div className="mt-5 pt-5 border-t border-slate-800/60">
                    <p
                      className={`text-xs font-semibold mb-3 ${
                        isDark ? 'text-slate-200' : 'text-slate-800'
                      }`}
                    >
                      Practical Focus &amp; Exploration Scope
                    </p>
                    <ul className="space-y-2">
                      {area.practicalFocus.map((point, idx) => (
                        <li
                          key={idx}
                          className={`text-xs flex items-start gap-2.5 leading-relaxed ${
                            isDark ? 'text-slate-300' : 'text-slate-600'
                          }`}
                        >
                          <Check className="w-3.5 h-3.5 text-blue-400 shrink-0 mt-0.5" />
                          <span>{point}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                <div className="mt-6 pt-4 border-t border-slate-800/60 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <p
                    className={`text-xs leading-relaxed ${
                      isDark ? 'text-slate-400' : 'text-slate-500'
                    }`}
                  >
                    <strong className={isDark ? 'text-slate-200' : 'text-slate-700'}>
                      Transparency Note:
                    </strong>{' '}
                    {area.honestNote}
                  </p>
                  {isImmediate && (
                    <button
                      type="button"
                      onClick={() =>
                        onStartQuoteWithService(
                          area.title === 'Artificial Intelligence'
                            ? 'AI Chatbots and AI Integration'
                            : 'Web Application Development'
                        )
                      }
                      className="inline-flex items-center gap-1.5 text-xs font-semibold text-blue-400 hover:text-blue-300 whitespace-nowrap shrink-0 self-start sm:self-center"
                    >
                      <span>Discuss Project</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </article>
            );
          })}
        </div>
      </section>
    </div>
  );
};
