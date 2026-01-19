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
                // أولاً: محاولة التحليل المباشر (للحالات التي يكون فيها الـ JSON سليماً وسطر واحد)
                serviceAccount = JSON.parse(raw);
            } catch (err) {
                // ثانياً: إذا فشل، فقد يكون السبب وجود أسطر جديدة حقيقية (شائع في Vercel)
                // سنحاول معالجة الأسطر الجديدة داخل قيم النصوص فقط
                try {
                    // هذا التعبير يحاول العثور على الـ private_key واستبدال الأسطر الحقيقية بـ \n
                    const fixedRaw = raw.replace(/\n/g, '\\n');
                    // ثم نحاول التحليل مرة أخرى. ملاحظة: قد يكسر هذا الـ JSON إذا كان الـ JSON منسقاً بأسطر سابقة
                    // لذا سنحاول تنظيفه أكثر
                    serviceAccount = JSON.parse(fixedRaw);
                } catch (err2) {
                    console.error('Firebase Admin: Failed to parse even after cleanup.');
                }
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
            // المحاولة كـ Default (قد تعمل في بعض بيئات Google Cloud/Firebase)
            try {
                app = initializeApp();
            } catch (initErr) {
                console.error('Firebase Admin: No credentials found and fallback failed.');
                throw new Error('Firebase admin not configured. Please check your FIREBASE_SERVICE_ACCOUNT_KEY environment variable.');
            }
        }
    }
} catch (e) {
    console.error('Core Firebase Admin Init Error:', e);
    throw e;
}

export const db = getFirestore(app);
export const auth = getAuth(app);