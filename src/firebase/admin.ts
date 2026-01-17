import { initializeApp, applicationDefault, cert, getApps } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore } from 'firebase-admin/firestore';

// Initialize Firebase Admin (modular API)
let app: any;

try {
    const apps = getApps();
    app = apps && apps.length ? apps[0] : initializeApp();
} catch (e) {
    const raw = process.env.FIREBASE_SERVICE_ACCOUNT_KEY || '';
    let serviceAccount: Record<string, any> | null = null;

    try {
        serviceAccount = raw ? JSON.parse(raw) : null;
    } catch (err) {
        // fallthrough - we'll try other credentials below
    }

    if (serviceAccount && typeof serviceAccount.project_id === 'string') {
        app = initializeApp({
            credential: cert(serviceAccount as any),
        });
    } else if (process.env.GOOGLE_APPLICATION_CREDENTIALS) {
        app = initializeApp({
            credential: applicationDefault(),
        });
    } else {
        throw new Error(
            'Firebase admin not configured. Set FIREBASE_SERVICE_ACCOUNT_KEY (JSON) or GOOGLE_APPLICATION_CREDENTIALS (path to JSON file) in your environment.'
        );
    }
}

export const db = getFirestore(app);
export const auth = getAuth(app);