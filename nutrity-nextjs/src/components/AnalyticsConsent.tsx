"use client";

import { useEffect, useState } from "react";
import { ANALYTICS_CONSENT_KEY, recordFirstVisit, trackEventOnce } from "@/lib/analytics";

export function AnalyticsConsent() {
  const [choice, setChoice] = useState<string | null>(null);

  useEffect(() => {
    const saved = localStorage.getItem(ANALYTICS_CONSENT_KEY);
    setChoice(saved);
    recordFirstVisit();
    if (saved === "granted") trackEventOnce("landing_view", { source: "direct_or_saved" });
  }, []);

  function decide(value: "granted" | "denied") {
    localStorage.setItem(ANALYTICS_CONSENT_KEY, value);
    setChoice(value);
    window.dispatchEvent(new CustomEvent("nutrity:analytics-consent", { detail: value }));
    if (value === "granted") {
      recordFirstVisit();
      trackEventOnce("landing_view", { source: "consent" });
    }
  }

  if (choice) return null;

  return (
    <aside className="fixed inset-x-4 bottom-4 z-[100] mx-auto max-w-3xl rounded-2xl border border-[#dce5de] bg-white p-5 text-[#17324d] shadow-2xl" aria-label="Preferencias de métricas">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <p className="text-sm leading-6"><strong>Métricas opcionales.</strong> Podemos registrar eventos anónimos de navegación para mejorar el embudo. No enviamos síntomas, mediciones ni respuestas de salud. Consulta el <a href="/privacy" className="font-bold underline">Aviso de Privacidad</a>.</p>
        <div className="flex shrink-0 gap-2">
          <button type="button" onClick={() => decide("denied")} className="rounded-xl border px-4 py-2 text-sm font-bold">Solo esenciales</button>
          <button type="button" onClick={() => decide("granted")} className="rounded-xl bg-[#17324d] px-4 py-2 text-sm font-bold text-white">Aceptar métricas</button>
        </div>
      </div>
    </aside>
  );
}
