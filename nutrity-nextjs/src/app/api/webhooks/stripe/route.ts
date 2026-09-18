import { headers } from 'next/headers';
import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { prisma as db } from '@/lib/prisma';

const ALLOWED_PLANS = new Set(['BASIC', 'ADVANCED', 'ELITE']);

function planFromSubscription(subscription: Stripe.Subscription) {
  const priceId = subscription.items.data[0]?.price.id;
  const entries = [
    ['BASIC', process.env.STRIPE_PRICE_BASIC],
    ['ADVANCED', process.env.STRIPE_PRICE_ADVANCED],
    ['ELITE', process.env.STRIPE_PRICE_ELITE],
  ] as const;
  return entries.find(([, configuredPriceId]) => configuredPriceId && configuredPriceId === priceId)?.[0] || null;
}

function paidRole(currentRole: string, plan: string) {
  if (currentRole === 'ADMIN') return 'ADMIN';
  return plan === 'ELITE' ? 'COACH' : 'USER';
}

export async function POST(req: Request) {
  try {
    const stripeKey = process.env.STRIPE_SECRET_KEY;
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
    if (!stripeKey || !webhookSecret) {
      return new NextResponse('Webhook not configured', { status: 503 });
    }
    const stripe = new Stripe(stripeKey, { apiVersion: '2026-04-22.dahlia' });
    const body = await req.text();
    const signature = (await headers()).get('stripe-signature') as string;

    let event: Stripe.Event;

    try {
      event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Invalid signature';
      console.error(`Webhook signature verification failed: ${message}`);
      return new NextResponse(`Webhook Error: ${message}`, { status: 400 });
    }

    // Handle the event
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;
        if (session.mode === 'subscription') {
          const subscriptionId = session.subscription as string;
          const userId = session.metadata?.userId;

          if (userId && subscriptionId) {
            const [user, subscription] = await Promise.all([
              db.user.findUnique({ where: { id: userId } }),
              stripe.subscriptions.retrieve(subscriptionId),
            ]);
            const planType = planFromSubscription(subscription);
            const isEntitled = subscription.status === 'active' || subscription.status === 'trialing';
            const customerMatches = Boolean(user?.stripeCustomerId && user.stripeCustomerId === session.customer);
            if (!user || !planType || !ALLOWED_PLANS.has(planType) || !isEntitled || !customerMatches) {
              return new NextResponse('Invalid subscription entitlement', { status: 400 });
            }
            await db.user.update({
              where: { id: userId },
              data: {
                subscriptionId: subscriptionId,
                subscriptionStatus: subscription.status.toUpperCase(),
                plan: planType,
                role: paidRole(user.role, planType),
              },
            });
            console.log(`User ${userId} upgraded to ${planType}`);
          }
        }
        break;
      }
      
      case 'customer.subscription.updated':
      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription;
        const customerId = subscription.customer as string;

        const user = await db.user.findUnique({
          where: { stripeCustomerId: customerId },
        });

        if (user) {
          const planType = planFromSubscription(subscription);
          const isEntitled = subscription.status === 'active' || subscription.status === 'trialing';
          if (!isEntitled || !planType) {
            await db.user.update({
              where: { id: user.id },
              data: {
                subscriptionStatus: subscription.status.toUpperCase(),
                plan: 'FREE',
                role: user.role === 'ADMIN' ? 'ADMIN' : 'USER',
              },
            });
          } else {
             await db.user.update({
              where: { id: user.id },
              data: {
                subscriptionStatus: subscription.status.toUpperCase(),
                plan: planType,
                role: paidRole(user.role, planType),
              },
            });
          }
        }
        break;
      }

      default:
        console.log(`Unhandled event type ${event.type}`);
    }

    return new NextResponse(null, { status: 200 });
  } catch (error: unknown) {
    console.error('[STRIPE_WEBHOOK_ERROR]', error);
    return new NextResponse('Internal Error', { status: 500 });
  }
}
