const EVENTS = new Set([
  "landing_view", "primary_cta_click", "onboarding_started", "onboarding_step_completed",
  "onboarding_safety_stop", "onboarding_completed", "account_created", "route_created",
  "first_action_completed", "plan_viewed", "checkout_started", "payment_confirmed",
  "academy_unit_started", "academy_unit_completed", "day_7_return",
]);

const META_KEYS = new Set(["source", "plan", "step", "unitType", "outcome"]);

export async function POST(request: Request) {
  const length = Number(request.headers.get("content-length") || 0);
  if (length > 2048) return Response.json({ accepted: false }, { status: 413 });

  try {
    const body = await request.json() as { event?: unknown; path?: unknown; metadata?: unknown };
    if (typeof body.event !== "string" || !EVENTS.has(body.event)) {
      return Response.json({ accepted: false }, { status: 400 });
    }
    const path = typeof body.path === "string" && body.path.startsWith("/") ? body.path.slice(0, 120) : "/";
    const metadata: Record<string, string | number | boolean> = {};
    if (body.metadata && typeof body.metadata === "object" && !Array.isArray(body.metadata)) {
      for (const [key, value] of Object.entries(body.metadata)) {
        if (!META_KEYS.has(key)) continue;
        if (typeof value === "string") metadata[key] = value.slice(0, 60);
        else if (typeof value === "number" || typeof value === "boolean") metadata[key] = value;
      }
    }
    console.info("[NUTRITY_FUNNEL]", JSON.stringify({ event: body.event, path, metadata, at: new Date().toISOString() }));
    return Response.json({ accepted: true }, { status: 202 });
  } catch {
    return Response.json({ accepted: false }, { status: 400 });
  }
}
