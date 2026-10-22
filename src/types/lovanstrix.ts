export type NavSection =
  | 'home'
  | 'services'
  | 'service-detail'
  | 'solutions'
  | 'projects'
  | 'internships'
  | 'student-dashboard'
  | 'admin-internships'
  | 'verify-certificate'
  | 'about'
  | 'careers'
  | 'contact'
  | 'admin';

export interface CompanyDetails {
  name: string;
  tagline: string;
  heroHeading: string;
  heroSubtitle: string;
  shortIntroduction: string;
  mission: string;
  vision: string;
  stageDisclosure: string;
  email: string;
  whatsappNumber: string; // Empty string until a real company number is supplied
  githubUrl: string;
  linkedinUrl: string;
  portfolioComingSoonMode: boolean;
  careerStatusBanner: string;
  // Founder Introduction (using details supplied by the founder; never fabricated)
  founderName: string;
  founderRole: string;
  founderBio: string;
  // Official signatory configuration for Offer Letters & Certificates (never fabricated)
  authorizedSignatoryName: string;
  authorizedSignatoryDesignation: string;
  officialSupervisorDefault: string;
}

export interface ServiceFaqItem {
  question: string;
  answer: string;
}

export type ServiceAvailability =
  | 'Available for New Projects'
  | 'Available Upon Project Review'
  | 'Consultation & Scoping'
  | 'Planned Capability';

export interface ServiceItem {
  id: string;
  slug: string;
  index: string;
  title: string;
  category: string;
  summary: string;
  overview: string;
  problemsAddressed: string[];
  deliverables: string[];
  technologies: string[];
  processSteps: string[];
  faqs: ServiceFaqItem[];
  availability: ServiceAvailability;
  featured: boolean;
}

export interface BusinessSolutionItem {
  id: string;
  index: string;
  title: string;
  category: string;
  useCase: string;
  summary: string;
  potentialFeatures: string[];
  recommendedService: string;
  integrationDisclosure: string;
  readinessStatus: 'Available for Scoping' | 'Prototype & Custom Build' | 'Experimental R&D';
}

export type ProjectCategory =
  | 'Websites'
  | 'Web Applications'
  | 'AI Projects'
  | 'IoT and Hardware'
  | 'Experimental Prototypes';

export type ProjectDevelopmentStatus =
  | 'Prototype'
  | 'Demo Project'
  | 'In Development'
  | 'Internal Concept Prototype'
  | 'Architecture Demo'
  | 'Published Project';

export interface ProjectItem {
  id: string;
  title: string;
  category: ProjectCategory;
  classification: ProjectDevelopmentStatus;
  objective: string;
  problemStatement?: string;
  proposedSolution?: string;
  technologies: string[];
  features: string[];
  liveDemoUrl?: string;
  githubUrl?: string;
  previewImageUrl?: string;
  visualType: 'webapp' | 'ai' | 'website' | 'iot';
  published: boolean;
  publishedAt: string;
}

export interface ExplorationArea {
  id: string;
  index: string;
  title: string;
  statusLabel:
    | 'Active Service Track'
    | 'Internal Prototype Stage'
    | 'Concept Exploration'
    | 'Long-Term Research Horizon';
  summary: string;
  practicalFocus: string[];
  honestNote: string;
}

export interface CareerOpening {
  id: string;
  title: string;
  track:
    | 'Frontend Development'
    | 'Backend Development'
    | 'Full-Stack Development'
    | 'UI/UX Design'
    | 'AI & Software Research'
    | 'General Engineering';
  type: 'Internship' | 'Part-Time Collaboration' | 'Full-Time Role';
  status: 'Open' | 'Closed';
  eligibility: string;
  duration: string;
  responsibilities: string[];
  deadline: string;
  applicationLink?: string;
  createdAt: string;
}

export interface ProjectEnquiry {
  id: string;
  name: string;
  email: string;
  organization?: string;
  serviceRequired: string;
  projectDescription: string;
  estimatedBudget: string;
  expectedTimeline: string;
  referenceUrl?: string;
  status: 'New' | 'Reviewed' | 'Archived';
  savedToDatabase: boolean;
  emailDelivered: boolean;
  deliveryMode: 'database_and_email' | 'database_only_no_email' | 'demo_only_no_email';
  createdAt: string;
}

export interface CareerInterestSubmission {
  id: string;
  name: string;
  email: string;
  areaOfInterest: string;
  skills: string;
  portfolioUrl?: string;
  introduction: string;
  status: 'Registered' | 'Reviewed';
  savedToDatabase: boolean;
  emailDelivered: boolean;
  createdAt: string;
}

// ============================================================================
// INTERNSHIP MANAGEMENT SYSTEM TYPES
// ============================================================================

export type InternshipDepartment =
  | 'Frontend Development'
  | 'Backend Development'
  | 'Full-Stack Development'
  | 'UI/UX Design'
  | 'AI/ML'
  | 'IoT';

export type InternshipWorkMode = 'Remote' | 'Hybrid' | 'On-Site';

export type InternshipCompensationType =
  | 'Unpaid / Academic Learning'
  | 'Paid Stipend'
  | 'Performance-Based Stipend';

export type InternshipListingStatus = 'Open' | 'Closed' | 'Upcoming' | 'Archived';

export interface InternshipListing {
  id: string;
  code: string;
  title: string;
  department: InternshipDepartment;
  description: string;
  techStack: string[];
  workMode: InternshipWorkMode;
  compensationType: InternshipCompensationType;
  stipendDetails: string;
  duration: string;
  weeklyCommitment: string;
  eligibility: string;
  requiredSkills: string[];
  responsibilities: string[];
  learningObjectives: string[];
  selectionCriteria: string;
  positionsCount?: number;
  deadline: string;
  status: InternshipListingStatus;
  createdAt: string;
}

export type ApplicationStatus =
  | 'Submitted'
  | 'Under Review'
  | 'Shortlisted'
  | 'Selected'
  | 'Rejected'
  | 'Withdrawn';

export interface InternshipTaskItem {
  id: string;
  title: string;
  description: string;
  status: 'Pending' | 'In Progress' | 'Completed';
  dueDate?: string;
}

export interface InternshipApplication {
  id: string;
  referenceNumber: string; // e.g., LX-INT-2026-4821
  listingId: string;
  roleTitle: string;
  department: InternshipDepartment;
  fullName: string;
  email: string;
  phone?: string;
  college: string;
  courseAndYear: string;
  skills: string[];
  portfolioUrl?: string;
  githubUrl?: string;
  linkedinUrl?: string;
  resumeFileName?: string;
  resumeMimeType?: string;
  resumeSize?: number;
  hasPrivateResume: boolean;
  motivation: string;
  availability: string;
  preferredStartDate: string;
  privacyConsent: boolean;
  status: ApplicationStatus;
  // Admin-assigned internship management fields
  assignedSupervisor?: string;
  officialStartDate?: string;
  officialEndDate?: string;
  officialDuration?: string;
  workMode?: InternshipWorkMode;
  stipendTerms?: string;
  acceptanceDeadline?: string;
  assignedTasks: InternshipTaskItem[];
  // Completion tracking
  progressStatus: 'Not Started' | 'Active' | 'Completed' | 'Discontinued';
  completionApproved: boolean;
  completionApprovedAt?: string;
  completedWorkSummary?: string;
  // Linked documents
  latestOfferLetterId?: string;
  latestCertificateId?: string;
  // Server-only fields (stripped from student view)
  internalNotes?: string;
  studentAccessKeyHash?: string;
  createdAt: string;
  updatedAt: string;
}

