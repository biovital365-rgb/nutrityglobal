import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import {
  getPayPalAccessToken,
  parsePayPalCustomId,
  paypalBaseUrl,
  PAYPAL_PLANS,
} from '@/lib/paypal';

type PayPalWebhook = {
  id?: string;
  event_type?: string;
  resource?: {
    custom_id?: string;
    amount?: { currency_code?: string; value?: string };
  };
};

async function verifySignature(req: Request, event: PayPalWebhook) {
  const webhookId = process.env.PAYPAL_WEBHOOK_ID;
  const transmissionId = req.headers.get('paypal-transmission-id');
  const transmissionTime = req.headers.get('paypal-transmission-time');
  const transmissionSig = req.headers.get('paypal-transmission-sig');
  const certUrl = req.headers.get('paypal-cert-url');
  const authAlgo = req.headers.get('paypal-auth-algo');

  if (!webhookId || !transmissionId || !transmissionTime || !transmissionSig || !certUrl || !authAlgo) {
    return false;
  }

  const accessToken = await getPayPalAccessToken();
  const response = await fetch(`${paypalBaseUrl()}/v1/notifications/verify-webhook-signature`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${accessToken}` },
    body: JSON.stringify({
      auth_algo: authAlgo,
      cert_url: certUrl,
      transmission_id: transmissionId,
      transmission_sig: transmissionSig,
      transmission_time: transmissionTime,
      webhook_id: webhookId,
      webhook_event: event,
    }),
    cache: 'no-store',
  });
  if (!response.ok) return false;
  const result = await response.json() as { verification_status?: string };
  return result.verification_status === 'SUCCESS';
}

export async function POST(req: Request) {
  try {
    const body = await req.json() as PayPalWebhook;
    if (!(await verifySignature(req, body))) {
      return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
    }

    if (body.event_type !== 'PAYMENT.CAPTURE.COMPLETED') {
      return NextResponse.json({ received: true });
    }

    const parsed = body.resource?.custom_id ? parsePayPalCustomId(body.resource.custom_id) : null;
    if (!parsed) return NextResponse.json({ error: 'Invalid custom id' }, { status: 400 });

    const expected = PAYPAL_PLANS[parsed.plan];
    const amount = body.resource?.amount;
    if (amount?.currency_code !== 'USD' || amount.value !== expected.amount) {
      return NextResponse.json({ error: 'Invalid amount' }, { status: 400 });
    }

    const user = await prisma.user.findUnique({ where: { id: parsed.userId } });
    if (!user) return NextResponse.json({ error: 'Unknown user' }, { status: 404 });

    if (user.plan !== expected.dbPlan || user.subscriptionStatus !== 'ACTIVE') {
      await prisma.user.update({
        where: { id: user.id },
        data: {
          plan: expected.dbPlan,
          subscriptionStatus: 'ACTIVE',
          role: user.role === 'ADMIN' ? 'ADMIN' : (expected.role || 'USER'),
        },
      });
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('[PAYPAL_WEBHOOK_ERROR]', error);
    return NextResponse.json({ error: 'Webhook handler failed' }, { status: 400 });
  }
}
