import crypto from 'crypto';
import { getDatabaseHealth } from '../config/db.js';
import { hasValidAdminConfig } from '../config/env.js';
import { notifyProjectEnquiry } from '../services/emailService.js';
import { getStore, savePrivateResumeFile, saveStore } from '../services/storeService.js';
import {
  isValidEmail,
  isValidPhone,
  isValidUrl,
  parseResumeUpload,
  redactSensitiveStore,
  sanitizeText,
} from '../utils/validators.js';

export async function getHealthStatus(_req, res, next) {
  try {
    const dbHealth = getDatabaseHealth();
    return res.json({
      status: 'ok',
      service: 'Lovanstrix Full-Stack MERN Server',
      database: dbHealth,
      adminConfigured: hasValidAdminConfig(),
      timestamp: new Date().toISOString(),
    });
  } catch (err) {
    return next(err);
  }
}

export async function getPublicStore(_req, res, next) {
  try {
    const store = await getStore();
    return res.json(redactSensitiveStore(store));
  } catch (err) {
    return next(err);
  }
}

export async function submitProjectEnquiry(req, res, next) {
  try {
    const body = req.body || {};

    if (sanitizeText(body.websiteUrlHoneypot, 100)) {
      return res.status(400).json({ error: 'Invalid submission.' });
    }

    const fullName = sanitizeText(body.fullName, 100);
    const email = sanitizeText(body.email, 160).toLowerCase();
    const phone = sanitizeText(body.phone, 24);
    const companyOrProject = sanitizeText(body.companyOrProject, 140);
    const serviceNeeded = sanitizeText(body.serviceNeeded, 120);
    const budgetRange = sanitizeText(body.budgetRange, 80) || 'To Be Discussed';
    const timeline = sanitizeText(body.timeline, 80) || 'Flexible';
    const projectDetails = sanitizeText(body.projectDetails, 3000);

    if (!fullName || !email || !serviceNeeded || !projectDetails) {
      return res.status(400).json({
        error: 'Please complete all required fields: Full Name, Email, Service, and Project Details.',
      });
    }

    if (!isValidEmail(email)) {
      return res.status(400).json({ error: 'Please provide a valid email address.' });
    }

    if (!isValidPhone(phone)) {
      return res.status(400).json({ error: 'Please provide a valid phone number.' });
    }

    if (projectDetails.length < 15) {
      return res.status(400).json({
        error: 'Please share at least a brief overview (15+ characters) of your project goals.',
      });
    }

    const store = await getStore();
    const referenceNumber = `LVX-ENQ-${Date.now().toString().slice(-6)}`;
    const newEnquiry = {
      id: `enq-${crypto.randomUUID()}`,
      referenceNumber,
      fullName,
      email,
      phone,
      companyOrProject,
      serviceNeeded,
      budgetRange,
      timeline,
      projectDetails,
      status: 'New',
      adminNotes: '',
      createdAt: new Date().toISOString(),
    };

    store.enquiries = [newEnquiry, ...store.enquiries];
    await saveStore(store);

    const emailNotified = await notifyProjectEnquiry(newEnquiry, store.company.email);

    return res.status(201).json({
      enquiry: newEnquiry,
      emailNotified,
      message:
        'Your project enquiry has been saved with reference ' +
        referenceNumber +
        '. Our team will review your requirements and respond shortly.',
    });
  } catch (err) {
    return next(err);
  }
}

export async function submitCareerApplication(req, res, next) {
  try {
    const body = req.body || {};

    if (sanitizeText(body.websiteUrlHoneypot, 100)) {
      return res.status(400).json({ error: 'Invalid submission.' });
    }

    const fullName = sanitizeText(body.fullName, 100);
    const email = sanitizeText(body.email, 160).toLowerCase();
    const phone = sanitizeText(body.phone, 24);
    const areaOfInterest = sanitizeText(body.areaOfInterest, 120);
    const roleType = sanitizeText(body.roleType, 80) || 'Career Collaboration';
    const experienceLevel = sanitizeText(body.experienceLevel, 80) || 'Early Career / Builder';
    const portfolioOrGithub = sanitizeText(body.portfolioOrGithub, 300);
    const resumeLink = sanitizeText(body.resumeLink, 300);
    const message = sanitizeText(body.message, 2500);

    if (!fullName || !email || !areaOfInterest) {
      return res.status(400).json({
        error: 'Full Name, Email, and Area of Interest are required.',
      });
    }

    if (!isValidEmail(email)) {
      return res.status(400).json({ error: 'Please provide a valid email address.' });
    }

    if (!isValidPhone(phone)) {
      return res.status(400).json({ error: 'Please provide a valid phone number.' });
    }

    if (!isValidUrl(portfolioOrGithub) || !isValidUrl(resumeLink)) {
      return res.status(400).json({
        error: 'Portfolio, GitHub, or Resume link must be a valid HTTP/HTTPS URL.',
      });
    }

    const resumeCheck = parseResumeUpload(
      body.resumeFileName,
      body.resumeMimeType,
      body.resumeDataUrl
    );
    if (resumeCheck.error) {
      return res.status(400).json({ error: resumeCheck.error });
    }

    const store = await getStore();
    const referenceNumber = `LVX-CAR-${Date.now().toString().slice(-6)}`;
    const submissionId = `car-sub-${crypto.randomUUID()}`;

    if (resumeCheck.fileBuffer && resumeCheck.fileName && resumeCheck.mimeType) {
      await savePrivateResumeFile(
        'career',
        submissionId,
        resumeCheck.fileName,
        resumeCheck.mimeType,
        resumeCheck.fileBuffer
      );
    }

    const skillsArray = Array.isArray(body.skills)
      ? body.skills.map((s) => sanitizeText(String(s), 60)).filter(Boolean).slice(0, 20)
      : String(body.skills || '')
          .split(',')
          .map((s) => sanitizeText(s, 60))
          .filter(Boolean)
          .slice(0, 20);

    const newSubmission = {
      id: submissionId,
      referenceNumber,
      fullName,
      email,
      phone,
      areaOfInterest,
      roleType,
      experienceLevel,
      skills: skillsArray,
      portfolioOrGithub,
      resumeLink,
      resumeFileName: resumeCheck.fileName || undefined,
      resumeMimeType: resumeCheck.mimeType || undefined,
      message,
      status: 'Received',
      adminNotes: '',
      createdAt: new Date().toISOString(),
    };

    store.careerSubmissions = [newSubmission, ...store.careerSubmissions];
    await saveStore(store);

    return res.status(201).json({
      submission: newSubmission,
      message:
        'Your profile and expression of interest have been recorded under reference ' +
        referenceNumber +
        '.',
    });
  } catch (err) {
    return next(err);
  }
}

export async function verifyCertificateByCode(req, res, next) {
  try {
    const rawCode = sanitizeText(req.params.code || '', 60).toUpperCase();
    if (!rawCode) {
      return res.status(400).json({ verified: false, message: 'Certificate ID is required.' });
    }

    const store = await getStore();
    const certificate = (store.certificates || []).find(
      (c) => c.certificateCode.toUpperCase() === rawCode
    );

    if (!certificate) {
      return res.status(404).json({
        verified: false,
        message: 'No certificate found matching this Certificate ID.',
      });
    }

    return res.json({
      verified: certificate.status === 'Valid',
      certificate: {
        ...certificate,
        recipientEmail: '',
      },
      company: {
        name: store.company.name,
        tagline: store.company.tagline,
        email: store.company.email,
      },
    });
  } catch (err) {
    return next(err);
  }
}
