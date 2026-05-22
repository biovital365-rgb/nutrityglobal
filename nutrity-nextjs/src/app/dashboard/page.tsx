"use client";

import { NutrityDashboard } from "@/components/NutrityDashboard";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { createClient } from "@/utils/supabase/client";
import { getLatestEvaluation } from "@/actions/db-actions";

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [evaluation, setEvaluation] = useState<any>(null);
  const supabase = createClient();

  useEffect(() => {
    async function loadData() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push("/auth");
        return;
      }
      setUser(user);

      try {
        // Ensure user is synced in DB
        const { syncUserProfile } = await import("@/actions/db-actions");
        await syncUserProfile({ uid: user.id, email: user.email }, user.user_metadata?.full_name);

        let evalData = await getLatestEvaluation(user.id);
        
        // Recover guest evaluation if available
        const guestEvalStr = sessionStorage.getItem("guest_evaluation");
        if (guestEvalStr) {
          try {
            const guestEval = JSON.parse(guestEvalStr);
            if (guestEval.data && guestEval.plan) {
              const { saveEvaluation } = await import("@/actions/db-actions");
              await saveEvaluation(user.id, undefined, guestEval.data, guestEval.plan);
              sessionStorage.removeItem("guest_evaluation");
              evalData = guestEval.plan; // Use the recovered plan immediately
            }
          } catch (e) {
            console.error("Error recovering guest evaluation", e);
          }
        }
        
        setEvaluation(evalData);
      } catch (err) {
        console.error("No evaluation found", err);
      }
    }
    loadData();
  }, [router, supabase]);

  if (!user) return <div className="p-8 text-center">Cargando perfil...</div>;

  return (
    <NutrityDashboard
      user={user}
      results={evaluation || {}}
      onLogout={async () => {
        await supabase.auth.signOut();
        router.push("/");
      }}
      onViewDetail={(pillar) => console.log("View detail", pillar)}
      onGeneratePDF={() => console.log("Generate PDF")}
      onRequireAuth={() => router.push("/auth")}
    />
  );
}
