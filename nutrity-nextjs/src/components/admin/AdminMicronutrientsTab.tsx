"use client";
import { motion, AnimatePresence } from "motion/react";
import { Loader2, Pencil, Trash2, Save, X } from "lucide-react";
import { Micronutrient } from "@/lib/types";
import { FieldInput, TagInput } from "./shared";

interface AdminMicronutrientsTabProps {
    micros: Micronutrient[];
    isSaving: boolean;
    showMicroModal: boolean;
    editingMicro: Partial<Micronutrient>;
    onEdit: (micro: Micronutrient) => void;
    onDelete: (id: string, name: string) => void;
    onRestore: (id: string) => void;
    onCloseModal: () => void;
    onSave: (e: React.FormEvent) => Promise<void>;
    onSync: () => void;
    setEditingMicro: React.Dispatch<React.SetStateAction<Partial<Micronutrient>>>;
}

export function AdminMicronutrientsTab({
    micros, isSaving, showMicroModal, editingMicro,
    onEdit, onDelete, onRestore, onCloseModal, onSave, onSync, setEditingMicro,
}: AdminMicronutrientsTabProps) {
    return (
        <>
            <motion.div key="micro-table" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-display font-bold text-nutrity-primary">Micronutrientes</h3>
                    <button
                        onClick={onSync}
                        className="px-4 py-2 rounded-xl border border-nutrity-accent text-nutrity-accent font-bold text-[10px] uppercase tracking-widest hover:bg-nutrity-accent/5 transition-all flex items-center gap-2"
                    >
                        <Loader2 className={`w-3.5 h-3.5 ${isSaving ? "animate-spin" : ""}`} />
                        Sincronizar Catálogo
                    </button>
                </div>
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
                                {micros.map((micro) => (
                                    <tr key={micro.id} className={`hover:bg-slate-50 transition-colors group ${(micro as any).deletedAt ? "opacity-50" : ""}`}>
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
                                                    <button onClick={() => onRestore(micro.id)}
                                                        className="px-3 py-1.5 rounded-lg bg-emerald-50 text-emerald-600 text-[10px] font-bold hover:bg-emerald-600 hover:text-white transition-all">
                                                        Restaurar
                                                    </button>
                                                ) : (
                                                    <>
                                                        <button onClick={() => onEdit(micro)}
                                                            className="p-2 rounded-lg bg-nutrity-accent/10 text-nutrity-accent hover:bg-nutrity-accent hover:text-white transition-all">
                                                            <Pencil className="w-4 h-4" />
                                                        </button>
                                                        <button onClick={() => onDelete(micro.id, micro.name)}
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

            {/* ─── Micro Modal ─── */}
            <AnimatePresence>
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
                                <button onClick={onCloseModal} className="p-2 rounded-full hover:bg-nutrity-bg"><X className="w-5 h-5 text-nutrity-gray-text" /></button>
                            </div>
                            <form onSubmit={onSave} className="flex-1 overflow-y-auto p-8 space-y-5 scrollbar-hide">
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
            </AnimatePresence>
        </>
    );
}
