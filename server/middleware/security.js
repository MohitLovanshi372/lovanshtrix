import { getClientIp } from '../utils/validators.js';

const rateBuckets = new Map();

export function createRateLimiter(bucketName, maxRequests, windowMs) {
  return (req, res, next) => {
    const now = Date.now();
    const key = `${bucketName}:${getClientIp(req)}`;
    const existing = rateBuckets.get(key);

    if (rateBuckets.size > 2000) {
      for (const [k, v] of rateBuckets.entries()) {
        if (v.resetAt <= now) rateBuckets.delete(k);
      }
    }

    if (!existing || existing.resetAt <= now) {
      rateBuckets.set(key, { count: 1, resetAt: now + windowMs });
      return next();
    }

    existing.count += 1;
    if (existing.count > maxRequests) {
      const retryAfterSec = Math.ceil((existing.resetAt - now) / 1000);
      res.setHeader('Retry-After', String(retryAfterSec));
      return res.status(429).json({
        error: 'Too many requests. Please wait a moment and try again.',
      });
    }

    return next();
  };
}

export function securityHeadersMiddleware(req, res, next) {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'SAMEORIGIN');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  res.setHeader('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');

  if (req.path === '/data' || req.path.startsWith('/data/')) {
    return res.status(403).json({ error: 'Forbidden' });
  }
  return next();
}
