import fs from 'fs';
import path from 'path';
import { BACKUP_DIR, ENV, PRIVATE_RESUMES_DIR, STORE_FILE } from '../server/config/env.js';
import { connectDatabase, disconnectDatabase } from '../server/config/db.js';
import {
  CareerOpening,
  CareerSubmission,
  Certificate,
  CompanySetting,
  Exploration,
  InternshipApplication,
  InternshipListing,
  OfferLetter,
  PrivateResume,
  Project,
  ProjectEnquiry,
  Service,
  Solution,
} from '../server/models/index.js';
import { INITIAL_STORE } from '../src/types/lovanstrix.js';
import { sanitizeStoreInput } from '../server/utils/validators.js';

const isDryRun = process.argv.includes('--dry-run');

function createBackup(rawJson) {
  if (!fs.existsSync(BACKUP_DIR)) {
    fs.mkdirSync(BACKUP_DIR, { recursive: true });
  }
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const backupFile = path.join(BACKUP_DIR, `lovanstrix-store.backup-${timestamp}.json`);
  fs.writeFileSync(backupFile, rawJson, 'utf-8');
  return backupFile;
}

function collectPrivateResumeFiles() {
  if (!fs.existsSync(PRIVATE_RESUMES_DIR)) return [];
  const files = fs.readdirSync(PRIVATE_RESUMES_DIR).filter((name) => name.endsWith('.bin'));
  return files
    .map((file) => {
      const fullPath = path.join(PRIVATE_RESUMES_DIR, file);
      const withoutExt = file.replace(/\.bin$/, '');
      if (withoutExt.startsWith('internship-')) {
        return {
          recordKind: 'internship',
          recordId: withoutExt.slice('internship-'.length),
          fullPath,
        };
      }
      if (withoutExt.startsWith('career-')) {
        return {
          recordKind: 'career',
          recordId: withoutExt.slice('career-'.length),
          fullPath,
        };
      }
      return null;
    })
    .filter(Boolean);
}

async function upsertCollection(label, Model, items, keyField = 'id') {
  const summary = { label, migrated: 0, skipped: 0, errors: 0 };
  if (!Array.isArray(items) || items.length === 0) {
    return summary;
  }

  for (let i = 0; i < items.length; i += 1) {
    const item = items[i];
    if (!item || !item[keyField]) {
      summary.skipped += 1;
      continue;
    }

    if (isDryRun) {
      summary.migrated += 1;
      continue;
    }

    try {
      const cleanItem = { ...item };
      delete cleanItem._id;
      delete cleanItem.__v;
      if ('order' in Model.schema.paths && typeof cleanItem.order !== 'number') {
        cleanItem.order = i + 1;
      }

      await Model.findOneAndUpdate(
        { [keyField]: cleanItem[keyField] },
        { $set: cleanItem },
        { upsert: true, new: true, runValidators: true }
      );
      summary.migrated += 1;
    } catch (err) {
      summary.errors += 1;
      console.error(`[Migration Error] ${label} (${item[keyField]}):`, err?.message || err);
    }
  }

  return summary;
}

