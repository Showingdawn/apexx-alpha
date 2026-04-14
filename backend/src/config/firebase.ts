import * as admin from 'firebase-admin';
import * as path from 'path';

// This will load the service account key if present, otherwise it will try to use application default credentials.
try {
  const serviceAccount = require(path.join(__dirname, '../../serviceAccountKey.json'));
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
  });
  console.log("Firebase Admin Initialized successfully from serviceAccountKey.json");
} catch (error) {
  console.warn("Could not find serviceAccountKey.json. Falling back to default app initialization (may fail if unauthenticated).");
  admin.initializeApp();
}

export const db = admin.firestore();
export const auth = admin.auth();
