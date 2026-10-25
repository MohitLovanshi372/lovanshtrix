import mongoose from 'mongoose';

const { Schema } = mongoose;

const companySettingSchema = new Schema(
  {
    singletonKey: { type: String, default: 'default', unique: true, index: true },
    name: { type: String, required: true, trim: true, default: 'LOVANSTRIX' },
    tagline: { type: String, trim: true, default: 'Ideas Into Innovation.' },
    heroHeadline: { type: String, trim: true, default: 'We Build Digital Ideas Into Reality.' },
    heroSubtitle: { type: String, trim: true, default: '' },
    positioning: { type: String, trim: true, default: '' },
    vision: { type: String, trim: true, default: '' },
    mission: { type: String, trim: true, default: '' },
    story: { type: String, trim: true, default: '' },
    founderName: { type: String, trim: true, default: 'Mohit Lovanshi' },
    founderRole: { type: String, trim: true, default: 'Founder & CEO' },
    founderBio: { type: String, trim: true, default: '' },
    email: { type: String, trim: true, lowercase: true, default: 'contact@lovanstrix.com' },
    phone: { type: String, trim: true, default: '' },
    whatsappNumber: { type: String, trim: true, default: '' },
    location: { type: String, trim: true, default: 'India · Remote-First Digital Studio' },
    ResponseTime: { type: String, trim: true, default: 'Within 24–48 business hours' },
    socials: {
      linkedin: { type: String, trim: true, default: '' },
      github: { type: String, trim: true, default: '' },
      instagram: { type: String, trim: true, default: '' },
      x: { type: String, trim: true, default: '' },
    },
  },
  { timestamps: true }
);

const serviceSchema = new Schema(
  {
    id: { type: String, required: true, unique: true, index: true },
    slug: { type: String, required: true, unique: true, index: true },
    title: { type: String, required: true, trim: true },
    shortDescription: { type: String, required: true, trim: true },
    overview: { type: String, default: '' },
    iconName: { type: String, default: 'Code2' },
    accentColor: { type: String, default: 'blue' },
    features: { type: [String], default: [] },
    useCases: { type: [String], default: [] },
    technologies: { type: [String], default: [] },
    processSteps: {
      type: [
        {
          step: { type: String, required: true },
          title: { type: String, required: true },
          description: { type: String, required: true },
        },
      ],
      default: [],
    },
    deliverables: { type: [String], default: [] },
    ctaLabel: { type: String, default: 'Discuss This Service' },
    featured: { type: Boolean, default: true, index: true },
    order: { type: Number, default: 0, index: true },
  },
  { timestamps: true }
);

const solutionSchema = new Schema(
  {
    id: { type: String, required: true, unique: true, index: true },
    title: { type: String, required: true, trim: true },
    category: { type: String, required: true, trim: true, index: true },
    problem: { type: String, default: '' },
    approach: { type: String, default: '' },
    outcomes: { type: [String], default: [] },
    idealFor: { type: String, default: '' },
    recommendedStack: { type: [String], default: [] },
    order: { type: Number, default: 0 },
  },
  { timestamps: true }
);

const projectSchema = new Schema(
  {
    id: { type: String, required: true, unique: true, index: true },
    title: { type: String, required: true, trim: true },
    slug: { type: String, required: true, index: true },
    category: {
      type: String,
      enum: ['Web Development', 'Web Applications', 'AI Integration', 'UI/UX & Frontend', 'Concept Prototype'],
      default: 'Web Development',
      index: true,
    },
    typeBadge: {
      type: String,
      enum: ['Sample Project', 'Concept Build', 'Internal Prototype', 'Live Demonstration'],
      default: 'Sample Project',
    },
    summary: { type: String, required: true },
    problemSolved: { type: String, default: '' },
    architectureNotes: { type: String, default: '' },
    features: { type: [String], default: [] },
    techStack: { type: [String], default: [] },
    previewTheme: {
      type: String,
      enum: ['analytics', 'ai-workspace', 'commerce', 'portal'],
      default: 'analytics',
    },
    liveDemoUrl: { type: String, default: '' },
    githubUrl: { type: String, default: '' },
    featured: { type: Boolean, default: true, index: true },
    order: { type: Number, default: 0 },
  },
  { timestamps: true }
);

