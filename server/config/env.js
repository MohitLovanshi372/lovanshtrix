import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const ROOT_DIR = path.resolve(__dirname, '..', '..');
export const DATA_DIR = path.join(ROOT_DIR, 'data');
export const BACKUP_DIR = path.join(DATA_DIR, 'backups');
export const STORE_FILE = path.join(DATA_DIR, 'lovanstrix-store.json');
export const PRIVATE_RESUMES_DIR = path.join(DATA_DIR, 'private-resumes');

export const ENV = {
  NODE_ENV: process.env.NODE_ENV || 'development',
  PORT: Number(process.env.PORT) || 3000,
  MONGODB_URI: (process.env.MONGODB_URI || '').trim(),
  MONGODB_DB_NAME: (process.env.MONGODB_DB_NAME || 'lovanstrix').trim(),
  ADMIN_PASSCODE: (process.env.ADMIN_PASSCODE || '').trim(),
  SMTP_HOST: (process.env.SMTP_HOST || '').trim(),
  SMTP_PORT: Number(process.env.SMTP_PORT || 587),
  SMTP_USER: (process.env.SMTP_USER || '').trim(),
  SMTP_PASS: (process.env.SMTP_PASS || '').trim(),
  NOTIFY_EMAIL: (process.env.NOTIFY_EMAIL || '').trim(),
};

export function hasValidAdminConfig() {
  return ENV.ADMIN_PASSCODE.length >= 12;
}
