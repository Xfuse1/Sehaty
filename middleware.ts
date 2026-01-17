import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// المسارات التي تتطلب مصادقة الأدمن
const ADMIN_PATHS = ['/admin'];
// المسارات المستثناة من التحقق (صفحة تسجيل الدخول)
const EXCLUDED_ADMIN_PATHS = ['/admin/auth'];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // التحقق إذا كان المسار يتطلب مصادقة أدمن
  const isAdminPath = ADMIN_PATHS.some((path) => pathname.startsWith(path));
  const isExcludedPath = EXCLUDED_ADMIN_PATHS.some((path) =>
    pathname.startsWith(path)
  );

  if (isAdminPath && !isExcludedPath) {
    // الحصول على session token من cookies
    const sessionCookie = request.cookies.get('__session')?.value;

    // إذا لم يكن هناك session، إعادة التوجيه لصفحة تسجيل الدخول
    if (!sessionCookie) {
      const url = request.nextUrl.clone();
      url.pathname = '/admin/auth';
      url.searchParams.set('redirect', pathname);
      return NextResponse.redirect(url);
    }

    // ملاحظة: التحقق الفعلي من الصلاحيات يتم في useAdminAuth hook
    // و server-side guards لتجنب استدعاء API من middleware
  }

  return NextResponse.next();
}

// تحديد المسارات التي سيتم تطبيق الـ middleware عليها
export const config = {
  matcher: [
    /*
     * تطبيق على جميع المسارات عدا:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!api|_next/static|_next/image|favicon.ico|.*\\..*|images).*)',
  ],
};
