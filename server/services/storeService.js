import fs from 'fs';
import path from 'path';
import { DATA_DIR, PRIVATE_RESUMES_DIR, STORE_FILE } from '../config/env.js';
import { isMongoConnected } from '../config/db.js';
import {
  AdminAuditLog,
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
} from '../models/index.js';
import { INITIAL_STORE } from '../../src/types/lovanstrix.js';
import {
  redactSensitiveRecord,
  sanitizeFileSegment,
  sanitizeStoreInput,
} from '../utils/validators.js';

export function ensureDirectories() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
  if (!fs.existsSync(PRIVATE_RESUMES_DIR)) {
    fs.mkdirSync(PRIVATE_RESUMES_DIR, { recursive: true });
  }
}

export function readLocalJsonStore() {
  ensureDirectories();
  try {
    if (!fs.existsSync(STORE_FILE)) {
      fs.writeFileSync(STORE_FILE, JSON.stringify(INITIAL_STORE, null, 2), 'utf-8');
      return structuredClone(INITIAL_STORE);
    }
    const raw = fs.readFileSync(STORE_FILE, 'utf-8');
    const parsed = JSON.parse(raw);
    return sanitizeStoreInput(parsed, INITIAL_STORE);
  } catch (err) {
    console.error('[StoreService] Error reading local JSON store, falling back to INITIAL_STORE:', err);
    return structuredClone(INITIAL_STORE);
  }
}

export function writeLocalJsonStore(store) {
  ensureDirectories();
  const sanitized = sanitizeStoreInput(store, INITIAL_STORE);
  fs.writeFileSync(STORE_FILE, JSON.stringify(sanitized, null, 2), 'utf-8');
  return sanitized;
}

function cleanDoc(doc) {
  if (!doc) return doc;
  const plain = typeof doc.toObject === 'function' ? doc.toObject() : { ...doc };
  delete plain._id;
  delete plain.__v;
  delete plain.singletonKey;
  return plain;
}

export async function syncStoreToMongo(store) {
  if (!isMongoConnected()) return false;

  const sanitized = sanitizeStoreInput(store, INITIAL_STORE);

  await CompanySetting.findOneAndUpdate(
    { singletonKey: 'default' },
    { $set: { ...sanitized.company, singletonKey: 'default' } },
    { upsert: true, new: true }
  );

  const syncCollection = async (Model, items, keyField = 'id') => {
    const validItems = Array.isArray(items) ? items.filter((item) => item && item[keyField]) : [];
    const ids = validItems.map((item) => item[keyField]);

    if (ids.length > 0) {
      await Model.deleteMany({ [keyField]: { $nin: ids } });
    } else {
      await Model.deleteMany({});
    }

    if (validItems.length > 0) {
      const ops = validItems.map((item, idx) => {
        const cleanItem = { ...item };
        delete cleanItem._id;
        delete cleanItem.__v;
        if ('order' in Model.schema.paths && typeof cleanItem.order !== 'number') {
          cleanItem.order = idx + 1;
        }
        return {
          updateOne: {
            filter: { [keyField]: cleanItem[keyField] },
            update: { $set: cleanItem },
            upsert: true,
          },
        };
      });
      await Model.bulkWrite(ops, { ordered: false });
    }
  };

  await Promise.all([
    syncCollection(Service, sanitized.services),
    syncCollection(Solution, sanitized.solutions),
    syncCollection(Project, sanitized.projects),
    syncCollection(Exploration, sanitized.explorations),
    syncCollection(CareerOpening, sanitized.careerOpenings),
    syncCollection(ProjectEnquiry, sanitized.enquiries),
    syncCollection(CareerSubmission, sanitized.careerSubmissions),
    syncCollection(InternshipListing, sanitized.internships),
    syncCollection(InternshipApplication, sanitized.internshipApplications),
    syncCollection(OfferLetter, sanitized.offerLetters),
    syncCollection(Certificate, sanitized.certificates),
  ]);

  return true;
}

