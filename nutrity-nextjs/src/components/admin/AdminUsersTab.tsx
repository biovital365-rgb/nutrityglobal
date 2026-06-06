"use client";
import { motion, AnimatePresence } from "motion/react";
import { Loader2, Pencil, Trash2, Save, X, FileText, Zap, CheckCircle2, Shield, Activity, Users } from "lucide-react";
import { FieldInput } from "./shared";

interface AdminUsersTabProps {
    users: any[];
    isSaving: boolean;
    // User modal
    showUserModal: boolean;
    editingUser: any;
    // Cardex modal
    showCardexModal: boolean;
    selectedCardexUser: any;
    onOpenCardex: (user: any) => void;
    onCloseCardex: () => void;
    onEditUser: (user: any) => void;
    onDelete: (id: string, name: string) => void;
    onRestore: (id: string) => void;
    onCloseUserModal: () => void;
    onSaveUser: (e: React.FormEvent) => Promise<void>;
    setEditingUser: React.Dispatch<React.SetStateAction<any>>;
    onDeleteFromCardex: (user: any) => void;
    /** User Status Protocol: Change ACTIVE / BLOCKED / OBSERVED */
    onStatusChange?: (userId: string, status: 'ACTIVE' | 'BLOCKED' | 'OBSERVED') => Promise<void>;
}

