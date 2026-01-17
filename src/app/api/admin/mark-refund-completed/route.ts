import { NextRequest, NextResponse } from 'next/server';
import { auth as adminAuth, db } from '@/firebase/admin';

/**
 * API لتأكيد إتمام عملية الاسترجاع
 * - يتحقق من أن المستخدم أدمن
 * - يحدث حالة refundStatus في الحجز
 */
export async function POST(request: NextRequest) {
  try {
    // 1. التحقق من المصادقة
    const authHeader = request.headers.get('Authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      console.error('No authorization header');
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
      console.error('Invalid token:', error);
      return NextResponse.json(
        { error: 'رمز غير صالح' },
        { status: 401 }
      );
    }

    // 2. التحقق من أن المستخدم أدمن
    if (!decodedToken.admin) {
      console.error('User is not admin:', decodedToken.uid);
      return NextResponse.json(
        { error: 'ليس لديك صلاحية أدمن' },
        { status: 403 }
      );
    }

    // 3. الحصول على بيانات الطلب
    const { bookingId, userId, collectionPath } = await request.json();
    console.log('Request data:', { bookingId, userId, collectionPath });

    if (!bookingId) {
      console.error('No bookingId provided');
      return NextResponse.json(
        { error: 'معرّف الحجز مطلوب' },
        { status: 400 }
      );
    }

    // 4. تحديث حالة الاسترجاع في Firestore
    console.log('Using Firestore instance from admin.ts');

    // تحديد المسارات المحتملة للحجز
    const pathsToUpdate: string[] = [];

    if (userId) {
      // حجز في subcollection
      pathsToUpdate.push(`users/${userId}/bookings/${bookingId}`);
    }

    if (collectionPath) {
      // حجز في top-level collection
      pathsToUpdate.push(`${collectionPath}/${bookingId}`);
    }

    if (pathsToUpdate.length === 0) {
      console.error('Neither userId nor collectionPath provided');
      return NextResponse.json(
        { error: 'يجب تحديد userId أو collectionPath' },
        { status: 400 }
      );
    }

    console.log('Paths to update:', pathsToUpdate);

    // 5. تحديث حالة الاسترجاع
    const updateData = {
      refundStatus: {
        status: 'completed',
        message: 'تم استرجاع المبلغ بنجاح',
        completedAt: new Date().toISOString(),
        completedBy: decodedToken.uid,
      },
    };

    console.log('Updating with data:', updateData);

    // تحديث الحجز في كل المسارات الموجودة
    let updatedCount = 0;
    const updateResults: any[] = [];

    for (const docPath of pathsToUpdate) {
      try {
        const bookingRef = db.doc(docPath);
        const bookingSnap = await bookingRef.get();

        if (bookingSnap.exists) {
          console.log(`Found booking at: ${docPath}`);
          console.log('Current data:', bookingSnap.data());

          const updateResult = await bookingRef.update(updateData);
          console.log(`✅ Updated ${docPath} successfully`);
          console.log('Write time:', updateResult?.writeTime?.toDate());

          updatedCount++;
          updateResults.push({ path: docPath, success: true });
        } else {
          console.log(`⚠️ Booking not found at: ${docPath}`);
          updateResults.push({ path: docPath, success: false, reason: 'not found' });
        }
      } catch (updateError) {
        console.error(`❌ Failed to update ${docPath}:`, updateError);
        updateResults.push({ path: docPath, success: false, error: updateError });
      }
    }

    console.log(`Updated ${updatedCount} out of ${pathsToUpdate.length} locations`);
    console.log('Update results:', updateResults);

    if (updatedCount === 0) {
      return NextResponse.json(
        { error: 'الحجز غير موجود في أي مسار' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'تم تأكيد استرجاع المبلغ بنجاح',
    });

  } catch (error) {
    console.error('Error marking refund as completed:', error);
    return NextResponse.json(
      {
        error: 'حدث خطأ أثناء تحديث حالة الاسترجاع',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