export interface OfferLetterDocument {
  id: string;
  offerNumber: string; // e.g., LX-OFFER-2026-101
  version: number;
  applicationId: string;
  referenceNumber: string;
  candidateName: string;
  candidateEmail: string;
  roleTitle: string;
  department: string;
  startDate: string; // e.g. "01 November 2026"
  endDate: string; // e.g. "31 January 2027"
  duration: string;
  workMode: InternshipWorkMode;
  stipendDetails: string;
  responsibilities: string[];
  learningObjectives: string[];
  supervisor: string;
  termsAndConditions: string[];
  acceptanceDeadline: string;
  signatoryName: string;
  signatoryDesignation: string;
  issueDate: string; // e.g., "21 October 2026"
  verificationCode: string;
  status: 'Issued' | 'Superseded' | 'Revoked';
  revokedReason?: string;
  revokedAt?: string;
  createdAt: string;
}

export interface CertificateRecord {
  id: string; // Unguessable public verification ID, e.g., LX-CERT-2026-8F92A1C4
  certificateNumber: string;
  version: number;
  applicationId: string;
  referenceNumber: string;
  internName: string;
  roleTitle: string;
  department: string;
  startDate: string;
  endDate: string;
  issueDate: string; // e.g., "21 October 2026"
  workCompletedSummary: string;
  signatoryName: string;
  signatoryDesignation: string;
  verificationUrl: string;
  status: 'Valid' | 'Revoked';
  revokedReason?: string;
  revokedAt?: string;
  createdAt: string;
}

export interface AdminAuditLog {
  id: string;
  action:
    | 'LISTING_CREATED'
    | 'LISTING_UPDATED'
    | 'APPLICATION_STATUS_CHANGED'
    | 'OFFER_LETTER_ISSUED'
    | 'OFFER_LETTER_REVOKED'
    | 'COMPLETION_APPROVED'
    | 'CERTIFICATE_ISSUED'
    | 'CERTIFICATE_REVOKED'
    | 'SIGNATORY_UPDATED';
  targetId: string;
  summary: string;
  actor: string;
  emailDispatched: boolean;
  createdAt: string;
}

export interface SystemConfigStatus {
  backendConnected: boolean;
  databaseAvailable: boolean;
  adminAuthConfigured: boolean;
  emailWebhookConfigured: boolean;
  whatsappConfigured: boolean;
  geminiConfigured: boolean;
  signatoryConfigured: boolean;
  persistenceMode: 'Server Database (JSON Store)' | 'In-Memory Demo Fallback';
  emailEndpointPath: '/api/enquiries';
}

export interface LovanstrixStore {
  company: CompanyDetails;
  services: ServiceItem[];
  solutions: BusinessSolutionItem[];
  projects: ProjectItem[];
  explorations: ExplorationArea[];
  openings: CareerOpening[];
  enquiries: ProjectEnquiry[];
  careerSubmissions: CareerInterestSubmission[];
  // Internship Management Collections
  internshipListings: InternshipListing[];
  internshipApplications: InternshipApplication[];
  internshipDocuments: OfferLetterDocument[];
  certificateRecords: CertificateRecord[];
  adminAuditLogs: AdminAuditLog[];
}

const DEFAULT_PROCESS_STEPS = [
  'Discover: Understand your objectives, users, and practical constraints.',
  'Plan: Define system architecture, data models, and milestone deliverables.',
  'Design: Create accessible wireframes, high-contrast UI components, and responsive layouts.',
  'Develop: Write clean TypeScript, React, and backend API code.',
  'Test: Validate forms, cross-device responsiveness, and edge cases.',
  'Launch: Deploy to cloud hosting with documentation and handover.',
];