const explorationSchema = new Schema(
  {
    id: { type: String, required: true, unique: true, index: true },
    title: { type: String, required: true, trim: true },
    category: { type: String, default: '' },
    statusLabel: {
      type: String,
      enum: ['Active R&D', 'Future Roadmap', 'Architecture Exploration'],
      default: 'Active R&D',
    },
    summary: { type: String, default: '' },
    capabilities: { type: [String], default: [] },
    Order: { type: Number, default: 1 },
  },
  { timestamps: true }
);

const careerOpeningSchema = new Schema(
  {
    id: { type: String, required: true, unique: true, index: true },
    title: { type: String, required: true, trim: true },
    track: { type: String, required: true, trim: true },
    type: {
      type: String,
      enum: ['Future Opportunity', 'Talent Pool', 'Project Collaboration', 'Internship Track'],
      default: 'Talent Pool',
    },
    mode: {
      type: String,
      enum: ['Remote', 'Hybrid', 'Flexible'],
      default: 'Remote',
    },
    status: {
      type: String,
      enum: ['Open for Interest', 'Future Intake', 'Active'],
      default: 'Open for Interest',
      index: true,
    },
    summary: { type: String, default: '' },
    skills: { type: [String], default: [] },
    learningOutcomes: { type: [String], default: [] },
  },
  { timestamps: true }
);

const projectEnquirySchema = new Schema(
  {
    id: { type: String, required: true, unique: true, index: true },
    referenceNumber: { type: String, required: true, unique: true, index: true },
    fullName: { type: String, required: true, trim: true },
    email: { type: String, required: true, trim: true, lowercase: true, index: true },
    phone: { type: String, default: '' },
    companyOrProject: { type: String, default: '' },
    serviceNeeded: { type: String, required: true },
    budgetRange: { type: String, default: 'To Be Discussed' },
    timeline: { type: String, default: 'Flexible' },
    projectDetails: { type: String, required: true },
    status: {
      type: String,
      enum: ['New', 'Reviewed', 'Contacted', 'Proposal Sent', 'Archived'],
      default: 'New',
      index: true,
    },
    adminNotes: { type: String, default: '' },
    createdAt: { type: String, default: () => new Date().toISOString(), index: true },
  },
  { timestamps: true }
);

const careerSubmissionSchema = new Schema(
  {
    id: { type: String, required: true, unique: true, index: true },
    referenceNumber: { type: String, required: true, unique: true, index: true },
    fullName: { type: String, required: true, trim: true },
    email: { type: String, required: true, trim: true, lowercase: true, index: true },
    phone: { type: String, default: '' },
    areaOfInterest: { type: String, required: true },
    roleType: {
      type: String,
      enum: ['Career Collaboration', 'Future Internship Interest', 'Freelance / Contract'],
      default: 'Career Collaboration',
    },
    experienceLevel: { type: String, default: 'Early Career / Builder' },
    skills: { type: [String], default: [] },
    portfolioOrGithub: { type: String, default: '' },
    resumeLink: { type: String, default: '' },
    resumeFileName: { type: String, default: '' },
    resumeMimeType: { type: String, default: '' },
    message: { type: String, default: '' },
    status: {
      type: String,
      enum: ['Received', 'Under Review', 'Shortlisted', 'Archived'],
      default: 'Received',
      index: true,
    },
    adminNotes: { type: String, default: '' },
    createdAt: { type: String, default: () => new Date().toISOString(), index: true },
  },
  { timestamps: true }
);

