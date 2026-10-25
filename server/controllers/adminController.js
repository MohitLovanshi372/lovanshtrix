import { hasValidAdminConfig } from '../config/env.js';
import { isAuthorizedAdmin } from '../middleware/auth.js';
import {
  getStore,
  logAdminAction,
  readPrivateResumeFile,
  saveStore,
} from '../services/storeService.js';
import { getClientIp, sanitizeFileSegment, sanitizeStoreInput, sanitizeText } from '../utils/validators.js';

export async function verifyAdminPasscode(req, res, next) {
  try {
    if (!hasValidAdminConfig()) {
      return res.status(503).json({
        authenticated: false,
        error:
          'Server admin authentication is not configured. Set an ADMIN_PASSCODE of at least 12 characters in your environment variables.',
      });
    }

    if (isAuthorizedAdmin(req)) {
      await logAdminAction('admin_login_success', getClientIp(req), 'Admin session verified');
      return res.json({ authenticated: true });
    }

    await logAdminAction('admin_login_failed', getClientIp(req), 'Failed admin login attempt');
    return res.status(401).json({
      authenticated: false,
      error: 'Invalid admin passcode.',
    });
  } catch (err) {
    return next(err);
  }
}

export async function getAdminStore(_req, res, next) {
  try {
    const store = await getStore();
    return res.json(store);
  } catch (err) {
    return next(err);
  }
}

export async function updateAdminStore(req, res, next) {
  try {
    const current = await getStore();
    const updated = sanitizeStoreInput(req.body, current);
    const saved = await saveStore(updated);

    await logAdminAction(
      'admin_store_update',
      getClientIp(req),
      'Updated Lovanstrix store from Admin Console',
      {
        servicesCount: saved.services?.length || 0,
        projectsCount: saved.projects?.length || 0,
        enquiriesCount: saved.enquiries?.length || 0,
      }
    );

    return res.json(saved);
  } catch (err) {
    return next(err);
  }
}

export async function downloadPrivateResume(req, res, next) {
  try {
    const kind = req.params.kind === 'internship' ? 'internship' : 'career';
    const recordId = sanitizeText(req.params.id, 80);
    const store = await getStore();

    const record =
      kind === 'internship'
        ? (store.internshipApplications || []).find((a) => a.id === recordId)
        : (store.careerSubmissions || []).find((c) => c.id === recordId);

    if (!record || !record.resumeFileName) {
      return res.status(404).json({ error: 'Uploaded resume metadata not found.' });
    }

    const resumeFile = await readPrivateResumeFile(kind, recordId);
    if (!resumeFile || !resumeFile.buffer) {
      return res.status(404).json({ error: 'Resume file is not stored on the server.' });
    }

    const safeDownloadName = sanitizeFileSegment(resumeFile.fileName || record.resumeFileName);
    res.setHeader(
      'Content-Type',
      resumeFile.mimeType || record.resumeMimeType || 'application/octet-stream'
    );
    res.setHeader('Content-Disposition', `attachment; filename="${safeDownloadName}"`);
    return res.send(resumeFile.buffer);
  } catch (err) {
    return next(err);
  }
}
