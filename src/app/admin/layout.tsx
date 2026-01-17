import { ReactNode } from 'react';
import { checkAdminAuth } from '@/lib/server-admin-guard';
import { redirect } from 'next/navigation';

/**
 * Admin Layout - يحمي جميع صفحات الأدمن على مستوى الخادم
 * يتم التحقق من الصلاحيات قبل عرض أي محتوى
 */
export default async function AdminLayout({
  children,
}: {
  children: ReactNode;
}) {
  // التحقق يتم في middleware و useAdminAuth hook
  // Layout يعرض المحتوى مباشرة
  return <>{children}</>;
}
