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
        const evalData = await getLatestEvaluation(user.id);
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
