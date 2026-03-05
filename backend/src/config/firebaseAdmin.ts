import admin from "firebase-admin";

if (!admin.apps.length) {
  admin.initializeApp({
    // In production, prefer a service account JSON loaded from env:
    // credential: admin.credential.cert(JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_JSON!)),
    // For local development, applicationDefault can use gcloud credentials.
    credential: admin.credential.applicationDefault()
  });
}

export const firestore = admin.firestore();
export const auth = admin.auth();

export default admin;
