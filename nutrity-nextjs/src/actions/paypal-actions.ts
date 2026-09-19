'use server';

import { prisma } from '@/lib/prisma';
import { requireUser } from '@/lib/authz';
import {
  getPayPalAccessToken,
  isPayPalPlan,
  parsePayPalCustomId,
  paypalBaseUrl,
  PAYPAL_PLANS,
} from '@/lib/paypal';

type PayPalOrder = {
  id?: string;
  status?: string;
  purchase_units?: Array<{
    custom_id?: string;
    amount?: { currency_code?: string; value?: string };
    payments?: { captures?: Array<{ amount?: { currency_code?: string; value?: string } }> };
  }>;
};

async function paypalRequest(path: string, init: RequestInit = {}) {
  const token = await getPayPalAccessToken();
  return fetch(`${paypalBaseUrl()}${path}`, {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
      ...(init.headers || {}),
    },
    cache: 'no-store',
  });
}

export async function createOrder(_userId: string, planType: string) {
  try {
    void _userId;
    const user = await requireUser();
    if (!isPayPalPlan(planType)) throw new Error('Plan no válido');
    const plan = PAYPAL_PLANS[planType];

    const response = await paypalRequest('/v2/checkout/orders', {
      method: 'POST',
      body: JSON.stringify({
        intent: 'CAPTURE',
        purchase_units: [{
          reference_id: `${user.id}:${planType}`,
          custom_id: `${user.id}:${planType}`,
          amount: { currency_code: 'USD', value: plan.amount },
          description: `Nutrity Global - Plan ${planType.toUpperCase()}`,
        }],
      }),
    });

    const data = await response.json() as PayPalOrder & { message?: string };
    if (!response.ok || !data.id) throw new Error(data.message || 'No se pudo crear la orden');
    return { success: true, orderId: data.id };
  } catch (error) {
    console.error('[PAYPAL_CREATE_ORDER]', error);
    return { success: false, error: error instanceof Error ? error.message : 'Error de PayPal' };
  }
}

export async function captureOrder(orderID: string, _userId: string, _planType: string) {
  try {
    void _userId;
    void _planType;
    const user = await requireUser();

    const detailsResponse = await paypalRequest(`/v2/checkout/orders/${encodeURIComponent(orderID)}`);
    const details = await detailsResponse.json() as PayPalOrder;
    const unit = details.purchase_units?.[0];
    const parsed = unit?.custom_id ? parsePayPalCustomId(unit.custom_id) : null;
    if (!detailsResponse.ok || !parsed || parsed.userId !== user.id) throw new Error('Orden no autorizada');

    const expected = PAYPAL_PLANS[parsed.plan];
    if (unit?.amount?.currency_code !== 'USD' || unit.amount.value !== expected.amount) {
      throw new Error('El importe de la orden no coincide con el plan');
    }

    const captureResponse = await paypalRequest(`/v2/checkout/orders/${encodeURIComponent(orderID)}/capture`, { method: 'POST' });
    const capture = await captureResponse.json() as PayPalOrder;
    const capturedAmount = capture.purchase_units?.[0]?.payments?.captures?.[0]?.amount;
    if (!captureResponse.ok || capture.status !== 'COMPLETED') throw new Error('Pago no completado');
    if (capturedAmount?.currency_code !== 'USD' || capturedAmount.value !== expected.amount) {
      throw new Error('El importe capturado no coincide con el plan');
    }

    await prisma.user.update({
      where: { id: user.id },
      data: {
        plan: expected.dbPlan,
        subscriptionStatus: 'ACTIVE',
        role: user.role === 'ADMIN' ? 'ADMIN' : (expected.role || 'USER'),
      },
    });
    console.info('[NUTRITY_FUNNEL]', JSON.stringify({ event: 'payment_confirmed', path: '/paypal', metadata: { plan: expected.dbPlan, source: 'paypal' }, at: new Date().toISOString() }));
    return { success: true };
  } catch (error) {
    console.error('[PAYPAL_CAPTURE_ORDER]', error);
    return { success: false, error: error instanceof Error ? error.message : 'Error de captura' };
  }
}
