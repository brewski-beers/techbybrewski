import { initializeApp, getApps, cert, App, applicationDefault } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import { getFirestore } from "firebase-admin/firestore";

function getAdminApp(): App {
  if (getApps().length > 0) return getApps()[0];

  const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
  const rawKey = process.env.FIREBASE_SERVICE_ACCOUNT_KEY;
  const isEmulator = Boolean(process.env.FIRESTORE_EMULATOR_HOST);

  if (rawKey) {
    // Explicit service account key (CI or local key file)
    return initializeApp({ credential: cert(JSON.parse(rawKey)), projectId });
  }

  if (isEmulator) {
    // Emulator bypasses auth — just needs a project ID
    return initializeApp({ projectId });
  }

  // Firebase App Hosting: Application Default Credentials from the managed runtime
  return initializeApp({ credential: applicationDefault(), projectId });
}

const adminApp = getAdminApp();

export const adminAuth = getAuth(adminApp);
export const adminDb = getFirestore(adminApp);
