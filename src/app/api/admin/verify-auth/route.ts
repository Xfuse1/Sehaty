import { NextRequest, NextResponse } from 'next/server';
import { auth, db } from '@/firebase/admin';
import { cookies } from 'next/headers';

/**
 * API endpoint للتحقق من صلاحيات الأدمن
 * يتم استدعاؤه من middleware للتحقق من أن المستخدم لديه صلاحيات أدمن
 */
export async function GET(request: NextRequest) {
  try {
    // الحصول على session token من cookies
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get('__session')?.value;

    if (!sessionCookie) {
      return NextResponse.json(
        { error: 'No session cookie found' },
        { status: 401 }
      );
    }

    // التحقق من صحة الـ token باستخدام Firebase Admin
    let decodedToken;
    try {
      decodedToken = await auth.verifySessionCookie(sessionCookie, true);
    } catch (error) {
      // إذا فشل التحقق من session cookie، محاولة التحقق من ID token
      try {
        decodedToken = await auth.verifyIdToken(sessionCookie);
      } catch (idTokenError) {
        return NextResponse.json(
          { error: 'Invalid or expired session' },
          { status: 401 }
        );
      }
    }

    const uid = decodedToken.uid;

    // التحقق من Custom Claims أولاً
    let isAdmin = !!decodedToken.admin;

    // إذا لم تكن موجودة في Custom Claims، التحقق من Firestore
    if (!isAdmin) {
      try {
        const userDoc = await db.collection('users').doc(uid).get();
        const userData = userDoc.data();

        if (userData?.role === 'admin') {
          isAdmin = true;

          // تعيين Custom Claim للمرات القادمة
          try {
            await auth.setCustomUserClaims(uid, { admin: true });
          } catch (claimError) {
            console.error('Error setting custom claim:', claimError);
          }
        }
      } catch (firestoreError) {
        console.error('Error checking Firestore:', firestoreError);
      }
    }

    if (!isAdmin) {
      return NextResponse.json(
        { error: 'User is not an admin' },
        { status: 403 }
      );
    }

    // المستخدم لديه صلاحيات أدمن
    return NextResponse.json(
      {
        success: true,
        uid: uid,
        isAdmin: true,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error verifying admin auth:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
