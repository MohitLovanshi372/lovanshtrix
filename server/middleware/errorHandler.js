export function notFoundHandler(req, res, next) {
  if (req.path.startsWith('/api/')) {
    return res.status(404).json({
      error: `API endpoint not found: ${req.method} ${req.originalUrl}`,
    });
  }
  return next();
}

export function errorHandler(err, _req, res, _next) {
  if (err?.type === 'entity.too.large') {
    return res.status(413).json({
      error: 'Request payload is too large. Please keep resume uploads under 2 MB.',
    });
  }

  console.error('[Server Error]', err?.message || err);
  const status = Number(err?.status || err?.statusCode) || 500;
  return res.status(status).json({
    error: status >= 500 ? 'An unexpected server error occurred.' : err?.message || 'Request failed.',
  });
}
