'use server';

import Stripe from 'stripe';
import { prisma as db } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';

const stripe = new Stripe((process.env.STRIPE_SECRET_KEY || 'sk_test_mock') as string, {
  apiVersion: '2025-01-27.acacia',
});

// Map de Precios/Planes. En producción esto vendría de ENV variables (los price_id de Stripe)
const PLAN_PRICES: Record<string, string> = {
  BASIC: process.env.STRIPE_PRICE_BASIC || 'price_basic_mock',
  ADVANCED: process.env.STRIPE_PRICE_ADVANCED || 'price_advanced_mock',
  ELITE: process.env.STRIPE_PRICE_ELITE || 'price_elite_mock',
};

export async function createCheckoutSession(userId: string, planType: 'BASIC' | 'ADVANCED' | 'ELITE') {
  try {
    const user = await db.user.findFirst({
      where: { 
        OR: [
          { id: userId },
          { firebaseUid: userId }
        ]
      },
    });

    if (!user) throw new Error('User not found');

    const priceId = PLAN_PRICES[planType];
    if (!priceId) throw new Error('Invalid plan type');

    // MOCK MODE: Si no hay llave real de Stripe, simulamos el cobro y actualizamos directamente la BD
    const secretKey = process.env.STRIPE_SECRET_KEY || '';
    if (!secretKey || secretKey === 'sk_test_mock' || secretKey === 'undefined' || secretKey.trim() === '') {
      console.log(`[MOCK STRIPE] Upgrading user ${user.id} to ${planType} directly...`);
      await db.user.update({
        where: { id: user.id },
        data: {
          plan: planType,
          subscriptionStatus: 'ACTIVE',
          ...(planType === 'ELITE' ? { role: 'ADMIN' } : {}),
        }
      });
      revalidatePath('/dashboard');
      return { url: '/dashboard?mock_upgrade=success' };
    }

    let customerId = user.stripeCustomerId;

    if (!customerId) {
      const customer = await stripe.customers.create({
        email: user.email,
        name: user.name || undefined,
        metadata: {
          userId: user.id,
        },
      });
      customerId = customer.id;
      
      await db.user.update({
        where: { id: user.id },
        data: { stripeCustomerId: customerId },
      });
    }

    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      mode: 'subscription',
      payment_method_types: ['card'],
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      success_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard?checkout=success`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard?checkout=cancelled`,
      metadata: {
        userId: user.id,
        planType,
      },
    });

    return { url: session.url };
  } catch (error: any) {
    console.error('[STRIPE_CHECKOUT_ERROR]', error);
    return { error: error.message };
  }
}

export async function createCustomerPortal(userId: string) {
  try {
    const user = await db.user.findFirst({
      where: { 
        OR: [
          { id: userId },
          { firebaseUid: userId }
        ]
      },
    });

    if (!user) throw new Error('User not found');

    // MOCK MODE: Si no hay llave real de Stripe, simulamos la cancelación en la BD
    if (!process.env.STRIPE_SECRET_KEY || process.env.STRIPE_SECRET_KEY === 'sk_test_mock') {
      console.log(`[MOCK STRIPE] Downgrading user ${user.id} to FREE directly...`);
      await db.user.update({
        where: { id: user.id },
        data: {
          plan: 'FREE',
          subscriptionStatus: 'canceled',
          role: 'USER',
        }
      });
      revalidatePath('/dashboard');
      return { url: '/dashboard?mock_cancel=success' };
    }

    if (!user.stripeCustomerId) {
      throw new Error('User has no active Stripe customer ID');
    }

    const session = await stripe.billingPortal.sessions.create({
      customer: user.stripeCustomerId,
      return_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard`,
    });

    return { url: session.url };
  } catch (error: any) {
    console.error('[STRIPE_PORTAL_ERROR]', error);
    return { error: error.message };
  }
}
