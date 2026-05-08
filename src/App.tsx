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
import * as aiService from "./lib/ai-service";
import { OnboardingDataSchema } from "./lib/schemas";
import { dbService } from "./lib/db-service";
import { jsPDF } from "jspdf";
import { Download, X, CheckCircle2, LogOut } from "lucide-react";

export default function App() {
  // V7.2 Nature Biotech Edition - Build Trigger
  const [view, setView] = useState<"landing" | "onboarding" | "dashboard" | "detail" | "auth" | "history">("landing");
  const [results, setResults] = useState<any>(null);
  const [weeklyMenu, setWeeklyMenu] = useState<any>(null);
  const [selectedPillar, setSelectedPillar] = useState<string>("");
  const [user, setUser] = useState<any>(null); // Firebase User
  const [profile, setProfile] = useState<any>(null); // Supabase Profile
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [isRestoringSession, setIsRestoringSession] = useState(true); // Evita flash de landing antes de cargar sesión
  const [isGeneratingPlan, setIsGeneratingPlan] = useState(false);

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
    setIsGeneratingPlan(true);
    try {
      let processedResults;
      
      try {
        // Intentar generación con IA
        const validatedData = OnboardingDataSchema.parse(data);
        const aiPlan = await aiService.generateAILifePlan(validatedData);
        processedResults = { ...aiPlan, name: data.name, condition: data.condition };
      } catch (aiErr) {
        console.warn("AI Plan generation failed, falling back to static engine:", aiErr);
        // Fallback al motor estático
        const plan = generateMetabolicPlan(data);
        processedResults = { ...plan, name: data.name, condition: data.condition };
      }

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
    } finally {
      setIsGeneratingPlan(false);
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
      const doc = new jsPDF({ orientation: 'p', unit: 'mm', format: 'a4' });
      const margin = 20;
      let y = 0;

      // Helper para rectángulos redondeados y diseño
      const drawHeader = (title: string, subtitle: string, color = [15, 23, 42]) => {
        doc.setFillColor(248, 250, 252);
        doc.rect(0, 0, 210, 40, 'F');
        doc.setFont("helvetica", "bold");
        doc.setFontSize(22);
        doc.setTextColor(color[0], color[1], color[2]);
        doc.text(title, margin, 20);
        doc.setFontSize(9);
        doc.setFont("helvetica", "normal");
        doc.setTextColor(100, 116, 139);
        doc.text(subtitle, margin, 28);
        doc.setDrawColor(color[0], color[1], color[2]);
        doc.setLineWidth(1);
        doc.line(margin, 35, 60, 35);
      };

      // --- PÁGINA 1: STATUS CLÍNICO ---
      drawHeader("AUDITORÍA DE REMISIÓN METABÓLICA", "NUTRITY GLOBAL AI - PROTOCOLO DE PRECISIÓN 2025");
      y = 55;

      // Ficha del Paciente
      doc.setFillColor(241, 245, 249);
      doc.roundedRect(margin, y, 170, 30, 3, 3, 'F');
      doc.setFontSize(10);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(51, 65, 85);
      doc.text("EXPEDIENTE BIO-DIGITAL", margin + 5, y + 8);
      
      doc.setFont("helvetica", "normal");
      doc.setFontSize(9);
      const patientName = (results.name || user?.profile?.name || "PACIENTE").toUpperCase();
      doc.text(`Paciente: ${patientName}`, margin + 5, y + 16);
      doc.text(`Fase Actual: ${results.phase || 'Activación'}`, margin + 5, y + 22);
      doc.text(`ID Clínico: ${user?.uid?.substring(0, 10)}`, 120, y + 16);
      doc.text(`Fecha: ${new Date().toLocaleDateString()}`, 120, y + 22);

      y += 45;
      
      // Indicador de Remisión (Gauge Visual)
      doc.setFont("helvetica", "bold");
      doc.setFontSize(14);
      doc.setTextColor(79, 70, 229);
      doc.text("I. SCORE DE SENSIBILIDAD BIOLÓGICA", margin, y);
      
      y += 10;
      const score = results.remissionScore || 85;
      doc.setDrawColor(226, 232, 240);
      doc.setFillColor(241, 245, 249);
      doc.rect(margin, y, 170, 8, 'F');
      doc.setFillColor(34, 197, 94); // Green
      doc.rect(margin, y, (170 * score) / 100, 8, 'F');
      doc.setFontSize(8);
      doc.setTextColor(255, 255, 255);
      doc.text(`${score}% OPTIMIZADO`, margin + 5, y + 5.5);

      y += 20;

      // Diagnóstico IA (Insight)
      doc.setFont("helvetica", "bold");
      doc.setFontSize(14);
      doc.setTextColor(15, 23, 42);
      doc.text("II. INSIGHT METABÓLICO (INTELIGENCIA CLÍNICA)", margin, y);
      
      y += 8;
      doc.setFontSize(10);
      doc.setFont("helvetica", "italic");
      doc.setTextColor(71, 85, 105);
      const insight = results.insight || "Se detecta una oportunidad crítica de reprogramación. El protocolo se ajustará para estabilizar el eje insulina-glucosa mediante superfoods andinos.";
      const insightLines = doc.splitTextToSize(insight, 170);
      doc.text(insightLines, margin, y);
      y += (insightLines.length * 6) + 15;

      // Pilares del Plan
      doc.setFont("helvetica", "bold");
      doc.setFontSize(14);
      doc.setTextColor(15, 23, 42);
      doc.text("III. PILARES DE RESTAURACIÓN", margin, y);
      
      y += 10;
      (results.pillars || []).forEach((p: any, i: number) => {
        doc.setFillColor(248, 250, 252);
        doc.roundedRect(margin, y, 170, 15, 2, 2, 'F');
        doc.setFontSize(10);
        doc.setTextColor(79, 70, 229);
        doc.text(`${p.tag}: ${p.title}`, margin + 5, y + 9);
        y += 18;
      });

      // --- PÁGINA 2: MENÚ SEMANAL DE PRECISIÓN ---
      doc.addPage();
      drawHeader("CRONOGRAMA NUTRICIONAL DE PRECISIÓN", "PLAN SEMANAL BASADO EN BIOMARCADORES Y SUPERFOODS", [22, 101, 52]);
      
      y = 55;
      const days = ["lunes", "martes", "miercoles", "jueves", "viernes", "sabado", "domingo"];
      const menu = weeklyMenu || {};

      days.forEach((day) => {
        const dayData = menu[day] || { breakfast: "Pendiente", lunch: "Pendiente", snack: "Pendiente", dinner: "Pendiente" };
        
        doc.setFillColor(240, 253, 244);
        doc.rect(margin, y, 170, 28, 'F');
        doc.setFont("helvetica", "bold");
        doc.setFontSize(10);
        doc.setTextColor(21, 128, 61);
        doc.text(day.toUpperCase(), margin + 2, y + 6);
        
        doc.setFont("helvetica", "normal");
        doc.setFontSize(8);
        doc.setTextColor(30, 41, 59);
        doc.text(`D: ${dayData.breakfast}`, margin + 25, y + 6);
        doc.text(`A: ${dayData.lunch}`, margin + 25, y + 11);
        doc.text(`S: ${dayData.snack}`, margin + 25, y + 16);
        doc.text(`C: ${dayData.dinner}`, margin + 25, y + 21);
        
        y += 32;
        if (y > 270) { doc.addPage(); y = 20; }
      });

      // --- PÁGINA 3: BIODESCODIFICACIÓN Y CUMPLIMIENTO ---
      doc.addPage();
      drawHeader("BIO-TRACKER & BIODESCODIFICACIÓN", "MONITOREO DE ADHERENCIA Y GESTIÓN EMOCIONAL", [194, 65, 12]);
      
      y = 55;

      // Alertas Metabólicas (Semáforo)
      doc.setFont("helvetica", "bold");
      doc.setFontSize(14);
      doc.setTextColor(15, 23, 42);
      doc.text("IV. SEMÁFORO DE CONTROL METABÓLICO", margin, y);
      
      y += 12;
      // Verde
      doc.setFillColor(34, 197, 94); doc.circle(margin + 5, y, 3, 'F');
      doc.setFontSize(9); doc.setTextColor(30, 41, 59);
      doc.text("ZONA DE REMISIÓN (70-110 mg/dL): Energía óptima y quema de grasa activa.", margin + 12, y + 1);
      y += 10;
      // Amarillo
      doc.setFillColor(234, 179, 8); doc.circle(margin + 5, y, 3, 'F');
      doc.text("ZONA DE OBSERVACIÓN (111-140 mg/dL): Posible inflamación o estrés celular.", margin + 12, y + 1);
      y += 10;
      // Rojo
      doc.setFillColor(239, 68, 68); doc.circle(margin + 5, y, 3, 'F');
      doc.text("ZONA DE RESISTENCIA (>140 mg/dL): Riesgo de glicación. Ajustar protocolo de inmediato.", margin + 12, y + 1);

      y += 20;

      // Biodescodificación
      doc.setFont("helvetica", "bold");
      doc.setFontSize(14);
      doc.text("V. RECOMENDACIÓN DE BIODESCODIFICACIÓN", margin, y);
      
      y += 10;
      doc.setFillColor(255, 247, 237);
      doc.roundedRect(margin, y, 170, 35, 3, 3, 'F');
      doc.setFontSize(10);
      doc.setFont("helvetica", "italic");
      doc.setTextColor(154, 52, 18);
      const bioText = "El síntoma es la solución biológica a un conflicto no resuelto. Tu resistencia a la insulina habla de una necesidad de 'defender tu territorio' o un 'miedo al futuro'. La remisión ocurre cuando el corazón comprende lo que el cuerpo expresa.";
      const bioLines = doc.splitTextToSize(bioText, 160);
      doc.text(bioLines, margin + 5, y + 10);

      y += 50;

      // Checklist de Adherencia
      doc.setFont("helvetica", "bold");
      doc.setFontSize(14);
      doc.setTextColor(15, 23, 42);
      doc.text("VI. CHECK-LIST DE CUMPLIMIENTO DIARIO", margin, y);
      
      y += 10;
      const checks = [
        "¿Cumplí con el ayuno 16:8?",
        "¿Consumí mi dosis de Superfoods (Tarwi/Yacón)?",
        "¿Realicé mis 20 min de Bio-Hacking (Fuerza/Frío)?",
        "¿Registré mis niveles de glucosa en la App?"
      ];

      checks.forEach((check) => {
        doc.setDrawColor(203, 213, 225);
        doc.rect(margin, y, 5, 5);
        doc.setFontSize(9);
        doc.setFont("helvetica", "normal");
        doc.text(check, margin + 8, y + 4);
        y += 10;
      });

      // Pie de Página
      doc.setFontSize(8);
      doc.setTextColor(148, 163, 184);
      doc.text("Certificado por el Algoritmo Bio-Integral 2025 - CONFIDENCIAL", margin, 285);

      // Descarga
      doc.save(`PROTOCOLO-REMISION-${patientName}.pdf`);

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
            onMenuUpdate={(menu) => setWeeklyMenu(menu)}
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
        className="fixed bottom-24 left-6 md:bottom-6 md:left-6 z-[100] bg-[#25D366] text-white p-4 rounded-full shadow-2xl hover:scale-110 transition-all active:scale-95 group flex items-center gap-2"
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

      {isGeneratingPlan && (
        <div className="fixed inset-0 z-[400] bg-nutrity-primary/80 backdrop-blur-xl flex items-center justify-center p-6">
          <div className="bg-white w-full max-w-md rounded-[2.5rem] p-12 shadow-2xl flex flex-col items-center gap-8 text-center animate-in zoom-in-95 duration-500 ring-1 ring-white/20">
            <div className="relative">
              <div className="w-24 h-24 border-4 border-nutrity-accent/20 rounded-full"></div>
              <div className="absolute inset-0 w-24 h-24 border-4 border-nutrity-accent border-t-transparent rounded-full animate-spin"></div>
              <Brain className="absolute inset-0 m-auto w-10 h-10 text-nutrity-accent animate-pulse" />
            </div>
            <div className="space-y-4">
              <h3 className="text-3xl font-display font-bold text-nutrity-primary">Diseñando tu Ecosistema Metabólico</h3>
              <p className="text-nutrity-gray-text font-medium leading-relaxed">
                Nuestra IA está analizando tus biomarcadores andinos y principios de Medicina de Restauración para crear un plan 100% personalizado...
              </p>
              <div className="flex items-center justify-center gap-2 pt-2">
                <span className="w-2 h-2 bg-nutrity-accent rounded-full animate-bounce [animation-delay:-0.3s]"></span>
                <span className="w-2 h-2 bg-nutrity-accent rounded-full animate-bounce [animation-delay:-0.15s]"></span>
                <span className="w-2 h-2 bg-nutrity-accent rounded-full animate-bounce"></span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
