import crypto from 'crypto';
import { ENV, hasValidAdminConfig } from '../config/env.js';

export function isAuthorizedAdmin(req) {
  if (!hasValidAdminConfig()) return false;
  const headerCode = String(req.headers['x-admin-passcode'] || '').trim();
  const bodyCode = String(req.body?.passcode || '').trim();
  const candidate = headerCode || bodyCode;
  if (!candidate) return false;

  const expectedHash = crypto.createHash('sha256').update(ENV.ADMIN_PASSCODE).digest();
  const candidateHash = crypto.createHash('sha256').update(candidate).digest();
  return crypto.timingSafeEqual(expectedHash, candidateHash);
}

export function requireAdminAuth(req, res, next) {
  if (!hasValidAdminConfig()) {
    return res.status(503).json({
      error:
        'Admin Console is disabled until a secure ADMIN_PASSCODE (at least 12 characters) is configured on the server.',
    });
  }

  if (!isAuthorizedAdmin(req)) {
    return res.status(401).json({
      error: 'Unauthorized: Invalid or missing admin passcode.',
    });
  }

  return next();
}
