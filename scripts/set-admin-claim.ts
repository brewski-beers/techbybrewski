import { initializeApp, cert, applicationDefault } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";

const isEmulator = !!process.env.FIREBASE_AUTH_EMULATOR_HOST;

if (isEmulator) {
  initializeApp({ projectId: "techbybrewski-site" });
} else {
  const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY ?? "{}");
  initializeApp({ credential: cert(serviceAccount) });
}

const auth = getAuth();
const uid = process.argv[2];

if (!uid) {
  console.error("Usage: npx ts-node scripts/set-admin-claim.ts <uid>");
  process.exit(1);
}

auth
  .setCustomUserClaims(uid, { admin: true })
  .then(() => console.log(`Set admin: true on UID ${uid}`))
  .catch(console.error);
