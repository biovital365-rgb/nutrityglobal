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
} from "lucide-react";
import { dbService, FoodItem, Micronutrient, Course, Lesson } from "../lib/db-service";
import { weeklyMenuData, DayMeal } from "../lib/menu-data";
import { getDirectImageUrl } from "../lib/utils";

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

type AdminSection = "foods" | "micronutrients" | "menu" | "courses";

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
    const [menuDays, setMenuDays] = useState<Record<string, DayMeal>>(weeklyMenuData);

    // Modal states
    const [showFoodModal, setShowFoodModal] = useState(false);
    const [editingFood, setEditingFood] = useState<Partial<FoodItem>>(emptyFood);
    const [showMicroModal, setShowMicroModal] = useState(false);
    const [editingMicro, setEditingMicro] = useState<Partial<Micronutrient>>(emptyMicro);
    const [showCourseModal, setShowCourseModal] = useState(false);
    const [editingCourse, setEditingCourse] = useState<Partial<Course>>(emptyCourse);
    const [showMenuModal, setShowMenuModal] = useState(false);
    const [editingMenuDay, setEditingMenuDay] = useState<{ day: string; meal: DayMeal }>({ day: "", meal: { breakfast: "", lunch: "", dinner: "", snack: "", metabolicGoal: "" } });
    const [deleteTarget, setDeleteTarget] = useState<{ type: AdminSection; id: string; name: string } | null>(null);

    // ─── Notification helper ──────────────────────────────────────────
    const notify = useCallback((type: "success" | "error", message: string) => {
        setNotification({ type, message });
        setTimeout(() => setNotification(null), 3000);
    }, []);

    // ─── Data loading ─────────────────────────────────────────────────
    useEffect(() => {
        const loadAll = async () => {
            try {
                const [foodData, microData, courseData] = await Promise.all([
                    dbService.getFoods(),
                    dbService.getMicronutrients(),
                    dbService.getCourses(),
                ]);
                setFoods(foodData);
                setMicros(microData);
                setCourses(courseData);
            } catch (err) {
                console.error("Admin data load error:", err);
                notify("error", "Error al cargar datos");
            }
        };
        loadAll();
    }, [notify]);

    // ─── FOOD CRUD ────────────────────────────────────────────────────
    const handleSaveFood = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSaving(true);
        try {
            const saved = await dbService.saveFood(editingFood);
            setFoods(prev => {
                const exists = prev.find(f => f.id === saved.id);
                return exists ? prev.map(f => f.id === saved.id ? saved : f) : [...prev, saved];
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
            const saved = await dbService.saveMicronutrient(editingMicro);
            setMicros(prev => {
                const exists = prev.find(m => m.id === saved.id);
                return exists ? prev.map(m => m.id === saved.id ? saved : m) : [...prev, saved];
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
            const saved = await dbService.saveCourse(editingCourse);
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

    // ─── DELETE HANDLER ───────────────────────────────────────────────
    const handleDelete = async () => {
        if (!deleteTarget) return;
        setIsSaving(true);
        try {
            switch (deleteTarget.type) {
                case "foods":
                    await dbService.deleteFood(deleteTarget.id);
                    setFoods(prev => prev.filter(f => f.id !== deleteTarget.id));
                    break;
                case "micronutrients":
                    await dbService.deleteMicronutrient(deleteTarget.id);
                    setMicros(prev => prev.filter(m => m.id !== deleteTarget.id));
                    break;
                case "courses":
                    await dbService.deleteCourse(deleteTarget.id);
                    setCourses(prev => prev.filter(c => c.id !== deleteTarget.id));
                    break;
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

    // ─── Section nav config ───────────────────────────────────────────
    const sections: { id: AdminSection; icon: typeof Utensils; label: string; count: number }[] = [
        { id: "foods", icon: Utensils, label: "Alimentos", count: foods.length },
        { id: "micronutrients", icon: Zap, label: "Micronutrientes", count: micros.length },
        { id: "menu", icon: ClipboardCheck, label: "Menú Semanal", count: Object.keys(menuDays).length },
        { id: "courses", icon: BookOpen, label: "Cursos", count: courses.length },
    ];

    // ─── Filtered data ────────────────────────────────────────────────
    const filteredFoods = foods.filter(f => f.name.toLowerCase().includes(searchTerm.toLowerCase()) || f.category.toLowerCase().includes(searchTerm.toLowerCase()));
    const filteredMicros = micros.filter(m => m.name.toLowerCase().includes(searchTerm.toLowerCase()) || m.category.toLowerCase().includes(searchTerm.toLowerCase()));
    const filteredCourses = courses.filter(c => c.title.toLowerCase().includes(searchTerm.toLowerCase()));

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
                <button
                    onClick={() => {
                        switch (section) {
                            case "foods": setEditingFood(emptyFood); setShowFoodModal(true); break;
                            case "micronutrients": setEditingMicro(emptyMicro); setShowMicroModal(true); break;
                            case "courses": setEditingCourse(emptyCourse); setShowCourseModal(true); break;
                            case "menu": break; // menu edits per day
                        }
                    }}
                    className={`flex items-center gap-3 px-6 py-3.5 rounded-xl text-sm font-bold transition-all shadow-lg ${section === "menu"
                        ? "bg-nutrity-primary/30 text-nutrity-primary/50 cursor-not-allowed"
                        : "bg-nutrity-accent text-white shadow-nutrity-accent/20 hover:scale-105 active:scale-95"
                        }`}
                    disabled={section === "menu"}
                >
                    <PlusCircle className="w-5 h-5" />
                    Nuevo {section === "foods" ? "Alimento" : section === "micronutrients" ? "Micronutriente" : section === "courses" ? "Curso" : ""}
                </button>
            </div>

            {/* ═══════ FOODS TABLE ═══════ */}
            <AnimatePresence mode="wait">
                {section === "foods" && (
                    <motion.div key="foods-table" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
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
                                            <tr key={food.id} className="hover:bg-slate-50 transition-colors group">
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
                                                        <button onClick={() => { setEditingFood(food); setShowFoodModal(true); }}
                                                            className="p-2 rounded-lg bg-nutrity-accent/10 text-nutrity-accent hover:bg-nutrity-accent hover:text-white transition-all">
                                                            <Pencil className="w-4 h-4" />
                                                        </button>
                                                        <button onClick={() => setDeleteTarget({ type: "foods", id: food.id, name: food.name })}
                                                            className="p-2 rounded-lg bg-red-50 text-red-500 hover:bg-red-500 hover:text-white transition-all">
                                                            <Trash2 className="w-4 h-4" />
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                        {filteredFoods.length === 0 && (
                                            <tr><td colSpan={7} className="py-16 text-center text-nutrity-gray-text text-sm">Sin resultados</td></tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </motion.div>
                )}

                {/* ═══════ MICRONUTRIENTS TABLE ═══════ */}
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
                                            <th className="py-4 px-6">Fuentes</th>
                                            <th className="py-4 px-6 text-right">Acciones</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-nutrity-border">
                                        {filteredMicros.map((micro) => (
                                            <tr key={micro.id} className="hover:bg-slate-50 transition-colors group">
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
                                                    <div className="flex flex-wrap gap-1">{micro.sources?.slice(0, 3).map((s, i) => (
                                                        <span key={i} className="px-1.5 py-0.5 bg-nutrity-bg text-[8px] font-bold rounded text-nutrity-primary">{s}</span>
                                                    ))}</div>
                                                </td>
                                                <td className="py-4 px-6">
                                                    <div className="flex gap-2 justify-end opacity-0 group-hover:opacity-100 transition-opacity">
                                                        <button onClick={() => { setEditingMicro(micro); setShowMicroModal(true); }}
                                                            className="p-2 rounded-lg bg-nutrity-accent/10 text-nutrity-accent hover:bg-nutrity-accent hover:text-white transition-all">
                                                            <Pencil className="w-4 h-4" />
                                                        </button>
                                                        <button onClick={() => setDeleteTarget({ type: "micronutrients", id: micro.id, name: micro.name })}
                                                            className="p-2 rounded-lg bg-red-50 text-red-500 hover:bg-red-500 hover:text-white transition-all">
                                                            <Trash2 className="w-4 h-4" />
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                        {filteredMicros.length === 0 && (
                                            <tr><td colSpan={6} className="py-16 text-center text-nutrity-gray-text text-sm">Sin resultados</td></tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </motion.div>
                )}

                {/* ═══════ MENU WEEKLY TABLE ═══════ */}
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

                {/* ═══════ COURSES TABLE ═══════ */}
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
                                            <th className="py-4 px-6">Lecciones</th>
                                            <th className="py-4 px-6 text-right">Acciones</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-nutrity-border">
                                        {filteredCourses.map((course) => (
                                            <tr key={course.id} className="hover:bg-slate-50 transition-colors group">
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
                                                <td className="py-4 px-6 text-sm font-bold">{course.lessons?.length || 0}</td>
                                                <td className="py-4 px-6">
                                                    <div className="flex gap-2 justify-end opacity-0 group-hover:opacity-100 transition-opacity">
                                                        <button onClick={() => { setEditingCourse(course); setShowCourseModal(true); }}
                                                            className="p-2 rounded-lg bg-nutrity-accent/10 text-nutrity-accent hover:bg-nutrity-accent hover:text-white transition-all">
                                                            <Pencil className="w-4 h-4" />
                                                        </button>
                                                        <button onClick={() => setDeleteTarget({ type: "courses", id: course.id, name: course.title })}
                                                            className="p-2 rounded-lg bg-red-50 text-red-500 hover:bg-red-500 hover:text-white transition-all">
                                                            <Trash2 className="w-4 h-4" />
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                        {filteredCourses.length === 0 && (
                                            <tr><td colSpan={6} className="py-16 text-center text-nutrity-gray-text text-sm">Sin resultados</td></tr>
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

                {/* ─── Delete Confirmation ─── */}
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
