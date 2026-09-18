'use server';

import Stripe from 'stripe';
import { prisma } from '@/lib/prisma';
import { requireUser } from '@/lib/authz';

type PurchasablePlan = 'BASIC' | 'ADVANCED' | 'ELITE';

const PLAN_PRICE_ENV: Record<PurchasablePlan, keyof NodeJS.ProcessEnv> = {
  BASIC: 'STRIPE_PRICE_BASIC',
  ADVANCED: 'STRIPE_PRICE_ADVANCED',
  ELITE: 'STRIPE_PRICE_ELITE',
};

function getStripe() {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key || key === 'sk_test_mock') throw new Error('Stripe no está configurado');
  return new Stripe(key, { apiVersion: '2026-04-22.dahlia' });
}

function getAppUrl() {
  const value = process.env.NEXT_PUBLIC_APP_URL;
  if (!value) throw new Error('NEXT_PUBLIC_APP_URL no está configurado');
  return value.replace(/\/$/, '');
}

function getPriceId(plan: PurchasablePlan) {
  const priceId = process.env[PLAN_PRICE_ENV[plan]];
  if (!priceId || priceId.endsWith('_mock')) throw new Error('El precio solicitado no está configurado');
  return priceId;
}

export async function createCheckoutSession(_userId: string, planType: PurchasablePlan) {
  try {
    void _userId;
    const user = await requireUser();
    const stripe = getStripe();
    const priceId = getPriceId(planType);
    const appUrl = getAppUrl();

    let customerId = user.stripeCustomerId;
    if (!customerId) {
      const customer = await stripe.customers.create({
        email: user.email,
        name: user.name || undefined,
        metadata: { userId: user.id },
      });
      customerId = customer.id;
      await prisma.user.update({ where: { id: user.id }, data: { stripeCustomerId: customerId } });
    }

    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      mode: 'subscription',
      payment_method_types: ['card'],
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: `${appUrl}/dashboard?checkout=success`,
      cancel_url: `${appUrl}/dashboard?checkout=cancelled`,
      client_reference_id: user.id,
      metadata: { userId: user.id, planType },
      subscription_data: { metadata: { userId: user.id, planType } },
    });

    return { url: session.url };
  } catch (error) {
    console.error('[STRIPE_CHECKOUT_ERROR]', error);
    return { error: error instanceof Error ? error.message : 'No se pudo iniciar el pago' };
  }
}

export async function createCustomerPortal(_userId: string) {
  try {
    void _userId;
    const user = await requireUser();
    if (!user.stripeCustomerId) throw new Error('El usuario no tiene una suscripción de Stripe');

    const session = await getStripe().billingPortal.sessions.create({
      customer: user.stripeCustomerId,
      return_url: `${getAppUrl()}/dashboard`,
    });
    return { url: session.url };
  } catch (error) {
    console.error('[STRIPE_PORTAL_ERROR]', error);
    return { error: error instanceof Error ? error.message : 'No se pudo abrir el portal' };
  }
}
