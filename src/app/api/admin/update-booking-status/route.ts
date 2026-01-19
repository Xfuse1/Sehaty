import { NextRequest, NextResponse } from 'next/server';
import { auth as adminAuth, db } from '@/firebase/admin';

/**
 * API لتحديث حالة الحجز
 * - يتحقق من أن المستخدم أدمن
 * - يحدث status في الحجز
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

    // 2. التحقق من أن المستخدم أدمن (من الـ Token أو من الـ Firestore)
    let isAdmin = !!decodedToken.admin;

    if (!isAdmin) {
      const userDoc = await db.collection('users').doc(decodedToken.uid).get();
      if (userDoc.exists && userDoc.data()?.role === 'admin') {
        isAdmin = true;
      }
    }

    if (!isAdmin) {
      return NextResponse.json(
        { error: 'ليس لديك صلاحية أدمن' },
        { status: 403 }
      );
    }

    // 3. الحصول على بيانات الطلب
    const { bookingId, userId, collectionPath, newStatus } = await request.json();

    if (!bookingId || !newStatus) {
      return NextResponse.json(
        { error: 'معرّف الحجز والحالة الجديدة مطلوبان' },
        { status: 400 }
      );
    }

    // التحقق من أن الحالة صالحة
    const validStatuses = ['pending', 'confirmed', 'completed', 'cancelled', 'rejected'];
    if (!validStatuses.includes(newStatus)) {
      return NextResponse.json(
        { error: 'حالة غير صالحة' },
        { status: 400 }
      );
    }

    // 4. تحديد المسارات المحتملة للحجز
    const pathsToUpdate: string[] = [];

    if (userId) {
      pathsToUpdate.push(`users/${userId}/bookings/${bookingId}`);
    }

    if (collectionPath) {
      pathsToUpdate.push(`${collectionPath}/${bookingId}`);
    }

    if (pathsToUpdate.length === 0) {
      return NextResponse.json(
        { error: 'يجب تحديد userId أو collectionPath' },
        { status: 400 }
      );
    }

    // 5. تحديث حالة الحجز في كل المسارات
    const updateData = {
      status: newStatus,
      updatedAt: new Date().toISOString(),
      updatedBy: decodedToken.uid,
    };

    let updatedCount = 0;

    for (const docPath of pathsToUpdate) {
      try {
        const bookingRef = db.doc(docPath);
        const bookingSnap = await bookingRef.get();

        if (bookingSnap.exists) {
          await bookingRef.update(updateData);
          console.log(`✅ Updated status at: ${docPath}`);
          updatedCount++;
        }
      } catch (error) {
        console.error(`❌ Failed to update ${docPath}:`, error);
      }
    }

    if (updatedCount === 0) {
      return NextResponse.json(
        { error: 'الحجز غير موجود في أي مسار' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'تم تحديث حالة الحجز بنجاح',
      newStatus,
    });

  } catch (error) {
    console.error('Error updating booking status:', error);
    return NextResponse.json(
      {
        error: 'حدث خطأ أثناء تحديث حالة الحجز',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
