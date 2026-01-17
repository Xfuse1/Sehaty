import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';

/**
 * API endpoint لحذف session cookie عند تسجيل الخروج
 */
export async function POST(request: NextRequest) {
  try {
    // حذف الـ session cookie
    const cookieStore = await cookies();
    cookieStore.delete('__session');

    return NextResponse.json(
      { success: true },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error clearing session:', error);
    return NextResponse.json(
      { error: 'Failed to clear session' },
      { status: 500 }
    );
  }
}
