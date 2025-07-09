
import admin from 'firebase-admin';

// This is sensitive and should be stored securely in environment variables.
const serviceAccount = {
  projectId: process.env.FIREBASE_ADMIN_PROJECT_ID,
  privateKey: process.env.FIREBASE_ADMIN_PRIVATE_KEY?.replace(/\\n/g, '\n'),
  clientEmail: process.env.FIREBASE_ADMIN_CLIENT_EMAIL,
};

let adminDb: admin.firestore.Firestore;
let adminAuth: admin.auth.Auth;

function initializeFirebaseAdmin() {
  const { projectId, privateKey, clientEmail } = serviceAccount;

  // Check if all required service account properties are available and not placeholder values
  if (projectId && privateKey && clientEmail && !projectId.includes('your_') && !clientEmail.includes('your_')) {
    if (!admin.apps.length) {
      try {
        admin.initializeApp({
          credential: admin.credential.cert(serviceAccount as admin.credential.ServiceAccount),
        });
        console.log('Firebase Admin SDK initialized successfully.');
        // If initialization is successful, get the services.
        adminDb = admin.firestore();
        adminAuth = admin.auth();
      } catch (error: any) {
        console.error('Firebase Admin SDK initialization error:', error.stack);
        // If initialization fails, the services will remain undefined.
      }
    } else {
        // If app is already initialized, just get the services
        adminDb = admin.firestore();
        adminAuth = admin.auth();
    }
  } else {
    // This warning is crucial for debugging on Vercel or other platforms.
    console.warn(
      'Firebase Admin credentials are not fully provided or are using placeholder values in your environment variables. ' +
      'Admin-related features (like saving stories, deleting stories, and verifying payments) will be disabled. ' +
      'Please ensure FIREBASE_ADMIN_PROJECT_ID, FIREBASE_ADMIN_PRIVATE_KEY, and FIREBASE_ADMIN_CLIENT_EMAIL are set correctly in your hosting environment.'
    );
  }
}

initializeFirebaseAdmin();

// Export the initialized services. They will be undefined if initialization failed or was skipped.
export { adminDb, adminAuth };
