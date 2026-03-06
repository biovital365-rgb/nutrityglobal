import { useState, useEffect, useRef } from "react";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { motion, AnimatePresence } from "motion/react";
import {
    Activity,
    Calendar,
    CheckCircle2,
    ChevronRight,
    TrendingDown,
    Zap,
    Heart,
    Brain,
    Download,
    Share2,
    Clock,
    Droplets,
    Send,
    ArrowUpRight,
    PlusCircle,
    X,
    Search,
    Info,
    ChefHat,
    ArrowLeft,
    Shield,
    Target,
    Leaf,
    LayoutDashboard,
    Utensils,
    ClipboardCheck,
    Stethoscope,
    FlaskConical,
    Users,
    Sparkles,
    BookOpen,
    GraduationCap,
    CreditCard,
    ArrowRight,
    Play,
    Coffee,
    Apple,
    LogOut,
    User,
    Trash2
} from "lucide-react";
import { foodCatalog } from "../lib/food-data";
import { micronutrientsData } from "../lib/micronutrients-data";
import { weeklyMenuData } from "../lib/menu-data";
import { auth, db } from "../lib/firebase";
import { collection, addDoc, serverTimestamp, query, where, orderBy, onSnapshot } from "firebase/firestore";
import { dbService, FoodItem, Micronutrient, Course, Lesson } from "../lib/db-service";
import { PricingTable } from "./PricingTable";
import { AdminPanel } from "./AdminPanel";
import { getDirectImageUrl } from "../lib/utils";

interface NutrityDashboardProps {
    results: any;
    user: any;
    onViewDetail: (pillar: string) => void;
    onGeneratePDF: () => void;
    onRequireAuth: () => void;
    onLogout: () => void;
    isGeneratingPDF?: boolean;
}

