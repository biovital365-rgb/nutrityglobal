"use client";

import { NutrityOnboarding } from "@/components/NutrityOnboarding";
import { useRouter } from "next/navigation";
import { generateAILifePlan } from "@/actions/ai-actions";
import { saveEvaluation } from "@/actions/db-actions";
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
      } else {
        console.warn("Evaluation not saved in DB: user is a guest");
        // We could store it in localStorage here if needed
      }

      // 4. Redirigir al Dashboard
      router.push("/dashboard");
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
