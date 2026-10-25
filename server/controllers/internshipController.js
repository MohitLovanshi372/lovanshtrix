import crypto from 'crypto';
import { getStore, savePrivateResumeFile, saveStore } from '../services/storeService.js';
import {
  isValidEmail,
  isValidPhone,
  isValidUrl,
  parseResumeUpload,
  redactSensitiveRecord,
  sanitizeText,
} from '../utils/validators.js';

export async function submitInternshipApplication(req, res, next) {
  try {
    const body = req.body || {};

    if (sanitizeText(body.websiteUrlHoneypot, 100)) {
      return res.status(400).json({ error: 'Invalid submission.' });
    }

    const fullName = sanitizeText(body.fullName, 100);
    const email = sanitizeText(body.email, 160).toLowerCase();
    const phone = sanitizeText(body.phone, 24);
    const internshipId = sanitizeText(body.internshipId, 80);
    const collegeOrOrganization = sanitizeText(body.collegeOrOrganization, 160);
    const degreeAndYear = sanitizeText(body.degreeAndYear, 120) || 'Not specified';
    const cityAndState = sanitizeText(body.cityAndState, 120);
    const PreferredDuration = sanitizeText(body.PreferredDuration, 60) || '8 Weeks';
    const githubOrPortfolio = sanitizeText(body.githubOrPortfolio, 300);
    const linkedinUrl = sanitizeText(body.linkedinUrl, 300);
    const resumeLink = sanitizeText(body.resumeLink, 300);
    const whyJoin = sanitizeText(body.whyJoin, 2500);
    const projectExperience = sanitizeText(body.projectExperience, 2500);
    const availability = sanitizeText(body.availability, 80) || 'Immediate';

    if (!fullName || !email || !phone || !internshipId || !collegeOrOrganization || !whyJoin) {
      return res.status(400).json({
        error:
          'Full Name, Email, Phone, Internship Track, College/Organization, and Statement of Interest are required.',
      });
    }

    if (!isValidEmail(email)) {
      return res.status(400).json({ error: 'Please provide a valid email address.' });
    }

    if (!isValidPhone(phone)) {
      return res.status(400).json({ error: 'Please provide a valid phone number.' });
    }

    if (!isValidUrl(githubOrPortfolio) || !isValidUrl(linkedinUrl) || !isValidUrl(resumeLink)) {
      return res.status(400).json({
        error: 'Portfolio, LinkedIn, or Resume link must be a valid HTTP/HTTPS URL.',
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
    const listing = (store.internships || []).find((i) => i.id === internshipId);
    const year = new Date().getFullYear();
    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    const applicationId = `LVX-INT-${year}-${randomSuffix}`;
    const recordId = `int-app-${crypto.randomUUID()}`;
    const nowIso = new Date().toISOString();

    if (resumeCheck.fileBuffer && resumeCheck.fileName && resumeCheck.mimeType) {
      await savePrivateResumeFile(
        'internship',
        recordId,
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

    const newApp = {
      id: recordId,
      applicationId,
      internshipId,
      internshipTitle: listing?.title || sanitizeText(body.internshipTitle, 140) || 'Internship Track',
      domain: listing?.domain || sanitizeText(body.domain, 100) || 'Web Development',
      fullName,
      email,
      phone,
      collegeOrOrganization,
      degreeAndYear,
      cityAndState,
      PreferredDuration: PreferredDuration || listing?.duration || '8 Weeks',
      skills: skillsArray,
      githubOrPortfolio,
      linkedinUrl,
      resumeLink,
      resumeFileName: resumeCheck.fileName || undefined,
      resumeMimeType: resumeCheck.mimeType || undefined,
      whyJoin,
      projectExperience,
      availability,
      status: 'Submitted',
      assignedTasksSummary: '',
      projectSubmissionUrl: '',
      adminNotes: '',
      createdAt: nowIso,
      updatedAt: nowIso,
    };

    store.internshipApplications = [newApp, ...(store.internshipApplications || [])];
    await saveStore(store);

    return res.status(201).json({
      application: redactSensitiveRecord(newApp),
      message: `Application submitted successfully! Your Application ID is ${applicationId}. Save this ID and your email to track your status in the Student Dashboard.`,
    });
  } catch (err) {
    return next(err);
  }
}

export async function trackInternshipStatus(req, res, next) {
  try {
    const applicationId = sanitizeText(req.body?.applicationId || '', 40).toUpperCase();
    const email = sanitizeText(req.body?.email || '', 160).toLowerCase();

    if (!applicationId || !email || !isValidEmail(email)) {
      return res.status(400).json({
        error: 'Both a valid Application ID and your registered Email Address are required.',
      });
    }

    const store = await getStore();
    const matched = (store.internshipApplications || []).find(
      (app) =>
        app.applicationId.toUpperCase() === applicationId &&
        app.email.trim().toLowerCase() === email
    );

    if (!matched) {
      return res.status(404).json({
        error:
          'No matching internship application found for the provided Application ID and Email combined.',
      });
    }

    const offerLetter = matched.offerLetterId
      ? (store.offerLetters || []).find(
          (o) => o.id === matched.offerLetterId || o.applicationId === matched.applicationId
        )
      : (store.offerLetters || []).find((o) => o.applicationId === matched.applicationId);

    const certificate = matched.certificateId
      ? (store.certificates || []).find(
          (c) => c.id === matched.certificateId || c.applicationId === matched.applicationId
        )
      : (store.certificates || []).find((c) => c.applicationId === matched.applicationId);

    const { adminNotes: _hiddenNotes, ...studentSafeApplication } = redactSensitiveRecord(matched);

    return res.json({
      application: studentSafeApplication,
      offerLetter: offerLetter || null,
      certificate: certificate || null,
    });
  } catch (err) {
    return next(err);
  }
}
