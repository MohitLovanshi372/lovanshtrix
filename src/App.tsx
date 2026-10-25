/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  ArrowRight,
  Award,
  Box,
  Check,
  ChevronDown,
  Code2,
  Compass,
  ExternalLink,
  GraduationCap,
  HelpCircle,
  Layers,
  Menu,
  Moon,
  Settings,
  ShieldCheck,
  Sparkles,
  Sun,
  UserCheck,
  X,
} from 'lucide-react';
import {
  BusinessSolutionItem,
  CareerOpening,
  CompanyDetails,
  ExplorationArea,
  INITIAL_STORE,
  InternshipListing,
  NavSection,
  ProjectCategory,
  ProjectItem,
  ServiceItem,
  SystemConfigStatus,
} from './types/lovanstrix';
import {
  HeroGeometricIllustration,
  LovanstrixMark,
  ProjectVisualCanvas,
} from './components/BrandVisuals';
import { HomePage } from './components/HomePage';
import { ScrollBackdrop } from './components/Motion';
import { IntroSplash } from './components/IntroSplash';
import { ServiceDetailView } from './components/ServiceDetailView';
import { SolutionsSection } from './components/SolutionsSection';
import { CareersSection } from './components/CareersSection';
import { ContactQuoteSection } from './components/ContactQuoteSection';
import { AdminConsoleSection } from './components/AdminConsoleSection';
import { InternshipPortalSection } from './components/InternshipPortalSection';
import { StudentDashboardSection } from './components/StudentDashboardSection';
import { AdminInternshipsSection } from './components/AdminInternshipsSection';
import { CertificateVerificationSection } from './components/CertificateVerificationSection';

const APPROACH_STEPS = [
  {
    step: '01',
    name: 'Discover',
    detail:
      'Understand your core objective, target users, operational bottlenecks, and realistic MVP scope.',
  },
  {
    step: '02',
    name: 'Plan',
    detail:
      'Define page architecture, database schemas, API boundaries, and transparent delivery milestones.',
  },
  {
    step: '03',
    name: 'Design',
    detail:
      'Craft high-contrast interfaces, responsive mobile-to-desktop layouts, and accessible user flows.',
  },
  {
    step: '04',
    name: 'Develop',
    detail:
      'Write modular TypeScript, React, and Node.js code with validated forms and secure backend routes.',
  },
  {
    step: '05',
    name: 'Test',
    detail:
      'Audit keyboard navigation, input validation states, cross-device responsiveness, and load speed.',
  },
  {
    step: '06',
    name: 'Launch',
    detail:
      'Deploy to production hosting with SSL, SEO structured data, and clear operational documentation.',
  },
];

const CORE_VALUES = [
  {
    index: '01',
    title: 'Innovation',
    description:
      'Turning practical ideas into working software prototypes, interactive 3D interfaces, and modern web applications.',
  },
  {
    index: '02',
    title: 'Transparency',
    description:
      'Communicating honestly about our early-stage capabilities, realistic timelines, and technical trade-offs.',
  },
  {
    index: '03',
    title: 'Continuous Learning',
    description:
      'Staying grounded in modern engineering standards while building structured pathways for future student interns.',
  },
  {
    index: '04',
    title: 'Quality',
    description:
      'Prioritizing maintainable TypeScript architectures, strict input validation, accessibility, and clean UX.',
  },
];

const WHY_WORK_WITH_US = [
  {
    code: '01',
    title: 'Direct Founder-Led Engineering',
    description:
      'Work directly with the software architect writing your code—avoiding multi-layer agency handoffs and miscommunication.',
  },
  {
    code: '02',
    title: 'Honest Scoping & Milestone Clarity',
    description:
      'Every project is broken into verifiable deliverables so you know exactly what is included, what requires third-party credentials, and when it ships.',
  },
  {
    code: '03',
    title: 'Clean, Ownership-Ready Codebases',
    description:
      'We build with widely adopted standards (React, TypeScript, Node.js, Tailwind CSS, SQL/Firestore) so your team owns a maintainable asset without vendor lock-in.',
  },
  {
    code: '04',
    title: 'Security & Server-Side Discipline',
    description:
      'API keys, AI model calls, and webhook credentials are isolated strictly on the backend—never exposed in client bundles.',
  },
];

const HOMEPAGE_FAQS = [
  {
    question: 'What types of clients and projects does Lovanstrix work with?',
    answer:
      'We partner with founders, independent professionals, startups, and growing businesses looking to build business websites, custom web applications, e-commerce catalogues, UI/UX systems, or practical AI integrations.',
  },
  {
    question: 'Is Lovanstrix a large established agency or an early-stage startup?',
    answer:
      'Lovanstrix is an emerging technology venture. We are transparent about our early stage: we do not display fabricated client logos or fake testimonials, and every prototype in our portfolio is clearly labeled by its actual development status.',
  },
  {
    question: 'How does the Request a Quote and project onboarding process work?',
    answer:
      'Submit your project requirements, timeline, and budget range via our Request a Quote form. We review your brief, clarify technical requirements, and provide a written scope and milestone roadmap before any development begins.',
  },
  {
    question: 'Can Lovanstrix integrate payment gateways, emails, or AI into my existing website?',
    answer:
      'Yes. We build clean backend API routes for Gemini AI workflows, email webhooks, and payment or shipping integrations. Live payment processing and external webhooks are activated once your merchant or API credentials are configured.',
  },
  {
    question: 'How do student internships and certificate verification work at Lovanstrix?',
    answer:
      'Our dedicated Internship Portal (/internships) lists learning-focused tracks across Frontend, Backend, Full-Stack, UI/UX, AI/ML, and IoT. Applications are accepted only when an administrator publishes an opening as Open, and completion certificates are verifiable at /verify-certificate.',
  },
];

const TECH_STACK_GROUPS = [
  {
    category: 'Frontend & Interactive 3D Architecture',
    items: ['React 19', 'TypeScript', 'Three.js / WebGL', 'Tailwind CSS', 'HTML5 & Semantic SEO'],
  },
  {
    category: 'Backend & API Engineering',
    items: ['Node.js', 'Express', 'RESTful APIs', 'Server-Side Proxy Routes', 'Schema Validation'],
  },
  {
    category: 'Data, E-Commerce & Applied AI',
    items: [
      'Gemini API (Server-Side)',
      'PostgreSQL / SQL',
      'Firebase / Firestore',
      'Official PDF Engine',
      'Webhook Integrations',
    ],
  },
];

