import mongoose from 'mongoose';
import { ENV } from './env.js';

let connectionStatus = {
  configured: Boolean(ENV.MONGODB_URI),
  connected: false,
  state: 'disconnected',
  lastConnectedAt: null,
  error: null,
};

mongoose.connection.on('connected', () => {
  connectionStatus = {
    configured: Boolean(ENV.MONGODB_URI),
    connected: true,
    state: 'connected',
    lastConnectedAt: new Date().toISOString(),
    error: null,
  };
  console.log('[MongoDB] Connected successfully to database.');
});

mongoose.connection.on('disconnected', () => {
  connectionStatus = {
    ...connectionStatus,
    connected: false,
    state: 'disconnected',
  };
});

mongoose.connection.on('error', (err) => {
  connectionStatus = {
    ...connectionStatus,
    connected: false,
    state: 'error',
    error: err?.message || 'Database connection error',
  };
  console.error('[MongoDB] Connection error:', err?.message || err);
});

export async function connectDatabase(customUri) {
  const uri = (customUri || ENV.MONGODB_URI || '').trim();
  connectionStatus.configured = Boolean(uri);

  if (!uri) {
    connectionStatus = {
      configured: false,
      connected: false,
      state: 'fallback-json-store',
      lastConnectedAt: null,
      error: null,
    };
    console.log(
      '[MongoDB] MONGODB_URI is not configured. Running with synchronized local JSON persistence fallback.'
    );
    return false;
  }

  if (mongoose.connection.readyState === 1) {
    return true;
  }

  try {
    connectionStatus.state = 'connecting';
    await mongoose.connect(uri, {
      dbName: ENV.MONGODB_DB_NAME || 'lovanstrix',
      serverSelectionTimeoutMS: 6000,
    });
    return true;
  } catch (err) {
    connectionStatus = {
      configured: true,
      connected: false,
      state: 'fallback-json-store',
      lastConnectedAt: null,
      error: err?.message || 'Unable to connect to MongoDB',
    };
    console.warn(
      '[MongoDB] Could not establish MongoDB connection; falling back to local JSON store:',
      err?.message || err
    );
    return false;
  }
}

export async function disconnectDatabase() {
  if (mongoose.connection.readyState !== 0) {
    await mongoose.disconnect();
  }
}

export function isMongoConnected() {
  return mongoose.connection.readyState === 1;
}

export function getDatabaseHealth() {
  const readyStateMap = {
    0: 'disconnected',
    1: 'connected',
    2: 'connecting',
    3: 'disconnecting',
  };

  return {
    configured: Boolean(ENV.MONGODB_URI),
    connected: mongoose.connection.readyState === 1,
    readyState: readyStateMap[mongoose.connection.readyState] || connectionStatus.state,
    mode: mongoose.connection.readyState === 1 ? 'mongodb' : 'json-store-fallback',
    lastConnectedAt: connectionStatus.lastConnectedAt,
    message: !ENV.MONGODB_URI
      ? 'MONGODB_URI not set in environment; using local JSON store fallback.'
      : mongoose.connection.readyState === 1
      ? 'Connected to MongoDB.'
      : connectionStatus.error || 'MongoDB unavailable; using local JSON store fallback.',
  };
}
