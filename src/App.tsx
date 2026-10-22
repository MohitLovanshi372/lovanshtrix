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
import { Interactive3DCore } from './components/Interactive3DCore';
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
  const [heroVisualMode, setHeroVisualMode] = useState<'3d' | '2d' | 'image'>('image');
  const [mobileMenuOpen, setMobileMenuOpen] = useState<boolean>(false);
  const [servicesDropdownOpen, setServicesDropdownOpen] = useState<boolean>(false);
  const [openFaqIdx, setOpenFaqIdx] = useState<number | null>(0);
  const [isDark, setIsDark] = useState<boolean>(false);
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
    <div
      className={`min-h-screen flex flex-col transition-colors duration-200 ${
        isDark ? 'bg-[#050814] text-slate-100' : 'bg-[#F8FAFC] text-slate-900'
      }`}
    >
      {/* STICKY HEADER & NAVIGATION BAR */}
      <header
        className={`sticky top-0 z-40 backdrop-blur-md border-b transition-colors ${
          isDark ? 'bg-[#050814]/90 border-slate-800/80' : 'bg-white/95 border-slate-200'
        }`}
      >
        <div className="max-w-[1240px] mx-auto flex items-center justify-between gap-6 px-6 py-4">
          {/* Zone 1: Custom LOVANSTRIX Logo linking to Homepage */}
          <a
            href="/"
            onClick={(e) => {
              e.preventDefault();
              navigateTo('home');
            }}
            className="focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 rounded-lg shrink-0"
          >
            <LovanstrixMark isDark={isDark} />
          </a>

          {/* Zone 2: Primary Navigation with Services Dropdown */}
          <nav
            className="hidden lg:flex items-center gap-6 text-sm font-medium"
            aria-label="Primary Navigation"
          >
            {navItems.map((item) => {
              if (item.id === 'services') {
                const isServicesActive =
                  activeNav === 'services' || activeNav === 'service-detail';
                return (
                  <div key={item.id} className="relative" ref={dropdownRef}>
                    <div className="inline-flex items-center gap-1">
                      <a
                        href="/services"
                        onClick={(e) => {
                          e.preventDefault();
                          navigateTo('services');
                        }}
                        className={`py-1 transition-colors whitespace-nowrap shrink-0 border-b-2 ${
                          isServicesActive
                            ? isDark
                              ? 'border-blue-500 text-white font-semibold'
                              : 'border-blue-600 text-slate-950 font-semibold'
                            : isDark
                            ? 'border-transparent text-slate-300 hover:text-white hover:border-slate-600'
                            : 'border-transparent text-slate-600 hover:text-slate-950 hover:border-slate-300'
                        }`}
                      >
                        Services
                      </a>
                      <button
                        type="button"
                        onClick={() => setServicesDropdownOpen((prev) => !prev)}
                        aria-label="Toggle Services dropdown menu"
                        aria-expanded={servicesDropdownOpen}
                        className={`p-1 rounded transition-colors ${
                          isDark
                            ? 'text-slate-400 hover:text-white'
                            : 'text-slate-600 hover:text-slate-950'
                        }`}
                      >
                        <ChevronDown
                          className={`w-3.5 h-3.5 transition-transform ${
                            servicesDropdownOpen ? 'rotate-180 text-blue-400' : ''
                          }`}
                        />
                      </button>
                    </div>

                    {/* Services Dropdown Panel */}
                    {servicesDropdownOpen && (
                      <div
                        className={`absolute left-0 mt-3 w-[560px] rounded-2xl border p-5 shadow-2xl z-50 ${
                          isDark
                            ? 'bg-[#090F21] border-slate-800 text-slate-100'
                            : 'bg-white border-slate-200 text-slate-900'
                        }`}
                      >
                        <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-800/60">
                          <div>
                            <p className="text-xs font-semibold text-blue-400">
                              Lovanstrix IT Services Catalog
                            </p>
                            <p className="text-[11px] text-slate-400">
                              Select any service to inspect deliverables, tech stack, and FAQs
                            </p>
                          </div>
                          <button
                            type="button"
                            onClick={() => navigateTo('services')}
                            className="text-xs font-semibold text-blue-400 hover:text-blue-300 inline-flex items-center gap-1"
                          >
                            <span>View All ({services.length})</span>
                            <ArrowRight className="w-3 h-3" />
                          </button>
                        </div>

                        <div className="grid grid-cols-2 gap-1.5 max-h-[360px] overflow-y-auto">
                          {services.map((srv) => (
                            <button
                              key={srv.id}
                              type="button"
                              onClick={() => openServiceDetail(srv)}
                              className={`text-left p-2.5 rounded-xl transition-colors ${
                                isDark
                                  ? 'hover:bg-[#0F172A] text-slate-200'
                                  : 'hover:bg-slate-50 text-slate-800'
                              }`}
                            >
                              <p className="text-xs font-semibold leading-snug">
                                <span className="font-mono text-blue-400 mr-1.5">
                                  {srv.index}.
                                </span>
                                {srv.title}
                              </p>
                              <p className="text-[11px] text-slate-400 truncate mt-0.5">
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

              const isActive =
                activeNav === item.id ||
                (item.id === 'careers' &&
                  (activeNav === 'internships' ||
                    activeNav === 'student-dashboard' ||
                    activeNav === 'verify-certificate'));

              return (
                <a
                  key={item.id}
                  href={`/${item.id === 'home' ? '' : item.id === 'projects' ? 'our-work' : item.id}`}
                  onClick={(e) => {
                    e.preventDefault();
                    navigateTo(item.id);
                  }}
                  className={`py-1 transition-colors whitespace-nowrap shrink-0 border-b-2 ${
                    isActive
                      ? isDark
                        ? 'border-blue-500 text-white font-semibold'
                        : 'border-blue-600 text-slate-950 font-semibold'
                      : isDark
                      ? 'border-transparent text-slate-300 hover:text-white hover:border-slate-600'
                      : 'border-transparent text-slate-600 hover:text-slate-950 hover:border-slate-300'
                  }`}
                >
                  {item.label}
                </a>
              );
            })}
          </nav>

          {/* Zone 3: Request a Quote Button + Mobile Hamburger Menu */}
          <div className="flex items-center gap-3 shrink-0">
            <button
              type="button"
              onClick={() => navigateTo('contact')}
              className="px-4 py-2 text-xs font-semibold text-white bg-gradient-to-r from-blue-600 to-violet-600 hover:from-blue-500 hover:to-violet-500 rounded-lg transition-all whitespace-nowrap shrink-0 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-400"
            >
              Request a Quote
            </button>

            <button
              type="button"
              onClick={() => setMobileMenuOpen((prev) => !prev)}
              className={`lg:hidden p-2 rounded-lg border ${
                isDark
                  ? 'border-slate-800 text-slate-200 hover:bg-slate-900'
                  : 'border-slate-200 text-slate-700 hover:bg-slate-100'
              }`}
              aria-label={mobileMenuOpen ? 'Close navigation menu' : 'Open navigation menu'}
              aria-expanded={mobileMenuOpen}
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Responsive Mobile Navigation Drawer */}
        {mobileMenuOpen && (
          <div
            className={`lg:hidden border-t px-6 py-5 space-y-4 ${
              isDark ? 'bg-[#070C1E] border-slate-800' : 'bg-white border-slate-200'
            }`}
          >
            <div className="grid grid-cols-2 gap-2">
              {navItems.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => navigateTo(item.id)}
                  className={`text-left px-3 py-2 rounded-lg text-xs font-medium ${
                    activeNav === item.id
                      ? 'bg-blue-600 text-white'
                      : isDark
                      ? 'text-slate-300 hover:bg-slate-800/70'
                      : 'text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  {item.label}
                </button>
              ))}
              <button
                type="button"
                onClick={() => navigateTo('internships')}
                className={`text-left px-3 py-2 rounded-lg text-xs font-medium ${
                  activeNav === 'internships'
                    ? 'bg-blue-600 text-white'
                    : isDark
                    ? 'text-blue-400 hover:bg-slate-800/70'
                    : 'text-blue-600 hover:bg-slate-100'
                }`}
              >
                Internships Portal
              </button>
              <button
                type="button"
                onClick={() => navigateTo('student-dashboard')}
                className={`text-left px-3 py-2 rounded-lg text-xs font-medium ${
                  activeNav === 'student-dashboard'
                    ? 'bg-blue-600 text-white'
                    : isDark
                    ? 'text-slate-300 hover:bg-slate-800/70'
                    : 'text-slate-700 hover:bg-slate-100'
                }`}
              >
                Student Dashboard
              </button>
              <button
                type="button"
                onClick={() => navigateTo('verify-certificate')}
                className={`text-left px-3 py-2 rounded-lg text-xs font-medium ${
                  activeNav === 'verify-certificate'
                    ? 'bg-blue-600 text-white'
                    : isDark
                    ? 'text-slate-300 hover:bg-slate-800/70'
                    : 'text-slate-700 hover:bg-slate-100'
                }`}
              >
                Verify Certificate
              </button>
              <button
                type="button"
                onClick={() => navigateTo('admin')}
                className={`text-left px-3 py-2 rounded-lg text-xs font-medium ${
                  activeNav === 'admin'
                    ? 'bg-blue-600 text-white'
                    : isDark
                    ? 'text-blue-400 hover:bg-slate-800/70'
                    : 'text-blue-600 hover:bg-slate-100'
                }`}
              >
                Site Admin Console
              </button>
            </div>

            <div className="pt-3 border-t border-slate-800/60">
              <p className="text-[11px] font-semibold text-blue-400 mb-2">
                Direct Service Pages
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 max-h-48 overflow-y-auto">
                {services.map((srv) => (
                  <button
                    key={srv.id}
                    type="button"
                    onClick={() => openServiceDetail(srv)}
                    className={`text-left px-2.5 py-1.5 rounded text-xs truncate ${
                      isDark
                        ? 'text-slate-300 hover:bg-slate-800'
                        : 'text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    {srv.index}. {srv.title}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </header>

      {/* Secondary Workspace Bar (Careers & Internships Link, Certificate Verification, Admin & Theme Switch) */}
      <div
        className={`border-b text-xs ${
          isDark
            ? 'bg-[#070C1B]/70 border-slate-800/60 text-slate-400'
            : 'bg-slate-100/80 border-slate-200/80 text-slate-600'
        }`}
      >
        <div className="max-w-[1240px] mx-auto px-6 py-2 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-blue-400">{company.tagline}</span>
            <span aria-hidden="true">·</span>
            <span className="hidden md:inline">
              Web Development, Web Applications, AI Integration &amp; Digital Solutions
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-3.5">
            <button
              type="button"
              onClick={() => navigateTo('internships')}
              className={`inline-flex items-center gap-1.5 font-medium transition-colors whitespace-nowrap shrink-0 ${
                activeNav === 'internships'
                  ? 'text-blue-400 font-semibold'
                  : isDark
                  ? 'text-slate-300 hover:text-white'
                  : 'text-slate-700 hover:text-slate-950'
              }`}
            >
              <GraduationCap className="w-3.5 h-3.5 text-blue-400" />
              <span>Careers &amp; Internships</span>
            </button>

            <span aria-hidden="true">·</span>

            <button
              type="button"
              onClick={() => navigateTo('student-dashboard')}
              className={`inline-flex items-center gap-1.5 font-medium transition-colors whitespace-nowrap shrink-0 ${
                activeNav === 'student-dashboard'
                  ? 'text-blue-400 font-semibold'
                  : isDark
                  ? 'text-slate-300 hover:text-white'
                  : 'text-slate-700 hover:text-slate-950'
              }`}
            >
              <UserCheck className="w-3.5 h-3.5 text-blue-400" />
              <span>Student Portal</span>
            </button>

            <span aria-hidden="true">·</span>

            <button
              type="button"
              onClick={() => navigateTo('verify-certificate')}
              className={`inline-flex items-center gap-1.5 font-medium transition-colors whitespace-nowrap shrink-0 ${
                activeNav === 'verify-certificate'
                  ? 'text-blue-400 font-semibold'
                  : isDark
                  ? 'text-slate-300 hover:text-white'
                  : 'text-slate-700 hover:text-slate-950'
              }`}
            >
              <Award className="w-3.5 h-3.5 text-emerald-400" />
              <span>Verify Certificate</span>
            </button>

            <span aria-hidden="true">·</span>

            <button
              type="button"
              onClick={() => navigateTo('admin-internships')}
              className={`inline-flex items-center gap-1.5 font-medium transition-colors whitespace-nowrap shrink-0 ${
                activeNav === 'admin-internships'
                  ? 'text-blue-400 font-semibold'
                  : isDark
                  ? 'text-slate-300 hover:text-white'
                  : 'text-slate-700 hover:text-slate-950'
              }`}
            >
              <Settings className="w-3.5 h-3.5 text-violet-400" />
              <span>Internship Admin</span>
            </button>

            <span aria-hidden="true">·</span>

            <button
              type="button"
              onClick={() => navigateTo('admin')}
              className={`inline-flex items-center gap-1.5 font-medium transition-colors whitespace-nowrap shrink-0 ${
                activeNav === 'admin'
                  ? 'text-blue-400 font-semibold'
                  : isDark
                  ? 'text-slate-300 hover:text-white'
                  : 'text-slate-700 hover:text-slate-950'
              }`}
            >
              <Settings className="w-3.5 h-3.5 text-blue-400" />
              <span>Site Admin</span>
            </button>

            <span aria-hidden="true">·</span>

            <button
              type="button"
              onClick={() => setIsDark((prev) => !prev)}
              className={`inline-flex items-center gap-1.5 font-medium transition-colors whitespace-nowrap shrink-0 ${
                isDark ? 'text-slate-300 hover:text-white' : 'text-slate-700 hover:text-slate-950'
              }`}
              aria-label="Toggle color theme"
            >
              {isDark ? (
                <>
                  <Sun className="w-3.5 h-3.5 text-amber-400" />
                  <span>Light</span>
                </>
              ) : (
                <>
                  <Moon className="w-3.5 h-3.5 text-blue-600" />
                  <span>Dark</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* MAIN CONTENT VIEWPORT */}
      <main className="flex-1 max-w-[1240px] w-full mx-auto px-6 py-12 sm:py-16">
        {/* =========================================================
            1. HOMEPAGE VIEW (ALL 10 MAIN SECTIONS + FOOTER)
        ========================================================= */}
        {activeNav === 'home' && (
          <div className="space-y-24">
            {/* SECTION 1: HERO SECTION WITH ORIGINAL TECHNOLOGY VISUALS */}
            <section className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-stretch">
              <div className="lg:col-span-6 flex flex-col justify-center space-y-6">
                <div className="flex items-center gap-2 text-xs font-medium text-blue-400">
                  <span>LOVANSTRIX</span>
                  <span aria-hidden="true">·</span>
                  <span>{company.tagline}</span>
                  <span aria-hidden="true">·</span>
                  <span>IT Services &amp; Software Engineering</span>
                </div>

                <h1
                  className={`font-display text-4xl sm:text-5xl lg:text-[52px] font-bold tracking-tight leading-[1.1] text-balance ${
                    isDark ? 'text-white' : 'text-slate-950'
                  }`}
                >
                  {company.heroHeading}
                </h1>

                <p
                  className={`text-base sm:text-lg leading-relaxed max-w-2xl ${
                    isDark ? 'text-slate-300' : 'text-slate-600'
                  }`}
                >
                  {company.heroSubtitle}
                </p>

                {/* Primary CTA: Get a Quote | Secondary CTA: Explore Our Services */}
                <div className="flex flex-wrap items-center gap-3.5 pt-2">
                  <button
                    type="button"
                    onClick={() => navigateTo('contact')}
                    className="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-gradient-to-r from-blue-600 to-violet-600 hover:from-blue-500 hover:to-violet-500 text-white text-xs sm:text-sm font-semibold transition-all whitespace-nowrap shrink-0"
                  >
                    <span>Get a Quote</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>

                  <button
                    type="button"
                    onClick={() => navigateTo('services')}
                    className={`inline-flex items-center gap-2 px-6 py-3 rounded-lg border text-xs sm:text-sm font-semibold transition-colors whitespace-nowrap shrink-0 ${
                      isDark
                        ? 'border-slate-700 bg-slate-900/70 text-white hover:bg-slate-800'
                        : 'border-slate-300 bg-white text-slate-900 hover:bg-slate-100'
                    }`}
                  >
                    <span>Explore Our Services</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => navigateTo('projects')}
                    className={`inline-flex items-center gap-2 px-5 py-3 rounded-lg border text-xs sm:text-sm font-semibold transition-colors whitespace-nowrap shrink-0 ${
                      isDark
                        ? 'border-blue-500/40 bg-blue-500/10 text-blue-400 hover:bg-blue-500/20'
                        : 'border-blue-300 bg-blue-50 text-blue-700 hover:bg-blue-100'
                    }`}
                  >
                    <span>Our Work</span>
                  </button>
                </div>

                {/* Honest Early-Stage Startup Introduction Strip */}
                <div
                  className={`mt-4 pt-6 border-t grid grid-cols-1 sm:grid-cols-3 gap-6 ${
                    isDark ? 'border-slate-800/80' : 'border-slate-200'
                  }`}
                >
                  <div>
                    <p className="text-xs text-blue-400 font-semibold">11 Core IT Services</p>
                    <p
                      className={`text-xs mt-1 leading-relaxed ${
                        isDark ? 'text-slate-400' : 'text-slate-600'
                      }`}
                    >
                      Websites, custom web apps, e-commerce, UI/UX, APIs, databases, and AI.
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-blue-400 font-semibold">Founder-Led Quality</p>
                    <p
                      className={`text-xs mt-1 leading-relaxed ${
                        isDark ? 'text-slate-400' : 'text-slate-600'
                      }`}
                    >
                      Direct engineering execution with TypeScript, React, and Node.js.
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-blue-400 font-semibold">Transparent Stage</p>
                    <p
                      className={`text-xs mt-1 leading-relaxed ${
                        isDark ? 'text-slate-400' : 'text-slate-600'
                      }`}
                    >
                      Honest scoping, verifiable prototypes, and structured student internships.
                    </p>
                  </div>
                </div>
              </div>

              {/* Right Column: Interactive 3D Innovation Core (with 2D Blueprint Toggle) */}
              <div className="lg:col-span-6 flex flex-col gap-3">
                <div className="flex items-center justify-between">
                  <span className="inline-flex items-center gap-1.5 text-xs font-mono text-blue-400">
                    <Box className="w-3.5 h-3.5" />
                    <span>Lovanstrix Interactive Technology Visual</span>
                  </span>
                  <div
                    className={`inline-flex items-center gap-1 p-0.5 rounded-lg border text-xs ${
                      isDark ? 'bg-[#090F21] border-slate-800' : 'bg-slate-100 border-slate-200'
                    }`}
                  >
                    <button
                      type="button"
                      onClick={() => setHeroVisualMode('3d')}
                      className={`px-2.5 py-1 rounded-md font-semibold transition-colors ${
                        heroVisualMode === '3d'
                          ? 'bg-blue-600 text-white'
                          : isDark
                          ? 'text-slate-400 hover:text-white'
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      3D Interactive Core
                    </button>
                    <button
                      type="button"
                      onClick={() => setHeroVisualMode('2d')}
                      className={`px-2.5 py-1 rounded-md font-semibold transition-colors ${
                        heroVisualMode === '2d'
                          ? 'bg-blue-600 text-white'
                          : isDark
                          ? 'text-slate-400 hover:text-white'
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      2D Blueprint
                    </button>
                    <button
                      type="button"
                      onClick={() => setHeroVisualMode('image')}
                      className={`px-2.5 py-1 rounded-md font-semibold transition-colors ${
                        heroVisualMode === 'image'
                          ? 'bg-blue-600 text-white'
                          : isDark
                          ? 'text-slate-400 hover:text-white'
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      3D Image
                    </button>
                  </div>
                </div>

                {heroVisualMode === '3d' ? (
                  <Interactive3DCore isDark={isDark} />
                ) : heroVisualMode === 'image' ? (
                  <figure className="relative overflow-hidden rounded-2xl border border-blue-100 bg-white shadow-[0_24px_80px_-32px_rgba(37,99,235,0.35)]">
                    <img
                      src="/images/lovanstrix-hero-orbit.svg"
                      alt="Lovanstrix abstract 3D innovation artwork with blue and violet geometric forms"
                      className="block w-full h-auto"
                      width="1200"
                      height="980"
                    />
                    <figcaption className="absolute bottom-4 left-4 rounded-full border border-white/80 bg-white/85 px-3 py-1.5 text-[11px] font-medium text-slate-600 shadow-sm backdrop-blur">
                      Design · Develop · Innovate
                    </figcaption>
                  </figure>
                ) : (
                  <HeroGeometricIllustration isDark={isDark} />
                )}
              </div>
            </section>

            {/* SECTION 2: SHORT ABOUT LOVANSTRIX SECTION */}
            <section
              className={`rounded-2xl border p-8 sm:p-10 ${
                isDark ? 'bg-[#090F21] border-slate-800/90' : 'bg-white border-slate-200'
              }`}
            >
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
                <div className="lg:col-span-8 space-y-3">
                  <p className="text-xs font-medium text-blue-400">
                    About Lovanstrix · Ideas Into Innovation
                  </p>
                  <h2
                    className={`font-display text-2xl sm:text-3xl font-bold tracking-tight text-balance ${
                      isDark ? 'text-white' : 'text-slate-900'
                    }`}
                  >
                    Engineering Dependable Websites, Web Applications &amp; Digital Solutions
                  </h2>
                  <p
                    className={`text-sm sm:text-base leading-relaxed ${
                      isDark ? 'text-slate-300' : 'text-slate-600'
                    }`}
                  >
                    {company.shortIntroduction}
                  </p>
                  <p
                    className={`text-xs leading-relaxed pt-1 ${
                      isDark ? 'text-slate-400' : 'text-slate-500'
                    }`}
                  >
                    {company.stageDisclosure}
                  </p>
                </div>
                <div className="lg:col-span-4 flex flex-wrap lg:justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => navigateTo('about')}
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg border border-blue-500/40 bg-blue-500/10 text-blue-400 hover:bg-blue-500/20 text-xs font-semibold transition-colors whitespace-nowrap shrink-0"
                  >
                    <span>About Us &amp; Founder Vision</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </section>

            {/* SECTION 3: SERVICES GRID (ALL 11 IT SERVICES) */}
            <section className="space-y-8">
              <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-slate-800/80 pb-6">
                <div>
                  <p className="text-xs font-medium text-blue-400 mb-2">
                    IT Services &amp; Software Capabilities
                  </p>
                  <h2
                    className={`font-display text-3xl font-bold tracking-tight ${
                      isDark ? 'text-white' : 'text-slate-950'
                    }`}
                  >
                    Comprehensive Web, Application &amp; AI Services
                  </h2>
                </div>
                <button
                  type="button"
                  onClick={() => navigateTo('services')}
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-blue-400 hover:text-blue-300 whitespace-nowrap shrink-0"
                >
                  <span>Explore All {services.length} Service Pages</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {services.map((srv, idx) => (
                  <article
                    key={srv.id}
                    className={`rounded-2xl border p-7 flex flex-col justify-between transition-colors ${
                      idx < 3
                        ? isDark
                          ? 'bg-[#0B1224] border-slate-800 hover:border-blue-500/50'
                          : 'bg-white border-slate-200 hover:border-blue-400 shadow-sm'
                        : isDark
                        ? 'bg-[#090F21] border-slate-800/80 hover:border-slate-700'
                        : 'bg-white border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between gap-2 text-xs text-slate-400 mb-3">
                        <span className="font-mono text-blue-400 tabular-nums">
                          {srv.index} · {srv.category}
                        </span>
                      </div>
                      <h3
                        className={`font-display text-xl font-semibold tracking-tight ${
                          isDark ? 'text-white' : 'text-slate-900'
                        }`}
                      >
                        <button
                          type="button"
                          onClick={() => openServiceDetail(srv)}
                          className="text-left hover:text-blue-400 transition-colors"
                        >
                          {srv.title}
                        </button>
                      </h3>
                      <p
                        className={`mt-3 text-xs sm:text-sm leading-relaxed ${
                          isDark ? 'text-slate-300' : 'text-slate-600'
                        }`}
                      >
                        {srv.summary}
                      </p>
                    </div>

                    <div className="mt-6 pt-4 border-t border-slate-800/60 flex items-center justify-between gap-3">
                      <button
                        type="button"
                        onClick={() => openServiceDetail(srv)}
                        className="inline-flex items-center gap-1 text-xs font-semibold text-blue-400 hover:text-blue-300 whitespace-nowrap shrink-0"
                      >
                        <span>Service Details</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>

                      <button
                        type="button"
                        onClick={() => handleDiscussService(srv.title)}
                        className={`text-xs font-medium transition-colors whitespace-nowrap shrink-0 ${
                          isDark
                            ? 'text-slate-400 hover:text-white'
                            : 'text-slate-600 hover:text-slate-950'
                        }`}
                      >
                        Get a Quote →
                      </button>
                    </div>
                  </article>
                ))}
              </div>
            </section>

            {/* SECTION 4: TECHNOLOGIES AND CAPABILITIES */}
            <section
              className={`rounded-2xl border p-8 ${
                isDark ? 'bg-[#090F21] border-slate-800' : 'bg-white border-slate-200 shadow-sm'
              }`}
            >
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8">
                <div className="max-w-md">
                  <div className="flex items-center gap-2 text-xs font-medium text-blue-400 mb-2">
                    <Code2 className="w-4 h-4" />
                    <span>Technologies &amp; Capabilities</span>
                  </div>
                  <h2
                    className={`font-display text-2xl font-bold tracking-tight ${
                      isDark ? 'text-white' : 'text-slate-900'
                    }`}
                  >
                    Modern, Maintainable Engineering Stack
                  </h2>
                  <p
                    className={`mt-2 text-xs sm:text-sm leading-relaxed ${
                      isDark ? 'text-slate-300' : 'text-slate-600'
                    }`}
                  >
                    We build with proven web standards and cloud-ready architectures so your website
                    or application remains fast, secure, and straightforward to scale.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 flex-1">
                  {TECH_STACK_GROUPS.map((group) => (
                    <div
                      key={group.category}
                      className={`rounded-xl border p-5 ${
                        isDark ? 'bg-[#050814] border-slate-800' : 'bg-slate-50 border-slate-200'
                      }`}
                    >
                      <h3 className="text-xs font-semibold text-blue-400 mb-3">
                        {group.category}
                      </h3>
                      <ul className="space-y-1.5 text-xs">
                        {group.items.map((tech) => (
                          <li
                            key={tech}
                            className={isDark ? 'text-slate-300' : 'text-slate-700'}
                          >
                            {tech}
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              </div>
            </section>

            {/* SECTION 5: FEATURED PROJECTS AND PROTOTYPES */}
            <section className="space-y-8">
              <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-slate-800/80 pb-6">
                <div>
                  <p className="text-xs font-medium text-blue-400 mb-2">
                    Our Work · Transparent Status Labels
                  </p>
                  <h2
                    className={`font-display text-3xl font-bold tracking-tight ${
                      isDark ? 'text-white' : 'text-slate-950'
                    }`}
                  >
                    Featured Projects, Demos &amp; Prototypes
                  </h2>
                </div>
                <button
                  type="button"
                  onClick={() => navigateTo('projects')}
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-blue-400 hover:text-blue-300 whitespace-nowrap shrink-0"
                >
                  <span>Explore Full Portfolio ({projects.length})</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {projects.slice(0, 4).map((proj) => (
                  <article
                    key={proj.id}
                    className={`rounded-2xl border overflow-hidden flex flex-col justify-between ${
                      isDark ? 'bg-[#0B1224] border-slate-800' : 'bg-white border-slate-200'
                    }`}
                  >
                    <div>
                      <ProjectVisualCanvas visualType={proj.visualType} title={proj.title} />
                      <div className="p-6">
                        <div className="flex flex-wrap items-center gap-2 text-xs text-blue-400 mb-2">
                          <span>{proj.category}</span>
                          <span aria-hidden="true">·</span>
                          <span className="font-semibold">{proj.classification}</span>
                        </div>
                        <h3
                          className={`font-display text-xl font-semibold ${
                            isDark ? 'text-white' : 'text-slate-900'
                          }`}
                        >
                          {proj.title}
                        </h3>
                        <p
                          className={`mt-2 text-xs sm:text-sm leading-relaxed ${
                            isDark ? 'text-slate-300' : 'text-slate-600'
                          }`}
                        >
                          {proj.objective}
                        </p>
                      </div>
                    </div>
                    <div className="px-6 py-4 border-t border-slate-800/60 flex items-center justify-between text-xs">
                      <span className="font-mono text-slate-400 truncate">
                        {proj.technologies.slice(0, 4).join(' · ')}
                      </span>
                      <button
                        type="button"
                        onClick={() => navigateTo('projects')}
                        className="text-blue-400 hover:text-blue-300 font-semibold whitespace-nowrap shrink-0"
                      >
                        Inspect Work →
                      </button>
                    </div>
                  </article>
                ))}
              </div>
            </section>

            {/* SECTION 6: OUR DEVELOPMENT PROCESS */}
            <section className="space-y-8">
              <div className="max-w-2xl">
                <p className="text-xs font-medium text-blue-400 mb-2">Our Development Process</p>
                <h2
                  className={`font-display text-3xl font-bold tracking-tight ${
                    isDark ? 'text-white' : 'text-slate-950'
                  }`}
                >
                  How We Move Ideas From Concept to Launch
                </h2>
                <p
                  className={`mt-2 text-sm leading-relaxed ${
                    isDark ? 'text-slate-300' : 'text-slate-600'
                  }`}
                >
                  Every engagement follows a structured six-step lifecycle so project scope,
                  milestones, and quality remain transparent from day one.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-4">
                {APPROACH_STEPS.map((phase) => (
                  <div
                    key={phase.step}
                    className={`rounded-2xl border p-5 flex flex-col justify-between ${
                      isDark ? 'bg-[#0B1224] border-slate-800/90' : 'bg-white border-slate-200'
                    }`}
                  >
                    <div>
                      <span className="text-xs font-mono text-blue-400 tabular-nums">
                        Step {phase.step}
                      </span>
                      <h3
                        className={`font-display text-lg font-semibold mt-1 ${
                          isDark ? 'text-white' : 'text-slate-900'
                        }`}
                      >
                        {phase.name}
                      </h3>
                      <p
                        className={`mt-2 text-xs leading-relaxed ${
                          isDark ? 'text-slate-300' : 'text-slate-600'
                        }`}
                      >
                        {phase.detail}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* SECTION 7: WHY WORK WITH LOVANSTRIX? (Clean Light/Dark Contrast Section) */}
            <section
              className={`rounded-2xl border p-8 sm:p-10 space-y-8 ${
                isDark
                  ? 'bg-[#0B1224] border-slate-800'
                  : 'bg-white border-slate-200 shadow-sm'
              }`}
            >
              <div className="max-w-2xl">
                <div className="flex items-center gap-2 text-xs font-medium text-blue-400 mb-2">
                  <Sparkles className="w-4 h-4" />
                  <span>Why Work With Lovanstrix?</span>
                </div>
                <h2
                  className={`font-display text-3xl font-bold tracking-tight ${
                    isDark ? 'text-white' : 'text-slate-950'
                  }`}
                >
                  Engineering Discipline Without Agency Bloat
                </h2>
                <p
                  className={`mt-2 text-sm leading-relaxed ${
                    isDark ? 'text-slate-300' : 'text-slate-600'
                  }`}
                >
                  We combine custom software craftsmanship with complete transparency around scope,
                  budget, and delivery milestones.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {WHY_WORK_WITH_US.map((item) => (
                  <div
                    key={item.code}
                    className={`rounded-xl border p-6 space-y-2.5 ${
                      isDark ? 'bg-[#070C1B] border-slate-800/90' : 'bg-slate-50 border-slate-200'
                    }`}
                  >
                    <span className="text-xs font-mono text-blue-400 tabular-nums">
                      {item.code}
                    </span>
                    <h3
                      className={`font-display text-base font-bold ${
                        isDark ? 'text-white' : 'text-slate-900'
                      }`}
                    >
                      {item.title}
                    </h3>
                    <p
                      className={`text-xs leading-relaxed ${
                        isDark ? 'text-slate-300' : 'text-slate-600'
                      }`}
                    >
                      {item.description}
                    </p>
                  </div>
                ))}
              </div>
            </section>

            {/* SECTION 8: CAREERS AND FUTURE INTERNSHIP OPPORTUNITIES */}
            <section
              className={`rounded-2xl border p-8 sm:p-10 ${
                isDark ? 'bg-[#090F21] border-slate-800' : 'bg-white border-slate-200'
              }`}
            >
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
                <div className="lg:col-span-8 space-y-3">
                  <div className="flex items-center gap-2 text-xs font-medium text-blue-400">
                    <GraduationCap className="w-4 h-4" />
                    <span>Careers &amp; Student Internship Management System</span>
                  </div>
                  <h2
                    className={`font-display text-2xl sm:text-3xl font-bold tracking-tight ${
                      isDark ? 'text-white' : 'text-slate-900'
                    }`}
                  >
                    Collaborate With Lovanstrix or Explore Mentored Internships
                  </h2>
                  <p
                    className={`text-sm leading-relaxed ${
                      isDark ? 'text-slate-300' : 'text-slate-600'
                    }`}
                  >
                    We are building a learning-focused internship portal across Frontend, Backend,
                    Full-Stack, UI/UX Design, AI/ML, and IoT. Students can inspect program tracks,
                    submit validated applications when roles are open, track status in the Student
                    Dashboard, and verify official certificates online.
                  </p>
                </div>
                <div className="lg:col-span-4 flex flex-wrap lg:justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => navigateTo('internships')}
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold transition-colors whitespace-nowrap shrink-0"
                  >
                    <GraduationCap className="w-4 h-4" />
                    <span>Open Internship Portal</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => navigateTo('careers')}
                    className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-lg border text-xs font-semibold transition-colors whitespace-nowrap shrink-0 ${
                      isDark
                        ? 'border-slate-700 text-slate-200 hover:bg-slate-800'
                        : 'border-slate-300 text-slate-800 hover:bg-slate-100'
                    }`}
                  >
                    <span>Careers Overview</span>
                  </button>
                </div>
              </div>
            </section>

            {/* SECTION 9: FREQUENTLY ASKED QUESTIONS (FAQ SECTION) */}
            <section className="space-y-8">
              <div className="max-w-2xl">
                <div className="flex items-center gap-2 text-xs font-medium text-blue-400 mb-2">
                  <HelpCircle className="w-4 h-4" />
                  <span>Frequently Asked Questions</span>
                </div>
                <h2
                  className={`font-display text-3xl font-bold tracking-tight ${
                    isDark ? 'text-white' : 'text-slate-950'
                  }`}
                >
                  Common Questions About Working With Lovanstrix
                </h2>
              </div>

              <div className="space-y-3">
                {HOMEPAGE_FAQS.map((faq, idx) => {
                  const isOpen = openFaqIdx === idx;
                  return (
                    <div
                      key={idx}
                      className={`rounded-2xl border transition-colors ${
                        isDark ? 'bg-[#0B1224] border-slate-800' : 'bg-white border-slate-200'
                      }`}
                    >
                      <button
                        type="button"
                        onClick={() => setOpenFaqIdx(isOpen ? null : idx)}
                        className="w-full px-6 py-4 text-left flex items-center justify-between gap-4"
                        aria-expanded={isOpen}
                      >
                        <span
                          className={`font-display text-sm sm:text-base font-semibold ${
                            isDark ? 'text-white' : 'text-slate-900'
                          }`}
                        >
                          {faq.question}
                        </span>
                        <ChevronDown
                          className={`w-4 h-4 text-blue-400 shrink-0 transition-transform ${
                            isOpen ? 'rotate-180' : ''
                          }`}
                        />
                      </button>
                      {isOpen && (
                        <div className="px-6 pb-5 pt-1 border-t border-slate-800/50">
                          <p
                            className={`text-xs sm:text-sm leading-relaxed ${
                              isDark ? 'text-slate-300' : 'text-slate-600'
                            }`}
                          >
                            {faq.answer}
                          </p>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </section>

            {/* SECTION 10: CONTACT AND PROJECT ENQUIRY CTA */}
            <section
              className={`rounded-2xl border p-8 sm:p-12 bg-gradient-to-br ${
                isDark
                  ? 'from-[#0B1224] via-[#090F21] to-[#130F2E] border-slate-800'
                  : 'from-slate-900 via-slate-900 to-indigo-950 border-slate-800 text-white'
              }`}
            >
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
                <div className="lg:col-span-8 space-y-3">
                  <p className="text-xs font-medium text-blue-400">
                    Start a Conversation · Ideas Into Innovation
                  </p>
                  <h2 className="font-display text-2xl sm:text-3xl font-bold text-white tracking-tight text-balance">
                    Have a Website, Web Application, E-Commerce, or AI Project in Mind?
                  </h2>
                  <p className="text-sm text-slate-300 leading-relaxed max-w-2xl">
                    Share your objectives, target timeline, and budget range. We will respond with a
                    structured technical scope and milestone breakdown.
                  </p>
                </div>
                <div className="lg:col-span-4 flex flex-wrap lg:justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => navigateTo('contact')}
                    className="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs sm:text-sm font-semibold transition-colors whitespace-nowrap shrink-0"
                  >
                    <span>Request a Quote</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => navigateTo('solutions')}
                    className="inline-flex items-center gap-2 px-5 py-3 rounded-lg border border-slate-700 bg-slate-900/60 hover:bg-slate-800 text-slate-200 text-xs sm:text-sm font-semibold transition-colors whitespace-nowrap shrink-0"
                  >
                    <span>Explore Solutions</span>
                  </button>
                </div>
              </div>
            </section>
          </div>
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
                            <span>Explore Live Demo</span>
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
      <footer
        className={`border-t mt-20 ${
          isDark
            ? 'bg-[#040610] border-slate-800/80 text-slate-400'
            : 'bg-slate-100 border-slate-200 text-slate-600'
        }`}
      >
        <div className="max-w-[1240px] mx-auto px-6 py-14 space-y-10">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-10 justify-between">
            {/* Column 1: Brand & Positioning */}
            <div className="lg:col-span-4 space-y-3">
              <LovanstrixMark isDark={isDark} />
              <p className="text-xs font-semibold text-blue-400">{company.tagline}</p>
              <p className="text-xs leading-relaxed max-w-sm">
                Lovanstrix is an emerging IT services and software venture providing website
                development, custom web applications, e-commerce systems, UI/UX design, backend APIs,
                and applied AI integration.
              </p>
            </div>

            {/* Column 2: Core IT Services */}
            <div className="lg:col-span-3 space-y-2.5">
              <p
                className={`text-xs font-semibold ${
                  isDark ? 'text-slate-200' : 'text-slate-900'
                }`}
              >
                IT Services
              </p>
              <ul className="space-y-1.5 text-xs">
                {services.slice(0, 6).map((srv) => (
                  <li key={srv.id}>
                    <button
                      type="button"
                      onClick={() => openServiceDetail(srv)}
                      className="text-left hover:text-blue-400 transition-colors"
                    >
                      {srv.title}
                    </button>
                  </li>
                ))}
                <li>
                  <button
                    type="button"
                    onClick={() => navigateTo('services')}
                    className="text-left text-blue-400 hover:text-blue-300 font-semibold"
                  >
                    View All {services.length} Services →
                  </button>
                </li>
              </ul>
            </div>

            {/* Column 3: Company, Solutions & Internship Portals */}
            <div className="lg:col-span-3 space-y-2.5">
              <p
                className={`text-xs font-semibold ${
                  isDark ? 'text-slate-200' : 'text-slate-900'
                }`}
              >
                Company &amp; Portals
              </p>
              <div className="grid grid-cols-1 gap-1.5 text-xs">
                {navItems.map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => navigateTo(item.id)}
                    className="text-left hover:text-blue-400 transition-colors"
                  >
                    {item.label}
                  </button>
                ))}
                <button
                  type="button"
                  onClick={() => navigateTo('internships')}
                  className="text-left text-blue-400 hover:text-blue-300 transition-colors"
                >
                  Internship Portal (/internships)
                </button>
                <button
                  type="button"
                  onClick={() => navigateTo('student-dashboard')}
                  className="text-left text-blue-400 hover:text-blue-300 transition-colors"
                >
                  Student Dashboard (/student-dashboard)
                </button>
                <button
                  type="button"
                  onClick={() => navigateTo('verify-certificate')}
                  className="text-left text-emerald-400 hover:text-emerald-300 transition-colors"
                >
                  Verify Certificate (/verify-certificate)
                </button>
                <button
                  type="button"
                  onClick={() => navigateTo('admin')}
                  className="text-left text-violet-400 hover:text-violet-300 transition-colors"
                >
                  Admin Console
                </button>
              </div>
            </div>

            {/* Column 4: Direct Contact & Project Enquiry */}
            <div className="lg:col-span-2 space-y-2.5 text-xs">
              <p
                className={`font-semibold ${
                  isDark ? 'text-slate-200' : 'text-slate-900'
                }`}
              >
                Direct Contact
              </p>
              <p className="break-all">
                <a href={`mailto:${company.email}`} className="hover:text-blue-400">
                  {company.email}
                </a>
              </p>
              <p className="text-slate-500">
                Remote-First Engineering · Transparent Scoping
              </p>
              <div className="pt-2">
                <button
                  type="button"
                  onClick={() => navigateTo('contact')}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-semibold transition-colors"
                >
                  <span>Get a Quote</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>

          <div className="pt-8 border-t border-slate-800/60 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs">
            <p>
              © {new Date().getFullYear()} {company.name}. All rights reserved. Built with
              transparent early-stage disclosures.
            </p>
            <div className="flex items-center gap-4">
              <span className="inline-flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-blue-400" />
                <span>Original Lovanstrix Identity · Zero Fabricated Claims</span>
              </span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
