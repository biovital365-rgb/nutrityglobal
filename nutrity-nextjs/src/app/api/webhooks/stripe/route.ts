import { headers } from 'next/headers';
import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { prisma as db } from '@/lib/prisma';

const stripe = new Stripe((process.env.STRIPE_SECRET_KEY || 'sk_test_mock') as string, {
  apiVersion: '2026-04-22.dahlia',
});

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET as string;

export async function POST(req: Request) {
  try {
    const body = await req.text();
    const signature = (await headers()).get('stripe-signature') as string;

    let event: Stripe.Event;

    try {
      event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
    } catch (err: any) {
      console.error(`Webhook signature verification failed: ${err.message}`);
      return new NextResponse(`Webhook Error: ${err.message}`, { status: 400 });
    }

    // Handle the event
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;
        if (session.mode === 'subscription') {
          const subscriptionId = session.subscription as string;
          const planType = session.metadata?.planType;
          const userId = session.metadata?.userId;

          if (userId && planType) {
            await db.user.update({
              where: { id: userId },
              data: {
                subscriptionId: subscriptionId,
                subscriptionStatus: 'ACTIVE',
                plan: planType,
                // Si el plan es ELITE, actualizamos el rol también
                ...(planType === 'ELITE' ? { role: 'ADMIN' } : {}),
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
          // If subscription is canceled or unpaid, fallback to FREE
          if (subscription.status === 'canceled' || subscription.status === 'unpaid') {
            await db.user.update({
              where: { id: user.id },
              data: {
                subscriptionStatus: subscription.status,
                plan: 'FREE',
                role: 'USER', // Evita que coaches mantengan acceso admin sin pagar
              },
            });
          } else {
             // For active or past_due statuses
             await db.user.update({
              where: { id: user.id },
              data: {
                subscriptionStatus: subscription.status,
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
  } catch (error: any) {
    console.error('[STRIPE_WEBHOOK_ERROR]', error);
    return new NextResponse('Internal Error', { status: 500 });
  }
}