export const INITIAL_STORE: LovanstrixStore = {
  company: {
    name: 'LOVANSTRIX',
    tagline: 'Ideas Into Innovation.',
    heroHeading: 'Technology Solutions Built Around Your Ideas.',
    heroSubtitle:
      'Lovanstrix helps individuals, startups, and businesses explore digital possibilities through website development, web applications, AI integration, and modern software solutions.',
    shortIntroduction:
      'Founded as an emerging technology venture, Lovanstrix works directly with individuals, founders, educators, and growing businesses to turn practical ideas into clean, maintainable digital products and software systems.',
    mission: 'Build useful, accessible, and innovative digital solutions.',
    vision:
      'To grow into a multidisciplinary technology company that develops useful digital products, builds innovative web and AI applications, collaborates with talented developers, and creates structured internship and learning opportunities.',
    stageDisclosure:
      'Lovanstrix is an emerging early-stage technology venture. We focus on direct founder-led engineering, transparent project scoping, and verifiable prototypes—never fabricating client logos, team headcount, or commercial claims.',
    email: 'contact@lovanstrix.tech',
    whatsappNumber: '',
    githubUrl: 'https://github.com/lovanstrix',
    linkedinUrl: 'https://linkedin.com/company/lovanstrix',
    portfolioComingSoonMode: false,
    careerStatusBanner:
      'Lovanstrix is growing its engineering collaborations and mentored student internship cohorts. Explore published tracks or register in our talent network for upcoming opportunities.',
    founderName: 'Founder & Lead Engineer (Lovanstrix)',
    founderRole: 'Founder-Led Engineering & Product Architecture',
    founderBio:
      'Lovanstrix is led directly by its founder with a focus on full-stack web engineering, clean TypeScript architectures, and applied AI workflows. Specific founder biography and credentials can be updated anytime via the Admin Console.',
    authorizedSignatoryName: '',
    authorizedSignatoryDesignation: '',
    officialSupervisorDefault: '',
  },
  services: [
    {
      id: 'srv-web-design-dev',
      slug: 'website-design-and-development',
      index: '01',
      title: 'Website Design and Development',
      category: 'Websites & Digital Presence',
      summary:
        'Custom, mobile-responsive websites engineered from scratch with modern typography, fast load times, and semantic SEO.',
      overview:
        'We design and develop modern websites tailored to your brand identity and audience. Instead of bloated page-builders, we write clean, maintainable React, TypeScript, and semantic HTML/CSS so your website loads fast and scales cleanly as your organization grows.',
      problemsAddressed: [
        'Outdated, non-responsive websites that break on mobile and tablet screens',
        'Slow-loading template sites with poor search visibility and cluttered navigation',
        'Difficulty updating service pages or company announcements without breaking layouts',
      ],
      deliverables: [
        'Custom responsive multi-page or single-page website architecture',
        'Semantic HTML5 structure, OpenGraph social cards, and Schema.org metadata',
        'Accessible contact and enquiry forms with client + server validation',
        'Cross-browser testing across desktop, tablet, and mobile viewports',
      ],
      technologies: ['React 19', 'TypeScript', 'Tailwind CSS', 'HTML5 / CSS3', 'Vite'],
      processSteps: DEFAULT_PROCESS_STEPS,
      faqs: [
        {
          question: 'Do you use pre-made generic templates?',
          answer:
            'No. Every Lovanstrix website is architected with custom components tailored to your specific content, brand colors, and goals.',
        },
        {
          question: 'Can I update text and projects later?',
          answer:
            'Yes. We can include a lightweight Admin Console so you can update company copy, services, and portfolio items without editing source code.',
        },
      ],
      availability: 'Available for New Projects',
      featured: true,
    },
    {
      id: 'srv-business-landing',
      slug: 'business-websites-and-landing-pages',
      index: '02',
      title: 'Business Websites and Landing Pages',
      category: 'Conversion & Brand Launch',
      summary:
        'Focused company websites, product launch pages, and professional portfolios structured to communicate value clearly and capture enquiries.',
      overview:
        'Whether you are launching a new startup, presenting a consulting practice, or showcasing a service line, we build focused landing pages and business websites with clear typographic hierarchy, structured CTAs, and validated lead-capture flows.',
      problemsAddressed: [
        'Visitors leaving because the value proposition and service offerings are unclear',
        'Broken or unvalidated contact forms that fail to capture structured enquiries',
        'Lack of a professional digital presence when pitching to prospective clients or partners',
      ],
      deliverables: [
        'High-clarity hero section, service breakdown, and FAQ architecture',
        'Validated lead/quote enquiry intake connected to your database or webhook',
        'Adaptive Dark & Light mode support if desired',
        'Fast asset optimization and deployment setup',
      ],
      technologies: ['React', 'TypeScript', 'Tailwind CSS', 'Express API', 'SEO Schema'],
      processSteps: DEFAULT_PROCESS_STEPS,
      faqs: [
        {
          question: 'How long does a business landing page or company site take?',
          answer:
            'A focused landing page or multi-section business site typically takes 1 to 3 weeks depending on content readiness and custom interactive features.',
        },
      ],
      availability: 'Available for New Projects',
      featured: true,
    },
    {
      id: 'srv-webapp-dev',
      slug: 'web-application-development',
      index: '03',
      title: 'Web Application Development',
      category: 'Custom Web Software',
      summary:
        'Admin dashboards, management portals, booking systems, student/client portals, and full-stack web applications.',
      overview:
        'We build interactive, state-driven web applications that replace manual spreadsheets and disconnected forms. From role-based admin consoles and student/internship portals to internal workflow trackers, our web apps combine responsive React frontends with structured Node.js backends.',
      problemsAddressed: [
        'Manual operations tracked across scattered spreadsheets and email threads',
        'Need for role-based dashboards where admins and users have scoped permissions',
        'Lack of custom workflow logic such as status tracking, document generation, or audit logs',
      ],
      deliverables: [
        'Interactive React + TypeScript frontend with search, filtering, and role views',
        'Node.js + Express REST API with strict payload validation',
        'Database persistence (PostgreSQL, Firestore, or structured JSON store)',
        'Role-based authorization, exportable CSV reports, and PDF document generation',
      ],
      technologies: ['React 19', 'TypeScript', 'Node.js', 'Express', 'PostgreSQL / Firestore'],
      processSteps: DEFAULT_PROCESS_STEPS,
      faqs: [
        {
          question: 'Can you build portals with both user and admin dashboards?',
          answer:
            'Yes. For example, Lovanstrix’s own Internship Management System includes a public portal, scoped Student Dashboard, Admin Console, and public verification route.',
        },
      ],
      availability: 'Available for New Projects',
      featured: true,
    },
    {
      id: 'srv-ecommerce',
      slug: 'ecommerce-website-development',
      index: '04',
      title: 'E-commerce Website Development',
      category: 'Digital Commerce & Catalogues',
      summary:
        'Product catalogue websites, custom order-enquiry storefronts, inventory browsers, and scoped e-commerce web experiences.',
      overview:
        'We build clean product catalogue websites, B2B order-request portals, and custom storefronts for businesses that want to showcase products with category filtering, specification tables, and order or quote checkout flows.',
      problemsAddressed: [
        'Difficulty presenting structured product catalogues with technical specifications online',
        'Need for custom quote-based checkout or B2B order requests rather than rigid off-the-shelf themes',
        'Slow mobile browsing experience across large product categories',
      ],
      deliverables: [
        'Searchable, filterable product catalogue and detail pages',
        'Admin product management interface (add, edit, publish/unpublish products)',
        'Cart / order-enquiry workflow saved to database',
        'Payment gateway integration available upon project review and merchant account setup',
      ],
      technologies: ['React', 'TypeScript', 'Tailwind CSS', 'Node.js', 'REST APIs'],
      processSteps: DEFAULT_PROCESS_STEPS,
      faqs: [
        {
          question: 'Are third-party payment gateways or shipping APIs pre-installed?',
          answer:
            'We do not claim pre-bundled third-party merchant integrations out of the box. Payment gateways (such as Razorpay or Stripe) are scoped, implemented, and tested specifically for your merchant account during project delivery.',
        },
      ],
      availability: 'Available Upon Project Review',
      featured: true,
    },
    {
      id: 'srv-ai-integration',
      slug: 'ai-chatbots-and-ai-integration',
      index: '05',
      title: 'AI Chatbots and AI Integration',
      category: 'Applied AI Solutions',
      summary:
        'Server-side Gemini API integrations, structured brief analyzers, FAQ assistants, and practical AI workflow tools.',
      overview:
        'We integrate proven foundation models (such as Google Gemini) into websites and web applications through secure server-side API proxy routes. We focus on practical, deterministic use cases—such as structured data extraction, enquiry triage, and document summarization—while keeping API keys strictly on the server.',
      problemsAddressed: [
        'Insecure frontend AI implementations that expose API keys in browser code',
        'Unstructured client enquiries or documents that require manual sorting and scoping',
        'Apps that break completely when an external AI API is unconfigured or rate-limited',
      ],
      deliverables: [
        'Secure server-side Node.js proxy routes for Gemini API calls',
        'Structured JSON schema validation for predictable AI outputs',
        'Graceful deterministic fallback templates when paid API keys are not active',
        'Custom UI panels integrated into your existing web application',
      ],
      technologies: ['Gemini API (@google/genai)', 'Node.js Proxy', 'TypeScript', 'JSON Schema'],
      processSteps: DEFAULT_PROCESS_STEPS,
      faqs: [
        {
          question: 'Will my website still work if I do not have a paid AI API key yet?',
          answer:
            'Yes. We engineer every AI feature with a clean server-side fallback mode so your core website and forms work reliably without requiring a paid API key.',
        },
      ],
      availability: 'Available for New Projects',
      featured: true,
    },
    {
      id: 'srv-ui-ux',
      slug: 'ui-ux-design',
      index: '06',
      title: 'UI/UX Design',
      category: 'Interface & Experience Design',
      summary:
        'Wireframes, component design systems, responsive interface redesigns, and accessibility-focused user flows.',
      overview:
        'Good software feels effortless to navigate. We design high-contrast user interfaces, interactive prototypes, and clean design systems that prioritize legibility, keyboard accessibility, and responsive mobile-to-desktop ergonomics.',
      problemsAddressed: [
        'Cluttered dashboards and confusing navigation that frustrate end users',
        'Inconsistent typography, spacing, and low-contrast color combinations',
        'Lack of clear wireframes before starting full-stack software development',
      ],
      deliverables: [
        'Page structure wireframes and user journey mapping',
        'Dark and light theme color tokens with WCAG AA contrast compliance',
        'Interactive React component prototypes',
        'Usability and responsive layout audit for existing web apps',
      ],
      technologies: ['Figma', 'Tailwind CSS', 'Component Tokens', 'WCAG AA Accessibility', 'Three.js'],
      processSteps: DEFAULT_PROCESS_STEPS,
      faqs: [
        {
          question: 'Can you redesign an existing web application’s interface?',
          answer:
            'Yes. We can audit your current UI, modernize its navigation, typography, and mobile responsiveness, and deliver clean React/Tailwind components.',
        },
      ],
      availability: 'Available for New Projects',
      featured: true,
    },
    {
      id: 'srv-backend-api',
      slug: 'backend-and-api-development',
      index: '07',
      title: 'Backend and API Development',
      category: 'Server & API Engineering',
      summary:
        'RESTful API architecture, authentication middleware, rate limiting, audit logging, and secure server-side webhooks.',
      overview:
        'Every reliable web application depends on a well-structured backend. We build type-safe Node.js and Express services with input validation, role-based access control, private file handling, and clean API contracts.',
      problemsAddressed: [
        'Frontend-only prototypes that lack persistent data storage or server-side security',
        'Unvalidated API endpoints vulnerable to malformed payloads or duplicate submissions',
        'Need for server-side PDF/document issuance, audit logs, or webhook dispatchers',
      ],
      deliverables: [
        'Modular Express / Node.js REST API endpoints',
        'Token/session authentication and role-based authorization middleware',
        'Rate limiting, duplicate submission guards, and append-only audit logs',
        'Optional server-side email/webhook notification integration',
      ],
      technologies: ['Node.js', 'Express', 'TypeScript', 'REST APIs', 'HMAC / Token Auth'],
      processSteps: DEFAULT_PROCESS_STEPS,
      faqs: [
        {
          question: 'How do you handle sensitive files like applicant resumes?',
          answer:
            'Sensitive files are validated for file type and size and stored in private server directories outside public static assets, accessible only to authenticated administrators.',
        },
      ],
      availability: 'Available for New Projects',
      featured: false,
    },
    {
      id: 'srv-database-design',
      slug: 'database-design-and-integration',
      index: '08',
      title: 'Database Design and Integration',
      category: 'Data Architecture & Security',
      summary:
        'Relational (PostgreSQL) and document (Firestore) schema modeling, data validation, and access-control rules.',
      overview:
        'We design normalized relational schemas and structured document collections that keep your application data consistent, queryable, and protected by strict ownership and role rules.',
      problemsAddressed: [
        'Poorly structured data models that become slow or difficult to query as records grow',
        'Missing security rules in cloud document databases',
        'Need to migrate from temporary browser storage to persistent server databases',
      ],
      deliverables: [
        'Entity-relationship and collection schema blueprints',
        'Firestore security rules (`firestore.rules`) or SQL table definitions',
        'CRUD data access layer with TypeScript interfaces',
        'CSV data export utilities for administrators',
      ],
      technologies: ['PostgreSQL / SQL', 'Firebase Firestore', 'Security Rules', 'TypeScript'],
      processSteps: DEFAULT_PROCESS_STEPS,
      faqs: [
        {
          question: 'Do you write Firestore security rules?',
          answer:
            'Yes. We design explicit `firestore.rules` enforcing user ownership and server-verified admin roles so private collections are never exposed publicly.',
        },
      ],
      availability: 'Available for New Projects',
      featured: false,
    },
    {
      id: 'srv-maintenance-bugfix',
      slug: 'website-maintenance-and-bug-fixing',
      index: '09',
      title: 'Website Maintenance and Bug Fixing',
      category: 'Codebase Health & Reliability',
      summary:
        'Troubleshooting UI glitches, fixing broken forms or API routes, TypeScript refactoring, and performance optimization.',
      overview:
        'Already have a website or web application that needs attention? We diagnose layout regressions, resolve TypeScript and build errors, fix broken responsive views, and clean up technical debt.',
      problemsAddressed: [
        'Broken mobile layouts, overlapping navigation bars, or non-working buttons',
        'Build failures, dependency conflicts, or unhandled runtime errors',
        'Sluggish page load performance and missing SEO metadata',
      ],
      deliverables: [
        'Root-cause diagnosis and targeted code fixes',
        'Responsive breakpoint cleanup across mobile, tablet, and desktop',
        'TypeScript type-safety and linter error resolution',
        'Verified production build check',
      ],
      technologies: ['React', 'TypeScript', 'HTML/CSS', 'Node.js', 'Vite / Webpack'],
      processSteps: DEFAULT_PROCESS_STEPS,
      faqs: [
        {
          question: 'Can you work with an existing React or TypeScript repository?',
          answer:
            'Yes. We review your existing codebase, preserve working features, and implement clean, non-destructive improvements.',
        },
      ],
      availability: 'Available for New Projects',
      featured: false,
    },
    {
      id: 'srv-deployment-support',
      slug: 'deployment-and-technical-support',
      index: '10',
      title: 'Deployment and Technical Support',
      category: 'Cloud Hosting & Operations',
      summary:
        'Cloud Run, Vercel, Netlify, or VPS deployment configuration, environment variable setup, SSL, and handover documentation.',
      overview:
        'We help individuals and startups take their web applications from local development to live cloud hosting using cost-effective free-tier or scalable cloud platforms, complete with environment secret configuration and operational documentation.',
      problemsAddressed: [
        'Difficulty deploying full-stack Node.js + React apps to production environments',
        'Misconfigured environment variables, CORS issues, or broken SPA routing on refresh',
        'Lack of clear setup documentation for future maintainers',
      ],
      deliverables: [
        'Production build pipeline and server start script configuration',
        'Environment variable (`.env.example`) template and secret isolation review',
        'Custom domain, SSL, and SPA fallback routing setup guidance',
        'Step-by-step deployment and administration runbook',
      ],
      technologies: ['Google Cloud Run', 'Vercel / Netlify', 'Node.js', 'Docker / Buildpacks', 'Git'],
      processSteps: DEFAULT_PROCESS_STEPS,
      faqs: [
        {
          question: 'Do you prioritize free-tier friendly hosting options?',
          answer:
            'Yes. For early-stage projects and startups, we recommend hosting architectures with generous free tiers and scale-to-zero efficiency.',
        },
      ],
      availability: 'Available for New Projects',
      featured: false,
    },
    {
      id: 'srv-custom-software',
      slug: 'custom-software-solutions',
      index: '11',
      title: 'Custom Software Solutions',
      category: 'Tailored Digital Products',
      summary:
        'Bespoke MVP development, interactive 3D web experiences, internal business tools, and experimental R&D prototypes.',
      overview:
        'When off-the-shelf software does not fit your workflow or product concept, we collaborate with you to architect custom digital solutions—ranging from startup MVPs and document verification systems to interactive 3D browser visualizations.',
      problemsAddressed: [
        'Unique product ideas that require custom business logic and interactive user interfaces',
        'Need for a functional, investor-ready or user-testable MVP without agency bloat',
        'Bridging multiple workflows (such as applications, reviews, and verifiable PDF credentials) in one system',
      ],
      deliverables: [
        'End-to-end MVP architecture and technical specification',
        'Iterative prototype builds with transparent milestone reviews',
        'Full source-code ownership and documentation upon completion',
        'Extensibility roadmap for future phases',
      ],
      technologies: ['React 19', 'TypeScript', 'Node.js', 'Three.js / WebGL', 'PDF & Data Engines'],
      processSteps: DEFAULT_PROCESS_STEPS,
      faqs: [
        {
          question: 'How do you scope custom software projects?',
          answer:
            'We start by defining a focused Phase 1 MVP with clear deliverables and fixed milestones so you can validate your idea quickly and predictably.',
        },
      ],
      availability: 'Available Upon Project Review',
      featured: true,
    },
  ],
  solutions: [
    {
      id: 'sol-digital-transformation',
      index: '01',
      title: 'Business Digital Transformation',
      category: 'Operations Modernization',
      useCase:
        'For small businesses, educational institutes, and service organizations transitioning from paper forms and scattered spreadsheets to a unified digital workflow.',
      summary:
        'Replace manual intake forms, status tracking sheets, and repetitive document preparation with a streamlined web portal tailored to your daily operations.',
      potentialFeatures: [
        'Digital client or student intake forms with automated reference numbers',
        'Centralized administrator dashboard with search, filters, and status pipelines',
        'One-click CSV report exports and standardized PDF document generation',
        'Role-based access so staff and external users only see authorized records',
      ],
      recommendedService: 'Web Application Development',
      integrationDisclosure:
        'Built using modular web technologies. Any external ERP, accounting, or email webhook integration is scoped and verified per engagement.',
      readinessStatus: 'Available for Scoping',
    },
    {
      id: 'sol-custom-portals',
      index: '02',
      title: 'Custom Web Portals',
      category: 'Scoped User & Admin Portals',
      useCase:
        'For organizations that need a dedicated self-service portal where clients, students, or applicants can sign in, check status updates, and download official documents.',
      summary:
        'Secure, multi-role web portals with scoped authentication, status timelines, task tracking, and public credential verification.',
      potentialFeatures: [
        'Scoped applicant/client login using verified credentials or reference keys',
        'Real-time status stepper (e.g. Submitted → Under Review → Approved)',
        'Private document vault for authorized PDF offer letters, invoices, or certificates',
        'Public verification lookup endpoint for issued credentials',
      ],
      recommendedService: 'Custom Software Solutions',
      integrationDisclosure:
        'Demonstrated live on this website via the Lovanstrix Internship & Student Portal (/internships and /student-dashboard).',
      readinessStatus: 'Available for Scoping',
    },
    {
      id: 'sol-booking-management',
      index: '03',
      title: 'Booking and Management Systems',
      category: 'Scheduling & Resource Coordination',
      useCase:
        'For clinics, training centers, studios, and local service providers that need structured appointment requests, resource scheduling, or enquiry management.',
      summary:
        'Clean booking request interfaces paired with an operator console to review, confirm, reschedule, or archive incoming requests.',
      potentialFeatures: [
        'Service or slot selection interface with client validation',
        'Admin queue management with status filters (New, Confirmed, Completed, Archived)',
        'Automated reference code generation for customer lookup',
        'Optional server-side webhook notifications for staff alerts',
      ],
      recommendedService: 'Web Application Development',
      integrationDisclosure:
        'Calendar sync or SMS/email gateways are optional and configured only when client API credentials are provided.',
      readinessStatus: 'Available for Scoping',
    },
    {
      id: 'sol-ai-workflows',
      index: '04',
      title: 'AI-Powered Business Workflows',
      category: 'Applied Intelligence & Automation',
      useCase:
        'For teams looking to integrate practical LLM capabilities—such as project brief structuring, enquiry summarization, or knowledge-base Q&A—into their web apps.',
      summary:
        'Server-side AI integrations engineered with strict JSON output schemas, zero frontend secret exposure, and reliable deterministic fallbacks.',
      potentialFeatures: [
        'Interactive scope & brief analyzers that convert raw user text into structured milestones',
        'Internal document or enquiry triage assistants',
        'Server-side Gemini API proxy routes with rate-limiting guards',
        'Fallback template engine when external AI APIs are offline or unconfigured',
      ],
      recommendedService: 'AI Chatbots and AI Integration',
      integrationDisclosure:
        'Demonstrated live below in our Interactive MVP Architecture & Scope Planner.',
      readinessStatus: 'Available for Scoping',
    },
    {
      id: 'sol-startup-mvp',
      index: '05',
      title: 'Startup MVP Development',
      category: 'Early-Stage Product Engineering',
      useCase:
        'For solo founders and early-stage startups who need to turn a product concept into a working, testable web application to validate with real users.',
      summary:
        'Focused, milestone-driven MVP engineering that prioritizes core user flows, clean UI/UX, and maintainable TypeScript code over unnecessary complexity.',
      potentialFeatures: [
        'Interactive UI prototype and core full-stack workflow implementation',
        'User authentication, database schema design, and admin management controls',
        'Responsive desktop and mobile browser compatibility',
        'Clean codebase handover ready for future team expansion',
      ],
      recommendedService: 'Custom Software Solutions',
      integrationDisclosure:
        'Scoped around free-tier friendly infrastructure so early-stage founders keep monthly hosting costs minimal.',
      readinessStatus: 'Available for Scoping',
    },
    {
      id: 'sol-product-catalogue',
      index: '06',
      title: 'Product Catalogue Websites',
      category: 'E-commerce & B2B Showcases',
      useCase:
        'For manufacturers, retailers, and distributors who want to showcase products online with category filters, technical specs, and direct quote/order enquiries.',
      summary:
        'Fast, searchable digital product catalogues that let customers browse items, compare specifications, and submit structured order or quote requests.',
      potentialFeatures: [
        'Multi-category product filtering and instant keyword search',
        'Detailed product specification views and high-contrast visual galleries',
        'Direct "Request Quote for Item" or custom order-sheet submission',
        'Admin dashboard to add, update, publish, or hide catalogue items',
      ],
      recommendedService: 'E-commerce Website Development',
      integrationDisclosure:
        'Third-party payment processors or inventory ERPs are not claimed as pre-active; they are integrated upon project review.',
      readinessStatus: 'Prototype & Custom Build',
    },
    {
      id: 'sol-iot-prototypes',
      index: '07',
      title: 'IoT and Experimental Prototypes',
      category: 'Connected Telemetry & R&D',
      useCase:
        'For engineering teams, researchers, and makers exploring web dashboards for sensor telemetry, smart agriculture/healthcare concepts, or 3D spatial interfaces.',
      summary:
        'Experimental software architectures that connect simulated or edge microcontroller data streams with real-time browser visualization dashboards.',
      potentialFeatures: [
        'JSON telemetry ingestion endpoints for edge sensor nodes',
        'Real-time threshold monitoring and web visualization panels',
        'Interactive 3D / WebGL hardware and spatial system representations',
        'Collaborative R&D prototyping for academic and startup validation',
      ],
      recommendedService: 'Custom Software Solutions',
      integrationDisclosure:
        'Currently offered as software & dashboard R&D prototyping. Lovanstrix does not manufacture commercial hardware devices.',
      readinessStatus: 'Experimental R&D',
    },
  ],
  projects: [
    {
      id: 'proj-internship-portal',
      title: 'Lovanstrix Internship & Credential Management System',
      category: 'Web Applications',
      classification: 'Published Project',
      objective:
        'Full-stack internship lifecycle portal with track publishing, private resume intake, scoped student dashboard, versioned PDF offer letters/certificates, and public verification.',
      problemStatement:
        'Early-stage organizations often manage student internship applications via scattered emails and issue unverified documents without a central audit trail or public authenticity check.',
      proposedSolution:
        'Built an integrated end-to-end portal featuring status-gated applications, private server-side resume storage, signatory-guarded PDF generation, and a rate-limited public certificate verification route.',
      technologies: ['React 19', 'TypeScript', 'Node.js', 'Express', 'jsPDF'],
      features: [
        'Public track directory (/internships) with transparent stipend and eligibility disclosures',
        'Scoped Student Dashboard (/student-dashboard) and Admin Portal (/admin/internships)',
        'Public Certificate Verification (/verify-certificate/:id) with append-only audit logs',
      ],
      liveDemoUrl: '#internships',
      githubUrl: 'https://github.com/lovanstrix',
      visualType: 'webapp',
      published: true,
      publishedAt: '2026',
    },
    {
      id: 'proj-enquiry-portal',
      title: 'Agency Service & Quote Management Architecture',
      category: 'Web Applications',
      classification: 'Demo Project',
      objective:
        'Demonstrate a full-stack IT services agency portal with 11 dedicated service detail views, validated quote intake, live admin content management, and transparent delivery reporting.',
      problemStatement:
        'Service businesses need a way to present detailed technical offerings, capture structured client project briefs, and manage website content without relying on heavy CMS plugins.',
      proposedSolution:
        'Engineered a modular React + Express platform with individual service detail pages, pre-filled quote routing, database persistence, and an authenticated Admin Console.',
      technologies: ['React 19', 'TypeScript', 'Node.js', 'Express', 'Tailwind CSS'],
      features: [
        'Client and server input validation for project quotes with optional reference links',
        'Role-protected Admin Management Console with live service and portfolio publishing',
        'Transparent database persistence and optional server-side email webhook forwarding',
      ],
      liveDemoUrl: '#contact',
      githubUrl: 'https://github.com/lovanstrix',
      visualType: 'webapp',
      published: true,
      publishedAt: '2026',
    },
    {
      id: 'proj-ai-triage-sandbox',
      title: 'Structured Project Brief & AI Scope Analyzer',
      category: 'AI Projects',
      classification: 'Prototype',
      objective:
        'Convert raw client project ideas into structured technical deliverables, recommended stacks, and 4-phase milestones via a secure server-side Gemini proxy.',
      problemStatement:
        'Prospective clients often struggle to translate a high-level business idea into concrete software milestones and technology stack choices.',
      proposedSolution:
        'Created an interactive scope planner backed by a server-side Gemini API route with strict JSON schema output and a zero-cost deterministic template fallback.',
      technologies: ['TypeScript', 'Gemini API (Server-Side)', 'JSON Schema', 'React'],
      features: [
        '4-phase milestone breakdown (Discover, Design, Build, Launch)',
        'Zero frontend API key exposure with server-side proxy architecture',
        'Seamless one-click transfer of generated scope into the Request a Quote form',
      ],
      liveDemoUrl: '#solutions',
      githubUrl: 'https://github.com/lovanstrix',
      visualType: 'ai',
      published: true,
      publishedAt: '2026',
    },
    {
      id: 'proj-3d-innovation-core',
      title: 'Interactive 3D Spatial Engineering Core',
      category: 'Websites',
      classification: 'Architecture Demo',
      objective:
        'Showcase an interactive Three.js / WebGL spatial installation embedded inside a high-contrast startup website with hardware-accelerated raycasting and fallback controls.',
      problemStatement:
        'Standard 3D web embeds often suffer from poor text contrast, runaway GPU frame loops, or lack of keyboard/fallback accessibility.',
      proposedSolution:
        'Built a custom Three.js scene with studio environment reflections, raycastable lifecycle satellites (Discover → Launch), OrbitControls, and a 2D SVG blueprint toggle.',
      technologies: ['Three.js', 'WebGL', 'React 19', 'TypeScript', 'Tailwind CSS'],
      features: [
        'Interactive orbital stage inspection with live telemetry HUD',
        'Software-WebGL detection and reduced-motion accessibility compliance',
        'Instant toggle between 3D Interactive Core and 2D SVG Blueprint',
      ],
      liveDemoUrl: '#home',
      githubUrl: 'https://github.com/lovanstrix',
      visualType: 'website',
      published: true,
      publishedAt: '2026',
    },
    {
      id: 'proj-iot-telemetry-schema',
      title: 'Edge Sensor Telemetry Ingestion & Alert Concept',
      category: 'IoT and Hardware',
      classification: 'In Development',
      objective:
        'R&D exploration of a lightweight JSON telemetry ingestion schema and web monitoring view designed for future environmental and agricultural sensor nodes.',
      problemStatement:
        'Low-power edge microcontrollers require compact, predictable HTTP/MQTT payload schemas and lightweight web dashboards to visualize threshold alerts.',
      proposedSolution:
        'Developing a reference Node.js ingestion schema and time-series visualization prototype for future IoT and AgriTech collaborations.',
      technologies: ['Node.js', 'TypeScript', 'REST Ingestion', 'Time-Series Schema'],
      features: [
        'Lightweight payload specification for edge microcontrollers',
        'Configurable threshold rule evaluation prototype',
        'Foundation for future student IoT internship research projects',
      ],
      liveDemoUrl: '#solutions',
      visualType: 'iot',
      published: true,
      publishedAt: '2026',
    },
    {
      id: 'proj-catalogue-sandbox',
      title: 'Modular B2B Product Catalogue & Quote Cart Concept',
      category: 'Experimental Prototypes',
      classification: 'Prototype',
      objective:
        'Internal prototype exploring a fast, filterable product specification catalogue where buyers can assemble multi-item quote requests without complex checkout friction.',
      problemStatement:
        'Many B2B suppliers and custom manufacturers need a digital product catalogue that routes into a tailored quote enquiry rather than a fixed retail cart.',
      proposedSolution:
        'Architected a reusable React catalogue grid with category filtering, specification comparison, and direct quote-form prefill.',
      technologies: ['React', 'TypeScript', 'Tailwind CSS', 'REST API'],
      features: [
        'Instant category and specification filtering',
        'Direct integration with server-side quote enquiry storage',
        'Clean responsive layout across mobile and desktop devices',
      ],
      liveDemoUrl: '#solutions',
      visualType: 'website',
      published: true,
      publishedAt: '2026',
    },
  ],
  explorations: [
    {
      id: 'exp-ai',
      index: '01',
      title: 'Artificial Intelligence',
      statusLabel: 'Active Service Track',
      summary:
        'Practical integration of large language models into web interfaces for document assistance, structured enquiry routing, and workflow automation.',
      practicalFocus: [
        'Server-side Gemini API integration with strict schema outputs',
        'Custom knowledge base search and FAQ assistants for businesses',
        'Automated form triage and structured summary generation',
      ],
      honestNote:
        'Available now for web and API integration projects. We integrate proven foundation models via secure backend APIs rather than training custom foundational models.',
    },
    {
      id: 'exp-webapps',
      index: '02',
      title: 'Web Applications',
      statusLabel: 'Active Service Track',
      summary:
        'Modern full-stack web applications that replace scattered spreadsheets with unified dashboards, portals, and operational tools.',
      practicalFocus: [
        'Internal operations dashboards and inventory/booking trackers',
        'Client portals with role-based views and status workflows',
        'Progressive web interfaces optimized for desktop and mobile browsers',
      ],
      honestNote:
        'Core active capability at Lovanstrix. Ready for client scoping and iterative prototype delivery.',
    },
    {
      id: 'exp-iot',
      index: '03',
      title: 'Internet of Things (IoT)',
      statusLabel: 'Internal Prototype Stage',
      summary:
        'Connecting connected sensor nodes with cloud dashboards to monitor environmental metrics, equipment status, and real-time alerts.',
      practicalFocus: [
        'Web-based telemetry dashboards for microcontroller sensor feeds',
        'REST and WebSocket data ingestion pipelines',
        'Hardware-to-cloud prototyping with standard development boards',
      ],
      honestNote:
        'Currently in internal R&D and software architecture prototyping. Commercial hardware manufacturing is not offered at this stage.',
    },
    {
      id: 'exp-healthcare',
      index: '04',
      title: 'Healthcare Technology',
      statusLabel: 'Concept Exploration',
      summary:
        'Exploring accessible digital tools for clinic appointment coordination, patient intake forms, and health education portals.',
      practicalFocus: [
        'Streamlined digital appointment request and queue interfaces',
        'Accessible patient education and clinic information websites',
        'Privacy-first data handling patterns',
      ],
      honestNote:
        'Future exploration area. Lovanstrix does not currently provide certified medical diagnostic software or clinical devices.',
    },
    {
      id: 'exp-agritech',
      index: '05',
      title: 'Agriculture Technology',
      statusLabel: 'Concept Exploration',
      summary:
        'Investigating how lightweight web apps and future soil/weather telemetry can assist regional growers with resource planning.',
      practicalFocus: [
        'Mobile-friendly crop calendar and input tracking interfaces',
        'Experimental weather and soil moisture dashboard concepts',
        'Local-first web tools for low-bandwidth rural connectivity',
      ],
      honestNote:
        'Early concept research aimed at future regional field trials and student research collaborations.',
    },
    {
      id: 'exp-robotics',
      index: '06',
      title: 'Robotics and Emerging Technologies',
      statusLabel: 'Long-Term Research Horizon',
      summary:
        'Long-term vision to bridge web control interfaces with embedded systems, robotics education kits, and automation experiments.',
      practicalFocus: [
        'Browser-based control and telemetry panels for educational robotics',
        'Collaborative R&D projects with engineering students and makers',
        'Open-source hardware/software bridge experiments',
      ],
      honestNote:
        'Part of Lovanstrix’s long-term roadmap. Currently focused on software architecture and community learning rather than commercial robotics.',
    },
  ],
  openings: [],
  enquiries: [],
  careerSubmissions: [],
  internshipListings: [
    {
      id: 'int-frontend-2026',
      code: 'LX-TRK-FE01',
      title: 'Frontend Web Engineering Track (React & TypeScript)',
      department: 'Frontend Development',
      description:
        'Structured project-based learning track focused on building accessible, responsive web interfaces, reusable design-system components, and interactive 3D/2D browser experiences.',
      techStack: ['React 19', 'TypeScript', 'Tailwind CSS', 'Three.js', 'Vite'],
      workMode: 'Remote',
      compensationType: 'Unpaid / Academic Learning',
      stipendDetails:
        'Unpaid educational/project track by default; specific stipend terms (if applicable) are disclosed in writing on official offer letters.',
      duration: '8 Weeks',
      weeklyCommitment: '12–15 hours / week (Flexible around college classes)',
      eligibility:
        'Undergraduate CS/IT/Engineering students or self-taught developers with foundational HTML, CSS, and JavaScript/TypeScript knowledge.',
      requiredSkills: ['React Fundamentals', 'TypeScript Basics', 'Responsive CSS', 'Git Version Control'],
      responsibilities: [
        'Build modular UI components following WCAG AA contrast and keyboard accessibility standards',
        'Collaborate on state management, form validation, and REST API integration',
        'Participate in code reviews and weekly milestone demonstrations',
      ],
      learningObjectives: [
        'Master production TypeScript component patterns and clean state architecture',
        'Learn responsive layout engineering and performance optimization',
        'Understand end-to-end Git workflows and technical documentation',
      ],
      selectionCriteria:
        'Evaluated on code clarity, problem-solving fundamentals, portfolio/GitHub repositories, and learning motivation. Submitting an application does not guarantee selection.',
      positionsCount: 3,
      deadline: '30 November 2026',
      status: 'Upcoming',
      createdAt: '2026-10-21T00:00:00.000Z',
    },
    {
      id: 'int-fullstack-2026',
      code: 'LX-TRK-FS02',
      title: 'Full-Stack Web Application Engineering Track',
      department: 'Full-Stack Development',
      description:
        'Hands-on engineering track covering REST API architecture, server-side validation, database schema design, and full-stack React + Node.js application development.',
      techStack: ['React', 'TypeScript', 'Node.js', 'Express', 'PostgreSQL / Firestore'],
      workMode: 'Remote',
      compensationType: 'Unpaid / Academic Learning',
      stipendDetails:
        'Unpaid learning cohort unless a client-sponsored stipend is explicitly specified when the cohort opens.',
      duration: '10 Weeks',
      weeklyCommitment: '15 hours / week',
      eligibility:
        'Students or early-career developers familiar with both frontend components and basic Node.js/REST concepts.',
      requiredSkills: ['TypeScript', 'React', 'Node.js & Express', 'JSON & REST APIs'],
      responsibilities: [
        'Develop and test backend API endpoints with strict input validation',
        'Connect frontend dashboards with secure server-side data persistence',
        'Document API schemas, error states, and deployment configurations',
      ],
      learningObjectives: [
        'Design role-based authorization and secure server-side API proxies',
        'Model relational and document database schemas cleanly',
        'Deploy full-stack applications to modern cloud runtimes',
      ],
      selectionCriteria:
        'Reviewed based on demonstrated full-stack curiosity, personal projects, and technical clarity.',
      positionsCount: 2,
      deadline: '15 December 2026',
      status: 'Upcoming',
      createdAt: '2026-10-21T00:00:00.000Z',
    },
    {
      id: 'int-aiml-2026',
      code: 'LX-TRK-AI03',
      title: 'Applied AI & LLM Workflow Integration Track',
      department: 'AI/ML',
      description:
        'Practical exploration of integrating foundation models into web applications using server-side API proxies, structured JSON schemas, and deterministic guardrails.',
      techStack: ['TypeScript', 'Node.js', 'Gemini API', 'Structured Outputs', 'React'],
      workMode: 'Remote',
      compensationType: 'Unpaid / Academic Learning',
      stipendDetails:
        'Unpaid R&D exploration track. Any stipend or project grant is stated prior to onboarding.',
      duration: '8 Weeks',
      weeklyCommitment: '10–12 hours / week',
      eligibility:
        'Students interested in applied AI engineering, prompt structuring, and full-stack web integration.',
      requiredSkills: ['JavaScript / TypeScript', 'API Integration', 'JSON Schema Design'],
      responsibilities: [
        'Prototype server-side AI assistants with structured JSON output validation',
        'Design fallback templates when external LLM APIs are offline or rate-limited',
        'Evaluate latency, prompt safety, and user experience clarity',
      ],
      learningObjectives: [
        'Build secure server-side LLM proxy endpoints without exposing API keys',
        'Combine deterministic business rules with generative AI workflows',
      ],
      selectionCriteria:
        'Assessed on practical software engineering fundamentals and clear understanding of API security.',
      positionsCount: 2,
      deadline: '15 December 2026',
      status: 'Upcoming',
      createdAt: '2026-10-21T00:00:00.000Z',
    },
    {
      id: 'int-uiux-2026',
      code: 'LX-TRK-UX04',
      title: 'UI/UX Product & Design Systems Track',
      department: 'UI/UX Design',
      description:
        'Focused on wireframing, high-contrast dark/light interface systems, accessible typography, and translating complex workflows into intuitive layouts.',
      techStack: ['Figma', 'Design Tokens', 'WCAG AA Accessibility', 'Responsive CSS'],
      workMode: 'Remote',
      compensationType: 'Unpaid / Academic Learning',
      stipendDetails: 'Unpaid educational mentorship track.',
      duration: '6 Weeks',
      weeklyCommitment: '10 hours / week',
      eligibility: 'Design and frontend students with a portfolio of wireframes or UI concepts.',
      requiredSkills: ['Wireframing', 'Visual Hierarchy', 'Responsive Layouts', 'Accessibility'],
      responsibilities: [
        'Create clean user flows and component specifications for web applications',
        'Audit color contrast, keyboard focus states, and mobile usability',
      ],
      learningObjectives: [
        'Structure scalable design systems that translate directly into CSS/Tailwind code',
        'Eliminate visual clutter in data-dense dashboards and forms',
      ],
      selectionCriteria: 'Portfolio review focusing on usability, clarity, and attention to detail.',
      positionsCount: 2,
      deadline: '30 November 2026',
      status: 'Upcoming',
      createdAt: '2026-10-21T00:00:00.000Z',
    },
    {
      id: 'int-backend-2026',
      code: 'LX-TRK-BE05',
      title: 'Backend API & Database Architecture Track',
      department: 'Backend Development',
      description:
        'Focused on building reliable Node.js/Express services, authentication middleware, audit logging, and document/relational persistence.',
      techStack: ['Node.js', 'Express', 'TypeScript', 'PostgreSQL', 'Firestore'],
      workMode: 'Remote',
      compensationType: 'Unpaid / Academic Learning',
      stipendDetails: 'Unpaid learning track.',
      duration: '8 Weeks',
      weeklyCommitment: '12 hours / week',
      eligibility: 'Students with solid programming fundamentals in TypeScript/JavaScript or Python.',
      requiredSkills: ['Node.js', 'REST APIs', 'SQL or NoSQL Basics', 'Security Fundamentals'],
      responsibilities: [
        'Build authenticated API routes with strict role and ownership checks',
        'Implement rate limiting, audit trails, and structured error handling',
      ],
      learningObjectives: [
        'Understand server-side security, session tokens, and data privacy',
        'Write maintainable, type-safe backend services',
      ],
      selectionCriteria: 'Evaluated on backend logic clarity and security awareness.',
      positionsCount: 2,
      deadline: '15 December 2026',
      status: 'Upcoming',
      createdAt: '2026-10-21T00:00:00.000Z',
    },
    {
      id: 'int-iot-2026',
      code: 'LX-TRK-IOT06',
      title: 'IoT Telemetry & Web Control Interface Track',
      department: 'IoT',
      description:
        'Experimental R&D track exploring how edge sensor nodes transmit telemetry to real-time web dashboards.',
      techStack: ['Node.js', 'MQTT / HTTP Ingestion', 'TypeScript', 'Web Dashboards'],
      workMode: 'Remote',
      compensationType: 'Unpaid / Academic Learning',
      stipendDetails: 'Unpaid experimental research track.',
      duration: '8 Weeks',
      weeklyCommitment: '10 hours / week',
      eligibility: 'Electronics, IoT, or CS students interested in hardware-to-cloud data pipelines.',
      requiredSkills: ['JSON Telemetry', 'Basic Microcontrollers / Simulation', 'Web APIs'],
      responsibilities: [
        'Simulate sensor payload streams and build web visualization views',
        'Document lightweight payload schemas for low-power devices',
      ],
      learningObjectives: [
        'Bridge embedded/simulated sensor data with modern web applications',
      ],
      selectionCriteria: 'Interest in embedded systems and web telemetry visualization.',
      positionsCount: 2,
      deadline: '31 December 2026',
      status: 'Upcoming',
      createdAt: '2026-10-21T00:00:00.000Z',
    },
  ],
  internshipApplications: [],
  internshipDocuments: [],
  certificateRecords: [],
  adminAuditLogs: [],
};
