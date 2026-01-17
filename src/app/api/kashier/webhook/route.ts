import { NextResponse } from 'next/server';
import crypto from 'crypto';
// Read env vars directly to avoid a missing env wrapper module
const env = {
  KASHIER_SECRET_KEY: process.env.KASHIER_SECRET_KEY,
};

export async function POST(req: Request) {
  try {
    const secret = env.KASHIER_SECRET_KEY; // used to verify signature
    if (!secret) {
      console.error('Missing KASHIER_SECRET_KEY');
      return NextResponse.json({ ok: false, reason: 'server misconfigured' }, { status: 500 });
    }
    const rawBody = await req.text();

    // Kashier may send query params or a body with signature. Try to parse both.
    const url = new URL(req.url);
    const query = Object.fromEntries(url.searchParams.entries());

    // Prefer signature from query (redirects), otherwise check body as JSON with `signature`.
    let signature = query.signature as string | undefined;
    let payload: any = {};
    try {
      payload = rawBody ? JSON.parse(rawBody) : {};
      if (!signature && payload.signature) signature = payload.signature;
    } catch (e) {
      // Not JSON body; leave payload empty
    }

    if (!signature) {
      console.warn('Webhook received without signature');
      return NextResponse.json({ ok: false, reason: 'missing signature' }, { status: 400 });
    }

    // Build verification string: all params except signature and mode joined as &key=value
    const params = { ...query, ...(payload && typeof payload === 'object' ? payload : {}) };
    const pieces: string[] = [];
    Object.keys(params).sort().forEach((k) => {
      if (k === 'signature' || k === 'mode') return;
      pieces.push(`${k}=${params[k]}`);
    });
    const finalUrl = pieces.join('&');

    const computed = crypto.createHmac('sha256', secret).update(finalUrl).digest('hex');
    if (computed !== signature) {
      console.warn('Webhook signature mismatch', { computed, signature });
      return NextResponse.json({ ok: false, reason: 'invalid signature' }, { status: 400 });
    }

    // At this point the webhook is verified. Implement idempotent handling here.
    console.log('Kashier webhook verified', params);

    // Update Firestore with payment status
    try {
      const { firestore } = await import('../../../../firebase/server');

      const orderId = params.orderId || params.merchantOrderId;
      const paymentStatus = params.status || params.paymentStatus;
      const transactionId = params.transactionId || params.paymentId;

      if (!orderId) {
        console.error('Webhook missing orderId', params);
        return NextResponse.json({ ok: false, reason: 'missing orderId' }, { status: 400 });
      }

      // Determine if payment was successful
      const isSuccess = paymentStatus === 'SUCCESS' || paymentStatus === 'CAPTURED' || paymentStatus === 'success';
      const isFailed = paymentStatus === 'FAILED' || paymentStatus === 'CANCELLED' || paymentStatus === 'failed';

      const updateData: any = {
        paymentStatus: isSuccess ? 'paid' : isFailed ? 'failed' : 'pending',
        lastUpdated: new Date().toISOString(),
      };

      if (transactionId) {
        updateData.transactionId = transactionId;
      }

      if (isSuccess) {
        updateData.status = 'confirmed'; // Update booking status to confirmed when payment succeeds
        updateData.paidAt = new Date().toISOString();
      }

      // Try to find and update the booking in physiotherapy_bookings collection
      const physiotherapyRef = firestore.collection('physiotherapy_bookings').doc(orderId);
      const physiotherapyDoc = await physiotherapyRef.get();

      if (physiotherapyDoc.exists) {
        await physiotherapyRef.update(updateData);

        // Also update in user's bookings subcollection
        const bookingData = physiotherapyDoc.data();
        if (bookingData?.userId) {
          const userBookingRef = firestore.collection('users').doc(bookingData.userId)
            .collection('bookings').doc(orderId);
          await userBookingRef.update(updateData).catch((err: any) =>
            console.error('Error updating user booking:', err)
          );
        }

        console.log(`Updated physiotherapy booking ${orderId} with status ${updateData.paymentStatus}`);
        return NextResponse.json({ ok: true });
      }

      // Try nursing_care_bookings collection
      const nursingRef = firestore.collection('nursing_care_bookings').doc(orderId);
      const nursingDoc = await nursingRef.get();

      if (nursingDoc.exists) {
        await nursingRef.update(updateData);

        // Also update in user's bookings subcollection
        const bookingData = nursingDoc.data();
        if (bookingData?.userId) {
          const userBookingRef = firestore.collection('users').doc(bookingData.userId)
            .collection('bookings').doc(orderId);
          await userBookingRef.update(updateData).catch((err: any) =>
            console.error('Error updating user booking:', err)
          );
        }

        console.log(`Updated nursing care booking ${orderId} with status ${updateData.paymentStatus}`);
        return NextResponse.json({ ok: true });
      }

      // Try general bookings collection as fallback
      const generalRef = firestore.collection('bookings').doc(orderId);
      const generalDoc = await generalRef.get();

      if (generalDoc.exists) {
        await generalRef.update(updateData);

        // Also update in user's bookings subcollection
        const bookingData = generalDoc.data();
        if (bookingData?.userId) {
          const userBookingRef = firestore.collection('users').doc(bookingData.userId)
            .collection('bookings').doc(orderId);
          await userBookingRef.update(updateData).catch((err: any) =>
            console.error('Error updating user booking:', err)
          );
        }

        console.log(`Updated general booking ${orderId} with status ${updateData.paymentStatus}`);
        return NextResponse.json({ ok: true });
      }

      console.warn(`Booking ${orderId} not found in any collection`);
      return NextResponse.json({ ok: true, warning: 'booking not found' });

    } catch (error) {
      console.error('Error updating booking status:', error);
      // Still return 200 to avoid Kashier retrying
      return NextResponse.json({ ok: true, warning: 'update failed but acknowledged' });
    }
  } catch (err) {
    console.error('webhook handler error', err);
    return NextResponse.json({ ok: false, error: 'internal' }, { status: 500 });
  }
}