export function AdminUsersTab({
    users, isSaving, showUserModal, editingUser,
    showCardexModal, selectedCardexUser,
    onOpenCardex, onCloseCardex, onEditUser, onDelete, onRestore,
    onCloseUserModal, onSaveUser, setEditingUser, onDeleteFromCardex,
    onStatusChange,
}: AdminUsersTabProps) {
    return (
        <>
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
                                {users.map((u) => (
                                    <tr key={u.id} className={`hover:bg-slate-50 transition-colors group ${(u as any).deletedAt ? "opacity-50" : ""}`}>
                                        <td className="py-4 px-6">
                                            <div className="flex items-center gap-3 cursor-pointer" onClick={() => onOpenCardex(u)}>
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
                                                <p className="text-xs font-medium text-nutrity-primary">{u.phone || "No registrado"}</p>
                                                <p className="text-[10px] text-nutrity-gray-text">{u.address || "Sin dirección"}</p>
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
                                                <span className={`px-2 py-0.5 rounded-lg text-[9px] font-bold uppercase tracking-wider text-center ${
                                                    u.status === 'ACTIVE' ? 'bg-emerald-50 text-emerald-600' :
                                                    u.status === 'BLOCKED' ? 'bg-red-50 text-red-600' :
                                                    u.status === 'OBSERVED' ? 'bg-amber-50 text-amber-600' :
                                                    'bg-slate-50 text-slate-500'
                                                }`}>
                                                    {u.status || 'ACTIVE'}
                                                </span>
                                                <span className="text-[9px] font-bold text-nutrity-accent text-center">{u.plan || 'FREEMIUM'}</span>
                                            </div>
                                        </td>
                                        <td className="py-4 px-6">
                                            <div className="flex gap-2 justify-end opacity-0 group-hover:opacity-100 transition-opacity">
                                                {(u as any).deletedAt ? (
                                                    <button onClick={() => onRestore(u.id)}
                                                        className="px-3 py-1.5 rounded-lg bg-emerald-50 text-emerald-600 text-[10px] font-bold hover:bg-emerald-600 hover:text-white transition-all">
                                                        Restaurar
                                                    </button>
                                                ) : (
                                                    <>
                                                        <button onClick={() => onOpenCardex(u)}
                                                            className="p-2 rounded-lg bg-nutrity-primary/10 text-nutrity-primary hover:bg-nutrity-primary hover:text-white transition-all" title="Ver Cardex">
                                                            <FileText className="w-4 h-4" />
                                                        </button>
                                                        <button onClick={() => onEditUser(u)}
                                                            className="p-2 rounded-lg bg-nutrity-accent/10 text-nutrity-accent hover:bg-nutrity-accent hover:text-white transition-all">
                                                            <Pencil className="w-4 h-4" />
                                                        </button>
                                                        <button onClick={() => onDelete(u.id, u.name || u.email)}
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

            {/* ─── Bio-Cardex Modal ─── */}
            <AnimatePresence>
                {showCardexModal && selectedCardexUser && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[400] bg-nutrity-primary/60 backdrop-blur-md flex items-center justify-center p-4 md:p-10"
                    >
                        <motion.div initial={{ scale: 0.9, y: 30 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 30 }}
                            className="bg-nutrity-bg w-full max-w-4xl rounded-[2.5rem] shadow-2xl flex flex-col max-h-[90vh] overflow-hidden relative"
                        >
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
                                <button onClick={onCloseCardex} className="absolute top-8 right-8 p-3 rounded-2xl bg-slate-100 hover:bg-slate-200 transition-all text-nutrity-gray-text">
                                    <X className="w-6 h-6" />
                                </button>
                            </div>

                            <div className="flex-1 overflow-y-auto p-8 md:p-10 space-y-10">
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                                    {[
                                        { label: "Celular", value: selectedCardexUser.phone || "---" },
                                        { label: "Edad", value: `${selectedCardexUser.age || "---"} años` },
                                        { label: "Estado Civil", value: selectedCardexUser.maritalStatus || "---" },
                                        { label: "Ocupación", value: selectedCardexUser.occupation || "---" },
                                    ].map(({ label, value }) => (
                                        <div key={label} className="bg-white p-5 rounded-3xl shadow-sm border border-nutrity-border space-y-1">
                                            <span className="text-[10px] font-bold text-nutrity-gray-text uppercase tracking-widest">{label}</span>
                                            <p className="font-bold text-nutrity-primary">{value}</p>
                                        </div>
                                    ))}
                                </div>

                                <div className="grid md:grid-cols-2 gap-10">
                                    <div className="space-y-6">
                                        <h4 className="text-xl font-display font-bold flex items-center gap-3">
                                            <Activity className="w-6 h-6 text-nutrity-accent" /> Expediente Metabólico
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
                                                            &quot;{selectedCardexUser.metabolicResults.insight || "Sin insight generado"}&quot;
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
                                                    <p className="text-sm font-bold uppercase tracking-widest">Sin Diagnóstico Realizado</p>
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    <div className="space-y-6">
                                        <h4 className="text-xl font-display font-bold flex items-center gap-3">
                                            <Users className="w-6 h-6 text-nutrity-accent" /> Información de Contacto
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
                                                <a href={`https://wa.me/${selectedCardexUser.phone?.replace(/\+/g, "")}`} target="_blank" rel="noreferrer"
                                                    className="flex-1 py-3 rounded-2xl bg-[#25D366] text-white text-[10px] font-bold uppercase tracking-widest text-center shadow-lg shadow-green-500/20 hover:scale-105 transition-all">
                                                    WhatsApp Directo
                                                </a>
                                                <a href={`mailto:${selectedCardexUser.email}`}
                                                    className="flex-1 py-3 rounded-2xl bg-nutrity-primary text-white text-[10px] font-bold uppercase tracking-widest text-center shadow-lg shadow-nutrity-primary/20 hover:scale-105 transition-all">
                                                    Enviar Email
                                                </a>
                                            </div>
                                        </div>
                                        <div className="bg-nutrity-primary text-white rounded-3xl p-6 space-y-4 shadow-xl shadow-nutrity-primary/20">
                                            <p className="text-xs font-bold uppercase tracking-widest opacity-60">Control Administrativo</p>
                                            {/* User Status Protocol */}
                                            {onStatusChange && (
                                                <div className="space-y-2">
                                                    <p className="text-[9px] font-bold uppercase tracking-widest opacity-50">Estado del Usuario</p>
                                                    <div className="grid grid-cols-3 gap-2">
                                                        {(['ACTIVE', 'OBSERVED', 'BLOCKED'] as const).map((st) => (
                                                            <button
                                                                key={st}
                                                                onClick={() => onStatusChange(selectedCardexUser.id, st)}
                                                                className={`py-2 px-1 rounded-xl text-[9px] font-bold uppercase tracking-wider transition-all ${
                                                                    (selectedCardexUser.status || 'ACTIVE') === st
                                                                        ? st === 'ACTIVE' ? 'bg-emerald-500 text-white shadow-lg' :
                                                                          st === 'OBSERVED' ? 'bg-amber-500 text-white shadow-lg' :
                                                                          'bg-red-500 text-white shadow-lg'
                                                                        : 'bg-white/10 hover:bg-white/20'
                                                                }`}
                                                            >
                                                                {st === 'ACTIVE' ? '✓ Activo' : st === 'OBSERVED' ? '⚠ Observado' : '✗ Bloqueado'}
                                                            </button>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}
                                            <div className="grid grid-cols-2 gap-3">
                                                <button onClick={() => { onEditUser(selectedCardexUser); onCloseCardex(); }}
                                                    className="p-3 rounded-xl bg-white/10 hover:bg-white/20 transition-all text-xs font-bold flex items-center justify-center gap-2">
                                                    <Pencil className="w-4 h-4" /> Editar
                                                </button>
                                                <button onClick={() => onDeleteFromCardex(selectedCardexUser)}
                                                    className="p-3 rounded-xl bg-red-500/20 hover:bg-red-500/40 transition-all text-xs font-bold text-red-200 flex items-center justify-center gap-2">
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

            {/* ─── User Edit Modal ─── */}
            <AnimatePresence>
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
                                <button onClick={onCloseUserModal} className="p-2 rounded-full hover:bg-nutrity-bg"><X className="w-5 h-5 text-nutrity-gray-text" /></button>
                            </div>
                            <form onSubmit={onSaveUser} className="flex-1 overflow-y-auto p-8 space-y-6 scrollbar-hide">
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
                                        <select className="w-full bg-nutrity-bg border border-nutrity-border rounded-xl px-4 py-3 text-sm font-medium focus:outline-none"
                                            value={editingUser.maritalStatus || ""} onChange={(e) => setEditingUser({ ...editingUser, maritalStatus: e.target.value })}>
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
                                        <select className="w-full bg-nutrity-bg border border-nutrity-border rounded-xl px-4 py-3 text-sm font-medium focus:outline-none"
                                            value={editingUser.role || "USER"} onChange={(e) => setEditingUser({ ...editingUser, role: e.target.value })}>
                                            <option value="USER">Paciente (User)</option>
                                            <option value="ADMIN">Administrador</option>
                                        </select>
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-[10px] font-bold text-nutrity-gray-text uppercase tracking-widest ml-1">Plan de Suscripción</label>
                                        <select className="w-full bg-nutrity-bg border border-nutrity-border rounded-xl px-4 py-3 text-sm font-medium focus:outline-none"
                                            value={editingUser.plan || "FREE"} onChange={(e) => setEditingUser({ ...editingUser, plan: e.target.value })}>
                                            <option value="FREE">FREEMIUM (FREE)</option>
                                            <option value="BASIC">BÁSICO (BASIC)</option>
                                            <option value="ADVANCED">AVANZADO (ADVANCED)</option>
                                            <option value="ELITE">ELITE/COACH (ELITE)</option>
                                        </select>
                                    </div>
                                    {/* User Status Protocol in Edit Modal */}
                                    <div className="space-y-1.5">
                                        <label className="text-[10px] font-bold text-nutrity-gray-text uppercase tracking-widest ml-1">Estado del Usuario</label>
                                        <select className="w-full bg-nutrity-bg border border-nutrity-border rounded-xl px-4 py-3 text-sm font-medium focus:outline-none"
                                            value={editingUser.status || "ACTIVE"} onChange={(e) => setEditingUser({ ...editingUser, status: e.target.value })}>
                                            <option value="ACTIVE">✓ ACTIVE — Acceso completo</option>
                                            <option value="OBSERVED">⚠ OBSERVED — Solo lectura</option>
                                            <option value="BLOCKED">✗ BLOCKED — Sin acceso</option>
                                        </select>
                                    </div>
                                </div>

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
                                            &quot;{editingUser.metabolicResults.insight || "Sin observaciones registradas."}&quot;
                                        </p>
                                        <div className="flex flex-wrap gap-1.5">
                                            {editingUser.metabolicResults.pillars?.map((p: any, i: number) => (
                                                <span key={i} className="px-2 py-0.5 bg-white/50 text-emerald-700 text-[9px] font-bold rounded-md border border-emerald-100">{p.title}</span>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                <button disabled={isSaving} type="submit"
                                    className="w-full bg-nutrity-primary text-white py-4 rounded-xl font-bold text-xs uppercase tracking-widest shadow-lg shadow-nutrity-primary/20 hover:bg-nutrity-accent transition-all flex items-center justify-center gap-2">
                                    {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                                    Guardar Cambios del Paciente
                                </button>
                            </form>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
}
