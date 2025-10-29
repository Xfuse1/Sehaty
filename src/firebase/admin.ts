import * as admin from 'firebase-admin';

// Initialize Firebase Admin
let app: admin.app.App;

try {
    app = admin.apps[0] || admin.initializeApp();
} catch {
    const serviceAccount = JSON.parse(
        process.env.FIREBASE_SERVICE_ACCOUNT_KEY || '{}'
    );

    app = admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
    });
}

export const db = admin.firestore(app);
export const auth = admin.auth(app);