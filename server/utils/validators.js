import { INITIAL_STORE } from '../../src/types/lovanstrix.js';

export const ALLOWED_RESUME_MIME_TYPES = new Set([
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
]);

export const MAX_RESUME_BYTES = 2 * 1024 * 1024; // 2 MB

export function getClientIp(req) {
  const forwarded = req.headers['x-forwarded-for'];
  if (typeof forwarded === 'string' && forwarded.trim()) {
    return forwarded.split(',')[0].trim();
  }
  return req.socket?.remoteAddress || 'unknown';
}

export function sanitizeText(value, maxLen = 1000) {
  if (typeof value !== 'string') return '';
  return value.replace(/\0/g, '').trim().slice(0, maxLen);
}

export function isValidEmail(email) {
  if (!email || email.length > 254) return false;
  return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email);
}

export function isValidPhone(phone) {
  if (!phone) return true;
  return /^[0-9+\-\s()]{7,24}$/.test(phone);
}

export function isValidUrl(url) {
  if (!url) return true;
  if (url.length > 500) return false;
  try {
    const parsed = new URL(url);
    return parsed.protocol === 'http:' || parsed.protocol === 'https:';
  } catch {
    return false;
  }
}

export function sanitizeFileSegment(value) {
  return value.replace(/[^a-zA-Z0-9._-]/g, '_').slice(0, 80);
}

export function parseResumeUpload(fileNameRaw, mimeTypeRaw, dataUrlRaw) {
  const fileName = sanitizeFileSegment(sanitizeText(fileNameRaw, 120));
  const mimeType = sanitizeText(mimeTypeRaw, 120);
  const dataUrl = typeof dataUrlRaw === 'string' ? dataUrlRaw.trim() : '';

  if (!fileName && !dataUrl) {
    return {};
  }

  if (!fileName || !mimeType || !dataUrl) {
    return { error: 'Incomplete resume file upload payload.' };
  }

  if (!ALLOWED_RESUME_MIME_TYPES.has(mimeType)) {
    return { error: 'Unsupported resume file type. Please upload PDF, DOC, or DOCX.' };
  }

  const expectedPrefix = `data:${mimeType};base64,`;
  if (!dataUrl.startsWith(expectedPrefix)) {
    return { error: 'Invalid resume file encoding.' };
  }

  const base64Body = dataUrl.slice(expectedPrefix.length);
  if (!base64Body || !/^[A-Za-z0-9+/=]+$/.test(base64Body)) {
    return { error: 'Corrupted resume file data.' };
  }

  const fileBuffer = Buffer.from(base64Body, 'base64');
  if (fileBuffer.byteLength === 0 || fileBuffer.byteLength > MAX_RESUME_BYTES) {
    return { error: 'Resume file size must be under 2 MB.' };
  }

  return { fileName, mimeType, fileBuffer };
}

export function redactSensitiveRecord(record) {
  if (!record || typeof record !== 'object') return record;
  const { resumeDataUrl: _removed, _id, __v, ...rest } = record;
  return rest;
}

export function redactSensitiveStore(store) {
  return {
    ...store,
    enquiries: [],
    careerSubmissions: [],
    internshipApplications: [],
    offerLetters: [],
    certificates: [],
  };
}

export function sanitizeStoreInput(payload, existingStore) {
  const baseCompany = {
    ...INITIAL_STORE.company,
    ...(existingStore?.company || {}),
    ...(payload?.company || {}),
    socials: {
      ...INITIAL_STORE.company.socials,
      ...(existingStore?.company?.socials || {}),
      ...(payload?.company?.socials || {}),
    },
  };

  if (!baseCompany.founderName || baseCompany.founderName === 'Lovanstrix Founding Team') {
    baseCompany.founderName = 'Mohit Lovanshi';
  }
  if (!baseCompany.founderRole || baseCompany.founderRole === 'Founder & Lead Technologist') {
    baseCompany.founderRole = 'Founder & CEO';
  }

  return {
    company: baseCompany,
    services: Array.isArray(payload?.services) ? payload.services : existingStore.services,
    solutions: Array.isArray(payload?.solutions) ? payload.solutions : existingStore.solutions,
    projects: Array.isArray(payload?.projects) ? payload.projects : existingStore.projects,
    explorations: Array.isArray(payload?.explorations)
      ? payload.explorations
      : existingStore.explorations || INITIAL_STORE.explorations,
    careerOpenings: Array.isArray(payload?.careerOpenings)
      ? payload.careerOpenings
      : existingStore.careerOpenings,
    enquiries: Array.isArray(payload?.enquiries) ? payload.enquiries : existingStore.enquiries,
    careerSubmissions: Array.isArray(payload?.careerSubmissions)
      ? payload.careerSubmissions.map(redactSensitiveRecord)
      : existingStore.careerSubmissions.map(redactSensitiveRecord),
    internships: Array.isArray(payload?.internships)
      ? payload.internships
      : existingStore.internships || INITIAL_STORE.internships,
    internshipApplications: Array.isArray(payload?.internshipApplications)
      ? payload.internshipApplications.map(redactSensitiveRecord)
      : (existingStore.internshipApplications || []).map(redactSensitiveRecord),
    offerLetters: Array.isArray(payload?.offerLetters)
      ? payload.offerLetters
      : existingStore.offerLetters || INITIAL_STORE.offerLetters,
    certificates: Array.isArray(payload?.certificates)
      ? payload.certificates
      : existingStore.certificates || INITIAL_STORE.certificates,
  };
}
