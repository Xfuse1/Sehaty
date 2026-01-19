import { NextRequest, NextResponse } from 'next/server';
import { getFirestore } from 'firebase-admin/firestore';
import { auth as adminAuth } from '@/firebase/admin';

/**
 * API لإلغاء الحجز
 * - يتحقق من أن المستخدم هو صاحب الحجز
 * - يتحقق من أن الحجز في حالة pending (لم يتم تأكيده بعد)
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

    // قائمة بالمسارات المحتملة للحجز
    const possiblePaths = [
      `users/${userId}/bookings/${bookingId}`,
      `bookings/${bookingId}`,
      `doctor_bookings/${bookingId}`,
      `physiotherapy_bookings/${bookingId}`,
      `nursing_care_bookings/${bookingId}`
    ];

    let bookingSnap = null;
    let mainBookingRef = null;

    for (const path of possiblePaths) {
      const ref = db.doc(path);
      const snap = await ref.get();
      if (snap.exists) {
        const data = snap.data();

        // التحقق من الملكية بطرق مختلفة:
        // 1. إذا كان المسار يبدأ بـ users/{userId} فهو بالتأكيد يخص المستخدم
        const isUserSubcollection = path.startsWith(`users/${userId}/`);

        // 2. إذا كان الحقل userId أو uid يطابق userId الحالي
        const matchesUserField = (data?.userId === userId || data?.uid === userId);

        if (isUserSubcollection || matchesUserField) {
          bookingSnap = snap;
          mainBookingRef = ref;
          break;
        }
      }
    }

    if (!bookingSnap || !mainBookingRef) {
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

    // 4.5. التحقق من أن الحجز في حالة pending فقط (يمكن الإلغاء فقط عندما يكون pending)
    const isPending = booking?.status === 'pending' || booking?.status === 'pending_confirmation';
    if (!isPending) {
      return NextResponse.json(
        { error: 'لا يمكن إلغاء الحجز إلا عندما يكون في انتظار التأكيد' },
        { status: 400 }
      );
    }

    // 5. إذا كانت طريقة الدفع "online"، نحاول عمل refund
    let refundStatus = null;
    if (booking?.paymentMethod === 'online') {
      try {
        // TODO: تنفيذ Kashier Refund API
        // const refundResult = await refundKashierPayment(booking.orderId, booking.fee);

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

    // 6. تحديث حالة الحجز في كل المواقع الممكنة لضمان التزامن
    const updateData = {
      status: 'cancelled',
      cancelledAt: new Date().toISOString(),
      cancelledBy: userId,
      refundStatus: refundStatus,
    };

    // نحاول تحديث الحجز في كل المواقع الممكنة لضمان التزامن الكامل
    const updatePromises = possiblePaths.map(path =>
      db.doc(path).update(updateData).catch(() => {
        // نتجاهل الأخطاء للمسارات غير الموجودة
      })
    );

    await Promise.all(updatePromises);

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
