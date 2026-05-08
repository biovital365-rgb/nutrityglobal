import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
    Utensils,
    Zap,
    ClipboardCheck,
    BookOpen,
    PlusCircle,
    X,
    Search,
    Pencil,
    Trash2,
    Save,
    ChevronRight,
    AlertTriangle,
    Loader2,
    Users,
    Shield,
    Settings,
    Activity,
    Calendar,
    FileText,
    CheckCircle2,
} from "lucide-react";
import { dbService, FoodItem, Micronutrient, Course, Lesson } from "../lib/db-service";
import { weeklyMenuData, DayMeal } from "../lib/menu-data";
import { getDirectImageUrl } from "../lib/utils";
import { foodCatalog } from "../lib/food-data";
import { micronutrientsData } from "../lib/micronutrients-data";

// ─── Types ──────────────────────────────────────────────────────────────
interface AdminPanelProps {
    user: {
        uid?: string;
        email?: string;
        displayName?: string;
        profile?: {
            name?: string;
            email?: string;
            role?: string;
            plan?: string;
            organization?: { name?: string };
        };
    };
}

type AdminSection = "foods" | "micronutrients" | "menu" | "courses" | "users" | "crm" | "calendar" | "reports";

// ─── Empty templates for new entities ───────────────────────────────────
const emptyFood: Partial<FoodItem> = {
    name: "", scientificName: "", image: "", category: "",
    description: "", metabolicBenefits: [], nutrients: { protein: "", fiber: "", sugar: "" },
    recipes: [],
};

const emptyMicro: Partial<Micronutrient> = {
    name: "", symbol: "", category: "", function: "",
    metabolicImpact: "", sources: [], deficiencySigns: [], dailyDose: "", image: "",
};

const emptyCourse: Partial<Course> = {
    title: "", description: "", thumbnail: "", category: "Bienestar", price: 0, paypalUrl: "",
};

const emptyLesson: Partial<Lesson> = {
    title: "", description: "", videoUrl: "", duration: "", order: 0, isFree: false,
};

// ─── Reusable Sub-Components ────────────────────────────────────────────
function FieldInput({ label, value, onChange, type = "text", placeholder = "", required = false, multiline = false }: {
    label: string; value: string; onChange: (v: string) => void; type?: string; placeholder?: string; required?: boolean; multiline?: boolean;
}) {
    return (
        <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-nutrity-gray-text uppercase tracking-widest ml-1">{label}</label>
            {multiline ? (
                <textarea
                    value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} required={required} rows={3}
                    className="w-full bg-nutrity-bg border border-nutrity-border rounded-xl px-4 py-3 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-nutrity-accent/10 focus:border-nutrity-accent transition-all resize-none"
                />
            ) : (
                <input
                    type={type} value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} required={required}
                    className="w-full bg-nutrity-bg border border-nutrity-border rounded-xl px-4 py-3 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-nutrity-accent/10 focus:border-nutrity-accent transition-all"
                />
            )}
        </div>
    );
}

function TagInput({ label, tags, onChange }: { label: string; tags: string[]; onChange: (t: string[]) => void }) {
    const [inputVal, setInputVal] = useState("");
    const addTag = () => {
        const trimmed = inputVal.trim();
        if (trimmed && !tags.includes(trimmed)) {
            onChange([...tags, trimmed]);
            setInputVal("");
        }
    };
    return (
        <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-nutrity-gray-text uppercase tracking-widest ml-1">{label}</label>
            <div className="flex flex-wrap gap-1.5 mb-2">
                {tags.map((tag, i) => (
                    <span key={i} className="px-2.5 py-1 bg-nutrity-accent/10 text-nutrity-accent text-[10px] font-bold rounded-lg flex items-center gap-1.5">
                        {tag}
                        <button type="button" onClick={() => onChange(tags.filter((_, idx) => idx !== i))} className="hover:text-red-500 transition-colors">
                            <X className="w-3 h-3" />
                        </button>
                    </span>
                ))}
            </div>
            <div className="flex gap-2">
                <input
                    type="text" value={inputVal} onChange={(e) => setInputVal(e.target.value)}
                    onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addTag(); } }}
                    placeholder="Escribir y Enter..."
                    className="flex-1 bg-nutrity-bg border border-nutrity-border rounded-xl px-4 py-2.5 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-nutrity-accent/10 focus:border-nutrity-accent transition-all"
                />
                <button type="button" onClick={addTag} className="px-3 py-2 bg-nutrity-accent/10 text-nutrity-accent rounded-xl text-xs font-bold hover:bg-nutrity-accent/20 transition-all">
                    <PlusCircle className="w-4 h-4" />
                </button>
            </div>
        </div>
    );
}

function DeleteConfirmModal({ itemName, onConfirm, onCancel }: { itemName: string; onConfirm: () => void; onCancel: () => void }) {
    return (
        <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-[300] bg-nutrity-primary/60 backdrop-blur-md flex items-center justify-center p-6"
        >
            <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }} exit={{ scale: 0.95 }}
                className="bg-white w-full max-w-sm rounded-2xl p-8 shadow-2xl text-center space-y-6"
            >
                <div className="w-16 h-16 mx-auto rounded-2xl bg-red-50 flex items-center justify-center">
                    <AlertTriangle className="w-8 h-8 text-red-500" />
                </div>
                <div>
                    <h3 className="text-xl font-bold mb-2">Eliminar Registro</h3>
                    <p className="text-sm text-nutrity-gray-text">¿Seguro que deseas eliminar <strong>"{itemName}"</strong>? Esta acción no se puede deshacer.</p>
                </div>
                <div className="flex gap-3">
                    <button onClick={onCancel} className="flex-1 py-3 rounded-xl border border-nutrity-border text-sm font-bold hover:bg-nutrity-bg transition-all">Cancelar</button>
                    <button onClick={onConfirm} className="flex-1 py-3 rounded-xl bg-red-500 text-white text-sm font-bold hover:bg-red-600 transition-all">Eliminar</button>
                </div>
            </motion.div>
        </motion.div>
    );
}

