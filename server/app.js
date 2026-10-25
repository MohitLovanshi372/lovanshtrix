import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { ENV, ROOT_DIR } from './config/env.js';
import { errorHandler, notFoundHandler } from './middleware/errorHandler.js';
import { securityHeadersMiddleware } from './middleware/security.js';
import apiRoutes from './routes/apiRoutes.js';

export async function createApp() {
  const app = express();
  app.disable('x-powered-by');

  app.use(securityHeadersMiddleware);
  app.use(express.json({ limit: '8mb' }));

  // Mount REST API routes
  app.use('/api', apiRoutes);
  app.use(notFoundHandler);

  // Vite middleware in development or static dist in production
  if (ENV.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(ROOT_DIR, 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.use(errorHandler);
  return app;
}
