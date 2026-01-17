"use client"

import { ReactNode } from "react"
import { useAdminAuth } from "@/hooks/use-admin-auth"
import { Loader2, Shield, Lock } from "lucide-react"

interface AdminProtectedRouteProps {
  children: ReactNode;
  /**
   * محتوى بديل يُعرض أثناء التحميل
   */
  loadingComponent?: ReactNode;
  /**
   * محتوى بديل يُعرض إذا لم يكن المستخدم أدمن
   */
  unauthorizedComponent?: ReactNode;
}

/**
 * مكون لحماية صفحات الأدمن
 * يتحقق من أن المستخدم مسجل دخول ولديه صلاحيات أدمن
 * إذا لم يكن المستخدم أدمن، يتم إعادة توجيهه إلى /admin/auth
 */
export function AdminProtectedRoute({
  children,
  loadingComponent,
  unauthorizedComponent,
}: AdminProtectedRouteProps) {
  const { isAdmin, isLoading, user } = useAdminAuth(true);

  // أثناء التحميل
  if (isLoading) {
    return (
      loadingComponent || (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50 to-slate-100 dark:from-slate-900 dark:via-blue-950 dark:to-slate-900">
          <div className="text-center space-y-4">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-blue-600 dark:bg-blue-500 animate-pulse">
              <Shield className="w-8 h-8 text-white" />
            </div>
            <div className="space-y-2">
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center justify-center gap-2">
                <Loader2 className="w-6 h-6 animate-spin" />
                جارِ التحقق من الصلاحيات
              </h2>
              <p className="text-slate-600 dark:text-slate-400">
                الرجاء الانتظار...
              </p>
            </div>
          </div>
        </div>
      )
    );
  }

  // إذا لم يكن المستخدم أدمن
  if (!isAdmin || !user) {
    return (
      unauthorizedComponent || (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50 to-slate-100 dark:from-slate-900 dark:via-blue-950 dark:to-slate-900">
          <div className="text-center space-y-4 max-w-md">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-red-600 dark:bg-red-500">
              <Lock className="w-8 h-8 text-white" />
            </div>
            <div className="space-y-2">
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
                غير مصرح
              </h2>
              <p className="text-slate-600 dark:text-slate-400">
                ليس لديك صلاحيات للوصول إلى هذه الصفحة.
              </p>
              <p className="text-sm text-slate-500 dark:text-slate-500">
                جارِ إعادة التوجيه...
              </p>
            </div>
          </div>
        </div>
      )
    );
  }

  // إذا كان المستخدم أدمن، عرض المحتوى
  return <>{children}</>;
}
