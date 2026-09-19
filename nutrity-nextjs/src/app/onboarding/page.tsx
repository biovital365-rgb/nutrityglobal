"use client";

import { NutrityOnboarding } from "@/components/NutrityOnboarding";
import { useRouter } from "next/navigation";
import { generateNutrityRoute } from "@/actions/ai-actions";
import { saveEvaluation } from "@/actions/db-actions";
import type { OnboardingData } from "@/lib/schemas";
import { createClient } from "@/utils/supabase/client";
import { trackEvent } from "@/lib/analytics";

export default function OnboardingPage() {
  const router = useRouter();

  const handleComplete = async (data: OnboardingData) => {
    try {
      const plan = await generateNutrityRoute(data);
      trackEvent("route_created", { source: "onboarding" });
      
      const supabase = createClient();
      const { data: { session } } = await supabase.auth.getSession();
      const userId = session?.user?.id || 'guest';
      const organizationId = undefined; // No organization yet for onboarding

      // 3. Llamar a Server Action para guardar en Base de Datos
      // Aseguramos incluir los datos de usuario si existen
      if (userId !== 'guest') {
        await saveEvaluation(userId, organizationId, data, plan);

        router.push("/dashboard");
      } else {
        console.warn("Evaluation not saved in DB: user is a guest");
        sessionStorage.setItem("guest_evaluation", JSON.stringify({ data, plan }));
        alert("Tu Ruta Nutrity está lista. Regístrate gratis para guardarla y continuar.");
        router.push("/auth?mode=register");
      }
    } catch (err) {
      console.error("Error en onboarding:", err);
      alert("Hubo un error al generar tu plan. Por favor, intenta de nuevo.");
    }
  };

  return (
    <NutrityOnboarding
      onComplete={handleComplete}
      onBack={() => router.push("/")}
      onAuthClick={() => router.push("/auth")}
    />
  );
}
