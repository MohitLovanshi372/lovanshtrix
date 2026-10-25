import React, { useEffect, useRef, useState } from 'react';
import {
  AppWindow,
  ArrowRight,
  Bot,
  CalendarCheck,
  ChevronDown,
  ClipboardCheck,
  Code2,
  Compass,
  ExternalLink,
  Globe,
  GraduationCap,
  LayoutDashboard,
  Mail,
  PenTool,
  Rocket,
  Search,
  Server,
  ShieldCheck,
  Sparkles,
  Wrench,
  Workflow,
  type LucideIcon,
} from 'lucide-react';
import {
  CareerOpening,
  CompanyDetails,
  InternshipListing,
  ProjectItem,
  ServiceItem,
  SystemConfigStatus,
} from '../types/lovanstrix';
import { HeroVisual } from './HeroVisual';
import { AnimatedHeadline, Tilt, Typewriter } from './Motion';
import { ProjectVisualCanvas } from './BrandVisuals';
import { ContactQuoteSection } from './ContactQuoteSection';

/* ------------------------------------------------------------------ */
/* Static presentational content (no invented clients, numbers or quotes) */
/* ------------------------------------------------------------------ */

const FEATURED_SERVICE_SLUGS: { slug: string; icon: LucideIcon }[] = [
  { slug: 'website-design-and-development', icon: Globe },
  { slug: 'web-application-development', icon: AppWindow },
  { slug: 'ai-chatbots-and-ai-integration', icon: Bot },
  { slug: 'ui-ux-design', icon: PenTool },
  { slug: 'backend-and-api-development', icon: Server },
  { slug: 'website-maintenance-and-bug-fixing', icon: Wrench },
];
const FALLBACK_ICONS: LucideIcon[] = [Globe, AppWindow, Bot, PenTool, Server, Wrench];

const SOLUTION_CARDS: {
  title: string;
  blurb: string;
  service: string;
  icon: LucideIcon;
}[] = [
  {
    title: 'Business Websites',
    blurb: 'Fast, responsive, SEO-ready sites and landing pages that present your business clearly.',
    service: 'Business Websites and Landing Pages',
    icon: Globe,
  },
  {
    title: 'Booking Systems',
    blurb: 'Appointment and reservation flows with confirmations and a simple management view.',
    service: 'Web Application Development',
    icon: CalendarCheck,
  },
  {
    title: 'Admin Dashboards',
    blurb: 'Secure back-office panels to manage content, enquiries, users and records.',
    service: 'Web Application Development',
    icon: LayoutDashboard,
  },
  {
    title: 'Startup MVPs',
    blurb: 'A focused first version of your product, scoped honestly and shipped in milestones.',
    service: 'Custom Software Solutions',
    icon: Rocket,
  },
  {
    title: 'AI Automation',
    blurb: 'Practical AI assistants and workflow automation, with keys kept on the server.',
    service: 'AI Chatbots and AI Integration',
    icon: Workflow,
  },
];

const PROCESS_STEPS: { name: string; detail: string; icon: LucideIcon }[] = [
  {
    name: 'Discover',
    detail: 'We learn your goal, users and constraints, and agree on a realistic scope.',
    icon: Search,
  },
  {
    name: 'Plan',
    detail: 'Pages, data model, APIs and milestones are written down before building starts.',
    icon: Compass,
  },
  {
    name: 'Design',
    detail: 'Responsive, accessible interfaces and user flows you can review early.',
    icon: PenTool,
  },
  {
    name: 'Develop',
    detail: 'Clean TypeScript and React front ends with validated forms and secure back ends.',
    icon: Code2,
  },
  {
    name: 'Test & Launch',
    detail: 'Keyboard, mobile and form testing, then deployment with clear hand-over notes.',
    icon: ClipboardCheck,
  },
];

