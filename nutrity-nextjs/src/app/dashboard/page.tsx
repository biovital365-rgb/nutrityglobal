"use client";

import { NutrityDashboard } from "@/components/NutrityDashboard";

import { useRouter } from "next/navigation";
import { useState, useEffect, useRef } from "react";
import { createClient } from "@/utils/supabase/client";
import { getLatestEvaluation, getLatestBiologicalDiagnosis, getUserAssignmentSubmissions, getUserQuizAttempts } from "@/actions/db-actions";

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [evaluation, setEvaluation] = useState<any>(null);
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);
  const [currentMenu, setCurrentMenu] = useState<any>(null);
  const [userSubmissions, setUserSubmissions] = useState<any[]>([]);
  const [userQuizAttempts, setUserQuizAttempts] = useState<any[]>([]);
  const reportRef = useRef<HTMLDivElement>(null);
  const supabase = createClient();

  useEffect(() => {
    async function loadData() {
      const { data: { user: authUser } } = await supabase.auth.getUser();
      if (!authUser) {
        router.push("/auth");
        return;
      }

      try {
        // Sync user with DB and merge returned profile into state
        const { syncUserProfile } = await import("@/actions/db-actions");
        // Leer posible código de invitación del Coach
        const orgId = localStorage.getItem("invitation_org_id");
        
        const dbProfile = await syncUserProfile(
          { uid: authUser.id, email: authUser.email },
          authUser.user_metadata?.full_name,
          orgId || undefined
        );
        // Merge the DB profile so user.profile is always available in dashboard
        setUser({ ...authUser, profile: dbProfile });

        const [subs, quizzes] = await Promise.all([
          getUserAssignmentSubmissions(authUser.id).catch(() => []),
          getUserQuizAttempts(authUser.id).catch(() => [])
        ]);
        setUserSubmissions(subs);
        setUserQuizAttempts(quizzes);

        let evalData = await getLatestEvaluation(authUser.id);
        let actualPlan = null;

        // Recover guest evaluation if available
        const guestEvalStr = sessionStorage.getItem("guest_evaluation");
        if (guestEvalStr) {
          try {
            const guestEval = JSON.parse(guestEvalStr);
            if (guestEval.data && guestEval.plan) {
              const { saveEvaluation } = await import("@/actions/db-actions");
              await saveEvaluation(authUser.id, undefined, guestEval.data, guestEval.plan);
              actualPlan = {
                ...guestEval.plan,
                rawAnswers: guestEval.data
              };
              sessionStorage.removeItem("guest_evaluation");
            }
          } catch (e) {
            console.error("Error recovering guest evaluation", e);
          }
        }

        let nmgData = await getLatestBiologicalDiagnosis(authUser.id);

        if (!actualPlan && evalData && evalData.results) {
          actualPlan = {
            ...evalData.results,
            rawAnswers: evalData.data,
            nmg: nmgData
          };
        }

        if (!actualPlan && dbProfile?.role !== 'COACH' && dbProfile?.role !== 'ADMIN') {
          router.push("/onboarding");
          return;
        }

        setEvaluation(actualPlan);
      } catch (err) {
        console.error("Dashboard load error", err);
      }
    }
    loadData();
  // supabase client is stable, router too
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleGeneratePDF = async () => {
    if (isGeneratingPDF) return;
    setIsGeneratingPDF(true);
    try {
      const response = await fetch('/api/reporting/expedient');
      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${await response.text()}`);
      }
      
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      
      // Intentamos usar el content-disposition si viene, si no fallback
      const disposition = response.headers.get('content-disposition');
      let filename = `Expediente_Nutrity_${user?.id?.slice(-6) || 'Paciente'}.pdf`;
      if (disposition && disposition.indexOf('attachment') !== -1) {
          const filenameRegex = /filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/;
          const matches = filenameRegex.exec(disposition);
          if (matches != null && matches[1]) { 
            filename = matches[1].replace(/['"]/g, '');
          }
      }
      
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      // Log the PDF download to the database
      try {
        const { logPDFReport } = await import("@/actions/db-actions");
        const userId = user?.id || user?.uid;
        if (userId) {
          await logPDFReport(userId, user?.profile?.organizationId, "DOWNLOADED");
        }
      } catch (logErr) {
        console.error("Failed to log PDF generation:", logErr);
      }
    } catch (err) {
      console.error("PDF generation failed:", err);
      alert("No se pudo generar el expediente. Intenta nuevamente.");
      try {
        const { logPDFReport } = await import("@/actions/db-actions");
        const userId = user?.id || user?.uid;
        if (userId) {
          await logPDFReport(userId, user?.profile?.organizationId, "ERROR", (err as Error).message);
        }
      } catch (e) {}
    } finally {
      setIsGeneratingPDF(false);
    }
  };

  if (!user) return <div className="p-8 text-center">Cargando perfil...</div>;

  // Merge current menu into evaluation results for PDF rendering
  const reportResults = { 
    ...(evaluation || {}), 
    name: user?.profile?.name || user?.user_metadata?.full_name || evaluation?.name || "Paciente Nutrity",
    weeklyMenu: currentMenu 
  };

  return (
    <>
      <NutrityDashboard
        user={user}
        results={evaluation || {}}
        userSubmissions={userSubmissions}
        userQuizAttempts={userQuizAttempts}
        onLogout={async () => {
          await supabase.auth.signOut();
          router.push("/");
        }}
        onViewDetail={(pillar) => console.log("View detail", pillar)}
        onGeneratePDF={handleGeneratePDF}
        isGeneratingPDF={isGeneratingPDF}
        onMenuUpdate={(menu) => setCurrentMenu(menu)}
        onRequireAuth={() => router.push("/auth")}
      />
    </>
  );
}
