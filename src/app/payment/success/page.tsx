"use client";

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { CheckCircle } from 'lucide-react';

export default function PaymentSuccess() {
  const router = useRouter();
  const [pending, setPending] = useState<string | null>(null);

  useEffect(() => {
    try {
      const p = localStorage.getItem('pendingPayment');
      if (p) {
        const obj = JSON.parse(p);
        setPending(obj.orderId || null);
      }
    } catch (e) {
      // ignore
    }
  }, []);

  return (
    <div className="container py-24 text-center">
      <CheckCircle className="mx-auto h-20 w-20 text-green-500" />
      <h1 className="mt-6 text-2xl font-bold">تم الدفع بنجاح</h1>
      <p className="mt-2 text-muted-foreground">شكرًا لك! سنقوم بتأكيد الحجز قريبًا.</p>
      {pending && <p className="mt-4 text-sm">رقم الطلب: <strong>{pending}</strong></p>}
      <div className="mt-6 flex justify-center gap-4">
        <button className="btn" onClick={() => router.push('/my-bookings')}>عرض حجوزاتي</button>
        <button className="btn btn-outline" onClick={() => router.push('/')}>العودة للرئيسية</button>
      </div>
    </div>
  );
}
