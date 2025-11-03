"use client";

import { useRouter } from 'next/navigation';
import { XCircle } from 'lucide-react';

export default function PaymentFailure() {
  const router = useRouter();

  return (
    <div className="container py-24 text-center">
      <XCircle className="mx-auto h-20 w-20 text-red-500" />
      <h1 className="mt-6 text-2xl font-bold">فشل في عملية الدفع</h1>
      <p className="mt-2 text-muted-foreground">لم يتم إتمام الدفع. يمكنك المحاولة مرة أخرى أو التواصل معنا.</p>
      <div className="mt-6 flex justify-center gap-4">
        <button className="btn" onClick={() => router.push('/')}>
          العودة للرئيسية
        </button>
        <button className="btn btn-outline" onClick={() => router.push('/contact')}>
          تواصل معنا
        </button>
      </div>
    </div>
  );
}