function parseInitialRoute(): {
  section: NavSection;
  certId: string;
  serviceSlug: string;
} {
  if (typeof window === 'undefined') {
    return { section: 'home', certId: '', serviceSlug: '' };
  }
  const pathname = window.location.pathname.replace(/\/+$/, '') || '/';
  if (pathname === '/services') {
    return { section: 'services', certId: '', serviceSlug: '' };
  }
  if (pathname.startsWith('/services/')) {
    const slug = decodeURIComponent(pathname.slice('/services/'.length));
    return { section: 'service-detail', certId: '', serviceSlug: slug };
  }
  if (pathname === '/solutions') return { section: 'solutions', certId: '', serviceSlug: '' };
  if (pathname === '/our-work' || pathname === '/projects') {
    return { section: 'projects', certId: '', serviceSlug: '' };
  }
  if (pathname === '/about') return { section: 'about', certId: '', serviceSlug: '' };
  if (pathname === '/careers') return { section: 'careers', certId: '', serviceSlug: '' };
  if (pathname === '/contact') return { section: 'contact', certId: '', serviceSlug: '' };
  if (pathname === '/internships') return { section: 'internships', certId: '', serviceSlug: '' };
  if (pathname === '/admin') return { section: 'admin', certId: '', serviceSlug: '' };
  if (pathname === '/student-dashboard') {
    return { section: 'student-dashboard', certId: '', serviceSlug: '' };
  }
  if (pathname === '/admin/internships') {
    return { section: 'admin-internships', certId: '', serviceSlug: '' };
  }
  if (pathname.startsWith('/verify-certificate')) {
    const parts = pathname.split('/');
    const certId = parts[2] ? decodeURIComponent(parts[2]) : '';
    return { section: 'verify-certificate', certId, serviceSlug: '' };
  }
  return { section: 'home', certId: '', serviceSlug: '' };
}

