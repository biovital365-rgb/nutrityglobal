"use client";
import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Loader2, Pencil, Trash2, Save, X, PlusCircle, ChefHat, Sparkles, ThumbsUp, ThumbsDown } from "lucide-react";
import * as dbService from "@/actions/db-actions";

interface AdminMenuTabProps {
    users: any[];
    isSaving: boolean;
    adminEmail: string;
    notify: (type: "success" | "error", message: string) => void;
}

export function AdminMenuTab({ users, isSaving: _isSaving, adminEmail, notify }: AdminMenuTabProps) {
    const [selectedMenuUser, setSelectedMenuUser] = useState<any>(null);
    const [menuWeekDays, setMenuWeekDays] = useState<any[]>([]);
    const [isGeneratingAIMenu, setIsGeneratingAIMenu] = useState(false);
    const [isApprovingMenu, setIsApprovingMenu] = useState(false);
    const [isLoadingMenu, setIsLoadingMenu] = useState(false);
    const [menuPhase, setMenuPhase] = useState<"Iniciación" | "Intermedia" | "Avanzada">("Iniciación");
    const [editingMenuRecord, setEditingMenuRecord] = useState<any>(null);
    const [menuNotes, setMenuNotes] = useState("");

    const loadUserMenu = async (u: any) => {
        setSelectedMenuUser(u);
        setMenuWeekDays([]);
        setMenuNotes("");
        setIsLoadingMenu(true);
        const phase = u.metabolicResults?.phase?.includes("Avanzada") ? "Avanzada"
            : u.metabolicResults?.phase?.includes("Intermedia") ? "Intermedia" : "Iniciación";
        setMenuPhase(phase as any);
        try {
            const days = await dbService.getApprovedMenu(u.id);
            if (days.length === 0) {
                const pending = await dbService.getPendingMenu(u.id);
                setMenuWeekDays(pending);
            } else {
                setMenuWeekDays(days);
            }
        } catch (e) {
            notify("error", "Error al cargar el menú del paciente.");
        } finally {
            setIsLoadingMenu(false);
        }
    };

    const handleGenerateAI = async () => {
        if (!confirm(`¿Generar menú con IA para fase ${menuPhase}? Se reemplazará el menú actual pendiente.`)) return;
        setIsGeneratingAIMenu(true);
        try {
            const { GoogleGenerativeAI } = await import("@google/generative-ai");
            const genAI = new GoogleGenerativeAI(process.env.NEXT_PUBLIC_GEMINI_API_KEY as string);
            const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
            const prompt = `Eres un coach de nutrición clínica especializado en Remisión Metabólica con superalimentos andinos.
Genera un plan de menú semanal personalizado para un paciente en Fase ${menuPhase} del protocolo Nutrity.

REGLAS:
- Usa superalimentos andinos: Quinua, Kiwicha, Cañihua, Maca, Aguaymanto, Tarwi, Sacha Inchi, Cacao puro, Oca Morada.
- Adapta las porciones y preparaciones a la fase ${menuPhase}.
- Fase Iniciación: bajo en azúcar, antiinflamatorio, fácil digestión.
- Fase Intermedia: mayor variedad, flexibilidad metabólica.
- Fase Avanzada: optimización hormonal y regeneración celular.

Responde SOLO con JSON válido, sin texto adicional:
{
  "lunes":    {"breakfast":"...","lunch":"...","dinner":"...","snack":"...","metabolicGoal":"..."},
  "martes":   {"breakfast":"...","lunch":"...","dinner":"...","snack":"...","metabolicGoal":"..."},
  "miercoles":{"breakfast":"...","lunch":"...","dinner":"...","snack":"...","metabolicGoal":"..."},
  "jueves":   {"breakfast":"...","lunch":"...","dinner":"...","snack":"...","metabolicGoal":"..."},
  "viernes":  {"breakfast":"...","lunch":"...","dinner":"...","snack":"...","metabolicGoal":"..."},
  "sabado":   {"breakfast":"...","lunch":"...","dinner":"...","snack":"...","metabolicGoal":"..."},
  "domingo":  {"breakfast":"...","lunch":"...","dinner":"...","snack":"...","metabolicGoal":"..."}
}`;
            const result = await model.generateContent(prompt);
            const rawText = result.response.text();
            const jsonMatch = rawText.match(/\{[\s\S]*\}/);
            if (!jsonMatch) throw new Error("La IA no devolvió un JSON válido");
            const days = JSON.parse(jsonMatch[0]);
            const weekStart = new Date();
            weekStart.setDate(weekStart.getDate() - weekStart.getDay() + 1);
            const weekStartStr = weekStart.toISOString().split("T")[0];
            await dbService.saveWeeklyMenu(selectedMenuUser.id, weekStartStr, menuPhase, days);
            const saved = await dbService.getPendingMenu(selectedMenuUser.id);
            setMenuWeekDays(saved);
            notify("success", "Menú generado con IA. Revisa y aprueba.");
        } catch (e: any) {
            const errMsg = e.message || "Error desconocido";
            notify("error", `Error al generar: ${errMsg.substring(0, 50)}...`);
        } finally {
            setIsGeneratingAIMenu(false);
        }
    };

    const handleApprove = async () => {
        if (!confirm("¿Aprobar este menú? El paciente podrá verlo inmediatamente.")) return;
        setIsApprovingMenu(true);
        try {
            const weekStart = menuWeekDays[0]?.weekStart;
            await dbService.approveWeeklyMenu(selectedMenuUser.id, weekStart, adminEmail, menuNotes);
            const approved = await dbService.getApprovedMenu(selectedMenuUser.id);
            setMenuWeekDays(approved);
            notify("success", "✅ Menú aprobado. El paciente ya puede verlo.");
        } catch { notify("error", "Error al aprobar."); }
        finally { setIsApprovingMenu(false); }
    };

    const handleReject = async () => {
        const reason = prompt("Motivo del rechazo (se enviará al coach):");
        if (!reason) return;
        try {
            const weekStart = menuWeekDays[0]?.weekStart;
            await dbService.rejectWeeklyMenu(selectedMenuUser.id, weekStart, adminEmail, reason);
            setMenuWeekDays([]);
            notify("success", "Menú rechazado.");
        } catch { notify("error", "Error al rechazar."); }
    };

    const handleSaveDayEdit = async (record: any) => {
        try {
            await dbService.updateDayMenu(record.id, editingMenuRecord.menuData, editingMenuRecord.metabolicGoal);
            setMenuWeekDays(prev => prev.map(d => d.id === record.id ? { ...d, menuData: editingMenuRecord.menuData, metabolicGoal: editingMenuRecord.metabolicGoal } : d));
            setEditingMenuRecord(null);
            notify("success", "Día actualizado.");
        } catch { notify("error", "Error al guardar."); }
    };

    const activePatients = users.filter(u => !u.deletedAt && u.role !== "ADMIN");

    return (
        <motion.div key="menu-approval" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-6">
            <div className="grid lg:grid-cols-3 gap-6">
                {/* Patient list */}
                <div className="space-y-3">
                    <h3 className="text-sm font-bold uppercase tracking-widest text-nutrity-gray-text">Pacientes</h3>
                    {activePatients.map(u => (
                        <button key={u.id} onClick={() => loadUserMenu(u)}
                            className={`w-full text-left p-4 rounded-2xl border transition-all ${
                                selectedMenuUser?.id === u.id
                                    ? "border-nutrity-accent bg-nutrity-accent/5 shadow-lg shadow-nutrity-accent/10"
                                    : "border-nutrity-border bg-white hover:border-nutrity-accent/30"
                            }`}>
                            <div className="flex items-center gap-3">
                                <div className="w-9 h-9 rounded-full bg-nutrity-primary/10 flex items-center justify-center text-nutrity-primary font-bold text-xs flex-shrink-0">
                                    {u.name?.charAt(0) || "U"}
                                </div>
                                <div className="min-w-0">
                                    <p className="font-bold text-sm truncate">{u.name || "Sin nombre"}</p>
                                    <p className="text-[10px] text-nutrity-gray-text truncate">{u.metabolicResults?.phase || "Sin diagnóstico"}</p>
                                </div>
                            </div>
                        </button>
                    ))}
                </div>

                {/* Menu editor */}
                <div className="lg:col-span-2 space-y-4">
                    {!selectedMenuUser ? (
                        <div className="h-64 flex flex-col items-center justify-center text-nutrity-gray-text opacity-40 space-y-3">
                            <ChefHat className="w-12 h-12" />
                            <p className="text-sm font-bold">Selecciona un paciente para gestionar su menú</p>
                        </div>
                    ) : (
                        <>
                            {/* Header controls */}
                            <div className="flex flex-wrap items-center justify-between gap-3 p-5 bg-white rounded-2xl border border-nutrity-border shadow-sm">
                                <div>
                                    <h3 className="font-bold text-lg">{selectedMenuUser.name}</h3>
                                    <div className="flex items-center gap-2 mt-1">
                                        <span className="text-[10px] font-bold uppercase tracking-widest text-nutrity-gray-text">Fase:</span>
                                        <select value={menuPhase} onChange={e => setMenuPhase(e.target.value as any)}
                                            className="text-[10px] font-bold bg-nutrity-accent/10 text-nutrity-accent px-2 py-1 rounded-lg border-none outline-none cursor-pointer">
                                            <option>Iniciación</option>
                                            <option>Intermedia</option>
                                            <option>Avanzada</option>
                                        </select>
                                        {menuWeekDays.length > 0 && (
                                            <span className={`px-2 py-0.5 rounded-lg text-[9px] font-bold uppercase ${
                                                menuWeekDays[0]?.status === "APPROVED" ? "bg-emerald-50 text-emerald-600"
                                                : menuWeekDays[0]?.status === "PENDING" ? "bg-amber-50 text-amber-600"
                                                : "bg-red-50 text-red-500"
                                            }`}>{menuWeekDays[0]?.status || "SIN MENÚ"}</span>
                                        )}
                                    </div>
                                </div>
                                <div className="flex gap-2 flex-wrap">
                                    <button disabled={isGeneratingAIMenu} onClick={handleGenerateAI}
                                        className="flex items-center gap-2 px-4 py-2.5 bg-nutrity-primary text-white rounded-xl text-[11px] font-bold hover:bg-nutrity-primary-light transition-all disabled:opacity-50">
                                        {isGeneratingAIMenu ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                                        Generar con IA
                                    </button>
                                    {menuWeekDays.length > 0 && menuWeekDays[0]?.status === "PENDING" && (
                                        <>
                                            <button disabled={isApprovingMenu} onClick={handleApprove}
                                                className="flex items-center gap-2 px-4 py-2.5 bg-emerald-500 text-white rounded-xl text-[11px] font-bold hover:bg-emerald-600 transition-all disabled:opacity-50">
                                                {isApprovingMenu ? <Loader2 className="w-4 h-4 animate-spin" /> : <ThumbsUp className="w-4 h-4" />}
                                                Aprobar Plan
                                            </button>
                                            <button onClick={handleReject}
                                                className="flex items-center gap-2 px-4 py-2.5 bg-red-50 text-red-500 border border-red-200 rounded-xl text-[11px] font-bold hover:bg-red-500 hover:text-white transition-all">
                                                <ThumbsDown className="w-4 h-4" /> Rechazar
                                            </button>
                                        </>
                                    )}
                                </div>
                            </div>

                            {/* Coach notes */}
                            <div className="p-4 bg-white rounded-2xl border border-nutrity-border">
                                <label className="text-[10px] font-bold text-nutrity-gray-text uppercase tracking-widest block mb-2">Notas del Coach (opcionales)</label>
                                <textarea value={menuNotes} onChange={e => setMenuNotes(e.target.value)} rows={2}
                                    placeholder="Ej: Incrementar proteína en cenas, evitar lácteos..."
                                    className="w-full text-sm bg-nutrity-bg border border-nutrity-border rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-nutrity-accent/10 resize-none" />
                            </div>

                            {/* Days */}
                            {isLoadingMenu ? (
                                <div className="py-20 flex flex-col items-center justify-center space-y-4">
                                    <Loader2 className="w-10 h-10 text-nutrity-accent animate-spin" />
                                    <p className="text-sm font-bold text-nutrity-gray-text">Cargando menú...</p>
                                </div>
                            ) : menuWeekDays.length === 0 ? (
                                <div className="py-20 bg-slate-50/50 rounded-2xl border-2 border-dashed border-nutrity-border flex flex-col items-center justify-center text-nutrity-gray-text space-y-3">
                                    <div className="w-16 h-16 rounded-full bg-white flex items-center justify-center shadow-sm">
                                        <ChefHat className="w-8 h-8 opacity-40" />
                                    </div>
                                    <p className="font-bold text-sm">Sin menú semanal generado</p>
                                    <p className="text-xs opacity-60">Usa el botón &quot;Generar con IA&quot; para crear un plan nutricional.</p>
                                </div>
                            ) : (
                                <div className="space-y-3">
                                    {menuWeekDays.map((record) => (
                                        <div key={record.id} className="bg-white rounded-2xl border border-nutrity-border p-5 space-y-3">
                                            <div className="flex items-center justify-between">
                                                <h4 className="font-bold text-sm capitalize">
                                                    {new Date(record.date + "T12:00:00").toLocaleDateString("es-ES", { weekday: "long", day: "numeric", month: "short" })}
                                                </h4>
                                                {record.status === "APPROVED" && (
                                                    <span className="text-[9px] font-bold bg-emerald-50 text-emerald-600 px-2 py-0.5 rounded-lg">APROBADO</span>
                                                )}
                                            </div>
                                            {editingMenuRecord?.id === record.id ? (
                                                <div className="space-y-2">
                                                    {["breakfast", "lunch", "dinner", "snack"].map(slot => (
                                                        <div key={slot} className="flex gap-2 items-start">
                                                            <span className="text-[9px] font-bold uppercase tracking-widest text-nutrity-gray-text w-20 pt-2.5 flex-shrink-0">
                                                                {slot === "breakfast" ? "Desayuno" : slot === "lunch" ? "Almuerzo" : slot === "dinner" ? "Cena" : "Snack"}
                                                            </span>
                                                            <textarea rows={2} value={editingMenuRecord.menuData?.[slot] || ""}
                                                                onChange={e => setEditingMenuRecord((prev: any) => ({ ...prev, menuData: { ...prev.menuData, [slot]: e.target.value } }))}
                                                                className="flex-1 text-xs bg-nutrity-bg border border-nutrity-border rounded-xl px-3 py-2 focus:outline-none resize-none" />
                                                        </div>
                                                    ))}
                                                    <div className="flex gap-2 items-center">
                                                        <span className="text-[9px] font-bold uppercase tracking-widest text-nutrity-accent w-20 flex-shrink-0">Meta</span>
                                                        <input value={editingMenuRecord.metabolicGoal || ""}
                                                            onChange={e => setEditingMenuRecord((prev: any) => ({ ...prev, metabolicGoal: e.target.value }))}
                                                            className="flex-1 text-xs bg-nutrity-bg border border-nutrity-border rounded-xl px-3 py-2 focus:outline-none" />
                                                    </div>
                                                    <div className="flex gap-2 justify-end">
                                                        <button onClick={() => setEditingMenuRecord(null)} className="px-3 py-1.5 text-[10px] font-bold border border-nutrity-border rounded-lg hover:bg-nutrity-bg transition-all">Cancelar</button>
                                                        <button onClick={() => handleSaveDayEdit(record)}
                                                            className="px-3 py-1.5 text-[10px] font-bold bg-nutrity-accent text-white rounded-lg hover:bg-nutrity-accent/90 transition-all flex items-center gap-1">
                                                            <Save className="w-3 h-3" /> Guardar
                                                        </button>
                                                    </div>
                                                </div>
                                            ) : (
                                                <div className="space-y-2">
                                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                                                        {[{ l: "Desayuno", k: "breakfast" }, { l: "Almuerzo", k: "lunch" }, { l: "Cena", k: "dinner" }, { l: "Snack", k: "snack" }].map(({ l, k }) => (
                                                            <div key={k} className="bg-nutrity-bg rounded-xl p-3">
                                                                <span className="text-[9px] font-bold text-nutrity-gray-text uppercase tracking-widest block mb-1">{l}</span>
                                                                <p className="text-[11px] text-nutrity-primary leading-snug">{record.menuData?.[k] || "—"}</p>
                                                            </div>
                                                        ))}
                                                    </div>
                                                    <div className="flex items-center justify-between">
                                                        <span className="text-[10px] text-nutrity-accent font-bold">🎯 {record.metabolicGoal}</span>
                                                        <button onClick={() => setEditingMenuRecord({ ...record })}
                                                            className="p-1.5 rounded-lg bg-nutrity-accent/10 text-nutrity-accent hover:bg-nutrity-accent hover:text-white transition-all">
                                                            <Pencil className="w-3.5 h-3.5" />
                                                        </button>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </>
                    )}
                </div>
            </div>
        </motion.div>
    );
}
