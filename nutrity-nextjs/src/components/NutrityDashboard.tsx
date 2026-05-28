import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import { z } from "zod";
import { WeeklyMenuSchema } from "../lib/schemas";
import * as aiService from "../lib/ai-service";
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
    Trash2,
    Pencil,
    AlertTriangle
} from "lucide-react";
import { PricingTable } from './PricingTable';
import { Course, Micronutrient } from "../lib/types";
import { foodCatalog, FoodItem } from "../lib/food-data";
import { micronutrientsData } from "../lib/micronutrients-data";
import { weeklyMenuData } from "../lib/menu-data";
import { useNutrityData } from '../hooks/useNutrityData';
import * as dbService from "@/actions/db-actions";
import { getDirectImageUrl } from '../lib/utils';
import { AdminPanel } from './AdminPanel';
import { BioPlanSection } from './BioPlanSection';

interface NutrityDashboardProps {
    results: any; // This is the MetabolicPlan
    user: any;
    onViewDetail: (pillar: string) => void;
    onGeneratePDF: () => void;
    onRequireAuth: () => void;
    onLogout: () => void;
    isGeneratingPDF?: boolean;
    onMenuUpdate?: (menu: any) => void;
}

export function NutrityDashboard({ results, user, onViewDetail, onGeneratePDF, onRequireAuth, onLogout, isGeneratingPDF, onMenuUpdate }: NutrityDashboardProps) {
    const [activeTab, setActiveTab] = useState("main");
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    if (user?.profile?.status === 'BLOCKED') {
        return (
            <div className="min-h-screen bg-nutrity-bg flex items-center justify-center p-6">
                <div className="nutrity-card p-12 max-w-lg text-center space-y-6 animate-in fade-in zoom-in duration-500">
                    <div className="w-20 h-20 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Shield className="w-10 h-10" />
                    </div>
                    <h2 className="text-3xl font-display font-bold text-nutrity-primary">Acceso Restringido</h2>
                    <p className="text-nutrity-gray-text font-medium leading-relaxed">
                        Tu cuenta ha sido bloqueada temporalmente por infracciones a los términos de servicio, falta de pago o por estar en estado de observación administrativa.
                    </p>
                    <div className="pt-4 space-y-4">
                        <p className="text-sm text-nutrity-gray-text opacity-70">Por favor, contacta con tu asesor o soporte para regularizar tu situación.</p>
                        <button 
                            onClick={onLogout} 
                            className="bg-nutrity-primary text-white px-10 py-4 rounded-xl font-bold uppercase tracking-widest transition-all hover:bg-nutrity-accent shadow-lg shadow-nutrity-primary/20 active:scale-95"
                        >
                            Cerrar Sesión
                        </button>
                    </div>
                </div>
            </div>
        );
    }
    // Priority: diagnostic name → DB profile name → email prefix (never hardcode "Freddy")
    const firstName = (
        results?.name ||
        user?.profile?.name ||
        user?.user_metadata?.full_name ||
        (user?.email ? user.email.split('@')[0] : '')
    ).split(' ')[0] || 'Amig@';

    // Contexto Multi-tenant
    const organizationId = user?.profile?.organizationId;
    
    // Centralized Data Hook (SaaS Isolation)
    const { 
        measurements, 
        appointments, 
        isDataLoading, 
        saveMeasurement, 
        saveAppointment,
        updateAppointment,
        deleteAppointment 
    } = useNutrityData((user?.id || user?.uid), organizationId);

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
    const [selectedMicro, setSelectedMicro] = useState<Micronutrient | null>(null);
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
    const [editingApptId, setEditingApptId] = useState<string | null>(null);
    const [notification, setNotification] = useState<{ type: 'success' | 'error', message: string } | null>(null);

    // Profile States
    const [profileForm, setProfileForm] = useState({
        name: user?.profile?.name || results?.name || "",
        email: user?.profile?.email || user?.email || "",
        phone: user?.profile?.phone || "",
        address: user?.profile?.address || "",
        age: user?.profile?.age || results?.age || "",
        occupation: user?.profile?.occupation || "",
        maritalStatus: user?.profile?.maritalStatus || "",
        socialMedia: user?.profile?.socialMedia || ""
    });

    // Sincronizar el formulario cuando el perfil del usuario cambia (al cargar de Supabase)
    useEffect(() => {
        if (user?.profile) {
            setProfileForm({
                name: user.profile.name || "",
                email: user.profile.email || user?.email || "",
                phone: user.profile.phone || "",
                address: user.profile.address || "",
                age: user.profile.age || "",
                occupation: user.profile.occupation || "",
                maritalStatus: user.profile.maritalStatus || "",
                socialMedia: user.profile.socialMedia || ""
            });
        }
    }, [user?.profile, user?.email]);
    const [isSavingProfile, setIsSavingProfile] = useState(false);
    const [isProfileComplete, setIsProfileComplete] = useState(false);

    useEffect(() => {
        // Solo marcar como completo si tenemos el objeto de perfil y los campos requeridos
        // Dilan e invitados deben tener estos datos para no ser redirigidos
        if (user?.profile && user?.email !== 'admin@nutrity.global' && user?.profile?.role !== 'ADMIN') {
            const hasPhone = !!user.profile.phone;
            
            // Relajamos la validación para evitar loops infinitos si el usuario prefiere no llenar todo
            // Pero mantenemos la redirección si no tiene celular (dato mínimo de contacto)
            const complete = hasPhone || user.profile.status === 'ACTIVE'; 
            setIsProfileComplete(complete);
            
            if (!complete && activeTab !== 'profile') {
                setActiveTab('profile');
            }
        } else {
            // Mientras carga o si es admin, no forzamos
            setIsProfileComplete(true); 
        }
    }, [user?.profile, user?.email, activeTab]);

    const [useSpecialDiet, setUseSpecialDiet] = useState(false);
    const [dynamicMenu, setDynamicMenu] = useState<any>(null);
    // ─── Menú Aprobado por Coach ─────────────────────────────────────────
    const [approvedMenuDays, setApprovedMenuDays] = useState<any[]>([]);
    const [menuStatus, setMenuStatus] = useState<'NONE' | 'PENDING' | 'APPROVED'>('NONE');
    const [isLoadingApprovedMenu, setIsLoadingApprovedMenu] = useState(false);

    // --- EFECTOS DE SINCRONIZACIÓN ---
    useEffect(() => {
        if (dynamicMenu) {
            onMenuUpdate?.(dynamicMenu);
        }
    }, [dynamicMenu, onMenuUpdate]);
    const [isGeneratingMenu, setIsGeneratingMenu] = useState(false);

    const generateDynamicMenu = async () => {
        if (isGeneratingMenu) return;
        setIsGeneratingMenu(true);
        try {
            const validatedMenu = await aiService.generateAIWeeklyMenu(results, results.name || "Freddy");
            setDynamicMenu(validatedMenu);

            // Persistencia determinística
            if ((user?.id || user?.uid)) {
                const today = new Date().toISOString().split('T')[0];
                await dbService.saveDailyMenu({
                    userId: user?.id,
                    date: today,
                    menuData: validatedMenu
                });
            }
        } catch (err) {
            console.error("Dynamic menu generation failed:", err);
            setDynamicMenu(weeklyMenuData);
        } finally {
            setIsGeneratingMenu(false);
        }
    };

    const handleRegenerateMeal = async (day: string, slot: string) => {
        if (!dynamicMenu || !(user?.id || user?.uid) || isGeneratingMenu) return;
        
        const currentMeal = dynamicMenu[day][slot];
        // We set a temporary loading text
        const tempMenu = { ...dynamicMenu, [day]: { ...dynamicMenu[day], [slot]: "Analizando biomarcadores para nueva opción..." } };
        setDynamicMenu(tempMenu);
        
        try {
            const newMeal = await aiService.regenerateMeal(results, day, slot, currentMeal);
            
            const updatedMenu = {
                ...dynamicMenu,
                [day]: {
                    ...dynamicMenu[day],
                    [slot]: newMeal
                }
            };
            
            setDynamicMenu(updatedMenu);
            
            // Persistencia
            const today = new Date().toISOString().split('T')[0];
            await dbService.saveDailyMenu({
                userId: user?.id,
                date: today,
                menuData: updatedMenu
            });
        } catch (err) {
            console.error("Meal regeneration failed:", err);
            setDynamicMenu(dynamicMenu); // Rollback
        }
    };

    // ─── Carga del Menú Personalizado (Aprobado por Coach) ─────────────────────
    useEffect(() => {
        const loadApprovedMenu = async () => {
            if (activeTab !== "menu" || !(user?.id || user?.uid) || isLoadingApprovedMenu) return;
            setIsLoadingApprovedMenu(true);
            try {
                // 1. Intentar obtener menú aprobado
                const approved = await dbService.getApprovedMenu(user?.id);
                if (approved.length > 0) {
                    setApprovedMenuDays(approved);
                    setMenuStatus('APPROVED');
                    setIsLoadingApprovedMenu(false);
                    return;
                }
                // 2. Si no hay aprobado, verificar si hay pendiente
                const pending = await dbService.getPendingMenu(user?.id);
                if (pending.length > 0) {
                    setMenuStatus('PENDING');
                } else {
                    setMenuStatus('NONE');
                }
            } catch (err) {
                console.error("Error loading approved menu:", err);
                setMenuStatus('NONE');
            } finally {
                setIsLoadingApprovedMenu(false);
            }
        };
        loadApprovedMenu();
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [activeTab, (user?.id || user?.uid)]);

    useEffect(() => {
        // Redirigir a perfil SOLO si:
        // 1. No es ADMIN (los admins tienen libertad total)
        // 2. El perfil ya cargó pero está incompleto
        const isAdmin = user?.profile?.role === 'ADMIN' || user?.email === 'biovital.365@gmail.com';
        
        if ((user?.id || user?.uid) && user?.profile && !isProfileComplete && activeTab !== "profile" && !isAdmin) {
            setActiveTab("profile");
        }
    }, [isProfileComplete, activeTab, (user?.id || user?.uid), user?.profile]);

    const handleAutoControl = async () => {
        if (!(user?.id || user?.uid)) { onRequireAuth(); return; }
        
        const nextDate = new Date();
        nextDate.setDate(nextDate.getDate() + 15);
        const dateStr = nextDate.toISOString().split('T')[0];
        
        const appt = {
            title: "Control Metabólico Automático",
            date: dateStr,
            time: "09:00",
            type: "Virtual",
            status: "PROGRAMADA"
        };

        try {
            await saveAppointment(appt);
            
            // Mensaje de WhatsApp de seguimiento
            const message = `Hola Nutrity Global, he programado mi próximo control metabólico para el día ${dateStr} a las 09:00 AM. Quedo atento a la confirmación.`;
            const phone = "51900000000"; // Placeholder - En producción esto debería venir del admin de la org
            window.open(`https://wa.me/${phone}?text=${encodeURIComponent(message)}`, "_blank");
            
            alert(`✅ Próximo control programado para el ${dateStr}.\n\nSe ha enviado un mensaje de seguimiento por WhatsApp. Si necesitas cambiar la fecha, puedes hacerlo desde la pestaña de Agenda.`);
        } catch (err) {
            console.error("Error al programar cita automática:", err);
            alert("No se pudo programar el control automáticamente.");
        }
    };

    const handlePlanNutricional = () => {
        setUseSpecialDiet(true);
        setActiveTab("menu");
    };

    const handleSaveProfile = async (e: React.FormEvent) => {
        e.preventDefault();
        // Allow save even if profile.id is not yet set (new users synced on load)
        const uid = user?.id || user?.uid;
        if (!uid) return;
        setIsSavingProfile(true);
        try {
            const updated = await dbService.updateUserProfile(uid, profileForm);
            // Reflect the saved profile back into local user state
            if (updated) {
                // We can't call setUser from outside page.tsx, so store in sessionStorage
                // as a signal for next reload, but mark profile complete immediately
                setIsProfileComplete(true);
            }
            setNotification({ type: 'success', message: '¡Perfil actualizado correctamente!' });
            setTimeout(() => setNotification(null), 3500);
            if (activeTab === "profile") setActiveTab("main");
        } catch (err) {
            console.error("Error saving profile", err);
            setNotification({ type: 'error', message: 'Error al guardar el perfil. Verifica tu conexión.' });
            setTimeout(() => setNotification(null), 4000);
        } finally {
            setIsSavingProfile(false);
        }
    };

    // Supabase States
    const [foods, setFoods] = useState<FoodItem[]>([]);
    const [micros, setMicros] = useState<Micronutrient[]>([]);
    const [courses, setCourses] = useState<Course[]>([]);
    const [activeLesson, setActiveLesson] = useState<any>(null);
    const [lessonProgress, setLessonProgress] = useState<Record<string, boolean>>({});
    const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
    const [isLoadingData, setIsLoadingData] = useState(true);

    useEffect(() => {
        const loadSupabaseData = async () => {
            try {
                // Inyectamos organizationId para filtrado multi-tenant
                const [foodData, microData, courseData] = await Promise.all([
                    dbService.getFoods(organizationId),
                    dbService.getMicronutrients(organizationId),
                    dbService.getCourses(organizationId)
                ]);
                setFoods(foodData.length > 0 ? foodData : foodCatalog);
                setMicros(microData.length > 0 ? microData : micronutrientsData as any);
                setCourses(courseData);

                if ((user?.id || user?.uid)) {
                    const progressMap = await dbService.getLessonsProgress(user?.id);
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
    }, [user?.id, organizationId]);

    // Refetch catalog data when returning to foods or micronutrients tabs
    // This ensures any changes made in the Admin Panel are reflected immediately
    useEffect(() => {
        if (activeTab === "foods" || activeTab === "micronutrients") {
            const refreshCatalog = async () => {
                try {
                    const [foodData, microData] = await Promise.all([
                        dbService.getFoods(organizationId),
                        dbService.getMicronutrients(organizationId)
                    ]);
                    if (foodData.length > 0) setFoods(foodData);
                    if (microData.length > 0) setMicros(microData);
                } catch (err) {
                    console.error("Error refreshing catalog data:", err);
                }
            };
            refreshCatalog();
        }
    }, [activeTab, organizationId]);

    useEffect(() => {
        setChatMessages([
            {
                role: 'ai',
                text: `¡Hola ${firstName}! Bienvenido a tu ecosistema de precisión metabólica. \n\nSoy tu Coach con IA y estoy sincronizado con tu plan de **${results?.phase || 'Activación'}**. \n\nHe analizado tus bio-marcadores recientes y veo que tu pilar de **${results?.pillars?.[0]?.title || 'Metabolismo'}** es la prioridad hoy. ¿Deseas registrar una nueva medición o tienes alguna duda sobre tu dieta?`
            }
        ]);
    }, [results?.name, results?.phase]);

    // Las mediciones y citas ahora se cargan automáticamente vía useNutrityData

    const handleAddAppointment = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!(user?.id || user?.uid)) { setShowApptModal(false); onRequireAuth(); return; }

        if (!newAppt.title || !newAppt.date || !newAppt.time) {
            alert("Por favor completa todos los campos.");
            return;
        }

        // Optimistic close
        setShowApptModal(false);

        try {
            if (editingApptId) {
                await updateAppointment(editingApptId, {
                    title: newAppt.title,
                    date: newAppt.date,
                    time: newAppt.time,
                    type: newAppt.type
                });
                alert("✅ Cita actualizada.");
            } else {
                await saveAppointment({
                    title: newAppt.title,
                    date: newAppt.date,
                    time: newAppt.time,
                    type: newAppt.type
                });
            }
            setNewAppt({ title: "", date: "", time: "", type: "Virtual" });
            setEditingApptId(null);
        } catch (err) {
            console.error("Error saving appointment:", err);
            alert("Error al procesar la cita.");
        }
    };

    const handleDeleteAppointment = async (id: string) => {
        if (!confirm("¿Estás seguro de que deseas eliminar esta cita?")) return;
        try {
            await deleteAppointment(id);
        } catch (err) {
            console.error("Error deleting appointment:", err);
            alert("No se pudo eliminar la cita.");
        }
    };

    const startEditAppointment = (appt: any) => {
        setNewAppt({
            title: appt.title,
            date: appt.date,
            time: appt.time || "",
            type: appt.type || "Virtual"
        });
        setEditingApptId(appt.id);
        setShowApptModal(true);
    };

    const handleAddMeasurement = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!(user?.id || user?.uid)) { setShowMeasureModal(false); onRequireAuth(); return; }

        if (!newMeasure.value || !newMeasure.date || !newMeasure.time) {
            alert("Por favor completa todos los campos de medición.");
            return;
        }

        // Optimistic close
        setShowMeasureModal(false);

        try {
            await saveMeasurement({
                label: newMeasure.type,
                value: newMeasure.value + (newMeasure.type === "Glucosa" ? " mg/dL" : " kg"),
                date: newMeasure.date,
                time: newMeasure.time,
                status: "Registrado"
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
            const responseText = await aiService.getAICoachResponse([...chatMessages, userMsg], {
                name: firstName,
                phase: results.phase,
                meta: results.meta
            });

            setChatMessages(prev => [...prev, { role: 'ai', text: responseText }]);
        } catch (err) {
            console.error("Gemini Error:", err);
            setChatMessages(prev => [...prev, { role: 'ai', text: "Lo siento, hubo un problema de sincronía con la IA. Verificando red metabólica..." }]);
        } finally {
            setIsTyping(false);
        }
    };

    const navItems = [
        { id: "main", icon: LayoutDashboard, label: "Panel", disabled: !isProfileComplete },
        { id: "agenda", icon: Calendar, label: "Agenda", disabled: !isProfileComplete },
        { id: "coach", icon: Brain, label: "IA Coach", disabled: !isProfileComplete },
        { id: "measurements", icon: Activity, label: "Mediciones", disabled: !isProfileComplete },
        { id: "catalog", icon: Utensils, label: "Alimentos", disabled: !isProfileComplete },
        { id: "micronutrients", icon: Zap, label: "Micronutrientes", disabled: !isProfileComplete },
        { id: "academy", icon: BookOpen, label: "Academia", disabled: !isProfileComplete },
        { id: "menu", icon: ClipboardCheck, label: "Menú", disabled: !isProfileComplete },
        { id: "goals", icon: Target, label: "Metas", disabled: !isProfileComplete },
        { id: "profile", icon: User, label: "Perfil" },
        { id: "subscription", icon: CreditCard, label: "Mi Plan", disabled: !isProfileComplete },
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
        <div id="dashboard-container" className="flex h-screen bg-nutrity-bg text-nutrity-primary overflow-hidden font-body pb-[90px] md:pb-0">
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
                            onClick={() => window.location.href = '/'}
                            title="Volver a Inicio"
                            className="p-2.5 rounded-xl border border-nutrity-border text-nutrity-gray-text hover:bg-slate-50 transition-all lg:hidden"
                        >
                            <X className="w-4 h-4" />
                        </button>
                        <button
                            onClick={onLogout}
                            title="Cerrar sesión"
                            className="p-2.5 rounded-xl border border-red-100 text-red-500 bg-red-50/30 hover:bg-red-50 hover:text-red-600 transition-all"
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

                                {/* ── MAPA DE RUTA BIOLÓGICO NMG (sólo si la IA lo generó) ── */}
                                {results?.nmgDiagnosis && (
                                    <motion.div
                                        initial={{ opacity: 0, y: 16 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: 0.2 }}
                                        className="nutrity-card p-6 md:p-8 border-l-4 border-nutrity-accent space-y-6"
                                    >
                                        {/* Header */}
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-2xl bg-nutrity-accent/10 flex items-center justify-center text-nutrity-accent">
                                                    <Stethoscope className="w-5 h-5" />
                                                </div>
                                                <div>
                                                    <p className="text-[9px] font-bold uppercase tracking-[0.2em] text-nutrity-accent">Nueva Medicina Germánica · NMG</p>
                                                    <h3 className="font-display font-bold text-lg leading-none">Mapa de Ruta Biológico</h3>
                                                </div>
                                            </div>
                                            <span className={`text-[9px] font-bold uppercase tracking-widest px-3 py-1 rounded-full border ${
                                                results.nmgDiagnosis.phase === 'Estrés'
                                                    ? 'border-amber-300 text-amber-600 bg-amber-50'
                                                    : results.nmgDiagnosis.phase === 'Reparación'
                                                    ? 'border-blue-300 text-blue-600 bg-blue-50'
                                                    : 'border-nutrity-success text-nutrity-success bg-green-50'
                                            }`}>
                                                Fase: {results.nmgDiagnosis.phase}
                                            </span>
                                        </div>

                                        {/* Conflicto raíz + órgano */}
                                        <div className="grid sm:grid-cols-2 gap-4">
                                            <div className="p-4 bg-nutrity-bg rounded-2xl space-y-1">
                                                <p className="text-[9px] font-bold uppercase tracking-widest text-nutrity-gray-text/60">Raíz Emocional del Conflicto</p>
                                                <p className="text-sm font-bold text-nutrity-primary">{results.nmgDiagnosis.conflict}</p>
                                            </div>
                                            <div className="p-4 bg-nutrity-bg rounded-2xl space-y-1">
                                                <p className="text-[9px] font-bold uppercase tracking-widest text-nutrity-gray-text/60">Sistema Biológico Afectado</p>
                                                <p className="text-sm font-bold text-nutrity-primary">{results.nmgDiagnosis.organ}</p>
                                            </div>
                                        </div>

                                        {/* Enfoque holístico multi-disciplina */}
                                        {results.nmgDiagnosis.holisticApproach?.length > 0 && (
                                            <div className="space-y-3">
                                                <p className="text-[9px] font-bold uppercase tracking-widest text-nutrity-gray-text/60">Protocolo Holístico Personalizado</p>
                                                <div className="grid sm:grid-cols-2 gap-3">
                                                    {results.nmgDiagnosis.holisticApproach.map((item: { discipline: string; recommendation: string }, idx: number) => (
                                                        <div key={idx} className="flex gap-3 p-3 bg-nutrity-accent/5 border border-nutrity-accent/10 rounded-xl">
                                                            <div className="w-6 h-6 rounded-lg bg-nutrity-accent/20 flex items-center justify-center shrink-0 mt-0.5">
                                                                <Sparkles className="w-3 h-3 text-nutrity-accent" />
                                                            </div>
                                                            <div>
                                                                <p className="text-[8px] font-bold uppercase tracking-widest text-nutrity-accent">{item.discipline}</p>
                                                                <p className="text-xs font-medium text-nutrity-primary leading-snug mt-0.5">{item.recommendation}</p>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        )}

                                        <div className="flex items-center gap-2 pt-2 border-t border-nutrity-border">
                                            <Brain className="w-3.5 h-3.5 text-nutrity-accent" />
                                            <p className="text-[9px] text-nutrity-gray-text">Generado por IA basado en tu Triaje Holístico · Actualiza tu diagnóstico completando un nuevo onboarding.</p>
                                        </div>
                                    </motion.div>
                                )}

                                {/* COACH CALL TO ACTION */}
                                {results?.coachCallToAction && (
                                    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="bg-gradient-to-r from-nutrity-primary to-nutrity-accent/80 p-6 md:p-8 rounded-3xl text-white shadow-xl relative overflow-hidden">
                                        <div className="relative z-10 grid md:grid-cols-3 gap-6 items-center">
                                            <div className="md:col-span-2 space-y-4">
                                                <div className="inline-flex items-center gap-2 bg-white/20 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest">
                                                    <Brain className="w-3 h-3" /> Coach Funcional IA
                                                </div>
                                                <p className="text-sm md:text-base font-medium leading-relaxed">{results.coachCallToAction}</p>
                                            </div>
                                            <div className="flex flex-col gap-3">
                                                <a href="https://calendly.com/biovital" target="_blank" rel="noopener noreferrer" className="bg-white text-nutrity-primary px-4 py-3 rounded-xl text-xs font-bold uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-nutrity-accent hover:text-white transition-all shadow-lg">
                                                    <Calendar className="w-4 h-4" /> Agendar Cita
                                                </a>
                                                <button onClick={() => setActiveTab("academy")} className="bg-white/10 text-white border border-white/20 px-4 py-3 rounded-xl text-xs font-bold uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-white/20 transition-all">
                                                    <GraduationCap className="w-4 h-4" /> Ver Material
                                                </button>
                                            </div>
                                        </div>
                                    </motion.div>
                                )}

                                {/* TIKTOK PÍLDORAS DE VALOR */}
                                <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="space-y-6">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-xl bg-black flex items-center justify-center text-white shadow-md">
                                                <Play className="w-5 h-5 ml-0.5 text-white" />
                                            </div>
                                            <div>
                                                <h3 className="font-display font-bold text-xl leading-none">Píldoras de Valor</h3>
                                                <p className="text-xs text-nutrity-gray-text mt-1">Conecta con BioVital.360</p>
                                            </div>
                                        </div>
                                        <a href="https://www.tiktok.com/@biovital.360" target="_blank" rel="noopener noreferrer" className="text-[10px] font-bold uppercase tracking-widest text-nutrity-accent hover:underline">Ir a TikTok</a>
                                    </div>
                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                        {[
                                            { id: 1, title: "¿Por qué no bajas de peso?", img: "https://images.unsplash.com/photo-1494597564530-871f2b93ac55?w=400&q=80", link: "https://www.tiktok.com/@biovital.360" },
                                            { id: 2, title: "El secreto del Yacón", img: "https://images.unsplash.com/photo-1596422846543-74c6fc0e2418?w=400&q=80", link: "https://www.tiktok.com/@biovital.360" },
                                            { id: 3, title: "Sana tu intestino", img: "https://images.unsplash.com/photo-1505253713660-8d4088c18ce8?w=400&q=80", link: "https://www.tiktok.com/@biovital.360" },
                                            { id: 4, title: "Ansiedad y Glucosa", img: "https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=400&q=80", link: "https://www.tiktok.com/@biovital.360" }
                                        ].map(video => (
                                            <a key={video.id} href={video.link} target="_blank" rel="noopener noreferrer" className="group block relative aspect-[9/16] rounded-2xl overflow-hidden bg-nutrity-bg border border-nutrity-border shadow-sm hover:border-nutrity-accent transition-all">
                                                <img src={video.img} className="absolute inset-0 w-full h-full object-cover opacity-80 group-hover:scale-105 transition-transform duration-500" alt={video.title} />
                                                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent flex flex-col justify-end p-4">
                                                    <div className="w-8 h-8 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center text-white mb-2 group-hover:bg-nutrity-accent transition-colors">
                                                        <Play className="w-3.5 h-3.5 ml-0.5" />
                                                    </div>
                                                    <p className="text-white text-xs font-bold leading-tight">{video.title}</p>
                                                </div>
                                            </a>
                                        ))}
                                    </div>
                                </motion.div>

                                {/* Quick Actions Row */}
                                <div className="grid md:grid-cols-3 gap-6">
                                    <div className="nutrity-card p-6 flex items-center gap-6 cursor-pointer hover:border-nutrity-accent transition-all group" onClick={handleAutoControl}>
                                        <div className="w-14 h-14 rounded-2xl bg-nutrity-accent/10 flex items-center justify-center text-nutrity-accent shrink-0 group-hover:bg-nutrity-accent group-hover:text-white transition-all">
                                            <Calendar className="w-7 h-7" />
                                        </div>
                                        <div className="flex-1">
                                            <p className="text-[10px] font-bold text-nutrity-gray-text uppercase tracking-widest">Próximo Control</p>
                                            <h4 className="font-bold text-sm mt-0.5">{appointments[0]?.date || "Programar ahora"}</h4>
                                            <p className="text-[10px] font-bold text-nutrity-accent mt-1 bg-nutrity-accent/10 inline-block px-2 py-0.5 rounded-full">Auto-Programación</p>
                                        </div>
                                    </div>
                                    <div className="nutrity-card p-6 flex items-center gap-6 cursor-pointer hover:border-nutrity-success transition-all group" onClick={handlePlanNutricional}>
                                        <div className="w-14 h-14 rounded-2xl bg-nutrity-success/10 flex items-center justify-center text-nutrity-success shrink-0 group-hover:bg-nutrity-success group-hover:text-white transition-all">
                                            <Utensils className="w-7 h-7" />
                                        </div>
                                        <div className="flex-1">
                                            <p className="text-[10px] font-bold text-nutrity-gray-text uppercase tracking-widest">Plan Nutricional</p>
                                            <h4 className="font-bold text-sm mt-0.5">Dieta Especial AI</h4>
                                            <p className="text-[10px] font-bold text-nutrity-success mt-1 opacity-50">Prescripción de Precisión</p>
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
                            <motion.div key="coach" initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} className="flex flex-col" style={{ height: 'calc(100vh - 10rem)' }}>
                                <div className="nutrity-card flex flex-col overflow-hidden bg-white shadow-xl shadow-slate-200/50" style={{ height: '100%' }}>
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
                                        <div key={micro.id} onClick={() => setSelectedMicro(micro)} className="nutrity-card p-8 hover:border-nutrity-accent transition-all group relative overflow-hidden cursor-pointer">
                                            <div className="flex items-center justify-between mb-6">
                                                <div className="w-12 h-12 rounded-xl bg-nutrity-accent/10 flex items-center justify-center text-nutrity-accent group-hover:scale-110 transition-transform overflow-hidden">
                                                    {micro.image ? (
                                                        <img src={getDirectImageUrl(micro.image)} alt={micro.name} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                                                    ) : (
                                                        <Zap className="w-7 h-7" />
                                                    )}
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
                                        {courses.map((course) => {
                                            const isEbook = course.category?.toLowerCase().includes('ebook') || course.category?.toLowerCase().includes('guía');
                                            return (
                                            <div key={course.id} className="nutrity-card overflow-hidden group hover:border-nutrity-accent transition-all flex flex-col">
                                                <div className="h-48 overflow-hidden relative">
                                                    <img src={getDirectImageUrl(course.thumbnail)} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" alt={course.title} referrerPolicy="no-referrer" />
                                                    <div className="absolute top-4 right-4 flex gap-2">
                                                        {course.price > 0 && !user?.profile?.plan?.includes('ELITE') && (
                                                            <div className="bg-amber-500 text-white px-3 py-1 rounded-lg text-[10px] font-bold uppercase tracking-widest flex items-center gap-1.5 shadow-lg">
                                                                <Shield className="w-3 h-3" /> Premium
                                                            </div>
                                                        )}
                                                        <div className="bg-white/90 backdrop-blur-md px-3 py-1 rounded-lg text-[10px] font-bold text-nutrity-accent uppercase tracking-widest flex items-center gap-1.5">
                                                            {isEbook ? <BookOpen className="w-3 h-3" /> : <Play className="w-3 h-3" />}
                                                            {course.category}
                                                        </div>
                                                    </div>
                                                    {course.price > 0 && !user?.profile?.plan?.includes('ELITE') && (
                                                        <div className="absolute inset-0 bg-nutrity-primary/40 backdrop-blur-[2px] flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                                            <Shield className="w-12 h-12 text-white opacity-50" />
                                                        </div>
                                                    )}
                                                </div>
                                                <div className="p-8 flex-1 flex flex-col">
                                                    <h3 className="text-2xl font-bold mb-3">{course.title}</h3>
                                                    <p className="text-sm text-nutrity-gray-text mb-8 leading-relaxed font-medium line-clamp-2">{course.description}</p>
                                                    <div className="mt-auto pt-6 border-t border-nutrity-border flex items-center justify-between">
                                                        <div className="flex flex-col">
                                                            <div className="flex items-center gap-2 mb-1">
                                                                {isEbook ? (
                                                                    <BookOpen className="w-3 h-3 text-nutrity-accent" />
                                                                ) : (
                                                                    <Play className="w-3 h-3 text-nutrity-accent" />
                                                                )}
                                                                <span className="text-[10px] font-bold text-nutrity-gray-text uppercase tracking-widest">
                                                                    {isEbook ? 'Guía Descargable' : `${course.lessons?.length || 6} Lecciones`}
                                                                </span>
                                                            </div>
                                                            <span className="text-lg font-bold text-nutrity-primary">${course.price} <span className="text-[10px] text-nutrity-gray-text">USD</span></span>
                                                        </div>
                                                        <div className="flex gap-2">
                                                            <button
                                                                onClick={async () => {
                                                                    if (isEbook && (course.price === 0 || user?.profile?.plan?.includes('ELITE'))) {
                                                                        window.open(course.paypalUrl || '#', "_blank");
                                                                        return;
                                                                    }
                                                                    const detailed = await dbService.getCourseWithLessons(course.id);
                                                                    setSelectedCourse(detailed);
                                                                    if (detailed?.lessons && detailed.lessons.length > 0) {
                                                                        setActiveLesson(detailed.lessons.sort((a: any, b: any) => a.order - b.order)[0]);
                                                                    }
                                                                }}
                                                                className="px-4 py-2.5 bg-nutrity-primary text-white text-[9px] font-bold uppercase tracking-widest rounded-xl shadow-lg shadow-nutrity-primary/10 hover:bg-nutrity-accent transition-all flex-1 text-center"
                                                            >
                                                                {isEbook ? 'Descargar' : 'Iniciar'}
                                                            </button>
                                                            {course.price > 0 && course.paypalUrl && (
                                                                <button
                                                                    onClick={(e) => {
                                                                        e.stopPropagation();
                                                                        const checkoutUrl = course.paypalUrl || "https://www.paypal.com/ncp/payment/CMG445X32EL2S";
                                                                        window.open(checkoutUrl, "_blank");
                                                                    }}
                                                                    className="px-4 py-2.5 bg-amber-500 text-white text-[9px] font-bold uppercase tracking-widest rounded-xl shadow-lg shadow-amber-500/20 hover:bg-amber-600 transition-all flex-1 text-center"
                                                                >
                                                                    Comprar
                                                                </button>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        )})}
                                    </div>
                                ) : (
                                    <div className="space-y-8">
                                        <button onClick={() => { setSelectedCourse(null); setActiveLesson(null); }} className="flex items-center gap-2 text-nutrity-accent font-bold text-xs uppercase tracking-widest hover:underline mb-4">
                                            <ArrowLeft className="w-4 h-4" /> Volver al Catálogo
                                        </button>
                                        <div className="grid lg:grid-cols-3 gap-8">
                                            <div className="lg:col-span-2 space-y-6">
                                                <div className="aspect-video bg-black rounded-3xl overflow-hidden shadow-2xl relative group">
                                                    {activeLesson?.videoUrl ? (
                                                        <iframe 
                                                            src={activeLesson.videoUrl.includes('youtube.com/watch') 
                                                                ? activeLesson.videoUrl.replace('watch?v=', 'embed/') 
                                                                : activeLesson.videoUrl.includes('youtu.be') 
                                                                    ? activeLesson.videoUrl.replace('youtu.be/', 'youtube.com/embed/') 
                                                                    : activeLesson.videoUrl}
                                                            title={activeLesson?.title || "Video Player"}
                                                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                                            allowFullScreen
                                                            className="w-full h-full border-0"
                                                        />
                                                    ) : (
                                                        <>
                                                            <img src={getDirectImageUrl(selectedCourse.thumbnail)} className="w-full h-full object-cover opacity-60" alt="Image" referrerPolicy="no-referrer" />
                                                            <div className="absolute inset-0 flex items-center justify-center">
                                                                <Play className="w-20 h-20 text-white/20" />
                                                                <div className="absolute bottom-8 left-8 right-8 text-white">
                                                                    <p className="text-[10px] font-bold uppercase tracking-widest text-nutrity-accent mb-2">Selecciona una lección</p>
                                                                    <h3 className="text-2xl font-bold">{selectedCourse.title}</h3>
                                                                </div>
                                                            </div>
                                                        </>
                                                    )}
                                                </div>
                                                <div className="space-y-4">
                                                    <h3 className="text-xl font-bold">{activeLesson ? activeLesson.title : "Acerca de esta lección"}</h3>
                                                    <p className="text-sm text-nutrity-gray-text leading-relaxed font-medium">
                                                        {activeLesson?.description ? activeLesson.description : selectedCourse.description}
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="space-y-6">
                                                <h3 className="font-display font-bold text-lg">Currículo del Curso</h3>
                                                <div className="space-y-3">
                                                    {selectedCourse.lessons?.sort((a, b) => a.order - b.order).map((lesson, idx) => (
                                                        <div key={lesson.id}
                                                            onClick={async () => {
                                                                setActiveLesson(lesson);
                                                                if ((user?.id || user?.uid)) {
                                                                    const newStatus = !lessonProgress[lesson.id];
                                                                    await dbService.toggleLessonProgress(user?.id, lesson.id, newStatus);
                                                                    setLessonProgress(prev => ({ ...prev, [lesson.id]: newStatus }));
                                                                }
                                                            }}
                                                            className={`p-4 rounded-2xl border transition-all cursor-pointer ${activeLesson?.id === lesson.id ? 'ring-2 ring-nutrity-accent shadow-md' : ''} ${lessonProgress[lesson.id] ? 'bg-nutrity-success/5 border-nutrity-success/30 opacity-70' : 'bg-white border-nutrity-border hover:border-nutrity-accent/30'}`}>
                                                            <div className="flex gap-4">
                                                                <div className={`w-8 h-8 rounded-lg shrink-0 flex items-center justify-center font-bold text-xs ${lessonProgress[lesson.id] ? 'bg-nutrity-success text-white' : (activeLesson?.id === lesson.id ? 'bg-nutrity-accent text-white' : 'bg-nutrity-bg text-nutrity-gray-text')}`}>
                                                                    {lessonProgress[lesson.id] ? <CheckCircle2 className="w-4 h-4" /> : lesson.order}
                                                                </div>
                                                                <div>
                                                                    <h4 className={`text-sm font-bold leading-snug ${lessonProgress[lesson.id] ? 'text-nutrity-gray-text line-through' : (activeLesson?.id === lesson.id ? 'text-nutrity-primary' : 'text-nutrity-gray-text')}`}>{lesson.title}</h4>
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
                                                <div className={`w-12 h-12 rounded-2xl mb-4 flex items-center justify-center transition-transform group-hover:scale-110 ${
                                                    m.label === 'Vitalidad' ? 'bg-amber-50 text-amber-500' :
                                                    m.label === 'Metabolismo' ? 'bg-nutrity-accent/10 text-nutrity-accent' :
                                                    m.label === 'Regeneración' ? 'bg-indigo-50 text-indigo-500' :
                                                    'bg-blue-50 text-blue-500'
                                                }`}>
                                                    {m.label === 'Vitalidad' ? <Zap className="w-6 h-6" /> :
                                                     m.label === 'Metabolismo' ? <Droplets className="w-6 h-6" /> :
                                                     m.label === 'Regeneración' ? <Clock className="w-6 h-6" /> :
                                                     <Brain className="w-6 h-6" />}
                                                </div>
                                                <h4 className="text-2xl font-black text-nutrity-primary">{m.value}%</h4>
                                                <p className="text-[10px] font-bold text-nutrity-gray-text uppercase tracking-widest mt-1">{m.label}</p>
                                                <div className="w-full h-1 bg-nutrity-bg rounded-full mt-4 overflow-hidden">
                                                    <motion.div 
                                                        initial={{ width: 0 }}
                                                        animate={{ width: `${m.value}%` }}
                                                        transition={{ duration: 1.5, delay: i * 0.1 }}
                                                        className={`h-full ${
                                                            m.label === 'Vitalidad' ? 'bg-amber-500' :
                                                            m.label === 'Metabolismo' ? 'bg-nutrity-accent' :
                                                            m.label === 'Regeneración' ? 'bg-indigo-500' :
                                                            'bg-blue-500'
                                                        }`}
                                                    />
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
                                        <div key={food.id} onClick={() => setSelectedFood(food)} className="nutrity-card overflow-hidden group hover:border-nutrity-accent transition-all cursor-pointer">
                                            <div className="h-40 relative">
                                                <img src={getDirectImageUrl(food.image)} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" alt="Image" referrerPolicy="no-referrer" />
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
                                {/* Header */}
                                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                                    <div className="space-y-1">
                                        <h2 className="text-3xl font-display font-bold">Menú Semanal de Precisión</h2>
                                        <p className="text-nutrity-gray-text text-sm">Cronograma nutricional personalizado para tu fase de remisión metabólica.</p>
                                    </div>
                                    {menuStatus === 'APPROVED' && (
                                        <span className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-50 text-emerald-600 border border-emerald-200 rounded-xl text-[10px] font-bold uppercase tracking-widest">
                                            <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
                                            Plan Aprobado por Coach
                                        </span>
                                    )}
                                </div>

                                {/* Loading state */}
                                {isLoadingApprovedMenu && (
                                    <div className="py-20 flex flex-col items-center gap-4">
                                        <div className="w-10 h-10 border-4 border-nutrity-accent border-t-transparent rounded-full animate-spin" />
                                        <p className="text-sm font-bold text-nutrity-gray-text">Cargando tu plan nutricional...</p>
                                    </div>
                                )}

                                {/* ESTADO: APROBADO — mostrar los 7 días */}
                                {!isLoadingApprovedMenu && menuStatus === 'APPROVED' && (
                                    <div className="space-y-4">
                                        {approvedMenuDays.map((record) => {
                                            const dateLabel = new Date(record.date + 'T12:00:00').toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long' });
                                            return (
                                                <div key={record.id} className="nutrity-card p-6 space-y-4">
                                                    <div className="flex items-center justify-between">
                                                        <h3 className="font-bold text-base capitalize">{dateLabel}</h3>
                                                        <span className="text-[9px] font-bold bg-emerald-50 text-emerald-600 px-2 py-0.5 rounded-lg">APROBADO</span>
                                                    </div>
                                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                                                        {[
                                                            { l: 'Desayuno', k: 'breakfast', icon: Coffee, color: 'text-amber-500 bg-amber-50' },
                                                            { l: 'Almuerzo', k: 'lunch', icon: Utensils, color: 'text-nutrity-accent bg-nutrity-accent/5' },
                                                            { l: 'Cena', k: 'dinner', icon: Heart, color: 'text-indigo-500 bg-indigo-50' },
                                                            { l: 'Snack', k: 'snack', icon: Apple, color: 'text-rose-500 bg-rose-50' },
                                                        ].map(({ l, k, icon: Icon, color }) => (
                                                            <div key={k} className="bg-nutrity-bg rounded-xl p-3 space-y-2">
                                                                <div className="flex items-center gap-2">
                                                                    <div className={`w-6 h-6 rounded-lg flex items-center justify-center ${color}`}>
                                                                        <Icon className="w-3.5 h-3.5" />
                                                                    </div>
                                                                    <span className="text-[9px] font-bold text-nutrity-gray-text uppercase tracking-widest">{l}</span>
                                                                </div>
                                                                <p className="text-xs font-medium text-nutrity-primary leading-snug">{record.menuData?.[k] || '—'}</p>
                                                            </div>
                                                        ))}
                                                    </div>
                                                    {record.metabolicGoal && (
                                                        <div className="flex items-center gap-2 pt-1">
                                                            <Target className="w-3.5 h-3.5 text-nutrity-accent" />
                                                            <span className="text-[10px] font-bold text-nutrity-accent">Meta del día: {record.metabolicGoal}</span>
                                                        </div>
                                                    )}
                                                </div>
                                            );
                                        })}
                                    </div>
                                )}

                                {/* ESTADO: PENDIENTE — en revisión por coach */}
                                {!isLoadingApprovedMenu && menuStatus === 'PENDING' && (
                                    <div className="nutrity-card p-16 flex flex-col items-center justify-center text-center space-y-6">
                                        <div className="w-20 h-20 rounded-3xl bg-amber-50 flex items-center justify-center">
                                            <ClipboardCheck className="w-10 h-10 text-amber-500" />
                                        </div>
                                        <div className="space-y-2">
                                            <h3 className="text-xl font-bold text-nutrity-primary">Tu plan está siendo revisado</h3>
                                            <p className="text-sm text-nutrity-gray-text max-w-sm">Tu Coach Nutrity está revisando y personalizando tu menú semanal. Recibirás acceso en cuanto sea aprobado.</p>
                                        </div>
                                        <span className="px-6 py-3 bg-amber-50 text-amber-600 border border-amber-200 rounded-xl text-[11px] font-bold uppercase tracking-widest flex items-center gap-2">
                                            <span className="w-2 h-2 bg-amber-500 rounded-full animate-pulse" />
                                            Pendiente de Aprobación
                                        </span>
                                    </div>
                                )}

                                {/* ESTADO: SIN MENÚ — aún no generado */}
                                {!isLoadingApprovedMenu && menuStatus === 'NONE' && (
                                    <div className="nutrity-card p-16 flex flex-col items-center justify-center text-center space-y-6">
                                        <div className="w-20 h-20 rounded-3xl bg-nutrity-bg flex items-center justify-center">
                                            <Utensils className="w-10 h-10 text-nutrity-gray-text opacity-40" />
                                        </div>
                                        <div className="space-y-2">
                                            <h3 className="text-xl font-bold text-nutrity-primary">Sin plan nutricional aún</h3>
                                            <p className="text-sm text-nutrity-gray-text max-w-sm">Completa tu diagnóstico metabólico para que tu Coach pueda generar y aprobar tu menú personalizado de Remisión Metabólica.</p>
                                        </div>
                                        <button
                                            onClick={() => setActiveTab('main')}
                                            className="px-8 py-3.5 bg-nutrity-accent text-white rounded-xl text-xs font-bold uppercase tracking-widest shadow-lg shadow-nutrity-accent/20 hover:scale-105 transition-all"
                                        >
                                            Ir al Dashboard Principal
                                        </button>
                                    </div>
                                )}
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
                                                <div className="flex gap-2">
                                                    <button onClick={() => startEditAppointment(appt)} className="p-2 hover:bg-slate-100 rounded-lg text-nutrity-primary transition-colors" title="Editar">
                                                        <Pencil className="w-4 h-4" />
                                                    </button>
                                                    <button onClick={() => handleDeleteAppointment(appt.id)} className="p-2 hover:bg-red-50 rounded-lg text-rose-500 transition-colors" title="Eliminar">
                                                        <Trash2 className="w-4 h-4" />
                                                    </button>
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

                        {activeTab === "profile" && (
                            <motion.div key="profile" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">
                                <div className="space-y-1 mb-8">
                                    <h2 className="text-3xl font-display font-bold">Perfil del Paciente</h2>
                                    <p className="text-nutrity-gray-text text-sm">
                                        {!isProfileComplete
                                            ? "Por favor, completa todos tus datos personales obligatorios para continuar utilizando Nutrity Global."
                                            : "Actualiza tus datos personales y de contacto aquí."}
                                    </p>
                                </div>
                                <div className="nutrity-card p-6 md:p-8">
                                    <form onSubmit={handleSaveProfile} className="space-y-6">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            <div className="space-y-2">
                                                <label className="text-[10px] font-bold text-nutrity-gray-text uppercase tracking-widest">Nombre Completo *</label>
                                                <input type="text" required className="w-full bg-nutrity-bg border border-nutrity-border rounded-xl px-4 py-3 font-medium focus:ring-2 focus:ring-nutrity-accent/10 focus:border-nutrity-accent outline-none" value={profileForm.name} onChange={e => setProfileForm({ ...profileForm, name: e.target.value })} />
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-[10px] font-bold text-nutrity-gray-text uppercase tracking-widest">Correo Electrónico *</label>
                                                <input type="email" required disabled className="w-full bg-gray-100 border border-nutrity-border rounded-xl px-4 py-3 font-medium opacity-70 cursor-not-allowed" value={profileForm.email} />
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-[10px] font-bold text-nutrity-gray-text uppercase tracking-widest">Celular de Contacto *</label>
                                                <input type="tel" required placeholder="+591 70000000" className="w-full bg-nutrity-bg border border-nutrity-border rounded-xl px-4 py-3 font-medium focus:ring-2 focus:ring-nutrity-accent/10 focus:border-nutrity-accent outline-none" value={profileForm.phone} onChange={e => setProfileForm({ ...profileForm, phone: e.target.value })} />
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-[10px] font-bold text-nutrity-gray-text uppercase tracking-widest">Edad *</label>
                                                <input type="number" required placeholder="Ej. 45" className="w-full bg-nutrity-bg border border-nutrity-border rounded-xl px-4 py-3 font-medium focus:ring-2 focus:ring-nutrity-accent/10 focus:border-nutrity-accent outline-none" value={profileForm.age} onChange={e => setProfileForm({ ...profileForm, age: e.target.value })} />
                                            </div>
                                            <div className="space-y-2 md:col-span-2">
                                                <label className="text-[10px] font-bold text-nutrity-gray-text uppercase tracking-widest">Dirección Completa *</label>
                                                <input type="text" required placeholder="Calle, Nro, Zona, Ciudad" className="w-full bg-nutrity-bg border border-nutrity-border rounded-xl px-4 py-3 font-medium focus:ring-2 focus:ring-nutrity-accent/10 focus:border-nutrity-accent outline-none" value={profileForm.address} onChange={e => setProfileForm({ ...profileForm, address: e.target.value })} />
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-[10px] font-bold text-nutrity-gray-text uppercase tracking-widest">Ocupación / Profesión *</label>
                                                <input type="text" required placeholder="Ingeniera, Docente, etc." className="w-full bg-nutrity-bg border border-nutrity-border rounded-xl px-4 py-3 font-medium focus:ring-2 focus:ring-nutrity-accent/10 focus:border-nutrity-accent outline-none" value={profileForm.occupation} onChange={e => setProfileForm({ ...profileForm, occupation: e.target.value })} />
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-[10px] font-bold text-nutrity-gray-text uppercase tracking-widest">Estado Civil *</label>
                                                <select required className="w-full bg-nutrity-bg border border-nutrity-border rounded-xl px-4 py-3 font-medium focus:ring-2 focus:ring-nutrity-accent/10 focus:border-nutrity-accent outline-none" value={profileForm.maritalStatus} onChange={e => setProfileForm({ ...profileForm, maritalStatus: e.target.value })}>
                                                    <option value="" disabled>Seleccionar estado</option>
                                                    <option value="soltero">Soltero/a</option>
                                                    <option value="casado">Casado/a</option>
                                                    <option value="divorciado">Divorciado/a</option>
                                                    <option value="viudo">Viudo/a</option>
                                                    <option value="otro">Otro</option>
                                                </select>
                                            </div>
                                            <div className="space-y-2 md:col-span-2">
                                                <label className="text-[10px] font-bold text-nutrity-gray-text uppercase tracking-widest">Redes Sociales / IG o Facebook (Opcional)</label>
                                                <input type="text" placeholder="@usuario o link de perfil" className="w-full bg-nutrity-bg border border-nutrity-border rounded-xl px-4 py-3 font-medium focus:ring-2 focus:ring-nutrity-accent/10 focus:border-nutrity-accent outline-none" value={profileForm.socialMedia} onChange={e => setProfileForm({ ...profileForm, socialMedia: e.target.value })} />
                                            </div>
                                        </div>
                                        <div className="pt-6 border-t border-nutrity-border flex justify-end">
                                            <button disabled={isSavingProfile} type="submit" className="bg-nutrity-primary text-white px-10 py-4 rounded-xl font-bold uppercase tracking-widest shadow-lg shadow-nutrity-primary/20 hover:bg-nutrity-accent transition-all active:scale-95 disabled:opacity-50 flex items-center gap-2">
                                                {isSavingProfile ? "Guardando..." : "Guardar Perfil"}
                                            </button>
                                        </div>
                                    </form>
                                </div>
                            </motion.div>
                        )}

                        {!["main", "coach", "micronutrients", "measurements", "academy", "subscription", "organization", "catalog", "menu", "goals", "agenda", "profile"].includes(activeTab) && (
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
                            <button onClick={() => { setShowApptModal(false); setEditingApptId(null); }} className="absolute top-8 right-8 p-2 rounded-full hover:bg-nutrity-bg text-nutrity-gray-text opacity-50"><X className="w-5 h-5" /></button>
                            <h3 className="text-2xl font-display font-bold mb-1">{editingApptId ? "Editar Cita" : "Agendar Nueva Cita"}</h3>
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
                                <button type="submit" className="w-full bg-nutrity-primary text-white py-5 rounded-xl font-bold shadow-lg shadow-nutrity-accent/20 active:scale-95 transition-all text-sm uppercase tracking-widest mt-2">
                                    {editingApptId ? "Guardar Cambios" : "Confirmar Cita"}
                                </button>
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

                {selectedFood && (
                    <motion.div
                        key="food-modal"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="fixed inset-0 z-[200] bg-nutrity-primary/80 backdrop-blur-sm flex items-center justify-center p-4"
                    >
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                            className="bg-white w-full max-w-4xl max-h-[90vh] overflow-y-auto rounded-3xl shadow-2xl relative flex flex-col"
                        >
                            <button onClick={() => setSelectedFood(null)} className="absolute top-6 right-6 p-2 rounded-full bg-white/50 backdrop-blur-md text-nutrity-primary hover:bg-white z-10 transition-all shadow-sm"><X className="w-5 h-5" /></button>

                            <div className="h-64 md:h-80 relative shrink-0">
                                <img src={getDirectImageUrl(selectedFood.image)} alt={selectedFood.name} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                                <div className="absolute inset-0 bg-gradient-to-t from-nutrity-primary/90 via-nutrity-primary/40 to-transparent flex flex-col justify-end p-8">
                                    <span className="px-3 py-1 bg-nutrity-accent text-white rounded-lg text-[10px] font-bold uppercase tracking-widest self-start mb-3">{selectedFood.category}</span>
                                    <h2 className="text-3xl md:text-4xl font-display font-bold text-white mb-1">{selectedFood.name}</h2>
                                    <p className="text-white/70 italic text-sm">{selectedFood.scientificName}</p>
                                </div>
                            </div>

                            <div className="p-8 space-y-8 flex-1 bg-slate-50">
                                <section>
                                    <h3 className="text-sm font-bold text-nutrity-gray-text uppercase tracking-widest mb-3 flex items-center gap-2">
                                        <Info className="w-4 h-4 text-nutrity-accent" /> Descripción Clínica
                                    </h3>
                                    <p className="text-nutrity-primary font-medium leading-relaxed text-sm md:text-base">{selectedFood.description}</p>
                                </section>

                                <section>
                                    <h3 className="text-sm font-bold text-nutrity-gray-text uppercase tracking-widest mb-4 flex items-center gap-2">
                                        <Zap className="w-4 h-4 text-nutrity-accent" /> Beneficios Metabólicos
                                    </h3>
                                    <div className="flex flex-wrap gap-2">
                                        {selectedFood.metabolicBenefits.map((benefit, i) => (
                                            <span key={i} className="px-3 py-1.5 bg-nutrity-success/10 text-nutrity-success text-xs font-bold rounded-lg border border-nutrity-success/20">
                                                {benefit}
                                            </span>
                                        ))}
                                    </div>
                                </section>

                                <section>
                                    <h3 className="text-sm font-bold text-nutrity-gray-text uppercase tracking-widest mb-4 flex items-center gap-2">
                                        <Activity className="w-4 h-4 text-nutrity-accent" /> Perfil Nutricional (Por 100g)
                                    </h3>
                                    <div className="grid grid-cols-3 gap-4">
                                        <div className="bg-white p-4 rounded-xl border border-nutrity-border text-center shadow-sm">
                                            <p className="text-lg md:text-xl font-bold text-indigo-500 mb-1">{selectedFood.nutrients.protein}</p>
                                            <p className="text-[9px] font-bold text-nutrity-gray-text uppercase tracking-widest">Proteína</p>
                                        </div>
                                        <div className="bg-white p-4 rounded-xl border border-nutrity-border text-center shadow-sm">
                                            <p className="text-lg md:text-xl font-bold text-nutrity-success mb-1">{selectedFood.nutrients.fiber}</p>
                                            <p className="text-[9px] font-bold text-nutrity-gray-text uppercase tracking-widest">Fibra</p>
                                        </div>
                                        <div className="bg-white p-4 rounded-xl border border-nutrity-border text-center shadow-sm">
                                            <p className="text-lg md:text-xl font-bold text-amber-500 mb-1">{selectedFood.nutrients.sugar}</p>
                                            <p className="text-[9px] font-bold text-nutrity-gray-text uppercase tracking-widest">Azúcar</p>
                                        </div>
                                    </div>
                                </section>

                                {selectedFood.recipes && selectedFood.recipes.length > 0 && (
                                    <section>
                                        <h3 className="text-sm font-bold text-nutrity-gray-text uppercase tracking-widest mb-4 flex items-center gap-2">
                                            <ChefHat className="w-4 h-4 text-nutrity-accent" /> Recetas Recomendadas ({selectedFood.recipes.length})
                                        </h3>
                                        <div className="space-y-4">
                                            {selectedFood.recipes.map((recipe, idx) => (
                                                <div key={idx} className="bg-white rounded-2xl border border-nutrity-border shadow-sm overflow-hidden flex flex-col md:flex-row">
                                                    {recipe.image && (
                                                        <div className="w-full md:w-48 h-48 md:h-auto shrink-0 relative">
                                                            <img src={getDirectImageUrl(recipe.image)} alt={recipe.title} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                                                        </div>
                                                    )}
                                                    <div className="p-5 flex-1">
                                                        <h4 className="font-bold text-nutrity-primary mb-4 flex items-center gap-2">
                                                            <span className="w-6 h-6 rounded-full bg-nutrity-accent/20 text-nutrity-accent flex items-center justify-center text-[10px]">{idx + 1}</span>
                                                            {recipe.title}
                                                        </h4>
                                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                            <div>
                                                                <h5 className="text-[10px] font-bold text-nutrity-gray-text uppercase tracking-widest mb-2 border-b border-nutrity-border pb-1">Ingredientes</h5>
                                                                <ul className="space-y-1">
                                                                    {(recipe.ingredients || []).map((ing, i) => (
                                                                        <li key={i} className="text-sm text-nutrity-gray-text font-medium flex gap-2">
                                                                            <span className="text-nutrity-accent/50 font-bold mt-0.5">•</span>
                                                                            <span>{ing}</span>
                                                                        </li>
                                                                    ))}
                                                                </ul>
                                                            </div>
                                                            <div>
                                                                <h5 className="text-[10px] font-bold text-nutrity-gray-text uppercase tracking-widest mb-2 border-b border-nutrity-border pb-1">Preparación</h5>
                                                                <ol className="space-y-1">
                                                                    {(recipe.preparation || recipe.instructions || []).map((inst, i) => (
                                                                        <li key={i} className="text-sm text-nutrity-gray-text font-medium flex gap-2">
                                                                            <span className="text-nutrity-accent/50 font-bold mt-0.5">{i + 1}.</span>
                                                                            <span>{inst}</span>
                                                                        </li>
                                                                    ))}
                                                                </ol>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </section>
                                )}

                                <div className="pb-8"></div>
                            </div>
                        </motion.div>
                    </motion.div>
                )}

                {selectedMicro && (
                    <motion.div
                        key="micro-modal"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="fixed inset-0 z-[200] bg-nutrity-primary/80 backdrop-blur-sm flex items-center justify-center p-4"
                    >
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                            className="bg-white w-full max-w-4xl max-h-[90vh] overflow-y-auto rounded-3xl shadow-2xl relative flex flex-col"
                        >
                            <button onClick={() => setSelectedMicro(null)} className="absolute top-6 right-6 p-2 rounded-full bg-white/50 backdrop-blur-md text-nutrity-primary hover:bg-white z-10 transition-all shadow-sm"><X className="w-5 h-5" /></button>

                            <div className="h-64 md:h-80 relative shrink-0 bg-nutrity-bg flex items-center justify-center">
                                {selectedMicro.image ? (
                                    <img src={getDirectImageUrl(selectedMicro.image)} alt={selectedMicro.name} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                                ) : (
                                    <Zap className="w-32 h-32 text-nutrity-accent opacity-20" />
                                )}
                                <div className="absolute inset-0 bg-gradient-to-t from-nutrity-primary/90 via-nutrity-primary/40 to-transparent flex flex-col justify-end p-8">
                                    <span className="px-3 py-1 bg-nutrity-accent text-white rounded-lg text-[10px] font-bold uppercase tracking-widest self-start mb-3">{selectedMicro.category}</span>
                                    <h2 className="text-3xl md:text-4xl font-display font-bold text-white mb-1">{selectedMicro.name} ({selectedMicro.symbol})</h2>
                                </div>
                            </div>

                            <div className="p-8 space-y-8 flex-1 bg-slate-50">
                                <section>
                                    <h3 className="text-sm font-bold text-nutrity-gray-text uppercase tracking-widest mb-3 flex items-center gap-2">
                                        <Info className="w-4 h-4 text-nutrity-accent" /> Función Biológica
                                    </h3>
                                    <p className="text-nutrity-primary font-medium leading-relaxed text-sm md:text-base">{selectedMicro.function}</p>
                                </section>

                                <section>
                                    <h3 className="text-sm font-bold text-nutrity-gray-text uppercase tracking-widest mb-4 flex items-center gap-2">
                                        <Zap className="w-4 h-4 text-nutrity-accent" /> Impacto Metabólico
                                    </h3>
                                    <p className="text-nutrity-primary font-medium leading-relaxed text-sm md:text-base">{selectedMicro.metabolicImpact}</p>
                                </section>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                    <section>
                                        <h3 className="text-sm font-bold text-nutrity-gray-text uppercase tracking-widest mb-4 flex items-center gap-2">
                                            <Leaf className="w-4 h-4 text-nutrity-success" /> Fuentes Bioavales
                                        </h3>
                                        <ul className="space-y-2">
                                            {selectedMicro.sources.map((source, i) => (
                                                <li key={i} className="flex items-center gap-2">
                                                    <div className="w-2 h-2 rounded-full bg-nutrity-success/50" />
                                                    <span className="text-sm font-bold text-nutrity-primary">{source}</span>
                                                </li>
                                            ))}
                                        </ul>
                                    </section>

                                    <section>
                                        <h3 className="text-sm font-bold text-nutrity-gray-text uppercase tracking-widest mb-4 flex items-center gap-2">
                                            <AlertTriangle className="w-4 h-4 text-rose-500" /> Señales de Deficiencia
                                        </h3>
                                        <ul className="space-y-2">
                                            {selectedMicro.deficiencySigns.map((sign, i) => (
                                                <li key={i} className="flex items-center gap-2">
                                                    <div className="w-2 h-2 rounded-full bg-rose-500/50" />
                                                    <span className="text-sm font-bold text-nutrity-primary">{sign}</span>
                                                </li>
                                            ))}
                                        </ul>
                                    </section>
                                </div>
                                
                                <div className="pb-8"></div>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Notification Toast */}
            <AnimatePresence>
                {notification && (
                    <motion.div
                        initial={{ opacity: 0, y: 50, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 20, scale: 0.95 }}
                        className={`fixed bottom-8 right-8 z-[1000] px-6 py-4 rounded-2xl shadow-2xl text-sm font-bold flex items-center gap-3 ${notification.type === "success"
                            ? "bg-emerald-500 text-white shadow-emerald-500/30"
                            : "bg-rose-500 text-white shadow-rose-500/30"
                            }`}
                    >
                        <Activity className="w-4 h-4" />
                        {notification.message}
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Mobile Bottom Navigation */}
            <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-nutrity-border z-40 pb-safe box-border shadow-[0_-10px_40px_rgba(0,0,0,0.05)] rounded-t-3xl overflow-hidden">
                <div className="flex items-center gap-2 px-4 py-4 overflow-x-auto scrollbar-hide snap-x snap-mandatory hide-scroll-indicator">
                    {[
                        { id: 'main', icon: LayoutDashboard, label: 'Panel' },
                        { id: 'agenda', icon: Calendar, label: 'Agenda' },
                        { id: 'coach', icon: Brain, label: 'IA Coach' },
                        { id: 'measurements', icon: Activity, label: 'Mediciones' },
                        { id: 'catalog', icon: Utensils, label: 'Alimentos' },
                        { id: 'micronutrients', icon: Zap, label: 'Micro' },
                        { id: 'academy', icon: BookOpen, label: 'Academia' },
                        { id: 'menu', icon: ClipboardCheck, label: 'Menú' },
                        { id: 'goals', icon: Target, label: 'Metas' },
                        { id: 'profile', icon: User, label: 'Perfil' },
                        { id: 'logout', icon: LogOut, label: 'Salir', color: 'text-red-500' },
                    ].map((item: any) => {
                        const isActive = activeTab === item.id;
                        const isLogout = item.id === 'logout';
                        const isDisabled = !isProfileComplete && item.id !== 'profile' && !isLogout;
                        const Icon = item.icon;
                        return (
                            <button
                                key={item.id}
                                onClick={() => {
                                    if (isLogout) {
                                        onLogout();
                                    } else if (!isDisabled) {
                                        setActiveTab(item.id);
                                    }
                                }}
                                disabled={isDisabled}
                                className={`flex flex-col items-center gap-1.5 transition-all outline-none shrink-0 snap-center w-16 ${isActive ? 'text-nutrity-primary' : (item.color || 'text-nutrity-gray-text opacity-60')} ${isDisabled ? "opacity-30 cursor-not-allowed" : ""}`}
                            >
                                <div className={`p-2 rounded-xl transition-colors ${isActive ? 'bg-nutrity-accent/20 text-nutrity-accent' : (isLogout ? 'bg-red-50' : '')}`}>
                                    <Icon className={`w-6 h-6 ${isLogout ? 'text-red-500' : ''}`} />
                                </div>
                                <span className={`text-[9px] font-bold uppercase tracking-wide truncate max-w-full text-center ${isLogout ? 'text-red-500' : ''}`}>{item.label}</span>
                            </button>
                        );
                    })}
                </div>
                {/* CSS to hide scrollbar explicitly for older browsers if needed */}
                <style dangerouslySetInnerHTML={{
                    __html: `
                    .hide-scroll-indicator::-webkit-scrollbar { display: none; }
                    .hide-scroll-indicator { -ms-overflow-style: none; scrollbar-width: none; }
                `}} />
            </div>
        </div>
    );
}
