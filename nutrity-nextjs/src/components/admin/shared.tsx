"use client";
import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { X, PlusCircle, AlertTriangle } from "lucide-react";

// ─── FieldInput ──────────────────────────────────────────────────────────────
export function FieldInput({
    label, value, onChange, type = "text", placeholder = "", required = false, multiline = false,
}: {
    label: string; value: string; onChange: (v: string) => void;
    type?: string; placeholder?: string; required?: boolean; multiline?: boolean;
}) {
    return (
        <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-nutrity-gray-text uppercase tracking-widest ml-1">{label}</label>
            {multiline ? (
                <textarea
                    value={value} onChange={(e) => onChange(e.target.value)}
                    placeholder={placeholder} required={required} rows={3}
                    className="w-full bg-nutrity-bg border border-nutrity-border rounded-xl px-4 py-3 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-nutrity-accent/10 focus:border-nutrity-accent transition-all resize-none"
                />
            ) : (
                <input
                    type={type} value={value} onChange={(e) => onChange(e.target.value)}
                    placeholder={placeholder} required={required}
                    className="w-full bg-nutrity-bg border border-nutrity-border rounded-xl px-4 py-3 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-nutrity-accent/10 focus:border-nutrity-accent transition-all"
                />
            )}
        </div>
    );
}

// ─── TagInput ────────────────────────────────────────────────────────────────
export function TagInput({ label, tags, onChange }: { label: string; tags: string[]; onChange: (t: string[]) => void }) {
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

// ─── DeleteConfirmModal ──────────────────────────────────────────────────────
export function DeleteConfirmModal({ itemName, onConfirm, onCancel }: {
    itemName: string; onConfirm: () => void; onCancel: () => void;
}) {
    return (
        <AnimatePresence>
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
                        <p className="text-sm text-nutrity-gray-text">¿Seguro que deseas eliminar <strong>&quot;{itemName}&quot;</strong>? Esta acción no se puede deshacer.</p>
                    </div>
                    <div className="flex gap-3">
                        <button onClick={onCancel} className="flex-1 py-3 rounded-xl border border-nutrity-border text-sm font-bold hover:bg-nutrity-bg transition-all">Cancelar</button>
                        <button onClick={onConfirm} className="flex-1 py-3 rounded-xl bg-red-500 text-white text-sm font-bold hover:bg-red-600 transition-all">Eliminar</button>
                    </div>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
}
