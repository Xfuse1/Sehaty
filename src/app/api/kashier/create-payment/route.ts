import { NextResponse } from 'next/server';
import crypto from 'crypto';
// Read env vars directly to avoid a missing env wrapper module
const env = {
  KASHIER_MERCHANT_ID: process.env.KASHIER_MERCHANT_ID,
  KASHIER_API_KEY: process.env.KASHIER_API_KEY,
  KASHIER_CURRENCY: process.env.KASHIER_CURRENCY,
  KASHIER_WEBHOOK_URL: process.env.KASHIER_WEBHOOK_URL,
};

type CreatePaymentRequest = {
  amount: number | string;
  currency?: string;
  orderId: string;
  description?: string;
  merchantRedirect?: string; // success redirect
  failureRedirect?: string; // failure redirect
  serverWebhook?: string; // optional override for webhook URL
  metadata?: Record<string, any>;
};

export async function POST(req: Request) {
  try {
    const body: CreatePaymentRequest = await req.json();

  const merchantId = env.KASHIER_MERCHANT_ID;
  const apiKey = env.KASHIER_API_KEY; // used for hash generation
    const currency = body.currency || env.KASHIER_CURRENCY || 'EGP';
    const amount = typeof body.amount === 'string' ? body.amount : String(body.amount);
    const orderId = body.orderId;

    if (!merchantId || !apiKey || !orderId || !amount) {
      console.error('Missing env or params', { merchantId: !!merchantId, apiKey: !!apiKey, orderId, amount });
      return NextResponse.json({ error: 'Missing required parameters or configuration' }, { status: 400 });
    }

    // Build path used for hash generation according to Kashier docs
    // path = `/?payment=${mid}.${orderId}.${amount}.${currency}${CustomerReference ? '.' + CustomerReference : ''}`
    // We don't use CustomerReference here. If you need it, include it in metadata.customerReference
    const path = `/?payment=${merchantId}.${orderId}.${amount}.${currency}`;
    const hash = crypto.createHmac('sha256', apiKey).update(path).digest('hex');

    const mode = process.env.KASHIER_MODE || 'live';

    const params = new URLSearchParams({
      merchantId,
      orderId,
      amount,
      currency,
      hash,
      mode,
    });

    if (body.merchantRedirect) params.set('merchantRedirect', body.merchantRedirect);
    if (body.failureRedirect) params.set('failureRedirect', body.failureRedirect);
    const serverWebhook = body.serverWebhook || env.KASHIER_WEBHOOK_URL;
    if (serverWebhook) params.set('serverWebhook', serverWebhook);

    // Optional metadata and description
    if (body.description) params.set('description', String(body.description));
    if (body.metadata) params.set('metaData', JSON.stringify(body.metadata));

    const checkoutUrl = `https://payments.kashier.io/?${params.toString()}`;

    return NextResponse.json({ checkoutUrl });
  } catch (err) {
    console.error('create-payment error', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
