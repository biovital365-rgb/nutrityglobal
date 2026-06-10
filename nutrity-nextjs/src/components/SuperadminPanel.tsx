"use client";
import { useState, useEffect, useCallback } from "react";
import { motion } from "motion/react";
import {
    Utensils, Zap, BookOpen, Search, Shield, Users,
    FileText, Settings, CreditCard, LayoutTemplate, Activity
} from "lucide-react";
import * as dbService from "@/actions/db-actions";
import { FoodItem, Micronutrient, Course } from "@/lib/types";

// Import tabs
import { AdminFoodsTab } from "./admin/AdminFoodsTab";
import { AdminMicronutrientsTab } from "./admin/AdminMicronutrientsTab";
import { AdminCoursesTab } from "./admin/AdminCoursesTab";
import { AdminUsersTab } from "./admin/AdminUsersTab";
import { AdminPaymentsTab } from "./admin/AdminPaymentsTab";

interface SuperadminPanelProps {
    user: any;
    onLogout?: () => void;
}

type SuperadminSection = "foods" | "micronutrients" | "courses" | "users" | "payments" | "analytics";

export function SuperadminPanel({ user }: SuperadminPanelProps) {
    const [section, setSection] = useState<SuperadminSection>("users");
    const [searchTerm, setSearchTerm] = useState("");
    const [isSaving, setIsSaving] = useState(false);
    
    // Data
    const [foods, setFoods] = useState<FoodItem[]>([]);
    const [micros, setMicros] = useState<Micronutrient[]>([]);
    const [courses, setCourses] = useState<Course[]>([]);
    const [users, setUsers] = useState<any[]>([]);

    const loadAll = useCallback(async () => {
        try {
            // Superadmin loads ALL data (null organizationId)
            const [foodData, microData, courseData, userData] = await Promise.all([
                dbService.getFoods(),
                dbService.getMicronutrients(),
                dbService.getCourses(null, false),
                dbService.getAllUsers(null, false), // null means all organizations
            ]);
            setFoods(foodData || []);
            setMicros(microData || []);
            setCourses(courseData || []);
            setUsers(userData || []);
        } catch (err) {
            console.error("Superadmin data load error:", err);
        }
    }, []);

    useEffect(() => { loadAll(); }, [loadAll]);

    const sections: { id: SuperadminSection; icon: any; label: string; count: number }[] = [
        { id: "users", icon: Users, label: "Todas las Cuentas", count: users.length },
        { id: "payments", icon: CreditCard, label: "Suscripciones (Elite)", count: users.filter(u => u.plan === "ELITE").length },
        { id: "foods", icon: Utensils, label: "Catálogo Alimentos", count: foods.length },
        { id: "micronutrients", icon: Zap, label: "Catálogo Micronutrientes", count: micros.length },
        { id: "courses", icon: BookOpen, label: "Catálogo Cursos", count: courses.length },
        { id: "analytics", icon: Activity, label: "Métricas Globales", count: 0 },
    ];

    const filteredUsers = users.filter(u =>
        (u.name || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
        (u.email || "").toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <motion.div key="superadmin-panel" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="space-y-1">
                    <h2 className="text-3xl font-display font-bold text-slate-800">Panel Superadmin</h2>
                    <p className="text-slate-500 text-sm">Gestión global de Nutrity SaaS.</p>
                </div>
                <div className="flex items-center gap-3">
                    <div className="bg-red-50 px-4 py-2 rounded-xl flex items-center gap-3 border border-red-200">
                        <Shield className="w-5 h-5 text-red-500" />
                        <span className="text-[10px] font-bold text-red-600 uppercase tracking-widest">SUPERADMIN MASTER</span>
                    </div>
                </div>
            </div>

            <div className="flex flex-wrap gap-3">
                {sections.map((s) => (
                    <button key={s.id} onClick={() => { setSection(s.id); setSearchTerm(""); }}
                        className={`flex items-center gap-3 px-5 py-3 rounded-xl text-sm font-bold transition-all ${
                            section === s.id
                                ? "bg-slate-900 text-white shadow-lg"
                                : "bg-white text-slate-500 border border-slate-200 hover:border-slate-400"
                        }`}>
                        <s.icon className={`w-4 h-4 ${section === s.id ? "text-white" : ""}`} />
                        {s.label}
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${section === s.id ? "bg-white/20 text-white" : "bg-slate-100 text-slate-500"}`}>
                            {s.count}
                        </span>
                    </button>
                ))}
            </div>

            <div className="flex flex-col md:flex-row gap-4 items-stretch md:items-center">
                <div className="relative flex-1">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                        type="text"
                        placeholder="Buscar..."
                        className="w-full pl-12 pr-4 py-3 rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent text-sm"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>

            {section === "users" && (
                <AdminUsersTab
                    users={filteredUsers}
                    isSaving={isSaving}
                    showUserModal={false}
                    editingUser={null}
                    showCardexModal={false}
                    selectedCardexUser={null}
                    onOpenCardex={() => {}}
                    onCloseCardex={() => {}}
                    onEditUser={() => {}}
                    onDelete={() => {}}
                    onRestore={() => {}}
                    onCloseUserModal={() => {}}
                    onSaveUser={async () => {}}
                    setEditingUser={() => {}}
                    onDeleteFromCardex={() => {}}
                />
            )}

            {section === "payments" && (
                <AdminPaymentsTab
                    users={filteredUsers}
                    isSaving={isSaving}
                    onUpdatePlan={async (userId, newPlan) => {
                        try {
                            setIsSaving(true);
                            await dbService.updateUserProfile(userId, { plan: newPlan });
                            loadAll();
                        } finally {
                            setIsSaving(false);
                        }
                    }}
                />
            )}
            
            {section === "analytics" && (
                <div className="p-10 text-center text-slate-500">Métricas globales próximamente...</div>
            )}
        </motion.div>
    );
}
