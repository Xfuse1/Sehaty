"use client"

import { useEffect, useState, useRef } from "react";
import { useRouter, usePathname } from "next/navigation";
import { User } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { useUser, useFirestore } from "@/firebase";

interface AdminAuthState {
  user: User | null;
  isAdmin: boolean;
  isLoading: boolean;
  error: Error | null;
}

/**
 * Hook للتحقق من صلاحيات الأدمن
 * يتحقق من أن المستخدم مسجل دخول ولديه صلاحيات admin
 *
 * @param redirectIfNotAdmin - إذا كان true، سيتم إعادة التوجيه إلى /admin/auth إذا لم يكن المستخدم أدمن
 * @returns حالة المصادقة للأدمن
 */
export function useAdminAuth(redirectIfNotAdmin: boolean = true): AdminAuthState {
  const { user, isUserLoading } = useUser();
  const firestore = useFirestore();
  const router = useRouter();
  const pathname = usePathname();
  const [state, setState] = useState<AdminAuthState>({
    user: null,
    isAdmin: false,
    isLoading: true,
    error: null,
  });

  // Use ref to track if we've already redirected to prevent infinite loops
  const hasRedirectedRef = useRef(false);
  const isCheckingRef = useRef(false);

  useEffect(() => {
    let isMounted = true;

    async function checkAdminStatus() {
      // الانتظار حتى ينتهي Firebase من تحميل حالة المستخدم
      if (isUserLoading) {
        return;
      }

      // إذا لم يكن هناك مستخدم مسجل دخول
      if (!user) {
        if (isMounted) {
          setState({
            user: null,
            isAdmin: false,
            isLoading: false,
            error: null,
          });

          // إعادة التوجيه إذا كان مطلوباً
          if (redirectIfNotAdmin && pathname !== "/admin/auth" && !hasRedirectedRef.current) {
            hasRedirectedRef.current = true;
            router.push("/admin/auth");
          }
        }
        isCheckingRef.current = false;
        return;
      }

      // ... rest of the logic ...
      isCheckingRef.current = true;

      try {
        const idTokenResult = await user.getIdTokenResult(true);

        try {
          await fetch("/api/admin/create-session", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ idToken: idTokenResult.token }),
          });
        } catch (sessionError) {
          console.error("Error creating session:", sessionError);
        }

        let isAdmin = !!idTokenResult.claims.admin;

        if (!isAdmin && firestore) {
          try {
            const userDocRef = doc(firestore, "users", user.uid);
            const userDoc = await getDoc(userDocRef);
            const userData = userDoc.data();
            if (userData?.role === "admin") isAdmin = true;
          } catch (firestoreError) {
            console.error("Error checking Firestore:", firestoreError);
          }
        }

        if (isMounted) {
          setState({
            user,
            isAdmin,
            isLoading: false,
            error: null,
          });

          if (!isAdmin && redirectIfNotAdmin && pathname !== "/admin/auth" && !hasRedirectedRef.current) {
            hasRedirectedRef.current = true;
            router.push("/admin/auth");
          }
        }
      } catch (error) {
        console.error("Error checking admin status:", error);
        if (isMounted) {
          setState({
            user,
            isAdmin: false,
            isLoading: false,
            error: error instanceof Error ? error : new Error("Unknown error"),
          });

          if (redirectIfNotAdmin && pathname !== "/admin/auth" && !hasRedirectedRef.current) {
            hasRedirectedRef.current = true;
            router.push("/admin/auth");
          }
        }
      }
      isCheckingRef.current = false;
    }

    checkAdminStatus();

    return () => {
      isMounted = false;
    };
  }, [user?.uid, isUserLoading, redirectIfNotAdmin, pathname]);

  return state;
}

/**
 * Hook للحصول على حالة الأدمن فقط بدون إعادة توجيه
 * مفيد للمكونات التي تريد إظهار/إخفاء محتوى بناءً على حالة الأدمن
 */
export function useIsAdmin(): { isAdmin: boolean; isLoading: boolean } {
  const { isAdmin, isLoading } = useAdminAuth(false);
  return { isAdmin, isLoading };
}