export default function App() {
  const initialRoute = parseInitialRoute();
  const [activeNav, setActiveNav] = useState<NavSection>(initialRoute.section);
  const [selectedServiceSlug, setSelectedServiceSlug] = useState<string>(initialRoute.serviceSlug);
  const [verifyCertId, setVerifyCertId] = useState<string>(initialRoute.certId);
  const [studentSessionPrefill, setStudentSessionPrefill] = useState<
    { email: string; accessKey: string } | undefined
  >(undefined);
  const [heroVisualMode, setHeroVisualMode] = useState<'3d' | '2d'>('3d');
  const [mobileMenuOpen, setMobileMenuOpen] = useState<boolean>(false);
  const [servicesDropdownOpen, setServicesDropdownOpen] = useState<boolean>(false);
  const [openFaqIdx, setOpenFaqIdx] = useState<number | null>(0);
  const [isDark] = useState<boolean>(false);
  const [scrolled, setScrolled] = useState<boolean>(false);
  const dropdownRef = useRef<HTMLDivElement | null>(null);

  // Dynamic Store State loaded from Express Backend
  const [company, setCompany] = useState<CompanyDetails>(INITIAL_STORE.company);
  const [services, setServices] = useState<ServiceItem[]>(INITIAL_STORE.services);
  const [solutions, setSolutions] = useState<BusinessSolutionItem[]>(INITIAL_STORE.solutions);
  const [projects, setProjects] = useState<ProjectItem[]>(INITIAL_STORE.projects);
  const [explorations, setExplorations] = useState<ExplorationArea[]>(INITIAL_STORE.explorations);
  const [openings, setOpenings] = useState<CareerOpening[]>(INITIAL_STORE.openings);
  const [internshipListings, setInternshipListings] = useState<InternshipListing[]>(
    INITIAL_STORE.internshipListings
  );
  const [configStatus, setConfigStatus] = useState<SystemConfigStatus>({
    backendConnected: true,
    databaseAvailable: true,
    adminAuthConfigured: false,
    emailWebhookConfigured: false,
    whatsappConfigured: false,
    geminiConfigured: false,
    signatoryConfigured: false,
    persistenceMode: 'Server Database (JSON Store)',
    emailEndpointPath: '/api/enquiries',
  });

  // Portfolio Filter State
  const [projectFilter, setProjectFilter] = useState<'All' | ProjectCategory>('All');

  // Quote Prefill State
  const [prefillService, setPrefillService] = useState<string | undefined>(undefined);
  const [prefillDescription, setPrefillDescription] = useState<string | undefined>(undefined);

  const loadBootstrapData = useCallback(async () => {
    try {
      const resp = await fetch('/api/bootstrap');
      if (!resp.ok) return;
      const data = await resp.json();
      if (data.company) setCompany(data.company);
      if (Array.isArray(data.services)) setServices(data.services);
      if (Array.isArray(data.solutions)) setSolutions(data.solutions);
      if (Array.isArray(data.projects)) setProjects(data.projects);
      if (Array.isArray(data.explorations)) setExplorations(data.explorations);
      if (Array.isArray(data.openings)) setOpenings(data.openings);
      if (Array.isArray(data.internshipListings)) setInternshipListings(data.internshipListings);
      if (data.configStatus) setConfigStatus(data.configStatus);
    } catch {
      // Fallback to INITIAL_STORE already in state if offline
    }
  }, []);

  useEffect(() => {
    loadBootstrapData();
  }, [loadBootstrapData]);

  useEffect(() => {
    const rootEl = document.documentElement;
    if (isDark) {
      rootEl.classList.add('dark');
    } else {
      rootEl.classList.remove('dark');
    }
  }, [isDark]);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Close Services dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setServicesDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Listen to browser back/forward buttons
  useEffect(() => {
    const handlePopState = () => {
      const parsed = parseInitialRoute();
      setActiveNav(parsed.section);
      if (parsed.certId) setVerifyCertId(parsed.certId);
      if (parsed.serviceSlug) setSelectedServiceSlug(parsed.serviceSlug);
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const navigateTo = (section: NavSection, param?: string) => {
    setActiveNav(section);
    setMobileMenuOpen(false);
    setServicesDropdownOpen(false);

    if (section === 'verify-certificate' && param !== undefined) {
      setVerifyCertId(param);
    }
    if (section === 'service-detail' && param !== undefined) {
      setSelectedServiceSlug(param);
    }

    try {
      const routeMap: Partial<Record<NavSection, string>> = {
        home: '/',
        services: '/services',
        'service-detail': param ? `/services/${encodeURIComponent(param)}` : '/services',
        solutions: '/solutions',
        projects: '/our-work',
        about: '/about',
        careers: '/careers',
        contact: '/contact',
        internships: '/internships',
        'student-dashboard': '/student-dashboard',
        'admin-internships': '/admin/internships',
        admin: '/admin',
        'verify-certificate': param
          ? `/verify-certificate/${encodeURIComponent(param)}`
          : '/verify-certificate',
      };
      const targetUrl = routeMap[section] || `/#${section}`;
      window.history.pushState({}, '', targetUrl);
    } catch {
      // Ignore history errors in restricted sandboxed iframes
    }

    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const openServiceDetail = (srv: ServiceItem) => {
    const slug = srv.slug || srv.id;
    setSelectedServiceSlug(slug);
    navigateTo('service-detail', slug);
  };

  const handleDiscussService = (serviceTitle: string, description?: string) => {
    setPrefillService(serviceTitle);
    if (description) setPrefillDescription(description);
    navigateTo('contact');
  };

  const filteredProjects = projects.filter((p) =>
    projectFilter === 'All' ? true : p.category === projectFilter
  );

  const activeServiceItem =
    services.find((s) => s.slug === selectedServiceSlug || s.id === selectedServiceSlug) ||
    services[0];

  // Primary Header Navigation Links: Home | Services | Solutions | Our Work | About | Careers | Contact
  const navItems: { id: NavSection; label: string }[] = [
    { id: 'home', label: 'Home' },
    { id: 'services', label: 'Services' },
    { id: 'solutions', label: 'Solutions' },
    { id: 'projects', label: 'Our Work' },
    { id: 'about', label: 'About' },
    { id: 'careers', label: 'Careers' },
    { id: 'contact', label: 'Contact' },
  ];

  return (
    <div className="relative z-0 min-h-screen flex flex-col text-[#102B59]">
      <ScrollBackdrop />
      <IntroSplash enabled={initialRoute.section === 'home'} />
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-[60] focus:px-4 focus:py-2 focus:rounded-lg focus:bg-[#155EEF] focus:text-white"
      >
        Skip to main content
      </a>

      {/* STICKY HEADER & NAVIGATION BAR */}
      <header
        className={`sticky top-0 z-40 backdrop-blur-xl border-b transition-all duration-300 ${
          scrolled
            ? 'bg-white/90 border-[#e2e8f4] shadow-[0_8px_24px_-16px_rgba(16,43,89,0.25)]'
            : 'bg-white/70 border-transparent'
        }`}
      >
        <div className="max-w-[1240px] mx-auto flex items-center justify-between gap-6 px-5 sm:px-6 py-3.5">
          <a
            href="/"
            onClick={(e) => {
              e.preventDefault();
              navigateTo('home');
            }}
            aria-label="LOVANSTRIX home"
            className="focus:outline-none focus-visible:ring-2 focus-visible:ring-[#155EEF] rounded-lg shrink-0"
          >
            <LovanstrixMark isDark={false} />
          </a>

          <nav
            className="hidden lg:flex items-center gap-1 text-sm font-medium"
            aria-label="Primary Navigation"
          >
            {navItems.map((item) => {
              const isActive =
                item.id === 'services'
                  ? activeNav === 'services' || activeNav === 'service-detail'
                  : activeNav === item.id ||
                    (item.id === 'careers' &&
                      (activeNav === 'internships' ||
                        activeNav === 'student-dashboard' ||
                        activeNav === 'verify-certificate'));
              const linkClass = `relative px-3 py-2 rounded-lg whitespace-nowrap transition-colors ${
                isActive
                  ? 'text-[#155EEF] font-semibold bg-[#eef4ff]'
                  : 'text-[#34476b] hover:text-[#155EEF] hover:bg-[#f3f7ff]'
              }`;
              const href = `/${
                item.id === 'home' ? '' : item.id === 'projects' ? 'our-work' : item.id
              }`;

              if (item.id === 'services') {
                return (
                  <div key={item.id} className="relative flex items-center" ref={dropdownRef}>
                    <a
                      href={href}
                      aria-current={isActive ? 'page' : undefined}
                      onClick={(e) => {
                        e.preventDefault();
                        navigateTo('services');
                      }}
                      className={linkClass}
                    >
                      Services
                    </a>
                    <button
                      type="button"
                      onClick={() => setServicesDropdownOpen((prev) => !prev)}
                      aria-label="Toggle Services dropdown menu"
                      aria-expanded={servicesDropdownOpen}
                      aria-haspopup="true"
                      className="p-1 -ml-1 rounded text-[#546179] hover:text-[#155EEF]"
                    >
                      <ChevronDown
                        className={`w-3.5 h-3.5 transition-transform ${
                          servicesDropdownOpen ? 'rotate-180 text-[#155EEF]' : ''
                        }`}
                      />
                    </button>

                    {servicesDropdownOpen && (
                      <div className="absolute left-0 top-full mt-3 w-[560px] rounded-2xl border border-[#e2e8f4] bg-white p-5 shadow-[0_24px_48px_-16px_rgba(16,43,89,0.3)] z-50 lx-reveal">
                        <div className="flex items-center justify-between pb-3 mb-3 border-b border-[#e2e8f4]">
                          <div>
                            <p className="text-xs font-semibold text-[#155EEF]">
                              LOVANSTRIX Services
                            </p>
                            <p className="text-[11px] text-[#546179]">
                              Pick a service to see deliverables, tech stack and FAQs
                            </p>
                          </div>
                          <button
                            type="button"
                            onClick={() => navigateTo('services')}
                            className="text-xs font-semibold text-[#155EEF] hover:text-[#104bc4] inline-flex items-center gap-1"
                          >
                            <span>View all ({services.length})</span>
                            <ArrowRight className="w-3 h-3" />
                          </button>
                        </div>
                        <div className="grid grid-cols-2 gap-1.5 max-h-[360px] overflow-y-auto">
                          {services.map((srv) => (
                            <button
                              key={srv.id}
                              type="button"
                              onClick={() => openServiceDetail(srv)}
                              className="text-left p-2.5 rounded-xl transition-colors hover:bg-[#f3f7ff] text-[#102B59]"
                            >
                              <p className="text-xs font-semibold leading-snug">
                                <span className="font-mono text-[#155EEF] mr-1.5">
                                  {srv.index}.
                                </span>
                                {srv.title}
                              </p>
                              <p className="text-[11px] text-[#546179] truncate mt-0.5">
                                {srv.category}
                              </p>
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                );
              }

              return (
                <a
                  key={item.id}
                  href={href}
                  aria-current={isActive ? 'page' : undefined}
                  onClick={(e) => {
                    e.preventDefault();
                    navigateTo(item.id);
                  }}
                  className={linkClass}
                >
                  {item.label}
                </a>
              );
            })}
          </nav>

          <div className="flex items-center gap-3 shrink-0">
            <button
              type="button"
              onClick={() => navigateTo('contact')}
              className="lx-btn-primary hidden sm:inline-flex items-center gap-1.5 px-5 py-2.5 text-sm font-semibold rounded-full whitespace-nowrap focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#155EEF]"
            >
              <span>Let&apos;s Talk</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <button
              type="button"
              onClick={() => setMobileMenuOpen((prev) => !prev)}
              className="lg:hidden p-2.5 rounded-xl border border-[#e2e8f4] text-[#102B59] hover:bg-[#f3f7ff]"
              aria-label={mobileMenuOpen ? 'Close navigation menu' : 'Open navigation menu'}
              aria-expanded={mobileMenuOpen}
              aria-controls="mobile-nav"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {mobileMenuOpen && (
          <div
            id="mobile-nav"
            className="lg:hidden border-t border-[#e2e8f4] bg-white px-5 py-5 space-y-4 max-h-[calc(100vh-64px)] overflow-y-auto"
          >
            <div className="grid grid-cols-2 gap-2">
              {navItems.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => navigateTo(item.id)}
                  aria-current={activeNav === item.id ? 'page' : undefined}
                  className={`text-left px-3.5 py-3 rounded-xl text-sm font-medium ${
                    activeNav === item.id
                      ? 'bg-[#155EEF] text-white'
                      : 'text-[#34476b] bg-[#f3f7ff] hover:bg-[#eaf1ff]'
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>
            <button
              type="button"
              onClick={() => navigateTo('contact')}
              className="lx-btn-primary w-full inline-flex items-center justify-center gap-2 px-5 py-3 text-sm font-semibold rounded-full"
            >
              <span>Let&apos;s Talk</span>
              <ArrowRight className="w-4 h-4" />
            </button>
            <div className="pt-3 border-t border-[#e2e8f4]">
              <p className="text-[11px] font-semibold text-[#155EEF] mb-2">Learning &amp; credentials</p>
              <div className="grid grid-cols-1 gap-1.5">
                {[
                  { id: 'internships' as NavSection, label: 'Internship Portal' },
                  { id: 'student-dashboard' as NavSection, label: 'Application Status / Student Portal' },
                  { id: 'verify-certificate' as NavSection, label: 'Verify Certificate' },
                ].map((l) => (
                  <button
                    key={l.id}
                    type="button"
                    onClick={() => navigateTo(l.id)}
                    className="text-left px-3 py-2.5 rounded-lg text-sm text-[#34476b] hover:bg-[#f3f7ff]"
                  >
                    {l.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </header>

      {/* MAIN CONTENT VIEWPORT */}
      <main
        id="main-content"
        className={
          activeNav === 'home'
            ? 'flex-1 w-full'
            : 'flex-1 max-w-[1240px] w-full mx-auto px-5 sm:px-6 py-10 sm:py-16'
        }
      >
        {/* =========================================================
            1. HOMEPAGE VIEW (ALL 10 MAIN SECTIONS + FOOTER)
        ========================================================= */}
        {activeNav === 'home' && (
          <HomePage
            company={company}
            services={services}
            projects={projects}
            openings={openings}
            internshipListings={internshipListings}
            configStatus={configStatus}
            prefillService={prefillService}
            prefillDescription={prefillDescription}
            onNavigate={(section) => navigateTo(section)}
            onOpenService={openServiceDetail}
            onDiscussService={handleDiscussService}
            onEnquirySubmitted={loadBootstrapData}
          />
        )}

        {/* =========================================================
            2. SERVICES OVERVIEW PAGE (/services)
        ========================================================= */}
        {activeNav === 'services' && (
          <div className="space-y-16">
            <div className="max-w-3xl">
              <p className="text-xs font-medium text-blue-400 mb-2">
                Lovanstrix IT Services Catalog ({services.length} Dedicated Capabilities)
              </p>
              <h1
                className={`font-display text-3xl sm:text-4xl font-bold tracking-tight text-balance ${
                  isDark ? 'text-white' : 'text-slate-950'
                }`}
              >
                End-to-End Web Development, Software Engineering &amp; Applied AI Services
              </h1>
              <p
                className={`mt-4 text-base leading-relaxed ${
                  isDark ? 'text-slate-300' : 'text-slate-600'
                }`}
              >
                Select any service below to view its dedicated detail page—complete with problems
                addressed, included deliverables, technical stack, development process, FAQs, and
                project quote form.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {services.map((srv) => (
                <article
                  key={srv.id}
                  className={`rounded-2xl border p-7 sm:p-8 flex flex-col justify-between transition-colors ${
                    isDark
                      ? 'bg-[#0B1224] border-slate-800 hover:border-blue-500/40'
                      : 'bg-white border-slate-200 hover:border-blue-300'
                  }`}
                >
                  <div>
                    <div className="flex flex-wrap items-center justify-between gap-2 text-xs mb-3">
                      <span className="font-mono text-blue-400 tabular-nums">
                        Service {srv.index} · {srv.category}
                      </span>
                      <span className="text-slate-400">{srv.availability}</span>
                    </div>

                    <h2
                      className={`font-display text-2xl font-bold tracking-tight ${
                        isDark ? 'text-white' : 'text-slate-900'
                      }`}
                    >
                      <button
                        type="button"
                        onClick={() => openServiceDetail(srv)}
                        className="text-left hover:text-blue-400 transition-colors"
                      >
                        {srv.index}. {srv.title}
                      </button>
                    </h2>

                    <p
                      className={`mt-3 text-sm leading-relaxed ${
                        isDark ? 'text-slate-300' : 'text-slate-600'
                      }`}
                    >
                      {srv.summary}
                    </p>

                    <div className="mt-6 pt-5 border-t border-slate-800/60">
                      <p
                        className={`text-xs font-semibold mb-3 ${
                          isDark ? 'text-slate-200' : 'text-slate-800'
                        }`}
                      >
                        Key Deliverables
                      </p>
                      <ul className="space-y-2">
                        {srv.deliverables.map((item, i) => (
                          <li
                            key={i}
                            className={`text-xs flex items-start gap-2.5 leading-relaxed ${
                              isDark ? 'text-slate-300' : 'text-slate-600'
                            }`}
                          >
                            <Check className="w-3.5 h-3.5 text-blue-400 shrink-0 mt-0.5" />
                            <span>{item}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  <div className="mt-8 pt-5 border-t border-slate-800/60 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="text-xs font-mono text-slate-400">
                      {srv.technologies.join(' · ')}
                    </div>
                    <div className="flex items-center gap-2.5 shrink-0">
                      <button
                        type="button"
                        onClick={() => openServiceDetail(srv)}
                        className={`inline-flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-lg border text-xs font-semibold transition-colors whitespace-nowrap ${
                          isDark
                            ? 'border-slate-700 text-slate-200 hover:bg-slate-800'
                            : 'border-slate-300 text-slate-800 hover:bg-slate-100'
                        }`}
                      >
                        <span>Full Details</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDiscussService(srv.title)}
                        className="inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold transition-colors whitespace-nowrap"
                      >
                        <span>Request a Quote</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </div>
        )}

        {/* =========================================================
            2B. INDIVIDUAL SERVICE DETAIL PAGE (/services/:slug)
        ========================================================= */}
        {activeNav === 'service-detail' && activeServiceItem && (
          <ServiceDetailView
            service={activeServiceItem}
            allServices={services}
            company={company}
            configStatus={configStatus}
            isDark={isDark}
            onBackToAllServices={() => navigateTo('services')}
            onSelectService={(slug) => navigateTo('service-detail', slug)}
            onEnquirySubmitted={loadBootstrapData}
            onOpenAdmin={() => navigateTo('admin')}
          />
        )}

        {/* =========================================================
            3. SOLUTIONS & CUSTOM BUSINESS WORKFLOWS (/solutions)
        ========================================================= */}
        {activeNav === 'solutions' && (
          <SolutionsSection
            solutions={solutions}
            explorations={explorations}
            configStatus={configStatus}
            isDark={isDark}
            onStartQuoteWithService={handleDiscussService}
          />
        )}

        {/* =========================================================
            4. PORTFOLIO / OUR WORK (/our-work)
        ========================================================= */}
        {activeNav === 'projects' && (
          <div className="space-y-12">
            <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-8 border-b border-slate-800/80 pb-8">
              <div className="max-w-2xl">
                <p className="text-xs font-medium text-blue-400 mb-2">
                  Our Work · Transparent Engineering Showcase
                </p>
                <h1
                  className={`font-display text-3xl sm:text-4xl font-bold tracking-tight text-balance ${
                    isDark ? 'text-white' : 'text-slate-950'
                  }`}
                >
                  Selected Projects, Demos &amp; Engineering Prototypes
                </h1>
                <p
                  className={`mt-3 text-sm sm:text-base leading-relaxed ${
                    isDark ? 'text-slate-300' : 'text-slate-600'
                  }`}
                >
                  Every item in our portfolio is labeled with its exact development status (
                  <code className="font-mono text-xs text-blue-400">Published Project</code>,{' '}
                  <code className="font-mono text-xs text-blue-400">Demo Project</code>,{' '}
                  <code className="font-mono text-xs text-blue-400">Prototype</code>, or{' '}
                  <code className="font-mono text-xs text-blue-400">In Development</code>).
                </p>
              </div>

              {/* Category Filter Segmented Control */}
              <div
                className={`inline-flex flex-wrap items-center gap-1 p-1 rounded-lg border self-start ${
                  isDark ? 'bg-[#090F21] border-slate-800' : 'bg-slate-100 border-slate-200'
                }`}
                role="tablist"
                aria-label="Filter projects by category"
              >
                {(
                  [
                    'All',
                    'Websites',
                    'Web Applications',
                    'AI Projects',
                    'IoT and Hardware',
                    'Experimental Prototypes',
                  ] as const
                ).map((cat) => (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setProjectFilter(cat)}
                    className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors whitespace-nowrap shrink-0 ${
                      projectFilter === cat
                        ? 'bg-blue-600 text-white'
                        : isDark
                        ? 'text-slate-400 hover:text-white'
                        : 'text-slate-600 hover:text-slate-950'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            {company.portfolioComingSoonMode || filteredProjects.length === 0 ? (
              <div
                className={`rounded-2xl border p-12 text-center space-y-4 ${
                  isDark ? 'bg-[#0B1224] border-slate-800' : 'bg-white border-slate-200'
                }`}
              >
                <Compass className="w-8 h-8 text-blue-400 mx-auto" />
                <h2 className="font-display text-2xl font-bold">
                  Commercial Client Portfolio Coming Soon
                </h2>
                <p className="text-xs sm:text-sm text-slate-400 max-w-xl mx-auto leading-relaxed">
                  Lovanstrix is currently building its initial slate of digital products and client
                  engagements. Rather than displaying fabricated case studies, we publish projects
                  only as they are genuinely delivered.
                </p>
                <div className="pt-2">
                  <button
                    type="button"
                    onClick={() => navigateTo('contact')}
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold"
                  >
                    <span>Discuss Your Project</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {filteredProjects.map((project) => (
                  <article
                    key={project.id}
                    className={`rounded-2xl border overflow-hidden flex flex-col justify-between ${
                      isDark ? 'bg-[#0B1224] border-slate-800' : 'bg-white border-slate-200'
                    }`}
                  >
                    <div>
                      <ProjectVisualCanvas
                        visualType={project.visualType}
                        title={project.title}
                      />

                      <div className="p-7 space-y-4">
                        <div className="flex flex-wrap items-center gap-2 text-xs text-blue-400">
                          <span>{project.category}</span>
                          <span aria-hidden="true">·</span>
                          <span className="font-semibold">{project.classification}</span>
                          <span aria-hidden="true">·</span>
                          <span className="font-mono tabular-nums">{project.publishedAt}</span>
                        </div>

                        <h2
                          className={`font-display text-xl font-bold tracking-tight ${
                            isDark ? 'text-white' : 'text-slate-900'
                          }`}
                        >
                          {project.title}
                        </h2>

                        <p
                          className={`text-sm leading-relaxed ${
                            isDark ? 'text-slate-300' : 'text-slate-600'
                          }`}
                        >
                          {project.objective}
                        </p>

                        {/* Problem & Proposed Solution Breakdown */}
                        {(project.problemStatement || project.proposedSolution) && (
                          <div
                            className={`rounded-xl border p-4 space-y-2.5 text-xs ${
                              isDark
                                ? 'bg-[#070C1B] border-slate-800/90'
                                : 'bg-slate-50 border-slate-200'
                            }`}
                          >
                            {project.problemStatement && (
                              <p
                                className={`leading-relaxed ${
                                  isDark ? 'text-slate-300' : 'text-slate-700'
                                }`}
                              >
                                <strong className="text-blue-400">Problem Addressed:</strong>{' '}
                                {project.problemStatement}
                              </p>
                            )}
                            {project.proposedSolution && (
                              <p
                                className={`leading-relaxed ${
                                  isDark ? 'text-slate-300' : 'text-slate-700'
                                }`}
                              >
                                <strong className="text-emerald-400">Proposed Solution:</strong>{' '}
                                {project.proposedSolution}
                              </p>
                            )}
                          </div>
                        )}

                        {project.features.length > 0 && (
                          <div className="pt-2">
                            <p
                              className={`text-xs font-semibold mb-2 ${
                                isDark ? 'text-slate-200' : 'text-slate-800'
                              }`}
                            >
                              Key Architecture Features
                            </p>
                            <ul className="space-y-1.5">
                              {project.features.map((feat, idx) => (
                                <li
                                  key={idx}
                                  className={`text-xs flex items-start gap-2 leading-relaxed ${
                                    isDark ? 'text-slate-300' : 'text-slate-600'
                                  }`}
                                >
                                  <Check className="w-3.5 h-3.5 text-blue-400 shrink-0 mt-0.5" />
                                  <span>{feat}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="px-7 py-4 border-t border-slate-800/60 flex flex-wrap items-center justify-between gap-4">
                      <span className="text-xs font-mono text-slate-400">
                        {project.technologies.join(' · ')}
                      </span>

                      <div className="flex items-center gap-4 text-xs font-semibold">
                        {project.liveDemoUrl && (
                          <a
                            href={project.liveDemoUrl}
                            onClick={(e) => {
                              if (project.liveDemoUrl?.startsWith('#')) {
                                e.preventDefault();
                                const target = project.liveDemoUrl.slice(1) as NavSection;
                                navigateTo(target);
                              } else if (project.liveDemoUrl === '/internships') {
                                e.preventDefault();
                                navigateTo('internships');
                              }
                            }}
                            className="inline-flex items-center gap-1 text-blue-400 hover:text-blue-300 whitespace-nowrap shrink-0"
                          >
                            <span>{/^https?:\/\//i.test(project.liveDemoUrl) ? 'Explore Live Demo' : 'View related page on this site'}</span>
                            <ArrowRight className="w-3.5 h-3.5" />
                          </a>
                        )}
                        {project.githubUrl && (
                          <a
                            href={project.githubUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 text-slate-400 hover:text-white whitespace-nowrap shrink-0"
                          >
                            <span>GitHub</span>
                            <ExternalLink className="w-3.5 h-3.5" />
                          </a>
                        )}
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </div>
        )}

        {/* =========================================================
            5. ABOUT US PAGE (/about)
        ========================================================= */}
        {activeNav === 'about' && (
          <div className="space-y-16">
            {/* Company Introduction */}
            <div className="max-w-3xl space-y-4">
              <p className="text-xs font-medium text-blue-400">
                About Lovanstrix · Ideas Into Innovation
              </p>
              <h1
                className={`font-display text-3xl sm:text-4xl font-bold tracking-tight text-balance ${
                  isDark ? 'text-white' : 'text-slate-950'
                }`}
              >
                Building Useful, Accessible, and Innovative Digital Solutions
              </h1>
              <p
                className={`text-base leading-relaxed ${
                  isDark ? 'text-slate-300' : 'text-slate-600'
                }`}
              >
                {company.shortIntroduction}
              </p>
              <p
                className={`text-sm leading-relaxed ${
                  isDark ? 'text-slate-400' : 'text-slate-500'
                }`}
              >
                {company.stageDisclosure}
              </p>
            </div>

            {/* Mission & Vision Split */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div
                className={`rounded-2xl border p-8 space-y-3 ${
                  isDark ? 'bg-[#0B1224] border-slate-800' : 'bg-white border-slate-200'
                }`}
              >
                <p className="text-xs font-mono text-blue-400">01 · Our Mission</p>
                <h2
                  className={`font-display text-2xl font-bold ${
                    isDark ? 'text-white' : 'text-slate-900'
                  }`}
                >
                  {company.mission}
                </h2>
                <p
                  className={`text-sm leading-relaxed ${
                    isDark ? 'text-slate-300' : 'text-slate-600'
                  }`}
                >
                  We believe well-engineered digital tools should not be restricted to large
                  enterprises. We focus on clean architectures, transparent scoping, and practical
                  software that solves real operational problems.
                </p>
              </div>

              <div
                className={`rounded-2xl border p-8 space-y-3 ${
                  isDark ? 'bg-[#0B1224] border-slate-800' : 'bg-white border-slate-200'
                }`}
              >
                <p className="text-xs font-mono text-blue-400">02 · Our Vision</p>
                <h2
                  className={`font-display text-2xl font-bold ${
                    isDark ? 'text-white' : 'text-slate-900'
                  }`}
                >
                  Grow Into a Multidisciplinary Technology Company
                </h2>
                <p
                  className={`text-sm leading-relaxed ${
                    isDark ? 'text-slate-300' : 'text-slate-600'
                  }`}
                >
                  {company.vision}
                </p>
              </div>
            </div>

            {/* Founder Introduction Section */}
            <section
              className={`rounded-2xl border p-8 sm:p-10 ${
                isDark ? 'bg-[#090F21] border-slate-800' : 'bg-white border-slate-200'
              }`}
            >
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
                <div className="lg:col-span-8 space-y-3">
                  <p className="text-xs font-mono text-blue-400">
                    03 · Founder Introduction &amp; Engineering Philosophy
                  </p>
                  <h2
                    className={`font-display text-2xl font-bold ${
                      isDark ? 'text-white' : 'text-slate-900'
                    }`}
                  >
                    {company.founderName || 'Lovanstrix Founding Engineering Lead'}
                  </h2>
                  <p className="text-xs font-semibold text-blue-400">
                    {company.founderRole || 'Founder & Principal Software Architect'}
                  </p>
                  <p
                    className={`text-sm leading-relaxed pt-1 ${
                      isDark ? 'text-slate-300' : 'text-slate-600'
                    }`}
                  >
                    {company.founderBio ||
                      'Lovanstrix was founded with a commitment to direct, transparent software craftsmanship—working closely with founders, students, and early-stage businesses to turn practical ideas into dependable web applications without inflated agency claims.'}
                  </p>
                </div>

                <div
                  className={`lg:col-span-4 rounded-xl border p-6 space-y-3 ${
                    isDark ? 'bg-[#050814] border-slate-800' : 'bg-slate-50 border-slate-200'
                  }`}
                >
                  <p className="text-xs font-semibold text-blue-400">Current Focus Areas</p>
                  <ul
                    className={`space-y-2 text-xs ${
                      isDark ? 'text-slate-300' : 'text-slate-700'
                    }`}
                  >
                    <li className="flex items-start gap-2">
                      <Check className="w-3.5 h-3.5 text-blue-400 shrink-0 mt-0.5" />
                      <span>Custom Websites, Landing Pages &amp; E-Commerce</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Check className="w-3.5 h-3.5 text-blue-400 shrink-0 mt-0.5" />
                      <span>Full-Stack Web Applications &amp; Portals</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Check className="w-3.5 h-3.5 text-blue-400 shrink-0 mt-0.5" />
                      <span>Server-Side AI Integration &amp; Automation</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Check className="w-3.5 h-3.5 text-blue-400 shrink-0 mt-0.5" />
                      <span>Mentored Student Internship Tracks</span>
                    </li>
                  </ul>
                </div>
              </div>
            </section>

            {/* Core Values */}
            <section className="space-y-6">
              <div>
                <p className="text-xs font-medium text-blue-400 mb-1">Guiding Principles</p>
                <h2
                  className={`font-display text-2xl font-bold tracking-tight ${
                    isDark ? 'text-white' : 'text-slate-900'
                  }`}
                >
                  Core Values: Innovation, Transparency, Continuous Learning &amp; Quality
                </h2>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                {CORE_VALUES.map((val) => (
                  <div
                    key={val.index}
                    className={`rounded-2xl border p-6 space-y-2 ${
                      isDark ? 'bg-[#090F21] border-slate-800' : 'bg-white border-slate-200'
                    }`}
                  >
                    <span className="text-xs font-mono text-blue-400 tabular-nums">
                      {val.index}
                    </span>
                    <h3
                      className={`font-display text-base font-semibold ${
                        isDark ? 'text-white' : 'text-slate-900'
                      }`}
                    >
                      {val.title}
                    </h3>
                    <p
                      className={`text-xs leading-relaxed ${
                        isDark ? 'text-slate-300' : 'text-slate-600'
                      }`}
                    >
                      {val.description}
                    </p>
                  </div>
                ))}
              </div>
            </section>

            {/* Long-Term Focus Horizon */}
            <section
              className={`rounded-2xl border p-8 sm:p-10 ${
                isDark ? 'bg-[#0B1224] border-slate-800' : 'bg-slate-50 border-slate-200'
              }`}
            >
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
                <div className="lg:col-span-8 space-y-3">
                  <div className="flex items-center gap-2 text-xs font-medium text-blue-400">
                    <Layers className="w-4 h-4" />
                    <span>Long-Term Technology Roadmap</span>
                  </div>
                  <h2
                    className={`font-display text-2xl font-bold ${
                      isDark ? 'text-white' : 'text-slate-900'
                    }`}
                  >
                    From Web &amp; AI Software Toward Hardware, IoT, and Emerging Tech
                  </h2>
                  <p
                    className={`text-sm leading-relaxed ${
                      isDark ? 'text-slate-300' : 'text-slate-600'
                    }`}
                  >
                    While Lovanstrix’s immediate commercial focus is web development, custom web
                    applications, e-commerce, and applied AI integration, our long-term roadmap
                    includes exploring connected IoT telemetry, healthcare and agriculture software
                    tools, and robotics interfaces as our engineering team grows.
                  </p>
                </div>
                <div className="lg:col-span-4 flex lg:justify-end">
                  <button
                    type="button"
                    onClick={() => navigateTo('solutions')}
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold whitespace-nowrap shrink-0"
                  >
                    <span>Explore Our Solutions &amp; Roadmap</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </section>
          </div>
        )}

        {/* =========================================================
            6. PUBLIC INTERNSHIPS PORTAL (/internships)
        ========================================================= */}
        {activeNav === 'internships' && (
          <InternshipPortalSection
            listings={internshipListings}
            configStatus={configStatus}
            isDark={isDark}
            onApplicationSubmitted={(
              email: string,
              referenceNumber: string,
              accessKey: string
            ) => {
              setStudentSessionPrefill({ email, accessKey: referenceNumber || accessKey });
              loadBootstrapData();
            }}
            onNavigateStudentDashboard={() => navigateTo('student-dashboard')}
            onNavigateAdminInternships={() => navigateTo('admin-internships')}
          />
        )}

        {/* =========================================================
            7. STUDENT INTERNSHIP DASHBOARD (/student-dashboard)
        ========================================================= */}
        {activeNav === 'student-dashboard' && (
          <StudentDashboardSection
            initialEmail={studentSessionPrefill?.email}
            initialReference={studentSessionPrefill?.accessKey}
            isDark={isDark}
            onNavigateInternships={() => navigateTo('internships')}
            onNavigateVerifyCertificate={(certId: string) =>
              navigateTo('verify-certificate', certId)
            }
          />
        )}

        {/* =========================================================
            8. ADMIN INTERNSHIP PORTAL (/admin/internships)
        ========================================================= */}
        {activeNav === 'admin-internships' && (
          <AdminInternshipsSection
            isDark={isDark}
            onDataUpdated={loadBootstrapData}
            onNavigateVerifyCertificate={(certId: string) =>
              navigateTo('verify-certificate', certId)
            }
          />
        )}

        {/* =========================================================
            9. PUBLIC CERTIFICATE VERIFICATION (/verify-certificate/:certificateId)
        ========================================================= */}
        {activeNav === 'verify-certificate' && (
          <CertificateVerificationSection
            initialCertificateId={verifyCertId}
            isDark={isDark}
            onNavigateInternships={() => navigateTo('internships')}
          />
        )}

        {/* =========================================================
            10. CAREERS & FUTURE INTERNSHIPS VIEW (/careers)
        ========================================================= */}
        {activeNav === 'careers' && (
          <div className="space-y-12">
            {/* Banner linking to dedicated Internship Management Portal */}
            <div
              className={`rounded-2xl border p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
                isDark ? 'bg-[#090F21] border-blue-500/30' : 'bg-blue-50/70 border-blue-200'
              }`}
            >
              <div className="space-y-1">
                <p className="text-xs font-semibold text-blue-400">
                  Dedicated Student Internship Portal Available (/internships)
                </p>
                <p className={`text-xs ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                  Looking for structured engineering or design internships, application status
                  tracking, offer letters, or certificate verification? Open our dedicated
                  Internship Management Portal.
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-2.5 shrink-0">
                <button
                  type="button"
                  onClick={() => navigateTo('internships')}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold"
                >
                  <GraduationCap className="w-3.5 h-3.5" />
                  <span>Open Internship Portal</span>
                </button>
                <button
                  type="button"
                  onClick={() => navigateTo('student-dashboard')}
                  className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg border text-xs font-semibold ${
                    isDark
                      ? 'border-slate-700 text-slate-200 hover:bg-slate-800'
                      : 'border-slate-300 text-slate-800 hover:bg-white'
                  }`}
                >
                  <span>Student Dashboard</span>
                </button>
              </div>
            </div>

            <CareersSection
              company={company}
              openings={openings}
              isDark={isDark}
              onSubmissionSuccess={loadBootstrapData}
            />
          </div>
        )}

        {/* =========================================================
            11. CONTACT & REQUEST A QUOTE VIEW (/contact)
        ========================================================= */}
        {activeNav === 'contact' && (
          <ContactQuoteSection
            company={company}
            services={services}
            configStatus={configStatus}
            initialService={prefillService}
            initialDescription={prefillDescription}
            isDark={isDark}
            onEnquirySubmitted={loadBootstrapData}
            onOpenAdmin={() => navigateTo('admin')}
          />
        )}

        {/* =========================================================
            12. ADMIN MANAGEMENT & SETUP CONSOLE VIEW
        ========================================================= */}
        {activeNav === 'admin' && (
          <div className="space-y-8">
            <div
              className={`rounded-2xl border p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
                isDark ? 'bg-[#090F21] border-violet-500/30' : 'bg-indigo-50 border-indigo-200'
              }`}
            >
              <div>
                <p className="text-xs font-semibold text-violet-400">
                  Looking for the Internship Management Admin Portal?
                </p>
                <p className={`text-xs mt-0.5 ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
                  Manage internship tracks, review student applications &amp; private resumes, issue
                  Offer Letters, approve completions, and issue verifiable Completion Certificates in{' '}
                  <span className="font-mono">/admin/internships</span>.
                </p>
              </div>
              <button
                type="button"
                onClick={() => navigateTo('admin-internships')}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-violet-600 hover:bg-violet-500 text-white text-xs font-semibold shrink-0"
              >
                <GraduationCap className="w-3.5 h-3.5" />
                <span>Open Internship Admin</span>
              </button>
            </div>

            <AdminConsoleSection isDark={isDark} onDataUpdated={loadBootstrapData} />
          </div>
        )}
      </main>

      {/* SECTION 11: PROFESSIONAL MULTI-COLUMN FOOTER */}
      <footer className="bg-[#102B59] text-[#c7d6f5] mt-0">
        <div className="max-w-[1240px] mx-auto px-5 sm:px-6 pt-16 pb-8 space-y-12">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-10">
            <div className="lg:col-span-4 space-y-4">
              <span className="inline-flex items-center gap-2 font-display text-2xl font-bold tracking-tight text-white">
                <span className="inline-block h-3 w-3 rounded-sm bg-gradient-to-br from-[#5b8cff] to-[#7C5CFA]" aria-hidden="true" />
                LOVANSTRIX
              </span>
              <p className="text-sm font-semibold text-[#8fb4ff]">{company.tagline}</p>
              <p className="text-sm leading-relaxed max-w-sm">
                An early-stage, founder-led IT studio building websites, web applications, backend
                APIs, UI/UX and practical AI integrations.
              </p>
            </div>

            <nav aria-label="Footer services" className="lg:col-span-3 space-y-3">
              <p className="text-sm font-semibold text-white">Services</p>
              <ul className="space-y-2 text-sm">
                {services.slice(0, 6).map((srv) => (
                  <li key={srv.id}>
                    <button
                      type="button"
                      onClick={() => openServiceDetail(srv)}
                      className="text-left hover:text-white transition-colors"
                    >
                      {srv.title}
                    </button>
                  </li>
                ))}
                <li>
                  <button
                    type="button"
                    onClick={() => navigateTo('services')}
                    className="text-left font-semibold text-[#8fb4ff] hover:text-white"
                  >
                    View all {services.length} services →
                  </button>
                </li>
              </ul>
            </nav>

            <nav aria-label="Footer company" className="lg:col-span-3 space-y-3">
              <p className="text-sm font-semibold text-white">Company</p>
              <ul className="space-y-2 text-sm">
                {navItems
                  .filter((i) => i.id !== 'services')
                  .map((item) => (
                    <li key={item.id}>
                      <button
                        type="button"
                        onClick={() => navigateTo(item.id)}
                        className="text-left hover:text-white transition-colors"
                      >
                        {item.label}
                      </button>
                    </li>
                  ))}
                <li>
                  <button type="button" onClick={() => navigateTo('internships')} className="text-left hover:text-white">
                    Internship Portal
                  </button>
                </li>
                <li>
                  <button type="button" onClick={() => navigateTo('student-dashboard')} className="text-left hover:text-white">
                    Application Status
                  </button>
                </li>
                <li>
                  <button type="button" onClick={() => navigateTo('verify-certificate')} className="text-left hover:text-white">
                    Verify Certificate
                  </button>
                </li>
              </ul>
            </nav>

            <div className="lg:col-span-2 space-y-3 text-sm">
              <p className="font-semibold text-white">Contact</p>
              {company.email && (
                <p className="break-all">
                  <a href={`mailto:${company.email}`} className="hover:text-white underline-offset-4 hover:underline">
                    {company.email}
                  </a>
                </p>
              )}
              {company.githubUrl && (
                <p>
                  <a href={company.githubUrl} target="_blank" rel="noopener noreferrer" className="hover:text-white underline-offset-4 hover:underline">
                    GitHub<span className="sr-only"> (opens in a new tab)</span>
                  </a>
                </p>
              )}
              <p className="text-[#8fa6d6]">Remote-first · Transparent scoping</p>
              <button
                type="button"
                onClick={() => navigateTo('contact')}
                className="inline-flex items-center gap-1.5 rounded-full bg-white px-4 py-2 font-semibold text-[#102B59] hover:bg-[#eef4ff] transition-colors"
              >
                <span>Let&apos;s Talk</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div className="pt-6 border-t border-white/15 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[#8fa6d6]">
            <p>
              © {new Date().getFullYear()} {company.name}. All rights reserved.
            </p>
            <div className="flex flex-wrap items-center gap-x-5 gap-y-2">
              <span className="inline-flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5" aria-hidden="true" />
                No fabricated clients or testimonials
              </span>
              <span className="flex items-center gap-4">
                <button type="button" onClick={() => navigateTo('admin')} className="hover:text-white">
                  Admin
                </button>
                <button type="button" onClick={() => navigateTo('admin-internships')} className="hover:text-white">
                  Internship Admin
                </button>
              </span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
