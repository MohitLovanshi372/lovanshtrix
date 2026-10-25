import { Router } from 'express';
import {
  downloadPrivateResume,
  getAdminStore,
  updateAdminStore,
  verifyAdminPasscode,
} from '../controllers/adminController.js';
import {
  submitInternshipApplication,
  trackInternshipStatus,
} from '../controllers/internshipController.js';
import {
  getHealthStatus,
  getPublicStore,
  submitCareerApplication,
  submitProjectEnquiry,
  verifyCertificateByCode,
} from '../controllers/publicController.js';
import { requireAdminAuth } from '../middleware/auth.js';
import { createRateLimiter } from '../middleware/security.js';

const router = Router();

const adminVerifyLimiter = createRateLimiter('admin-verify', 8, 15 * 60 * 1000);
const formSubmitLimiter = createRateLimiter('form-submit', 12, 10 * 60 * 1000);
const lookupLimiter = createRateLimiter('lookup', 25, 5 * 60 * 1000);

// Health & Readiness
router.get('/health', getHealthStatus);

// Public Store
router.get('/store', getPublicStore);

// Admin Authentication & Store Management
router.post('/admin/verify', adminVerifyLimiter, verifyAdminPasscode);
router.get('/admin/store', requireAdminAuth, getAdminStore);
router.put('/store', requireAdminAuth, updateAdminStore);
router.get('/admin/resumes/:kind/:id', requireAdminAuth, downloadPrivateResume);

// Public Enquiries & Careers
router.post('/enquiries', formSubmitLimiter, submitProjectEnquiry);
router.post('/careers/apply', formSubmitLimiter, submitCareerApplication);

// Internships & Student Tracking
router.post('/internships/apply', formSubmitLimiter, submitInternshipApplication);
router.post('/internships/track', lookupLimiter, trackInternshipStatus);

// Certificate Verification
router.get('/certificates/verify/:code', lookupLimiter, verifyCertificateByCode);

export default router;