const HOMEPAGE_FAQS = [
  {
    question: 'What kinds of projects does LOVANSTRIX take on?',
    answer:
      'Business websites, custom web applications, admin dashboards, UI/UX design, backend APIs and practical AI integrations for founders, professionals and small businesses.',
  },
  {
    question: 'Is LOVANSTRIX a large agency?',
    answer:
      'No. LOVANSTRIX is an early-stage, founder-led technology studio. We do not display client logos or testimonials we cannot back up, and every portfolio item is labelled with its real status (published project, demo, prototype or in development).',
  },
  {
    question: 'How does a project enquiry work?',
    answer:
      'Send the enquiry form below. We review your brief, ask clarifying questions, and send a written scope and milestone plan before any development begins.',
  },
  {
    question: 'Can you add payments, email or AI to an existing site?',
    answer:
      'Yes, as backend API routes. Live payment processing, email delivery and AI features only go live once your own provider credentials are configured on the server; we will tell you exactly what is needed.',
  },
  {
    question: 'How do internships and certificate verification work?',
    answer:
      'Internship tracks are published by an administrator. You can apply through the Internship Portal, follow your application status with your reference and access key, and anyone can verify an issued completion certificate by its ID.',
  },
];

/* ------------------------------------------------------------------ */
/* Small layout helpers                                                */
/* ------------------------------------------------------------------ */

const Reveal: React.FC<{
  children: React.ReactNode;
  delay?: number;
  className?: string;
  variant?: 'up' | 'left' | 'right' | 'tilt';
}> = ({ children, delay = 0, className = '', variant = 'up' }) => {
  const ref = useRef<HTMLDivElement | null>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el || typeof IntersectionObserver === 'undefined') {
      setVisible(true);
      return;
    }
    const io = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          setVisible(true);
          io.disconnect();
        }
      },
      { rootMargin: '0px 0px -8% 0px', threshold: 0.05 }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      className={`${className} ${
        visible
          ? variant === 'up'
            ? 'lx-reveal'
            : `lx-reveal-${variant}`
          : 'opacity-0'
      }`}
      style={visible ? { animationDelay: `${delay}ms` } : undefined}
    >
      {children}
    </div>
  );
};

const Section: React.FC<{
  id: string;
  tone?: 'white' | 'blue';
  labelledBy: string;
  children: React.ReactNode;
}> = ({ id, tone = 'white', labelledBy, children }) => (
  <section
    id={id}
    aria-labelledby={labelledBy}
    className={`${tone === 'blue' ? 'lx-section-light' : 'lx-section-soft'} scroll-mt-20`}
  >
    <div className="max-w-[1240px] mx-auto px-5 sm:px-6 py-16 sm:py-24">{children}</div>
  </section>
);

const SectionHeading: React.FC<{
  id: string;
  eyebrow: string;
  title: React.ReactNode;
  intro?: string;
  action?: React.ReactNode;
}> = ({ id, eyebrow, title, intro, action }) => (
  <div className="flex flex-col md:flex-row md:items-end justify-between gap-5 mb-10 sm:mb-14">
    <div className="max-w-2xl">
      <p className="inline-flex items-center gap-2 text-xs font-semibold tracking-wide uppercase text-[#155EEF] mb-3">
        <span className="h-px w-6 bg-[#7C5CFA]" aria-hidden="true" />
        {eyebrow}
      </p>
      <h2
        id={id}
        className="font-display text-3xl sm:text-4xl font-bold tracking-tight text-[#102B59] text-balance"
      >
        {title}
      </h2>
      {intro && <p className="mt-4 text-base text-[#34476b] leading-relaxed">{intro}</p>}
    </div>
    {action}
  </div>
);

const TextLinkButton: React.FC<{ onClick: () => void; children: React.ReactNode }> = ({
  onClick,
  children,
}) => (
  <button
    type="button"
    onClick={onClick}
    className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#155EEF] hover:text-[#104bc4] whitespace-nowrap shrink-0 rounded"
  >
    <span>{children}</span>
    <ArrowRight className="w-4 h-4" />
  </button>
);

/* ------------------------------------------------------------------ */
/* Page                                                                */
/* ------------------------------------------------------------------ */

