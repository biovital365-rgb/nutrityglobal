import { useState, useEffect } from "react";
import { NutrityLanding } from "./components/NutrityLanding";
import { NutrityOnboarding } from "./components/NutrityOnboarding";
import { NutrityDashboard } from "./components/NutrityDashboard";
import { Auth } from "./components/Auth";
import { NutrityReportTemplate } from "./components/NutrityReportTemplate";
import { auth, db } from "./lib/firebase";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { collection, addDoc, serverTimestamp, query, where, orderBy, limit, getDocs } from "firebase/firestore";
import { generateMetabolicPlan } from "./lib/metabolic-engine";
import { dbService } from "./lib/db-service";
import { jsPDF } from "jspdf";
import { Download, X, CheckCircle2, LogOut } from "lucide-react";

export default function App() {
  const [view, setView] = useState<"landing" | "onboarding" | "dashboard" | "detail" | "auth" | "history">("landing");
  const [results, setResults] = useState<any>(null);
  const [selectedPillar, setSelectedPillar] = useState<string>("");
  const [user, setUser] = useState<any>(null); // Firebase User
  const [profile, setProfile] = useState<any>(null); // Supabase Profile
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);

  useEffect(() => {
    console.log("DEBUG: showAuthModal state changed to ->", showAuthModal);
  }, [showAuthModal]);
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setUser(firebaseUser);
      if (firebaseUser) {
        setShowAuthModal(false);
        // Sync & Load Supabase Profile
        const p = await dbService.syncUserProfile(firebaseUser);
        setProfile(p);

        if (firebaseUser?.uid && !results) {
          try {
            const q = query(
              collection(db, "evaluations"),
              where("userId", "==", firebaseUser.uid),
              orderBy("timestamp", "desc"),
              limit(1)
            );
            const querySnapshot = await getDocs(q);
            if (!querySnapshot.empty) {
              const latestData = querySnapshot.docs[0].data();
              setResults(latestData.results);
              setView("dashboard");
            }
          } catch (err) {
            console.error("Error loading previous results:", err);
          }
        }
      } else {
        setProfile(null);
      }
    });
    return () => unsubscribe();
  }, [results]);

  const handleStartOnboarding = () => {
    setView("onboarding");
  };

  const handleAuthClick = () => {
    setShowAuthModal(true);
  };

  const handleAuthSuccess = (userData: any) => {
    setUser(userData);
    setShowAuthModal(false);
    if (results) {
      setView("dashboard");
    } else if (view === "auth") {
      setView("landing");
    }
  };

  const handleCompleteOnboarding = async (data: any) => {
    try {
      console.log("Processing onboarding data...", data);
      const plan = generateMetabolicPlan(data);
      const processedResults = { ...plan, name: data.name, condition: data.condition };

      // 1. Actualizar estado local inmediatamente
      setResults(processedResults);

      if (!user) {
        setShowAuthModal(true);
      } else {
        setView("dashboard"); // Cambio de vista instantáneo
      }

      // 2. Guardar en background (sin bloquear al usuario)
      if (user) {
        addDoc(collection(db, "evaluations"), {
          userId: user.uid,
          ...data,
          results: processedResults,
          timestamp: serverTimestamp()
        }).catch(err => console.error("Background save failed:", err));
      }
    } catch (err) {
      console.error("Critical error in onboarding completion:", err);
      // Fallback
      setView("dashboard");
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      setUser(null);
      setProfile(null);
      setResults(null);
      setView("landing");
    } catch (err) {
      console.error("Logout error:", err);
    }
  };

  useEffect(() => {
    const loadLastEvaluation = async () => {
      if (!user?.uid || results) return;
      try {
        const q = query(
          collection(db, "evaluations"),
          where("userId", "==", user.uid),
          orderBy("timestamp", "desc"),
          limit(1)
        );
        const snapshot = await getDocs(q);
        if (!snapshot.empty) {
          const evalData = snapshot.docs[0].data();
          if (evalData.results) {
            console.log("Loading previous evaluation results...", evalData.results);
            setResults(evalData.results);
            setView("dashboard");
          }
        }
      } catch (err) {
        console.error("Error loading previous evaluation:", err);
      }
    };
    loadLastEvaluation();
  }, [user?.uid]);

  const handleGeneratePDF = async () => {
    if (!results || isGeneratingPDF) return;
    setIsGeneratingPDF(true);

    try {
      console.log("Generating Professional Clinical Report [V7]...", results);
      const doc = new jsPDF({
        orientation: 'p',
        unit: 'mm',
        format: 'a4'
      });

      // Data Sanitization
      const getName = () => results.name || (user as any)?.profile?.name || (user as any)?.displayName || 'PACIENTE';
      const patientName = getName().toUpperCase();
      const conditionLabel = results.condition === 'diabetes' ? 'Diabetes Tipo 2' : results.condition === 'resistance' ? 'Resistencia Insulínica' : 'Optimización Metabólica';
      const currentPhase = results.phase || 'Activación';

      const margin = 20;
      let y = 30;

      // 1. CABECERA PROFESIONAL
      doc.setFont("helvetica", "bold");
      doc.setFontSize(24);
      doc.setTextColor(15, 23, 42); // Slate 900
      doc.text("BIOVITAL 365 AI", margin, y);

      y += 8;
      doc.setFontSize(9);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(100, 116, 139); // Slate 400
      doc.text("SISTEMA AVANZADO DE BIOMETRÍA Y REPROGRAMACIÓN METABÓLICA", margin, y);

      y += 4;
      doc.setDrawColor(226, 232, 240);
      doc.setLineWidth(0.5);
      doc.line(margin, y, 190, y);

      // 2. FICHA TÉCNICA DEL PACIENTE
      y += 12;
      doc.setFillColor(248, 250, 252);
      doc.rect(margin, y, 170, 25, 'F');

      y += 8;
      doc.setFontSize(10);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(51, 65, 85);
      doc.text("DATOS DEL PACIENTE", margin + 5, y);
      doc.text("METADATOS CLÍNICOS", 120, y);

      y += 6;
      doc.setFont("helvetica", "normal");
      doc.setFontSize(9);
      doc.text(`Nombre: ${patientName}`, margin + 5, y);
      doc.text(`ID Sesión: ${user?.uid?.substring(0, 12) || 'ANON'}`, 120, y);
      y += 5;
      doc.text(`Fecha Ref: ${new Date().toLocaleDateString()}`, margin + 5, y);
      doc.text(`Fase Activa: ${currentPhase.toUpperCase()}`, 120, y);

      // 3. EVALUACIÓN Y BIO-ESTADO
      y += 15;
      doc.setFont("helvetica", "bold");
      doc.setFontSize(13);
      doc.setTextColor(79, 70, 229); // Indigo 600
      doc.text("I. EVALUACIÓN DE ESTADO METABÓLICO", margin, y);

      y += 10;
      doc.setFontSize(10);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(30, 41, 59);
      doc.text(`• Diagnóstico de Perfil: ${conditionLabel}`, margin + 5, y);
      y += 6;
      doc.text(`• Objetivo Clínico: ${results.meta || 'Restauración de Sensibilidad a la Insulina'}`, margin + 5, y);
      doc.text(`• Score de Remisión Actual: ${results.remissionScore || '90'}%`, margin + 5, y);

      // 4. DIAGNÓSTICO IA MOLECULAR
      y += 12;
      doc.setFont("helvetica", "bold");
      doc.setFontSize(13);
      doc.text("II. DIAGNÓSTICO MOLECULAR IA (INSIGHT)", margin, y);

      y += 8;
      doc.setFontSize(10);
      doc.setFont("helvetica", "italic");
      doc.setTextColor(71, 85, 105);
      const summaryText = results.summary || results.insight || "Se identifica una resistencia periférica moderada. El protocolo se ajusta para maximizar la autofagia celular y la biogénesis mitocondrial mediante restricción de carbohidratos simples y suplementación específica.";
      const summaryLines = doc.splitTextToSize(summaryText, 165);
      doc.text(summaryLines, margin + 5, y);
      y += (summaryLines.length * 6) + 10;

      // 5. PROTOCOLO DE MICRONUTRICIÓN
      y += 10;
      doc.setFont("helvetica", "bold");
      doc.setFontSize(13);
      doc.setTextColor(79, 70, 229);
      doc.text("III. PROTOCOLO DE MICRONUTRICIÓN DE PRECISIÓN", margin, y);

      y += 10;
      doc.setFontSize(9);
      doc.setTextColor(30, 41, 59);

      const micros = results.micronutrients || [];
      if (micros.length > 0) {
        micros.forEach((m: any, idx: number) => {
          doc.setFont("helvetica", "bold");
          doc.text(`${idx + 1}. ${m.name}: `, margin + 5, y);
          doc.setFont("helvetica", "normal");
          doc.text(`${m.dose} - ${m.reason} `, margin + 50, y);
          y += 6;
          if (y > 275) { doc.addPage(); y = 25; }
        });
      } else {
        doc.text("Base protocol: Magnesium Bisglycinate (400mg), Vitamin D3+K2 (5000 IU).", margin + 5, y);
        y += 6;
      }

      // 6. PLAN DE BIO-HACKING
      y += 10;
      doc.setFont("helvetica", "bold");
      doc.setFontSize(13);
      doc.text("IV. PROTOCOLO DE BIO-HACKING Y ESTILO DE VIDA", margin, y);

      y += 10;
      doc.setFontSize(10);
      doc.setFont("helvetica", "normal");
      const hackingSteps = [
        "Ventana de ayuno 16:8 obligatoria (Última comida 19:00).",
        "Protocolo de luz roja o exposición solar matutina (15 min).",
        "Entrenamiento de fuerza (Z2) para mejora de GLUT4.",
        "Ducha fría (30 seg al final) para activación de grasa parda."
      ];
      hackingSteps.forEach(step => {
        doc.text(`- ${step} `, margin + 5, y);
        y += 7;
      });

      // PIE DE PÁGINA
      doc.setFontSize(8);
      doc.setTextColor(148, 163, 184);
      doc.text("Nutrity Global AI - Auditoría Médica V4.5 - CONFIDENCIAL", margin, 285);
      doc.text(`Página 1 de 1`, 170, 285);

      // --- DESCARGA DEFINITIVA ---
      console.log("Saving PDF binary...");
      const pdfBinary = doc.output('blob');
      const blobUrl = URL.createObjectURL(pdfBinary);
      const link = document.createElement('a');
      link.href = blobUrl;
      link.download = `REPORTE - CLINICO - ${patientName.replace(/\s+/g, '-')}.pdf`;

      // Force download logic
      document.body.appendChild(link);
      link.click();

      // Cleanup with generous delay to ensure browser handled the trigger
      setTimeout(() => {
        document.body.removeChild(link);
        // We DON'T revoke immediately to avoid the GUID/ghost issue
      }, 10000);

      console.log("PDF download triggered successfully.");

    } catch (err: any) {
      console.error("Critical PDF Error:", err);
      alert("Hubo un error al procesar el reporte clínico. Intente de nuevo.");
    } finally {
      setIsGeneratingPDF(false);
    }
  };

  return (
    <div className="min-h-screen bg-nutrity-bg text-nutrity-primary font-body">
      <main>
        {view === "landing" && <NutrityLanding onStart={handleStartOnboarding} onAuthClick={handleAuthClick} />}
        {view === "onboarding" && (
          <div className="relative">
            <NutrityOnboarding
              onComplete={handleCompleteOnboarding}
              onBack={() => setView("landing")}
              onAuthClick={handleAuthClick}
            />
            {(user?.email === 'biovital.365@gmail.com' || user?.profile?.role === 'ADMIN') && (
              <button
                onClick={() => {
                  const dummy = { name: "Admin", age: "40", condition: "prevention", currentGlucose: "normal", interest: "quinoa" };
                  handleCompleteOnboarding(dummy);
                }}
                className="fixed bottom-4 right-4 text-[10px] text-nutrity-gray-text opacity-20 hover:opacity-100 font-bold uppercase tracking-widest"
              >
                Master Bypass Admin →
              </button>
            )}
          </div>
        )}
        {view === "dashboard" && results && (
          <NutrityDashboard
            results={results}
            user={{ ...user, profile }}
            onViewDetail={(p) => setSelectedPillar(p)}
            onGeneratePDF={handleGeneratePDF}
            onRequireAuth={() => setShowAuthModal(true)}
            onLogout={handleLogout}
            isGeneratingPDF={isGeneratingPDF}
          />
        )}
      </main>

      {/* Auth Modal Overlay */}
      {showAuthModal && (
        <div className="fixed inset-0 z-[300] bg-nutrity-primary/40 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg relative overflow-hidden ring-1 ring-black/5">
            <button onClick={() => setShowAuthModal(false)} className="absolute top-6 right-6 p-2 rounded-full hover:bg-nutrity-bg transition-all z-10 text-nutrity-gray-text opacity-50">
              <X className="w-6 h-6" />
            </button>
            <div className="p-2">
              <Auth onAuthSuccess={handleAuthSuccess} onBack={() => setShowAuthModal(false)} />
            </div>
          </div>
        </div>
      )}

      {/* PDF Generation Overlay */}
      {isGeneratingPDF && (
        <div className="fixed inset-0 z-[200] bg-nutrity-primary/60 backdrop-blur-md flex items-center justify-center p-6">
          <div className="bg-white w-full max-w-sm rounded-3xl p-10 shadow-2xl flex flex-col items-center gap-6 text-center animate-in zoom-in-95 duration-300 ring-1 ring-black/5">
            <div className="w-16 h-16 border-4 border-nutrity-accent border-t-transparent rounded-full animate-spin"></div>
            <div>
              <h3 className="text-xl font-display font-bold mb-2">Generando Reporte Profesional</h3>
              <p className="text-sm text-nutrity-gray-text">Sincronizando biomarcadores para auditoría médica...</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