const internshipListingSchema = new Schema(
  {
    id: { type: String, required: true, unique: true, index: true },
    title: { type: String, required: true, trim: true },
    slug: { type: String, required: true, index: true },
    domain: {
      type: String,
      enum: [
        'Web Development',
        'Frontend Engineering (React)',
        'Full-Stack Web Apps',
        'AI Integration & Prompt Engineering',
        'UI/UX & Product Design',
        'Python & Automation',
      ],
      default: 'Web Development',
      index: true,
    },
    duration: { type: String, default: '8 Weeks' },
    mode: { type: String, enum: ['Remote', 'Hybrid', 'Flexible'], default: 'Remote' },
    stipendType: {
      type: String,
      enum: ['Unpaid Learning Track', 'Performance-Based', 'Project Fellowship'],
      default: 'Project Fellowship',
    },
    status: {
      type: String,
      enum: ['Open', 'Upcoming Batch', 'Closed'],
      default: 'Open',
      index: true,
    },
    batchLabel: { type: String, default: '' },
    shortSummary: { type: String, default: '' },
    description: { type: String, default: '' },
    skillsRequired: { type: [String], default: [] },
    learningOutcomes: { type: [String], default: [] },
    perks: { type: [String], default: [] },
    featured: { type: Boolean, default: true },
  },
  { timestamps: true }
);

const internshipApplicationSchema = new Schema(
  {
    id: { type: String, required: true, unique: true, index: true },
    applicationId: { type: String, required: true, unique: true, index: true },
    internshipId: { type: String, required: true, index: true },
    internshipTitle: { type: String, required: true },
    domain: { type: String, required: true },
    fullName: { type: String, required: true, trim: true },
    email: { type: String, required: true, trim: true, lowercase: true, index: true },
    phone: { type: String, required: true, trim: true },
    collegeOrOrganization: { type: String, required: true },
    degreeAndYear: { type: String, default: 'Not specified' },
    cityAndState: { type: String, default: '' },
    PreferredDuration: { type: String, default: '8 Weeks' },
    skills: { type: [String], default: [] },
    githubOrPortfolio: { type: String, default: '' },
    linkedinUrl: { type: String, default: '' },
    resumeLink: { type: String, default: '' },
    resumeFileName: { type: String, default: '' },
    resumeMimeType: { type: String, default: '' },
    whyJoin: { type: String, required: true },
    projectExperience: { type: String, default: '' },
    availability: { type: String, default: 'Immediate' },
    status: {
      type: String,
      enum: ['Submitted', 'Under Review', 'Shortlisted', 'Offer Issued', 'Active Intern', 'Completed', 'Archived'],
      default: 'Submitted',
      index: true,
    },
    assignedTasksSummary: { type: String, default: '' },
    projectSubmissionUrl: { type: String, default: '' },
    offerLetterId: { type: String, default: '' },
    certificateId: { type: String, default: '' },
    adminNotes: { type: String, default: '' },
    createdAt: { type: String, default: () => new Date().toISOString(), index: true },
    updatedAt: { type: String, default: () => new Date().toISOString() },
  },
  { timestamps: false }
);

const privateResumeSchema = new Schema(
  {
    recordKind: { type: String, enum: ['internship', 'career'], required: true, index: true },
    recordId: { type: String, required: true, index: true },
    fileName: { type: String, required: true },
    mimeType: { type: String, required: true },
    fileBuffer: { type: Buffer, required: true },
    sizeBytes: { type: Number, required: true },
  },
  { timestamps: true }
);
privateResumeSchema.index({ recordKind: 1, recordId: 1 }, { unique: true });