export async function readStoreFromMongo() {
  if (!isMongoConnected()) return null;

  const companyDoc = await CompanySetting.findOne({ singletonKey: 'default' }).lean();
  const [
    services,
    solutions,
    projects,
    explorations,
    careerOpenings,
    enquiries,
    careerSubmissions,
    internships,
    internshipApplications,
    offerLetters,
    certificates,
  ] = await Promise.all([
    Service.find({}).sort({ order: 1, createdAt: 1 }).lean(),
    Solution.find({}).sort({ order: 1, createdAt: 1 }).lean(),
    Project.find({}).sort({ order: 1, createdAt: 1 }).lean(),
    Exploration.find({}).sort({ Order: 1, createdAt: 1 }).lean(),
    CareerOpening.find({}).sort({ createdAt: 1 }).lean(),
    ProjectEnquiry.find({}).sort({ createdAt: -1 }).lean(),
    CareerSubmission.find({}).sort({ createdAt: -1 }).lean(),
    InternshipListing.find({}).sort({ createdAt: 1 }).lean(),
    InternshipApplication.find({}).sort({ createdAt: -1 }).lean(),
    OfferLetter.find({}).sort({ createdAt: -1 }).lean(),
    Certificate.find({}).sort({ createdAt: -1 }).lean(),
  ]);

  const isEmptyDatabase =
    !companyDoc &&
    services.length === 0 &&
    solutions.length === 0 &&
    projects.length === 0;

  if (isEmptyDatabase) {
    const localSeed = readLocalJsonStore();
    await syncStoreToMongo(localSeed);
    return localSeed;
  }

  return sanitizeStoreInput(
    {
      company: companyDoc ? cleanDoc(companyDoc) : INITIAL_STORE.company,
      services: services.map(cleanDoc),
      solutions: solutions.map(cleanDoc),
      projects: projects.map(cleanDoc),
      explorations: explorations.map(cleanDoc),
      careerOpenings: careerOpenings.map(cleanDoc),
      enquiries: enquiries.map(cleanDoc),
      careerSubmissions: careerSubmissions.map((item) => redactSensitiveRecord(cleanDoc(item))),
      internships: internships.map(cleanDoc),
      internshipApplications: internshipApplications.map((item) =>
        redactSensitiveRecord(cleanDoc(item))
      ),
      offerLetters: offerLetters.map(cleanDoc),
      certificates: certificates.map(cleanDoc),
    },
    INITIAL_STORE
  );
}

export async function getStore() {
  if (isMongoConnected()) {
    try {
      const mongoStore = await readStoreFromMongo();
      if (mongoStore) return mongoStore;
    } catch (err) {
      console.error('[StoreService] MongoDB read error, using local JSON fallback:', err?.message || err);
    }
  }
  return readLocalJsonStore();
}

export async function saveStore(nextStore) {
  const sanitized = writeLocalJsonStore(nextStore);
  if (isMongoConnected()) {
    try {
      await syncStoreToMongo(sanitized);
    } catch (err) {
      console.error('[StoreService] MongoDB sync error:', err?.message || err);
    }
  }
  return sanitized;
}

export async function savePrivateResumeFile(recordKind, recordId, fileName, mimeType, fileBuffer) {
  ensureDirectories();
  const safeId = sanitizeFileSegment(recordId);
  const diskPath = path.join(PRIVATE_RESUMES_DIR, `${recordKind}-${safeId}.bin`);
  fs.writeFileSync(diskPath, fileBuffer);

  if (isMongoConnected()) {
    try {
      await PrivateResume.findOneAndUpdate(
        { recordKind, recordId: safeId },
        {
          $set: {
            recordKind,
            recordId: safeId,
            fileName,
            mimeType,
            fileBuffer,
            sizeBytes: fileBuffer.byteLength,
          },
        },
        { upsert: true, new: true }
      );
    } catch (err) {
      console.error('[StoreService] Failed to persist resume in MongoDB:', err?.message || err);
    }
  }
}

export async function readPrivateResumeFile(recordKind, recordId) {
  const safeId = sanitizeFileSegment(recordId);

  if (isMongoConnected()) {
    try {
      const doc = await PrivateResume.findOne({ recordKind, recordId: safeId }).lean();
      if (doc && doc.fileBuffer) {
        const buffer = Buffer.isBuffer(doc.fileBuffer)
          ? doc.fileBuffer
          : Buffer.from(doc.fileBuffer.buffer || doc.fileBuffer);
        return {
          buffer,
          fileName: doc.fileName,
          mimeType: doc.mimeType,
        };
      }
    } catch (err) {
      console.error('[StoreService] Failed to read resume from MongoDB:', err?.message || err);
    }
  }

  const diskPath = path.join(PRIVATE_RESUMES_DIR, `${recordKind}-${safeId}.bin`);
  if (!fs.existsSync(diskPath)) {
    return null;
  }

  return {
    buffer: fs.readFileSync(diskPath),
    fileName: null,
    mimeType: null,
  };
}

export async function logAdminAction(action, actorIp, summary, metadata = {}) {
  if (!isMongoConnected()) return;
  try {
    await AdminAuditLog.create({
      action,
      actorIp,
      summary,
      metadata,
    });
  } catch (err) {
    console.warn('[AuditLog] Could not record audit log:', err?.message || err);
  }
}
