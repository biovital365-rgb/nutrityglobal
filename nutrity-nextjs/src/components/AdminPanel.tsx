"use client";
import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
    Utensils, Zap, ClipboardCheck, BookOpen,
    PlusCircle, Search, Shield, Users, Calendar,
    FileText, Settings, Save, AlertTriangle, Loader2,
} from "lucide-react";
import * as dbService from "@/actions/db-actions";
import { FoodItem, Micronutrient, Course } from "@/lib/types";

// ─── Sub-components ─────────────────────────────────────────────────────────
import { AdminFoodsTab } from "./admin/AdminFoodsTab";
import { AdminMicronutrientsTab } from "./admin/AdminMicronutrientsTab";
import { AdminCoursesTab } from "./admin/AdminCoursesTab";
import { AdminMenuTab } from "./admin/AdminMenuTab";
import { AdminUsersTab } from "./admin/AdminUsersTab";
import { AdminCalendarTab } from "./admin/AdminCalendarTab";
import { AdminCrmTab } from "./admin/AdminCrmTab";
import { AdminReportsTab } from "./admin/AdminReportsTab";
import AdminBlogTab from "./admin/AdminBlogTab";
import { DeleteConfirmModal } from "./admin/shared";

// ─── Types ───────────────────────────────────────────────────────────────────
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
            organization?: { id?: string; name?: string };
        };
    };
    onLogout?: () => void;
    onBackToDashboard?: () => void;
}

type AdminSection = "foods" | "micronutrients" | "menu" | "courses" | "users" | "crm" | "calendar" | "reports" | "blog";

// ─── Empty templates ─────────────────────────────────────────────────────────
const emptyFood: Partial<FoodItem> = {
    name: "", scientificName: "", image: "", category: "",
    description: "", metabolicBenefits: [], nutrients: { protein: "", fiber: "", sugar: "" }, recipes: [],
};
const emptyMicro: Partial<Micronutrient> = {
    name: "", symbol: "", category: "", function: "",
    metabolicImpact: "", sources: [], deficiencySigns: [], dailyDose: "", image: "",
};
const emptyCourse: Partial<Course> = {
    title: "", description: "", thumbnail: "", category: "Bienestar", price: 0, paypalUrl: "",
};

