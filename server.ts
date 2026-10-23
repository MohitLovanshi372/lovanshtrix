import crypto from 'crypto';
import dotenv from 'dotenv';
import express, { Request, Response, NextFunction } from 'express';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI, Type } from '@google/genai';
import {
  INITIAL_STORE,
  LovanstrixStore,
  ProjectEnquiry,
  CareerInterestSubmission,
  ServiceItem,
  ProjectItem,
  CareerOpening,
  SystemConfigStatus,
  InternshipListing,
  InternshipApplication,
  OfferLetterDocument,
  CertificateRecord,
  AdminAuditLog,
  ApplicationStatus,
  InternshipCompensationType,
  InternshipWorkMode,
  InternshipDepartment,
  InternshipListingStatus,
} from './src/types/lovanstrix.ts';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DATA_DIR = path.join(__dirname, 'data');
const STORE_PATH = path.join(DATA_DIR, 'lovanstrix-store.json');
const PRIVATE_RESUMES_DIR = path.join(DATA_DIR, 'private-resumes');

let databaseWritable = true;

function ensureDataDirs() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
  if (!fs.existsSync(PRIVATE_RESUMES_DIR)) {
    fs.mkdirSync(PRIVATE_RESUMES_DIR, { recursive: true });
  }
}

function loadStore(): LovanstrixStore {
  try {
    ensureDataDirs();
    if (!fs.existsSync(STORE_PATH)) {
      const seed = structuredClone(INITIAL_STORE);
      if (process.env.COMPANY_EMAIL) {
        seed.company.email = process.env.COMPANY_EMAIL.trim();
      }
      if (process.env.COMPANY_WHATSAPP) {
        seed.company.whatsappNumber = process.env.COMPANY_WHATSAPP.replace(/[^\d+]/g, '');
      }
      fs.writeFileSync(STORE_PATH, JSON.stringify(seed, null, 2), 'utf-8');
      databaseWritable = true;
      return seed;
    }
    const raw = fs.readFileSync(STORE_PATH, 'utf-8');
    const parsed = JSON.parse(raw) as LovanstrixStore;
    databaseWritable = true;

    // Auto-upgrade legacy 6-service store to the 11-service IT Services Company catalog
    const needsServiceUpgrade =
      !Array.isArray(parsed.services) ||
      parsed.services.length < 11 ||
      !parsed.services[0]?.slug;

    const upgradedCompany = {
      ...INITIAL_STORE.company,
      ...(parsed.company || {}),
      heroHeading:
        !parsed.company?.heroHeading ||
        parsed.company?.heroHeading === 'We Build Digital Experiences That Move Ideas Forward.' ||
        parsed.company?.heroHeading === 'Technology Solutions Built Around Your Ideas.' ||
        parsed.company?.heroHeading === 'We Build Digital Ideas Into Reality.'
          ? INITIAL_STORE.company.heroHeading
          : parsed.company.heroHeading,
      heroSubtitle:
        parsed.company?.heroSubtitle?.startsWith(
          'Lovanstrix is an emerging technology venture focused on web development'
        )
          ? INITIAL_STORE.company.heroSubtitle
          : parsed.company?.heroSubtitle || INITIAL_STORE.company.heroSubtitle,
      founderName: parsed.company?.founderName || INITIAL_STORE.company.founderName,
      founderRole: parsed.company?.founderRole || INITIAL_STORE.company.founderRole,
      founderBio: parsed.company?.founderBio || INITIAL_STORE.company.founderBio,
    };

    const upgradedProjects =
      Array.isArray(parsed.projects) &&
      parsed.projects.length >= INITIAL_STORE.projects.length &&
      parsed.projects[0]?.problemStatement
        ? parsed.projects
        : structuredClone(INITIAL_STORE.projects);

    const merged: LovanstrixStore = {
      ...INITIAL_STORE,
      ...parsed,
      company: upgradedCompany,
      services: needsServiceUpgrade
        ? structuredClone(INITIAL_STORE.services)
        : parsed.services,
      solutions:
        Array.isArray(parsed.solutions) && parsed.solutions.length > 0
          ? parsed.solutions
          : structuredClone(INITIAL_STORE.solutions),
      projects: upgradedProjects,
      internshipListings: Array.isArray(parsed.internshipListings)
        ? parsed.internshipListings
        : structuredClone(INITIAL_STORE.internshipListings),
      internshipApplications: Array.isArray(parsed.internshipApplications)
        ? parsed.internshipApplications
        : [],
      internshipDocuments: Array.isArray(parsed.internshipDocuments)
        ? parsed.internshipDocuments
        : [],
      certificateRecords: Array.isArray(parsed.certificateRecords)
        ? parsed.certificateRecords
        : [],
      adminAuditLogs: Array.isArray(parsed.adminAuditLogs) ? parsed.adminAuditLogs : [],
    };

    if (needsServiceUpgrade) {
      try {
        fs.writeFileSync(STORE_PATH, JSON.stringify(merged, null, 2), 'utf-8');
      } catch {
        // Ignore write warning on upgrade
      }
    }

    return merged;
  } catch (err) {
    console.error('Error loading store, falling back to in-memory demo store:', err);
    databaseWritable = false;
    return structuredClone(INITIAL_STORE);
  }
}

function saveStore(storeToSave: LovanstrixStore): boolean {
  try {
    ensureDataDirs();
    fs.writeFileSync(STORE_PATH, JSON.stringify(storeToSave, null, 2), 'utf-8');
    databaseWritable = true;
    return true;
  } catch (err) {
    console.error('Failed to persist store to disk:', err);
    databaseWritable = false;
    return false;
  }
}

let store: LovanstrixStore = loadStore();

// Fallback in-memory map for private resumes if disk isn't writable
const inMemoryResumes = new Map<
  string,
  { fileName: string; mimeType: string; size: number; base64: string }
>();

function savePrivateResume(
  applicationId: string,
  payload: { fileName: string; mimeType: string; size: number; base64: string }
): void {
  inMemoryResumes.set(applicationId, payload);
  try {
    ensureDataDirs();
    const safeId = applicationId.replace(/[^a-zA-Z0-9_-]/g, '');
    const filePath = path.join(PRIVATE_RESUMES_DIR, `${safeId}.json`);
    fs.writeFileSync(filePath, JSON.stringify(payload), 'utf-8');
  } catch (err) {
    console.error('Warning: failed to persist private resume to disk, kept in memory:', err);
  }
}

function loadPrivateResume(
  applicationId: string
): { fileName: string; mimeType: string; size: number; base64: string } | null {
  try {
    const safeId = applicationId.replace(/[^a-zA-Z0-9_-]/g, '');
    const filePath = path.join(PRIVATE_RESUMES_DIR, `${safeId}.json`);
    if (fs.existsSync(filePath)) {
      const raw = fs.readFileSync(filePath, 'utf-8');
      return JSON.parse(raw);
    }
  } catch (err) {
    console.error('Failed to read private resume from disk:', err);
  }
  return inMemoryResumes.get(applicationId) || null;
}

function isRealSecret(val: string | undefined, placeholder: string): boolean {
  if (!val) return false;
  const trimmed = val.trim();
  return trimmed.length > 0 && trimmed !== placeholder;
}

function isEmailWebhookConfigured(): boolean {
  const webhookUrl = process.env.SMTP_WEBHOOK_URL?.trim() || '';
  if (!webhookUrl || webhookUrl === 'MY_SMTP_WEBHOOK_URL') return false;
  return webhookUrl.startsWith('http://') || webhookUrl.startsWith('https://');
}

/**
 * Dedicated server-side email/webhook dispatcher.
 * SMTP_WEBHOOK_URL is strictly optional. When unconfigured, this function
 * immediately returns { sent: false, configured: false } without throwing
 * or claiming an email was sent.
 */
async function dispatchServerSideEmailNotification(
  payload: Record<string, unknown>
): Promise<{ sent: boolean; configured: boolean; statusReason: string }> {
  if (!isEmailWebhookConfigured()) {
    return {
      sent: false,
      configured: false,
      statusReason:
        'SMTP_WEBHOOK_URL is optional and not configured on the server. No email was sent.',
    };
  }

  const webhookUrl = process.env.SMTP_WEBHOOK_URL!.trim();
  try {
    const resp = await fetch(webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    if (resp.ok) {
      return {
        sent: true,
        configured: true,
        statusReason: 'Notification dispatched via configured server-side email endpoint.',
      };
    }
    return {
      sent: false,
      configured: true,
      statusReason: `Server-side email webhook returned HTTP ${resp.status}. No email delivery was confirmed.`,
    };
  } catch (err) {
    console.error('Optional server-side email webhook error:', err);
    return {
      sent: false,
      configured: true,
      statusReason: 'Server-side email endpoint could not be reached. No email was sent.',
    };
  }
}

function getSystemConfigStatus(currentStore: LovanstrixStore): SystemConfigStatus {
  const adminPasscode = process.env.ADMIN_PASSCODE?.trim() || '';
  const geminiKey = process.env.GEMINI_API_KEY?.trim() || '';
  const whatsapp =
    currentStore.company.whatsappNumber?.trim() ||
    process.env.COMPANY_WHATSAPP?.trim() ||
    '';
  const signatoryConfigured = Boolean(
    currentStore.company.authorizedSignatoryName?.trim() &&
      currentStore.company.authorizedSignatoryDesignation?.trim()
  );

  return {
    backendConnected: true,
    databaseAvailable: databaseWritable,
    adminAuthConfigured: adminPasscode.length >= 12,
    emailWebhookConfigured: isEmailWebhookConfigured(),
    whatsappConfigured: /^\+?[1-9]\d{7,14}$/.test(whatsapp.replace(/[\s-]/g, '')),
    geminiConfigured: isRealSecret(geminiKey, 'MY_GEMINI_API_KEY'),
    signatoryConfigured,
    persistenceMode: databaseWritable
      ? 'Server Database (JSON Store)'
      : 'In-Memory Demo Fallback',
    emailEndpointPath: '/api/enquiries',
  };
}

const INITIAL_ADMIN_PASSCODE = process.env.ADMIN_PASSCODE?.trim() || '';
const TOKEN_SECRET =
  INITIAL_ADMIN_PASSCODE.length >= 12
    ? crypto.createHash('sha256').update(INITIAL_ADMIN_PASSCODE).digest('hex')
    : crypto.randomBytes(32).toString('hex');

function createAdminToken(passcode: string): string {
  return crypto.createHmac('sha256', TOKEN_SECRET).update(passcode).digest('hex');
}

function hashAccessKey(key: string): string {
  return crypto.createHash('sha256').update(key.trim().toUpperCase()).digest('hex');
}

function createStudentSessionToken(email: string): string {
  const normalizedEmail = email.trim().toLowerCase();
  const sig = crypto.createHmac('sha256', TOKEN_SECRET).update(normalizedEmail).digest('hex');
  return Buffer.from(JSON.stringify({ email: normalizedEmail, sig })).toString('base64url');
}

function verifyStudentSessionToken(token: string): { email: string } | null {
  try {
    const decoded = JSON.parse(Buffer.from(token, 'base64url').toString('utf-8'));
    if (!decoded || typeof decoded.email !== 'string') {
      return null;
    }
    const expectedSig = crypto
      .createHmac('sha256', TOKEN_SECRET)
      .update(decoded.email)
      .digest('hex');
    if (decoded.sig !== expectedSig) return null;
    return { email: decoded.email };
  } catch {
    return null;
  }
}

function requireAdminAuth(req: Request, res: Response, next: NextFunction) {
  const configuredPasscode = process.env.ADMIN_PASSCODE?.trim() || '';
  if (configuredPasscode.length < 12) {
    return res.status(503).json({
      error: 'Admin access is disabled. Set a unique ADMIN_PASSCODE of at least 12 characters in the server environment, then restart the backend.',
    });
  }
  const authHeader = req.headers.authorization || '';
  const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7).trim() : '';
  const expected = Buffer.from(createAdminToken(configuredPasscode));
  const supplied = Buffer.from(token);
  if (supplied.length !== expected.length || !crypto.timingSafeEqual(supplied, expected)) {
    return res.status(401).json({
      error: 'Unauthorized. Enter the configured server-side admin passcode.',
    });
  }
  return next();
}