type NavTarget =
  | 'services'
  | 'solutions'
  | 'projects'
  | 'about'
  | 'careers'
  | 'contact'
  | 'internships'
  | 'student-dashboard'
  | 'verify-certificate';

export interface HomePageProps {
  company: CompanyDetails;
  services: ServiceItem[];
  projects: ProjectItem[];
  openings: CareerOpening[];
  internshipListings: InternshipListing[];
  configStatus: SystemConfigStatus;
  prefillService?: string;
  prefillDescription?: string;
  onNavigate: (section: NavTarget) => void;
  onOpenService: (service: ServiceItem) => void;
  onDiscussService: (title: string, description?: string) => void;
  onEnquirySubmitted: () => void;
}

export const HomePage: React.FC<HomePageProps> = ({
  company,
  services,
  projects,
  openings,
  internshipListings,
  configStatus,
  prefillService,
  prefillDescription,
  onNavigate,
  onOpenService,
  onDiscussService,
  onEnquirySubmitted,
}) => {
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  const featuredServices = (() => {
    const picked = FEATURED_SERVICE_SLUGS.map((f, i) => {
      const srv = services.find((s) => s.slug === f.slug || s.id === f.slug);
      return srv ? { srv, Icon: f.icon } : null;
    }).filter(Boolean) as { srv: ServiceItem; Icon: LucideIcon }[];
    if (picked.length >= 3) return picked;
    return services.slice(0, 6).map((srv, i) => ({ srv, Icon: FALLBACK_ICONS[i % 6] }));
  })();

  const openInternships = internshipListings.filter((l) => l.status === 'Open');
  const upcomingInternships = internshipListings.filter((l) => l.status === 'Upcoming');
  const openRoles = openings.filter((o) => o.status === 'Open');
  const portfolio = projects.filter((p) => p.published !== false).slice(0, 4);
  const emailHref = company.email ? `mailto:${company.email}` : '';
  const waDigits = (company.whatsappNumber || '').replace(/[^\d]/g, '');
  const hasWhatsapp = waDigits.length >= 8 && waDigits.length <= 15;

  const internalTarget = (url?: string): NavTarget | null => {
    const map: Record<string, NavTarget> = {
      '#internships': 'internships',
      '/internships': 'internships',
      '#contact': 'contact',
      '#solutions': 'solutions',
      '#services': 'services',
      '#about': 'about',
      '#careers': 'careers',
    };
    return url ? map[url] ?? null : null;
  };

  const demoNote = (p: ProjectItem): string => {
    if (p.classification === 'Published Project') return 'Published project — built and maintained by LOVANSTRIX.';
    if (p.classification === 'In Development') return 'In development — not yet released.';
    return 'Demonstration build — not a client delivery.';
  };

  return (
    <>
      {/* 1. HERO ------------------------------------------------------ */}
      <section aria-labelledby="hero-title" className="relative overflow-hidden lx-section-soft">
        <div
          className="absolute inset-0 pointer-events-none"
          aria-hidden="true"
          style={{
            backgroundImage:
              'radial-gradient(60% 50% at 85% 10%, rgba(21,94,239,0.10) 0%, transparent 70%), radial-gradient(45% 40% at 5% 90%, rgba(124,92,250,0.10) 0%, transparent 70%)',
          }}
        />
        <div className="relative max-w-[1240px] mx-auto px-5 sm:px-6 pt-12 pb-16 sm:pt-20 sm:pb-24 grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
          <div className="lg:col-span-6 space-y-7">
            <p className="lx-reveal inline-flex items-center gap-2 rounded-full border border-[#dbe7ff] bg-[#f3f7ff] px-3.5 py-1.5 text-xs font-semibold text-[#155EEF]">
              <Sparkles className="w-3.5 h-3.5 text-[#6a46f0]" />
              <span>{company.tagline || 'Ideas Into Innovation.'}</span>
            </p>
            <h1
              id="hero-title"
              className="font-display text-4xl sm:text-5xl lg:text-[58px] font-bold tracking-tight leading-[1.08] text-[#102B59] [perspective:800px]"
            >
              <AnimatedHeadline text={company.heroHeading} />
            </h1>
            <p
              className="lx-reveal font-display text-lg sm:text-xl font-semibold text-[#155EEF] min-h-[1.8em]"
              style={{ animationDelay: '500ms' }}
            >
              <span className="text-[#546179] font-medium">We design &amp; build </span>
              <Typewriter
                phrases={['business websites', 'web applications', 'AI integrations', 'admin dashboards', 'startup MVPs']}
                className="lx-gradient-text"
              />
            </p>
            <p
              className="lx-reveal text-base sm:text-lg leading-relaxed text-[#34476b] max-w-xl"
              style={{ animationDelay: '700ms' }}
            >
              {company.heroSubtitle}
            </p>
            <div
              className="lx-reveal flex flex-col sm:flex-row sm:flex-wrap gap-3.5 pt-1"
              style={{ animationDelay: '240ms' }}
            >
              <button
                type="button"
                onClick={() => onNavigate('contact')}
                className="lx-btn-primary inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-full text-sm font-semibold"
              >
                <span>Start a Project</span>
                <ArrowRight className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => onNavigate('services')}
                className="inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-full border border-[#cfdcff] bg-white text-sm font-semibold text-[#102B59] hover:border-[#155EEF] hover:text-[#155EEF] transition-colors"
              >
                <span>Explore Services</span>
              </button>
            </div>
            <ul
              className="lx-reveal flex flex-wrap gap-x-6 gap-y-2 pt-3 text-sm text-[#34476b]"
              style={{ animationDelay: '320ms' }}
            >
              {['Founder-led engineering', 'Honest scoping', 'Projects labelled by real status'].map(
                (t) => (
                  <li key={t} className="inline-flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-[#155EEF]" aria-hidden="true" />
                    {t}
                  </li>
                )
              )}
            </ul>
          </div>
          <div className="lg:col-span-6 px-2 sm:px-6 lg:px-0">
            <Tilt max={10} className="lx-hero-parallax">
              <HeroVisual />
            </Tilt>
          </div>
        </div>
      </section>

      {/* 2. SERVICES -------------------------------------------------- */}
      <Section id="services-overview" tone="blue" labelledBy="services-title">
        <SectionHeading
          id="services-title"
          eyebrow="Services"
          title="Everything you need to design, build and run it"
          intro="Six core capabilities, delivered by one accountable team."
          action={
            <TextLinkButton onClick={() => onNavigate('services')}>
              All {services.length} services
            </TextLinkButton>
          }
        />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {featuredServices.map(({ srv, Icon }, i) => (
            <Reveal key={srv.id} delay={i * 70} className="h-full" variant="tilt">
              <Tilt max={5} className="h-full">
              <article className="lx-card h-full p-7 flex flex-col">
                <span className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-[#eef4ff] to-[#f1ecff] text-[#155EEF]">
                  <Icon className="w-6 h-6" aria-hidden="true" />
                </span>
                <h3 className="mt-5 font-display text-xl font-semibold text-[#102B59]">{srv.title}</h3>
                <p className="mt-2.5 text-sm leading-relaxed text-[#34476b] line-clamp-4 flex-1">
                  {srv.summary}
                </p>
                <div className="mt-6 flex items-center justify-between gap-3 pt-4 border-t border-[#e2e8f4]">
                  <button
                    type="button"
                    onClick={() => onOpenService(srv)}
                    className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#155EEF] hover:text-[#104bc4]"
                  >
                    <span>Learn more</span>
                    <ArrowRight className="w-4 h-4" />
                    <span className="sr-only"> about {srv.title}</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => onDiscussService(srv.title)}
                    className="text-sm font-medium text-[#546179] hover:text-[#155EEF]"
                  >
                    Get a quote
                  </button>
                </div>
              </article>
              </Tilt>
            </Reveal>
          ))}
        </div>
      </Section>

      {/* 3. SOLUTIONS ------------------------------------------------- */}
      <Section id="solutions-overview" labelledBy="solutions-title">
        <SectionHeading
          id="solutions-title"
          eyebrow="Solutions"
          title="Ready-to-scope solutions for common needs"
          intro="Start from a proven shape, then tailor it to your business."
          action={<TextLinkButton onClick={() => onNavigate('solutions')}>Explore solutions</TextLinkButton>}
        />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-5">
          {SOLUTION_CARDS.map((s, i) => (
            <Reveal key={s.title} delay={i * 60} variant="tilt">
              <button
                type="button"
                onClick={() => onDiscussService(s.service, `I'm interested in: ${s.title}.`)}
                className="lx-card w-full h-full text-left p-6 flex flex-col gap-3 group"
              >
                <span className="inline-flex h-11 w-11 items-center justify-center rounded-xl bg-[#102B59] text-white group-hover:bg-[#155EEF] transition-colors">
                  <s.icon className="w-5 h-5" aria-hidden="true" />
                </span>
                <span className="font-display text-lg font-semibold text-[#102B59]">{s.title}</span>
                <span className="text-sm text-[#34476b] leading-relaxed">{s.blurb}</span>
                <span className="mt-auto pt-2 inline-flex items-center gap-1.5 text-sm font-semibold text-[#155EEF]">
                  Discuss this <ArrowRight className="w-4 h-4" aria-hidden="true" />
                </span>
              </button>
            </Reveal>
          ))}
        </div>
      </Section>

      {/* 4. PORTFOLIO ------------------------------------------------- */}
      <Section id="work" tone="blue" labelledBy="work-title">
        <SectionHeading
          id="work-title"
          eyebrow="Our work"
          title="Projects, demos and prototypes — labelled honestly"
          intro="We only list what exists. Each item shows whether it is a published project, a demo, a prototype or still in development."
          action={<TextLinkButton onClick={() => onNavigate('projects')}>Full portfolio</TextLinkButton>}
        />
        {portfolio.length === 0 ? (
          <p className="lx-card p-8 text-[#34476b]">
            Portfolio items will appear here once they are published from the admin console.
          </p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-7">
            {portfolio.map((p, i) => (
              <Reveal key={p.id} delay={i * 80} variant={i % 2 === 0 ? 'left' : 'right'}>
                <article className="lx-card h-full overflow-hidden flex flex-col">
                  {p.previewImageUrl ? (
                    <img
                      src={p.previewImageUrl}
                      alt={`Preview of ${p.title}`}
                      loading="lazy"
                      className="w-full aspect-[16/9] object-cover border-b border-[#e2e8f4]"
                    />
                  ) : (
                    <ProjectVisualCanvas visualType={p.visualType} title={p.title} />
                  )}
                  <div className="p-6 flex flex-col flex-1">
                    <div className="flex flex-wrap items-center gap-2 mb-3">
                      <span className="rounded-full bg-[#eef4ff] px-3 py-1 text-xs font-semibold text-[#155EEF]">
                        {p.classification}
                      </span>
                      <span className="text-xs text-[#546179]">{p.category}</span>
                    </div>
                    <h3 className="font-display text-xl font-semibold text-[#102B59]">{p.title}</h3>
                    <p className="mt-2 text-sm text-[#34476b] leading-relaxed line-clamp-4">{p.objective}</p>
                    <p className="mt-2 text-xs text-[#546179]">{demoNote(p)}</p>
                    <ul className="mt-4 flex flex-wrap gap-2" aria-label="Tech stack">
                      {p.technologies.slice(0, 6).map((t) => (
                        <li
                          key={t}
                          className="rounded-md border border-[#e2e8f4] bg-white px-2.5 py-1 text-xs font-mono text-[#34476b]"
                        >
                          {t}
                        </li>
                      ))}
                    </ul>
                    <div className="mt-auto pt-5 flex flex-wrap items-center gap-4 text-sm font-semibold">
                      {p.githubUrl ? (
                        <a
                          href={p.githubUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 text-[#155EEF] hover:text-[#104bc4]"
                        >
                          <Code2 className="w-4 h-4" aria-hidden="true" />
                          <span>Source on GitHub</span>
                          <span className="sr-only"> (opens in a new tab)</span>
                        </a>
                      ) : null}
                      {p.liveDemoUrl && /^https?:\/\//i.test(p.liveDemoUrl) ? (
                        <a
                          href={p.liveDemoUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 text-[#155EEF] hover:text-[#104bc4]"
                        >
                          <ExternalLink className="w-4 h-4" aria-hidden="true" />
                          <span>Live demo</span>
                          <span className="sr-only"> (opens in a new tab)</span>
                        </a>
                      ) : internalTarget(p.liveDemoUrl) ? (
                        <button
                          type="button"
                          onClick={() => onNavigate(internalTarget(p.liveDemoUrl) as NavTarget)}
                          className="inline-flex items-center gap-1.5 text-[#155EEF] hover:text-[#104bc4]"
                        >
                          <ArrowRight className="w-4 h-4" aria-hidden="true" />
                          <span>See related page on this site</span>
                        </button>
                      ) : (
                        <span className="text-xs font-medium text-[#546179]">No public live demo yet</span>
                      )}
                    </div>
                  </div>
                </article>
              </Reveal>
            ))}
          </div>
        )}
      </Section>

      {/* 5. HOW WE WORK ----------------------------------------------- */}
      <Section id="process" labelledBy="process-title">
        <SectionHeading
          id="process-title"
          eyebrow="How we work"
          title="A clear path from first call to launch"
          intro="Five steps, with checkpoints you can review at each one."
        />
        <ol className="grid grid-cols-1 md:grid-cols-5 gap-5 relative">
          {PROCESS_STEPS.map((step, i) => (
            <li key={step.name}>
              <Reveal delay={i * 80} className="h-full" variant="tilt">
                <div className="lx-card h-full p-6 relative">
                  <span className="font-mono text-xs font-semibold text-[#6a46f0]">
                    {String(i + 1).padStart(2, '0')}
                  </span>
                  <span className="mt-3 inline-flex h-11 w-11 items-center justify-center rounded-xl bg-[#eef4ff] text-[#155EEF]">
                    <step.icon className="w-5 h-5" aria-hidden="true" />
                  </span>
                  <h3 className="mt-4 font-display text-lg font-semibold text-[#102B59]">{step.name}</h3>
                  <p className="mt-2 text-sm text-[#34476b] leading-relaxed">{step.detail}</p>
                  {i < PROCESS_STEPS.length - 1 && (
                    <ArrowRight
                      className="hidden md:block absolute -right-[19px] top-1/2 -translate-y-1/2 w-4 h-4 text-[#155EEF] z-10 bg-white rounded-full"
                      aria-hidden="true"
                    />
                  )}
                </div>
              </Reveal>
            </li>
          ))}
        </ol>
      </Section>

      {/* 6. ABOUT ----------------------------------------------------- */}
      <Section id="about-overview" tone="blue" labelledBy="about-title">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
          <div className="lg:col-span-6">
            <SectionHeading
              id="about-title"
              eyebrow="About LOVANSTRIX"
              title="A small, focused studio building useful digital products"
            />
            <p className="text-base text-[#34476b] leading-relaxed">{company.shortIntroduction}</p>
            <p className="mt-4 text-sm text-[#546179] leading-relaxed">{company.stageDisclosure}</p>
            <div className="mt-7">
              <TextLinkButton onClick={() => onNavigate('about')}>More about us</TextLinkButton>
            </div>
          </div>
          <div className="lg:col-span-6 grid grid-cols-1 sm:grid-cols-2 gap-5">
            <Reveal variant="left">
              <div className="lx-card h-full p-7">
                <p className="text-xs font-semibold uppercase tracking-wide text-[#155EEF]">Mission</p>
                <p className="mt-3 font-display text-lg font-semibold text-[#102B59] leading-snug">
                  {company.mission}
                </p>
              </div>
            </Reveal>
            <Reveal delay={90} variant="right">
              <div className="h-full rounded-2xl p-7 text-white bg-gradient-to-br from-[#102B59] to-[#2a2f8f] shadow-[0_20px_40px_-16px_rgba(16,43,89,0.5)]">
                <p className="text-xs font-semibold uppercase tracking-wide text-[#b9d0ff]">Vision</p>
                <p className="mt-3 text-sm leading-relaxed text-white/90">{company.vision}</p>
              </div>
            </Reveal>
          </div>
        </div>
      </Section>

      {/* 7. CAREERS & INTERNSHIPS ------------------------------------- */}
      <Section id="careers-overview" labelledBy="careers-title">
        <SectionHeading
          id="careers-title"
          eyebrow="Careers & internships"
          title="Learn and build with us"
          intro="Only roles and tracks that an administrator has published are shown here."
          action={<TextLinkButton onClick={() => onNavigate('careers')}>Careers page</TextLinkButton>}
        />
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-7">
          <div className="lg:col-span-7 lx-card p-7">
            <h3 className="font-display text-lg font-semibold text-[#102B59]">Current openings</h3>
            {openInternships.length + openRoles.length > 0 ? (
              <ul className="mt-4 divide-y divide-[#e2e8f4]">
                {openInternships.slice(0, 4).map((l) => (
                  <li key={l.id} className="py-3.5 flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <p className="font-semibold text-[#102B59]">{l.title}</p>
                      <p className="text-xs text-[#546179]">
                        Internship · {l.duration} · Apply by {l.deadline}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => onNavigate('internships')}
                      className="text-sm font-semibold text-[#155EEF] hover:text-[#104bc4]"
                    >
                      View &amp; apply
                    </button>
                  </li>
                ))}
                {openRoles.slice(0, 3).map((o) => (
                  <li key={o.id} className="py-3.5 flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <p className="font-semibold text-[#102B59]">{o.title}</p>
                      <p className="text-xs text-[#546179]">
                        {o.type} · {o.duration} · Apply by {o.deadline}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => onNavigate('careers')}
                      className="text-sm font-semibold text-[#155EEF] hover:text-[#104bc4]"
                    >
                      Details
                    </button>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="mt-4 rounded-xl bg-[#f3f7ff] p-5 text-sm text-[#34476b] leading-relaxed">
                <p className="font-semibold text-[#102B59]">No positions are open right now.</p>
                <p className="mt-1">
                  {upcomingInternships.length > 0
                    ? `${upcomingInternships.length} internship track${
                        upcomingInternships.length === 1 ? ' is' : 's are'
                      } planned and will open for applications when published. You can register your interest on the Careers page.`
                    : 'New roles and internship tracks appear here as soon as they are published. You can register your interest on the Careers page.'}
                </p>
              </div>
            )}
          </div>
          <div className="lg:col-span-5 grid gap-4 content-start">
            {[
              {
                icon: GraduationCap,
                title: 'Apply for an internship',
                text: 'Submit the application form when a track is open.',
                target: 'internships' as NavTarget,
              },
              {
                icon: ClipboardCheck,
                title: 'Track your application',
                text: 'Sign in with your reference and access key to see status and documents.',
                target: 'student-dashboard' as NavTarget,
              },
              {
                icon: ShieldCheck,
                title: 'Verify a certificate',
                text: 'Check any issued completion certificate by its ID.',
                target: 'verify-certificate' as NavTarget,
              },
            ].map((c) => (
              <button
                key={c.title}
                type="button"
                onClick={() => onNavigate(c.target)}
                className="lx-card text-left p-5 flex items-start gap-4"
              >
                <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#eef4ff] text-[#155EEF]">
                  <c.icon className="w-5 h-5" aria-hidden="true" />
                </span>
                <span>
                  <span className="block font-semibold text-[#102B59]">{c.title}</span>
                  <span className="block mt-0.5 text-sm text-[#34476b]">{c.text}</span>
                </span>
              </button>
            ))}
          </div>
        </div>
      </Section>

      {/* 8. FAQ ------------------------------------------------------- */}
      <Section id="faq" tone="blue" labelledBy="faq-title">
        <div className="max-w-3xl mx-auto">
          <SectionHeading id="faq-title" eyebrow="FAQ" title="Questions, answered plainly" />
          <div className="space-y-3">
            {HOMEPAGE_FAQS.map((f, i) => {
              const open = openFaq === i;
              return (
                <div key={f.question} className="lx-card !transform-none overflow-hidden">
                  <h3>
                    <button
                      type="button"
                      onClick={() => setOpenFaq(open ? null : i)}
                      aria-expanded={open}
                      aria-controls={`faq-panel-${i}`}
                      id={`faq-btn-${i}`}
                      className="w-full flex items-center justify-between gap-4 text-left px-6 py-5 font-semibold text-[#102B59]"
                    >
                      <span>{f.question}</span>
                      <ChevronDown
                        className={`w-5 h-5 shrink-0 text-[#155EEF] transition-transform ${open ? 'rotate-180' : ''}`}
                        aria-hidden="true"
                      />
                    </button>
                  </h3>
                  <div
                    id={`faq-panel-${i}`}
                    role="region"
                    aria-labelledby={`faq-btn-${i}`}
                    hidden={!open}
                    className="px-6 pb-5 text-sm text-[#34476b] leading-relaxed"
                  >
                    {f.answer}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </Section>

      {/* 9a. PROJECT ENQUIRY FORM ------------------------------------- */}
      <Section id="enquiry" labelledBy="enquiry-title">
        <h2 id="enquiry-title" className="sr-only">
          Project enquiry form
        </h2>
        <ContactQuoteSection
          company={company}
          services={services}
          configStatus={configStatus}
          initialService={prefillService}
          initialDescription={prefillDescription}
          isDark={false}
          onEnquirySubmitted={onEnquirySubmitted}
        />
      </Section>

      {/* 9b. CONTACT CTA ---------------------------------------------- */}
      <section aria-labelledby="cta-title" className="bg-white px-5 sm:px-6 pb-16 sm:pb-24">
        <div className="max-w-[1240px] mx-auto relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#102B59] via-[#14388a] to-[#3b2fb0] px-7 sm:px-14 py-14 sm:py-20 text-white">
          <div
            className="absolute -top-24 -right-24 w-80 h-80 rounded-full bg-[#7C5CFA]/40 blur-3xl"
            aria-hidden="true"
          />
          <div className="relative max-w-2xl">
            <h2 id="cta-title" className="font-display text-3xl sm:text-4xl font-bold tracking-tight text-balance">
              Have an idea? Let&apos;s turn it into something real.
            </h2>
            <p className="mt-4 text-white/85 leading-relaxed">
              Tell us what you want to build. We will reply with honest next steps.
            </p>
            <div className="mt-8 flex flex-col sm:flex-row gap-3.5">
              <button
                type="button"
                onClick={() => onNavigate('contact')}
                className="inline-flex items-center justify-center gap-2 rounded-full bg-white px-7 py-3.5 text-sm font-semibold text-[#102B59] hover:bg-[#eef4ff] transition-colors"
              >
                <span>Let&apos;s Talk</span>
                <ArrowRight className="w-4 h-4" />
              </button>
              {emailHref && (
                <a
                  href={emailHref}
                  className="inline-flex items-center justify-center gap-2 rounded-full border border-white/40 px-7 py-3.5 text-sm font-semibold text-white hover:bg-white/10 transition-colors"
                >
                  <Mail className="w-4 h-4" aria-hidden="true" />
                  <span>{company.email}</span>
                </a>
              )}
              {hasWhatsapp && (
                <a
                  href={`https://wa.me/${waDigits}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-2 rounded-full border border-white/40 px-7 py-3.5 text-sm font-semibold text-white hover:bg-white/10 transition-colors"
                >
                  <span>WhatsApp</span>
                  <span className="sr-only"> (opens in a new tab)</span>
                </a>
              )}
            </div>
          </div>
        </div>
      </section>
    </>
  );
};
