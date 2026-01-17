# حماية لوحة التحكم - Admin Security

## نظرة عامة

تم تنفيذ نظام حماية متعدد الطبقات للوحة التحكم لمنع الوصول غير المصرح به إلى صفحات الأدمن.

## طبقات الحماية

### 1. Middleware Protection (الطبقة الأولى)
**الملف:** `middleware.ts`

- يعترض جميع الطلبات إلى `/admin/*` ما عدا `/admin/auth`
- يتحقق من وجود session cookie (`__session`)
- يعيد التوجيه إلى صفحة تسجيل الدخول إذا لم يكن هناك session

**الفوائد:**
- حماية على مستوى الخادم قبل تحميل أي صفحة
- منع الوصول المباشر عبر URL
- أداء عالي لعدم الحاجة لتحميل React

### 2. Client-Side Hook Protection (الطبقة الثانية)
**الملف:** `src/hooks/use-admin-auth.ts`

- يتحقق من صلاحيات المستخدم بعد تحميل الصفحة
- يتحقق من Custom Claims في Firebase
- يتحقق من role في Firestore كـ fallback
- ينشئ session cookie تلقائياً بعد تسجيل الدخول

**الاستخدام:**
```tsx
'use client';

import { useAdminAuth } from '@/hooks/use-admin-auth';

export default function AdminPage() {
  const { isAdmin, isLoading } = useAdminAuth();

  if (isLoading) return <div>جاري التحميل...</div>;
  if (!isAdmin) return null; // سيتم إعادة التوجيه تلقائياً

  return <div>محتوى الأدمن</div>;
}
```

### 3. Server-Side Guards (الطبقة الثالثة)
**الملف:** `src/lib/server-admin-guard.ts`

دوال للحماية على مستوى Server Components:

```tsx
import { requireAdminAuth } from '@/lib/server-admin-guard';

export default async function AdminPage() {
  // يعيد التوجيه تلقائياً إذا لم يكن أدمن
  const user = await requireAdminAuth();

  return <div>مرحباً {user.email}</div>;
}
```

### 4. API Routes Protection
**الملفات:** 
- `src/app/api/admin/verify-auth/route.ts` - التحقق من الصلاحيات
- `src/app/api/admin/create-session/route.ts` - إنشاء session
- `src/app/api/admin/clear-session/route.ts` - حذف session

**مثال على حماية API:**
```typescript
import { checkAdminAuth } from '@/lib/server-admin-guard';

export async function POST(request: Request) {
  const { isAdmin } = await checkAdminAuth();
  
  if (!isAdmin) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
  }

  // منطق الـ API
}
```

## آلية عمل Session Cookies

### إنشاء Session
1. المستخدم يسجل دخول عبر Firebase Auth
2. يتم الحصول على ID Token
3. يتم إرسال ID Token إلى `/api/admin/create-session`
4. يتم إنشاء session cookie صالح لـ 5 أيام
5. يتم تخزين الـ cookie في المتصفح

### التحقق من Session
1. Middleware يتحقق من وجود `__session` cookie
2. `useAdminAuth` يتحقق من صلاحيات الأدمن
3. يتم التحقق من Custom Claims أو Firestore

### حذف Session
1. عند تسجيل الخروج، يتم استدعاء `/api/admin/clear-session`
2. يتم حذف الـ cookie
3. يتم تسجيل الخروج من Firebase
4. إعادة التوجيه إلى `/admin/auth`

## صلاحيات الأدمن

### Custom Claims (الطريقة المفضلة)
يتم تعيين `admin: true` في Custom Claims عبر Firebase Admin SDK:

```typescript
await auth.setCustomUserClaims(uid, { admin: true });
```

### Firestore Role (Fallback)
في حالة عدم وجود Custom Claims، يتم التحقق من:

```typescript
{
  users: {
    [uid]: {
      role: "admin"
    }
  }
}
```

## المسارات المحمية

### محمية بالكامل:
- `/admin/dashboard`
- `/admin/doctors`
- `/admin/bookings`
- `/admin/invitations`
- `/admin/lab-tests`
- `/admin/nursing`
- `/admin/physiotherapy`
- `/admin/surgery`
- `/admin/manage-admins`

### غير محمية (للوصول العام):
- `/admin/auth` - صفحة تسجيل الدخول

## اختبار الحماية

### اختبار 1: الوصول بدون تسجيل دخول
1. افتح متصفح Incognito
2. اذهب إلى `http://localhost:3000/admin/dashboard`
3. **النتيجة المتوقعة:** إعادة توجيه إلى `/admin/auth`

### اختبار 2: الوصول بحساب عادي (ليس أدمن)
1. سجل دخول بحساب عادي
2. اذهب إلى `http://localhost:3000/admin/dashboard`
3. **النتيجة المتوقعة:** إعادة توجيه إلى `/admin/auth` مع رسالة خطأ

### اختبار 3: الوصول بحساب أدمن
1. سجل دخول بحساب أدمن
2. اذهب إلى `http://localhost:3000/admin/dashboard`
3. **النتيجة المتوقعة:** الوصول الكامل للوحة التحكم

### اختبار 4: Session Expiration
1. سجل دخول كأدمن
2. احذف `__session` cookie من DevTools
3. حدث الصفحة
4. **النتيجة المتوقعة:** إعادة توجيه إلى `/admin/auth`

## الملفات المضافة/المعدلة

### ملفات جديدة:
1. `middleware.ts` - حماية على مستوى Next.js
2. `src/app/api/admin/verify-auth/route.ts` - التحقق من الصلاحيات
3. `src/app/api/admin/create-session/route.ts` - إنشاء session
4. `src/app/api/admin/clear-session/route.ts` - حذف session
5. `src/lib/server-admin-guard.ts` - دوال الحماية للـ Server Components
6. `src/lib/admin-auth-utils.ts` - دوال مساعدة للمصادقة
7. `src/app/admin/layout.tsx` - Layout للأدمن

### ملفات معدلة:
1. `src/hooks/use-admin-auth.ts` - إعادة تفعيل التحقق من الصلاحيات

## الأمان

### ✅ تم تنفيذه:
- [x] Middleware protection
- [x] Client-side guards
- [x] Server-side guards
- [x] Session cookies (HTTP-only)
- [x] Custom Claims verification
- [x] Firestore role verification
- [x] Secure cookie settings (في Production)

### 🔐 أفضل الممارسات:
- استخدام HTTP-only cookies لمنع XSS attacks
- استخدام Secure cookies في Production
- التحقق من الصلاحيات على مستوى الخادم والعميل
- Session expiration (5 أيام)
- Token verification قبل كل عملية حساسة

## الاستكشاف والإصلاح

### المشكلة: إعادة توجيه مستمرة
**الحل:**
1. تحقق من وجود `__session` cookie
2. تحقق من صلاحية الـ token
3. تحقق من صلاحيات الأدمن في Firestore

### المشكلة: Session تنتهي بسرعة
**الحل:**
1. تحقق من إعدادات `expiresIn` في `create-session/route.ts`
2. تحقق من إعدادات الـ cookie في المتصفح

### المشكلة: Custom Claims لا تعمل
**الحل:**
1. تحقق من تشغيل `/api/admin/setup-claim` بعد التسجيل
2. انتظر دقيقة وسجل دخول مرة أخرى
3. تحقق من Firebase Console -> Authentication -> Users

## الدعم والمساعدة

للمزيد من المعلومات أو الإبلاغ عن مشاكل أمنية، يرجى التواصل مع فريق التطوير.