const offerLetterSchema = new Schema(
  {
    id: { type: String, required: true, unique: true, index: true },
    offerNumber: { type: String, required: true, unique: true, index: true },
    applicationId: { type: String, required: true, index: true },
    candidateName: { type: String, required: true },
    candidateEmail: { type: String, required: true, lowercase: true },
    collegeOrOrganization: { type: String, default: '' },
    roleTitle: { type: String, required: true },
    domain: { type: String, required: true },
    duration: { type: String, default: '8 Weeks' },
    mode: { type: String, enum: ['Remote', 'Hybrid', 'Flexible'], default: 'Remote' },
    startDate: { type: String, required: true },
    endDate: { type: String, required: true },
    issueDate: { type: String, required: true },
    stipendNote: { type: String, default: '' },
    mentorName: { type: String, default: 'Mohit Lovanshi' },
    signatoryName: { type: String, default: 'Mohit Lovanshi' },
    signatoryTitle: { type: String, default: 'Founder & CEO, Lovanstrix' },
    responsibilities: { type: [String], default: [] },
    termsNote: { type: String, default: '' },
    status: { type: String, enum: ['Issued', 'Accepted', 'Revoked'], default: 'Issued', index: true },
  },
  { timestamps: true }
);

const certificateSchema = new Schema(
  {
    id: { type: String, required: true, unique: true, index: true },
    certificateCode: { type: String, required: true, unique: true, index: true },
    applicationId: { type: String, default: '', index: true },
    recipientName: { type: String, required: true, trim: true },
    recipientEmail: { type: String, default: '', lowercase: true, index: true },
    collegeOrOrganization: { type: String, default: '' },
    roleTitle: { type: String, required: true },
    domain: { type: String, required: true },
    duration: { type: String, default: '8 Weeks' },
    startDate: { type: String, required: true },
    endDate: { type: String, required: true },
    issueDate: { type: String, required: true },
    projectTitle: { type: String, default: '' },
    performanceGrade: {
      type: String,
      enum: ['Outstanding', 'Excellent', 'Commendable', 'Successfully Completed'],
      default: 'Excellent',
    },
    skillsDemonstrated: { type: [String], default: [] },
    citationNote: { type: String, default: '' },
    signatoryName: { type: String, default: 'Mohit Lovanshi' },
    signatoryTitle: { type: String, default: 'Founder & CEO, Lovanstrix' },
    status: { type: String, enum: ['Valid', 'Revoked'], default: 'Valid', index: true },
  },
  { timestamps: true }
);

const adminAuditLogSchema = new Schema(
  {
    action: { type: String, required: true, index: true },
    actorIp: { type: String, default: 'unknown' },
    summary: { type: String, default: '' },
    metadata: { type: Schema.Types.Mixed, default: {} },
  },
  { timestamps: true }
);

export const CompanySetting =
  mongoose.models.CompanySetting || mongoose.model('CompanySetting', companySettingSchema);
export const Service = mongoose.models.Service || mongoose.model('Service', serviceSchema);
export const Solution = mongoose.models.Solution || mongoose.model('Solution', solutionSchema);
export const Project = mongoose.models.Project || mongoose.model('Project', projectSchema);
export const Exploration =
  mongoose.models.Exploration || mongoose.model('Exploration', explorationSchema);
export const CareerOpening =
  mongoose.models.CareerOpening || mongoose.model('CareerOpening', careerOpeningSchema);
export const ProjectEnquiry =
  mongoose.models.ProjectEnquiry || mongoose.model('ProjectEnquiry', projectEnquirySchema);
export const CareerSubmission =
  mongoose.models.CareerSubmission || mongoose.model('CareerSubmission', careerSubmissionSchema);
export const InternshipListing =
  mongoose.models.InternshipListing || mongoose.model('InternshipListing', internshipListingSchema);
export const InternshipApplication =
  mongoose.models.InternshipApplication ||
  mongoose.model('InternshipApplication', internshipApplicationSchema);
export const PrivateResume =
  mongoose.models.PrivateResume || mongoose.model('PrivateResume', privateResumeSchema);
export const OfferLetter =
  mongoose.models.OfferLetter || mongoose.model('OfferLetter', offerLetterSchema);
export const Certificate =
  mongoose.models.Certificate || mongoose.model('Certificate', certificateSchema);
export const AdminAuditLog =
  mongoose.models.AdminAuditLog || mongoose.model('AdminAuditLog', adminAuditLogSchema);
