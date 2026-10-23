import React, { useEffect, useState } from 'react';
import {
  AlertCircle,
  CheckCircle2,
  Link2,
  Mail,
  MessageSquare,
  Send,
  ShieldCheck,
} from 'lucide-react';
import { CompanyDetails, ServiceItem } from '../types/lovanstrix';

interface ContactQuoteSectionProps {
  company: CompanyDetails;
  services: ServiceItem[];
  initialService?: string;
  initialDescription?: string;
  isDark: boolean;
  onEnquirySubmitted?: () => void;
}

const BUDGET_RANGES = [
  'Under $500 / ₹25,000 (Small Website / Prototype)',
  '$500 – $1,500 / ₹25,000 – ₹1,00,000 (Standard Web Project)',
  '$1,500 – $4,000 / ₹1,00,000 – ₹3,00,000 (Custom Web Application)',
  '$4,000+ / ₹3,00,000+ (Multi-Phase System)',
  'Need Consultation to Estimate Budget',
];

const TIMELINE_OPTIONS = [
  '2–4 Weeks (Fast-Track MVP / Website)',
  '1–2 Months (Standard Delivery)',
  '2–3 Months (Custom Web App + Integrations)',
  'Flexible / Exploring Options',
];

interface EnquirySubmissionFeedback {
  savedToDatabase: boolean;
}

