import React from 'react';
import {
  ArrowLeft,
  ArrowRight,
  Check,
  CheckCircle2,
  Code2,
  HelpCircle,
  Layers,
  ShieldCheck,
  Sparkles,
} from 'lucide-react';
import {
  CompanyDetails,
  ServiceItem,
} from '../types/lovanstrix';
import { ContactQuoteSection } from './ContactQuoteSection';

interface ServiceDetailViewProps {
  service: ServiceItem;
  allServices: ServiceItem[];
  company: CompanyDetails;
  isDark: boolean;
  onSelectService: (slug: string) => void;
  onBackToAllServices: () => void;
  onEnquirySubmitted: () => void;
}

export const ServiceDetailView: React.FC<ServiceDetailViewProps> = ({
  service,
  allServices,
  company,
  isDark,
  onSelectService,
  onBackToAllServices,
  onEnquirySubmitted,
}) => {
  const isImmediate = service.availability === 'Available for New Projects';

  return (
    <div className="space-y-16">
      {/* Top Breadcrumb & Service Switcher Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800/80 pb-6">
        <button
          type="button"
          onClick={onBackToAllServices}
          className={`inline-flex items-center gap-2 text-xs font-semibold transition-colors self-start ${
            isDark ? 'text-blue-400 hover:text-blue-300' : 'text-blue-600 hover:text-blue-800'
          }`}
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to All 11 IT Services</span>
        </button>

        <div className="flex items-center gap-2">
          <label
            htmlFor="quick-service-jump"
            className="text-xs text-slate-400 whitespace-nowrap"
          >
            Jump to Service:
          </label>
          <select
            id="quick-service-jump"
            value={service.slug}
            onChange={(e) => onSelectService(e.target.value)}
            className={`rounded-lg border px-3 py-1.5 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              isDark
                ? 'bg-[#090F21] border-slate-700 text-slate-200'
                : 'bg-white border-slate-300 text-slate-800'
            }`}
          >
            {allServices.map((s) => (
              <option key={s.id} value={s.slug}>
                {s.index}. {s.title}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Hero Overview Section */}
      <section
        className={`rounded-2xl border p-8 sm:p-10 bg-gradient-to-br ${
          isDark
            ? 'from-[#0B1224] via-[#090F21] to-[#110E29] border-slate-800'
            : 'from-white via-slate-50 to-blue-50/40 border-slate-200'
        }`}
      >
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          <div className="lg:col-span-8 space-y-4">
            <div className="flex flex-wrap items-center gap-2 text-xs font-medium">
              <span className="font-mono text-blue-400">
                Service {service.index} · {service.category}
              </span>
              <span aria-hidden="true" className="text-slate-500">
                ·
              </span>
              <span
                className={
                  isImmediate
                    ? 'text-emerald-400 font-semibold'
                    : 'text-amber-400 font-semibold'
                }
              >
                {service.availability}
              </span>
            </div>

            <h1
              className={`font-display text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-balance ${
                isDark ? 'text-white' : 'text-slate-950'
              }`}
            >
              {service.title}
            </h1>

            <p
              className={`text-base sm:text-lg leading-relaxed ${
                isDark ? 'text-slate-200' : 'text-slate-700'
              }`}
            >
              {service.overview || service.summary}
            </p>

            <div className="pt-2 flex flex-wrap items-center gap-3">
              <a
                href="#service-quote-section"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-gradient-to-r from-blue-600 to-violet-600 hover:from-blue-500 hover:to-violet-500 text-white text-xs sm:text-sm font-semibold transition-all"
              >
                <span>Request a Quote for {service.title}</span>
                <ArrowRight className="w-4 h-4" />
              </a>

              <button
                type="button"
                onClick={onBackToAllServices}
                className={`inline-flex items-center gap-2 px-5 py-3 rounded-lg border text-xs sm:text-sm font-semibold transition-colors ${
                  isDark
                    ? 'border-slate-700 bg-slate-900/70 text-slate-200 hover:bg-slate-800'
                    : 'border-slate-300 bg-white text-slate-800 hover:bg-slate-100'
                }`}
              >
                <span>Compare All Services</span>
              </button>
            </div>
          </div>

          {/* Right Column: Honest Capability & Delivery Card */}
          <div className="lg:col-span-4">
            <div
              className={`rounded-xl border p-6 space-y-4 ${
                isDark
                  ? 'bg-[#050814]/90 border-slate-800'
                  : 'bg-white border-slate-200'
              }`}
            >
              <div className="flex items-center gap-2 text-xs font-semibold text-blue-400">
                <ShieldCheck className="w-4 h-4" />
                <span>Realistic Delivery Commitment</span>
              </div>
              <p
                className={`text-xs leading-relaxed ${
                  isDark ? 'text-slate-300' : 'text-slate-600'
                }`}
              >
                Lovanstrix scopes every <strong>{service.title}</strong> engagement directly with the
                founder or verified technical collaborators. We agree on concrete deliverables,
                technologies, and milestones before development begins.
              </p>
              <div className="pt-3 border-t border-slate-800/60 space-y-2 text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Delivery Status:</span>
                  <span className="font-semibold text-blue-400">{service.availability}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Code Ownership:</span>
                  <span className={isDark ? 'text-slate-200' : 'text-slate-800'}>
                    Clean, Maintainable Handover
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Problems Addressed & Deliverables Split */}
      <section className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Problems It Addresses */}
        <div
          className={`rounded-2xl border p-7 sm:p-8 space-y-5 ${
            isDark ? 'bg-[#0B1224] border-slate-800' : 'bg-white border-slate-200'
          }`}
        >
          <div>
            <p className="text-xs font-mono text-blue-400 mb-1">01 · Challenges Solved</p>
            <h2
              className={`font-display text-2xl font-bold ${
                isDark ? 'text-white' : 'text-slate-900'
              }`}
            >
              Problems This Service Addresses
            </h2>
          </div>

          <ul className="space-y-3.5">
            {(service.problemsAddressed && service.problemsAddressed.length > 0
              ? service.problemsAddressed
              : [
                  'Need for a dependable, responsive digital implementation tailored to your goals',
                  'Replacing fragmented manual processes with structured software',
                  'Ensuring clean code architecture and responsive mobile-to-desktop usability',
                ]
            ).map((prob, idx) => (
              <li
                key={idx}
                className={`flex items-start gap-3 text-sm leading-relaxed ${
                  isDark ? 'text-slate-300' : 'text-slate-600'
                }`}
              >
                <span className="font-mono text-xs text-blue-400 mt-1 shrink-0">
                  0{idx + 1}.
                </span>
                <span>{prob}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Included Deliverables */}
        <div
          className={`rounded-2xl border p-7 sm:p-8 space-y-5 ${
            isDark ? 'bg-[#0B1224] border-slate-800' : 'bg-white border-slate-200'
          }`}
        >
          <div>
            <p className="text-xs font-mono text-blue-400 mb-1">02 · Concrete Outputs</p>
            <h2
              className={`font-display text-2xl font-bold ${
                isDark ? 'text-white' : 'text-slate-900'
              }`}
            >
              What You Receive (Deliverables)
            </h2>
          </div>

          <ul className="space-y-3.5">
            {service.deliverables.map((item, idx) => (
              <li
                key={idx}
                className={`flex items-start gap-3 text-sm leading-relaxed ${
                  isDark ? 'text-slate-300' : 'text-slate-600'
                }`}
              >
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-1" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* Technologies Used & Development Process */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Technologies Used */}
        <div
          className={`lg:col-span-4 rounded-2xl border p-7 flex flex-col justify-between ${
            isDark ? 'bg-[#090F21] border-slate-800' : 'bg-slate-50 border-slate-200'
          }`}
        >
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-xs font-semibold text-blue-400">
              <Code2 className="w-4 h-4" />
              <span>03 · Technology Stack</span>
            </div>
            <h2
              className={`font-display text-xl font-bold ${
                isDark ? 'text-white' : 'text-slate-900'
              }`}
            >
              Technologies &amp; Tools Used
            </h2>
            <p
              className={`text-xs leading-relaxed ${
                isDark ? 'text-slate-300' : 'text-slate-600'
              }`}
            >
              We select practical, widely supported technologies based on your project’s exact
              requirements and hosting budget:
            </p>
            <div className="flex flex-wrap gap-2 pt-2">
              {service.technologies.map((tech) => (
                <span
                  key={tech}
                  className={`px-3 py-1.5 rounded-lg border text-xs font-mono ${
                    isDark
                      ? 'bg-[#050814] border-slate-800 text-blue-300'
                      : 'bg-white border-slate-200 text-blue-700'
                  }`}
                >
                  {tech}
                </span>
              ))}
            </div>
          </div>

          <p className="text-xs text-slate-400 pt-6 mt-6 border-t border-slate-800/60">
            Free-tier cloud hosting and open-standard frameworks prioritized wherever eligible.
          </p>
        </div>

        {/* Development Process */}
        <div
          className={`lg:col-span-8 rounded-2xl border p-7 space-y-5 ${
            isDark ? 'bg-[#0B1224] border-slate-800' : 'bg-white border-slate-200'
          }`}
        >
          <div className="flex items-center gap-2 text-xs font-semibold text-blue-400">
            <Layers className="w-4 h-4" />
            <span>04 · Execution Lifecycle</span>
          </div>
          <h2
            className={`font-display text-xl font-bold ${
              isDark ? 'text-white' : 'text-slate-900'
            }`}
          >
            Our Development Process for {service.title}
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {(service.processSteps && service.processSteps.length > 0
              ? service.processSteps
              : [
                  'Discover: Clarify objectives, target users, and MVP scope.',
                  'Plan: Define architecture, database schema, and milestones.',
                  'Design: Craft responsive wireframes and high-contrast UI.',
                  'Develop: Implement clean frontend and backend code.',
                  'Test: Verify validation, mobile layout, and edge cases.',
                  'Launch: Deploy to production with documentation.',
                ]
            ).map((stepText, idx) => (
              <div
                key={idx}
                className={`rounded-xl border p-4 space-y-1.5 ${
                  isDark
                    ? 'bg-[#050814] border-slate-800/90'
                    : 'bg-slate-50 border-slate-200'
                }`}
              >
                <span className="text-xs font-mono text-blue-400">
                  Phase 0{idx + 1}
                </span>
                <p
                  className={`text-xs leading-relaxed ${
                    isDark ? 'text-slate-200' : 'text-slate-700'
                  }`}
                >
                  {stepText}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Frequently Asked Questions for this Service */}
      {service.faqs && service.faqs.length > 0 && (
        <section
          className={`rounded-2xl border p-7 sm:p-8 space-y-6 ${
            isDark ? 'bg-[#090F21] border-slate-800' : 'bg-white border-slate-200'
          }`}
        >
          <div className="flex items-center gap-2 text-xs font-semibold text-blue-400">
            <HelpCircle className="w-4 h-4" />
            <span>05 · Service FAQs</span>
          </div>
          <h2
            className={`font-display text-2xl font-bold ${
              isDark ? 'text-white' : 'text-slate-900'
            }`}
          >
            Frequently Asked Questions — {service.title}
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {service.faqs.map((faq, idx) => (
              <div
                key={idx}
                className={`rounded-xl border p-5 space-y-2 ${
                  isDark ? 'bg-[#050814] border-slate-800' : 'bg-slate-50 border-slate-200'
                }`}
              >
                <h3
                  className={`text-sm font-semibold ${
                    isDark ? 'text-white' : 'text-slate-900'
                  }`}
                >
                  {faq.question}
                </h3>
                <p
                  className={`text-xs leading-relaxed ${
                    isDark ? 'text-slate-300' : 'text-slate-600'
                  }`}
                >
                  {faq.answer}
                </p>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Embedded Request a Quote Form Pre-Selected for this Service */}
      <section id="service-quote-section" className="pt-4 border-t border-slate-800/80">
        <ContactQuoteSection
          company={company}
          services={allServices}
          initialService={service.title}
          initialDescription={`Hello Lovanstrix, I would like to discuss a "${service.title}" project. Here are our main requirements:`}
          isDark={isDark}
          onEnquirySubmitted={onEnquirySubmitted}
        />
      </section>
    </div>
  );
};
