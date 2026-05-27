"use client";
import { motion, AnimatePresence } from "motion/react";
import { Loader2, Pencil, Trash2, Save, X } from "lucide-react";
import { Course } from "@/lib/types";
import { getDirectImageUrl } from "@/lib/utils";
import { FieldInput } from "./shared";
import { Plus, GripVertical } from "lucide-react";

interface AdminCoursesTabProps {
    courses: Course[];
    isSaving: boolean;
    showCourseModal: boolean;
    editingCourse: Partial<Course>;
    onEdit: (course: Course) => void;
    onDelete: (id: string, name: string) => void;
    onRestore: (id: string) => void;
    onCloseModal: () => void;
    onSave: (e: React.FormEvent) => Promise<void>;
    setEditingCourse: React.Dispatch<React.SetStateAction<Partial<Course>>>;
}

export function AdminCoursesTab({
    courses, isSaving, showCourseModal, editingCourse,
    onEdit, onDelete, onRestore, onCloseModal, onSave, setEditingCourse,
}: AdminCoursesTabProps) {
    return (
        <>
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
                                {courses.map((course) => (
                                    <tr key={course.id} className={`hover:bg-slate-50 transition-colors group ${(course as any).deletedAt ? "opacity-50" : ""}`}>
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
                                                    <button onClick={() => onRestore(course.id)}
                                                        className="px-3 py-1.5 rounded-lg bg-emerald-50 text-emerald-600 text-[10px] font-bold hover:bg-emerald-600 hover:text-white transition-all">
                                                        Restaurar
                                                    </button>
                                                ) : (
                                                    <>
                                                        <button onClick={() => onEdit(course)}
                                                            className="p-2 rounded-lg bg-nutrity-accent/10 text-nutrity-accent hover:bg-nutrity-accent hover:text-white transition-all">
                                                            <Pencil className="w-4 h-4" />
                                                        </button>
                                                        <button onClick={() => onDelete(course.id, course.title)}
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

            {/* ─── Course Modal ─── */}
            <AnimatePresence>
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
                                <button onClick={onCloseModal} className="p-2 rounded-full hover:bg-nutrity-bg"><X className="w-5 h-5 text-nutrity-gray-text" /></button>
                            </div>
                            <form onSubmit={onSave} className="flex-1 overflow-y-auto p-8 space-y-5 scrollbar-hide">
                                <FieldInput label="Título del Curso" value={editingCourse.title || ""} onChange={(v) => setEditingCourse(p => ({ ...p, title: v }))} required placeholder="Protocolo de Remisión Metabólica" />
                                <FieldInput label="Descripción" value={editingCourse.description || ""} onChange={(v) => setEditingCourse(p => ({ ...p, description: v }))} multiline placeholder="Descripción del curso..." />
                                <div className="grid grid-cols-2 gap-4">
                                    <FieldInput label="Categoría" value={editingCourse.category || ""} onChange={(v) => setEditingCourse(p => ({ ...p, category: v }))} placeholder="Bienestar" />
                                    <FieldInput label="Precio (USD)" value={String(editingCourse.price || 0)} onChange={(v) => setEditingCourse(p => ({ ...p, price: parseFloat(v) || 0 }))} type="number" placeholder="0" />
                                </div>
                                <FieldInput label="Thumbnail URL" value={editingCourse.thumbnail || ""} onChange={(v) => setEditingCourse(p => ({ ...p, thumbnail: v }))} placeholder="https://images.unsplash.com/..." />
                                <FieldInput label="Enlace de Pago PayPal (NCP)" value={editingCourse.paypalUrl || ""} onChange={(v) => setEditingCourse(p => ({ ...p, paypalUrl: v }))} placeholder="https://www.paypal.com/ncp/payment/..." />

                                {/* ─── Lessons Section ─── */}
                                <div className="pt-6 border-t border-nutrity-border">
                                    <div className="flex items-center justify-between mb-4">
                                        <div>
                                            <h4 className="text-sm font-bold text-nutrity-gray-text uppercase tracking-widest">Lecciones del Curso</h4>
                                            <p className="text-xs text-nutrity-gray-text/70 mt-1">Añade hasta 12 lecciones con video y descripción.</p>
                                        </div>
                                        <button 
                                            type="button" 
                                            onClick={() => {
                                                const currentLessons = editingCourse.lessons || [];
                                                if (currentLessons.length >= 12) return;
                                                setEditingCourse(p => ({
                                                    ...p,
                                                    lessons: [
                                                        ...currentLessons,
                                                        {
                                                            id: crypto.randomUUID(),
                                                            courseId: p.id || '',
                                                            title: `Lección ${currentLessons.length + 1}`,
                                                            description: '',
                                                            videoUrl: '',
                                                            duration: '10 min',
                                                            order: currentLessons.length,
                                                            isFree: false
                                                        }
                                                    ]
                                                }))
                                            }}
                                            disabled={(editingCourse.lessons?.length || 0) >= 12}
                                            className="flex items-center gap-2 px-3 py-1.5 bg-nutrity-accent/10 text-nutrity-accent text-xs font-bold rounded-lg hover:bg-nutrity-accent hover:text-white transition-colors disabled:opacity-50"
                                        >
                                            <Plus className="w-4 h-4" />
                                            Añadir Lección
                                        </button>
                                    </div>
                                    
                                    <div className="space-y-4">
                                        {(editingCourse.lessons || []).map((lesson, idx) => (
                                            <div key={lesson.id} className="p-4 bg-slate-50 border border-nutrity-border rounded-xl space-y-3 relative group">
                                                <button 
                                                    type="button"
                                                    onClick={() => {
                                                        const newLessons = [...(editingCourse.lessons || [])];
                                                        newLessons.splice(idx, 1);
                                                        setEditingCourse(p => ({ ...p, lessons: newLessons }));
                                                    }}
                                                    className="absolute top-4 right-4 p-1.5 text-red-500 hover:bg-red-50 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                                <div className="flex gap-4">
                                                    <div className="flex-1 space-y-3">
                                                        <div className="flex gap-4">
                                                            <div className="flex-1">
                                                                <label className="text-[10px] font-bold text-nutrity-gray-text uppercase tracking-widest block mb-1.5">Título de la Lección</label>
                                                                <input
                                                                    type="text"
                                                                    value={lesson.title}
                                                                    onChange={(e) => {
                                                                        const newLessons = [...(editingCourse.lessons || [])];
                                                                        newLessons[idx] = { ...lesson, title: e.target.value };
                                                                        setEditingCourse(p => ({ ...p, lessons: newLessons }));
                                                                    }}
                                                                    className="w-full bg-white border border-nutrity-border/50 text-sm p-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-nutrity-primary/20 transition-all"
                                                                    placeholder="Ej: Introducción a la Dieta..."
                                                                    required
                                                                />
                                                            </div>
                                                            <div className="w-32">
                                                                <label className="text-[10px] font-bold text-nutrity-gray-text uppercase tracking-widest block mb-1.5">Duración</label>
                                                                <input
                                                                    type="text"
                                                                    value={lesson.duration}
                                                                    onChange={(e) => {
                                                                        const newLessons = [...(editingCourse.lessons || [])];
                                                                        newLessons[idx] = { ...lesson, duration: e.target.value };
                                                                        setEditingCourse(p => ({ ...p, lessons: newLessons }));
                                                                    }}
                                                                    className="w-full bg-white border border-nutrity-border/50 text-sm p-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-nutrity-primary/20 transition-all"
                                                                    placeholder="10 min"
                                                                />
                                                            </div>
                                                        </div>
                                                        <div>
                                                            <label className="text-[10px] font-bold text-nutrity-gray-text uppercase tracking-widest block mb-1.5">URL del Video (YouTube/Drive)</label>
                                                            <input
                                                                type="url"
                                                                value={lesson.videoUrl}
                                                                onChange={(e) => {
                                                                    const newLessons = [...(editingCourse.lessons || [])];
                                                                    newLessons[idx] = { ...lesson, videoUrl: e.target.value };
                                                                    setEditingCourse(p => ({ ...p, lessons: newLessons }));
                                                                }}
                                                                className="w-full bg-white border border-nutrity-border/50 text-sm p-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-nutrity-primary/20 transition-all"
                                                                placeholder="https://..."
                                                            />
                                                        </div>
                                                        <div>
                                                            <label className="text-[10px] font-bold text-nutrity-gray-text uppercase tracking-widest block mb-1.5">Descripción Breve</label>
                                                            <textarea
                                                                value={lesson.description || ''}
                                                                onChange={(e) => {
                                                                    const newLessons = [...(editingCourse.lessons || [])];
                                                                    newLessons[idx] = { ...lesson, description: e.target.value };
                                                                    setEditingCourse(p => ({ ...p, lessons: newLessons }));
                                                                }}
                                                                className="w-full bg-white border border-nutrity-border/50 text-sm p-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-nutrity-primary/20 transition-all h-20 resize-none"
                                                                placeholder="En esta lección aprenderás..."
                                                            />
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                        {(editingCourse.lessons?.length || 0) === 0 && (
                                            <div className="text-center py-6 border-2 border-dashed border-nutrity-border rounded-xl">
                                                <p className="text-sm text-nutrity-gray-text">Aún no hay lecciones creadas para este curso.</p>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                <button type="submit" disabled={isSaving}
                                    className="w-full mt-4 bg-nutrity-primary text-white py-4 rounded-xl font-bold text-sm uppercase tracking-widest shadow-lg shadow-nutrity-primary/10 hover:bg-nutrity-accent transition-all disabled:opacity-50 flex items-center justify-center gap-3">
                                    {isSaving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
                                    {isSaving ? "Guardando..." : "Guardar Curso"}
                                </button>
                            </form>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
}
