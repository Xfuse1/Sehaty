import { NextRequest, NextResponse } from 'next/server';
import { getFirestore } from 'firebase-admin/firestore';
import { auth as adminAuth } from '@/firebase/admin';

/**
 * API لإلغاء الحجز
 * - يتحقق من أن المستخدم هو صاحب الحجز
 * - يتحقق من أن الحجز قبله على الأقل 6 ساعات
 * - يعمل refund للدفع Online إن وجد
 */
export async function POST(request: NextRequest) {
  try {
    // 1. التحقق من المصادقة
    const authHeader = request.headers.get('Authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'غير مصرح' },
        { status: 401 }
      );
    }

    const token = authHeader.substring(7);
    let decodedToken;
    try {
      decodedToken = await adminAuth.verifyIdToken(token);
    } catch (error) {
      return NextResponse.json(
        { error: 'رمز غير صالح' },
        { status: 401 }
      );
    }

    const userId = decodedToken.uid;

    // 2. الحصول على بيانات الطلب
    const { bookingId } = await request.json();

    if (!bookingId) {
      return NextResponse.json(
        { error: 'معرّف الحجز مطلوب' },
        { status: 400 }
      );
    }

    // 3. جلب الحجز من Firestore
    const db = getFirestore();
    const bookingRef = db.doc(`users/${userId}/bookings/${bookingId}`);
    const bookingSnap = await bookingRef.get();

    if (!bookingSnap.exists) {
      return NextResponse.json(
        { error: 'الحجز غير موجود' },
        { status: 404 }
      );
    }

    const booking = bookingSnap.data();

    // 4. التحقق من أن الحجز لم يُلغى مسبقاً
    if (booking?.status === 'cancelled' || booking?.status === 'ملغي') {
      return NextResponse.json(
        { error: 'الحجز ملغي بالفعل' },
        { status: 400 }
      );
    }

    // 5. التحقق من المدة الزمنية (6 ساعات على الأقل قبل الموعد)
    const appointmentDate = new Date(booking?.appointmentDate);
    const appointmentTime = booking?.appointmentTime; // مثل "09:00 ص"

    // تحويل الوقت من "09:00 ص" إلى hours و minutes
    let hours = 0;
    let minutes = 0;
    if (appointmentTime) {
      const timeMatch = appointmentTime.match(/(\d+):(\d+)\s*(ص|م)/);
      if (timeMatch) {
        hours = parseInt(timeMatch[1]);
        minutes = parseInt(timeMatch[2]);
        const isPM = timeMatch[3] === 'م';

        // تحويل إلى 24-hour format
        if (isPM && hours !== 12) {
          hours += 12;
        } else if (!isPM && hours === 12) {
          hours = 0;
        }
      }
    }

    appointmentDate.setHours(hours, minutes, 0, 0);

    const now = new Date();
    const timeDiffInHours = (appointmentDate.getTime() - now.getTime()) / (1000 * 60 * 60);

    if (timeDiffInHours < 6) {
      return NextResponse.json(
        {
          error: 'لا يمكن إلغاء الحجز قبل الموعد بأقل من 6 ساعات',
          remainingHours: timeDiffInHours.toFixed(1)
        },
        { status: 400 }
      );
    }

    // 6. إذا كانت طريقة الدفع "online"، نحاول عمل refund
    let refundStatus = null;
    if (booking?.paymentMethod === 'online') {
      try {
        // TODO: تنفيذ Kashier Refund API
        // const refundResult = await refundKashierPayment(booking.orderId, booking.fee);
        // refundStatus = refundResult;

        // مؤقتاً، نسجل الطلب في حقل خاص
        refundStatus = {
          status: 'pending',
          message: 'تم تسجيل طلب الاسترداد، سيتم معالجته خلال 3-5 أيام عمل',
          requestedAt: new Date().toISOString(),
        };
      } catch (error) {
        console.error('Refund error:', error);
        // نستمر في الإلغاء حتى لو فشل الـ refund
        refundStatus = {
          status: 'failed',
          message: 'فشل طلب الاسترداد، يرجى التواصل مع الدعم',
          error: error instanceof Error ? error.message : 'Unknown error',
        };
      }
    }

    // 7. تحديث حالة الحجز
    await bookingRef.update({
      status: 'cancelled',
      cancelledAt: new Date().toISOString(),
      cancelledBy: userId,
      refundStatus: refundStatus,
    });

    return NextResponse.json({
      success: true,
      message: 'تم إلغاء الحجز بنجاح',
      refund: refundStatus,
    });

  } catch (error) {
    console.error('Error cancelling booking:', error);
    return NextResponse.json(
      {
        error: 'حدث خطأ أثناء إلغاء الحجز',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
