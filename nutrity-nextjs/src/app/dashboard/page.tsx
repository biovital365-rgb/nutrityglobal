"use client";

import { NutrityDashboard } from "@/components/NutrityDashboard";
import { NutrityReportTemplate } from "@/components/NutrityReportTemplate";
import { useRouter } from "next/navigation";
import { useState, useEffect, useRef } from "react";
import { createClient } from "@/utils/supabase/client";
import { getLatestEvaluation, getLatestBiologicalDiagnosis } from "@/actions/db-actions";

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [evaluation, setEvaluation] = useState<any>(null);
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);
  const [currentMenu, setCurrentMenu] = useState<any>(null);
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

        if (!actualPlan) {
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
      const [{ toJpeg }, { default: jsPDF }] = await Promise.all([
        import("html-to-image"),
        import("jspdf"),
      ]);

      const container = reportRef.current;
      if (!container) throw new Error("Report container not found");

      const pages = container.querySelectorAll<HTMLElement>("[id^='pdf-page-']");
      if (pages.length === 0) throw new Error("No PDF pages found");

      const pdf = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
      const A4_W = 210;
      const A4_H = 297;

      for (let i = 0; i < pages.length; i++) {
        const imgData = await toJpeg(pages[i], { quality: 0.92, backgroundColor: "#fdfcf9" });
        if (i > 0) pdf.addPage();
        pdf.addImage(imgData, "JPEG", 0, 0, A4_W, A4_H);
      }

      const name = evaluation?.name || user?.profile?.name || "Paciente";
      pdf.save(`Nutrity_Reporte_${name.replace(/\s+/g, "_")}.pdf`);

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
      alert("No se pudo generar el reporte. Asegúrate de tener un diagnóstico activo.");
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

      {/* Off-screen PDF template — rendered but hidden, captured by html2canvas */}
      <div
        ref={reportRef}
        aria-hidden="true"
        style={{ position: "absolute", left: "-9999px", top: 0, zIndex: -1 }}
      >
        <NutrityReportTemplate results={reportResults} />
      </div>
    </>
  );
}