export function NutrityDashboard({ results, user, onViewDetail, onGeneratePDF, onRequireAuth, onLogout, isGeneratingPDF }: NutrityDashboardProps) {
    const [activeTab, setActiveTab] = useState("main");
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const firstName = results.name ? results.name.split(' ')[0] : "Freddy";

    // --- State for Features ---
    const [appointments, setAppointments] = useState<any[]>([]);
    const [measurements, setMeasurements] = useState<any[]>([]);
    const [chatMessages, setChatMessages] = useState<any[]>([]);
    const [inputMessage, setInputMessage] = useState("");
    const [isTyping, setIsTyping] = useState(false);
    const chatEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        if (activeTab === "coach") {
            scrollToBottom();
        }
    }, [chatMessages, activeTab]);

    const [showApptModal, setShowApptModal] = useState(false);
    const [showMeasureModal, setShowMeasureModal] = useState(false);
    const [selectedFood, setSelectedFood] = useState<FoodItem | null>(null);
    const [foodSearch, setFoodSearch] = useState("");
    const [microSearch, setMicroSearch] = useState("");
    const [selectedDay, setSelectedDay] = useState("lunes");

    // Form States
    const [newAppt, setNewAppt] = useState({ title: "", date: "", time: "", type: "Virtual" });
    const [newMeasure, setNewMeasure] = useState({
        type: "Glucosa",
        value: "",
        date: new Date().toISOString().split('T')[0],
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false })
    });

    // Supabase States
    const [foods, setFoods] = useState<FoodItem[]>([]);
    const [micros, setMicros] = useState<Micronutrient[]>([]);
    const [courses, setCourses] = useState<Course[]>([]);
    const [lessonProgress, setLessonProgress] = useState<Record<string, boolean>>({});
    const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
    const [isLoadingData, setIsLoadingData] = useState(true);

    useEffect(() => {
        const loadSupabaseData = async () => {
            try {
                const [foodData, microData, courseData] = await Promise.all([
                    dbService.getFoods(),
                    dbService.getMicronutrients(),
                    dbService.getCourses()
                ]);
                setFoods(foodData.length > 0 ? foodData : foodCatalog);
                setMicros(microData.length > 0 ? microData : micronutrientsData as any);
                setCourses(courseData);

                if (user?.uid) {
                    const progressMap = await dbService.getLessonsProgress(user.uid);
                    setLessonProgress(progressMap);
                }
            } catch (err) {
                console.error("Error loading Supabase data:", err);
                setFoods(foodCatalog);
                setMicros(micronutrientsData as any);
            } finally {
                setIsLoadingData(false);
            }
        };
        loadSupabaseData();
    }, [user?.id]);

    useEffect(() => {
        setChatMessages([
            {
                role: 'ai',
                text: `¡Hola ${firstName}! Bienvenido a tu ecosistema de precisión metabólica. \n\nSoy tu Coach con IA y estoy sincronizado con tu plan de **${results.phase}**. \n\nHe analizado tus bio-marcadores recientes y veo que tu pilar de **${results.pillars[0]?.title}** es la prioridad hoy. ¿Deseas registrar una nueva medición o tienes alguna duda sobre tu dieta?`
            }
        ]);
    }, [results.name, results.phase]);

    useEffect(() => {
        if (!user?.uid) return;

        const mQuery = query(collection(db, "measurements"), where("userId", "==", user.uid));
        const mUnsub = onSnapshot(mQuery, (snapshot) => {
            const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))
                .sort((a: any, b: any) => (b.timestamp?.seconds || 0) - (a.timestamp?.seconds || 0));
            setMeasurements(data.length > 0 ? data : [
                { id: 'def1', label: "Glucosa", value: "94 mg/dL", date: "2025-02-27", time: "08:15", status: "Óptimo" },
                { id: 'def2', label: "Peso", value: "78.5 kg", date: "2025-02-27", time: "07:30", status: "-0.5kg" }
            ]);
        });

        const aQuery = query(collection(db, "appointments"), where("userId", "==", user.uid));
        const aUnsub = onSnapshot(aQuery, (snapshot) => {
            const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))
                .sort((a: any, b: any) => (b.timestamp?.seconds || 0) - (a.timestamp?.seconds || 0));
            setAppointments(data.length > 0 ? data : [
                { id: 'def1', date: "Mañana, 09:00 AM", title: "Cita con Especialista", type: "Virtual" },
                { id: 'def2', date: "Lunes 10 Mar, 08:00 AM", title: "Control de Glucosa", type: "Lab" }
            ]);
        });

        return () => { mUnsub(); aUnsub(); };
    }, [user]);

    const handleAddAppointment = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user?.uid) { setShowApptModal(false); onRequireAuth(); return; }

        if (!newAppt.title || !newAppt.date || !newAppt.time) {
            alert("Por favor completa todos los campos.");
            return;
        }

        // Optimistic close
        setShowApptModal(false);

        try {
            await addDoc(collection(db, "appointments"), {
                userId: user.uid,
                title: newAppt.title,
                date: newAppt.date,
                time: newAppt.time,
                type: newAppt.type,
                timestamp: serverTimestamp()
            });
            setNewAppt({ title: "", date: "", time: "", type: "Virtual" });
        } catch (err) {
            console.error("Error adding appointment:", err);
            alert("Error al agendar. Verifica tus permisos o conexión.");
        }
    };

    const handleAddMeasurement = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user?.uid) { setShowMeasureModal(false); onRequireAuth(); return; }

        if (!newMeasure.value || !newMeasure.date || !newMeasure.time) {
            alert("Por favor completa todos los campos de medición.");
            return;
        }

        // Optimistic close
        setShowMeasureModal(false);

        try {
            await addDoc(collection(db, "measurements"), {
                userId: user.uid,
                label: newMeasure.type,
                value: newMeasure.value + (newMeasure.type === "Glucosa" ? " mg/dL" : " kg"),
                date: newMeasure.date,
                time: newMeasure.time,
                status: "Registrado",
                timestamp: serverTimestamp()
            });
            setNewMeasure({ ...newMeasure, value: "" });
        } catch (err) {
            console.error("Error adding measurement:", err);
            alert("Error al guardar la medición médica.");
        }
    };

    const handleSendMessage = async () => {
        if (!inputMessage.trim() || isTyping) return;

        const msgText = inputMessage;
        const userMsg = { role: 'user', text: msgText };
        setChatMessages(prev => [...prev, userMsg]);
        setInputMessage("");
        setIsTyping(true);

        try {
            const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
            if (!apiKey) throw new Error("API Key de Gemini no encontrada.");

            const genAI = new GoogleGenerativeAI(apiKey);
            const model = genAI.getGenerativeModel({ model: "gemini-pro" });

            const systemPrompt = `Eres Nutrity Coach IA, un experto en remisión metabólica clínica y oncología integrativa.
            Tu misión es guiar al usuario en su proceso de bio-optimización.
            
            DATOS DEL PACIENTE:
            - Nombre: ${firstName}
            - ID Sesión: ${user?.uid?.substring(0, 8)}
            - Fase Actual: ${results.phase}
            - Score de Remisión: ${results.remissionScore}%
            - Objetivo Principal: ${results.meta}
            - Bio-Insight Médico: ${results.insight}
            
            REGLAS DE COMUNICACIÓN:
            1. Longitud: Tus respuestas deben tener entre 15 y 250 palabras. Sé informativo pero conciso.
            2. Tono: Profesional, científico, basado en evidencia, pero profundamente motivador y empático.
            3. Especialidad: Habla sobre sensibilidad a la insulina, autofagia, biogénesis mitocondrial y el impacto de los carbohidratos.
            4. Recomendaciones: Si mencionas alimentos, prioriza los del catálogo: Tarwi, Quinoa Negra, Maca Negra, Yacón.
            5. Estilo: Usa Markdown para resaltar términos importantes (ej. **Autofagia**).
            
            Responde de forma que el usuario se sienta empoderado y con claridad clínica.`;

            const chat = model.startChat({
                history: [
                    { role: "user", parts: [{ text: systemPrompt }] },
                    { role: "model", parts: [{ text: "Entendido. Estoy listo para asistir a " + firstName + " con rigor científico y motivación clínica. ¿Cuál es su consulta?" }] },
                    ...chatMessages.map(m => ({
                        role: m.role === 'user' ? 'user' : 'model',
                        parts: [{ text: m.text }],
                    })).slice(-6) // Mantener contexto reciente
                ],
            });

            const result = await chat.sendMessage(msgText);
            const responseText = result.response.text();

            setChatMessages(prev => [...prev, { role: 'ai', text: responseText }]);
        } catch (err) {
            console.error("Gemini Error:", err);
            setChatMessages(prev => [...prev, { role: 'ai', text: `Lo siento${firstName ? ' ' + firstName : ''}, hubo un problema de sincronía con la IA. Es posible que falte la clave API VITE_GEMINI_API_KEY en Vercel. Por favor, verifica la configuración.` }]);
        } finally {
            setIsTyping(false);
        }
    };

    const navItems = [
        { id: "main", icon: LayoutDashboard, label: "Panel" },
        { id: "agenda", icon: Calendar, label: "Agenda" },
        { id: "coach", icon: Brain, label: "IA Coach" },
        { id: "measurements", icon: Activity, label: "Mediciones" },
        { id: "catalog", icon: Utensils, label: "Alimentos" },
        { id: "micronutrients", icon: Zap, label: "Micronutrientes" },
        { id: "academy", icon: BookOpen, label: "Academia" },
        { id: "menu", icon: ClipboardCheck, label: "Menú" },
        { id: "goals", icon: Target, label: "Metas" },
        { id: "profile", icon: User, label: "Perfil" },
        { id: "subscription", icon: CreditCard, label: "Mi Plan" },
        ...(user?.profile?.role === 'ADMIN' || user?.email === 'biovital.365@gmail.com' || user?.email === 'biovital.360@gmail.com' ? [{ id: "organization", icon: Users, label: "Organización" }] : [])
    ];

    const filteredFoods = (foods || []).filter(f =>
        f?.name?.toLowerCase().includes(foodSearch.toLowerCase()) ||
        f?.category?.toLowerCase().includes(foodSearch.toLowerCase())
    );

    const filteredMicros = (micros || []).filter(m =>
        m?.name?.toLowerCase().includes(microSearch.toLowerCase()) ||
        m?.category?.toLowerCase().includes(microSearch.toLowerCase())
    );

    return (
        <div id="dashboard-container" className="flex h-screen bg-nutrity-bg text-nutrity-primary overflow-hidden font-body">
            {/* Desktop Sidebar */}
            <aside className="hidden lg:flex flex-col w-64 bg-nutrity-primary text-white border-r border-white/5">
                <div className="p-8">
                    <div className="flex items-center gap-3 mb-10">
                        <div className="w-10 h-10 bg-nutrity-accent rounded-xl flex items-center justify-center shadow-lg shadow-nutrity-accent/20">
                            <Activity className="w-6 h-6 text-white" />
                        </div>
                        <div>
                            <h2 className="text-xl font-display font-bold leading-none">Nutrity</h2>
                            <span className="text-[10px] font-bold text-nutrity-accent uppercase tracking-[0.2em] leading-none">Global AI</span>
                        </div>
                    </div>
                    <nav className="space-y-1">
                        {navItems.map((item) => (
                            <button
                                key={item.id}
                                onClick={() => setActiveTab(item.id)}
                                className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-xl text-sm font-bold transition-all ${activeTab === item.id ? 'bg-white/10 text-white shadow-lg' : 'text-white/40 hover:text-white hover:bg-white/5'}`}
                            >
                                <item.icon className={`w-5 h-5 ${activeTab === item.id ? 'text-nutrity-accent' : ''}`} />
                                {item.label}
                            </button>
                        ))}
                    </nav>
                </div>
            </aside>

            {/* Main Content Area */}
            <main className="flex-1 flex flex-col overflow-hidden relative">
                <header className="h-20 bg-white border-b border-nutrity-border flex items-center justify-between px-8 z-20">
                    <div className="flex items-center gap-4">
                        <button className="lg:hidden p-2" onClick={() => setIsSidebarOpen(true)}><LayoutDashboard /></button>
                        <h1 className="text-sm md:text-xl font-display font-bold text-nutrity-primary tracking-tight truncate max-w-[150px] md:max-w-none">Nutrity V7 - Bio-Panel Médico</h1>
                    </div>
                    <div className="flex items-center gap-6">
                        <div className="hidden md:flex flex-col text-right">
                            <span className="text-[10px] font-bold text-nutrity-accent uppercase tracking-widest">{user?.email}</span>
                            <span className="text-sm font-bold text-nutrity-primary">{user?.profile?.plan || 'Básico (FREE)'}</span>
                        </div>
                        <button onClick={onGeneratePDF} disabled={isGeneratingPDF} className="bg-nutrity-primary text-white px-5 py-2.5 rounded-xl font-bold text-xs flex items-center gap-3 shadow-lg shadow-nutrity-primary/10 hover:scale-105 transition-all">
                            {isGeneratingPDF ? (
                                <span className="animate-pulse">Cargando PDF...</span>
                            ) : (
                                <><Download className="w-4 h-4" /> Exportar Reporte</>
                            )}
                        </button>
                        <button
                            onClick={onLogout}
                            title="Cerrar sesión"
                            className="p-2.5 rounded-xl border border-nutrity-border text-nutrity-gray-text hover:bg-red-50 hover:text-red-500 hover:border-red-200 transition-all"
                        >
                            <LogOut className="w-4 h-4" />
                        </button>
                    </div>
                </header>

                <div className="flex-1 overflow-y-auto p-8 scrollbar-hide">
                    <AnimatePresence mode="wait">
                        {activeTab === "main" && (
                            <motion.div key="main" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">
                                {/* Hero Card - Removing 'nutrity-card' to avoid baseline white override */}
                                <div className="bg-nutrity-primary p-6 md:p-12 text-white rounded-[32px] md:rounded-[40px] relative overflow-hidden group shadow-2xl ring-1 ring-white/10">
                                    <div className="relative z-10 grid lg:grid-cols-2 gap-10 items-center">
                                        <div className="space-y-6">
                                            <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-md px-4 py-1.5 rounded-full border border-white/10">
                                                <Zap className="w-4 h-4 text-nutrity-accent" />
                                                <span className="text-[10px] font-bold uppercase tracking-[0.2em]">Fase de Remisión Activa</span>
                                            </div>
                                            <h2 className="text-3xl md:text-5xl font-display font-bold leading-[1.1] uppercase tracking-tighter">PROTOCOLO MAESTRO: {results.phase} 2025</h2>
                                            <p className="text-base md:text-xl text-white/60 font-medium max-w-md">Hemos calibrado tu ecosistema metabólico basado en tu perfil biológico para acelerar tu restauración celular.</p>
                                        </div>
                                        <div className="grid md:grid-cols-2 gap-8">
                                            {/* Results Grid - Dynamic from 'results' */}
                                            <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl p-6 flex flex-col justify-center items-center text-center">
                                                <p className="text-[10px] font-bold text-white/50 uppercase tracking-widest mb-1">Score de Remisión</p>
                                                <div className="flex items-baseline gap-1">
                                                    <h4 className="text-4xl md:text-5xl font-black">{results.remissionScore}</h4>
                                                    <span className="text-lg md:text-xl font-bold opacity-40">%</span>
                                                </div>
                                            </div>
                                            <div className="bg-nutrity-accent/20 backdrop-blur-xl border border-nutrity-accent/30 rounded-3xl p-6 flex flex-col justify-center">
                                                <p className="text-[10px] font-bold text-nutrity-accent uppercase tracking-widest mb-2 flex items-center gap-2">
                                                    <Target className="w-3 h-3" /> Meta Principal
                                                </p>
                                                <h4 className="text-lg font-bold leading-tight uppercase tracking-tight">{results.meta}</h4>
                                            </div>
                                            <div className="lg:col-span-2 bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-6 relative overflow-hidden">
                                                <div className="flex items-start gap-4 relative z-10">
                                                    <div className="w-10 h-10 rounded-xl bg-nutrity-accent/20 flex items-center justify-center text-nutrity-accent shrink-0">
                                                        <Brain className="w-5 h-5" />
                                                    </div>
                                                    <div className="space-y-1">
                                                        <p className="text-[10px] font-bold text-white/50 uppercase tracking-widest">Bio-Insight IA</p>
                                                        <p className="text-sm font-medium leading-relaxed italic">"{results.insight}"</p>
                                                    </div>
                                                </div>
                                                <div className="absolute -bottom-6 -right-6 w-24 h-24 bg-nutrity-accent/10 rounded-full blur-2xl"></div>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="absolute top-0 right-0 w-96 h-96 bg-nutrity-accent/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
                                </div>

                                {/* Quick Actions Row */}
                                <div className="grid md:grid-cols-3 gap-6">
                                    <div className="nutrity-card p-6 flex items-center gap-6">
                                        <div className="w-14 h-14 rounded-2xl bg-nutrity-accent/10 flex items-center justify-center text-nutrity-accent shrink-0">
                                            <Calendar className="w-7 h-7" />
                                        </div>
                                        <div className="flex-1">
                                            <p className="text-[10px] font-bold text-nutrity-gray-text uppercase tracking-widest">Próximo Control</p>
                                            <h4 className="font-bold text-sm mt-0.5">{appointments[0]?.title || "Evaluación semanal"}</h4>
                                            <p className="text-[10px] font-bold text-nutrity-accent mt-1 bg-nutrity-accent/10 inline-block px-2 py-0.5 rounded-full">Mañana 09:00 AM</p>
                                        </div>
                                    </div>
                                    <div className="nutrity-card p-6 flex items-center gap-6">
                                        <div className="w-14 h-14 rounded-2xl bg-nutrity-success/10 flex items-center justify-center text-nutrity-success shrink-0">
                                            <Utensils className="w-7 h-7" />
                                        </div>
                                        <div className="flex-1">
                                            <p className="text-[10px] font-bold text-nutrity-gray-text uppercase tracking-widest">Plan Nutricional</p>
                                            <h4 className="font-bold text-sm mt-0.5">Gestión de Macros</h4>
                                            <p className="text-[10px] font-bold text-nutrity-gray-text mt-1 opacity-50">Proteína alta & Fibra</p>
                                        </div>
                                    </div>
                                    <div className="nutrity-card p-6 flex items-center gap-6 cursor-pointer hover:border-nutrity-accent transition-all group" onClick={() => setShowMeasureModal(true)}>
                                        <div className="w-14 h-14 rounded-2xl bg-nutrity-primary/5 flex items-center justify-center text-nutrity-primary shrink-0 group-hover:bg-nutrity-accent group-hover:text-white transition-all">
                                            <PlusCircle className="w-7 h-7" />
                                        </div>
                                        <div className="flex-1">
                                            <p className="text-[10px] font-bold text-nutrity-gray-text uppercase tracking-widest">Registrar Datos</p>
                                            <h4 className="font-bold text-sm mt-0.5">Sincronizar ahora</h4>
                                            <p className="text-[10px] font-bold text-nutrity-gray-text mt-1 opacity-50">Sube tu última medición</p>
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        )}

                        {activeTab === "coach" && (
                            <motion.div key="coach" initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} className="h-full flex flex-col">
                                <div className="nutrity-card flex-1 flex flex-col overflow-hidden bg-white shadow-xl shadow-slate-200/50">
                                    <div className="p-4 md:p-8 border-b border-nutrity-border flex flex-wrap items-center justify-between bg-white/50 backdrop-blur-md gap-4">
                                        <div className="flex items-center gap-3 md:gap-4">
                                            <div className="w-10 h-10 md:w-12 md:h-12 rounded-2xl bg-nutrity-accent flex items-center justify-center text-white shadow-lg shadow-nutrity-accent/20">
                                                <Brain className="w-6 h-6 md:w-7 md:h-7" />
                                            </div>
                                            <div>
                                                <h3 className="font-display font-bold text-lg md:text-xl leading-none">Nutrity Coach IA</h3>
                                                <div className="flex items-center gap-2">
                                                    <span className="w-2 h-2 bg-nutrity-success rounded-full animate-pulse"></span>
                                                    <p className="text-[9px] font-bold text-nutrity-gray-text uppercase tracking-[0.2em]">Sincronía Biológica Activa</p>
                                                </div>
                                            </div>
                                        </div>
                                        <button
                                            onClick={() => setChatMessages([])}
                                            className="flex items-center gap-2 px-4 py-2 bg-rose-50 text-rose-500 rounded-xl text-[10px] font-bold uppercase tracking-widest hover:bg-rose-100 transition-all border border-rose-100"
                                        >
                                            <Trash2 className="w-3.5 h-3.5" />
                                            Limpiar Chat
                                        </button>
                                    </div>

                                    <div className="flex-1 overflow-y-auto p-4 md:p-8 space-y-6 md:space-y-8 scrollbar-hide bg-slate-50/30">
                                        {chatMessages.map((msg, i) => (
                                            <motion.div
                                                key={i}
                                                initial={{ opacity: 0, y: 10 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                                            >
                                                <div className={`max-w-[85%] md:max-w-[75%] p-4 md:p-5 rounded-2xl shadow-sm ${msg.role === 'user'
                                                    ? 'bg-nutrity-accent text-white rounded-br-none shadow-nutrity-accent/10'
                                                    : 'bg-white text-nutrity-primary border border-nutrity-border rounded-bl-none'
                                                    }`}>
                                                    <p className="text-xs md:text-[13px] font-medium leading-relaxed whitespace-pre-line">{msg.text}</p>
                                                    {msg.role === 'ai' && (
                                                        <div className="mt-4 pt-4 border-t border-nutrity-border flex items-center gap-2 text-[8px] font-bold text-nutrity-accent uppercase tracking-[0.2em]">
                                                            <Zap className="w-3 h-3" /> Bio-Feedback Activo v4.0
                                                        </div>
                                                    )}
                                                </div>
                                            </motion.div>
                                        ))}
                                        {isTyping && (
                                            <div className="flex justify-start">
                                                <div className="bg-white border border-nutrity-border p-5 rounded-2xl rounded-bl-none flex gap-1.5 items-center">
                                                    <span className="w-1.5 h-1.5 bg-nutrity-accent rounded-full animate-bounce"></span>
                                                    <span className="w-1.5 h-1.5 bg-nutrity-accent rounded-full animate-bounce [animation-delay:0.2s]"></span>
                                                    <span className="w-1.5 h-1.5 bg-nutrity-accent rounded-full animate-bounce [animation-delay:0.4s]"></span>
                                                </div>
                                            </div>
                                        )}
                                        <div ref={chatEndRef} />
                                    </div>

                                    <div className="p-6 bg-white border-t border-nutrity-border">
                                        <div className="flex gap-4">
                                            <input
                                                type="text"
                                                value={inputMessage}
                                                onChange={(e) => setInputMessage(e.target.value)}
                                                onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                                                placeholder="Ej: ¿Qué puedo cenar para estabilizar mi glucosa?"
                                                className="flex-1 bg-nutrity-bg border border-nutrity-border rounded-xl px-5 py-4 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-nutrity-accent/10 focus:border-nutrity-accent transition-all"
                                            />
                                            <button
                                                onClick={handleSendMessage}
                                                disabled={!inputMessage.trim() || isTyping}
                                                className="bg-nutrity-accent text-white p-4 rounded-xl shadow-lg hover:bg-opacity-90 transition-all disabled:opacity-50"
                                            >
                                                <Send className="w-5 h-5" />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        )}

                        {activeTab === "micronutrients" && (
                            <motion.div key="micronutrients" initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }}>
                                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
                                    <div className="space-y-1">
                                        <h2 className="text-3xl font-display font-bold">Micronutrientes Críticos</h2>
                                        <p className="text-nutrity-gray-text text-sm">Cofactores esenciales para tu regeneración celular de precisión.</p>
                                    </div>
                                    <div className="relative w-full md:w-80">
                                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-nutrity-gray-text opacity-40" />
                                        <input
                                            type="text"
                                            placeholder="Buscar micronutriente..."
                                            value={microSearch}
                                            onChange={(e) => setMicroSearch(e.target.value)}
                                            className="w-full bg-white border border-nutrity-border rounded-xl pl-11 pr-5 py-3.5 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-nutrity-accent/10 focus:border-nutrity-accent transition-all shadow-sm"
                                        />
                                    </div>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                    {filteredMicros.map((micro) => (
                                        <div key={micro.id} className="nutrity-card p-8 hover:border-nutrity-accent transition-all group relative overflow-hidden">
                                            <div className="flex items-center justify-between mb-6">
                                                <div className="w-12 h-12 rounded-xl bg-nutrity-accent/10 flex items-center justify-center text-nutrity-accent group-hover:scale-110 transition-transform">
                                                    <Zap className="w-7 h-7" />
                                                </div>
                                                <span className="px-3 py-1 bg-nutrity-bg border border-nutrity-border rounded-full text-[9px] font-bold text-nutrity-primary uppercase tracking-widest">{micro.category}</span>
                                            </div>
                                            <h3 className="text-2xl font-bold mb-2">{micro.name}</h3>
                                            <p className="text-xs text-nutrity-gray-text font-medium leading-relaxed mb-6">{micro.function}</p>
                                            <div className="space-y-4">
                                                <div className="flex flex-col gap-1.5">
                                                    <span className="text-[9px] font-bold text-nutrity-gray-text uppercase tracking-widest opacity-50">Fuentes Bioavales</span>
                                                    <div className="flex flex-wrap gap-2">
                                                        {micro.sources.map((s, i) => (
                                                            <span key={i} className="px-2 py-0.5 bg-nutrity-bg text-[10px] font-bold text-nutrity-primary rounded-md">{s}</span>
                                                        ))}
                                                    </div>
                                                </div>
                                                <div className="flex flex-col gap-1.5">
                                                    <span className="text-[9px] font-bold text-nutrity-gray-text uppercase tracking-widest opacity-50">Señal de Deficiencia</span>
                                                    <div className="flex items-center gap-2">
                                                        <Info className="w-3 h-3 text-rose-500" />
                                                        <span className="text-xs font-bold text-rose-500">{micro.deficiencySigns[0]}</span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </motion.div>
                        )}

                        {activeTab === "academy" && (
                            <motion.div key="academy" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">
                                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                                    <div className="space-y-1">
                                        <h2 className="text-3xl font-display font-bold">Academia Nutrity Global</h2>
                                        <p className="text-nutrity-gray-text text-sm">Medicina de Restauración y Bio-señalización para la remisión de DM2.</p>
                                    </div>
                                    <div className="bg-nutrity-accent/10 px-4 py-2 rounded-xl flex items-center gap-3 border border-nutrity-accent/20">
                                        <GraduationCap className="w-5 h-5 text-nutrity-accent" />
                                        <span className="text-[10px] font-bold text-nutrity-accent uppercase tracking-widest">Acompañamiento Educativo</span>
                                    </div>
                                </div>

                                {!selectedCourse ? (
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                        {courses.map((course) => (
                                            <div key={course.id} className="nutrity-card overflow-hidden group hover:border-nutrity-accent transition-all flex flex-col">
                                                <div className="h-48 overflow-hidden relative">
                                                    <img src={getDirectImageUrl(course.thumbnail)} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" alt={course.title} />
                                                    <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-md px-3 py-1 rounded-lg text-[10px] font-bold text-nutrity-accent uppercase tracking-widest">
                                                        {course.category}
                                                    </div>
                                                </div>
                                                <div className="p-8 flex-1 flex flex-col">
                                                    <h3 className="text-2xl font-bold mb-3">{course.title}</h3>
                                                    <p className="text-sm text-nutrity-gray-text mb-8 leading-relaxed font-medium line-clamp-2">{course.description}</p>
                                                    <div className="mt-auto pt-6 border-t border-nutrity-border flex items-center justify-between">
                                                        <div className="flex flex-col">
                                                            <div className="flex items-center gap-2 mb-1">
                                                                <Play className="w-3 h-3 text-nutrity-accent" />
                                                                <span className="text-[10px] font-bold text-nutrity-gray-text uppercase tracking-widest">{course.lessons?.length || 6} Lecciones</span>
                                                            </div>
                                                            <span className="text-lg font-bold text-nutrity-primary">${course.price} <span className="text-[10px] text-nutrity-gray-text">USD</span></span>
                                                        </div>
                                                        <button
                                                            onClick={async () => {
                                                                const detailed = await dbService.getCourseWithLessons(course.id);
                                                                if (course.price > 0 && !(user as any)?.profile?.plan?.includes('ELITE')) {
                                                                    const checkoutUrl = course.paypalUrl || "https://www.paypal.com/ncp/payment/CMG445X32EL2S";
                                                                    window.open(checkoutUrl, "_blank");
                                                                } else {
                                                                    setSelectedCourse(detailed);
                                                                }
                                                            }}
                                                            className="px-6 py-3 bg-nutrity-primary text-white text-[10px] font-bold uppercase tracking-widest rounded-xl shadow-lg shadow-nutrity-primary/10 hover:bg-nutrity-accent transition-all"
                                                        >
                                                            {course.price > 0 && !user?.profile?.plan?.includes('ELITE') ? 'Comprar Curso' : 'Iniciar Aprendizaje'}
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="space-y-8">
                                        <button onClick={() => setSelectedCourse(null)} className="flex items-center gap-2 text-nutrity-accent font-bold text-xs uppercase tracking-widest hover:underline mb-4">
                                            <ArrowLeft className="w-4 h-4" /> Volver al Catálogo
                                        </button>
                                        <div className="grid lg:grid-cols-3 gap-8">
                                            <div className="lg:col-span-2 space-y-6">
                                                <div className="aspect-video bg-black rounded-3xl overflow-hidden shadow-2xl relative group cursor-pointer">
                                                    <img src={getDirectImageUrl(selectedCourse.thumbnail)} className="w-full h-full object-cover opacity-60" />
                                                    <div className="absolute inset-0 flex items-center justify-center">
                                                        <Play className="w-20 h-20 text-white/20 group-hover:scale-110 group-hover:text-nutrity-accent transition-all duration-300" />
                                                        <div className="absolute bottom-8 left-8 right-8 text-white">
                                                            <p className="text-[10px] font-bold uppercase tracking-widest text-nutrity-accent mb-2">Reproduciendo ahora</p>
                                                            <h3 className="text-2xl font-bold">Introducción al Protocolo de Remisión</h3>
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="space-y-4">
                                                    <h3 className="text-xl font-bold">Acerca de esta lección</h3>
                                                    <p className="text-sm text-nutrity-gray-text leading-relaxed font-medium">
                                                        Este curso ha sido diseñado bajo los principios de la Medicina de Restauración. No se trata de contar calorías, sino de entender cómo los alimentos actúan como moléculas de señalización para reprogramar tu inteligencia biológica y revertir la disfunción metabólica.
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="space-y-6">
                                                <h3 className="font-display font-bold text-lg">Currículo del Curso</h3>
                                                <div className="space-y-3">
                                                    {selectedCourse.lessons?.sort((a, b) => a.order - b.order).map((lesson, idx) => (
                                                        <div key={lesson.id}
                                                            onClick={async () => {
                                                                if (user?.uid) {
                                                                    const newStatus = !lessonProgress[lesson.id];
                                                                    await dbService.toggleLessonProgress(user.uid, lesson.id, newStatus);
                                                                    setLessonProgress(prev => ({ ...prev, [lesson.id]: newStatus }));
                                                                }
                                                            }}
                                                            className={`p-4 rounded-2xl border transition-all cursor-pointer ${lessonProgress[lesson.id] ? 'bg-nutrity-success/5 border-nutrity-success/30 opacity-70' : (idx === 0 ? 'bg-nutrity-accent/5 border-nutrity-accent' : 'bg-white border-nutrity-border hover:border-nutrity-accent/30')}`}>
                                                            <div className="flex gap-4">
                                                                <div className={`w-8 h-8 rounded-lg shrink-0 flex items-center justify-center font-bold text-xs ${lessonProgress[lesson.id] ? 'bg-nutrity-success text-white' : (idx === 0 ? 'bg-nutrity-accent text-white' : 'bg-nutrity-bg text-nutrity-gray-text')}`}>
                                                                    {lessonProgress[lesson.id] ? <CheckCircle2 className="w-4 h-4" /> : lesson.order}
                                                                </div>
                                                                <div>
                                                                    <h4 className={`text-sm font-bold leading-snug ${lessonProgress[lesson.id] ? 'text-nutrity-gray-text line-through' : (idx === 0 ? 'text-nutrity-primary' : 'text-nutrity-gray-text')}`}>{lesson.title}</h4>
                                                                    <div className="flex items-center gap-3 mt-2">
                                                                        <span className="text-[9px] font-bold text-nutrity-gray-text uppercase tracking-widest">15:00 min</span>
                                                                        {lesson.isFree ? (
                                                                            <span className="text-[9px] font-bold text-nutrity-success uppercase tracking-widest bg-nutrity-success/10 px-2 py-0.5 rounded-full">Gratis</span>
                                                                        ) : (
                                                                            <Shield className="w-3 h-3 text-nutrity-accent opacity-30" />
                                                                        )}
                                                                        {lessonProgress[lesson.id] && <span className="text-[9px] font-bold text-nutrity-success uppercase tracking-widest">Completado</span>}
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </motion.div>
                        )}

                        {activeTab === "subscription" && (
                            <motion.div key="subscription" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">
                                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                                    <div className="space-y-1">
                                        <h2 className="text-3xl font-display font-bold">Planes de Membresía</h2>
                                        <p className="text-nutrity-gray-text text-sm">Gestiona tu suscripción y accede a beneficios exclusivos Bio-SaaS.</p>
                                    </div>
                                    <div className="bg-nutrity-accent/10 px-4 py-2 rounded-xl flex items-center gap-3 border border-nutrity-accent/20">
                                        <Shield className="w-5 h-5 text-nutrity-accent" />
                                        <span className="text-[10px] font-bold text-nutrity-accent uppercase tracking-widest">Pago Seguro via Stripe</span>
                                    </div>
                                </div>

                                <div className="bg-white/50 backdrop-blur-sm p-6 rounded-3xl border border-nutrity-border flex items-center justify-between mb-10">
                                    <div className="flex items-center gap-6">
                                        <div className="w-16 h-16 rounded-2xl bg-nutrity-primary text-white flex items-center justify-center shadow-lg shadow-nutrity-primary/20">
                                            <Sparkles className="w-8 h-8" />
                                        </div>
                                        <div>
                                            <p className="text-[10px] font-bold text-nutrity-gray-text uppercase tracking-widest mb-1">Tu Estado Actual</p>
                                            <h3 className="text-2xl font-bold">Plan {user?.profile?.plan || 'Básico (FREE)'}</h3>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-xs text-nutrity-gray-text font-medium mb-1 line-through opacity-50">$29/mes</p>
                                        <p className="text-xl font-bold text-nutrity-success">$0 <span className="text-xs text-nutrity-gray-text font-medium">Bajo Piloto</span></p>
                                    </div>
                                </div>

                                <PricingTable
                                    currentPlan={user?.profile?.plan || 'FREE'}
                                    onSelectPlan={(plan) => {
                                        if (plan.paypalUrl) {
                                            window.open(plan.paypalUrl, "_blank");
                                        }
                                    }}
                                />

                                <div className="bg-nutrity-primary/5 p-8 rounded-3xl border border-nutrity-primary/10 flex flex-col items-center text-center">
                                    <Shield className="w-10 h-10 text-nutrity-primary/40 mb-4" />
                                    <h4 className="text-lg font-bold mb-2">Transacciones Protegidas via PayPal</h4>
                                    <p className="text-sm text-nutrity-gray-text max-w-lg">
                                        Utilizamos el procesamiento seguro de PayPal para todas las transacciones. Tu información financiera está protegida y nunca toca nuestros servidores. Una vez realizado el pago, el acceso al material se habilitará automáticamente.
                                    </p>
                                </div>
                            </motion.div>
                        )}

                        {activeTab === "measurements" && (
                            <motion.div key="measures" initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} className="space-y-8">
                                <div className="flex items-center justify-between">
                                    <div className="space-y-1">
                                        <h2 className="text-3xl font-display font-bold">Bio-Seguimiento</h2>
                                        <p className="text-nutrity-gray-text text-sm">Historial de marcadores críticos sincronizados en tiempo real.</p>
                                    </div>
                                    <button onClick={() => setShowMeasureModal(true)} className="bg-nutrity-accent text-white px-6 py-4 rounded-xl font-bold text-xs shadow-lg shadow-nutrity-accent/20 flex items-center gap-3 active:scale-95 transition-all">
                                        <PlusCircle className="w-5 h-5" /> Nueva Medición
                                    </button>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                    {measurements.slice(0, 3).map((m, i) => (
                                        <div key={m.id} className="nutrity-card p-8 group hover:border-nutrity-accent transition-all relative overflow-hidden">
                                            <div className="relative z-10 flex items-center justify-between mb-4">
                                                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${m.label === 'Glucosa' ? 'bg-nutrity-accent/10 text-nutrity-accent' : 'bg-nutrity-success/10 text-nutrity-success'}`}>
                                                    {m.label === 'Glucosa' ? <Droplets className="w-6 h-6" /> : <Activity className="w-6 h-6" />}
                                                </div>
                                                <span className="text-[10px] font-bold text-nutrity-gray-text opacity-40 uppercase tracking-widest">{m.date}</span>
                                            </div>
                                            <div className="relative z-10">
                                                <h3 className="text-3xl font-display font-bold text-nutrity-primary">{m.value}</h3>
                                                <p className="text-[10px] font-bold text-nutrity-gray-text uppercase tracking-widest mt-2">{m.label}</p>
                                            </div>
                                            <div className="mt-6 flex items-center gap-2 relative z-10">
                                                <span className="px-3 py-1 bg-nutrity-success/10 text-nutrity-success rounded-full text-[9px] font-bold uppercase tracking-widest">{m.status}</span>
                                                <Clock className="w-3.5 h-3.5 opacity-20 ml-auto" />
                                                <span className="text-[9px] font-bold opacity-30">{m.time}</span>
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                <div className="nutrity-card bg-white overflow-hidden flex flex-col shadow-xl shadow-slate-200/50">
                                    <div className="p-8 border-b border-nutrity-border flex items-center justify-between">
                                        <h3 className="font-display font-bold text-xl">Bitácora Médica</h3>
                                        <TrendingDown className="w-6 h-6 text-nutrity-accent opacity-40" />
                                    </div>
                                    <div className="overflow-x-auto">
                                        <table className="w-full text-left">
                                            <thead>
                                                <tr className="bg-slate-50/50 text-[10px] font-bold uppercase tracking-widest text-nutrity-gray-text/60">
                                                    <th className="py-5 px-8">Fecha & Hora</th>
                                                    <th className="py-5 px-8">Marcador</th>
                                                    <th className="py-5 px-8">Valor Obtenido</th>
                                                    <th className="py-5 px-8">Evaluación IA</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-nutrity-border">
                                                {measurements.map((m) => (
                                                    <tr key={m.id} className="hover:bg-slate-50 transition-colors group">
                                                        <td className="py-6 px-8 flex flex-col">
                                                            <span className="font-bold text-sm leading-none mb-1 group-hover:text-nutrity-accent transition-colors">{m.date}</span>
                                                            <span className="text-[10px] font-bold text-nutrity-gray-text opacity-40 uppercase">{m.time}</span>
                                                        </td>
                                                        <td className="py-6 px-8 text-sm font-bold text-nutrity-primary">{m.label}</td>
                                                        <td className="py-6 px-8 text-lg font-display font-bold text-nutrity-accent">{m.value}</td>
                                                        <td className="py-6 px-8">
                                                            <span className="px-4 py-1.5 rounded-xl bg-nutrity-bg border border-nutrity-border text-nutrity-primary text-[10px] font-bold uppercase tracking-widest">{m.status}</span>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            </motion.div>
                        )}

                        {(activeTab === "organization" && (user?.profile?.role === 'ADMIN' || user?.email === 'biovital.365@gmail.com' || user?.email === 'biovital.360@gmail.com')) && (
                            <AdminPanel user={user} />
                        )}

                        {activeTab === "catalog" && (
                            <motion.div key="catalog" initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} className="space-y-8">
                                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
                                    <div className="space-y-1">
                                        <h2 className="text-3xl font-display font-bold">Catálogo Metabólico</h2>
                                        <p className="text-nutrity-gray-text text-sm">Alimentos con grado terapéutico para tu fase de {results.phase}.</p>
                                    </div>
                                    <div className="relative w-full md:w-80">
                                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-nutrity-gray-text opacity-40" />
                                        <input
                                            type="text"
                                            placeholder="Buscar superalimento..."
                                            value={foodSearch}
                                            onChange={(e) => setFoodSearch(e.target.value)}
                                            className="w-full bg-white border border-nutrity-border rounded-xl pl-11 pr-5 py-3.5 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-nutrity-accent/10 focus:border-nutrity-accent transition-all shadow-sm"
                                        />
                                    </div>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                                    {filteredFoods.map((food) => (
                                        <div key={food.id} className="nutrity-card overflow-hidden group hover:border-nutrity-accent transition-all">
                                            <div className="h-40 relative">
                                                <img src={getDirectImageUrl(food.image)} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                                                <div className="absolute top-3 left-3 px-3 py-1 bg-white/90 backdrop-blur-md rounded-lg text-[8px] font-bold text-nutrity-accent uppercase tracking-widest">{food.category}</div>
                                            </div>
                                            <div className="p-6">
                                                <h3 className="font-bold text-lg mb-1">{food.name}</h3>
                                                <p className="text-[10px] text-nutrity-gray-text font-medium mb-4 line-clamp-2">{food.description}</p>
                                                <div className="flex flex-wrap gap-1.5 mb-4">
                                                    {food.metabolicBenefits.slice(0, 2).map((b, i) => (
                                                        <span key={i} className="px-2 py-0.5 bg-nutrity-accent/5 text-nutrity-accent text-[8px] font-bold rounded-md">{b}</span>
                                                    ))}
                                                </div>
                                                <div className="pt-4 border-t border-nutrity-border flex justify-between items-center">
                                                    <div className="flex flex-col">
                                                        <span className="text-[8px] font-bold text-nutrity-gray-text uppercase opacity-40">Proteína</span>
                                                        <span className="text-xs font-bold">{food.nutrients.protein}</span>
                                                    </div>
                                                    <div className="flex flex-col text-right">
                                                        <span className="text-[8px] font-bold text-nutrity-gray-text uppercase opacity-40">Fibra</span>
                                                        <span className="text-xs font-bold">{food.nutrients.fiber}</span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </motion.div>
                        )}

                        {activeTab === "menu" && (
                            <motion.div key="menu" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">
                                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                                    <div className="space-y-1">
                                        <h2 className="text-3xl font-display font-bold">Menú Semanal de Precisión</h2>
                                        <p className="text-nutrity-gray-text text-sm">Cronograma nutricional diseñado para tu meta de {results.meta}.</p>
                                    </div>
                                    <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
                                        {Object.keys(weeklyMenuData).map((day) => (
                                            <button
                                                key={day}
                                                onClick={() => setSelectedDay(day)}
                                                className={`px-5 py-2.5 rounded-xl text-xs font-bold uppercase tracking-widest transition-all ${selectedDay === day ? 'bg-nutrity-accent text-white shadow-lg' : 'bg-white text-nutrity-gray-text border border-nutrity-border hover:border-nutrity-accent/30'}`}
                                            >
                                                {day}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <div className="grid lg:grid-cols-4 gap-8">
                                    {[
                                        { label: "Desayuno", time: "08:00 AM", meal: weeklyMenuData[selectedDay].breakfast, icon: Coffee, color: "text-amber-500" },
                                        { label: "Almuerzo", time: "01:00 PM", meal: weeklyMenuData[selectedDay].lunch, icon: Utensils, color: "text-nutrity-accent" },
                                        { label: "Snack", time: "04:30 PM", meal: weeklyMenuData[selectedDay].snack, icon: Apple, color: "text-rose-500" },
                                        { label: "Cena", time: "07:30 PM", meal: weeklyMenuData[selectedDay].dinner, icon: Heart, color: "text-indigo-500" }
                                    ].map((item, i) => (
                                        <div key={i} className="nutrity-card p-10 space-y-8 flex flex-col group hover:border-nutrity-accent transition-all">
                                            <div className="flex justify-between items-start">
                                                <div className={`w-14 h-14 rounded-2xl bg-slate-50 flex items-center justify-center ${item.color} group-hover:scale-110 transition-transform`}>
                                                    <item.icon className="w-8 h-8" />
                                                </div>
                                                <div className="text-right">
                                                    <p className="text-[10px] font-bold text-nutrity-gray-text uppercase tracking-widest opacity-40">{item.time}</p>
                                                    <h4 className="font-bold text-nutrity-primary">{item.label}</h4>
                                                </div>
                                            </div>
                                            <p className="text-lg font-medium leading-relaxed italic text-nutrity-primary/80 flex-1">"{item.meal}"</p>
                                            <div className="pt-6 border-t border-nutrity-border">
                                                <div className="flex items-center gap-2">
                                                    <Zap className="w-3 h-3 text-nutrity-accent" />
                                                    <span className="text-[10px] font-bold uppercase tracking-widest text-nutrity-accent">Optimización Activa</span>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                <div className="nutrity-card bg-nutrity-primary p-8 text-white relative overflow-hidden">
                                    <div className="relative z-10 flex items-center justify-between">
                                        <div className="flex items-center gap-6">
                                            <div className="w-16 h-16 rounded-3xl bg-white/10 flex items-center justify-center">
                                                <Target className="w-8 h-8 text-nutrity-accent" />
                                            </div>
                                            <div>
                                                <p className="text-[10px] font-bold text-white/40 uppercase tracking-widest mb-1">Meta Metabólica del Día</p>
                                                <h4 className="text-2xl font-bold">{weeklyMenuData[selectedDay].metabolicGoal}</h4>
                                            </div>
                                        </div>
                                        <div className="hidden md:block">
                                            <button className="px-6 py-3 bg-white/10 hover:bg-white/20 rounded-xl text-xs font-bold uppercase tracking-widest transition-all">Ver Recomendaciones Detalladas</button>
                                        </div>
                                    </div>
                                    <div className="absolute top-0 right-0 w-64 h-64 bg-nutrity-accent/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
                                </div>
                            </motion.div>
                        )}

                        {activeTab === "goals" && (
                            <motion.div key="goals" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-8">
                                <div className="space-y-1">
                                    <h2 className="text-3xl font-display font-bold">Metas Metabólicas</h2>
                                    <p className="text-nutrity-gray-text text-sm">Objetivos clínicos personalizados para tu remisión celular.</p>
                                </div>

                                <div className="grid md:grid-cols-2 gap-8">
                                    <div className="nutrity-card p-10 space-y-10">
                                        <h3 className="text-xl font-bold border-b border-nutrity-border pb-6 flex items-center gap-3">
                                            <Target className="w-6 h-6 text-nutrity-accent" /> Meta Principal
                                        </h3>
                                        <div className="flex items-center gap-10">
                                            <div className="w-32 h-32 rounded-full border-[10px] border-nutrity-accent border-t-nutrity-bg flex items-center justify-center relative shadow-lg shadow-nutrity-accent/10">
                                                <span className="text-3xl font-black">{results.remissionScore}%</span>
                                            </div>
                                            <div className="flex-1 space-y-2">
                                                <h4 className="text-2xl font-black text-nutrity-primary leading-tight uppercase tracking-tight">{results.meta}</h4>
                                                <p className="text-sm text-nutrity-gray-text font-medium leading-relaxed">Progreso actual basado en tus últimos bio-marcadores y cumplimiento del protocolo.</p>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="nutrity-card p-10 space-y-8">
                                        <h3 className="text-xl font-bold border-b border-nutrity-border pb-6">Checklist de Remisión</h3>
                                        <div className="space-y-5">
                                            {[
                                                { label: "Estabilización de Glucosa basal < 100", done: true },
                                                { label: "Inducción de flexibilidad metabólica", done: results.remissionScore > 60 },
                                                { label: "Reducción de inflamación sistémica", done: results.remissionScore > 40 },
                                                { label: "Optimización de salud mitocondrial", done: false }
                                            ].map((goal, i) => (
                                                <div key={i} className="flex items-center gap-4">
                                                    <div className={`w-6 h-6 rounded-lg flex items-center justify-center transition-colors ${goal.done ? 'bg-nutrity-success text-white' : 'bg-nutrity-bg border border-nutrity-border'}`}>
                                                        {goal.done && <CheckCircle2 className="w-4 h-4" />}
                                                    </div>
                                                    <span className={`text-sm font-bold ${goal.done ? 'text-nutrity-primary' : 'text-nutrity-gray-text opacity-50'}`}>{goal.label}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>

                                <div className="nutrity-card p-10 bg-slate-50/50 border-dashed border-2 flex flex-col items-center justify-center text-center py-20">
                                    <div className="w-20 h-20 rounded-3xl bg-nutrity-accent/10 flex items-center justify-center text-nutrity-accent mb-6">
                                        <PlusCircle className="w-10 h-10" />
                                    </div>
                                    <h3 className="text-2xl font-bold mb-2">Añadir Meta Personalizada</h3>
                                    <p className="text-sm text-nutrity-gray-text max-w-sm mb-8">Define objetivos específicos como peso, circunferencia abdominal o niveles de vitalidad.</p>
                                    <button className="px-8 py-4 bg-nutrity-primary text-white text-xs font-bold uppercase tracking-widest rounded-xl shadow-xl shadow-nutrity-primary/10 hover:bg-nutrity-accent transition-all">Configurar Nueva Meta</button>
                                </div>
                            </motion.div>
                        )}



                        {/* Fallback for other tabs */}
                        {activeTab === "agenda" && (
                            <motion.div key="agenda" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">
                                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
                                    <div className="space-y-1">
                                        <h2 className="text-3xl font-display font-bold">Agenda de Control Médico</h2>
                                        <p className="text-nutrity-gray-text text-sm">Gestiona tus citas de seguimiento y evaluaciones metabólicas.</p>
                                    </div>
                                    <button
                                        onClick={() => setShowApptModal(true)}
                                        className="bg-nutrity-accent text-white px-6 py-4 rounded-xl font-bold text-xs shadow-lg shadow-nutrity-accent/20 flex items-center gap-3 active:scale-95 transition-all"
                                    >
                                        <Calendar className="w-5 h-5" /> Agendar Nueva Cita
                                    </button>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                    {appointments.map((appt) => (
                                        <div key={appt.id} className="nutrity-card p-8 group hover:border-nutrity-accent transition-all relative overflow-hidden">
                                            <div className="flex items-start justify-between mb-6">
                                                <div className="w-12 h-12 rounded-xl bg-nutrity-accent/10 flex items-center justify-center text-nutrity-accent group-hover:scale-110 transition-transform">
                                                    <Calendar className="w-7 h-7" />
                                                </div>
                                                <span className={`px-3 py-1 rounded-full text-[9px] font-bold uppercase tracking-widest ${appt.type === 'Virtual' ? 'bg-blue-50 text-blue-500' : 'bg-emerald-50 text-emerald-500'
                                                    }`}>
                                                    {appt.type || 'Presencial'}
                                                </span>
                                            </div>
                                            <h3 className="text-xl font-bold mb-2">{appt.title}</h3>
                                            <div className="space-y-3">
                                                <div className="flex items-center gap-3 text-nutrity-gray-text font-medium">
                                                    <Clock className="w-4 h-4 opacity-40" />
                                                    <span className="text-xs">{appt.date} {appt.time ? ` - ${appt.time}` : ''}</span>
                                                </div>
                                                <p className="text-[10px] font-bold text-nutrity-accent uppercase tracking-widest bg-nutrity-accent/5 inline-block px-3 py-1 rounded-lg">Confirmada por IA</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                {appointments.length === 0 && (
                                    <div className="nutrity-card p-20 flex flex-col items-center justify-center text-center space-y-4 opacity-50">
                                        <Calendar className="w-16 h-16 text-nutrity-gray-text" />
                                        <p className="font-bold text-nutrity-primary uppercase tracking-widest">No hay citas registradas</p>
                                        <p className="text-xs max-w-xs">Agenda tu primera evaluación para iniciar el seguimiento de tu remisión.</p>
                                    </div>
                                )}
                            </motion.div>
                        )}

                        {!["main", "coach", "micronutrients", "measurements", "academy", "subscription", "organization", "catalog", "menu", "goals", "agenda"].includes(activeTab) && (
                            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col items-center justify-center p-20 text-center space-y-6">
                                <div className="w-20 h-20 bg-nutrity-bg rounded-3xl flex items-center justify-center text-nutrity-accent/20">
                                    <FlaskConical className="w-10 h-10" />
                                </div>
                                <div className="space-y-2">
                                    <h3 className="text-2xl font-display font-bold">Sección en Sincronización</h3>
                                    <p className="text-nutrity-gray-text max-w-sm">Estamos actualizando este componente para cumplir con los estándares Clinical Tech v4.2.</p>
                                </div>
                                <button onClick={() => setActiveTab("main")} className="text-nutrity-accent font-bold text-sm uppercase tracking-widest hover:underline px-6 py-2 border border-nutrity-accent/20 rounded-xl">Regresar al Panel</button>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

                {/* Dashboard Footer with Admin Access */}
                <footer className="px-4 md:px-8 py-4 md:py-6 border-t border-nutrity-border bg-white/50 backdrop-blur-sm flex flex-col md:flex-row items-center justify-between gap-4 text-center md:text-left">
                    <div className="flex items-center gap-2 text-nutrity-gray-text opacity-40">
                        <Activity className="w-4 h-4" />
                        <span className="text-[10px] font-bold uppercase tracking-widest">&copy; 2025 Nutrity Global AI - Clinical Edition</span>
                    </div>

                    <div className="flex items-center gap-4">
                        {(user?.profile?.role === 'ADMIN' || user?.email === 'biovital.365@gmail.com' || user?.email === 'biovital.360@gmail.com') ? (
                            <button
                                onClick={() => setActiveTab("organization")}
                                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-nutrity-primary/5 hover:bg-nutrity-primary/10 text-nutrity-primary transition-all group"
                                title="Acceso Directo Admin"
                            >
                                <Shield className="w-4 h-4 text-nutrity-accent group-hover:scale-110 transition-transform" />
                                <span className="text-[10px] font-bold uppercase tracking-widest">Panel de Control Bio-Master</span>
                            </button>
                        ) : (
                            <button
                                onClick={() => {
                                    // Hidden shortcut to login as admin
                                    if (confirm("¿Desea cambiar a la cuenta de Administrador Maestro?")) {
                                        onLogout();
                                    }
                                }}
                                className="opacity-10 hover:opacity-50 transition-opacity p-2"
                                title="Master Access"
                            >
                                <Shield className="w-3.5 h-3.5 text-nutrity-gray-text" />
                            </button>
                        )}
                    </div>
                </footer>
            </main>

            {/* Combined Modal System */}
            <AnimatePresence mode="wait">
                {/* Appointment Modal */}
                {showApptModal && (
                    <motion.div
                        key="appt-modal"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[200] bg-nutrity-primary/60 backdrop-blur-md flex items-center justify-center p-6"
                    >
                        <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }} className="bg-white w-full max-w-md rounded-2xl p-10 shadow-2xl relative border border-white/20">
                            <button onClick={() => setShowApptModal(false)} className="absolute top-8 right-8 p-2 rounded-full hover:bg-nutrity-bg text-nutrity-gray-text opacity-50"><X className="w-5 h-5" /></button>
                            <h3 className="text-2xl font-display font-bold mb-1">Agendar Nueva Cita</h3>
                            <p className="text-sm text-nutrity-gray-text mb-8 font-medium">Organiza tu seguimiento médico inteligente</p>
                            <form onSubmit={handleAddAppointment} className="space-y-6">
                                <div className="space-y-1.5 font-medium">
                                    <label className="text-[10px] font-bold text-nutrity-gray-text uppercase tracking-widest ml-1">Asunto de la Cita</label>
                                    <input type="text" placeholder="Ej: Control Metabólico" className="w-full bg-nutrity-bg border border-nutrity-border rounded-xl px-4 py-4 focus:ring-2 focus:ring-nutrity-accent/10 focus:border-nutrity-accent outline-none font-bold placeholder:opacity-30" value={newAppt.title} onChange={(e) => setNewAppt({ ...newAppt, title: e.target.value })} />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-1.5">
                                        <label className="text-[10px] font-bold text-nutrity-gray-text uppercase tracking-widest ml-1">Fecha (Manual)</label>
                                        <input type="date" className="w-full bg-nutrity-bg border border-nutrity-border rounded-xl px-4 py-4 focus:ring-2 focus:ring-nutrity-accent/10 outline-none font-bold" value={newAppt.date} onChange={(e) => setNewAppt({ ...newAppt, date: e.target.value })} />
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-[10px] font-bold text-nutrity-gray-text uppercase tracking-widest ml-1">Hora (Manual)</label>
                                        <input type="time" className="w-full bg-nutrity-bg border border-nutrity-border rounded-xl px-4 py-4 focus:ring-2 focus:ring-nutrity-accent/10 outline-none font-bold" value={newAppt.time} onChange={(e) => setNewAppt({ ...newAppt, time: e.target.value })} />
                                    </div>
                                </div>
                                <button type="submit" className="w-full bg-nutrity-primary text-white py-5 rounded-xl font-bold shadow-lg shadow-nutrity-accent/20 active:scale-95 transition-all text-sm uppercase tracking-widest mt-2">Confirmar Cita</button>
                            </form>
                        </motion.div>
                    </motion.div>
                )}

                {/* Measurement Modal */}
                {showMeasureModal && (
                    <motion.div
                        key="measure-modal"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[200] bg-nutrity-primary/60 backdrop-blur-md flex items-center justify-center p-6"
                    >
                        <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }} className="bg-white w-full max-w-md rounded-2xl p-10 shadow-2xl relative">
                            <button onClick={() => setShowMeasureModal(false)} className="absolute top-8 right-8 p-2 rounded-full hover:bg-nutrity-bg text-nutrity-gray-text opacity-50"><X className="w-5 h-5" /></button>
                            <h3 className="text-2xl font-display font-bold mb-1">Registrar Bio-Marcador</h3>
                            <p className="text-sm text-nutrity-gray-text mb-8 font-medium">Sincroniza tus datos con la IA en tiempo real</p>
                            <form onSubmit={handleAddMeasurement} className="space-y-6">
                                <div className="space-y-1.5 font-medium">
                                    <label className="text-[10px] font-bold text-nutrity-gray-text uppercase tracking-widest ml-1">Tipo de Medición</label>
                                    <select className="w-full bg-nutrity-bg border border-nutrity-border rounded-xl px-4 py-4 focus:ring-2 focus:ring-nutrity-accent/10 outline-none font-bold text-sm shadow-sm" value={newMeasure.type} onChange={(e) => setNewMeasure({ ...newMeasure, type: e.target.value })}>
                                        <option>Glucosa</option>
                                        <option>Peso</option>
                                        <option>Presión Arterial</option>
                                        <option>A1c</option>
                                    </select>
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-bold text-nutrity-gray-text uppercase tracking-widest ml-1">Valor Obtenido</label>
                                    <input type="number" step="0.1" placeholder={newMeasure.type === "Glucosa" ? "95 mg/dL" : "75 kg"} className="w-full bg-nutrity-bg border border-nutrity-border rounded-xl px-4 py-4 focus:ring-2 focus:ring-nutrity-accent/10 outline-none font-bold text-2xl text-nutrity-accent" value={newMeasure.value} onChange={(e) => setNewMeasure({ ...newMeasure, value: e.target.value })} />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-1.5">
                                        <label className="text-[10px] font-bold text-nutrity-gray-text uppercase tracking-widest ml-1">Fecha (Manual)</label>
                                        <input type="date" className="w-full bg-nutrity-bg border border-nutrity-border rounded-xl px-4 py-4 font-bold text-xs" value={newMeasure.date} onChange={(e) => setNewMeasure({ ...newMeasure, date: e.target.value })} />
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-[10px] font-bold text-nutrity-gray-text uppercase tracking-widest ml-1">Hora (Manual)</label>
                                        <input type="time" className="w-full bg-nutrity-bg border border-nutrity-border rounded-xl px-4 py-4 font-bold text-xs" value={newMeasure.time} onChange={(e) => setNewMeasure({ ...newMeasure, time: e.target.value })} />
                                    </div>
                                </div>
                                <button type="submit" className="w-full bg-nutrity-primary text-white py-5 rounded-xl font-bold shadow-lg shadow-nutrity-accent/20 active:scale-95 transition-all text-sm uppercase tracking-widest mt-2">Guardar Medición</button>
                            </form>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
