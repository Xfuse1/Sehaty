"use client";

import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useState, Suspense } from 'react';
import { XCircle } from 'lucide-react';

function PaymentFailureContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [orderId, setOrderId] = useState<string | null>(null);

  useEffect(() => {
    // Try to get orderId from URL params first
    const orderIdParam = searchParams.get('orderId');
    if (orderIdParam) {
      setOrderId(orderIdParam);
      return;
    }

    // Fallback to localStorage
    try {
      const p = localStorage.getItem('pendingPayment');
      if (p) {
        const obj = JSON.parse(p);
        setOrderId(obj.orderId || null);
      }
    } catch (e) {
      // ignore
    }
  }, [searchParams]);

  return (
    <div className="container py-24 text-center">
      <XCircle className="mx-auto h-20 w-20 text-red-500" />
      <h1 className="mt-6 text-2xl font-bold">فشل في عملية الدفع</h1>
      <p className="mt-2 text-muted-foreground">لم يتم إتمام الدفع. يمكنك المحاولة مرة أخرى أو التواصل معنا.</p>
      {orderId && (
        <div className="mt-4 p-4 bg-muted rounded-lg inline-block">
          <p className="text-sm font-medium">رقم الطلب</p>
          <p className="text-lg font-bold text-primary">{orderId}</p>
          <p className="text-xs text-muted-foreground mt-1">يمكنك استكمال الدفع من خلال حجوزاتي</p>
        </div>
      )}
      <div className="mt-8 flex justify-center gap-4">
        <button className="btn px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary/90" onClick={() => router.push('/my-bookings')}>
          عرض حجوزاتي
        </button>
        <button className="btn btn-outline px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50" onClick={() => router.push('/')}>
          العودة للرئيسية
        </button>
        <button className="btn btn-outline px-6 py-2 border border-green-500 text-green-600 rounded-lg hover:bg-green-50" onClick={() => router.push('/contact')}>
          تواصل معنا
        </button>
      </div>
    </div>
  );
}

export default function PaymentFailure() {
  return (
    <Suspense fallback={
      <div className="container py-24 text-center">
        <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full mx-auto"></div>
      </div>
    }>
      <PaymentFailureContent />
    </Suspense>
  );
}
