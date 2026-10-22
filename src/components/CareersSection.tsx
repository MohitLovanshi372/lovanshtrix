import React, { useState } from 'react';
import { CheckCircle2, ExternalLink, AlertCircle, Send } from 'lucide-react';
import { CareerOpening, CompanyDetails } from '../types/lovanstrix';

interface CareersSectionProps {
  company: CompanyDetails;
  openings: CareerOpening[];
  isDark: boolean;
  onSubmissionSuccess?: () => void;
}

const FUTURE_TRACKS = [
  {
    index: '01',
    title: 'Frontend Development',
    focus: 'React, TypeScript, responsive CSS architectures, accessibility, and clean component systems.',
    status: 'Future Recruitment Track',
  },
  {
    index: '02',
    title: 'Backend Development',
    focus: 'Node.js, Express APIs, database schema modeling, authentication, and cloud deployment.',
    status: 'Future Recruitment Track',
  },
  {
    index: '03',
    title: 'Full-Stack Development',
    focus: 'End-to-end web application engineering from database design to user-facing interfaces.',
    status: 'Future Recruitment Track',
  },
  {
    index: '04',
    title: 'UI/UX Design',
    focus: 'Wireframing, interface hierarchy, design systems, and user-centered product workflows.',
    status: 'Future Recruitment Track',
  },
  {
    index: '05',
    title: 'AI and Software Research',
    focus: 'Applied LLM integration, prompt engineering guardrails, structured outputs, and automation.',
    status: 'Future Recruitment Track',
  },
  {
    index: '06',
    title: 'Future Developer Collaborations',
    focus: 'Project-based collaboration with independent developers, students, and early-career builders.',
    status: 'Future Recruitment Track',
  },
];

