"use client";

import { useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';

function RedirectingContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const checkoutUrl = searchParams.get('checkoutUrl');
  const orderId = searchParams.get('orderId');

  useEffect(() => {
    if (!checkoutUrl) return;

    // Save pending payment info so user can check status after returning
    if (orderId) {
      try {
        localStorage.setItem('pendingPayment', JSON.stringify({ orderId, ts: Date.now() }));
      } catch (e) {
        // ignore localStorage errors
      }
    }

    // Redirect after a short delay to show user the state
    const t = setTimeout(() => {
      window.location.href = checkoutUrl;
    }, 600);

    return () => clearTimeout(t);
  }, [checkoutUrl, orderId]);

  if (!checkoutUrl) {
    return (
      <div className="container py-24 text-center">
        <h2 className="text-xl font-bold">لا يوجد رابط للدفع</h2>
        <p className="text-muted-foreground">يرجى العودة والمحاولة مرة أخرى.</p>
        <button className="btn mt-4" onClick={() => router.push('/')}>العودة للصفحة الرئيسية</button>
      </div>
    );
  }

  return (
    <div className="container py-24 text-center">
      <Loader2 className="mx-auto h-12 w-12 animate-spin text-primary" />
      <h2 className="mt-6 text-2xl font-bold">جاري تحويلك لصفحة الدفع...</h2>
      <p className="mt-2 text-muted-foreground">إذا لم يتم تحويلك تلقائيًا، اضغط <a href={checkoutUrl} className="text-primary underline">هنا</a>.</p>
    </div>
  );
}

export default function RedirectingPage() {
  return (
    <Suspense fallback={
      <div className="container py-24 text-center">
        <Loader2 className="mx-auto h-12 w-12 animate-spin text-primary" />
        <h2 className="mt-6 text-2xl font-bold">جاري التحميل...</h2>
      </div>
    }>
      <RedirectingContent />
    </Suspense>
  );
}
