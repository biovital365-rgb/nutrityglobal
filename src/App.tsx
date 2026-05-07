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
  // V7.2 Nature Biotech Edition - Build Trigger
  const [view, setView] = useState<"landing" | "onboarding" | "dashboard" | "detail" | "auth" | "history">("landing");
  const [results, setResults] = useState<any>(null);
  const [selectedPillar, setSelectedPillar] = useState<string>("");
  const [user, setUser] = useState<any>(null); // Firebase User
  const [profile, setProfile] = useState<any>(null); // Supabase Profile
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [isRestoringSession, setIsRestoringSession] = useState(true); // Evita flash de landing antes de cargar sesión

  useEffect(() => {
    console.log("DEBUG: showAuthModal state changed to ->", showAuthModal);
  }, [showAuthModal]);
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        setUser(firebaseUser);
        setShowAuthModal(false);
        
        try {
          // Sincronizar perfil y obtener última evaluación
          const [p, supabaseEval] = await Promise.all([
            dbService.syncUserProfile(firebaseUser),
            dbService.getLatestEvaluation(firebaseUser.uid)
          ]);
          
          setProfile(p);

          if (supabaseEval?.results) {
            setResults(supabaseEval.results);
            setView("dashboard");
          } else if (p?.role === 'ADMIN' || firebaseUser.email === 'biovital.365@gmail.com') {
            // Caso Admin sin evaluación previa
            setResults({ 
              name: p?.name || "Admin", condition: "prevention", phase: "Activación",
              remissionScore: 85,
              pillars: [
                { title: "Metabolismo", desc: "Optimización de la flexibilidad metabólica." }, 
                { title: "Nutrición", desc: "Protocolo basado en superalimentos andinos." }
              ]
            });
            setView("dashboard");
          } else {
            setView("onboarding");
          }
        } catch (err) {
          console.error("Critical sync failed:", err);
          setView("onboarding"); // Si falla la carga, mejor re-evaluar o permitir entrar
        }
      } else {
        setUser(null);
        setProfile(null);
        setResults(null);
        setView("landing");
      }
      setIsRestoringSession(false);
    });
    return () => unsubscribe();
  }, []);

  const handleStartOnboarding = () => {
    if (!user) {
        setShowAuthModal(true);
    } else {
        setView("onboarding");
    }
  };

  const handleAuthClick = () => {
    setShowAuthModal(true);
  };

  const handleAuthSuccess = (userData: any) => {
    setUser(userData);
    setShowAuthModal(false);
    setIsRestoringSession(true);
  };

  const handleCompleteOnboarding = async (data: any) => {
    try {
      const plan = generateMetabolicPlan(data);
      const processedResults = { ...plan, name: data.name, condition: data.condition };

      setResults(processedResults);

      if (user) {
        setView("dashboard");
        // Guardar en Supabase (Async para no bloquear UI)
        dbService.saveEvaluation(
          user.uid, 
          profile?.organizationId, 
          data, 
          processedResults
        ).then(async () => {
          console.log("Evaluation persisted in Supabase");
          
          // --- AUTO-AGENDAMIENTO DE DIAGNÓSTICO PROFUNDO (+7 DÍAS) ---
          const nextDate = new Date();
          nextDate.setDate(nextDate.getDate() + 7);
          const dateStr = nextDate.toISOString().split('T')[0];
          
          try {
            await dbService.saveAppointment(user.uid, profile?.organizationId, {
              title: "Diagnóstico Profundo (7 Días)",
              date: dateStr,
              time: "10:00",
              type: "Virtual",
              status: "PROGRAMADA"
            });
            console.log("Auto-diagnosis appointment scheduled for:", dateStr);
          } catch (apptErr) {
            console.error("Failed to schedule auto-appointment:", apptErr);
          }
        }).catch(err => {
          console.error("Supabase persistent save failed:", err);
        });
      } else {
        setShowAuthModal(true);
      }
    } catch (err) {
      console.error("Onboarding logic failure:", err);
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

  // Nota: La carga de evaluación se maneja ahora centralmente en onAuthStateChanged
  // para evitar múltiples fuentes de verdad y race conditions.

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

      // 7. BIODESCODIFICACIÓN Y GESTIÓN EMOCIONAL
      y += 10;
      doc.setFont("helvetica", "bold");
      doc.setFontSize(13);
      doc.setTextColor(22, 163, 74); // Success Green
      doc.text("V. BIODESCODIFICACIÓN Y GESTIÓN EMOCIONAL", margin, y);

      y += 10;
      doc.setFontSize(10);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(30, 41, 59);
      
      const emotionalInsight = results.pillars?.find((p: any) => p.title === 'Mente')?.recommendation || "Identificar el conflicto de resistencia biológica.";
      doc.text(`• Nivel de Consciencia: ${data?.biodescodification || 'Evaluación Inicial'}`, margin + 5, y);
      y += 6;
      const emotionalLines = doc.splitTextToSize(`• Recomendación: ${emotionalInsight}`, 165);
      doc.text(emotionalLines, margin + 5, y);
      y += (emotionalLines.length * 6) + 12;

      // 8. PRÓXIMO CONTROL Y ACADEMIA
      doc.setFillColor(238, 242, 255);
      doc.rect(margin, y, 170, 35, 'F');
      
      y += 8;
      doc.setFont("helvetica", "bold");
      doc.setFontSize(11);
      doc.setTextColor(79, 70, 229);
      doc.text("PRÓXIMOS PASOS CRÍTICOS:", margin + 5, y);
      
      y += 6;
      doc.setFontSize(9);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(51, 65, 85);
      const nextDate = new Date();
      nextDate.setDate(nextDate.getDate() + 7);
      doc.text(`1. DIAGNÓSTICO PROFUNDO: Programado automáticamente para el ${nextDate.toLocaleDateString()}.`, margin + 5, y);
      y += 5;
      doc.setFont("helvetica", "bold");
      doc.text(`2. ACADEMIA NUTRITY: Adquiere tus Guías eBooks y Masterclasses en la sección Academia.`, margin + 5, y);
      y += 5;
      doc.setFont("helvetica", "normal");
      doc.text(`   Link Directo: https://nutrityglobal.ai/academy`, margin + 5, y);

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
        {/* Pantalla de carga mientras Firebase verifica la sesión */}
        {isRestoringSession ? (
          <div className="min-h-screen flex items-center justify-center bg-nutrity-bg">
            <div className="flex flex-col items-center gap-4">
              <div className="w-12 h-12 border-4 border-nutrity-accent border-t-transparent rounded-full animate-spin" />
              <p className="text-sm font-bold text-nutrity-gray-text uppercase tracking-widest">Cargando sesión...</p>
            </div>
          </div>
        ) : (
          <>
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
          </>
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

      {/* WhatsApp Floating Button */}
      <a
        href="https://bit.ly/whatsapp-update-channel"
        target="_blank"
        rel="noopener noreferrer"
        className="fixed bottom-6 left-6 z-[100] bg-[#25D366] text-white p-4 rounded-full shadow-2xl hover:scale-110 transition-all active:scale-95 group flex items-center gap-2"
        title="Canal de Actualizaciones"
      >
        <svg className="w-6 h-6 fill-current" viewBox="0 0 24 24">
          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L0 24l6.335-1.662c1.72.937 3.659 1.43 5.63 1.432h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
        </svg>
        <span className="max-w-0 overflow-hidden group-hover:max-w-xs transition-all duration-500 ease-in-out whitespace-nowrap text-xs font-bold uppercase tracking-widest">
          Canal VIP
        </span>
      </a>

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