export const CareersSection: React.FC<CareersSectionProps> = ({
  company,
  openings,
  isDark,
  onSubmissionSuccess,
}) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [areaOfInterest, setAreaOfInterest] = useState('Full-Stack Development');
  const [skills, setSkills] = useState('');
  const [portfolioUrl, setPortfolioUrl] = useState('');
  const [introduction, setIntroduction] = useState('');

  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successNotice, setSuccessNotice] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessNotice(null);

    if (name.trim().length < 2) {
      setErrorMsg('Please enter your full name.');
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      setErrorMsg('Please enter a valid email address.');
      return;
    }
    if (skills.trim().length < 2) {
      setErrorMsg('Please list at least a few skills or technologies you work with.');
      return;
    }
    if (portfolioUrl.trim().length > 0) {
      try {
        const u = new URL(portfolioUrl.trim());
        if (u.protocol !== 'http:' && u.protocol !== 'https:') {
          setErrorMsg('Portfolio or GitHub URL must begin with https:// or http://');
          return;
        }
      } catch {
        setErrorMsg('Please enter a valid URL (including https://) for your Portfolio or GitHub.');
        return;
      }
    }
    if (introduction.trim().length < 10) {
      setErrorMsg('Please include a short introduction (at least 10 characters).');
      return;
    }

    setSubmitting(true);
    try {
      const resp = await fetch('/api/career-interest', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name.trim(),
          email: email.trim(),
          areaOfInterest,
          skills: skills.trim(),
          portfolioUrl: portfolioUrl.trim(),
          introduction: introduction.trim(),
        }),
      });
      const data = await resp.json();
      if (!resp.ok) {
        setErrorMsg(data.error || 'Could not register interest. Please check your inputs.');
      } else {
        setSuccessNotice(data.notice);
        setName('');
        setEmail('');
        setSkills('');
        setPortfolioUrl('');
        setIntroduction('');
        if (onSubmissionSuccess) onSubmissionSuccess();
      }
    } catch {
      setErrorMsg('Network error while submitting your registration. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-16">
      {/* Section Header */}
      <div className="max-w-3xl">
        <p className="text-xs font-medium text-blue-400 mb-2">
          Careers & Future Learning Opportunities
        </p>
        <h1
          className={`font-display text-3xl sm:text-4xl font-bold tracking-tight text-balance ${
            isDark ? 'text-white' : 'text-slate-950'
          }`}
        >
          Growing With Talented Developers & Curious Builders
        </h1>
        <p
          className={`mt-4 text-base leading-relaxed ${
            isDark ? 'text-slate-300' : 'text-slate-600'
          }`}
        >
          Part of Lovanstrix’s core vision is to collaborate with dedicated engineers and create
          meaningful learning and internship opportunities as our project pipeline expands.
        </p>
      </div>

      {/* Explicit Current Hiring Status Banner */}
      <div
        className={`rounded-2xl border p-6 sm:p-8 ${
          isDark
            ? 'bg-[#090F21] border-slate-800'
            : 'bg-slate-50 border-slate-200'
        }`}
      >
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="flex items-center gap-2 text-xs text-blue-400 font-medium">
              <span>Current Recruitment Status</span>
              <span aria-hidden="true">·</span>
              <span>
                {openings.length > 0
                  ? `${openings.length} Published Opening${openings.length > 1 ? 's' : ''}`
                  : 'Talent Pool Registration Phase'}
              </span>
            </div>
            <p
              className={`font-display text-lg sm:text-xl font-semibold ${
                isDark ? 'text-white' : 'text-slate-900'
              }`}
            >
              “{company.careerStatusBanner}”
            </p>
          </div>
          <a
            href="#career-interest-form"
            className="inline-flex items-center justify-center px-5 py-2.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold transition-colors whitespace-nowrap shrink-0 self-start md:self-center"
          >
            Register Your Interest
          </a>
        </div>
      </div>

      {/* Published Openings (Only shown if an admin has genuinely published an opening) */}
      <section className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-slate-800/80 pb-4">
          <div>
            <h2
              className={`font-display text-2xl font-bold tracking-tight ${
                isDark ? 'text-white' : 'text-slate-900'
              }`}
            >
              Published Role & Internship Openings
            </h2>
            <p className={`text-xs mt-1 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
              Official openings appear below only when published by Lovanstrix administration.
            </p>
          </div>
          <span className="text-xs font-mono text-slate-400 tabular-nums">
            Active Openings · {openings.length}
          </span>
        </div>

        {openings.length === 0 ? (
          <div
            className={`rounded-2xl border p-8 text-center ${
              isDark
                ? 'bg-[#0B1224]/70 border-slate-800/80'
                : 'bg-white border-slate-200'
            }`}
          >
            <p
              className={`text-sm font-semibold ${
                isDark ? 'text-slate-200' : 'text-slate-800'
              }`}
            >
              No Active Internship or Job Openings Are Published Right Now
            </p>
            <p
              className={`mt-2 text-xs max-w-xl mx-auto leading-relaxed ${
                isDark ? 'text-slate-400' : 'text-slate-600'
              }`}
            >
              We do not list placeholder or inactive roles as open. You can register your profile in
              our interest form below to be notified when real project collaborations or internships
              are announced.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {openings.map((role) => (
              <article
                key={role.id}
                className={`rounded-2xl border p-6 flex flex-col justify-between ${
                  isDark
                    ? 'bg-[#0B1224] border-slate-800'
                    : 'bg-white border-slate-200'
                }`}
              >
                <div>
                  <div className="flex items-center gap-2 text-xs text-blue-400 mb-2">
                    <span>{role.track}</span>
                    <span aria-hidden="true">·</span>
                    <span>{role.type}</span>
                    <span aria-hidden="true">·</span>
                    <span className="font-mono tabular-nums">Deadline: {role.deadline}</span>
                  </div>
                  <h3
                    className={`font-display text-xl font-semibold ${
                      isDark ? 'text-white' : 'text-slate-900'
                    }`}
                  >
                    {role.title}
                  </h3>
                  <div className="mt-4 space-y-2 text-xs">
                    <p className={isDark ? 'text-slate-300' : 'text-slate-700'}>
                      <strong>Duration:</strong> {role.duration}
                    </p>
                    <p className={isDark ? 'text-slate-300' : 'text-slate-700'}>
                      <strong>Eligibility:</strong> {role.eligibility}
                    </p>
                  </div>
                  {role.responsibilities.length > 0 && (
                    <div className="mt-4 pt-4 border-t border-slate-800/60">
                      <p className="text-xs font-semibold mb-2 text-slate-400">
                        Key Responsibilities
                      </p>
                      <ul className="space-y-1.5">
                        {role.responsibilities.map((resp, idx) => (
                          <li
                            key={idx}
                            className={`text-xs leading-relaxed ${
                              isDark ? 'text-slate-300' : 'text-slate-600'
                            }`}
                          >
                            • {resp}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>

                <div className="mt-6 pt-4 border-t border-slate-800/60 flex items-center justify-between gap-4">
                  <button
                    type="button"
                    onClick={() => {
                      setAreaOfInterest(role.track);
                      document.getElementById('career-interest-form')?.scrollIntoView({ behavior: 'smooth' });
                    }}
                    className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold transition-colors whitespace-nowrap shrink-0"
                  >
                    Apply / Express Interest
                  </button>
                  {role.applicationLink && (
                    <a
                      href={role.applicationLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 text-xs text-blue-400 hover:text-blue-300 whitespace-nowrap shrink-0"
                    >
                      <span>External Application Link</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  )}
                </div>
              </article>
            ))}
          </div>
        )}
      </section>

      {/* Future Disciplines Grid */}
      <section className="space-y-6">
        <div>
          <h2
            className={`font-display text-2xl font-bold tracking-tight ${
              isDark ? 'text-white' : 'text-slate-900'
            }`}
          >
            Future Engineering & Design Tracks
          </h2>
          <p className={`text-xs mt-1 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
            Core disciplines we plan to expand as Lovanstrix grows.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {FUTURE_TRACKS.map((track) => (
            <div
              key={track.index}
              className={`rounded-2xl border p-6 flex flex-col justify-between ${
                isDark
                  ? 'bg-[#0B1224] border-slate-800/90'
                  : 'bg-white border-slate-200'
              }`}
            >
              <div>
                <div className="flex items-center justify-between text-xs text-slate-400 mb-3">
                  <span className="font-mono text-blue-400 tabular-nums">{track.index}</span>
                  <span>{track.status}</span>
                </div>
                <h3
                  className={`font-display text-lg font-semibold ${
                    isDark ? 'text-white' : 'text-slate-900'
                  }`}
                >
                  {track.title}
                </h3>
                <p
                  className={`mt-2.5 text-xs leading-relaxed ${
                    isDark ? 'text-slate-300' : 'text-slate-600'
                  }`}
                >
                  {track.focus}
                </p>
              </div>
              <div className="mt-5 pt-4 border-t border-slate-800/60">
                <button
                  type="button"
                  onClick={() => {
                    setAreaOfInterest(track.title);
                    document.getElementById('career-interest-form')?.scrollIntoView({ behavior: 'smooth' });
                  }}
                  className="text-xs font-medium text-blue-400 hover:text-blue-300 transition-colors"
                >
                  Select this track in form →
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Future Talent & Internship Interest Form */}
      <section
        id="career-interest-form"
        className={`rounded-2xl border p-7 sm:p-10 ${
          isDark
            ? 'bg-[#090F21] border-slate-800'
            : 'bg-slate-50 border-slate-200'
        }`}
      >
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          <div className="lg:col-span-5 space-y-4">
            <p className="text-xs font-medium text-blue-400">Future Talent Network</p>
            <h2
              className={`font-display text-2xl font-bold tracking-tight ${
                isDark ? 'text-white' : 'text-slate-900'
              }`}
            >
              Register Your Interest for Future Opportunities
            </h2>
            <p
              className={`text-sm leading-relaxed ${
                isDark ? 'text-slate-300' : 'text-slate-600'
              }`}
            >
              Whether you are a student looking for future technical learning opportunities or an
              independent developer open to project collaboration, share your profile below.
            </p>

            <div
              className={`rounded-xl border p-4 text-xs leading-relaxed ${
                isDark
                  ? 'bg-[#050814] border-slate-800 text-slate-300'
                  : 'bg-white border-slate-200 text-slate-600'
              }`}
            >
              <p className="font-semibold text-blue-400 mb-1">Important Transparency Notice</p>
              <p>
                Submitting this form records your profile in Lovanstrix’s future interest registry.
                It does <strong>not</strong> promise or guarantee a job offer, active internship
                placement, internship certificate, stipend, or selection.
              </p>
            </div>
          </div>

          <div className="lg:col-span-7">
            <form onSubmit={handleSubmit} className="space-y-4" noValidate>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label
                    htmlFor="career-name"
                    className={`block text-xs font-medium mb-1.5 ${
                      isDark ? 'text-slate-200' : 'text-slate-700'
                    }`}
                  >
                    Full Name *
                  </label>
                  <input
                    id="career-name"
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Aarav Sharma"
                    className={`w-full rounded-lg border px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      isDark
                        ? 'bg-[#050814] border-slate-700 text-white placeholder:text-slate-500'
                        : 'bg-white border-slate-300 text-slate-900 placeholder:text-slate-400'
                    }`}
                  />
                </div>

                <div>
                  <label
                    htmlFor="career-email"
                    className={`block text-xs font-medium mb-1.5 ${
                      isDark ? 'text-slate-200' : 'text-slate-700'
                    }`}
                  >
                    Email Address *
                  </label>
                  <input
                    id="career-email"
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="aarav@example.com"
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
                    htmlFor="career-area"
                    className={`block text-xs font-medium mb-1.5 ${
                      isDark ? 'text-slate-200' : 'text-slate-700'
                    }`}
                  >
                    Area of Interest *
                  </label>
                  <select
                    id="career-area"
                    value={areaOfInterest}
                    onChange={(e) => setAreaOfInterest(e.target.value)}
                    className={`w-full rounded-lg border px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      isDark
                        ? 'bg-[#050814] border-slate-700 text-white'
                        : 'bg-white border-slate-300 text-slate-900'
                    }`}
                  >
                    <option value="Frontend Development">Frontend Development</option>
                    <option value="Backend Development">Backend Development</option>
                    <option value="Full-Stack Development">Full-Stack Development</option>
                    <option value="UI/UX Design">UI/UX Design</option>
                    <option value="AI and Software Research">AI and Software Research</option>
                    <option value="Future Developer Collaborations">Future Developer Collaborations</option>
                  </select>
                </div>

                <div>
                  <label
                    htmlFor="career-portfolio"
                    className={`block text-xs font-medium mb-1.5 ${
                      isDark ? 'text-slate-200' : 'text-slate-700'
                    }`}
                  >
                    Portfolio or GitHub URL (Optional)
                  </label>
                  <input
                    id="career-portfolio"
                    type="url"
                    value={portfolioUrl}
                    onChange={(e) => setPortfolioUrl(e.target.value)}
                    placeholder="https://github.com/username"
                    className={`w-full rounded-lg border px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      isDark
                        ? 'bg-[#050814] border-slate-700 text-white placeholder:text-slate-500'
                        : 'bg-white border-slate-300 text-slate-900 placeholder:text-slate-400'
                    }`}
                  />
                </div>
              </div>

              <div>
                <label
                  htmlFor="career-skills"
                  className={`block text-xs font-medium mb-1.5 ${
                    isDark ? 'text-slate-200' : 'text-slate-700'
                  }`}
                >
                  Primary Skills & Tools *
                </label>
                <input
                  id="career-skills"
                  type="text"
                  required
                  value={skills}
                  onChange={(e) => setSkills(e.target.value)}
                  placeholder="React, TypeScript, Node.js, Tailwind CSS, Python, Figma..."
                  className={`w-full rounded-lg border px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    isDark
                      ? 'bg-[#050814] border-slate-700 text-white placeholder:text-slate-500'
                      : 'bg-white border-slate-300 text-slate-900 placeholder:text-slate-400'
                  }`}
                />
              </div>

              <div>
                <label
                  htmlFor="career-intro"
                  className={`block text-xs font-medium mb-1.5 ${
                    isDark ? 'text-slate-200' : 'text-slate-700'
                  }`}
                >
                  Short Introduction & Learning Goals *
                </label>
                <textarea
                  id="career-intro"
                  rows={3}
                  required
                  value={introduction}
                  onChange={(e) => setIntroduction(e.target.value)}
                  placeholder="Tell us briefly about projects you have built or what you hope to learn and contribute in the future."
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

              {successNotice && (
                <div
                  role="status"
                  className="flex items-start gap-2.5 rounded-lg border border-emerald-500/40 bg-emerald-500/10 p-4 text-xs text-emerald-200"
                >
                  <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5 text-emerald-400" />
                  <div>
                    <p className="font-semibold">Interest Registered</p>
                    <p className="mt-1 leading-relaxed">{successNotice}</p>
                  </div>
                </div>
              )}

              <button
                type="submit"
                disabled={submitting}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-blue-600 hover:bg-blue-500 disabled:opacity-60 text-white text-xs font-semibold transition-colors whitespace-nowrap shrink-0"
              >
                <Send className="w-3.5 h-3.5" />
                <span>{submitting ? 'Submitting Registration...' : 'Register Interest'}</span>
              </button>
            </form>
          </div>
        </div>
      </section>
    </div>
  );
};