async function runMigration() {
  console.log('==============================================================');
  console.log(' LOVANSTRIX — JSON STORE TO MONGODB MIGRATION UTILITY');
  console.log(` Mode: ${isDryRun ? 'DRY RUN (Validation & Preview Only)' : 'LIVE MIGRATION'}`);
  console.log('==============================================================');

  if (!fs.existsSync(STORE_FILE)) {
    console.error(`[Error] Store file not found at: ${STORE_FILE}`);
    process.exit(1);
  }

  const rawJson = fs.readFileSync(STORE_FILE, 'utf-8');
  const backupPath = createBackup(rawJson);
  console.log(`[Backup] Created safe backup at: ${backupPath}`);

  const parsed = JSON.parse(rawJson);
  const store = sanitizeStoreInput(parsed, INITIAL_STORE);

  // Ensure Founder profile is set to Mohit Lovanshi / Founder & CEO
  store.company.founderName = 'Mohit Lovanshi';
  store.company.founderRole = 'Founder & CEO';

  const resumeBinaries = collectPrivateResumeFiles();

  if (!isDryRun) {
    if (!ENV.MONGODB_URI) {
      console.error(
        '[Error] MONGODB_URI is not set in .env. Please configure MONGODB_URI or run with --dry-run to validate.'
      );
      process.exit(1);
    }

    const connected = await connectDatabase(ENV.MONGODB_URI);
    if (!connected) {
      console.error('[Error] Failed to connect to MongoDB. Aborting live migration.');
      process.exit(1);
    }
  }

  const results = [];

  // 1. Company Settings (Singleton)
  if (isDryRun) {
    results.push({ label: 'CompanySetting', migrated: 1, skipped: 0, errors: 0 });
  } else {
    try {
      await CompanySetting.findOneAndUpdate(
        { singletonKey: 'default' },
        { $set: { ...store.company, singletonKey: 'default' } },
        { upsert: true, new: true, runValidators: true }
      );
      results.push({ label: 'CompanySetting', migrated: 1, skipped: 0, errors: 0 });
    } catch (err) {
      console.error('[Migration Error] CompanySetting:', err?.message || err);
      results.push({ label: 'CompanySetting', migrated: 0, skipped: 0, errors: 1 });
    }
  }

  // 2. Collections
  results.push(await upsertCollection('Service', Service, store.services));
  results.push(await upsertCollection('Solution', Solution, store.solutions));
  results.push(await upsertCollection('Project', Project, store.projects));
  results.push(await upsertCollection('Exploration', Exploration, store.explorations));
  results.push(await upsertCollection('CareerOpening', CareerOpening, store.careerOpenings));
  results.push(await upsertCollection('ProjectEnquiry', ProjectEnquiry, store.enquiries));
  results.push(await upsertCollection('CareerSubmission', CareerSubmission, store.careerSubmissions));
  results.push(await upsertCollection('InternshipListing', InternshipListing, store.internships));
  results.push(
    await upsertCollection(
      'InternshipApplication',
      InternshipApplication,
      store.internshipApplications
    )
  );
  results.push(await upsertCollection('OfferLetter', OfferLetter, store.offerLetters));
  results.push(await upsertCollection('Certificate', Certificate, store.certificates));

  // 3. Private Resume Binaries
  const resumeSummary = { label: 'PrivateResume', migrated: 0, skipped: 0, errors: 0 };
  for (const item of resumeBinaries) {
    if (isDryRun) {
      resumeSummary.migrated += 1;
      continue;
    }

    try {
      const buffer = fs.readFileSync(item.fullPath);
      const parentRecord =
        item.recordKind === 'internship'
          ? (store.internshipApplications || []).find((a) => a.id === item.recordId)
          : (store.careerSubmissions || []).find((c) => c.id === item.recordId);

      await PrivateResume.findOneAndUpdate(
        { recordKind: item.recordKind, recordId: item.recordId },
        {
          $set: {
            recordKind: item.recordKind,
            recordId: item.recordId,
            fileName: parentRecord?.resumeFileName || `${item.recordId}.pdf`,
            mimeType: parentRecord?.resumeMimeType || 'application/pdf',
            fileBuffer: buffer,
            sizeBytes: buffer.byteLength,
          },
        },
        { upsert: true, new: true }
      );
      resumeSummary.migrated += 1;
    } catch (err) {
      resumeSummary.errors += 1;
      console.error(`[Migration Error] PrivateResume (${item.recordId}):`, err?.message || err);
    }
  }
  results.push(resumeSummary);

  console.log('\nMigration Summary:');
  console.log('--------------------------------------------------------------');
  for (const row of results) {
    console.log(
      ` - ${row.label.padEnd(24)} | Migrated: ${String(row.migrated).padStart(3)} | Skipped: ${String(
        row.skipped
      ).padStart(2)} | Errors: ${row.errors}`
    );
  }
  console.log('--------------------------------------------------------------');
  console.log(`Founder Profile Verified: ${store.company.founderName} (${store.company.founderRole})`);
  console.log(`Source JSON preserved at: ${STORE_FILE}`);

  if (!isDryRun) {
    await disconnectDatabase();
  }
}

runMigration().catch((err) => {
  console.error('[Fatal Migration Error]', err);
  process.exit(1);
});
