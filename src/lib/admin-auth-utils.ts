/**
 * Admin Auth Utilities
 * دوال مساعدة للمصادقة في لوحة التحكم
 */

/**
 * تسجيل الخروج من لوحة التحكم
 * يقوم بحذف session cookie وتسجيل الخروج من Firebase
 */
export async function adminSignOut(auth: any, router: any) {
  try {
    // حذف session cookie
    await fetch("/api/admin/clear-session", {
      method: "POST",
    });

    // تسجيل الخروج من Firebase
    await auth.signOut();

    // إعادة التوجيه لصفحة تسجيل الدخول
    router.push("/admin/auth");
  } catch (error) {
    console.error("Error signing out:", error);
    throw error;
  }
}

/**
 * إنشاء session بعد تسجيل الدخول
 */
export async function createAdminSession(idToken: string): Promise<boolean> {
  try {
    const response = await fetch("/api/admin/create-session", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ idToken }),
    });

    return response.ok;
  } catch (error) {
    console.error("Error creating session:", error);
    return false;
  }
}
