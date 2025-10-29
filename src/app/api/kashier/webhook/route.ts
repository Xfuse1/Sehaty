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
    // For now, just log the event and return 200.
    console.log('Kashier webhook verified', params);

    // TODO: update Firestore or application DB with payment status using params.orderId / params.paymentId

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error('webhook handler error', err);
    return NextResponse.json({ ok: false, error: 'internal' }, { status: 500 });
  }
}
