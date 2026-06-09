"use client";
import { motion, AnimatePresence } from "motion/react";
import { Pencil, Trash2, Save, X, Loader2, PlusCircle } from "lucide-react";
import { FieldInput } from "./shared";

interface AdminCalendarTabProps {
    appointments: any[];
    isSaving: boolean;
    showApptModal: boolean;
    editingAppt: any;
    apptFilter: "ALL" | "DIAGNOSTICO" | "CONTROL";
    onFilterChange: (f: "ALL" | "DIAGNOSTICO" | "CONTROL") => void;
    onEditAppt: (appt: any) => void;
    onNewAppt: () => void;
    onDelete: (id: string, name: string) => void;
    onRestore: (id: string) => void;
    onCloseModal: () => void;
    onSave: (e: React.FormEvent) => Promise<void>;
    setEditingAppt: React.Dispatch<React.SetStateAction<any>>;
    users: any[];
}

export function AdminCalendarTab({
    appointments, isSaving, showApptModal, editingAppt, apptFilter,
    onFilterChange, onEditAppt, onNewAppt, onDelete, onRestore,
    onCloseModal, onSave, setEditingAppt, users,
}: AdminCalendarTabProps) {
    const filtered = appointments.filter((a) => {
        if (apptFilter === "ALL") return true;
        if (apptFilter === "DIAGNOSTICO") return a.title.toLowerCase().includes("diagnóstico");
        return !a.title.toLowerCase().includes("diagnóstico");
    });

    return (
        <>
            <motion.div key="calendar-view" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                <div className="mb-6 flex items-center justify-between gap-4">
                    <div className="flex gap-2">
                        {(["ALL", "DIAGNOSTICO", "CONTROL"] as const).map((f) => (
                            <button key={f} onClick={() => onFilterChange(f)}
                                className={`px-4 py-2 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all ${
                                    apptFilter === f ? "bg-nutrity-accent text-white shadow-lg shadow-nutrity-accent/20" : "bg-white text-nutrity-gray-text hover:bg-nutrity-bg"
                                }`}>
                                {f === "ALL" ? "Todas" : f === "DIAGNOSTICO" ? "Diagnósticos" : "Controles"}
                            </button>
                        ))}
                    </div>
                    <button onClick={onNewAppt}
                        className="px-6 py-2 bg-nutrity-primary text-white rounded-xl text-[10px] font-bold uppercase tracking-widest hover:bg-nutrity-primary-light transition-all flex items-center gap-2">
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
                                {filtered.map((app) => (
                                    <tr key={app.id} className={`hover:bg-slate-50 transition-colors group ${(app as any).deletedAt ? "opacity-50" : ""}`}>
                                        <td className="py-4 px-6">
                                            <span className="font-bold text-sm block">{app.user?.name || "Usuario"}</span>
                                            <p className="text-[10px] text-nutrity-gray-text">{app.user?.email}</p>
                                        </td>
                                        <td className="py-4 px-6 text-sm font-medium">{new Date(app.date).toLocaleDateString()}</td>
                                        <td className="py-4 px-6 text-sm font-bold text-nutrity-accent">{app.time}</td>
                                        <td className="py-4 px-6 text-xs text-nutrity-primary/80">{app.title}</td>
                                        <td className="py-4 px-6 text-right">
                                            <div className="flex justify-end gap-2">
                                                {(app as any).deletedAt ? (
                                                    <button onClick={() => onRestore(app.id)}
                                                        className="px-3 py-1.5 rounded-lg bg-emerald-50 text-emerald-600 text-[10px] font-bold hover:bg-emerald-600 hover:text-white transition-all">
                                                        Restaurar
                                                    </button>
                                                ) : (
                                                    <>
                                                        <button onClick={() => onEditAppt(app)} className="p-2 text-nutrity-gray-text hover:text-nutrity-accent transition-colors">
                                                            <Pencil className="w-4 h-4" />
                                                        </button>
                                                        <button onClick={() => onDelete(app.id, `Cita de ${app.user?.name}`)} className="p-2 text-nutrity-gray-text hover:text-rose-500 transition-colors">
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

            {/* ─── Appointment Modal ─── */}
            <AnimatePresence>
                {showApptModal && editingAppt && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[200] bg-nutrity-primary/60 backdrop-blur-md flex items-center justify-center p-4"
                    >
                        <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }} exit={{ scale: 0.95 }}
                            className="bg-white w-full max-w-md rounded-2xl shadow-2xl p-8 relative"
                        >
                            <button onClick={onCloseModal} className="absolute top-6 right-6 p-2 rounded-full hover:bg-nutrity-bg"><X className="w-5 h-5 text-nutrity-gray-text" /></button>
                            <div className="mb-6">
                                <h3 className="text-xl font-bold">Editar Cita Médica</h3>
                                <p className="text-xs text-nutrity-gray-text">Ajusta la programación del paciente</p>
                            </div>
                            <form onSubmit={onSave} className="space-y-5">
                                {!editingAppt.id && (
                                    <div className="space-y-1.5">
                                        <label className="text-[10px] font-bold text-nutrity-gray-text uppercase tracking-widest ml-1">Paciente *</label>
                                        <select className="w-full bg-nutrity-bg border border-nutrity-border rounded-xl px-4 py-3 text-sm font-medium focus:outline-none"
                                            value={editingAppt.userId || ""} onChange={(e) => setEditingAppt({ ...editingAppt, userId: e.target.value })} required>
                                            <option value="" disabled>Selecciona un paciente</option>
                                            {users.map(u => (
                                                <option key={u.id} value={u.id}>{u.name || u.email}</option>
                                            ))}
                                        </select>
                                    </div>
                                )}
                                <FieldInput label="Motivo de la Cita" value={editingAppt.title || ""} onChange={(v) => setEditingAppt({ ...editingAppt, title: v })} required />
                                <div className="grid grid-cols-2 gap-4">
                                    <FieldInput label="Fecha" type="date" value={editingAppt.date || ""} onChange={(v) => setEditingAppt({ ...editingAppt, date: v })} required />
                                    <FieldInput label="Hora" type="time" value={editingAppt.time || ""} onChange={(v) => setEditingAppt({ ...editingAppt, time: v })} required />
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-bold text-nutrity-gray-text uppercase tracking-widest ml-1">Tipo de Cita</label>
                                    <select className="w-full bg-nutrity-bg border border-nutrity-border rounded-xl px-4 py-3 text-sm font-medium focus:outline-none"
                                        value={editingAppt.type || "Virtual"} onChange={(e) => setEditingAppt({ ...editingAppt, type: e.target.value })}>
                                        <option value="Virtual">Virtual (IA Sync)</option>
                                        <option value="Presencial">Presencial (Clínica)</option>
                                    </select>
                                </div>
                                <button disabled={isSaving} type="submit"
                                    className="w-full bg-nutrity-primary text-white py-4 rounded-xl font-bold text-xs uppercase tracking-widest shadow-lg hover:bg-nutrity-accent transition-all flex items-center justify-center gap-2">
                                    {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                                    Guardar Cambios
                                </button>
                            </form>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
}