// ─── Main AdminPanel ────────────────────────────────────────────────────
export function AdminPanel({ user }: AdminPanelProps) {
    const [section, setSection] = useState<AdminSection>("foods");
    const [searchTerm, setSearchTerm] = useState("");
    const [isSaving, setIsSaving] = useState(false);
    const [notification, setNotification] = useState<{ type: "success" | "error"; message: string } | null>(null);

    // Data states
    const [foods, setFoods] = useState<FoodItem[]>([]);
    const [micros, setMicros] = useState<Micronutrient[]>([]);
    const [courses, setCourses] = useState<Course[]>([]);
    const [users, setUsers] = useState<any[]>([]);
    const [appointments, setAppointments] = useState<any[]>([]);
    const [pdfReports, setPdfReports] = useState<any[]>([]);
    const [menuDays, setMenuDays] = useState<Record<string, DayMeal>>(weeklyMenuData);
    const [showDeleted, setShowDeleted] = useState(false);

    // Modal states
    const [showFoodModal, setShowFoodModal] = useState(false);
    const [editingFood, setEditingFood] = useState<Partial<FoodItem>>(emptyFood);
    const [showMicroModal, setShowMicroModal] = useState(false);
    const [editingMicro, setEditingMicro] = useState<Partial<Micronutrient>>(emptyMicro);
    const [showCourseModal, setShowCourseModal] = useState(false);
    const [editingCourse, setEditingCourse] = useState<Partial<Course>>(emptyCourse);
    const [showMenuModal, setShowMenuModal] = useState(false);
    const [editingMenuDay, setEditingMenuDay] = useState<{ day: string; meal: DayMeal }>({ day: "", meal: { breakfast: "", lunch: "", dinner: "", snack: "", metabolicGoal: "" } });
    const [showApptModal, setShowApptModal] = useState(false);
    const [editingAppt, setEditingAppt] = useState<any>(null);
    const [showUserModal, setShowUserModal] = useState(false);
    const [editingUser, setEditingUser] = useState<any>(null);
    const [showCardexModal, setShowCardexModal] = useState(false);
    const [selectedCardexUser, setSelectedCardexUser] = useState<any>(null);
    const [deleteTarget, setDeleteTarget] = useState<{ type: AdminSection; id: string; name: string } | null>(null);
    const [apptFilter, setApptFilter] = useState<"ALL" | "DIAGNOSTICO" | "CONTROL">("ALL");

    // ─── Notification helper ──────────────────────────────────────────
    const notify = useCallback((type: "success" | "error", message: string) => {
        setNotification({ type, message });
        setTimeout(() => setNotification(null), 3000);
    }, []);

    // ─── Data loading ─────────────────────────────────────────────────
    const loadAll = useCallback(async () => {
        try {
            const orgId = user?.profile?.organizationId;
            const [foodData, microData, courseData, userData, appointmentData, reportData] = await Promise.all([
                dbService.getFoods(orgId, showDeleted).catch(() => []),
                dbService.getMicronutrients(orgId, showDeleted).catch(() => []),
                dbService.getCourses(orgId, showDeleted).catch(() => []),
                dbService.getAllUsers(orgId, showDeleted).catch(() => []),
                dbService.getAllAppointments(orgId, showDeleted).catch(() => []),
                dbService.getPDFReports(orgId).catch(() => [])
            ]);
            setFoods(foodData);
            setMicros(microData);
            setCourses(courseData);
            setUsers(userData);
            setAppointments(appointmentData);
            setPdfReports(reportData);
        } catch (err) {
            console.error("Admin data load error:", err);
            notify("error", "Error al cargar datos");
        }
    }, [notify, user?.profile?.organizationId, showDeleted]);

    useEffect(() => {
        loadAll();
    }, [loadAll]);

    const handleSync = async (type: 'foods' | 'micros') => {
        if (!confirm(`¿Deseas sincronizar el catálogo de ${type === 'foods' ? 'alimentos' : 'micronutrientes'}? Esto actualizará los registros existentes y agregará los faltantes.`)) return;
        setIsSaving(true);
        try {
            await dbService.forceSyncCatalog(type, user?.profile?.organizationId);
            notify("success", "Sincronización completada exitosamente.");
            // Recargar datos
            const orgId = user?.profile?.organizationId;
            if (type === 'foods') setFoods(await dbService.getFoods(orgId));
            else setMicros(await dbService.getMicronutrients(orgId));
        } catch (err) {
            console.error("Sync error", err);
            notify("error", "Error durante la sincronización.");
        } finally {
            setIsSaving(false);
        }
    };

    // ─── FOOD CRUD ────────────────────────────────────────────────────
    const handleSaveFood = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSaving(true);
        try {
            const orgId = user?.profile?.organizationId;
            const saved = await dbService.saveFood(editingFood, orgId) as any;
            
            setFoods(prev => {
                // Si el ID cambió (renombrado), primero filtramos el ID viejo
                const filtered = saved._previousId ? prev.filter(f => f.id !== saved._previousId) : prev;
                const exists = filtered.find(f => f.id === saved.id);
                return exists ? filtered.map(f => f.id === saved.id ? saved : f) : [...filtered, saved];
            });

            setShowFoodModal(false);
            setEditingFood(emptyFood);
            notify("success", `Alimento "${saved.name}" guardado`);
        } catch (err) {
            console.error("Save food error:", err);
            notify("error", "Error al guardar alimento");
        } finally { setIsSaving(false); }
    };

    // ─── MICRO CRUD ───────────────────────────────────────────────────
    const handleSaveMicro = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSaving(true);
        try {
            const orgId = user?.profile?.organizationId;
            const saved = await dbService.saveMicronutrient(editingMicro, orgId) as any;
            
            setMicros(prev => {
                const filtered = saved._previousId ? prev.filter(m => m.id !== saved._previousId) : prev;
                const exists = filtered.find(m => m.id === saved.id);
                return exists ? filtered.map(m => m.id === saved.id ? saved : m) : [...filtered, saved];
            });

            setShowMicroModal(false);
            setEditingMicro(emptyMicro);
            notify("success", `Micronutriente "${saved.name}" guardado`);
        } catch (err) {
            console.error("Save micro error:", err);
            notify("error", "Error al guardar micronutriente");
        } finally { setIsSaving(false); }
    };

    // ─── COURSE CRUD ──────────────────────────────────────────────────
    const handleSaveCourse = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSaving(true);
        try {
            const orgId = user?.profile?.organizationId;
            const saved = await dbService.saveCourse(editingCourse, orgId);
            setCourses(prev => {
                const exists = prev.find(c => c.id === saved.id);
                return exists ? prev.map(c => c.id === saved.id ? saved : c) : [...prev, saved];
            });
            setShowCourseModal(false);
            setEditingCourse(emptyCourse);
            notify("success", `Curso "${saved.title}" guardado`);
        } catch (err) {
            console.error("Save course error:", err);
            notify("error", "Error al guardar curso");
        } finally { setIsSaving(false); }
    };

    // ─── MENU SAVE ────────────────────────────────────────────────────
    const handleSaveMenuDay = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSaving(true);
        try {
            setMenuDays(prev => ({ ...prev, [editingMenuDay.day]: editingMenuDay.meal }));
            setShowMenuModal(false);
            notify("success", `Menú del ${editingMenuDay.day} actualizado`);
        } catch (err) {
            console.error("Save menu error:", err);
            notify("error", "Error al guardar menú");
        } finally { setIsSaving(false); }
    };

    const handleSaveUser = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!editingUser) return;
        setIsSaving(true);
        try {
            const { id, ...data } = editingUser;
            await dbService.updateUserProfile(id, data);
            
            // Recargar usuarios
            const orgId = user?.profile?.organizationId;
            const updated = await dbService.getAllUsers(orgId);
            setUsers(updated);
            
            notify("success", "Usuario actualizado correctamente.");
            setShowUserModal(false);
        } catch (err) {
            console.error("Error updating user:", err);
            notify("error", "Error al actualizar el usuario.");
        } finally {
            setIsSaving(false);
        }
    };

    // ─── APPOINTMENT SAVE ──────────────────────────────────────────────
    const handleSaveAppointment = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!editingAppt) return;
        setIsSaving(true);
        try {
            await dbService.updateAppointment(editingAppt.id, {
                title: editingAppt.title,
                date: editingAppt.date,
                time: editingAppt.time,
                type: editingAppt.type
            });
            const orgId = user?.profile?.organizationId;
            const updated = await dbService.getAllAppointments(orgId);
            setAppointments(updated);
            notify("success", "Cita actualizada correctamente.");
            setShowApptModal(false);
        } catch (err) {
            console.error("Error updating appointment:", err);
            notify("error", "Error al actualizar la cita.");
        } finally {
            setIsSaving(false);
        }
    };

    // ─── DELETE HANDLER ───────────────────────────────────────────────
    const handleDelete = async () => {
        if (!deleteTarget) return;
        setIsSaving(true);
        try {
            if (deleteTarget.type === "foods") {
                await dbService.deleteFood(deleteTarget.id);
                setFoods(foods.filter(f => f.id !== deleteTarget.id));
            } else if (deleteTarget.type === "micronutrients") {
                await dbService.deleteMicronutrient(deleteTarget.id);
                setMicros(micros.filter(m => m.id !== deleteTarget.id));
            } else if (deleteTarget.type === "courses") {
                await dbService.deleteCourse(deleteTarget.id);
                setCourses(courses.filter(c => c.id !== deleteTarget.id));
            } else if (deleteTarget.type === "calendar") {
                await dbService.deleteAppointment(deleteTarget.id);
                setAppointments(appointments.filter(a => a.id !== deleteTarget.id));
            } else if (deleteTarget.type === "users") {
                await dbService.deleteUser(deleteTarget.id);
                setUsers(users.filter(u => u.id !== deleteTarget.id));
            }
            notify("success", `"${deleteTarget.name}" eliminado`);
        } catch (err) {
            console.error("Delete error:", err);
            notify("error", "Error al eliminar");
        } finally {
            setDeleteTarget(null);
            setIsSaving(false);
        }
    };

    // ─── RESTORE HANDLERS ──────────────────────────────────────────────
    const handleRestore = async (type: AdminSection, id: string) => {
        setIsSaving(true);
        try {
            if (type === "foods") await dbService.restoreFood(id);
            else if (type === "micronutrients") await dbService.restoreMicronutrient(id);
            else if (type === "courses") await dbService.restoreCourse(id);
            else if (type === "calendar") await dbService.restoreAppointment(id);
            else if (type === "users") await dbService.restoreUser(id);
            
            notify("success", "Registro restaurado correctamente");
            loadAll();
        } catch (err) {
            console.error("Restore error:", err);
            notify("error", "Error al restaurar el registro");
        } finally {
            setIsSaving(false);
        }
    };

    // ─── Section nav config ───────────────────────────────────────────
    const sections: { id: AdminSection; icon: typeof Utensils; label: string; count: number }[] = [
        { id: "foods", icon: Utensils, label: "Alimentos", count: foods.length },
        { id: "micronutrients", icon: Zap, label: "Micronutrientes", count: micros.length },
        { id: "menu", icon: ClipboardCheck, label: "Menú Semanal", count: Object.keys(menuDays).length },
        { id: "courses", icon: BookOpen, label: "Cursos", count: courses.length },
        { id: "users", icon: Users, label: "Usuarios", count: users.length },
        { id: "calendar", icon: Calendar, label: "Calendario", count: appointments.length },
        { id: "reports", icon: FileText, label: "Reportes PDF", count: pdfReports.length },
        { id: "crm", icon: Settings, label: "CRM Automático", count: users.length },
    ];

    // ─── Filtered data ────────────────────────────────────────────────
    const filteredFoods = foods.filter(f => f.name.toLowerCase().includes(searchTerm.toLowerCase()) || f.category.toLowerCase().includes(searchTerm.toLowerCase()));
    const filteredMicros = micros.filter(m => m.name.toLowerCase().includes(searchTerm.toLowerCase()) || m.category.toLowerCase().includes(searchTerm.toLowerCase()));
    const filteredCourses = courses.filter(c => c.title.toLowerCase().includes(searchTerm.toLowerCase()));
    const filteredUsers = users.filter(u => 
        (u.name || "").toLowerCase().includes(searchTerm.toLowerCase()) || 
        (u.email || "").toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <motion.div key="admin-panel" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="space-y-1">
                    <h2 className="text-3xl font-display font-bold">Panel de Administración</h2>
                    <p className="text-nutrity-gray-text text-sm">Gestión completa del catálogo y contenido de {user?.profile?.organization?.name || "Nutrity Global"}.</p>
                </div>
                <div className="flex items-center gap-3">

                    <div className="bg-nutrity-accent/10 px-4 py-2 rounded-xl flex items-center gap-3 border border-nutrity-accent/20">
                        <Shield className="w-5 h-5 text-nutrity-accent" />
                        <span className="text-[10px] font-bold text-nutrity-accent uppercase tracking-widest">Admin Global</span>
                    </div>
                </div>
            </div>

            {/* Section Tabs */}
            <div className="flex flex-wrap gap-3">
                {sections.map((s) => (
                    <button
                        key={s.id}
                        onClick={() => { setSection(s.id); setSearchTerm(""); }}
                        className={`flex items-center gap-3 px-5 py-3 rounded-xl text-sm font-bold transition-all ${section === s.id
                            ? "bg-nutrity-primary text-white shadow-lg shadow-nutrity-primary/20"
                            : "bg-white text-nutrity-gray-text border border-nutrity-border hover:border-nutrity-accent/30"
                            }`}
                    >
                        <s.icon className={`w-4 h-4 ${section === s.id ? "text-nutrity-accent" : ""}`} />
                        {s.label}
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${section === s.id ? "bg-white/20 text-white" : "bg-nutrity-bg text-nutrity-gray-text"}`}>
                            {s.count}
                        </span>
                    </button>
                ))}
            </div>

            {/* Search + Add bar */}
            <div className="flex flex-col md:flex-row gap-4 items-stretch md:items-center">
                <div className="relative flex-1">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-nutrity-gray-text opacity-40" />
                    <input
                        type="text" placeholder={`Buscar ${sections.find(s => s.id === section)?.label.toLowerCase()}...`}
                        value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full bg-white border border-nutrity-border rounded-xl pl-11 pr-5 py-3.5 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-nutrity-accent/10 focus:border-nutrity-accent transition-all shadow-sm"
                    />
                </div>
                
                <div className="flex items-center gap-2 px-4 py-2 bg-white border border-nutrity-border rounded-xl">
                    <span className="text-[10px] font-bold text-nutrity-gray-text uppercase tracking-widest">Ver Eliminados</span>
                    <button 
                        onClick={() => setShowDeleted(!showDeleted)}
                        className={`w-10 h-5 rounded-full transition-all relative ${showDeleted ? 'bg-red-500' : 'bg-slate-200'}`}
                    >
                        <div className={`absolute top-1 w-3 h-3 bg-white rounded-full transition-all ${showDeleted ? 'left-6' : 'left-1'}`} />
                    </button>
                </div>
                <button
                    onClick={() => {
                        switch (section) {
                            case "foods": setEditingFood(emptyFood); setShowFoodModal(true); break;
                            case "micronutrients": setEditingMicro(emptyMicro); setShowMicroModal(true); break;
                            case "courses": setEditingCourse(emptyCourse); setShowCourseModal(true); break;
                            case "menu": break; // menu edits per day
                            case "users": alert("Para añadir usuarios, utiliza el flujo de registro o invitación."); break;
                        }
                    }}
                    className={`flex items-center gap-3 px-6 py-3.5 rounded-xl text-sm font-bold transition-all shadow-lg ${section === "menu" || section === "crm" || section === "users" || section === "calendar" || section === "reports"
                        ? "bg-nutrity-primary/30 text-nutrity-primary/50 cursor-not-allowed"
                        : "bg-nutrity-accent text-white shadow-nutrity-accent/20 hover:scale-105 active:scale-95"
                        }`}
                    disabled={section === "menu" || section === "crm" || section === "users" || section === "calendar" || section === "reports"}
                >
                    <PlusCircle className="w-5 h-5" />
                    Nuevo {section === "foods" ? "Alimento" : section === "micronutrients" ? "Micronutriente" : section === "courses" ? "Curso" : ""}
                </button>
            </div>

            {/* ═══════ SECTIONS ═══════ */}
            <AnimatePresence mode="wait">
                {section === "foods" && (
                    <motion.div key="foods-table" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-4">
                        <div className="flex justify-between items-center">
                            <h3 className="text-lg font-display font-bold text-nutrity-primary">Catálogo de Alimentos</h3>
                            <button
                                onClick={() => handleSync('foods')}
                                className="px-4 py-2 rounded-xl border border-nutrity-accent text-nutrity-accent font-bold text-[10px] uppercase tracking-widest hover:bg-nutrity-accent/5 transition-all flex items-center gap-2"
                            >
                                <Loader2 className={`w-3.5 h-3.5 ${isSaving ? 'animate-spin' : ''}`} />
                                Sincronizar Catálogo
                            </button>
                        </div>
                        <div className="nutrity-card bg-white overflow-hidden shadow-xl shadow-slate-200/50">
                            <div className="overflow-x-auto">
                                <table className="w-full text-left">
                                    <thead>
                                        <tr className="bg-slate-50/50 text-[10px] font-bold uppercase tracking-widest text-nutrity-gray-text/60">
                                            <th className="py-4 px-6">Imagen</th>
                                            <th className="py-4 px-6">Nombre</th>
                                            <th className="py-4 px-6">Categoría</th>
                                            <th className="py-4 px-6">Proteína</th>
                                            <th className="py-4 px-6">Fibra</th>
                                            <th className="py-4 px-6">Recetas</th>
                                            <th className="py-4 px-6 text-right">Acciones</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-nutrity-border">
                                        {filteredFoods.map((food) => (
                                            <tr key={food.id} className={`hover:bg-slate-50 transition-colors group ${(food as any).deletedAt ? 'opacity-50' : ''}`}>
                                                <td className="py-4 px-6">
                                                    <div className="w-12 h-12 rounded-xl overflow-hidden bg-nutrity-bg">
                                                        <img src={getDirectImageUrl(food.image)} className="w-full h-full object-cover" alt={food.name} />
                                                    </div>
                                                </td>
                                                <td className="py-4 px-6">
                                                    <span className="font-bold text-sm">{food.name}</span>
                                                    <p className="text-[10px] text-nutrity-gray-text italic">{food.scientificName}</p>
                                                </td>
                                                <td className="py-4 px-6">
                                                    <span className="px-2.5 py-1 bg-nutrity-accent/5 text-nutrity-accent text-[9px] font-bold rounded-lg uppercase tracking-wider">{food.category}</span>
                                                </td>
                                                <td className="py-4 px-6 text-sm font-bold">{food.nutrients?.protein}</td>
                                                <td className="py-4 px-6 text-sm font-bold">{food.nutrients?.fiber}</td>
                                                <td className="py-4 px-6 text-sm font-bold">{food.recipes?.length || 0}</td>
                                                <td className="py-4 px-6">
                                                    <div className="flex gap-2 justify-end opacity-0 group-hover:opacity-100 transition-opacity">
                                                        {(food as any).deletedAt ? (
                                                            <button onClick={() => handleRestore("foods", food.id)}
                                                                className="px-3 py-1.5 rounded-lg bg-emerald-50 text-emerald-600 text-[10px] font-bold hover:bg-emerald-600 hover:text-white transition-all">
                                                                Restaurar
                                                            </button>
                                                        ) : (
                                                            <>
                                                                <button onClick={() => { setEditingFood(food); setShowFoodModal(true); }}
                                                                    className="p-2 rounded-lg bg-nutrity-accent/10 text-nutrity-accent hover:bg-nutrity-accent hover:text-white transition-all">
                                                                    <Pencil className="w-4 h-4" />
                                                                </button>
                                                                <button onClick={() => setDeleteTarget({ type: "foods", id: food.id, name: food.name })}
                                                                    className="p-2 rounded-lg bg-red-50 text-red-500 hover:bg-red-500 hover:text-white transition-all">
                                                                    <Trash2 className="w-4 h-4" />
                                                                </button>
                                                            </>
                                                        )}
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </motion.div>
                )}

                {section === "micronutrients" && (
                    <motion.div key="micro-table" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                        <div className="nutrity-card bg-white overflow-hidden shadow-xl shadow-slate-200/50">
                            <div className="overflow-x-auto">
                                <table className="w-full text-left">
                                    <thead>
                                        <tr className="bg-slate-50/50 text-[10px] font-bold uppercase tracking-widest text-nutrity-gray-text/60">
                                            <th className="py-4 px-6">Símbolo</th>
                                            <th className="py-4 px-6">Nombre</th>
                                            <th className="py-4 px-6">Categoría</th>
                                            <th className="py-4 px-6">Dosis Diaria</th>
                                            <th className="py-4 px-6 text-right">Acciones</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-nutrity-border">
                                        {filteredMicros.map((micro) => (
                                            <tr key={micro.id} className={`hover:bg-slate-50 transition-colors group ${(micro as any).deletedAt ? 'opacity-50' : ''}`}>
                                                <td className="py-4 px-6">
                                                    <div className="w-10 h-10 rounded-xl bg-nutrity-accent/10 flex items-center justify-center">
                                                        <span className="text-sm font-black text-nutrity-accent">{micro.symbol}</span>
                                                    </div>
                                                </td>
                                                <td className="py-4 px-6 font-bold text-sm">{micro.name}</td>
                                                <td className="py-4 px-6">
                                                    <span className="px-2.5 py-1 bg-nutrity-bg text-[9px] font-bold rounded-lg uppercase tracking-wider text-nutrity-primary">{micro.category}</span>
                                                </td>
                                                <td className="py-4 px-6 text-sm font-medium text-nutrity-accent">{micro.dailyDose}</td>
                                                <td className="py-4 px-6">
                                                    <div className="flex gap-2 justify-end opacity-0 group-hover:opacity-100 transition-opacity">
                                                        {(micro as any).deletedAt ? (
                                                            <button onClick={() => handleRestore("micronutrients", micro.id)}
                                                                className="px-3 py-1.5 rounded-lg bg-emerald-50 text-emerald-600 text-[10px] font-bold hover:bg-emerald-600 hover:text-white transition-all">
                                                                Restaurar
                                                            </button>
                                                        ) : (
                                                            <>
                                                                <button onClick={() => { setEditingMicro(micro); setShowMicroModal(true); }}
                                                                    className="p-2 rounded-lg bg-nutrity-accent/10 text-nutrity-accent hover:bg-nutrity-accent hover:text-white transition-all">
                                                                    <Pencil className="w-4 h-4" />
                                                                </button>
                                                                <button onClick={() => setDeleteTarget({ type: "micronutrients", id: micro.id, name: micro.name })}
                                                                    className="p-2 rounded-lg bg-red-50 text-red-500 hover:bg-red-500 hover:text-white transition-all">
                                                                    <Trash2 className="w-4 h-4" />
                                                                </button>
                                                            </>
                                                        )}
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </motion.div>
                )}

                {section === "courses" && (
                    <motion.div key="courses-table" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                        <div className="nutrity-card bg-white overflow-hidden shadow-xl shadow-slate-200/50">
                            <div className="overflow-x-auto">
                                <table className="w-full text-left">
                                    <thead>
                                        <tr className="bg-slate-50/50 text-[10px] font-bold uppercase tracking-widest text-nutrity-gray-text/60">
                                            <th className="py-4 px-6">Imagen</th>
                                            <th className="py-4 px-6">Título</th>
                                            <th className="py-4 px-6">Categoría</th>
                                            <th className="py-4 px-6">Precio</th>
                                            <th className="py-4 px-6 text-right">Acciones</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-nutrity-border">
                                        {filteredCourses.map((course) => (
                                            <tr key={course.id} className={`hover:bg-slate-50 transition-colors group ${(course as any).deletedAt ? 'opacity-50' : ''}`}>
                                                <td className="py-4 px-6">
                                                    <div className="w-16 h-10 rounded-xl overflow-hidden bg-nutrity-bg">
                                                        <img src={getDirectImageUrl(course.thumbnail)} className="w-full h-full object-cover" alt={course.title} />
                                                    </div>
                                                </td>
                                                <td className="py-4 px-6 font-bold text-sm">{course.title}</td>
                                                <td className="py-4 px-6">
                                                    <span className="px-2.5 py-1 bg-nutrity-accent/5 text-nutrity-accent text-[9px] font-bold rounded-lg uppercase tracking-wider">{course.category}</span>
                                                </td>
                                                <td className="py-4 px-6 text-sm font-bold">${course.price} USD</td>
                                                <td className="py-4 px-6">
                                                    <div className="flex gap-2 justify-end opacity-0 group-hover:opacity-100 transition-opacity">
                                                        {(course as any).deletedAt ? (
                                                            <button onClick={() => handleRestore("courses", course.id)}
                                                                className="px-3 py-1.5 rounded-lg bg-emerald-50 text-emerald-600 text-[10px] font-bold hover:bg-emerald-600 hover:text-white transition-all">
                                                                Restaurar
                                                            </button>
                                                        ) : (
                                                            <>
                                                                <button onClick={() => { setEditingCourse(course); setShowCourseModal(true); }}
                                                                    className="p-2 rounded-lg bg-nutrity-accent/10 text-nutrity-accent hover:bg-nutrity-accent hover:text-white transition-all">
                                                                    <Pencil className="w-4 h-4" />
                                                                </button>
                                                                <button onClick={() => setDeleteTarget({ type: "courses", id: course.id, name: course.title })}
                                                                    className="p-2 rounded-lg bg-red-50 text-red-500 hover:bg-red-500 hover:text-white transition-all">
                                                                    <Trash2 className="w-4 h-4" />
                                                                </button>
                                                            </>
                                                        )}
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </motion.div>
                )}

                {section === "menu" && (
                    <motion.div key="menu-table" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                        <div className="grid gap-6">
                            {Object.entries(menuDays).map(([day, meal]) => (
                                <div key={day} className="nutrity-card p-6 hover:border-nutrity-accent transition-all group">
                                    <div className="flex items-center justify-between mb-4">
                                        <h3 className="text-lg font-bold capitalize flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-xl bg-nutrity-accent/10 flex items-center justify-center text-nutrity-accent">
                                                <ClipboardCheck className="w-5 h-5" />
                                            </div>
                                            {day}
                                        </h3>
                                        <button
                                            onClick={() => { setEditingMenuDay({ day, meal }); setShowMenuModal(true); }}
                                            className="opacity-0 group-hover:opacity-100 p-2 rounded-lg bg-nutrity-accent/10 text-nutrity-accent hover:bg-nutrity-accent hover:text-white transition-all"
                                        >
                                            <Pencil className="w-4 h-4" />
                                        </button>
                                    </div>
                                    <div className="grid md:grid-cols-4 gap-4">
                                        {[
                                            { label: "Desayuno", value: meal.breakfast },
                                            { label: "Almuerzo", value: meal.lunch },
                                            { label: "Snack", value: meal.snack },
                                            { label: "Cena", value: meal.dinner },
                                        ].map(({ label, value }) => (
                                            <div key={label} className="bg-nutrity-bg rounded-xl p-4 space-y-1.5">
                                                <span className="text-[9px] font-bold text-nutrity-gray-text uppercase tracking-widest opacity-50">{label}</span>
                                                <p className="text-xs font-medium text-nutrity-primary leading-relaxed">{value}</p>
                                            </div>
                                        ))}
                                    </div>
                                    <div className="mt-3 flex items-center gap-2">
                                        <span className="text-[9px] font-bold text-nutrity-accent uppercase tracking-widest">Meta:</span>
                                        <span className="text-xs font-bold text-nutrity-primary">{meal.metabolicGoal}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </motion.div>
                )}

                {section === "users" && (
                    <motion.div key="users-table" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                        <div className="nutrity-card bg-white overflow-hidden shadow-xl shadow-slate-200/50">
                            <div className="overflow-x-auto">
                                <table className="w-full text-left">
                                    <thead>
                                        <tr className="bg-slate-50/50 text-[10px] font-bold uppercase tracking-widest text-nutrity-gray-text/60">
                                            <th className="py-4 px-6">Usuario</th>
                                            <th className="py-4 px-6">Contacto / Ubicación</th>
                                            <th className="py-4 px-6">Metabolismo / NMG</th>
                                            <th className="py-4 px-6">Estado</th>
                                            <th className="py-4 px-6 text-right">Acciones</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-nutrity-border">
                                        {filteredUsers.map((u) => (
                                            <tr key={u.id} className={`hover:bg-slate-50 transition-colors group ${(u as any).deletedAt ? 'opacity-50' : ''}`}>
                                                <td className="py-4 px-6">
                                                    <div className="flex items-center gap-3 cursor-pointer" onClick={() => { setSelectedCardexUser(u); setShowCardexModal(true); }}>
                                                        <div className="w-10 h-10 rounded-full bg-nutrity-primary/10 flex items-center justify-center text-nutrity-primary font-bold text-xs">
                                                            {u.name?.charAt(0) || "U"}
                                                        </div>
                                                        <div>
                                                            <span className="font-bold text-sm block hover:text-nutrity-accent transition-colors">{u.name || "Sin nombre"}</span>
                                                            <p className="text-[10px] text-nutrity-gray-text">{u.email}</p>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="py-4 px-6">
                                                    <div className="space-y-0.5">
                                                        <p className="text-xs font-medium text-nutrity-primary">{u.phone || 'No registrado'}</p>
                                                        <p className="text-[10px] text-nutrity-gray-text">{u.address || 'Sin dirección'}</p>
                                                    </div>
                                                </td>
                                                <td className="py-4 px-6">
                                                    {u.metabolicResults ? (
                                                        <div className="space-y-1">
                                                            <div className="flex items-center gap-2">
                                                                <span className="text-xs font-bold text-nutrity-primary">{u.metabolicResults.remissionScore}% Remisión</span>
                                                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                                                            </div>
                                                            <p className="text-[10px] text-nutrity-gray-text italic">Fase: {u.metabolicResults.phase}</p>
                                                        </div>
                                                    ) : (
                                                        <span className="text-[10px] text-nutrity-gray-text opacity-40">Sin diagnóstico</span>
                                                    )}
                                                </td>
                                                <td className="py-4 px-6">
                                                    <div className="flex flex-col gap-1">
                                                        <span className={`px-2 py-0.5 rounded-lg text-[9px] font-bold uppercase tracking-wider text-center ${u.status === 'ACTIVE' ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-600'}`}>
                                                            {u.status || 'ACTIVE'}
                                                        </span>
                                                        <span className="text-[9px] font-bold text-nutrity-accent text-center">{u.plan || "FREEMIUM"}</span>
                                                    </div>
                                                </td>
                                                <td className="py-4 px-6">
                                                    <div className="flex gap-2 justify-end opacity-0 group-hover:opacity-100 transition-opacity">
                                                        {(u as any).deletedAt ? (
                                                            <button onClick={() => handleRestore("users", u.id)}
                                                                className="px-3 py-1.5 rounded-lg bg-emerald-50 text-emerald-600 text-[10px] font-bold hover:bg-emerald-600 hover:text-white transition-all">
                                                                Restaurar
                                                            </button>
                                                        ) : (
                                                            <>
                                                                <button onClick={() => { setSelectedCardexUser(u); setShowCardexModal(true); }}
                                                                    className="p-2 rounded-lg bg-nutrity-primary/10 text-nutrity-primary hover:bg-nutrity-primary hover:text-white transition-all" title="Ver Cardex">
                                                                    <FileText className="w-4 h-4" />
                                                                </button>
                                                                <button onClick={() => { setEditingUser(u); setShowUserModal(true); }}
                                                                    className="p-2 rounded-lg bg-nutrity-accent/10 text-nutrity-accent hover:bg-nutrity-accent hover:text-white transition-all">
                                                                    <Pencil className="w-4 h-4" />
                                                                </button>
                                                                <button onClick={() => setDeleteTarget({ type: "users", id: u.id, name: u.name || u.email })}
                                                                    className="p-2 rounded-lg bg-red-50 text-red-500 hover:bg-red-500 hover:text-white transition-all">
                                                                    <Trash2 className="w-4 h-4" />
                                                                </button>
                                                            </>
                                                        )}
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </motion.div>
                )}

            {/* BIO-CARDEX MODAL */}
            <AnimatePresence>
                {showCardexModal && selectedCardexUser && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[400] bg-nutrity-primary/60 backdrop-blur-md flex items-center justify-center p-4 md:p-10">
                        <motion.div initial={{ scale: 0.9, y: 30 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 30 }} className="bg-nutrity-bg w-full max-w-4xl rounded-[2.5rem] shadow-2xl flex flex-col max-h-[90vh] overflow-hidden relative">
                            {/* Cardex Header */}
                            <div className="bg-white p-8 md:p-10 border-b border-nutrity-border flex flex-col md:flex-row justify-between gap-6 items-start">
                                <div className="flex items-center gap-6">
                                    <div className="w-20 h-20 rounded-3xl bg-nutrity-primary flex items-center justify-center text-white text-3xl font-bold shadow-xl shadow-nutrity-primary/20">
                                        {selectedCardexUser.name?.charAt(0) || "U"}
                                    </div>
                                    <div className="space-y-1">
                                        <div className="flex items-center gap-3">
                                            <h3 className="text-3xl font-display font-bold">{selectedCardexUser.name || "Sin nombre"}</h3>
                                            <span className="px-3 py-1 bg-nutrity-accent/10 text-nutrity-accent text-[10px] font-bold rounded-full uppercase tracking-widest">{selectedCardexUser.plan || "FREEMIUM"}</span>
                                        </div>
                                        <p className="text-nutrity-gray-text font-medium">{selectedCardexUser.email}</p>
                                        <div className="flex items-center gap-4 pt-2">
                                            <div className="flex items-center gap-2 text-xs font-bold text-nutrity-primary">
                                                <Shield className="w-3.5 h-3.5" /> {selectedCardexUser.role}
                                            </div>
                                            <div className="flex items-center gap-2 text-xs font-bold text-emerald-600">
                                                <CheckCircle2 className="w-3.5 h-3.5" /> {selectedCardexUser.status || "ACTIVE"}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <button onClick={() => setShowCardexModal(false)} className="absolute top-8 right-8 p-3 rounded-2xl bg-slate-100 hover:bg-slate-200 transition-all text-nutrity-gray-text">
                                    <X className="w-6 h-6" />
                                </button>
                            </div>

                            {/* Cardex Content */}
                            <div className="flex-1 overflow-y-auto p-8 md:p-10 space-y-10">
                                {/* Grid de Datos Rápidos */}
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                                    <div className="bg-white p-5 rounded-3xl shadow-sm border border-nutrity-border space-y-1">
                                        <span className="text-[10px] font-bold text-nutrity-gray-text uppercase tracking-widest">Celular</span>
                                        <p className="font-bold text-nutrity-primary">{selectedCardexUser.phone || "---"}</p>
                                    </div>
                                    <div className="bg-white p-5 rounded-3xl shadow-sm border border-nutrity-border space-y-1">
                                        <span className="text-[10px] font-bold text-nutrity-gray-text uppercase tracking-widest">Edad</span>
                                        <p className="font-bold text-nutrity-primary">{selectedCardexUser.age || "---"} años</p>
                                    </div>
                                    <div className="bg-white p-5 rounded-3xl shadow-sm border border-nutrity-border space-y-1">
                                        <span className="text-[10px] font-bold text-nutrity-gray-text uppercase tracking-widest">Estado Civil</span>
                                        <p className="font-bold text-nutrity-primary">{selectedCardexUser.maritalStatus || "---"}</p>
                                    </div>
                                    <div className="bg-white p-5 rounded-3xl shadow-sm border border-nutrity-border space-y-1">
                                        <span className="text-[10px] font-bold text-nutrity-gray-text uppercase tracking-widest">Ocupación</span>
                                        <p className="font-bold text-nutrity-primary">{selectedCardexUser.occupation || "---"}</p>
                                    </div>
                                </div>

                                <div className="grid md:grid-cols-2 gap-10">
                                    {/* Sección Médica */}
                                    <div className="space-y-6">
                                        <h4 className="text-xl font-display font-bold flex items-center gap-3">
                                            <Activity className="w-6 h-6 text-nutrity-accent" />
                                            Expediente Metabólico
                                        </h4>
                                        <div className="bg-white rounded-3xl p-6 shadow-sm border border-nutrity-border space-y-6">
                                            {selectedCardexUser.metabolicResults ? (
                                                <>
                                                    <div className="flex items-center justify-between p-4 bg-emerald-50 rounded-2xl border border-emerald-100">
                                                        <div className="space-y-1">
                                                            <span className="text-[10px] font-bold text-emerald-600 uppercase tracking-widest">Score de Remisión</span>
                                                            <p className="text-2xl font-black text-emerald-700">{selectedCardexUser.metabolicResults.remissionScore}%</p>
                                                        </div>
                                                        <Zap className="w-8 h-8 text-emerald-500" />
                                                    </div>
                                                    <div className="space-y-2">
                                                        <span className="text-[10px] font-bold text-nutrity-gray-text uppercase tracking-widest">Insight IA</span>
                                                        <p className="text-sm font-medium text-nutrity-primary italic leading-relaxed">
                                                            "{selectedCardexUser.metabolicResults.insight || "Sin insight generado"}"
                                                        </p>
                                                    </div>
                                                    <div className="pt-4 border-t border-nutrity-border">
                                                        <span className="text-[10px] font-bold text-nutrity-gray-text uppercase tracking-widest mb-3 block">Pilares de Tratamiento</span>
                                                        <div className="flex flex-wrap gap-2">
                                                            {selectedCardexUser.metabolicResults.pillars?.map((p: any, i: number) => (
                                                                <span key={i} className="px-3 py-1 bg-nutrity-bg text-nutrity-primary text-[10px] font-bold rounded-lg border border-nutrity-border">{p.title}</span>
                                                            ))}
                                                        </div>
                                                    </div>
                                                </>
                                            ) : (
                                                <div className="py-10 text-center space-y-3 opacity-40">
                                                    <AlertTriangle className="w-10 h-10 mx-auto" />
                                                    <p className="text-sm font-bold uppercase tracking-widest">Sin Diagnóstico Realizado</p>
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    {/* Sección de Contacto y Social */}
                                    <div className="space-y-6">
                                        <h4 className="text-xl font-display font-bold flex items-center gap-3">
                                            <Users className="w-6 h-6 text-nutrity-accent" />
                                            Información de Contacto
                                        </h4>
                                        <div className="bg-white rounded-3xl p-6 shadow-sm border border-nutrity-border space-y-4">
                                            <div className="space-y-1">
                                                <span className="text-[10px] font-bold text-nutrity-gray-text uppercase tracking-widest">Dirección Completa</span>
                                                <p className="text-sm font-bold text-nutrity-primary">{selectedCardexUser.address || "No especificada"}</p>
                                            </div>
                                            <div className="space-y-1">
                                                <span className="text-[10px] font-bold text-nutrity-gray-text uppercase tracking-widest">Redes Sociales</span>
                                                <p className="text-sm font-bold text-nutrity-accent">{selectedCardexUser.socialMedia || "Sin redes registradas"}</p>
                                            </div>
                                            <div className="pt-4 border-t border-nutrity-border flex gap-4">
                                                <a href={`https://wa.me/${selectedCardexUser.phone?.replace(/\+/g, '')}`} target="_blank" className="flex-1 py-3 rounded-2xl bg-[#25D366] text-white text-[10px] font-bold uppercase tracking-widest text-center shadow-lg shadow-green-500/20 hover:scale-105 transition-all">WhatsApp Directo</a>
                                                <a href={`mailto:${selectedCardexUser.email}`} className="flex-1 py-3 rounded-2xl bg-nutrity-primary text-white text-[10px] font-bold uppercase tracking-widest text-center shadow-lg shadow-nutrity-primary/20 hover:scale-105 transition-all">Enviar Email</a>
                                            </div>
                                        </div>
                                        
                                        {/* Acciones de Cardex */}
                                        <div className="bg-nutrity-primary text-white rounded-3xl p-6 space-y-4 shadow-xl shadow-nutrity-primary/20">
                                            <p className="text-xs font-bold uppercase tracking-widest opacity-60">Control Administrativo</p>
                                            <div className="grid grid-cols-2 gap-3">
                                                <button onClick={() => { setEditingUser(selectedCardexUser); setShowUserModal(true); setShowCardexModal(false); }} className="p-3 rounded-xl bg-white/10 hover:bg-white/20 transition-all text-xs font-bold flex items-center justify-center gap-2">
                                                    <Pencil className="w-4 h-4" /> Editar
                                                </button>
                                                <button onClick={() => { setDeleteTarget({ type: 'users', id: selectedCardexUser.id, name: selectedCardexUser.name || selectedCardexUser.email }); setShowCardexModal(false); }} className="p-3 rounded-xl bg-red-500/20 hover:bg-red-500/40 transition-all text-xs font-bold text-red-200 flex items-center justify-center gap-2">
                                                    <Trash2 className="w-4 h-4" /> Eliminar
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

                {section === "calendar" && (
                    <motion.div key="calendar-view" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                        <div className="mb-6 flex items-center justify-between gap-4">
                            <div className="flex gap-2">
                                {["ALL", "DIAGNOSTICO", "CONTROL"].map((f) => (
                                    <button
                                        key={f}
                                        onClick={() => setApptFilter(f as any)}
                                        className={`px-4 py-2 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all ${
                                            apptFilter === f ? "bg-nutrity-accent text-white shadow-lg shadow-nutrity-accent/20" : "bg-white text-nutrity-gray-text hover:bg-nutrity-bg"
                                        }`}
                                    >
                                        {f === "ALL" ? "Todas" : f === "DIAGNOSTICO" ? "Diagnósticos" : "Controles"}
                                    </button>
                                ))}
                            </div>
                            <button
                                onClick={() => { setEditingAppt({ date: new Date().toISOString().split('T')[0], time: "10:00", title: "Consulta de Control", type: "VIRTUAL" }); setShowApptModal(true); }}
                                className="px-6 py-2 bg-nutrity-primary text-white rounded-xl text-[10px] font-bold uppercase tracking-widest hover:bg-nutrity-primary-light transition-all flex items-center gap-2"
                            >
                                <PlusCircle className="w-4 h-4" /> Nueva Cita
                            </button>
                        </div>
                        <div className="nutrity-card bg-white overflow-hidden shadow-xl shadow-slate-200/50">
                            <div className="overflow-x-auto">
                                <table className="w-full text-left">
                                    <thead>
                                        <tr className="bg-slate-50/50 text-[10px] font-bold uppercase tracking-widest text-nutrity-gray-text/60">
                                            <th className="py-4 px-6">Paciente</th>
                                            <th className="py-4 px-6">Fecha</th>
                                            <th className="py-4 px-6">Hora</th>
                                            <th className="py-4 px-6">Motivo</th>
                                            <th className="py-4 px-6 text-right">Acciones</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-nutrity-border">
                                        {appointments
                                            .filter((a: any) => {
                                                if (apptFilter === "ALL") return true;
                                                if (apptFilter === "DIAGNOSTICO") return a.title.toLowerCase().includes("diagnóstico");
                                                if (apptFilter === "CONTROL") return !a.title.toLowerCase().includes("diagnóstico");
                                                return true;
                                            })
                                            .map((app) => (
                                            <tr key={app.id} className={`hover:bg-slate-50 transition-colors group ${(app as any).deletedAt ? 'opacity-50' : ''}`}>
                                                <td className="py-4 px-6">
                                                    <span className="font-bold text-sm block">{app.user?.name || "Usuario"}</span>
                                                    <p className="text-[10px] text-nutrity-gray-text">{app.user?.email}</p>
                                                </td>
                                                <td className="py-4 px-6 text-sm font-medium">
                                                    {new Date(app.date).toLocaleDateString()}
                                                </td>
                                                <td className="py-4 px-6 text-sm font-bold text-nutrity-accent">{app.time}</td>
                                                <td className="py-4 px-6 text-xs text-nutrity-primary/80">{app.title}</td>
                                                <td className="py-4 px-6 text-right">
                                                    <div className="flex justify-end gap-2">
                                                        {(app as any).deletedAt ? (
                                                            <button onClick={() => handleRestore("calendar", app.id)}
                                                                className="px-3 py-1.5 rounded-lg bg-emerald-50 text-emerald-600 text-[10px] font-bold hover:bg-emerald-600 hover:text-white transition-all">
                                                                Restaurar
                                                            </button>
                                                        ) : (
                                                            <>
                                                                <button onClick={() => { setEditingAppt(app); setShowApptModal(true); }}
                                                                    className="p-2 text-nutrity-gray-text hover:text-nutrity-accent transition-colors">
                                                                    <Pencil className="w-4 h-4" />
                                                                </button>
                                                                <button onClick={() => setDeleteTarget({ type: "calendar", id: app.id, name: `Cita de ${app.user?.name}` })}
                                                                    className="p-2 text-nutrity-gray-text hover:text-rose-500 transition-colors">
                                                                    <Trash2 className="w-4 h-4" />
                                                                </button>
                                                            </>
                                                        )}
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </motion.div>
                )}

                {section === "crm" && (
                    <motion.div key="crm-dashboard" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                            <div className="nutrity-card p-8 space-y-4 text-center">
                                <Users className="w-8 h-8 text-nutrity-accent mx-auto" />
                                <h3 className="text-2xl font-bold">{users.length}</h3>
                                <p className="text-[10px] font-bold text-nutrity-gray-text uppercase tracking-widest">Total Usuarios</p>
                            </div>
                            <div className="nutrity-card p-8 space-y-4 text-center">
                                <Activity className="w-8 h-8 text-emerald-500 mx-auto" />
                                <h3 className="text-2xl font-bold">
                                    {Math.round(users.reduce((acc, u) => acc + (u.metabolicResults?.remissionScore || 0), 0) / (users.filter(u => u.metabolicResults).length || 1))}%
                                </h3>
                                <p className="text-[10px] font-bold text-nutrity-gray-text uppercase tracking-widest">Remisión Promedio</p>
                            </div>
                            <div className="nutrity-card p-8 space-y-4 text-center">
                                <Shield className="w-8 h-8 text-rose-500 mx-auto" />
                                <h3 className="text-2xl font-bold">{users.filter(u => u.status === 'BLOCKED').length}</h3>
                                <p className="text-[10px] font-bold text-nutrity-gray-text uppercase tracking-widest">Bloqueados</p>
                            </div>
                            <div className="nutrity-card p-8 space-y-4 text-center">
                                <Calendar className="w-8 h-8 text-blue-500 mx-auto" />
                                <h3 className="text-2xl font-bold">{appointments.length}</h3>
                                <p className="text-[10px] font-bold text-nutrity-gray-text uppercase tracking-widest">Citas Totales</p>
                            </div>
                        </div>

                        {/* Recent Alerts / Observations */}
                        <div className="mt-8 grid md:grid-cols-2 gap-6">
                            <div className="nutrity-card p-6">
                                <h4 className="text-xs font-bold uppercase tracking-widest mb-4 flex items-center gap-2">
                                    <AlertTriangle className="w-4 h-4 text-amber-500" /> Pacientes con Score Bajo (&lt;40)
                                </h4>
                                <div className="space-y-3">
                                    {users.filter(u => u.metabolicResults && u.metabolicResults.remissionScore < 40).map(u => (
                                        <div key={u.id} className="flex items-center justify-between p-3 bg-red-50 rounded-xl">
                                            <span className="text-xs font-bold">{u.name}</span>
                                            <span className="text-[10px] font-bold text-red-600">{u.metabolicResults.remissionScore}%</span>
                                        </div>
                                    ))}
                                    {users.filter(u => u.metabolicResults && u.metabolicResults.remissionScore < 40).length === 0 && (
                                        <p className="text-xs text-nutrity-gray-text italic text-center py-4">No hay alertas críticas.</p>
                                    )}
                                </div>
                            </div>
                            <div className="nutrity-card p-6">
                                <h4 className="text-xs font-bold uppercase tracking-widest mb-4 flex items-center gap-2">
                                    <Zap className="w-4 h-4 text-emerald-500" /> Próximos Diagnósticos
                                </h4>
                                <div className="space-y-3">
                                    {appointments.filter(a => a.title.toLowerCase().includes("diagnóstico")).slice(0, 5).map(a => (
                                        <div key={a.id} className="flex items-center justify-between p-3 bg-emerald-50 rounded-xl">
                                            <span className="text-xs font-bold">{a.user?.name}</span>
                                            <span className="text-[10px] font-bold text-emerald-600">{new Date(a.date).toLocaleDateString()}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </motion.div>
                )}

                {section === "reports" && (
                    <motion.div key="reports-view" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                        <div className="nutrity-card bg-white overflow-hidden shadow-xl shadow-slate-200/50">
                            <div className="overflow-x-auto">
                                <table className="w-full text-left">
                                    <thead>
                                        <tr className="bg-slate-50/50 text-[10px] font-bold uppercase tracking-widest text-nutrity-gray-text/60">
                                            <th className="py-4 px-6">Usuario</th>
                                            <th className="py-4 px-6">Estado</th>
                                            <th className="py-4 px-6">Fecha</th>
                                            <th className="py-4 px-6">Mensaje</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-nutrity-border">
                                        {pdfReports.map((log) => (
                                            <tr key={log.id} className="hover:bg-slate-50 transition-colors group">
                                                <td className="py-4 px-6">
                                                    <span className="font-bold text-sm block">{log.user?.name || "Usuario"}</span>
                                                    <p className="text-[10px] text-nutrity-gray-text">{log.user?.email}</p>
                                                </td>
                                                <td className="py-4 px-6">
                                                    <span className={`px-2 py-1 rounded-lg text-[9px] font-bold uppercase tracking-wider ${
                                                        log.status === 'DOWNLOADED' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' :
                                                        log.status === 'ERROR' ? 'bg-red-50 text-red-600 border-red-100' :
                                                        'bg-blue-50 text-blue-600 border-blue-100'
                                                    }`}>
                                                        {log.status}
                                                    </span>
                                                </td>
                                                <td className="py-4 px-6 text-[11px] text-nutrity-gray-text">
                                                    {new Date(log.timestamp).toLocaleString()}
                                                </td>
                                                <td className="py-4 px-6 text-xs text-nutrity-primary/60">
                                                    {log.errorMessage || "Procesado correctamente"}
                                                </td>
                                            </tr>
                                        ))}
                                        {pdfReports.length === 0 && (
                                            <tr><td colSpan={4} className="py-16 text-center text-nutrity-gray-text text-sm">No hay registros de reportes</td></tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* ═══════════════ MODALS ═══════════════ */}
            <AnimatePresence>
                {/* ─── Food Modal ─── */}
                {showFoodModal && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[200] bg-nutrity-primary/60 backdrop-blur-md flex items-center justify-center p-4"
                    >
                        <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }} exit={{ scale: 0.95 }}
                            className="bg-white w-full max-w-2xl max-h-[85vh] rounded-2xl shadow-2xl flex flex-col overflow-hidden"
                        >
                            <div className="p-8 border-b border-nutrity-border flex items-center justify-between shrink-0">
                                <div>
                                    <h3 className="text-xl font-display font-bold">{editingFood.id ? "Editar Alimento" : "Nuevo Alimento"}</h3>
                                    <p className="text-xs text-nutrity-gray-text font-medium">Completa los campos del catálogo metabólico</p>
                                </div>
                                <button onClick={() => setShowFoodModal(false)} className="p-2 rounded-full hover:bg-nutrity-bg"><X className="w-5 h-5 text-nutrity-gray-text" /></button>
                            </div>
                            <form onSubmit={handleSaveFood} className="flex-1 overflow-y-auto p-8 space-y-5 scrollbar-hide">
                                <div className="grid grid-cols-2 gap-4">
                                    <FieldInput label="Nombre" value={editingFood.name || ""} onChange={(v) => setEditingFood(p => ({ ...p, name: v }))} required placeholder="Tarwi (Chocho)" />
                                    <FieldInput label="Nombre Científico" value={editingFood.scientificName || ""} onChange={(v) => setEditingFood(p => ({ ...p, scientificName: v }))} placeholder="Lupinus mutabilis" />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <FieldInput label="Categoría" value={editingFood.category || ""} onChange={(v) => setEditingFood(p => ({ ...p, category: v }))} required placeholder="Leguminosa Andina" />
                                    <FieldInput label="Imagen URL" value={editingFood.image || ""} onChange={(v) => setEditingFood(p => ({ ...p, image: v }))} placeholder="/image.png o https://..." />
                                </div>
                                <FieldInput label="Descripción" value={editingFood.description || ""} onChange={(v) => setEditingFood(p => ({ ...p, description: v }))} multiline placeholder="Descripción detallada del alimento..." />
                                <div className="grid grid-cols-3 gap-4">
                                    <FieldInput label="Proteína" value={editingFood.nutrients?.protein || ""} onChange={(v) => setEditingFood(p => ({ ...p, nutrients: { ...p.nutrients!, protein: v } }))} placeholder="40g" />
                                    <FieldInput label="Fibra" value={editingFood.nutrients?.fiber || ""} onChange={(v) => setEditingFood(p => ({ ...p, nutrients: { ...p.nutrients!, fiber: v } }))} placeholder="10g" />
                                    <FieldInput label="Azúcar" value={editingFood.nutrients?.sugar || ""} onChange={(v) => setEditingFood(p => ({ ...p, nutrients: { ...p.nutrients!, sugar: v } }))} placeholder="0.5g" />
                                </div>
                                <TagInput label="Beneficios Metabólicos" tags={editingFood.metabolicBenefits || []} onChange={(t) => setEditingFood(p => ({ ...p, metabolicBenefits: t }))} />

                                {/* Recipes editor */}
                                <div className="space-y-3">
                                    <div className="flex items-center justify-between">
                                        <label className="text-[10px] font-bold text-nutrity-gray-text uppercase tracking-widest ml-1">Recetas</label>
                                        <button type="button" onClick={() => setEditingFood(p => ({ ...p, recipes: [...(p.recipes || []), { title: "", instructions: [] }] }))}
                                            className="text-[10px] font-bold text-nutrity-accent uppercase tracking-widest flex items-center gap-1 hover:underline">
                                            <PlusCircle className="w-3 h-3" /> Agregar Receta
                                        </button>
                                    </div>
                                    {editingFood.recipes?.map((recipe, rIdx) => (
                                        <div key={rIdx} className="bg-nutrity-bg rounded-xl p-4 space-y-3 border border-nutrity-border">
                                            <div className="flex items-center gap-2">
                                                <input
                                                    type="text" value={recipe.title} placeholder={`Receta ${rIdx + 1}`}
                                                    onChange={(e) => {
                                                        const updated = [...(editingFood.recipes || [])];
                                                        updated[rIdx] = { ...updated[rIdx], title: e.target.value };
                                                        setEditingFood(p => ({ ...p, recipes: updated }));
                                                    }}
                                                    className="flex-1 bg-white border border-nutrity-border rounded-lg px-3 py-2 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-nutrity-accent/10"
                                                />
                                                <button type="button" onClick={() => setEditingFood(p => ({ ...p, recipes: p.recipes?.filter((_, i) => i !== rIdx) }))}
                                                    className="p-1.5 rounded-lg text-red-400 hover:bg-red-50 transition-all"><Trash2 className="w-3.5 h-3.5" /></button>
                                            </div>
                                            <TagInput label="Pasos" tags={recipe.instructions} onChange={(instructions) => {
                                                const updated = [...(editingFood.recipes || [])];
                                                updated[rIdx] = { ...updated[rIdx], instructions };
                                                setEditingFood(p => ({ ...p, recipes: updated }));
                                            }} />
                                        </div>
                                    ))}
                                </div>

                                <button type="submit" disabled={isSaving}
                                    className="w-full mt-4 bg-nutrity-primary text-white py-4 rounded-xl font-bold text-sm uppercase tracking-widest shadow-lg shadow-nutrity-primary/10 hover:bg-nutrity-accent transition-all disabled:opacity-50 flex items-center justify-center gap-3">
                                    {isSaving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
                                    {isSaving ? "Guardando..." : "Guardar Alimento"}
                                </button>
                            </form>
                        </motion.div>
                    </motion.div>
                )}

                {/* ─── Micronutrient Modal ─── */}
                {showMicroModal && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[200] bg-nutrity-primary/60 backdrop-blur-md flex items-center justify-center p-4"
                    >
                        <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }} exit={{ scale: 0.95 }}
                            className="bg-white w-full max-w-2xl max-h-[85vh] rounded-2xl shadow-2xl flex flex-col overflow-hidden"
                        >
                            <div className="p-8 border-b border-nutrity-border flex items-center justify-between shrink-0">
                                <div>
                                    <h3 className="text-xl font-display font-bold">{editingMicro.id ? "Editar Micronutriente" : "Nuevo Micronutriente"}</h3>
                                    <p className="text-xs text-nutrity-gray-text font-medium">Cofactores esenciales para la regeneración celular</p>
                                </div>
                                <button onClick={() => setShowMicroModal(false)} className="p-2 rounded-full hover:bg-nutrity-bg"><X className="w-5 h-5 text-nutrity-gray-text" /></button>
                            </div>
                            <form onSubmit={handleSaveMicro} className="flex-1 overflow-y-auto p-8 space-y-5 scrollbar-hide">
                                <div className="grid grid-cols-2 gap-4">
                                    <FieldInput label="Nombre" value={editingMicro.name || ""} onChange={(v) => setEditingMicro(p => ({ ...p, name: v }))} required placeholder="Magnesio" />
                                    <FieldInput label="Símbolo" value={editingMicro.symbol || ""} onChange={(v) => setEditingMicro(p => ({ ...p, symbol: v }))} required placeholder="Mg" />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <FieldInput label="Categoría" value={editingMicro.category || ""} onChange={(v) => setEditingMicro(p => ({ ...p, category: v }))} required placeholder="Mineral Esencial" />
                                    <FieldInput label="Dosis Diaria" value={editingMicro.dailyDose || ""} onChange={(v) => setEditingMicro(p => ({ ...p, dailyDose: v }))} placeholder="300 - 450 mg" />
                                </div>
                                <FieldInput label="Función" value={editingMicro.function || ""} onChange={(v) => setEditingMicro(p => ({ ...p, function: v }))} multiline placeholder="Función biológica del micronutriente..." />
                                <FieldInput label="Impacto Metabólico" value={editingMicro.metabolicImpact || ""} onChange={(v) => setEditingMicro(p => ({ ...p, metabolicImpact: v }))} multiline placeholder="Efecto en el metabolismo..." />
                                <FieldInput label="Imagen URL" value={editingMicro.image || ""} onChange={(v) => setEditingMicro(p => ({ ...p, image: v }))} placeholder="/image.png" />
                                <TagInput label="Fuentes Bioavales" tags={editingMicro.sources || []} onChange={(t) => setEditingMicro(p => ({ ...p, sources: t }))} />
                                <TagInput label="Señales de Deficiencia" tags={editingMicro.deficiencySigns || []} onChange={(t) => setEditingMicro(p => ({ ...p, deficiencySigns: t }))} />

                                <button type="submit" disabled={isSaving}
                                    className="w-full mt-4 bg-nutrity-primary text-white py-4 rounded-xl font-bold text-sm uppercase tracking-widest shadow-lg shadow-nutrity-primary/10 hover:bg-nutrity-accent transition-all disabled:opacity-50 flex items-center justify-center gap-3">
                                    {isSaving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
                                    {isSaving ? "Guardando..." : "Guardar Micronutriente"}
                                </button>
                            </form>
                        </motion.div>
                    </motion.div>
                )}

                {/* ─── Course Modal ─── */}
                {showCourseModal && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[200] bg-nutrity-primary/60 backdrop-blur-md flex items-center justify-center p-4"
                    >
                        <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }} exit={{ scale: 0.95 }}
                            className="bg-white w-full max-w-2xl max-h-[85vh] rounded-2xl shadow-2xl flex flex-col overflow-hidden"
                        >
                            <div className="p-8 border-b border-nutrity-border flex items-center justify-between shrink-0">
                                <div>
                                    <h3 className="text-xl font-display font-bold">{editingCourse.id ? "Editar Curso" : "Nuevo Curso"}</h3>
                                    <p className="text-xs text-nutrity-gray-text font-medium">Academia Nutrity Global</p>
                                </div>
                                <button onClick={() => setShowCourseModal(false)} className="p-2 rounded-full hover:bg-nutrity-bg"><X className="w-5 h-5 text-nutrity-gray-text" /></button>
                            </div>
                            <form onSubmit={handleSaveCourse} className="flex-1 overflow-y-auto p-8 space-y-5 scrollbar-hide">
                                <FieldInput label="Título del Curso" value={editingCourse.title || ""} onChange={(v) => setEditingCourse(p => ({ ...p, title: v }))} required placeholder="Protocolo de Remisión Metabólica" />
                                <FieldInput label="Descripción" value={editingCourse.description || ""} onChange={(v) => setEditingCourse(p => ({ ...p, description: v }))} multiline placeholder="Descripción del curso..." />
                                <div className="grid grid-cols-2 gap-4">
                                    <FieldInput label="Categoría" value={editingCourse.category || ""} onChange={(v) => setEditingCourse(p => ({ ...p, category: v }))} placeholder="Bienestar" />
                                    <FieldInput label="Precio (USD)" value={String(editingCourse.price || 0)} onChange={(v) => setEditingCourse(p => ({ ...p, price: parseFloat(v) || 0 }))} type="number" placeholder="0" />
                                </div>
                                <FieldInput label="Thumbnail URL" value={editingCourse.thumbnail || ""} onChange={(v) => setEditingCourse(p => ({ ...p, thumbnail: v }))} placeholder="https://images.unsplash.com/..." />
                                <FieldInput label="Enlace de Pago PayPal (NCP)" value={editingCourse.paypalUrl || ""} onChange={(v) => setEditingCourse(p => ({ ...p, paypalUrl: v }))} placeholder="https://www.paypal.com/ncp/payment/..." />

                                <button type="submit" disabled={isSaving}
                                    className="w-full mt-4 bg-nutrity-primary text-white py-4 rounded-xl font-bold text-sm uppercase tracking-widest shadow-lg shadow-nutrity-primary/10 hover:bg-nutrity-accent transition-all disabled:opacity-50 flex items-center justify-center gap-3">
                                    {isSaving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
                                    {isSaving ? "Guardando..." : "Guardar Curso"}
                                </button>
                            </form>
                        </motion.div>
                    </motion.div>
                )}

                {/* ─── Menu Day Modal ─── */}
                {showMenuModal && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[200] bg-nutrity-primary/60 backdrop-blur-md flex items-center justify-center p-4"
                    >
                        <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }} exit={{ scale: 0.95 }}
                            className="bg-white w-full max-w-2xl max-h-[85vh] rounded-2xl shadow-2xl flex flex-col overflow-hidden"
                        >
                            <div className="p-8 border-b border-nutrity-border flex items-center justify-between shrink-0">
                                <div>
                                    <h3 className="text-xl font-display font-bold capitalize">Editar Menú: {editingMenuDay.day}</h3>
                                    <p className="text-xs text-nutrity-gray-text font-medium">Planificación de comidas del día</p>
                                </div>
                                <button onClick={() => setShowMenuModal(false)} className="p-2 rounded-full hover:bg-nutrity-bg"><X className="w-5 h-5 text-nutrity-gray-text" /></button>
                            </div>
                            <form onSubmit={handleSaveMenuDay} className="flex-1 overflow-y-auto p-8 space-y-5 scrollbar-hide">
                                <FieldInput label="Desayuno" value={editingMenuDay.meal.breakfast}
                                    onChange={(v) => setEditingMenuDay(p => ({ ...p, meal: { ...p.meal, breakfast: v } }))} multiline placeholder="Descripción del desayuno..." />
                                <FieldInput label="Almuerzo" value={editingMenuDay.meal.lunch}
                                    onChange={(v) => setEditingMenuDay(p => ({ ...p, meal: { ...p.meal, lunch: v } }))} multiline placeholder="Descripción del almuerzo..." />
                                <FieldInput label="Snack" value={editingMenuDay.meal.snack}
                                    onChange={(v) => setEditingMenuDay(p => ({ ...p, meal: { ...p.meal, snack: v } }))} multiline placeholder="Descripción del snack..." />
                                <FieldInput label="Cena" value={editingMenuDay.meal.dinner}
                                    onChange={(v) => setEditingMenuDay(p => ({ ...p, meal: { ...p.meal, dinner: v } }))} multiline placeholder="Descripción de la cena..." />
                                <FieldInput label="Meta Metabólica del Día" value={editingMenuDay.meal.metabolicGoal}
                                    onChange={(v) => setEditingMenuDay(p => ({ ...p, meal: { ...p.meal, metabolicGoal: v } }))} placeholder="Sensibilización insulínica matutina" />

                                <button type="submit" disabled={isSaving}
                                    className="w-full mt-4 bg-nutrity-primary text-white py-4 rounded-xl font-bold text-sm uppercase tracking-widest shadow-lg shadow-nutrity-primary/10 hover:bg-nutrity-accent transition-all disabled:opacity-50 flex items-center justify-center gap-3">
                                    {isSaving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
                                    {isSaving ? "Guardando..." : "Guardar Menú"}
                                </button>
                            </form>
                        </motion.div>
                    </motion.div>
                )}

                {/* ─── User Modal ─── */}
                {showUserModal && editingUser && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[200] bg-nutrity-primary/60 backdrop-blur-md flex items-center justify-center p-4"
                    >
                        <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }} exit={{ scale: 0.95 }}
                            className="bg-white w-full max-w-2xl max-h-[90vh] rounded-2xl shadow-2xl flex flex-col overflow-hidden"
                        >
                            <div className="p-8 border-b border-nutrity-border flex items-center justify-between shrink-0">
                                <div>
                                    <h3 className="text-xl font-bold">Editar Perfil Completo</h3>
                                    <p className="text-xs text-nutrity-gray-text font-medium">Gestión administrativa de datos clínicos y de contacto</p>
                                </div>
                                <button onClick={() => setShowUserModal(false)} className="p-2 rounded-full hover:bg-nutrity-bg"><X className="w-5 h-5 text-nutrity-gray-text" /></button>
                            </div>

                            <form onSubmit={handleSaveUser} className="flex-1 overflow-y-auto p-8 space-y-6 scrollbar-hide">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <FieldInput label="Nombre Completo" value={editingUser.name || ""} onChange={(v) => setEditingUser({ ...editingUser, name: v })} required />
                                    <FieldInput label="Email" value={editingUser.email || ""} onChange={(v) => setEditingUser({ ...editingUser, email: v })} required />
                                    
                                    <FieldInput label="Celular de Contacto" value={editingUser.phone || ""} onChange={(v) => setEditingUser({ ...editingUser, phone: v })} placeholder="+591 ..." />
                                    <FieldInput label="Edad" type="number" value={String(editingUser.age || "")} onChange={(v) => setEditingUser({ ...editingUser, age: v })} />
                                    
                                    <div className="md:col-span-2">
                                        <FieldInput label="Dirección Completa" value={editingUser.address || ""} onChange={(v) => setEditingUser({ ...editingUser, address: v })} />
                                    </div>

                                    <FieldInput label="Ocupación / Profesión" value={editingUser.occupation || ""} onChange={(v) => setEditingUser({ ...editingUser, occupation: v })} />
                                    
                                    <div className="space-y-1.5">
                                        <label className="text-[10px] font-bold text-nutrity-gray-text uppercase tracking-widest ml-1">Estado Civil</label>
                                        <select 
                                            className="w-full bg-nutrity-bg border border-nutrity-border rounded-xl px-4 py-3 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-nutrity-accent/10"
                                            value={editingUser.maritalStatus || ""}
                                            onChange={(e) => setEditingUser({ ...editingUser, maritalStatus: e.target.value })}
                                        >
                                            <option value="">No especificado</option>
                                            <option value="soltero">Soltero/a</option>
                                            <option value="casado">Casado/a</option>
                                            <option value="divorciado">Divorciado/a</option>
                                            <option value="viudo">Viudo/a</option>
                                        </select>
                                    </div>

                                    <div className="md:col-span-2">
                                        <FieldInput label="Redes Sociales (IG/FB)" value={editingUser.socialMedia || ""} onChange={(v) => setEditingUser({ ...editingUser, socialMedia: v })} />
                                    </div>

                                    <div className="space-y-1.5">
                                        <label className="text-[10px] font-bold text-nutrity-gray-text uppercase tracking-widest ml-1">Rol del Sistema</label>
                                        <select 
                                            className="w-full bg-nutrity-bg border border-nutrity-border rounded-xl px-4 py-3 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-nutrity-accent/10"
                                            value={editingUser.role || "USER"}
                                            onChange={(e) => setEditingUser({ ...editingUser, role: e.target.value })}
                                        >
                                            <option value="USER">Paciente (User)</option>
                                            <option value="ADMIN">Administrador</option>
                                        </select>
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-[10px] font-bold text-nutrity-gray-text uppercase tracking-widest ml-1">Plan de Suscripción</label>
                                        <select 
                                            className="w-full bg-nutrity-bg border border-nutrity-border rounded-xl px-4 py-3 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-nutrity-accent/10"
                                            value={editingUser.plan || "FREE"}
                                            onChange={(e) => setEditingUser({ ...editingUser, plan: e.target.value })}
                                        >
                                            <option value="FREE">FREEMIUM</option>
                                            <option value="PREMIUM">PREMIUM</option>
                                            <option value="ELITE">ELITE</option>
                                        </select>
                                    </div>
                                </div>

                                {/* Bio-Cardex Insight Section */}
                                {editingUser.metabolicResults && (
                                    <div className="mt-2 p-6 bg-emerald-50 rounded-2xl border border-emerald-100 space-y-4">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-2">
                                                <Zap className="w-5 h-5 text-emerald-500" />
                                                <h4 className="text-sm font-bold text-emerald-900">Estado Metabólico Actual</h4>
                                            </div>
                                            <span className="px-3 py-1 bg-emerald-600 text-white text-[10px] font-black rounded-lg">SCORE: {editingUser.metabolicResults.remissionScore}%</span>
                                        </div>
                                        <p className="text-xs text-emerald-800 italic leading-relaxed">
                                            "{editingUser.metabolicResults.insight || "Sin observaciones registradas."}"
                                        </p>
                                        <div className="flex flex-wrap gap-1.5">
                                            {editingUser.metabolicResults.pillars?.map((p: any, i: number) => (
                                                <span key={i} className="px-2 py-0.5 bg-white/50 text-emerald-700 text-[9px] font-bold rounded-md border border-emerald-100">{p.title}</span>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                <button disabled={isSaving} type="submit" className="w-full bg-nutrity-primary text-white py-4 rounded-xl font-bold text-xs uppercase tracking-widest shadow-lg shadow-nutrity-primary/20 hover:bg-nutrity-accent transition-all flex items-center justify-center gap-2">
                                    {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                                    Guardar Cambios del Paciente
                                </button>
                            </form>
                        </motion.div>
                    </motion.div>
                )}

                {/* ─── Appointment Modal ─── */}
                {showApptModal && editingAppt && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[200] bg-nutrity-primary/60 backdrop-blur-md flex items-center justify-center p-4"
                    >
                        <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }} exit={{ scale: 0.95 }}
                            className="bg-white w-full max-w-md rounded-2xl shadow-2xl p-8 relative"
                        >
                            <button onClick={() => setShowApptModal(false)} className="absolute top-6 right-6 p-2 rounded-full hover:bg-nutrity-bg"><X className="w-5 h-5 text-nutrity-gray-text" /></button>
                            <div className="mb-6">
                                <h3 className="text-xl font-bold">Editar Cita Médica</h3>
                                <p className="text-xs text-nutrity-gray-text">Ajusta la programación del paciente</p>
                            </div>
                            <form onSubmit={handleSaveAppointment} className="space-y-5">
                                <FieldInput label="Motivo de la Cita" value={editingAppt.title || ""} onChange={(v) => setEditingAppt({ ...editingAppt, title: v })} required />
                                <div className="grid grid-cols-2 gap-4">
                                    <FieldInput label="Fecha" type="date" value={editingAppt.date || ""} onChange={(v) => setEditingAppt({ ...editingAppt, date: v })} required />
                                    <FieldInput label="Hora" type="time" value={editingAppt.time || ""} onChange={(v) => setEditingAppt({ ...editingAppt, time: v })} required />
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-bold text-nutrity-gray-text uppercase tracking-widest ml-1">Tipo de Cita</label>
                                    <select 
                                        className="w-full bg-nutrity-bg border border-nutrity-border rounded-xl px-4 py-3 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-nutrity-accent/10"
                                        value={editingAppt.type || "Virtual"}
                                        onChange={(e) => setEditingAppt({ ...editingAppt, type: e.target.value })}
                                    >
                                        <option value="Virtual">Virtual (IA Sync)</option>
                                        <option value="Presencial">Presencial (Clínica)</option>
                                    </select>
                                </div>
                                <button disabled={isSaving} type="submit" className="w-full bg-nutrity-primary text-white py-4 rounded-xl font-bold text-xs uppercase tracking-widest shadow-lg shadow-nutrity-primary/20 hover:bg-nutrity-accent transition-all flex items-center justify-center gap-2">
                                    {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                                    Guardar Cambios
                                </button>
                            </form>
                        </motion.div>
                    </motion.div>
                )}

                {/* ─── Delete Confirmation Modal ─── */}
                {deleteTarget && (
                    <DeleteConfirmModal
                        itemName={deleteTarget.name}
                        onConfirm={handleDelete}
                        onCancel={() => setDeleteTarget(null)}
                    />
                )}
            </AnimatePresence>

            {/* ─── Notification Toast ─── */}
            <AnimatePresence>
                {notification && (
                    <motion.div
                        initial={{ opacity: 0, y: 50, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 20, scale: 0.95 }}
                        className={`fixed bottom-8 right-8 z-[400] px-6 py-4 rounded-2xl shadow-2xl text-sm font-bold flex items-center gap-3 ${notification.type === "success"
                            ? "bg-nutrity-success text-white shadow-nutrity-success/30"
                            : "bg-red-500 text-white shadow-red-500/30"
                            }`}
                    >
                        {notification.type === "success" ? <Save className="w-4 h-4" /> : <AlertTriangle className="w-4 h-4" />}
                        {notification.message}
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    );
}
