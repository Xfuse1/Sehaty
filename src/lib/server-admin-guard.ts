import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { auth } from '@/firebase/admin';

/**
 * Server-side guard للتحقق من صلاحيات الأدمن
 * يستخدم في Server Components لحماية الصفحات
 */
export async function requireAdminAuth() {
  try {
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get('__session')?.value;

    if (!sessionCookie) {
      redirect('/admin/auth');
    }

    // التحقق من صحة الـ token
    let decodedToken;
    try {
      decodedToken = await auth.verifySessionCookie(sessionCookie, true);
    } catch (error) {
      // إذا فشل التحقق من session cookie، محاولة التحقق من ID token
      try {
        decodedToken = await auth.verifyIdToken(sessionCookie);
      } catch (idTokenError) {
        redirect('/admin/auth');
      }
    }

    // التحقق من صلاحيات الأدمن
    const isAdmin = !!decodedToken.admin;

    if (!isAdmin) {
      redirect('/admin/auth');
    }

    return {
      uid: decodedToken.uid,
      email: decodedToken.email,
    };
  } catch (error) {
    console.error('Error in requireAdminAuth:', error);
    redirect('/admin/auth');
  }
}

/**
 * التحقق من صلاحيات الأدمن بدون redirect
 * مفيد للحالات التي تحتاج التحقق فقط
 */
export async function checkAdminAuth(): Promise<{ isAdmin: boolean; uid?: string }> {
  try {
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get('__session')?.value;

    if (!sessionCookie) {
      return { isAdmin: false };
    }

    let decodedToken;
    try {
      decodedToken = await auth.verifySessionCookie(sessionCookie, true);
    } catch (error) {
      try {
        decodedToken = await auth.verifyIdToken(sessionCookie);
      } catch (idTokenError) {
        return { isAdmin: false };
      }
    }

    const isAdmin = !!decodedToken.admin;

    return {
      isAdmin,
      uid: isAdmin ? decodedToken.uid : undefined,
    };
  } catch (error) {
    console.error('Error in checkAdminAuth:', error);
    return { isAdmin: false };
  }
}
