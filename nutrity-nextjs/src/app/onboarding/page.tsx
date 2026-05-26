"use client";

import { NutrityOnboarding } from "@/components/NutrityOnboarding";
import { useRouter } from "next/navigation";
import { generateAILifePlan } from "@/actions/ai-actions";
import { saveEvaluation, saveBiologicalDiagnosis } from "@/actions/db-actions";
import { supabase } from "@/lib/supabase";

export default function OnboardingPage() {
  const router = useRouter();

  const handleComplete = async (data: any) => {
    try {
      const plan = await generateAILifePlan(data);
      if ((plan as any)._error) {
        alert("Error de Servidor: " + (plan as any)._error);
        return;
      }
      
      const { data: { session } } = await supabase.auth.getSession();
      const userId = session?.user?.id || 'guest';
      const organizationId = undefined; // No organization yet for onboarding

      // 3. Llamar a Server Action para guardar en Base de Datos
      // Aseguramos incluir los datos de usuario si existen
      if (userId !== 'guest') {
        await saveEvaluation(userId, organizationId, data, plan);

        // ── Persistir Triaje NMG + Diagnóstico IA ──
        if (data.mainSymptom && plan?.nmgDiagnosis) {
          try {
            await saveBiologicalDiagnosis(
              userId,
              organizationId,
              {
                mainSymptom: data.mainSymptom,
                affectedSystem: data.affectedSystem || '',
                symptomDuration: data.symptomDuration || '',
                emotionalContext: data.emotionalContext || '',
              },
              plan.nmgDiagnosis
            );
          } catch (nmgErr) {
            // No crítico: el usuario igual accede al dashboard
            console.warn('[NMG] Biological diagnosis not saved:', nmgErr);
          }
        }

        router.push("/dashboard");
      } else {
        console.warn("Evaluation not saved in DB: user is a guest");
        sessionStorage.setItem("guest_evaluation", JSON.stringify({ data, plan }));
        alert("¡Tu Bio-Plan ha sido generado con éxito! Regístrate gratis en el siguiente paso para verlo y guardarlo en tu cuenta.");
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
