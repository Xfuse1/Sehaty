import { initializeApp, applicationDefault, cert, getApps } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore } from 'firebase-admin/firestore';

// Initialize Firebase Admin (modular API)
let app: any;

try {
    const apps = getApps();
    if (apps && apps.length) {
        app = apps[0];
    } else {
        const raw = process.env.FIREBASE_SERVICE_ACCOUNT_KEY;
        let serviceAccount = null;

        if (raw) {
            try {
                // التعامل مع الأسطر الجديدة إذا كانت موجودة كـ \n نصي
                const processedRaw = raw.replace(/\\n/g, '\n');
                serviceAccount = JSON.parse(processedRaw);
            } catch (err) {
                console.error('Failed to parse FIREBASE_SERVICE_ACCOUNT_KEY:', err);
            }
        }

        if (serviceAccount && serviceAccount.project_id) {
            app = initializeApp({
                credential: cert(serviceAccount),
            });
        } else if (process.env.GOOGLE_APPLICATION_CREDENTIALS) {
            app = initializeApp({
                credential: applicationDefault(),
            });
        } else {
            // في Vercel، قد يعمل initializeApp() بدون وسائط إذا كانت البيئة مهيأة مسبقاً (Firebase App Hosting)
            // ولكننا سنحاول تهيئته بشكل افتراضي كحل أخير
            try {
                app = initializeApp();
            } catch (initErr) {
                console.error('Firebase Admin final fallback failed:', initErr);
                throw new Error('Firebase admin not configured properly.');
            }
        }
    }
} catch (e) {
    console.error('Firebase Admin Initialization Error:', e);
    throw e;
}

export const db = getFirestore(app);
export const auth = getAuth(app);