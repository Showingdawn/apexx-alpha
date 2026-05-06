import * as admin from 'firebase-admin';
import * as path from 'path';

// This will load the service account key if present, otherwise it will try to use explicit recovery config.
try {
  const serviceAccount = require(path.join(__dirname, '../../serviceAccountKey.json'));
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    projectId: serviceAccount.project_id || 'apex-alpha-sovereign'
  });
  console.log("Firebase Admin Initialized successfully from serviceAccountKey.json");
} catch (error) {
  console.warn("Could not find serviceAccountKey.json. Applying Sovereign Recovery Initialization.");
  // Explicitly provide projectId to prevent "Unable to detect a Project Id" errors
  admin.initializeApp({
    projectId: process.env.FIREBASE_PROJECT_ID || 'apex-alpha-sovereign'
  });
}

export const db = admin.firestore();
export const auth = admin.auth();