function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function recordAuditLog(
  action: AdminAuditLog['action'],
  targetId: string,
  summary: string,
  emailDispatched = false
): AdminAuditLog {
  const entry: AdminAuditLog = {
    id: `aud-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    action,
    targetId,
    summary,
    actor: process.env.ADMIN_PASSCODE ? 'Verified Admin' : 'Admin (Preview Session)',
    emailDispatched,
    createdAt: new Date().toISOString(),
  };
  store.adminAuditLogs.unshift(entry);
  return entry;
}

// Simple rate limiter for public endpoints (application submission & certificate verification)
const rateLimitBuckets = new Map<string, { count: number; resetAt: number }>();
function checkRateLimit(key: string, maxRequests: number, windowMs: number): boolean {
  const now = Date.now();
  const bucket = rateLimitBuckets.get(key);
  if (!bucket || now > bucket.resetAt) {
    rateLimitBuckets.set(key, { count: 1, resetAt: now + windowMs });
    return true;
  }
  if (bucket.count >= maxRequests) {
    return false;
  }
  bucket.count += 1;
  return true;
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Allow up to 6MB JSON payload for base64-encoded 2MB PDF/DOCX private resume uploads
  app.use(express.json({ limit: '6mb' }));

  // Public bootstrap data
  app.get('/api/bootstrap', (_req: Request, res: Response) => {
    const configStatus = getSystemConfigStatus(store);
    res.json({
      company: store.company,
      services: store.services,
      solutions: store.solutions,
      projects: store.projects.filter((p) => p.published !== false),
      explorations: store.explorations,
      openings: store.openings.filter((o) => o.status === 'Open'),
      internshipListings: store.internshipListings.filter((l) => l.status !== 'Archived'),
      configStatus,
    });
  });

  // Public server-side email & database integration readiness check (never exposes secrets)
  app.get('/api/integrations/email-status', (_req: Request, res: Response) => {
    const status = getSystemConfigStatus(store);
    res.json({
      emailWebhookConfigured: status.emailWebhookConfigured,
      databaseAvailable: status.databaseAvailable,
      persistenceMode: status.persistenceMode,
      serverEndpoint: '/api/enquiries',
      optionalNotice: status.emailWebhookConfigured
        ? 'Server-side email forwarding is configured and active.'
        : 'SMTP_WEBHOOK_URL is optional and not currently configured. Enquiries are saved to the server database (or handled in demo mode) and no emails are sent until configured.',
    });
  });

  // ============================================================================
  // INTERNSHIP MANAGEMENT SYSTEM — PUBLIC & STUDENT ENDPOINTS
  // ============================================================================

  // Submit Validated Student Internship Application
  app.post('/api/internships/apply', async (req: Request, res: Response) => {
    const clientIp = req.ip || 'unknown-ip';
    if (!checkRateLimit(`apply:${clientIp}`, 12, 10 * 60 * 1000)) {
      return res.status(429).json({
        error:
          'Too many application attempts from this network. Please wait a few minutes and try again.',
      });
    }

    const {
      listingId,
      fullName,
      email,
      phone,
      college,
      courseAndYear,
      skills,
      portfolioUrl,
      githubUrl,
      linkedinUrl,
      resumeFile,
      motivation,
      availability,
      preferredStartDate,
      privacyConsent,
    } = req.body || {};

    if (!listingId || typeof listingId !== 'string') {
      return res.status(400).json({ error: 'Please select an internship listing.' });
    }

    const listing = store.internshipListings.find((l) => l.id === listingId);
    if (!listing) {
      return res.status(404).json({ error: 'Selected internship listing was not found.' });
    }
    if (listing.status !== 'Open') {
      return res.status(400).json({
        error: `Applications are not currently accepted for "${listing.title}" because its status is ${listing.status}. An administrator must publish the listing as Open first.`,
      });
    }

    if (!fullName || typeof fullName !== 'string' || fullName.trim().length < 2) {
      return res.status(400).json({ error: 'Please provide your full legal name.' });
    }
    if (!email || typeof email !== 'string' || !isValidEmail(email.trim())) {
      return res.status(400).json({ error: 'Please provide a valid email address.' });
    }
    if (!college || typeof college !== 'string' || college.trim().length < 3) {
      return res.status(400).json({ error: 'Please enter your college or institution name.' });
    }
    if (!courseAndYear || typeof courseAndYear !== 'string' || courseAndYear.trim().length < 2) {
      return res.status(400).json({
        error: 'Please specify your degree/course and current study year.',
      });
    }

    const normalizedSkills = Array.isArray(skills)
      ? skills.map((s: unknown) => String(s).trim()).filter(Boolean)
      : typeof skills === 'string'
      ? skills
          .split(',')
          .map((s) => s.trim())
          .filter(Boolean)
      : [];

    if (normalizedSkills.length === 0) {
      return res.status(400).json({
        error: 'Please specify at least one relevant technical or design skill.',
      });
    }

    const cleanPortfolioUrl = portfolioUrl ? String(portfolioUrl).trim() : '';
    const hasResumeUpload =
      resumeFile &&
      typeof resumeFile === 'object' &&
      typeof resumeFile.name === 'string' &&
      typeof resumeFile.base64 === 'string' &&
      resumeFile.base64.length > 0;

    if (!hasResumeUpload && !cleanPortfolioUrl) {
      return res.status(400).json({
        error:
          'Please upload a private resume file (PDF/DOCX, max 2 MB) or provide a valid portfolio URL.',
      });
    }

    if (hasResumeUpload) {
      const allowedTypes = [
        'application/pdf',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      ];
      const fileExt = String(resumeFile.name).toLowerCase();
      const validExt =
        fileExt.endsWith('.pdf') || fileExt.endsWith('.doc') || fileExt.endsWith('.docx');
      if (!allowedTypes.includes(resumeFile.type) && !validExt) {
        return res.status(400).json({
          error: 'Invalid resume file format. Only PDF, DOC, and DOCX files are permitted.',
        });
      }
      const sizeBytes = Number(resumeFile.size || 0);
      if (sizeBytes > 2 * 1024 * 1024) {
        return res.status(400).json({
          error: 'Resume file exceeds the 2 MB maximum size limit.',
        });
      }
    }

    for (const [label, rawUrl] of [
      ['Portfolio URL', cleanPortfolioUrl],
      ['GitHub URL', githubUrl ? String(githubUrl).trim() : ''],
      ['LinkedIn URL', linkedinUrl ? String(linkedinUrl).trim() : ''],
    ]) {
      if (rawUrl) {
        try {
          const parsed = new URL(rawUrl);
          if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
            return res
              .status(400)
              .json({ error: `${label} must start with http:// or https://.` });
          }
        } catch {
          return res.status(400).json({ error: `Please enter a valid URL for ${label}.` });
        }
      }
    }

    if (!motivation || typeof motivation !== 'string' || motivation.trim().length < 20) {
      return res.status(400).json({
        error: 'Please write a short motivation statement (at least 20 characters).',
      });
    }
    if (!availability || typeof availability !== 'string' || availability.trim().length < 2) {
      return res.status(400).json({ error: 'Please specify your weekly availability.' });
    }
    if (!preferredStartDate || typeof preferredStartDate !== 'string') {
      return res.status(400).json({ error: 'Please provide your preferred start date.' });
    }
    if (privacyConsent !== true) {
      return res.status(400).json({
        error:
          'You must consent to the Lovanstrix applicant privacy notice to submit an application.',
      });
    }

    const normalizedEmail = email.trim().toLowerCase();
    // Prevent accidental duplicate submission for the same listing and email
    const duplicate = store.internshipApplications.find(
      (appItem) =>
        appItem.listingId === listing.id &&
        appItem.email.toLowerCase() === normalizedEmail &&
        appItem.status !== 'Withdrawn'
    );
    if (duplicate) {
      return res.status(409).json({
        error: `An active application (${duplicate.referenceNumber}) already exists for ${normalizedEmail} under "${listing.title}". Sign in to the Student Dashboard to track its status.`,
      });
    }

    const yearStr = new Date().getFullYear().toString();
    const randomRefCode = crypto.randomBytes(2).toString('hex').toUpperCase();
    const referenceNumber = `LX-INT-${yearStr}-${randomRefCode}`;

    const rawAccessKey = `LX-KEY-${crypto.randomBytes(3).toString('hex').toUpperCase()}`;
    const studentAccessKeyHash = hashAccessKey(rawAccessKey);

    const appId = `iapp-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;

    if (hasResumeUpload) {
      savePrivateResume(appId, {
        fileName: String(resumeFile.name).trim(),
        mimeType: String(resumeFile.type || 'application/pdf'),
        size: Number(resumeFile.size || 0),
        base64: String(resumeFile.base64),
      });
    }

    const emailResult = await dispatchServerSideEmailNotification({
      type: 'LOVANSTRIX_INTERNSHIP_APPLICATION_RECEIVED',
      referenceNumber,
      applicantName: fullName.trim(),
      applicantEmail: normalizedEmail,
      roleTitle: listing.title,
      department: listing.department,
      submittedAt: new Date().toISOString(),
    });

    const newApplication: InternshipApplication = {
      id: appId,
      referenceNumber,
      listingId: listing.id,
      roleTitle: listing.title,
      department: listing.department,
      fullName: fullName.trim(),
      email: normalizedEmail,
      phone: phone ? String(phone).trim() : '',
      college: college.trim(),
      courseAndYear: courseAndYear.trim(),
      skills: normalizedSkills,
      portfolioUrl: cleanPortfolioUrl,
      githubUrl: githubUrl ? String(githubUrl).trim() : '',
      linkedinUrl: linkedinUrl ? String(linkedinUrl).trim() : '',
      hasPrivateResume: Boolean(hasResumeUpload),
      resumeFileName: hasResumeUpload ? String(resumeFile.name).trim() : undefined,
      resumeMimeType: hasResumeUpload
        ? String(resumeFile.type || 'application/pdf')
        : undefined,
      resumeSize: hasResumeUpload ? Number(resumeFile.size || 0) : undefined,
      motivation: motivation.trim(),
      availability: availability.trim(),
      preferredStartDate: preferredStartDate.trim(),
      privacyConsent: true,
      status: 'Submitted',
      assignedTasks: [],
      progressStatus: 'Not Started',
      completionApproved: false,
      internalNotes: '',
      studentAccessKeyHash,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    store.internshipApplications.unshift(newApplication);
    const persisted = saveStore(store);

    const notice = emailResult.sent
      ? 'Your application was confirmed by the server database and a notification was dispatched via our configured server-side email webhook.'
      : 'Your application was confirmed and saved to the server database. Because SMTP_WEBHOOK_URL is optional and not currently configured, no email was sent—please save your Reference Number and Student Access Key below.';

    return res.status(201).json({
      application: newApplication,
      studentAccessKey: rawAccessKey,
      savedToDatabase: persisted,
      emailDelivered: emailResult.sent,
      notice,
    });
  });

  // Student Scoped Authentication Login
  app.post('/api/student/login', (req: Request, res: Response) => {
    const email = req.body?.email;
    const referenceOrAccessKey = req.body?.referenceOrAccessKey || req.body?.accessOrRef;
    if (
      !email ||
      typeof email !== 'string' ||
      !referenceOrAccessKey ||
      typeof referenceOrAccessKey !== 'string'
    ) {
      return res.status(400).json({
        error:
          'Please enter both your applicant email address and your Application Reference Number (or Student Access Key).',
      });
    }

    const normalizedEmail = email.trim().toLowerCase();
    const cleanedSecret = referenceOrAccessKey.trim().toUpperCase();
    const candidateHash = hashAccessKey(cleanedSecret);

    const matchingApps = store.internshipApplications.filter(
      (a) => a.email.toLowerCase() === normalizedEmail
    );

    if (matchingApps.length === 0) {
      return res.status(401).json({
        error: 'No internship applications found for that email address.',
      });
    }

    const verifiedApp = matchingApps.find(
      (a) =>
        a.studentAccessKeyHash === candidateHash ||
        a.referenceNumber.toUpperCase() === cleanedSecret
    );

    if (!verifiedApp) {
      return res.status(401).json({
        error:
          'Invalid Application Reference Number or Student Access Key for this email address.',
      });
    }

    const sessionToken = createStudentSessionToken(normalizedEmail);
    return res.json({
      authenticated: true,
      token: sessionToken,
      email: normalizedEmail,
    });
  });

  // Student Scoped Dashboard Data (Strictly scoped to authenticated student's own records)
  app.get('/api/student/me', (req: Request, res: Response) => {
    const authHeader = req.headers.authorization || '';
    const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7).trim() : '';
    const session = token ? verifyStudentSessionToken(token) : null;

    if (!session) {
      return res
        .status(401)
        .json({ error: 'Unauthorized student session. Please sign in again.' });
    }

    const ownApplications = store.internshipApplications
      .filter((a) => a.email.toLowerCase() === session.email)
      .map((a) => {
        // Strip internal admin notes and access key hashes before returning to student
        const { internalNotes: _notes, studentAccessKeyHash: _hash, ...safeApp } = a;
        return safeApp;
      });

    const ownAppIds = new Set(ownApplications.map((a) => a.id));
    const ownOffers = store.internshipDocuments.filter((o) => ownAppIds.has(o.applicationId));
    const ownCertificates = store.certificateRecords.filter(
      (c) =>
        ownAppIds.has(c.applicationId) &&
        ownApplications.some((a) => a.id === c.applicationId && a.completionApproved)
    );

    return res.json({
      email: session.email,
      applications: ownApplications,
      offerLetters: ownOffers,
      certificates: ownCertificates,
    });
  });

  // Student Withdraw Own Application
  app.post('/api/student/applications/:id/withdraw', (req: Request, res: Response) => {
    const authHeader = req.headers.authorization || '';
    const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7).trim() : '';
    const session = token ? verifyStudentSessionToken(token) : null;

    if (!session) {
      return res.status(401).json({ error: 'Unauthorized student session.' });
    }

    const appRecord = store.internshipApplications.find(
      (a) => a.id === req.params.id && a.email.toLowerCase() === session.email
    );
    if (!appRecord) {
      return res.status(404).json({ error: 'Application not found in your student account.' });
    }
    if (appRecord.status === 'Withdrawn') {
      return res.status(400).json({ error: 'This application is already withdrawn.' });
    }

    appRecord.status = 'Withdrawn';
    appRecord.updatedAt = new Date().toISOString();
    saveStore(store);

    return res.json({ status: appRecord.status });
  });

  // Public Certificate Verification Endpoint (Rate-Limited, Non-Sensitive Fields Only)
  app.get('/api/verify-certificate/:certificateId', (req: Request, res: Response) => {
    const clientIp = req.ip || 'unknown-ip';
    if (!checkRateLimit(`verify:${clientIp}`, 30, 5 * 60 * 1000)) {
      return res.status(429).json({
        lookupStatus: 'Not Found',
        certificateId: String(req.params.certificateId || ''),
        message: 'Too many verification requests. Please wait a moment and try again.',
      });
    }

    const rawId = String(req.params.certificateId || '').trim().toUpperCase();
    if (!rawId) {
      return res.status(404).json({
        lookupStatus: 'Not Found',
        certificateId: '',
      });
    }

    const cert = store.certificateRecords.find(
      (c) =>
        c.id.toUpperCase() === rawId || c.certificateNumber.toUpperCase() === rawId
    );

    if (!cert) {
      return res.status(404).json({
        lookupStatus: 'Not Found',
        certificateId: rawId,
      });
    }

    // Return ONLY safe public verification metadata (never email, phone, resume, or internal notes)
    return res.json({
      lookupStatus: cert.status === 'Revoked' ? 'Revoked' : 'Valid',
      certificateId: cert.id,
      certificateNumber: cert.certificateNumber,
      internName: cert.internName,
      roleTitle: cert.roleTitle,
      department: cert.department,
      startDate: cert.startDate,
      endDate: cert.endDate,
      issueDate: cert.issueDate,
      status: cert.status,
      revokedReason: cert.revokedReason,
      revokedAt: cert.revokedAt,
    });
  });

  // ============================================================================
  // INTERNSHIP MANAGEMENT SYSTEM — SECURE ADMIN ENDPOINTS
  // ============================================================================

  // Configure Authorized Signatory & Supervisor Defaults for Official Documents
  app.put('/api/admin/internships/signatory', requireAdminAuth, (req: Request, res: Response) => {
    const {
      authorizedSignatoryName,
      authorizedSignatoryDesignation,
      officialSupervisorDefault,
    } = req.body || {};

    store.company = {
      ...store.company,
      authorizedSignatoryName:
        typeof authorizedSignatoryName === 'string'
          ? authorizedSignatoryName.trim()
          : store.company.authorizedSignatoryName,
      authorizedSignatoryDesignation:
        typeof authorizedSignatoryDesignation === 'string'
          ? authorizedSignatoryDesignation.trim()
          : store.company.authorizedSignatoryDesignation,
      officialSupervisorDefault:
        typeof officialSupervisorDefault === 'string'
          ? officialSupervisorDefault.trim()
          : store.company.officialSupervisorDefault,
    };

    recordAuditLog(
      'SIGNATORY_UPDATED',
      'company-signatory',
      `Updated authorized signatory to "${
        store.company.authorizedSignatoryName || 'Unconfigured'
      }" (${store.company.authorizedSignatoryDesignation || 'No designation'}).`,
      false
    );

    saveStore(store);
    return res.json({
      company: store.company,
      configStatus: getSystemConfigStatus(store),
      auditLogs: store.adminAuditLogs,
    });
  });

  // Create New Internship Listing
  app.post('/api/admin/internships/listings', requireAdminAuth, (req: Request, res: Response) => {
    const {
      title,
      department,
      description,
      techStack,
      workMode,
      compensationType,
      stipendDetails,
      duration,
      weeklyCommitment,
      eligibility,
      requiredSkills,
      responsibilities,
      learningObjectives,
      selectionCriteria,
      positionsCount,
      deadline,
      status,
    } = req.body || {};

    if (!title || !description || !duration) {
      return res.status(400).json({
        error: 'Title, description, and duration are required.',
      });
    }

    const validStatuses: InternshipListingStatus[] = ['Open', 'Closed', 'Upcoming', 'Archived'];
    const resolvedStatus: InternshipListingStatus = validStatuses.includes(status)
      ? status
      : 'Upcoming';

    const nextSeq = String(store.internshipListings.length + 1).padStart(2, '0');
    const newListing: InternshipListing = {
      id: `int-${Date.now()}-${Math.random().toString(36).slice(2, 5)}`,
      code: `LX-TRK-${nextSeq}`,
      title: String(title).trim(),
      department: (department as InternshipDepartment) || 'Full-Stack Development',
      description: String(description).trim(),
      techStack: Array.isArray(techStack)
        ? techStack.map((t: unknown) => String(t).trim()).filter(Boolean)
        : [],
      workMode: (workMode as InternshipWorkMode) || 'Remote',
      compensationType:
        (compensationType as InternshipCompensationType) || 'Unpaid / Academic Learning',
      stipendDetails: stipendDetails
        ? String(stipendDetails).trim()
        : 'Unpaid project-based learning cohort.',
      duration: String(duration).trim(),
      weeklyCommitment: weeklyCommitment ? String(weeklyCommitment).trim() : '12–15 hours / week',
      eligibility: eligibility ? String(eligibility).trim() : 'Students & early-career learners',
      requiredSkills: Array.isArray(requiredSkills)
        ? requiredSkills.map((s: unknown) => String(s).trim()).filter(Boolean)
        : [],
      responsibilities: Array.isArray(responsibilities)
        ? responsibilities.map((r: unknown) => String(r).trim()).filter(Boolean)
        : [],
      learningObjectives: Array.isArray(learningObjectives)
        ? learningObjectives.map((l: unknown) => String(l).trim()).filter(Boolean)
        : [],
      selectionCriteria: selectionCriteria
        ? String(selectionCriteria).trim()
        : 'Evaluated on technical fundamentals, portfolio/GitHub clarity, and learning commitment.',
      positionsCount: Number(positionsCount) > 0 ? Number(positionsCount) : 2,
      deadline: deadline ? String(deadline).trim() : '30 November 2026',
      status: resolvedStatus,
      createdAt: new Date().toISOString(),
    };

    store.internshipListings.unshift(newListing);
    recordAuditLog(
      'LISTING_CREATED',
      newListing.id,
      `Created internship listing "${newListing.title}" (${newListing.department}) with status ${newListing.status}.`,
      false
    );
    saveStore(store);

    return res.status(201).json({
      listings: store.internshipListings,
      auditLogs: store.adminAuditLogs,
    });
  });

  // Update / Publish / Close / Archive Internship Listing
  app.patch(
    '/api/admin/internships/listings/:id',
    requireAdminAuth,
    (req: Request, res: Response) => {
      const listing = store.internshipListings.find((l) => l.id === req.params.id);
      if (!listing) {
        return res.status(404).json({ error: 'Internship listing not found.' });
      }

      const updates = req.body || {};
      const prevStatus = listing.status;

      if (typeof updates.title === 'string' && updates.title.trim()) {
        listing.title = updates.title.trim();
      }
      if (typeof updates.description === 'string' && updates.description.trim()) {
        listing.description = updates.description.trim();
      }
      if (typeof updates.stipendDetails === 'string') {
        listing.stipendDetails = updates.stipendDetails.trim();
      }
      if (typeof updates.duration === 'string' && updates.duration.trim()) {
        listing.duration = updates.duration.trim();
      }
      if (typeof updates.deadline === 'string' && updates.deadline.trim()) {
        listing.deadline = updates.deadline.trim();
      }
      if (
        updates.status &&
        ['Open', 'Closed', 'Upcoming', 'Archived'].includes(updates.status)
      ) {
        listing.status = updates.status;
      }

      recordAuditLog(
        'LISTING_UPDATED',
        listing.id,
        `Updated listing "${listing.title}" (status: ${prevStatus} → ${listing.status}).`,
        false
      );
      saveStore(store);

      return res.json({
        listings: store.internshipListings,
        auditLogs: store.adminAuditLogs,
      });
    }
  );

  // Update Application Status, Terms, Supervisor, and Internal Notes
  app.patch(
    '/api/admin/internships/applications/:id',
    requireAdminAuth,
    async (req: Request, res: Response) => {
      const appRecord = store.internshipApplications.find((a) => a.id === req.params.id);
      if (!appRecord) {
        return res.status(404).json({ error: 'Internship application not found.' });
      }

      const updates = req.body || {};
      const prevStatus = appRecord.status;
      const validStatuses: ApplicationStatus[] = [
        'Submitted',
        'Under Review',
        'Shortlisted',
        'Selected',
        'Rejected',
        'Withdrawn',
      ];

      if (updates.status && validStatuses.includes(updates.status)) {
        appRecord.status = updates.status;
      }
      if (typeof updates.internalNotes === 'string') {
        appRecord.internalNotes = updates.internalNotes;
      }
      if (typeof updates.assignedSupervisor === 'string') {
        appRecord.assignedSupervisor = updates.assignedSupervisor.trim();
      }
      if (typeof updates.officialStartDate === 'string') {
        appRecord.officialStartDate = updates.officialStartDate.trim();
      }
      if (typeof updates.officialEndDate === 'string') {
        appRecord.officialEndDate = updates.officialEndDate.trim();
      }
      if (typeof updates.officialDuration === 'string') {
        appRecord.officialDuration = updates.officialDuration.trim();
      }
      if (typeof updates.stipendTerms === 'string') {
        appRecord.stipendTerms = updates.stipendTerms.trim();
      }
      if (typeof updates.acceptanceDeadline === 'string') {
        appRecord.acceptanceDeadline = updates.acceptanceDeadline.trim();
      }
      if (typeof updates.completedWorkSummary === 'string') {
        appRecord.completedWorkSummary = updates.completedWorkSummary.trim();
      }
      if (
        updates.workMode &&
        ['Remote', 'Hybrid', 'On-Site'].includes(updates.workMode)
      ) {
        appRecord.workMode = updates.workMode as InternshipWorkMode;
      }

      appRecord.updatedAt = new Date().toISOString();

      let emailSent = false;
      if (prevStatus !== appRecord.status) {
        const emailRes = await dispatchServerSideEmailNotification({
          type: 'LOVANSTRIX_INTERNSHIP_STATUS_UPDATE',
          referenceNumber: appRecord.referenceNumber,
          studentName: appRecord.fullName,
          studentEmail: appRecord.email,
          roleTitle: appRecord.roleTitle,
          previousStatus: prevStatus,
          newStatus: appRecord.status,
          updatedAt: appRecord.updatedAt,
        });
        emailSent = emailRes.sent;
      }

      recordAuditLog(
        'APPLICATION_STATUS_CHANGED',
        appRecord.id,
        `Updated application ${appRecord.referenceNumber} (${appRecord.fullName}) — status: ${prevStatus} → ${appRecord.status}.`,
        emailSent
      );
      saveStore(store);

      const notice = emailSent
        ? `Application updated to ${appRecord.status} and notification dispatched via server-side email webhook.`
        : `Application updated to ${appRecord.status} in server database (SMTP_WEBHOOK_URL not configured—no email sent).`;

      return res.json({
        applications: store.internshipApplications,
        auditLogs: store.adminAuditLogs,
        emailSent,
        notice,
      });
    }
  );

  // Add or Toggle Assigned Task for an Application
  app.post(
    '/api/admin/internships/applications/:id/tasks',
    requireAdminAuth,
    (req: Request, res: Response) => {
      const appRecord = store.internshipApplications.find((a) => a.id === req.params.id);
      if (!appRecord) {
        return res.status(404).json({ error: 'Application not found.' });
      }

      const { title, description, dueDate } = req.body || {};
      if (!title || typeof title !== 'string' || !title.trim()) {
        return res.status(400).json({ error: 'Task title is required.' });
      }

      appRecord.assignedTasks.push({
        id: `tsk-${Date.now()}-${Math.random().toString(36).slice(2, 5)}`,
        title: title.trim(),
        description: description ? String(description).trim() : 'Assigned project milestone',
        status: 'Pending',
        dueDate: dueDate ? String(dueDate).trim() : undefined,
      });

      appRecord.updatedAt = new Date().toISOString();
      saveStore(store);
      return res.json({ applications: store.internshipApplications });
    }
  );

  // Download Private Applicant Resume (Admin-Authorized Only)
  app.get(
    '/api/admin/internships/applications/:id/resume',
    requireAdminAuth,
    (req: Request, res: Response) => {
      const appRecord = store.internshipApplications.find((a) => a.id === req.params.id);
      if (!appRecord || !appRecord.hasPrivateResume) {
        return res
          .status(404)
          .json({ error: 'No private resume file is attached to this application.' });
      }

      const resumeData = loadPrivateResume(appRecord.id);
      if (!resumeData) {
        return res.status(404).json({
          error: 'Private resume file payload could not be located on the server.',
        });
      }

      return res.json({
        fileName: resumeData.fileName,
        mimeType: resumeData.mimeType,
        size: resumeData.size,
        base64: resumeData.base64,
      });
    }
  );

  // Issue Official Versioned Offer Letter (Requires Signatory Configured)
  app.post(
    '/api/admin/internships/applications/:id/issue-offer',
    requireAdminAuth,
    async (req: Request, res: Response) => {
      const appRecord = store.internshipApplications.find((a) => a.id === req.params.id);
      if (!appRecord) {
        return res.status(404).json({ error: 'Application not found.' });
      }

      const signatoryName = store.company.authorizedSignatoryName?.trim() || '';
      const signatoryDesignation = store.company.authorizedSignatoryDesignation?.trim() || '';

      if (!signatoryName || !signatoryDesignation) {
        return res.status(400).json({
          error:
            'Official Offer Letter issuance is blocked until Authorized Signatory Name and Designation are configured in Signatory Settings.',
        });
      }

      const listing = store.internshipListings.find((l) => l.id === appRecord.listingId);

      const startDate =
        req.body?.startDate || appRecord.officialStartDate || appRecord.preferredStartDate;
      const endDate = req.body?.endDate || appRecord.officialEndDate || '31 December 2026';
      const duration = req.body?.duration || appRecord.officialDuration || listing?.duration || '8 Weeks';
      const stipendDetails =
        req.body?.stipendDetails ||
        appRecord.stipendTerms ||
        listing?.stipendDetails ||
        'Unpaid / Academic Learning Track';
      const workMode: InternshipWorkMode =
        req.body?.workMode || appRecord.workMode || listing?.workMode || 'Remote';
      const supervisor =
        req.body?.supervisor ||
        appRecord.assignedSupervisor ||
        store.company.officialSupervisorDefault ||
        signatoryName;
      const acceptanceDeadline =
        req.body?.acceptanceDeadline || appRecord.acceptanceDeadline || '28 October 2026';

      // Supersede any existing active offer letters for this application and increment version
      const existingOffers = store.internshipDocuments.filter(
        (o) => o.applicationId === appRecord.id
      );
      const nextVersion = existingOffers.length + 1;
      for (const oldOffer of existingOffers) {
        if (oldOffer.status === 'Issued') {
          oldOffer.status = 'Superseded';
        }
      }

      const offerNumber = `LX-OFFER-2026-${String(101 + store.internshipDocuments.length)}`;
      const docId = `ofr-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;

      const issuedOffer: OfferLetterDocument = {
        id: docId,
        offerNumber,
        version: nextVersion,
        applicationId: appRecord.id,
        referenceNumber: appRecord.referenceNumber,
        candidateName: appRecord.fullName,
        candidateEmail: appRecord.email,
        roleTitle: appRecord.roleTitle,
        department: appRecord.department,
        startDate,
        endDate,
        duration,
        workMode,
        stipendDetails,
        responsibilities: listing?.responsibilities || [
          'Complete assigned engineering/design milestones and code reviews',
          'Collaborate with project supervisor and document deliverables',
        ],
        learningObjectives: listing?.learningObjectives || [
          'Apply modern web/software architectures in structured sprints',
        ],
        supervisor,
        termsAndConditions: [
          'This internship is an educational and project mentorship engagement with Lovanstrix.',
          'Issuance of this offer letter does not constitute a permanent employment contract or automatic certification.',
          'A Certificate of Internship Completion is issued strictly after verified completion of assigned project deliverables.',
          'Confidential company and project source code must not be shared publicly without authorization.',
        ],
        acceptanceDeadline,
        signatoryName,
        signatoryDesignation,
        issueDate: new Date().toLocaleDateString('en-GB', {
          day: '2-digit',
          month: 'long',
          year: 'numeric',
        }),
        verificationCode: `LX-VRF-${appRecord.referenceNumber}-V${nextVersion}`,
        status: 'Issued',
        createdAt: new Date().toISOString(),
      };

      // Update application state to Selected and sync dates
      appRecord.status = 'Selected';
      appRecord.progressStatus = 'Active';
      appRecord.officialStartDate = startDate;
      appRecord.officialEndDate = endDate;
      appRecord.officialDuration = duration;
      appRecord.stipendTerms = stipendDetails;
      appRecord.workMode = workMode;
      appRecord.assignedSupervisor = supervisor;
      appRecord.acceptanceDeadline = acceptanceDeadline;
      appRecord.latestOfferLetterId = issuedOffer.id;
      appRecord.updatedAt = new Date().toISOString();

      store.internshipDocuments.unshift(issuedOffer);

      const emailRes = await dispatchServerSideEmailNotification({
        type: 'LOVANSTRIX_OFFER_LETTER_ISSUED',
        offerNumber: issuedOffer.offerNumber,
        version: issuedOffer.version,
        candidateName: issuedOffer.candidateName,
        candidateEmail: issuedOffer.candidateEmail,
        roleTitle: issuedOffer.roleTitle,
        startDate: issuedOffer.startDate,
        endDate: issuedOffer.endDate,
        issuedAt: issuedOffer.createdAt,
      });

      recordAuditLog(
        'OFFER_LETTER_ISSUED',
        issuedOffer.offerNumber,
        `Issued Offer Letter ${issuedOffer.offerNumber} (v${issuedOffer.version}) to ${issuedOffer.candidateName} for "${issuedOffer.roleTitle}".`,
        emailRes.sent
      );
      saveStore(store);

      const notice = emailRes.sent
        ? `Offer Letter ${issuedOffer.offerNumber} (v${issuedOffer.version}) issued and notification dispatched via server-side webhook.`
        : `Offer Letter ${issuedOffer.offerNumber} (v${issuedOffer.version}) issued and available in the Student Dashboard (SMTP_WEBHOOK_URL not configured—no email sent).`;

      return res.status(201).json({
        issuedOffer,
        offerLetters: store.internshipDocuments,
        applications: store.internshipApplications,
        auditLogs: store.adminAuditLogs,
        emailSent: emailRes.sent,
        notice,
      });
    }
  );

  // Approve Internship Completion Eligibility
  app.post(
    '/api/admin/internships/applications/:id/approve-completion',
    requireAdminAuth,
    (req: Request, res: Response) => {
      const appRecord = store.internshipApplications.find((a) => a.id === req.params.id);
      if (!appRecord) {
        return res.status(404).json({ error: 'Application not found.' });
      }

      const { completedWorkSummary, officialStartDate, officialEndDate } = req.body || {};
      if (!completedWorkSummary || typeof completedWorkSummary !== 'string' || completedWorkSummary.trim().length < 15) {
        return res.status(400).json({
          error:
            'Please provide a verified Work Completed Summary (at least 15 characters) before approving internship completion.',
        });
      }

      appRecord.completionApproved = true;
      appRecord.progressStatus = 'Completed';
      appRecord.completionApprovedAt = new Date().toISOString();
      appRecord.completedWorkSummary = completedWorkSummary.trim();
      if (typeof officialStartDate === 'string' && officialStartDate.trim()) {
        appRecord.officialStartDate = officialStartDate.trim();
      }
      if (typeof officialEndDate === 'string' && officialEndDate.trim()) {
        appRecord.officialEndDate = officialEndDate.trim();
      }
      appRecord.updatedAt = new Date().toISOString();

      recordAuditLog(
        'COMPLETION_APPROVED',
        appRecord.referenceNumber,
        `Verified and approved internship completion for ${appRecord.fullName} (${appRecord.referenceNumber}).`,
        false
      );
      saveStore(store);

      return res.json({
        applications: store.internshipApplications,
        auditLogs: store.adminAuditLogs,
        notice: `Internship completion verified and approved for ${appRecord.fullName}. Certificate generation is now unlocked.`,
      });
    }
  );

  // Issue Official Versioned Completion Certificate (Strictly Requires completionApproved === true & Signatory)
  app.post(
    '/api/admin/internships/applications/:id/issue-certificate',
    requireAdminAuth,
    async (req: Request, res: Response) => {
      const appRecord = store.internshipApplications.find((a) => a.id === req.params.id);
      if (!appRecord) {
        return res.status(404).json({ error: 'Application not found.' });
      }

      if (!appRecord.completionApproved) {
        return res.status(400).json({
          error:
            'Completion Certificate generation is strictly blocked until the intern’s completion is verified and approved by an administrator.',
        });
      }

      const signatoryName = store.company.authorizedSignatoryName?.trim() || '';
      const signatoryDesignation = store.company.authorizedSignatoryDesignation?.trim() || '';
      if (!signatoryName || !signatoryDesignation) {
        return res.status(400).json({
          error:
            'Completion Certificate issuance is blocked until Authorized Signatory Name and Designation are configured in Signatory Settings.',
        });
      }

      const startDate =
        req.body?.startDate || appRecord.officialStartDate || appRecord.preferredStartDate;
      const endDate =
        req.body?.endDate || appRecord.officialEndDate || '31 December 2026';
      const workCompletedSummary =
        req.body?.workCompletedSummary ||
        appRecord.completedWorkSummary ||
        `Successfully completed assigned ${appRecord.department} tasks, engineering milestones, and technical reviews during the internship period.`;

      const existingCerts = store.certificateRecords.filter(
        (c) => c.applicationId === appRecord.id
      );
      const nextVersion = existingCerts.length + 1;
      for (const oldCert of existingCerts) {
        if (oldCert.status === 'Valid') {
          oldCert.status = 'Revoked';
          oldCert.revokedAt = new Date().toISOString();
          oldCert.revokedReason = `Superseded by Version ${nextVersion}`;
        }
      }

      const yearStr = new Date().getFullYear().toString();
      const randHex = crypto.randomBytes(4).toString('hex').toUpperCase();
      const certId = `LX-CERT-${yearStr}-${randHex}`;
      const certificateNumber = `LX-CERT-${yearStr}-${String(
        201 + store.certificateRecords.length
      )}`;

      const appBaseUrl = (
        process.env.APP_URL && process.env.APP_URL !== 'MY_APP_URL'
          ? process.env.APP_URL
          : 'http://localhost:3000'
      ).replace(/\/$/, '');

      const issuedCertificate: CertificateRecord = {
        id: certId,
        certificateNumber,
        version: nextVersion,
        applicationId: appRecord.id,
        referenceNumber: appRecord.referenceNumber,
        internName: appRecord.fullName,
        roleTitle: appRecord.roleTitle,
        department: appRecord.department,
        startDate,
        endDate,
        issueDate: new Date().toLocaleDateString('en-GB', {
          day: '2-digit',
          month: 'long',
          year: 'numeric',
        }),
        workCompletedSummary,
        signatoryName,
        signatoryDesignation,
        verificationUrl: `${appBaseUrl}/verify-certificate/${certId}`,
        status: 'Valid',
        createdAt: new Date().toISOString(),
      };

      appRecord.latestCertificateId = issuedCertificate.id;
      appRecord.completedWorkSummary = workCompletedSummary;
      appRecord.updatedAt = new Date().toISOString();

      store.certificateRecords.unshift(issuedCertificate);

      const emailRes = await dispatchServerSideEmailNotification({
        type: 'LOVANSTRIX_COMPLETION_CERTIFICATE_ISSUED',
        certificateId: issuedCertificate.id,
        certificateNumber: issuedCertificate.certificateNumber,
        version: issuedCertificate.version,
        internName: issuedCertificate.internName,
        studentEmail: appRecord.email,
        roleTitle: issuedCertificate.roleTitle,
        verificationUrl: issuedCertificate.verificationUrl,
        issuedAt: issuedCertificate.createdAt,
      });

      recordAuditLog(
        'CERTIFICATE_ISSUED',
        issuedCertificate.id,
        `Issued Completion Certificate ${issuedCertificate.id} (v${issuedCertificate.version}) to ${issuedCertificate.internName} for "${issuedCertificate.roleTitle}".`,
        emailRes.sent
      );
      saveStore(store);

      const notice = emailRes.sent
        ? `Certificate ${issuedCertificate.id} issued and notification dispatched via server-side webhook.`
        : `Certificate ${issuedCertificate.id} officially issued and publicly verifiable at /verify-certificate/${issuedCertificate.id}.`;

      return res.status(201).json({
        issuedCertificate,
        certificates: store.certificateRecords,
        applications: store.internshipApplications,
        auditLogs: store.adminAuditLogs,
        emailSent: emailRes.sent,
        notice,
      });
    }
  );

  // Revoke Offer Letter (Retains Immutable Audit Trail)
  app.post(
    '/api/admin/internships/offers/:offerId/revoke',
    requireAdminAuth,
    (req: Request, res: Response) => {
      const offer = store.internshipDocuments.find(
        (o) => o.id === req.params.offerId || o.offerNumber === req.params.offerId
      );
      if (!offer) {
        return res.status(404).json({ error: 'Offer letter not found.' });
      }
      const { reason } = req.body || {};
      if (!reason || typeof reason !== 'string' || reason.trim().length < 3) {
        return res
          .status(400)
          .json({ error: 'Please provide a reason for revoking this offer letter.' });
      }

      offer.status = 'Revoked';
      offer.revokedAt = new Date().toISOString();
      offer.revokedReason = reason.trim();

      recordAuditLog(
        'OFFER_LETTER_REVOKED',
        offer.offerNumber,
        `Revoked Offer Letter ${offer.offerNumber} (${offer.candidateName}). Reason: ${offer.revokedReason}`,
        false
      );
      saveStore(store);

      return res.json({
        offerLetters: store.internshipDocuments,
        auditLogs: store.adminAuditLogs,
      });
    }
  );

  // Revoke Completion Certificate (Retains Immutable Audit Trail)
  app.post(
    '/api/admin/internships/certificates/:certificateId/revoke',
    requireAdminAuth,
    (req: Request, res: Response) => {
      const cert = store.certificateRecords.find(
        (c) =>
          c.id === req.params.certificateId ||
          c.certificateNumber === req.params.certificateId
      );
      if (!cert) {
        return res.status(404).json({ error: 'Certificate record not found.' });
      }
      const { reason } = req.body || {};
      if (!reason || typeof reason !== 'string' || reason.trim().length < 3) {
        return res
          .status(400)
          .json({ error: 'Please provide a reason for revoking this certificate.' });
      }

      cert.status = 'Revoked';
      cert.revokedAt = new Date().toISOString();
      cert.revokedReason = reason.trim();

      recordAuditLog(
        'CERTIFICATE_REVOKED',
        cert.id,
        `Revoked Completion Certificate ${cert.id} (${cert.internName}). Reason: ${cert.revokedReason}`,
        false
      );
      saveStore(store);

      return res.json({
        certificates: store.certificateRecords,
        auditLogs: store.adminAuditLogs,
      });
    }
  );

  // Submit a Project Quote Enquiry via secure server-side endpoint
  app.post('/api/enquiries', async (req: Request, res: Response) => {
    const {
      name,
      email,
      organization,
      serviceRequired,
      projectDescription,
      estimatedBudget,
      expectedTimeline,
      referenceUrl,
    } = req.body || {};

    if (!name || typeof name !== 'string' || name.trim().length < 2) {
      return res
        .status(400)
        .json({ error: 'Please provide your full name (at least 2 characters).' });
    }
    if (!email || typeof email !== 'string' || !isValidEmail(email.trim())) {
      return res.status(400).json({ error: 'Please provide a valid email address.' });
    }
    if (!serviceRequired || typeof serviceRequired !== 'string') {
      return res.status(400).json({ error: 'Please select a required service category.' });
    }
    if (
      !projectDescription ||
      typeof projectDescription !== 'string' ||
      projectDescription.trim().length < 15
    ) {
      return res.status(400).json({
        error: 'Please provide a brief project description (at least 15 characters).',
      });
    }
    if (!estimatedBudget || typeof estimatedBudget !== 'string') {
      return res.status(400).json({ error: 'Please select an estimated budget range.' });
    }
    if (!expectedTimeline || typeof expectedTimeline !== 'string') {
      return res.status(400).json({ error: 'Please select an expected project timeline.' });
    }

    const cleanRefUrl = referenceUrl ? String(referenceUrl).trim() : '';
    if (cleanRefUrl) {
      try {
        const parsedRef = new URL(cleanRefUrl);
        if (parsedRef.protocol !== 'http:' && parsedRef.protocol !== 'https:') {
          return res.status(400).json({
            error: 'Reference or portfolio URL must start with http:// or https://.',
          });
        }
      } catch {
        return res.status(400).json({
          error: 'Please enter a valid URL for the reference or portfolio link.',
        });
      }
    }

    // Attempt optional server-side email dispatch
    const emailResult = await dispatchServerSideEmailNotification({
      type: 'LOVANSTRIX_PROJECT_ENQUIRY',
      name: name.trim(),
      email: email.trim(),
      organization: organization ? String(organization).trim() : '',
      serviceRequired: serviceRequired.trim(),
      projectDescription: projectDescription.trim(),
      estimatedBudget: estimatedBudget.trim(),
      expectedTimeline: expectedTimeline.trim(),
      referenceUrl: cleanRefUrl,
      submittedAt: new Date().toISOString(),
    });

    // Save to configured server database / store
    const enquiry: ProjectEnquiry = {
      id: `enq-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      name: name.trim(),
      email: email.trim(),
      organization: organization ? String(organization).trim() : '',
      serviceRequired: serviceRequired.trim(),
      projectDescription: projectDescription.trim(),
      estimatedBudget: estimatedBudget.trim(),
      expectedTimeline: expectedTimeline.trim(),
      referenceUrl: cleanRefUrl,
      status: 'New',
      savedToDatabase: true,
      emailDelivered: emailResult.sent,
      deliveryMode: emailResult.sent ? 'database_and_email' : 'database_only_no_email',
      createdAt: new Date().toISOString(),
    };

    store.enquiries.unshift(enquiry);
    const persistedToDisk = saveStore(store);
    enquiry.savedToDatabase = persistedToDisk;
    if (!persistedToDisk && !emailResult.sent) {
      enquiry.deliveryMode = 'demo_only_no_email';
    }

    let notice = '';
    if (emailResult.sent && persistedToDisk) {
      notice =
        'Your enquiry has been saved to the server database and forwarded via our server-side email integration.';
    } else if (persistedToDisk && !emailResult.sent) {
      notice =
        'Saved to the configured server database (inspectable in Admin Console → Enquiries). Because SMTP_WEBHOOK_URL is optional and not currently configured, no email was sent.';
    } else {
      notice =
        'Demo Mode Notice: Neither a writable database nor SMTP_WEBHOOK_URL is currently active. Your submission was validated in demo mode—no email was sent.';
    }

    return res.status(201).json({
      enquiry,
      savedToDatabase: persistedToDisk,
      emailConfigured: emailResult.configured,
      emailDelivered: emailResult.sent,
      demoMode: !emailResult.sent,
      notice,
    });
  });

  // Submit Career / Future Internship Interest
  app.post('/api/career-interest', async (req: Request, res: Response) => {
    const { name, email, areaOfInterest, skills, portfolioUrl, introduction } = req.body || {};

    if (!name || typeof name !== 'string' || name.trim().length < 2) {
      return res.status(400).json({ error: 'Please enter your full name.' });
    }
    if (!email || typeof email !== 'string' || !isValidEmail(email.trim())) {
      return res.status(400).json({ error: 'Please enter a valid email address.' });
    }
    if (!areaOfInterest || typeof areaOfInterest !== 'string') {
      return res.status(400).json({ error: 'Please select an area of interest.' });
    }
    if (!skills || typeof skills !== 'string' || skills.trim().length < 2) {
      return res.status(400).json({ error: 'Please list your core technical or design skills.' });
    }
    if (portfolioUrl && typeof portfolioUrl === 'string' && portfolioUrl.trim().length > 0) {
      try {
        const parsedUrl = new URL(portfolioUrl.trim());
        if (parsedUrl.protocol !== 'http:' && parsedUrl.protocol !== 'https:') {
          return res
            .status(400)
            .json({ error: 'Portfolio or GitHub URL must start with http:// or https://.' });
        }
      } catch {
        return res
          .status(400)
          .json({ error: 'Please provide a valid URL for your Portfolio or GitHub profile.' });
      }
    }
    if (!introduction || typeof introduction !== 'string' || introduction.trim().length < 10) {
      return res.status(400).json({
        error: 'Please write a short introduction (at least 10 characters).',
      });
    }

    const emailResult = await dispatchServerSideEmailNotification({
      type: 'LOVANSTRIX_CAREER_INTEREST',
      name: name.trim(),
      email: email.trim(),
      areaOfInterest: areaOfInterest.trim(),
      skills: skills.trim(),
      portfolioUrl: portfolioUrl ? String(portfolioUrl).trim() : '',
      introduction: introduction.trim(),
      submittedAt: new Date().toISOString(),
    });

    const submission: CareerInterestSubmission = {
      id: `car-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      name: name.trim(),
      email: email.trim(),
      areaOfInterest: areaOfInterest.trim(),
      skills: skills.trim(),
      portfolioUrl: portfolioUrl ? String(portfolioUrl).trim() : '',
      introduction: introduction.trim(),
      status: 'Registered',
      savedToDatabase: true,
      emailDelivered: emailResult.sent,
      createdAt: new Date().toISOString(),
    };

    store.careerSubmissions.unshift(submission);
    const persistedToDisk = saveStore(store);
    submission.savedToDatabase = persistedToDisk;

    const notice = emailResult.sent
      ? 'Your interest has been saved to the server database and forwarded via our server-side email integration. Please note this registration is for future updates only and does not guarantee a job or internship offer.'
      : 'Your interest has been saved to the server database (Admin Console → Careers). SMTP_WEBHOOK_URL is optional and not configured—no email was sent. Please note this registration is for future updates only and does not guarantee a job or internship offer.';

    return res.status(201).json({
      submission,
      savedToDatabase: persistedToDisk,
      emailDelivered: emailResult.sent,
      notice,
    });
  });

  // Server-side Technical Architecture & Project Scope Planner
  app.post('/api/scope-estimator', async (req: Request, res: Response) => {
    const { projectGoal, category, timeline } = req.body || {};
    if (!projectGoal || typeof projectGoal !== 'string' || projectGoal.trim().length < 10) {
      return res.status(400).json({
        error: 'Please describe your project idea in at least 10 characters.',
      });
    }

    const configStatus = getSystemConfigStatus(store);
    if (configStatus.geminiConfigured && process.env.GEMINI_API_KEY) {
      try {
        const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
        const response = await ai.models.generateContent({
          model: 'gemini-3-flash-preview',
          contents: `You are a technical solutions architect at LOVANSTRIX, an honest early-stage web and AI technology startup.
A prospective client described this project idea:
Category: ${category || 'Web Application'}
Target Timeline: ${timeline || 'Flexible'}
Project Goal: ${projectGoal.trim()}

Provide a realistic, grounded early-stage engineering scope breakdown in JSON with:
- summary: 1-2 sentences describing a practical MVP approach
- recommendedStack: array of 4-5 practical technologies
- milestones: array of 4 sequential steps (Discover/Design, Core Build, Testing, Launch)
- honestConsiderations: 1 sentence noting practical scope limits or operational requirements.`,
          config: {
            responseMimeType: 'application/json',
            responseSchema: {
              type: Type.OBJECT,
              properties: {
                summary: { type: Type.STRING },
                recommendedStack: {
                  type: Type.ARRAY,
                  items: { type: Type.STRING },
                },
                milestones: {
                  type: Type.ARRAY,
                  items: { type: Type.STRING },
                },
                honestConsiderations: { type: Type.STRING },
              },
              required: ['summary', 'recommendedStack', 'milestones', 'honestConsiderations'],
            },
          },
        });

        const parsed = JSON.parse(response.text || '{}');
        return res.json({
          mode: 'gemini-server-side',
          ...parsed,
        });
      } catch (err) {
        console.error('Gemini API error, falling back to deterministic estimator:', err);
      }
    }

    const selectedCategory = String(category || 'Web Application');
    const stackMap: Record<string, string[]> = {
      'Website Development': [
        'React 19',
        'TypeScript',
        'Tailwind CSS',
        'Schema.org SEO',
        'Cloud Hosting',
      ],
      'Web Application Development': [
        'React 19',
        'TypeScript',
        'Node.js & Express',
        'PostgreSQL / Firestore',
        'REST API',
      ],
      'AI Integration': [
        'Node.js API Proxy',
        'Gemini API (Server-Side)',
        'Structured JSON Validation',
        'React UI',
      ],
      'UI/UX Design': [
        'Component Architecture',
        'Responsive Grid System',
        'WCAG AA Contrast System',
        'Interactive Prototype',
      ],
    };

    return res.json({
      mode: 'deterministic-template',
      summary: `Grounded MVP architecture for your ${selectedCategory.toLowerCase()} initiative, structured around clean modular delivery and maintainable code.`,
      recommendedStack:
        stackMap[selectedCategory] || stackMap['Web Application Development'],
      milestones: [
        'Phase 1 (Discover & Plan): Define core user flows, data models, and exact MVP boundaries.',
        'Phase 2 (Design & Prototype): Build responsive layout templates and validate interactive states.',
        'Phase 3 (Develop & Integrate): Implement frontend views, backend API validation, and database storage.',
        'Phase 4 (Test & Launch): Accessibility audit, mobile verification, and production deployment.',
      ],
      honestConsiderations:
        'Generated via Lovanstrix deterministic scope templates (GEMINI_API_KEY is not currently active on the server). Use "Request a Quote" to discuss your exact requirements.',
    });
  });

  // Admin Authentication
  app.post('/api/admin/login', (req: Request, res: Response) => {
    const configuredPasscode = process.env.ADMIN_PASSCODE?.trim() || '';
    if (configuredPasscode.length < 12) {
      return res.status(503).json({
        error: 'Admin sign-in is disabled. The site owner must configure a unique ADMIN_PASSCODE of at least 12 characters in the server environment and restart the backend.',
      });
    }

    if (!checkRateLimit(`admin-login:${req.ip}`, 8, 15 * 60 * 1000)) {
      return res.status(429).json({
        error: 'Too many admin sign-in attempts. Please wait 15 minutes before trying again.',
      });
    }

    const provided = Buffer.from(
      typeof req.body?.passcode === 'string' ? req.body.passcode : ''
    );
    const expected = Buffer.from(configuredPasscode);
    if (provided.length !== expected.length || !crypto.timingSafeEqual(provided, expected)) {
      return res.status(401).json({ error: 'Invalid administrator passcode.' });
    }

    return res.json({
      authenticated: true,
      previewMode: false,
      token: createAdminToken(configuredPasscode),
    });
  });

  // Admin Full Store Retrieval
  app.get('/api/admin/store', requireAdminAuth, (_req: Request, res: Response) => {
    res.json({
      store,
      configStatus: getSystemConfigStatus(store),
    });
  });

  // Admin Update Company Details & Website Copy
  app.put('/api/admin/company', requireAdminAuth, (req: Request, res: Response) => {
    const updates = req.body || {};
    store.company = {
      ...store.company,
      name:
        typeof updates.name === 'string' && updates.name.trim()
          ? updates.name.trim()
          : store.company.name,
      tagline:
        typeof updates.tagline === 'string' ? updates.tagline.trim() : store.company.tagline,
      heroHeading:
        typeof updates.heroHeading === 'string'
          ? updates.heroHeading.trim()
          : store.company.heroHeading,
      heroSubtitle:
        typeof updates.heroSubtitle === 'string'
          ? updates.heroSubtitle.trim()
          : store.company.heroSubtitle,
      shortIntroduction:
        typeof updates.shortIntroduction === 'string'
          ? updates.shortIntroduction.trim()
          : store.company.shortIntroduction,
      mission:
        typeof updates.mission === 'string' ? updates.mission.trim() : store.company.mission,
      vision: typeof updates.vision === 'string' ? updates.vision.trim() : store.company.vision,
      stageDisclosure:
        typeof updates.stageDisclosure === 'string'
          ? updates.stageDisclosure.trim()
          : store.company.stageDisclosure,
      email:
        typeof updates.email === 'string' && updates.email.trim()
          ? updates.email.trim()
          : store.company.email,
      whatsappNumber:
        typeof updates.whatsappNumber === 'string'
          ? updates.whatsappNumber.replace(/[^\d+]/g, '')
          : store.company.whatsappNumber,
      githubUrl:
        typeof updates.githubUrl === 'string'
          ? updates.githubUrl.trim()
          : store.company.githubUrl,
      linkedinUrl:
        typeof updates.linkedinUrl === 'string'
          ? updates.linkedinUrl.trim()
          : store.company.linkedinUrl,
      portfolioComingSoonMode:
        typeof updates.portfolioComingSoonMode === 'boolean'
          ? updates.portfolioComingSoonMode
          : store.company.portfolioComingSoonMode,
      careerStatusBanner:
        typeof updates.careerStatusBanner === 'string'
          ? updates.careerStatusBanner.trim()
          : store.company.careerStatusBanner,
      authorizedSignatoryName:
        typeof updates.authorizedSignatoryName === 'string'
          ? updates.authorizedSignatoryName.trim()
          : store.company.authorizedSignatoryName,
      authorizedSignatoryDesignation:
        typeof updates.authorizedSignatoryDesignation === 'string'
          ? updates.authorizedSignatoryDesignation.trim()
          : store.company.authorizedSignatoryDesignation,
      officialSupervisorDefault:
        typeof updates.officialSupervisorDefault === 'string'
          ? updates.officialSupervisorDefault.trim()
          : store.company.officialSupervisorDefault,
      founderName:
        typeof updates.founderName === 'string' && updates.founderName.trim()
          ? updates.founderName.trim()
          : store.company.founderName,
      founderRole:
        typeof updates.founderRole === 'string' && updates.founderRole.trim()
          ? updates.founderRole.trim()
          : store.company.founderRole,
      founderBio:
        typeof updates.founderBio === 'string' && updates.founderBio.trim()
          ? updates.founderBio.trim()
          : store.company.founderBio,
    };
    saveStore(store);
    res.json({ company: store.company, configStatus: getSystemConfigStatus(store) });
  });

  // Admin Add or Update Service
  app.post('/api/admin/services', requireAdminAuth, (req: Request, res: Response) => {
    const {
      title,
      category,
      summary,
      overview,
      problemsAddressed,
      deliverables,
      technologies,
      processSteps,
      faqs,
      availability,
      featured,
    } = req.body || {};
    if (!title || !summary) {
      return res.status(400).json({ error: 'Service title and summary are required.' });
    }
    const nextIndex = String(store.services.length + 1).padStart(2, '0');
    const cleanTitle = String(title).trim();
    const generatedSlug = cleanTitle
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '');

    const newService: ServiceItem = {
      id: `srv-${Date.now()}`,
      slug: generatedSlug || `service-${Date.now()}`,
      index: nextIndex,
      title: cleanTitle,
      category: String(category || 'Digital Engineering').trim(),
      summary: String(summary).trim(),
      overview: overview ? String(overview).trim() : String(summary).trim(),
      problemsAddressed: Array.isArray(problemsAddressed)
        ? problemsAddressed.map((p: string) => String(p).trim()).filter(Boolean)
        : [
            'Outdated or fragmented digital workflows slowing down operations.',
            'Lack of mobile responsiveness and clear conversion pathways.',
          ],
      deliverables: Array.isArray(deliverables)
        ? deliverables.map((d: string) => String(d).trim()).filter(Boolean)
        : [],
      technologies: Array.isArray(technologies)
        ? technologies.map((t: string) => String(t).trim()).filter(Boolean)
        : [],
      processSteps: Array.isArray(processSteps)
        ? processSteps.map((p: string) => String(p).trim()).filter(Boolean)
        : [
            'Discover & Scope Alignment',
            'Architecture & UI/UX Blueprinting',
            'Iterative Engineering & QA',
            'Deployment & Handover',
          ],
      faqs: Array.isArray(faqs)
        ? faqs
        : [
            {
              question: `How do we start a ${cleanTitle} engagement?`,
              answer:
                'Submit your project requirements via our Request a Quote form and we will prepare a milestone-based technical proposal.',
            },
          ],
      availability: availability || 'Available for New Projects',
      featured: Boolean(featured),
    };
    store.services.push(newService);
    saveStore(store);
    res.status(201).json({ services: store.services });
  });

  app.put('/api/admin/services/:id', requireAdminAuth, (req: Request, res: Response) => {
    const { id } = req.params;
    const idx = store.services.findIndex((s) => s.id === id);
    if (idx === -1) return res.status(404).json({ error: 'Service not found.' });

    const updates = req.body || {};
    store.services[idx] = {
      ...store.services[idx],
      title: typeof updates.title === 'string' ? updates.title.trim() : store.services[idx].title,
      category:
        typeof updates.category === 'string'
          ? updates.category.trim()
          : store.services[idx].category,
      summary:
        typeof updates.summary === 'string' ? updates.summary.trim() : store.services[idx].summary,
      overview:
        typeof updates.overview === 'string'
          ? updates.overview.trim()
          : store.services[idx].overview,
      problemsAddressed: Array.isArray(updates.problemsAddressed)
        ? updates.problemsAddressed.map((p: string) => String(p).trim()).filter(Boolean)
        : store.services[idx].problemsAddressed,
      deliverables: Array.isArray(updates.deliverables)
        ? updates.deliverables.map((d: string) => String(d).trim()).filter(Boolean)
        : store.services[idx].deliverables,
      technologies: Array.isArray(updates.technologies)
        ? updates.technologies.map((t: string) => String(t).trim()).filter(Boolean)
        : store.services[idx].technologies,
      availability: updates.availability || store.services[idx].availability,
      featured:
        typeof updates.featured === 'boolean' ? updates.featured : store.services[idx].featured,
    };
    saveStore(store);
    res.json({ services: store.services });
  });

  app.delete('/api/admin/services/:id', requireAdminAuth, (req: Request, res: Response) => {
    const { id } = req.params;
    store.services = store.services
      .filter((s) => s.id !== id)
      .map((s, i) => ({ ...s, index: String(i + 1).padStart(2, '0') }));
    saveStore(store);
    res.json({ services: store.services });
  });

  // Admin Manage Projects / Portfolio
  app.post('/api/admin/projects', requireAdminAuth, (req: Request, res: Response) => {
    const {
      title,
      category,
      classification,
      objective,
      problemStatement,
      proposedSolution,
      technologies,
      features,
      liveDemoUrl,
      githubUrl,
      visualType,
      published,
    } = req.body || {};

    if (!title || !objective) {
      return res.status(400).json({ error: 'Project title and objective are required.' });
    }

    const newProject: ProjectItem = {
      id: `proj-${Date.now()}`,
      title: String(title).trim(),
      category: category || 'Web Applications',
      classification: classification || 'Published Project',
      objective: String(objective).trim(),
      problemStatement: problemStatement
        ? String(problemStatement).trim()
        : String(objective).trim(),
      proposedSolution: proposedSolution
        ? String(proposedSolution).trim()
        : 'Engineered with modular React, TypeScript, and validated Node.js APIs.',
      technologies: Array.isArray(technologies)
        ? technologies.map((t: string) => String(t).trim()).filter(Boolean)
        : [],
      features: Array.isArray(features)
        ? features.map((f: string) => String(f).trim()).filter(Boolean)
        : [],
      liveDemoUrl: liveDemoUrl ? String(liveDemoUrl).trim() : '',
      githubUrl: githubUrl ? String(githubUrl).trim() : '',
      visualType: visualType || 'webapp',
      publishedAt: new Date().getFullYear().toString(),
      published: typeof published === 'boolean' ? published : true,
    };

    store.projects.unshift(newProject);
    saveStore(store);
    res.status(201).json({ projects: store.projects });
  });

  app.patch('/api/admin/projects/:id', requireAdminAuth, (req: Request, res: Response) => {
    const { id } = req.params;
    const idx = store.projects.findIndex((p) => p.id === id);
    if (idx === -1) return res.status(404).json({ error: 'Project not found.' });

    const updates = req.body || {};
    store.projects[idx] = {
      ...store.projects[idx],
      title: typeof updates.title === 'string' ? updates.title.trim() : store.projects[idx].title,
      category: updates.category || store.projects[idx].category,
      classification: updates.classification || store.projects[idx].classification,
      objective:
        typeof updates.objective === 'string'
          ? updates.objective.trim()
          : store.projects[idx].objective,
      problemStatement:
        typeof updates.problemStatement === 'string'
          ? updates.problemStatement.trim()
          : store.projects[idx].problemStatement,
      proposedSolution:
        typeof updates.proposedSolution === 'string'
          ? updates.proposedSolution.trim()
          : store.projects[idx].proposedSolution,
      technologies: Array.isArray(updates.technologies)
        ? updates.technologies.map((t: string) => String(t).trim()).filter(Boolean)
        : store.projects[idx].technologies,
      features: Array.isArray(updates.features)
        ? updates.features.map((f: string) => String(f).trim()).filter(Boolean)
        : store.projects[idx].features,
      liveDemoUrl:
        typeof updates.liveDemoUrl === 'string'
          ? updates.liveDemoUrl.trim()
          : store.projects[idx].liveDemoUrl,
      githubUrl:
        typeof updates.githubUrl === 'string'
          ? updates.githubUrl.trim()
          : store.projects[idx].githubUrl,
      visualType: updates.visualType || store.projects[idx].visualType,
      published:
        typeof updates.published === 'boolean' ? updates.published : store.projects[idx].published,
    };
    saveStore(store);
    res.json({ projects: store.projects });
  });

  app.delete('/api/admin/projects/:id', requireAdminAuth, (req: Request, res: Response) => {
    const { id } = req.params;
    store.projects = store.projects.filter((p) => p.id !== id);
    saveStore(store);
    res.json({ projects: store.projects });
  });

  // Admin Manage Career / Internship Openings
  app.post('/api/admin/openings', requireAdminAuth, (req: Request, res: Response) => {
    const {
      title,
      track,
      type,
      status,
      eligibility,
      duration,
      responsibilities,
      deadline,
      applicationLink,
    } = req.body || {};

    if (!title || !eligibility || !duration || !deadline) {
      return res.status(400).json({
        error: 'Role title, eligibility, duration, and application deadline are required.',
      });
    }

    const opening: CareerOpening = {
      id: `open-${Date.now()}`,
      title: String(title).trim(),
      track: track || 'Full-Stack Development',
      type: type || 'Internship',
      status: status === 'Closed' ? 'Closed' : 'Open',
      eligibility: String(eligibility).trim(),
      duration: String(duration).trim(),
      responsibilities: Array.isArray(responsibilities)
        ? responsibilities.map((r: string) => String(r).trim()).filter(Boolean)
        : [],
      deadline: String(deadline).trim(),
      applicationLink: applicationLink ? String(applicationLink).trim() : '',
      createdAt: new Date().toISOString(),
    };

    store.openings.unshift(opening);
    saveStore(store);
    res.status(201).json({ openings: store.openings });
  });

  app.patch('/api/admin/openings/:id', requireAdminAuth, (req: Request, res: Response) => {
    const { id } = req.params;
    const opening = store.openings.find((o) => o.id === id);
    if (!opening) return res.status(404).json({ error: 'Opening not found.' });

    if (req.body.status === 'Open' || req.body.status === 'Closed') {
      opening.status = req.body.status;
    }
    saveStore(store);
    res.json({ openings: store.openings });
  });

  app.delete('/api/admin/openings/:id', requireAdminAuth, (req: Request, res: Response) => {
    const { id } = req.params;
    store.openings = store.openings.filter((o) => o.id !== id);
    saveStore(store);
    res.json({ openings: store.openings });
  });

  // Admin Manage Enquiries
  app.patch('/api/admin/enquiries/:id', requireAdminAuth, (req: Request, res: Response) => {
    const { id } = req.params;
    const enquiry = store.enquiries.find((e) => e.id === id);
    if (!enquiry) return res.status(404).json({ error: 'Enquiry not found.' });

    if (req.body.status && ['New', 'Reviewed', 'Archived'].includes(req.body.status)) {
      enquiry.status = req.body.status;
    }
    saveStore(store);
    res.json({ enquiries: store.enquiries });
  });

  app.delete('/api/admin/enquiries/:id', requireAdminAuth, (req: Request, res: Response) => {
    const { id } = req.params;
    store.enquiries = store.enquiries.filter((e) => e.id !== id);
    saveStore(store);
    res.json({ enquiries: store.enquiries });
  });

  // Admin Manage Career Submissions
  app.patch(
    '/api/admin/career-submissions/:id',
    requireAdminAuth,
    (req: Request, res: Response) => {
      const { id } = req.params;
      const sub = store.careerSubmissions.find((c) => c.id === id);
      if (!sub) return res.status(404).json({ error: 'Submission not found.' });

      if (req.body.status && ['Registered', 'Reviewed'].includes(req.body.status)) {
        sub.status = req.body.status;
      }
      saveStore(store);
      res.json({ careerSubmissions: store.careerSubmissions });
    }
  );

  app.delete(
    '/api/admin/career-submissions/:id',
    requireAdminAuth,
    (req: Request, res: Response) => {
      const { id } = req.params;
      store.careerSubmissions = store.careerSubmissions.filter((c) => c.id !== id);
      saveStore(store);
      res.json({ careerSubmissions: store.careerSubmissions });
    }
  );

  // Reset Store to Initial State
  app.post('/api/admin/reset', requireAdminAuth, (_req: Request, res: Response) => {
    store = structuredClone(INITIAL_STORE);
    saveStore(store);
    res.json({ store, configStatus: getSystemConfigStatus(store) });
  });

  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req: Request, res: Response) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`LOVANSTRIX server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
