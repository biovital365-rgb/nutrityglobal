import "server-only";

export type PayPalPlan = "basic" | "premium" | "coach";

export const PAYPAL_PLANS: Record<PayPalPlan, { amount: string; dbPlan: string; role?: "COACH" }> = {
  basic: { amount: "9.99", dbPlan: "BASIC" },
  premium: { amount: "49.00", dbPlan: "ADVANCED" },
  coach: { amount: "149.00", dbPlan: "ELITE", role: "COACH" },
};

export function isPayPalPlan(value: string): value is PayPalPlan {
  return Object.prototype.hasOwnProperty.call(PAYPAL_PLANS, value);
}

export function paypalBaseUrl() {
  return process.env.NEXT_PUBLIC_PAYPAL_ENVIRONMENT === "sandbox"
    ? "https://api-m.sandbox.paypal.com"
    : "https://api-m.paypal.com";
}

export async function getPayPalAccessToken() {
  const clientId = process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID;
  const secret = process.env.PAYPAL_CLIENT_SECRET;
  if (!clientId || !secret) throw new Error("PayPal no está configurado");

  const response = await fetch(`${paypalBaseUrl()}/v1/oauth2/token`, {
    method: "POST",
    body: "grant_type=client_credentials",
    headers: {
      Authorization: `Basic ${Buffer.from(`${clientId}:${secret}`).toString("base64")}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    cache: "no-store",
  });
  if (!response.ok) throw new Error("No se pudo autenticar con PayPal");
  const data = await response.json() as { access_token?: string };
  if (!data.access_token) throw new Error("PayPal no devolvió un token válido");
  return data.access_token;
}

export function parsePayPalCustomId(customId: string) {
  const separator = customId.lastIndexOf(":");
  if (separator < 1) return null;
  const userId = customId.slice(0, separator);
  const plan = customId.slice(separator + 1);
  return isPayPalPlan(plan) ? { userId, plan } : null;
}
