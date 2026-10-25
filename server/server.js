import { createApp } from './app.js';
import { connectDatabase } from './config/db.js';
import { ENV } from './config/env.js';
import { ensureDirectories, getStore } from './services/storeService.js';

export async function startServer() {
  ensureDirectories();
  await connectDatabase();
  await getStore();

  const app = await createApp();
  const server = app.listen(ENV.PORT, '0.0.0.0', () => {
    console.log(`Lovanstrix Full-Stack MERN Server running on http://localhost:${ENV.PORT}`);
  });

  return server;
}
