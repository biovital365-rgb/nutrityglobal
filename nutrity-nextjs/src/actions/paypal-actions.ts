'use server';

import { prisma } from "@/lib/prisma";

const { NEXT_PUBLIC_PAYPAL_CLIENT_ID, PAYPAL_CLIENT_SECRET, NEXT_PUBLIC_PAYPAL_ENVIRONMENT } = process.env;

const base = NEXT_PUBLIC_PAYPAL_ENVIRONMENT === "sandbox" 
  ? "https://api-m.sandbox.paypal.com" 
  : "https://api-m.paypal.com";

/**
 * Generate an OAuth 2.0 access token for authenticating with PayPal REST APIs.
 */
async function generateAccessToken() {
  try {
    if (!NEXT_PUBLIC_PAYPAL_CLIENT_ID || !PAYPAL_CLIENT_SECRET) {
      throw new Error("MISSING_API_CREDENTIALS");
    }
    const auth = Buffer.from(
      NEXT_PUBLIC_PAYPAL_CLIENT_ID + ":" + PAYPAL_CLIENT_SECRET,
    ).toString("base64");

    const response = await fetch(`${base}/v1/oauth2/token`, {
      method: "POST",
      body: "grant_type=client_credentials",
      headers: {
        Authorization: `Basic ${auth}`,
      },
      // cache: 'no-store'
    });

    const data = await response.json();
    return data.access_token;
  } catch (error) {
    console.error("Failed to generate Access Token:", error);
    throw new Error("PayPal Token Error");
  }
}

/**
 * Create an order to start the transaction.
 */
export async function createOrder(userId: string, planType: string) {
  try {
    const accessToken = await generateAccessToken();
    const url = `${base}/v2/checkout/orders`;

    // Pricing logic. This must run on the server to prevent manipulation.
    let price = "0.00";
    if (planType === "basic") {
        price = "9.99";
    } else if (planType === "premium") {
        price = "49.00"; // Example price for premium
    } else if (planType === "coach") {
        price = "149.00"; // Example price for coach/business
    }

    const payload = {
      intent: "CAPTURE",
      purchase_units: [
        {
          reference_id: `${userId}_${planType}`, // We encode the user and plan to capture it later
          custom_id: `${userId}_${planType}`,
          amount: {
            currency_code: "USD",
            value: price,
          },
          description: `BioVital.360 - Plan ${planType.toUpperCase()}`
        },
      ],
    };

    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify(payload),
    });

    const data = await response.json();
    if (data.id) {
        return { success: true, orderId: data.id };
    } else {
        console.error("PayPal Create Order Error:", data);
        return { success: false, error: data.message || "No se pudo crear la orden en PayPal." };
    }
  } catch (error: any) {
    console.error("Error creating order", error);
    return { success: false, error: error.message === "MISSING_API_CREDENTIALS" ? "Las credenciales de PayPal no están configuradas correctamente." : "Error de comunicación con PayPal." };
  }
}

/**
 * Capture payment for the created order to complete the transaction.
 */
export async function captureOrder(orderID: string, userId: string, planType: string) {
  try {
    const accessToken = await generateAccessToken();
    const url = `${base}/v2/checkout/orders/${orderID}/capture`;

    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
    });

    const data = await response.json();
    
    // Check if the payment was successful
    if (data.status === "COMPLETED") {
        
        // Upgrade the user's role in the database using Prisma
        try {
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
        } catch (dbError) {
            console.error("Prisma User Update Error after payment:", dbError);
            return { success: false, error: "Payment received but failed to update profile." };
        }
        
        return { success: true, data };
    } else {
        return { success: false, error: "Payment not completed." };
    }
  } catch (error) {
    console.error("Error capturing order", error);
    return { success: false, error: "Internal Capture Error" };
  }
}