// ─── Component ───────────────────────────────────────────────────────────────
export function AdminPanel({ user }: AdminPanelProps) {
    const [section, setSection] = useState<AdminSection>("foods");
    const [searchTerm, setSearchTerm] = useState("");
    const [isSaving, setIsSaving] = useState(false);
    const [showDeleted, setShowDeleted] = useState(false);
    const [notification, setNotification] = useState<{ type: "success" | "error"; message: string } | null>(null);

    // Data
    const [foods, setFoods] = useState<FoodItem[]>([]);
    const [micros, setMicros] = useState<Micronutrient[]>([]);
    const [courses, setCourses] = useState<Course[]>([]);
    const [users, setUsers] = useState<any[]>([]);
    const [appointments, setAppointments] = useState<any[]>([]);
    const [pdfReports, setPdfReports] = useState<any[]>([]);

    // Modal state for foods
    const [showFoodModal, setShowFoodModal] = useState(false);
    const [editingFood, setEditingFood] = useState<Partial<FoodItem>>(emptyFood);

    // Modal state for micros
    const [showMicroModal, setShowMicroModal] = useState(false);
    const [editingMicro, setEditingMicro] = useState<Partial<Micronutrient>>(emptyMicro);

    // Modal state for courses
    const [showCourseModal, setShowCourseModal] = useState(false);
    const [editingCourse, setEditingCourse] = useState<Partial<Course>>(emptyCourse);

    // Modal state for appointments
    const [showApptModal, setShowApptModal] = useState(false);
    const [editingAppt, setEditingAppt] = useState<any>(null);
    const [apptFilter, setApptFilter] = useState<"ALL" | "DIAGNOSTICO" | "CONTROL">("ALL");

    // Modal state for users
    const [showUserModal, setShowUserModal] = useState(false);
    const [editingUser, setEditingUser] = useState<any>(null);
    const [showCardexModal, setShowCardexModal] = useState(false);
    const [selectedCardexUser, setSelectedCardexUser] = useState<any>(null);

    // Delete confirmation
    const [deleteTarget, setDeleteTarget] = useState<{ type: AdminSection; id: string; name: string } | null>(null);

    // ─── Notification helper ──────────────────────────────────────────────────
    const notify = useCallback((type: "success" | "error", message: string) => {
        setNotification({ type, message });
        setTimeout(() => setNotification(null), 3000);
    }, []);

    // ─── Data loading ─────────────────────────────────────────────────────────
    const loadAll = useCallback(async () => {
        const orgId = user?.profile?.organization?.id;
        try {
            const [foodData, microData, courseData, userData, appointmentData, reportData] = await Promise.all([
                dbService.getFoods(orgId).catch(() => []),
                dbService.getMicronutrients(orgId).catch(() => []),
                dbService.getCourses(orgId, showDeleted).catch(() => []),
                dbService.getAllUsers(orgId, showDeleted).catch(() => []),
                dbService.getAllAppointments(orgId, showDeleted).catch(() => []),
                dbService.getPDFReports(orgId).catch(() => []),
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
    }, [notify, user?.profile?.organization?.id, showDeleted]);

    useEffect(() => { loadAll(); }, [loadAll]);

    // ─── Sync ─────────────────────────────────────────────────────────────────
    const handleSync = async (type: "foods" | "micros") => {
        if (!confirm(`¿Deseas sincronizar el catálogo de ${type === "foods" ? "alimentos" : "micronutrientes"}?`)) return;
        setIsSaving(true);
        try {
            await dbService.forceSyncCatalog(type, user?.profile?.organization?.id);
            notify("success", "Sincronización completada.");
            const orgId = user?.profile?.organization?.id;
            if (type === "foods") setFoods(await dbService.getFoods(orgId));
            else setMicros(await dbService.getMicronutrients(orgId));
        } catch { notify("error", "Error durante la sincronización."); }
        finally { setIsSaving(false); }
    };

    // ─── CRUD handlers ────────────────────────────────────────────────────────
    const handleSaveFood = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSaving(true);
        try {
            const saved = await dbService.saveFood(editingFood, user?.profile?.organization?.id) as any;
            setFoods(prev => {
                const filtered = saved._previousId ? prev.filter(f => f.id !== saved._previousId) : prev;
                const exists = filtered.find(f => f.id === saved.id);
                return exists ? filtered.map(f => f.id === saved.id ? saved : f) : [...filtered, saved];
            });
            setShowFoodModal(false);
            setEditingFood(emptyFood);
            notify("success", `Alimento "${saved.name}" guardado`);
        } catch { notify("error", "Error al guardar alimento"); }
        finally { setIsSaving(false); }
    };

    const handleSaveMicro = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSaving(true);
        try {
            const saved = await dbService.saveMicronutrient(editingMicro, user?.profile?.organization?.id) as any;
            setMicros(prev => {
                const filtered = saved._previousId ? prev.filter(m => m.id !== saved._previousId) : prev;
                const exists = filtered.find(m => m.id === saved.id);
                return exists ? filtered.map(m => m.id === saved.id ? saved : m) : [...filtered, saved];
            });
            setShowMicroModal(false);
            setEditingMicro(emptyMicro);
            notify("success", `Micronutriente "${saved.name}" guardado`);
        } catch { notify("error", "Error al guardar micronutriente"); }
        finally { setIsSaving(false); }
    };

    const handleSaveCourse = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSaving(true);
        try {
            const saved = await dbService.saveCourse(editingCourse, user?.profile?.organization?.id);
            setCourses(prev => {
                const exists = prev.find(c => c.id === saved.id);
                return exists ? prev.map(c => c.id === saved.id ? saved : c) : [...prev, saved];
            });
            setShowCourseModal(false);
            setEditingCourse(emptyCourse);
            notify("success", `Curso "${saved.title}" guardado`);
        } catch { notify("error", "Error al guardar curso"); }
        finally { setIsSaving(false); }
    };

    const handleSaveUser = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!editingUser) return;
        setIsSaving(true);
        try {
            const { id, ...data } = editingUser;
            await dbService.updateUserProfile(id, data);
            const updated = await dbService.getAllUsers(user?.profile?.organization?.id);
            setUsers(updated);
            notify("success", "Usuario actualizado correctamente.");
            setShowUserModal(false);
        } catch { notify("error", "Error al actualizar el usuario."); }
        finally { setIsSaving(false); }
    };

    const handleSaveAppointment = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!editingAppt) return;
        setIsSaving(true);
        try {
            await dbService.updateAppointment(editingAppt.id, {
                title: editingAppt.title, date: editingAppt.date,
                time: editingAppt.time, type: editingAppt.type,
            });
            const updated = await dbService.getAllAppointments(user?.profile?.organization?.id);
            setAppointments(updated);
            notify("success", "Cita actualizada correctamente.");
            setShowApptModal(false);
        } catch { notify("error", "Error al actualizar la cita."); }
        finally { setIsSaving(false); }
    };

    const handleDelete = async () => {
        if (!deleteTarget) return;
        setIsSaving(true);
        try {
            if (deleteTarget.type === "foods") { await dbService.deleteFood(deleteTarget.id); setFoods(f => f.filter(x => x.id !== deleteTarget.id)); }
            else if (deleteTarget.type === "micronutrients") { await dbService.deleteMicronutrient(deleteTarget.id); setMicros(m => m.filter(x => x.id !== deleteTarget.id)); }
            else if (deleteTarget.type === "courses") { await dbService.deleteCourse(deleteTarget.id); setCourses(c => c.filter(x => x.id !== deleteTarget.id)); }
            else if (deleteTarget.type === "calendar") { await dbService.deleteAppointment(deleteTarget.id); setAppointments(a => a.filter(x => x.id !== deleteTarget.id)); }
            else if (deleteTarget.type === "users") { await dbService.deleteUser(deleteTarget.id); setUsers(u => u.filter(x => x.id !== deleteTarget.id)); }
            notify("success", `"${deleteTarget.name}" eliminado`);
        } catch { notify("error", "Error al eliminar"); }
        finally { setDeleteTarget(null); setIsSaving(false); }
    };

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
        } catch { notify("error", "Error al restaurar el registro"); }
        finally { setIsSaving(false); }
    };

    // ─── Section nav ──────────────────────────────────────────────────────────
    const sections: { id: AdminSection; icon: typeof Utensils; label: string; count: number }[] = [
        { id: "foods", icon: Utensils, label: "Alimentos", count: foods.length },
        { id: "micronutrients", icon: Zap, label: "Micronutrientes", count: micros.length },
        { id: "menu", icon: ClipboardCheck, label: "Menú Semanal", count: users.filter(u => u.metabolicResults?.phase).length },
        { id: "courses", icon: BookOpen, label: "Cursos", count: courses.length },
        { id: "users", icon: Users, label: "Usuarios", count: users.length },
        { id: "calendar", icon: Calendar, label: "Calendario", count: appointments.length },
        { id: "reports", icon: FileText, label: "Reportes PDF", count: pdfReports.length },
        { id: "crm", icon: Settings, label: "CRM Automático", count: users.length },
        { id: "blog", icon: BookOpen, label: "Blog", count: 0 },
    ];

    // ─── Filtered data ────────────────────────────────────────────────────────
    const filteredFoods = foods.filter(f =>
        f.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        f.category.toLowerCase().includes(searchTerm.toLowerCase())
    );
    const filteredMicros = micros.filter(m =>
        m.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        m.category.toLowerCase().includes(searchTerm.toLowerCase())
    );
    const filteredCourses = courses.filter(c => c.title.toLowerCase().includes(searchTerm.toLowerCase()));
    const filteredUsers = users.filter(u =>
        (u.name || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
        (u.email || "").toLowerCase().includes(searchTerm.toLowerCase())
    );

    // ─── Render ───────────────────────────────────────────────────────────────
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
                    <button key={s.id} onClick={() => { setSection(s.id); setSearchTerm(""); }}
                        className={`flex items-center gap-3 px-5 py-3 rounded-xl text-sm font-bold transition-all ${
                            section === s.id
                                ? "bg-nutrity-primary text-white shadow-lg shadow-nutrity-primary/20"
                                : "bg-white text-nutrity-gray-text border border-nutrity-border hover:border-nutrity-accent/30"
                        }`}>
                        <s.icon className={`w-4 h-4 ${section === s.id ? "text-nutrity-accent" : ""}`} />
                        {s.label}
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${section === s.id ? "bg-white/20 text-white" : "bg-nutrity-bg text-nutrity-gray-text"}`}>
                            {s.count}
                        </span>
                    </button>
                ))}
            </div>

            {/* Search + Add bar */}
            {!["menu", "crm", "reports", "blog"].includes(section) && (
                <div className="flex flex-col md:flex-row gap-4 items-stretch md:items-center">
                    <div className="relative flex-1">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-nutrity-gray-text opacity-40" />
                        <input
                            type="text"
                            placeholder={`Buscar ${sections.find(s => s.id === section)?.label.toLowerCase()}...`}
                            value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full bg-white border border-nutrity-border rounded-xl pl-11 pr-5 py-3.5 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-nutrity-accent/10 focus:border-nutrity-accent transition-all shadow-sm"
                        />
                    </div>
                    <div className="flex items-center gap-2 px-4 py-2 bg-white border border-nutrity-border rounded-xl">
                        <span className="text-[10px] font-bold text-nutrity-gray-text uppercase tracking-widest">Ver Eliminados</span>
                        <button onClick={() => setShowDeleted(!showDeleted)}
                            className={`w-10 h-5 rounded-full transition-all relative ${showDeleted ? "bg-red-500" : "bg-slate-200"}`}>
                            <div className={`absolute top-1 w-3 h-3 bg-white rounded-full transition-all ${showDeleted ? "left-6" : "left-1"}`} />
                        </button>
                    </div>
                    {["foods", "micronutrients", "courses"].includes(section) && (
                        <button
                            onClick={() => {
                                if (section === "foods") { setEditingFood(emptyFood); setShowFoodModal(true); }
                                if (section === "micronutrients") { setEditingMicro(emptyMicro); setShowMicroModal(true); }
                                if (section === "courses") { setEditingCourse(emptyCourse); setShowCourseModal(true); }
                            }}
                            className="flex items-center gap-3 px-6 py-3.5 rounded-xl text-sm font-bold bg-nutrity-accent text-white shadow-lg shadow-nutrity-accent/20 hover:scale-105 active:scale-95 transition-all">
                            <PlusCircle className="w-5 h-5" />
                            Nuevo {section === "foods" ? "Alimento" : section === "micronutrients" ? "Micronutriente" : "Curso"}
                        </button>
                    )}
                </div>
            )}

            {/* ═══════ SECTIONS ═══════ */}
            <AnimatePresence mode="wait">
                {section === "foods" && (
                    <AdminFoodsTab
                        foods={filteredFoods}
                        isSaving={isSaving}
                        showFoodModal={showFoodModal}
                        editingFood={editingFood}
                        onEdit={(f) => { setEditingFood(f); setShowFoodModal(true); }}
                        onDelete={(id, name) => setDeleteTarget({ type: "foods", id, name })}
                        onRestore={(id) => handleRestore("foods", id)}
                        onOpenNew={() => { setEditingFood(emptyFood); setShowFoodModal(true); }}
                        onCloseModal={() => setShowFoodModal(false)}
                        onSave={handleSaveFood}
                        onSync={() => handleSync("foods")}
                        setEditingFood={setEditingFood}
                    />
                )}

                {section === "micronutrients" && (
                    <AdminMicronutrientsTab
                        micros={filteredMicros}
                        isSaving={isSaving}
                        showMicroModal={showMicroModal}
                        editingMicro={editingMicro}
                        onEdit={(m) => { setEditingMicro(m); setShowMicroModal(true); }}
                        onDelete={(id, name) => setDeleteTarget({ type: "micronutrients", id, name })}
                        onRestore={(id) => handleRestore("micronutrients", id)}
                        onCloseModal={() => setShowMicroModal(false)}
                        onSave={handleSaveMicro}
                        onSync={() => handleSync("micros")}
                        setEditingMicro={setEditingMicro}
                    />
                )}

                {section === "courses" && (
                    <AdminCoursesTab
                        courses={filteredCourses}
                        isSaving={isSaving}
                        showCourseModal={showCourseModal}
                        editingCourse={editingCourse}
                        onEdit={(c) => { setEditingCourse(c); setShowCourseModal(true); }}
                        onDelete={(id, name) => setDeleteTarget({ type: "courses", id, name })}
                        onRestore={(id) => handleRestore("courses", id)}
                        onCloseModal={() => setShowCourseModal(false)}
                        onSave={handleSaveCourse}
                        setEditingCourse={setEditingCourse}
                    />
                )}

                {section === "menu" && (
                    <AdminMenuTab
                        users={users}
                        isSaving={isSaving}
                        adminEmail={user?.email || user?.profile?.email || "admin"}
                        notify={notify}
                    />
                )}

                {section === "users" && (
                    <AdminUsersTab
                        users={filteredUsers}
                        isSaving={isSaving}
                        showUserModal={showUserModal}
                        editingUser={editingUser}
                        showCardexModal={showCardexModal}
                        selectedCardexUser={selectedCardexUser}
                        onOpenCardex={(u) => { setSelectedCardexUser(u); setShowCardexModal(true); }}
                        onCloseCardex={() => setShowCardexModal(false)}
                        onEditUser={(u) => { setEditingUser(u); setShowUserModal(true); }}
                        onDelete={(id, name) => setDeleteTarget({ type: "users", id, name })}
                        onRestore={(id) => handleRestore("users", id)}
                        onCloseUserModal={() => setShowUserModal(false)}
                        onSaveUser={handleSaveUser}
                        setEditingUser={setEditingUser}
                        onDeleteFromCardex={(u) => { setDeleteTarget({ type: "users", id: u.id, name: u.name || u.email }); setShowCardexModal(false); }}
                    />
                )}

                {section === "calendar" && (
                    <AdminCalendarTab
                        appointments={appointments}
                        isSaving={isSaving}
                        showApptModal={showApptModal}
                        editingAppt={editingAppt}
                        apptFilter={apptFilter}
                        onFilterChange={setApptFilter}
                        onEditAppt={(a) => { setEditingAppt(a); setShowApptModal(true); }}
                        onNewAppt={() => { setEditingAppt({ date: new Date().toISOString().split("T")[0], time: "10:00", title: "Consulta de Control", type: "VIRTUAL" }); setShowApptModal(true); }}
                        onDelete={(id, name) => setDeleteTarget({ type: "calendar", id, name })}
                        onRestore={(id) => handleRestore("calendar", id)}
                        onCloseModal={() => setShowApptModal(false)}
                        onSave={handleSaveAppointment}
                        setEditingAppt={setEditingAppt}
                    />
                )}

                {section === "crm" && (
                    <AdminCrmTab users={users} appointments={appointments} />
                )}

                {section === "reports" && (
                    <AdminReportsTab pdfReports={pdfReports} />
                )}

                {section === "blog" && (
                    <AdminBlogTab user={user} />
                )}
            </AnimatePresence>

            {/* ─── Delete Confirmation ─── */}
            <AnimatePresence>
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
                        className={`fixed bottom-8 right-8 z-[400] px-6 py-4 rounded-2xl shadow-2xl text-sm font-bold flex items-center gap-3 ${
                            notification.type === "success"
                                ? "bg-nutrity-success text-white shadow-nutrity-success/30"
                                : "bg-red-500 text-white shadow-red-500/30"
                        }`}>
                        {notification.type === "success" ? <Save className="w-4 h-4" /> : <AlertTriangle className="w-4 h-4" />}
                        {notification.message}
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    );
}
