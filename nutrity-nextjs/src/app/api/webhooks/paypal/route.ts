import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import crypto from 'crypto';

export async function POST(req: Request) {
  try {
    const bodyText = await req.text();
    const body = JSON.parse(bodyText);

    // TODO: Verify PayPal Webhook Signature for production
    // const signature = req.headers.get('PAYPAL-TRANSMISSION-SIG');

    if (body.event_type === 'PAYMENT.CAPTURE.COMPLETED') {
      const resource = body.resource;
      const customId = resource.custom_id; // If we passed custom_id during order creation

      if (customId) {
        // Assume customId format is "userId_planType"
        const [userId, planType] = customId.split('_');
        
        const { getInternalId } = await import("@/actions/db-actions");
        const internalId = await getInternalId(userId);

        const updateData: any = {};
        if (planType === "basic") {
            updateData.plan = "BASIC";
        } else if (planType === "premium") {
            updateData.plan = "PREMIUM";
        } else if (planType === "coach") {
            updateData.role = "COACH";
            updateData.plan = "ELITE";
        }

        await prisma.user.update({
          where: { id: internalId },
          data: updateData
        });
        
        console.log(`Webhook: Successfully upgraded user ${userId} to ${planType}`);
      }
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('PayPal Webhook Error:', error);
    return NextResponse.json({ error: 'Webhook handler failed' }, { status: 400 });
  }
}