export const ContactQuoteSection: React.FC<ContactQuoteSectionProps> = ({
  company,
  services,
  initialService,
  initialDescription,
  isDark,
  onEnquirySubmitted,
}) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [organization, setOrganization] = useState('');
  const [serviceRequired, setServiceRequired] = useState(
    initialService || services[0]?.title || 'Website Design and Development'
  );
  const [projectDescription, setProjectDescription] = useState(initialDescription || '');
  const [estimatedBudget, setEstimatedBudget] = useState(BUDGET_RANGES[1]);
  const [expectedTimeline, setExpectedTimeline] = useState(TIMELINE_OPTIONS[1]);
  const [referenceUrl, setReferenceUrl] = useState('');

  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [submissionResult, setSubmissionResult] = useState<EnquirySubmissionFeedback | null>(null);

  useEffect(() => {
    if (initialService) {
      setServiceRequired(initialService);
    }
  }, [initialService]);

  useEffect(() => {
    if (initialDescription) {
      setProjectDescription(initialDescription);
    }
  }, [initialDescription]);

  const cleanWhatsapp = (company.whatsappNumber || '').replace(/[^\d]/g, '');
  const hasValidWhatsapp = cleanWhatsapp.length >= 8 && cleanWhatsapp.length <= 15;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSubmissionResult(null);

    if (name.trim().length < 2) {
      setErrorMsg('Please enter your full name (at least 2 characters).');
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      setErrorMsg('Please enter a valid email address so we can respond to your enquiry.');
      return;
    }
    if (!serviceRequired) {
      setErrorMsg('Please select the primary service required.');
      return;
    }
    if (referenceUrl.trim().length > 0) {
      try {
        const parsed = new URL(referenceUrl.trim());
        if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
          setErrorMsg('Portfolio or reference link must start with https:// or http://');
          return;
        }
      } catch {
        setErrorMsg(
          'Please enter a valid URL (including https://) for the optional portfolio or reference link.'
        );
        return;
      }
    }
    if (projectDescription.trim().length < 15) {
      setErrorMsg('Please describe your project goals and requirements (at least 15 characters).');
      return;
    }

    setSubmitting(true);
    try {
      const resp = await fetch('/api/enquiries', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name.trim(),
          email: email.trim(),
          organization: organization.trim(),
          serviceRequired,
          projectDescription: projectDescription.trim(),
          estimatedBudget,
          expectedTimeline,
          referenceUrl: referenceUrl.trim(),
        }),
      });
      const data = await resp.json();
      if (!resp.ok) {
        setErrorMsg(data.error || 'Unable to submit enquiry. Please verify your inputs.');
      } else {
        setSubmissionResult({
          savedToDatabase: Boolean(data.savedToDatabase),
        });
        setName('');
        setEmail('');
        setOrganization('');
        setProjectDescription('');
        setReferenceUrl('');
        if (onEnquirySubmitted) onEnquirySubmitted();
      }
    } catch {
      setSubmissionResult({
        savedToDatabase: false,
      });
      setName('');
      setEmail('');
      setOrganization('');
      setProjectDescription('');
      setReferenceUrl('');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-12">
      {/* Header */}
      <div className="max-w-3xl">
        <p className="text-xs font-medium text-blue-400 mb-2">
          Request a Quote · Start a Conversation
        </p>
        <h2
          className={`font-display text-3xl sm:text-4xl font-bold tracking-tight text-balance ${
            isDark ? 'text-white' : 'text-slate-950'
          }`}
        >
          Discuss Your Project With Lovanstrix
        </h2>
        <p
          className={`mt-4 text-base leading-relaxed ${
            isDark ? 'text-slate-300' : 'text-slate-600'
          }`}
        >
          Share your idea, required service, budget range, and preferred timeline. We review every
          enquiry directly and respond with a transparent technical scope assessment.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
        {/* Left Column: Direct Contact Channels */}
        <div className="lg:col-span-5 space-y-6">
          <div
            className={`rounded-2xl border p-6 space-y-6 ${
              isDark
                ? 'bg-[#0B1224] border-slate-800'
                : 'bg-white border-slate-200'
            }`}
          >
            <div>
              <h3
                className={`font-display text-lg font-semibold ${
                  isDark ? 'text-white' : 'text-slate-900'
                }`}
              >
                Direct Contact Channels
              </h3>
              <p className={`text-xs mt-1 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                Reach out via email or submit the structured project brief.
              </p>
            </div>

            {/* Email Contact */}
            <div className="pt-4 border-t border-slate-800/60 flex items-start gap-3.5">
              <Mail className="w-5 h-5 text-blue-400 shrink-0 mt-0.5" />
              <div>
                <p className="text-xs text-slate-400">Primary Email</p>
                <a
                  href={`mailto:${company.email}`}
                  className={`text-sm font-medium hover:text-blue-400 transition-colors ${
                    isDark ? 'text-white' : 'text-slate-900'
                  }`}
                >
                  {company.email}
                </a>
              </div>
            </div>

            {/* Optional WhatsApp Contact Button — Active ONLY when a real company number is supplied */}
            <div className="pt-4 border-t border-slate-800/60 flex items-start gap-3.5">
              <MessageSquare className="w-5 h-5 text-blue-400 shrink-0 mt-0.5" />
              <div className="w-full">
                <p className="text-xs text-slate-400">WhatsApp Direct Inquiry</p>
                {hasValidWhatsapp ? (
                  <div className="mt-2">
                    <a
                      href={`https://wa.me/${cleanWhatsapp}?text=${encodeURIComponent(
                        `Hello Lovanstrix, I would like to discuss a ${serviceRequired} project.`
                      )}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold transition-colors whitespace-nowrap shrink-0"
                    >
                      <MessageSquare className="w-3.5 h-3.5" />
                      <span>Chat on WhatsApp (+{cleanWhatsapp})</span>
                    </a>
                  </div>
                ) : (
                  <div className="mt-1.5 space-y-2">
                    <p
                      className={`text-xs leading-relaxed ${
                        isDark ? 'text-slate-300' : 'text-slate-600'
                      }`}
                    >
                      WhatsApp is not available at the moment. Please use the email address or enquiry form instead.
                    </p>

                  </div>
                )}
              </div>
            </div>
          </div>

          <div className={`rounded-2xl border p-5 ${
            isDark ? 'bg-[#090F21] border-slate-800/90' : 'bg-slate-50 border-slate-200'
          }`}>
            <div className="flex items-start gap-3">
              <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-blue-500" />
              <div>
                <p className={`text-xs font-semibold ${isDark ? 'text-slate-200' : 'text-slate-900'}`}>
                  Project enquiries
                </p>
                <p className={`mt-1.5 text-xs leading-relaxed ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                  Share only the project information needed for an initial discussion. Never include passwords, API keys, or other sensitive credentials.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Project Enquiry Form */}
        <div className="lg:col-span-7">
          <form
            onSubmit={handleSubmit}
            noValidate
            className={`rounded-2xl border p-7 sm:p-9 space-y-5 ${
              isDark
                ? 'bg-[#0B1224] border-slate-800'
                : 'bg-white border-slate-200'
            }`}
          >
            <div className="border-b border-slate-800/60 pb-4 flex flex-wrap items-center justify-between gap-2">
              <div>
                <h3
                  className={`font-display text-xl font-bold ${
                    isDark ? 'text-white' : 'text-slate-900'
                  }`}
                >
                  Project Enquiry &amp; Quote Specification
                </h3>
                <p className={`text-xs mt-1 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                  Fields marked with * are required. Share a few details so we can understand your project.
                </p>
              </div>

            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label
                  htmlFor="quote-name"
                  className={`block text-xs font-medium mb-1.5 ${
                    isDark ? 'text-slate-200' : 'text-slate-700'
                  }`}
                >
                  Your Full Name *
                </label>
                <input
                  id="quote-name"
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Rohan Verma"
                  className={`w-full rounded-lg border px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    isDark
                      ? 'bg-[#050814] border-slate-700 text-white placeholder:text-slate-500'
                      : 'bg-white border-slate-300 text-slate-900 placeholder:text-slate-400'
                  }`}
                />
              </div>

              <div>
                <label
                  htmlFor="quote-email"
                  className={`block text-xs font-medium mb-1.5 ${
                    isDark ? 'text-slate-200' : 'text-slate-700'
                  }`}
                >
                  Email Address *
                </label>
                <input
                  id="quote-email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="rohan@company.com"
                  className={`w-full rounded-lg border px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    isDark
                      ? 'bg-[#050814] border-slate-700 text-white placeholder:text-slate-500'
                      : 'bg-white border-slate-300 text-slate-900 placeholder:text-slate-400'
                  }`}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label
                  htmlFor="quote-org"
                  className={`block text-xs font-medium mb-1.5 ${
                    isDark ? 'text-slate-200' : 'text-slate-700'
                  }`}
                >
                  Company or Organization (Optional)
                </label>
                <input
                  id="quote-org"
                  type="text"
                  value={organization}
                  onChange={(e) => setOrganization(e.target.value)}
                  placeholder="Startup / Studio / Independent"
                  className={`w-full rounded-lg border px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    isDark
                      ? 'bg-[#050814] border-slate-700 text-white placeholder:text-slate-500'
                      : 'bg-white border-slate-300 text-slate-900 placeholder:text-slate-400'
                  }`}
                />
              </div>

              <div>
                <label
                  htmlFor="quote-service"
                  className={`block text-xs font-medium mb-1.5 ${
                    isDark ? 'text-slate-200' : 'text-slate-700'
                  }`}
                >
                  Service Required *
                </label>
                <select
                  id="quote-service"
                  value={serviceRequired}
                  onChange={(e) => setServiceRequired(e.target.value)}
                  className={`w-full rounded-lg border px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    isDark
                      ? 'bg-[#050814] border-slate-700 text-white'
                      : 'bg-white border-slate-300 text-slate-900'
                  }`}
                >
                  {services.map((srv) => (
                    <option key={srv.id} value={srv.title}>
                      {srv.title}
                    </option>
                  ))}
                  <option value="Custom / Multi-Service Project">
                    Custom / Multi-Service Project
                  </option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label
                  htmlFor="quote-budget"
                  className={`block text-xs font-medium mb-1.5 ${
                    isDark ? 'text-slate-200' : 'text-slate-700'
                  }`}
                >
                  Estimated Budget *
                </label>
                <select
                  id="quote-budget"
                  value={estimatedBudget}
                  onChange={(e) => setEstimatedBudget(e.target.value)}
                  className={`w-full rounded-lg border px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    isDark
                      ? 'bg-[#050814] border-slate-700 text-white'
                      : 'bg-white border-slate-300 text-slate-900'
                  }`}
                >
                  {BUDGET_RANGES.map((b) => (
                    <option key={b} value={b}>
                      {b}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label
                  htmlFor="quote-timeline"
                  className={`block text-xs font-medium mb-1.5 ${
                    isDark ? 'text-slate-200' : 'text-slate-700'
                  }`}
                >
                  Preferred Timeline *
                </label>
                <select
                  id="quote-timeline"
                  value={expectedTimeline}
                  onChange={(e) => setExpectedTimeline(e.target.value)}
                  className={`w-full rounded-lg border px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    isDark
                      ? 'bg-[#050814] border-slate-700 text-white'
                      : 'bg-white border-slate-300 text-slate-900'
                  }`}
                >
                  {TIMELINE_OPTIONS.map((t) => (
                    <option key={t} value={t}>
                      {t}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label
                htmlFor="quote-reference-url"
                className={`block text-xs font-medium mb-1.5 ${
                  isDark ? 'text-slate-200' : 'text-slate-700'
                }`}
              >
                <span className="inline-flex items-center gap-1.5">
                  <Link2 className="w-3.5 h-3.5 text-blue-400" />
                  <span>Optional Portfolio, Wireframe, or Reference Link</span>
                </span>
              </label>
              <input
                id="quote-reference-url"
                type="url"
                value={referenceUrl}
                onChange={(e) => setReferenceUrl(e.target.value)}
                placeholder="https://example.com or link to Figma / GitHub / Existing Site"
                className={`w-full rounded-lg border px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  isDark
                    ? 'bg-[#050814] border-slate-700 text-white placeholder:text-slate-500'
                    : 'bg-white border-slate-300 text-slate-900 placeholder:text-slate-400'
                }`}
              />
            </div>

            <div>
              <label
                htmlFor="quote-description"
                className={`block text-xs font-medium mb-1.5 ${
                  isDark ? 'text-slate-200' : 'text-slate-700'
                }`}
              >
                Project Details &amp; Objectives *
              </label>
              <textarea
                id="quote-description"
                rows={4}
                required
                value={projectDescription}
                onChange={(e) => setProjectDescription(e.target.value)}
                placeholder="Describe what you want to build, key features needed, target users, and any specific requirements..."
                className={`w-full rounded-lg border px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  isDark
                    ? 'bg-[#050814] border-slate-700 text-white placeholder:text-slate-500'
                    : 'bg-white border-slate-300 text-slate-900 placeholder:text-slate-400'
                }`}
              />
            </div>

            {errorMsg && (
              <div
                role="alert"
                className="flex items-start gap-2.5 rounded-lg border border-rose-500/40 bg-rose-500/10 p-3.5 text-xs text-rose-300"
              >
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-400" />
                <span>{errorMsg}</span>
              </div>
            )}

            {submissionResult && (
              <div
                role="status"
                className={`flex items-start gap-3 rounded-xl border p-4 text-xs ${
                  submissionResult.savedToDatabase
                    ? 'border-emerald-500/40 bg-emerald-500/10 text-emerald-900'
                    : 'border-amber-500/40 bg-amber-500/10 text-amber-900'
                }`}
              >
                {submissionResult.savedToDatabase ? (
                  <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5 text-emerald-600" />
                ) : (
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-amber-600" />
                )}
                <div className="space-y-1">
                  <p className="font-semibold">
                    {submissionResult.savedToDatabase
                      ? 'Thank you — your enquiry has been received.'
                      : 'Your enquiry could not be saved in this environment.'}
                  </p>
                  <p className="leading-relaxed">
                    {submissionResult.savedToDatabase
                      ? 'Your project details are ready for the Lovanstrix team to review.'
                      : 'Please contact us directly by email or try again later.'}
                  </p>
                </div>
              </div>
            )}

            <div className="flex flex-wrap items-center justify-between gap-4 pt-2">
              <button
                type="submit"
                disabled={submitting}
                className="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-gradient-to-r from-blue-600 to-violet-600 hover:from-blue-500 hover:to-violet-500 disabled:opacity-60 text-white text-xs font-semibold transition-all whitespace-nowrap shrink-0"
              >
                <Send className="w-3.5 h-3.5" />
                <span>{submitting ? 'Submitting Enquiry...' : 'Submit Project Enquiry'}</span>
              </button>
              <span className="text-xs text-slate-400">
                Please do not include passwords or private credentials.
              </span>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
