export const ANALYTICS_CONSENT_KEY = "nutrity_analytics_consent";

export type FunnelEvent =
  | "landing_view"
  | "primary_cta_click"
  | "onboarding_started"
  | "onboarding_step_completed"
  | "onboarding_safety_stop"
  | "onboarding_completed"
  | "account_created"
  | "route_created"
  | "first_action_completed"
  | "plan_viewed"
  | "checkout_started"
  | "payment_confirmed"
  | "academy_unit_started"
  | "academy_unit_completed"
  | "day_7_return";

type EventMetadata = Partial<Record<"source" | "plan" | "step" | "unitType" | "outcome", string | number | boolean>>;

export function hasAnalyticsConsent() {
  return typeof window !== "undefined" && localStorage.getItem(ANALYTICS_CONSENT_KEY) === "granted";
}

export function trackEvent(event: FunnelEvent, metadata: EventMetadata = {}) {
  if (!hasAnalyticsConsent()) return;
  const body = JSON.stringify({ event, path: window.location.pathname, metadata });
  if (navigator.sendBeacon) {
    navigator.sendBeacon("/api/events", new Blob([body], { type: "application/json" }));
    return;
  }
  void fetch("/api/events", { method: "POST", headers: { "Content-Type": "application/json" }, body, keepalive: true });
}

export function trackEventOnce(event: FunnelEvent, metadata: EventMetadata = {}) {
  if (typeof window === "undefined") return;
  const key = `nutrity_event_${event}`;
  if (sessionStorage.getItem(key)) return;
  trackEvent(event, metadata);
  if (hasAnalyticsConsent()) sessionStorage.setItem(key, "1");
}

export function recordFirstVisit() {
  if (typeof window === "undefined") return;
  const key = "nutrity_first_visit_at";
  const existing = localStorage.getItem(key);
  if (!existing) {
    localStorage.setItem(key, String(Date.now()));
    return;
  }
  const elapsed = Date.now() - Number(existing);
  if (Number.isFinite(elapsed) && elapsed >= 7 * 24 * 60 * 60 * 1000) {
    trackEventOnce("day_7_return");
  }
}
