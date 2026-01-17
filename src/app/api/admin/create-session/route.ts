import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/firebase/admin';
import { cookies } from 'next/headers';

/**
 * API endpoint لإنشاء session cookie بعد تسجيل الدخول
 * يتم استدعاؤه من جانب العميل بعد تسجيل الدخول بنجاح
 */
export async function POST(request: NextRequest) {
  try {
    const { idToken } = await request.json();

    if (!idToken) {
      return NextResponse.json(
        { error: 'ID token is required' },
        { status: 400 }
      );
    }

    // التحقق من صحة الـ ID token
    const decodedToken = await auth.verifyIdToken(idToken);
    const uid = decodedToken.uid;

    // إنشاء session cookie (صالح لمدة 5 أيام)
    const expiresIn = 60 * 60 * 24 * 5 * 1000; // 5 days
    const sessionCookie = await auth.createSessionCookie(idToken, { expiresIn });

    // تعيين الـ cookie
    const cookieStore = await cookies();
    cookieStore.set('__session', sessionCookie, {
      maxAge: expiresIn,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
    });

    return NextResponse.json(
      {
        success: true,
        uid: uid,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error creating session:', error);
    return NextResponse.json(
      { error: 'Failed to create session' },
      { status: 500 }
    );
  }
}
