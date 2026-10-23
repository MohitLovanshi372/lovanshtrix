import React, { useState } from 'react';
import {
  AlertCircle,
  ArrowRight,
  Check,
  CheckCircle2,
  FileText,
  GraduationCap,
  Lock,
  Search,
  Send,
  ShieldCheck,
  Upload,
} from 'lucide-react';
import {
  InternshipDepartment,
  InternshipListing,
} from '../types/lovanstrix';

interface InternshipPortalSectionProps {
  listings: InternshipListing[];
  isDark: boolean;
  onApplicationSubmitted: (email: string, referenceNumber: string, accessKey: string) => void;
  onNavigateStudentDashboard: () => void;
}

const DEPARTMENTS: ('All' | InternshipDepartment)[] = [
  'All',
  'Frontend Development',
  'Backend Development',
  'Full-Stack Development',
  'UI/UX Design',
  'AI/ML',
  'IoT',
];

export const InternshipPortalSection: React.FC<InternshipPortalSectionProps> = ({
  listings,
  isDark,
  onApplicationSubmitted,
  onNavigateStudentDashboard,
}) => {
  const [selectedDept, setSelectedDept] = useState<'All' | InternshipDepartment>('All');
  const [statusFilter, setStatusFilter] = useState<'All' | 'Open' | 'Upcoming' | 'Closed'>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Selected listing for application form
  const openListings = listings.filter((l) => l.status === 'Open');
  const [selectedListingId, setSelectedListingId] = useState<string>(
    openListings[0]?.id || ''
  );

  // Student Application Form State
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [college, setCollege] = useState('');
  const [courseAndYear, setCourseAndYear] = useState('');
  const [skillsInput, setSkillsInput] = useState('');
  const [portfolioUrl, setPortfolioUrl] = useState('');
  const [githubUrl, setGithubUrl] = useState('');
  const [linkedinUrl, setLinkedinUrl] = useState('');
  const [resumeFile, setResumeFile] = useState<{
    name: string;
    type: string;
    size: number;
    base64: string;
  } | null>(null);
  const [motivation, setMotivation] = useState('');
  const [availability, setAvailability] = useState('12–15 hours / week');
  const [preferredStartDate, setPreferredStartDate] = useState('2026-11-15');
  const [privacyConsent, setPrivacyConsent] = useState(false);

  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [confirmationData, setConfirmationData] = useState<{
    referenceNumber: string;
    accessKey: string;
    email: string;
    roleTitle: string;
    emailDelivered: boolean;
    notice: string;
  } | null>(null);

  const visibleListings = listings.filter((l) => {
    if (l.status === 'Archived') return false;
    if (selectedDept !== 'All' && l.department !== selectedDept) return false;
    if (statusFilter !== 'All' && l.status !== statusFilter) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        l.title.toLowerCase().includes(q) ||
        l.department.toLowerCase().includes(q) ||
        l.techStack.some((t) => t.toLowerCase().includes(q))
      );
    }
    return true;
  });

  const handleResumeUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormError(null);
    const file = e.target.files?.[0];
    if (!file) {
      setResumeFile(null);
      return;
    }

    const allowedTypes = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    ];
    const ext = file.name.toLowerCase();
    const validExt = ext.endsWith('.pdf') || ext.endsWith('.doc') || ext.endsWith('.docx');

    if (!allowedTypes.includes(file.type) && !validExt) {
      setFormError('Invalid resume file format. Please upload a PDF, DOC, or DOCX file.');
      e.target.value = '';
      return;
    }

    const maxBytes = 2 * 1024 * 1024; // 2 MB
    if (file.size > maxBytes) {
      setFormError('Resume file size exceeds the 2 MB maximum limit.');
      e.target.value = '';
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const resultStr = typeof reader.result === 'string' ? reader.result : '';
      setResumeFile({
        name: file.name,
        type: file.type || 'application/pdf',
        size: file.size,
        base64: resultStr,
      });
    };
    reader.readAsDataURL(file);
  };

  const handleApplyClick = (listing: InternshipListing) => {
    if (listing.status !== 'Open') return;
    setSelectedListingId(listing.id);
    document.getElementById('student-application-form')?.scrollIntoView({ behavior: 'smooth' });
  };

  const isValidOptionalUrl = (val: string): boolean => {
    if (!val.trim()) return true;
    try {
      const parsed = new URL(val.trim());
      return parsed.protocol === 'http:' || parsed.protocol === 'https:';
    } catch {
      return false;
    }
  };

  const handleApplicationSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    setConfirmationData(null);

    const activeListingId = selectedListingId || openListings[0]?.id;
    const chosenListing = listings.find((l) => l.id === activeListingId);

    if (!chosenListing || chosenListing.status !== 'Open') {
      setFormError(
        'Applications can only be submitted for internship tracks whose status is currently Open.'
      );
      return;
    }

    if (fullName.trim().length < 2) {
      setFormError('Please enter your full legal name.');
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      setFormError('Please enter a valid email address.');
      return;
    }
    if (college.trim().length < 3) {
      setFormError('Please enter your college, university, or institution name.');
      return;
    }
    if (courseAndYear.trim().length < 2) {
      setFormError('Please specify your degree/course and current study year.');
      return;
    }
    if (skillsInput.trim().length < 2) {
      setFormError('Please list your technical or design skills.');
      return;
    }
    if (!resumeFile && !portfolioUrl.trim()) {
      setFormError('Please either upload your resume (PDF/DOCX) or provide a valid Portfolio URL.');
      return;
    }
    if (!isValidOptionalUrl(portfolioUrl)) {
      setFormError('Portfolio URL must start with https:// or http://');
      return;
    }
    if (!isValidOptionalUrl(githubUrl)) {
      setFormError('GitHub URL must start with https:// or http://');
      return;
    }
    if (!isValidOptionalUrl(linkedinUrl)) {
      setFormError('LinkedIn URL must start with https:// or http://');
      return;
    }
    if (motivation.trim().length < 20) {
      setFormError('Please write a short motivation statement (at least 20 characters).');
      return;
    }
    if (!preferredStartDate.trim()) {
      setFormError('Please select your preferred start date.');
      return;
    }
    if (!privacyConsent) {
      setFormError('You must agree to the Lovanstrix applicant privacy and terms notice.');
      return;
    }

    setSubmitting(true);
    try {
      const resp = await fetch('/api/internships/apply', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          listingId: chosenListing.id,
          fullName: fullName.trim(),
          email: email.trim(),
          phone: phone.trim(),
          college: college.trim(),
          courseAndYear: courseAndYear.trim(),
          skills: skillsInput
            .split(',')
            .map((s) => s.trim())
            .filter(Boolean),
          portfolioUrl: portfolioUrl.trim(),
          githubUrl: githubUrl.trim(),
          linkedinUrl: linkedinUrl.trim(),
          resumeFile,
          motivation: motivation.trim(),
          availability: availability.trim(),
          preferredStartDate: preferredStartDate.trim(),
          privacyConsent,
        }),
      });

      const data = await resp.json();
      if (!resp.ok) {
        setFormError(data.error || 'Could not submit application. Please verify your inputs.');
      } else {
        setConfirmationData({
          referenceNumber: data.application.referenceNumber,
          accessKey: data.studentAccessKey,
          email: data.application.email,
          roleTitle: data.application.roleTitle,
          emailDelivered: Boolean(data.emailDelivered),
          notice: data.notice,
        });
        setFullName('');
        setPhone('');
        setCollege('');
        setCourseAndYear('');
        setSkillsInput('');
        setPortfolioUrl('');
        setGithubUrl('');
        setLinkedinUrl('');
        setResumeFile(null);
        setMotivation('');
        setPrivacyConsent(false);
        onApplicationSubmitted(
          data.application.email,
          data.application.referenceNumber,
          data.studentAccessKey
        );
      }
    } catch {
      setFormError(
        'Unable to reach the Lovanstrix server. Applications require server confirmation before a reference number is issued.'
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-16">
      {/* Header & Quick Portal Navigation */}
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 border-b border-slate-800/80 pb-8">
        <div className="max-w-3xl space-y-3">
          <div className="flex items-center gap-2 text-xs font-medium text-blue-400">
            <GraduationCap className="w-4 h-4" />
            <span>LOVANSTRIX Internship Management Portal</span>
            <span aria-hidden="true">·</span>
            <span>Route: /internships</span>
          </div>
          <h1
            className={`font-display text-3xl sm:text-4xl font-bold tracking-tight text-balance ${
              isDark ? 'text-white' : 'text-slate-950'
            }`}
          >
            Engineering &amp; Design Internship Tracks
          </h1>
          <p
            className={`text-sm sm:text-base leading-relaxed ${
              isDark ? 'text-slate-300' : 'text-slate-600'
            }`}
          >
            Explore Lovanstrix’s structured learning and project internship tracks. Tracks marked as{' '}
            <strong>Upcoming</strong> are example curriculum categories preparing for future
            cohorts; applications are accepted only when an administrator publishes a track as{' '}
            <strong>Open</strong>.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3 shrink-0">
          <button
            type="button"
            onClick={onNavigateStudentDashboard}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold transition-colors whitespace-nowrap shrink-0"
          >
            <span>Student Dashboard (/student-dashboard)</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Transparency & Disclosure Notice */}
      <div
        className={`rounded-2xl border p-6 ${
          isDark ? 'bg-[#090F21] border-slate-800' : 'bg-slate-50 border-slate-200'
        }`}
      >
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-xs leading-relaxed">
          <div>
            <p className="font-semibold text-blue-400 mb-1">
              1. Honest Status &amp; Stipend Disclosure
            </p>
            <p className={isDark ? 'text-slate-300' : 'text-slate-600'}>
              Each listing clearly states whether it is <strong>Open</strong>,{' '}
              <strong>Upcoming</strong>, or <strong>Closed</strong>, along with work mode (Remote /
              Hybrid / On-Site) and whether it is unpaid academic learning or carries a stipend.
            </p>
          </div>
          <div>
            <p className="font-semibold text-blue-400 mb-1">
              2. Selection &amp; Certification Policy
            </p>
            <p className={isDark ? 'text-slate-300' : 'text-slate-600'}>
              Submitting an application never automatically guarantees selection, employment, or a
              completion certificate. Certificates are issued strictly after verified project
              completion and administrator approval.
            </p>
          </div>
          <div>
            <p className="font-semibold text-blue-400 mb-1">
              3. Private Resume &amp; Data Protection
            </p>
            <p className={isDark ? 'text-slate-300' : 'text-slate-600'}>
              Uploaded resumes are stored in private server storage and are never exposed via public
              URLs. Students can view only their own applications and documents.
            </p>
          </div>
        </div>
      </div>

      {/* Filters & Search Bar */}
      <div className="space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          {/* Department Tabs */}
          <div
            className={`flex flex-wrap items-center gap-1 p-1 rounded-xl border ${
              isDark ? 'bg-[#090F21] border-slate-800' : 'bg-slate-100 border-slate-200'
            }`}
            role="tablist"
            aria-label="Filter internships by department"
          >
            {DEPARTMENTS.map((dept) => (
              <button
                key={dept}
                type="button"
                onClick={() => setSelectedDept(dept)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors whitespace-nowrap shrink-0 ${
                  selectedDept === dept
                    ? 'bg-blue-600 text-white'
                    : isDark
                    ? 'text-slate-400 hover:text-white'
                    : 'text-slate-600 hover:text-slate-950'
                }`}
              >
                {dept}
              </button>
            ))}
          </div>

          {/* Search & Status Filter */}
          <div className="flex flex-wrap items-center gap-3">
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search role or tech stack..."
                className={`pl-8 pr-3 py-1.5 rounded-lg border text-xs focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  isDark
                    ? 'bg-[#050814] border-slate-800 text-white placeholder:text-slate-500'
                    : 'bg-white border-slate-300 text-slate-900 placeholder:text-slate-400'
                }`}
              />
            </div>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as typeof statusFilter)}
              aria-label="Filter by internship status"
              className={`rounded-lg border px-3 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                isDark
                  ? 'bg-[#050814] border-slate-800 text-white'
                  : 'bg-white border-slate-300 text-slate-900'
              }`}
            >
              <option value="All">All Statuses</option>
              <option value="Open">Open Only ({openListings.length})</option>
              <option value="Upcoming">Upcoming</option>
              <option value="Closed">Closed</option>
            </select>
          </div>
        </div>

        {/* Listings Grid */}
        {visibleListings.length === 0 ? (
          <div
            className={`rounded-2xl border p-12 text-center ${
              isDark ? 'bg-[#0B1224] border-slate-800' : 'bg-white border-slate-200'
            }`}
          >
            <p className="text-sm font-semibold">No Matching Internship Tracks Found</p>
            <p className="text-xs text-slate-400 mt-1">
              Try clearing your search query or switching the department/status filter.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {visibleListings.map((listing) => {
              const isOpen = listing.status === 'Open';
              return (
                <article
                  key={listing.id}
                  className={`rounded-2xl border p-7 flex flex-col justify-between transition-colors ${
                    isDark
                      ? 'bg-[#0B1224] border-slate-800 hover:border-slate-700'
                      : 'bg-white border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <div className="space-y-4">
                    {/* Unboxed Metadata Header */}
                    <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
                      <span className="font-mono text-blue-400 tabular-nums">
                        {listing.code} · {listing.department}
                      </span>
                      <span
                        className={`font-semibold ${
                          listing.status === 'Open'
                            ? 'text-emerald-400'
                            : listing.status === 'Upcoming'
                            ? 'text-amber-400'
                            : 'text-slate-400'
                        }`}
                      >
                        Status: {listing.status}
                        {typeof listing.positionsCount === 'number'
                          ? ` · ${listing.positionsCount} Position${
                              listing.positionsCount === 1 ? '' : 's'
                            }`
                          : ''}
                      </span>
                    </div>

                    <div>
                      <h2
                        className={`font-display text-xl font-bold tracking-tight ${
                          isDark ? 'text-white' : 'text-slate-900'
                        }`}
                      >
                        {listing.title}
                      </h2>
                      <p
                        className={`mt-2 text-xs sm:text-sm leading-relaxed ${
                          isDark ? 'text-slate-300' : 'text-slate-600'
                        }`}
                      >
                        {listing.description}
                      </p>
                    </div>

                    {/* Key Specs Grid */}
                    <div
                      className={`grid grid-cols-2 gap-3 rounded-xl border p-3.5 text-xs ${
                        isDark
                          ? 'bg-[#050814] border-slate-800/90'
                          : 'bg-slate-50 border-slate-200'
                      }`}
                    >
                      <div>
                        <span className="text-slate-400 block">Mode &amp; Duration:</span>
                        <strong className={isDark ? 'text-slate-200' : 'text-slate-800'}>
                          {listing.workMode} · {listing.duration}
                        </strong>
                      </div>
                      <div>
                        <span className="text-slate-400 block">Time Commitment:</span>
                        <strong className={isDark ? 'text-slate-200' : 'text-slate-800'}>
                          {listing.weeklyCommitment}
                        </strong>
                      </div>
                      <div>
                        <span className="text-slate-400 block">Compensation:</span>
                        <strong className={isDark ? 'text-slate-200' : 'text-slate-800'}>
                          {listing.compensationType}
                        </strong>
                      </div>
                      <div>
                        <span className="text-slate-400 block">Application Deadline:</span>
                        <strong className="font-mono tabular-nums text-blue-400">
                          {listing.deadline}
                        </strong>
                      </div>
                    </div>

                    {/* Eligibility, Learning Objectives & Selection Criteria */}
                    <div className="space-y-2 text-xs">
                      <p className={isDark ? 'text-slate-300' : 'text-slate-700'}>
                        <strong>Eligibility:</strong> {listing.eligibility}
                      </p>
                      <p className={isDark ? 'text-slate-300' : 'text-slate-700'}>
                        <strong>Stipend Details:</strong> {listing.stipendDetails}
                      </p>
                      <div>
                        <p className="font-semibold text-blue-400 mb-1">Learning Objectives:</p>
                        <ul className="space-y-1">
                          {listing.learningObjectives.map((obj, idx) => (
                            <li
                              key={idx}
                              className={`flex items-start gap-2 ${
                                isDark ? 'text-slate-300' : 'text-slate-600'
                              }`}
                            >
                              <Check className="w-3.5 h-3.5 text-blue-400 shrink-0 mt-0.5" />
                              <span>{obj}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                      <p className="text-slate-400 pt-1">
                        <strong>Selection Criteria:</strong> {listing.selectionCriteria}
                      </p>
                    </div>
                  </div>

                  {/* Card Footer */}
                  <div className="mt-6 pt-4 border-t border-slate-800/60 flex flex-wrap items-center justify-between gap-4">
                    <span className="text-xs font-mono text-slate-400">
                      {listing.techStack.join(' · ')}
                    </span>

                    {isOpen ? (
                      <button
                        type="button"
                        onClick={() => handleApplyClick(listing)}
                        className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold transition-colors whitespace-nowrap shrink-0"
                      >
                        <span>Apply Now</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    ) : (
                      <span className="text-xs text-slate-400 font-medium">
                        {listing.status === 'Upcoming'
                          ? 'Applications Open When Published by Admin'
                          : 'Applications Closed'}
                      </span>
                    )}
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </div>

      {/* Student Application Form */}
      <section
        id="student-application-form"
        className={`rounded-2xl border p-7 sm:p-10 ${
          isDark ? 'bg-[#090F21] border-slate-800' : 'bg-slate-50 border-slate-200'
        }`}
      >
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
          <div className="lg:col-span-4 space-y-4">
            <p className="text-xs font-medium text-blue-400">
              Official Student Application Form
            </p>
            <h2
              className={`font-display text-2xl font-bold tracking-tight ${
                isDark ? 'text-white' : 'text-slate-900'
              }`}
            >
              Apply for an Open Internship Track
            </h2>
            <p
              className={`text-xs sm:text-sm leading-relaxed ${
                isDark ? 'text-slate-300' : 'text-slate-600'
              }`}
            >
              Applications are accepted only for tracks published with status <strong>Open</strong>.
              Upon server confirmation, you will receive a unique{' '}
              <strong>Application Reference Number</strong> and <strong>Student Access Key</strong>{' '}
              to track your status in <code className="font-mono">/student-dashboard</code>.
            </p>

            {openListings.length === 0 && (
              <div
                className={`rounded-xl border p-4 space-y-2.5 text-xs ${
                  isDark
                    ? 'bg-[#050814] border-amber-500/40 text-amber-200'
                    : 'bg-amber-50 border-amber-200 text-amber-900'
                }`}
              >
                <p className="font-semibold">
                  No Internship Tracks Are Marked &ldquo;Open&rdquo; Yet
                </p>
                <p className="leading-relaxed">
                  In accordance with Lovanstrix’s transparency policy, all initial tracks are set to{' '}
                  <strong>Upcoming</strong> until an administrator publishes a genuine opening.
                </p>
              </div>
            )}

            <div
              className={`rounded-xl border p-4 space-y-2 text-xs ${
                isDark
                  ? 'bg-[#050814] border-slate-800 text-slate-300'
                  : 'bg-white border-slate-200 text-slate-600'
              }`}
            >
              <div className="flex items-center gap-2 font-semibold text-blue-400">
                <Lock className="w-3.5 h-3.5" />
                <span>Applicant privacy</span>
              </div>
              <p className="leading-relaxed">
                Submit accurate details and only the documents requested for the internship. Never share account passwords, API keys, or other private credentials.
              </p>
            </div>
          </div>

          <div className="lg:col-span-8">
            <form
              onSubmit={handleApplicationSubmit}
              noValidate
              className={`rounded-2xl border p-6 sm:p-8 space-y-5 ${
                isDark ? 'bg-[#0B1224] border-slate-800' : 'bg-white border-slate-200'
              }`}
            >
              <div>
                <label className="block text-xs font-medium mb-1.5">
                  Select Open Internship Role *
                </label>
                <select
                  value={selectedListingId || openListings[0]?.id || ''}
                  onChange={(e) => setSelectedListingId(e.target.value)}
                  disabled={openListings.length === 0}
                  className={`w-full rounded-lg border px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    isDark
                      ? 'bg-[#050814] border-slate-700 text-white disabled:opacity-50'
                      : 'bg-white border-slate-300 text-slate-900 disabled:opacity-50'
                  }`}
                >
                  {openListings.length === 0 ? (
                    <option value="">
                      No internship openings are currently available
                    </option>
                  ) : (
                    openListings.map((l) => (
                      <option key={l.id} value={l.id}>
                        {l.code} — {l.title} ({l.department} · {l.workMode})
                      </option>
                    ))
                  )}
                </select>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-medium mb-1.5">Full Legal Name *</label>
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Ananya Deshmukh"
                    className={`w-full rounded-lg border px-3.5 py-2 text-sm ${
                      isDark
                        ? 'bg-[#050814] border-slate-700 text-white'
                        : 'bg-white border-slate-300 text-slate-900'
                    }`}
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium mb-1.5">Email Address *</label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="ananya@university.edu"
                    className={`w-full rounded-lg border px-3.5 py-2 text-sm ${
                      isDark
                        ? 'bg-[#050814] border-slate-700 text-white'
                        : 'bg-white border-slate-300 text-slate-900'
                    }`}
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium mb-1.5">
                    Phone Number (Optional)
                  </label>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+91 98765 43210"
                    className={`w-full rounded-lg border px-3.5 py-2 text-sm ${
                      isDark
                        ? 'bg-[#050814] border-slate-700 text-white'
                        : 'bg-white border-slate-300 text-slate-900'
                    }`}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium mb-1.5">
                    College / Institution *
                  </label>
                  <input
                    type="text"
                    required
                    value={college}
                    onChange={(e) => setCollege(e.target.value)}
                    placeholder="Institute of Engineering & Technology"
                    className={`w-full rounded-lg border px-3.5 py-2 text-sm ${
                      isDark
                        ? 'bg-[#050814] border-slate-700 text-white'
                        : 'bg-white border-slate-300 text-slate-900'
                    }`}
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium mb-1.5">
                    Course &amp; Current Study Year *
                  </label>
                  <input
                    type="text"
                    required
                    value={courseAndYear}
                    onChange={(e) => setCourseAndYear(e.target.value)}
                    placeholder="B.Tech Computer Science — 3rd Year"
                    className={`w-full rounded-lg border px-3.5 py-2 text-sm ${
                      isDark
                        ? 'bg-[#050814] border-slate-700 text-white'
                        : 'bg-white border-slate-300 text-slate-900'
                    }`}
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium mb-1.5">
                  Technical / Design Skills (Comma-separated) *
                </label>
                <input
                  type="text"
                  required
                  value={skillsInput}
                  onChange={(e) => setSkillsInput(e.target.value)}
                  placeholder="React, TypeScript, Tailwind CSS, Node.js, Git"
                  className={`w-full rounded-lg border px-3.5 py-2 text-sm ${
                    isDark
                      ? 'bg-[#050814] border-slate-700 text-white'
                      : 'bg-white border-slate-300 text-slate-900'
                  }`}
                />
              </div>

              {/* Private Resume Upload OR Portfolio URL */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium mb-1.5">
                    Private Resume Upload (PDF/DOCX, max 2 MB) *
                  </label>
                  <label
                    className={`flex items-center justify-between gap-2 rounded-lg border border-dashed px-3.5 py-2 text-xs cursor-pointer ${
                      isDark
                        ? 'bg-[#050814] border-slate-700 text-slate-300 hover:border-blue-500'
                        : 'bg-slate-50 border-slate-300 text-slate-700 hover:border-blue-500'
                    }`}
                  >
                    <span className="inline-flex items-center gap-2 truncate">
                      {resumeFile ? (
                        <>
                          <FileText className="w-4 h-4 text-emerald-400 shrink-0" />
                          <span className="truncate">
                            {resumeFile.name} ({Math.round(resumeFile.size / 1024)} KB)
                          </span>
                        </>
                      ) : (
                        <>
                          <Upload className="w-4 h-4 text-blue-400 shrink-0" />
                          <span>Choose PDF or DOCX file...</span>
                        </>
                      )}
                    </span>
                    <input
                      type="file"
                      accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                      onChange={handleResumeUpload}
                      className="hidden"
                    />
                  </label>
                </div>

                <div>
                  <label className="block text-xs font-medium mb-1.5">
                    Portfolio URL (Required if no resume file uploaded)
                  </label>
                  <input
                    type="url"
                    value={portfolioUrl}
                    onChange={(e) => setPortfolioUrl(e.target.value)}
                    placeholder="https://yourportfolio.dev"
                    className={`w-full rounded-lg border px-3.5 py-2 text-sm ${
                      isDark
                        ? 'bg-[#050814] border-slate-700 text-white'
                        : 'bg-white border-slate-300 text-slate-900'
                    }`}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium mb-1.5">
                    GitHub Profile URL (Optional)
                  </label>
                  <input
                    type="url"
                    value={githubUrl}
                    onChange={(e) => setGithubUrl(e.target.value)}
                    placeholder="https://github.com/username"
                    className={`w-full rounded-lg border px-3.5 py-2 text-sm ${
                      isDark
                        ? 'bg-[#050814] border-slate-700 text-white'
                        : 'bg-white border-slate-300 text-slate-900'
                    }`}
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium mb-1.5">
                    LinkedIn Profile URL (Optional)
                  </label>
                  <input
                    type="url"
                    value={linkedinUrl}
                    onChange={(e) => setLinkedinUrl(e.target.value)}
                    placeholder="https://linkedin.com/in/username"
                    className={`w-full rounded-lg border px-3.5 py-2 text-sm ${
                      isDark
                        ? 'bg-[#050814] border-slate-700 text-white'
                        : 'bg-white border-slate-300 text-slate-900'
                    }`}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium mb-1.5">
                    Weekly Availability *
                  </label>
                  <input
                    type="text"
                    required
                    value={availability}
                    onChange={(e) => setAvailability(e.target.value)}
                    placeholder="12–15 hours / week"
                    className={`w-full rounded-lg border px-3.5 py-2 text-sm ${
                      isDark
                        ? 'bg-[#050814] border-slate-700 text-white'
                        : 'bg-white border-slate-300 text-slate-900'
                    }`}
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium mb-1.5">
                    Preferred Start Date *
                  </label>
                  <input
                    type="date"
                    required
                    value={preferredStartDate}
                    onChange={(e) => setPreferredStartDate(e.target.value)}
                    className={`w-full rounded-lg border px-3.5 py-2 text-sm ${
                      isDark
                        ? 'bg-[#050814] border-slate-700 text-white'
                        : 'bg-white border-slate-300 text-slate-900'
                    }`}
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium mb-1.5">
                  Short Motivation Statement (Why this track &amp; what you want to build) *
                </label>
                <textarea
                  rows={3}
                  required
                  value={motivation}
                  onChange={(e) => setMotivation(e.target.value)}
                  placeholder="Share projects you have worked on and what you hope to learn during this internship..."
                  className={`w-full rounded-lg border px-3.5 py-2 text-sm ${
                    isDark
                      ? 'bg-[#050814] border-slate-700 text-white'
                      : 'bg-white border-slate-300 text-slate-900'
                  }`}
                />
              </div>

              <label className="flex items-start gap-2.5 text-xs cursor-pointer">
                <input
                  type="checkbox"
                  checked={privacyConsent}
                  onChange={(e) => setPrivacyConsent(e.target.checked)}
                  className="mt-0.5 rounded border-slate-600"
                />
                <span className={isDark ? 'text-slate-300' : 'text-slate-700'}>
                  I consent to Lovanstrix storing my application and resume privately for
                  internship evaluation. I understand that applying does not automatically guarantee
                  selection, a stipend, employment, or a completion certificate. *
                </span>
              </label>

              {formError && (
                <div
                  role="alert"
                  className="flex items-start gap-2.5 rounded-lg border border-rose-500/40 bg-rose-500/10 p-3.5 text-xs text-rose-300"
                >
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-400" />
                  <span>{formError}</span>
                </div>
              )}

              {confirmationData && (
                <div
                  role="status"
                  className="rounded-xl border border-emerald-500/40 bg-emerald-500/10 p-5 text-xs text-emerald-100 space-y-3"
                >
                  <div className="flex items-center gap-2 font-semibold text-emerald-300 text-sm">
                    <CheckCircle2 className="w-4 h-4 shrink-0" />
                    <span>Application Confirmed by Server</span>
                  </div>
                  <p className="leading-relaxed">{confirmationData.notice}</p>
                  <div className="rounded-lg bg-[#050814] border border-slate-800 p-3.5 font-mono space-y-1 text-slate-200">
                    <p>
                      Application Reference:{' '}
                      <strong className="text-blue-400">{confirmationData.referenceNumber}</strong>
                    </p>
                    <p>
                      Student Access Key:{' '}
                      <strong className="text-emerald-400">{confirmationData.accessKey}</strong>
                    </p>
                    <p>Applicant Email: {confirmationData.email}</p>
                  </div>
                  <div className="pt-1">
                    <button
                      type="button"
                      onClick={onNavigateStudentDashboard}
                      className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold"
                    >
                      <ShieldCheck className="w-3.5 h-3.5" />
                      <span>Open Student Dashboard to Track Status →</span>
                    </button>
                  </div>
                </div>
              )}

              <button
                type="submit"
                disabled={submitting || openListings.length === 0}
                className="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-gradient-to-r from-blue-600 to-violet-600 hover:from-blue-500 hover:to-violet-500 disabled:opacity-50 text-white text-xs font-semibold transition-all whitespace-nowrap shrink-0"
              >
                <Send className="w-3.5 h-3.5" />
                <span>
                  {submitting ? 'Confirming With Server...' : 'Submit Internship Application'}
                </span>
              </button>
            </form>
          </div>
        </div>
      </section>
    </div>
  );
};
