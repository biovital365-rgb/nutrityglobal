"use client";
import { motion, AnimatePresence } from "motion/react";
import { Loader2, Pencil, Trash2, Save, X, PlusCircle } from "lucide-react";
import { FoodItem } from "@/lib/types";
import { getDirectImageUrl } from "@/lib/utils";
import { FieldInput, TagInput, Base64ImageUpload } from "./shared";

// ─── Props ────────────────────────────────────────────────────────────────────
interface AdminFoodsTabProps {
    foods: FoodItem[];
    isSaving: boolean;
    showFoodModal: boolean;
    editingFood: Partial<FoodItem>;
    onEdit: (food: FoodItem) => void;
    onDelete: (id: string, name: string) => void;
    onRestore: (id: string) => void;
    onOpenNew: () => void;
    onCloseModal: () => void;
    onSave: (e: React.FormEvent) => Promise<void>;
    onSync: () => void;
    setEditingFood: React.Dispatch<React.SetStateAction<Partial<FoodItem>>>;
}

// ─── Component ────────────────────────────────────────────────────────────────
export function AdminFoodsTab({
    foods, isSaving, showFoodModal, editingFood,
    onEdit, onDelete, onRestore, onOpenNew, onCloseModal, onSave, onSync, setEditingFood,
}: AdminFoodsTabProps) {
    return (
        <>
            <motion.div key="foods-table" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-4">
                <div className="flex justify-between items-center">
                    <h3 className="text-lg font-display font-bold text-nutrity-primary">Catálogo de Alimentos</h3>
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
                                {foods.map((food) => (
                                    <tr key={food.id} className={`hover:bg-slate-50 transition-colors group ${(food as any).deletedAt ? "opacity-50" : ""}`}>
                                        <td className="py-4 px-6">
                                            <div className="w-12 h-12 rounded-xl overflow-hidden bg-nutrity-bg">
                                                <img src={getDirectImageUrl(food.image)} className="w-full h-full object-cover" alt={food.name} referrerPolicy="no-referrer" />
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
                                                    <button onClick={() => onRestore(food.id)}
                                                        className="px-3 py-1.5 rounded-lg bg-emerald-50 text-emerald-600 text-[10px] font-bold hover:bg-emerald-600 hover:text-white transition-all">
                                                        Restaurar
                                                    </button>
                                                ) : (
                                                    <>
                                                        <button onClick={() => onEdit(food)}
                                                            className="p-2 rounded-lg bg-nutrity-accent/10 text-nutrity-accent hover:bg-nutrity-accent hover:text-white transition-all">
                                                            <Pencil className="w-4 h-4" />
                                                        </button>
                                                        <button onClick={() => onDelete(food.id, food.name)}
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

            {/* ─── Food Modal ─── */}
            <AnimatePresence>
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
                                <button onClick={onCloseModal} className="p-2 rounded-full hover:bg-nutrity-bg"><X className="w-5 h-5 text-nutrity-gray-text" /></button>
                            </div>
                            <form onSubmit={onSave} className="flex-1 overflow-y-auto p-8 space-y-5 scrollbar-hide">
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
                                        <button type="button" onClick={() => setEditingFood(p => ({ ...p, recipes: [...(p.recipes || []), { title: "", image: "", ingredients: [], preparation: [] }] }))}
                                            className="text-[10px] font-bold text-nutrity-accent uppercase tracking-widest flex items-center gap-1 hover:underline">
                                            <PlusCircle className="w-3 h-3" /> Agregar Receta
                                        </button>
                                    </div>
                                    {editingFood.recipes?.map((recipe, rIdx) => (
                                        <div key={rIdx} className="bg-nutrity-bg rounded-xl p-4 space-y-4 border border-nutrity-border">
                                            <div className="flex items-center gap-2">
                                                <input
                                                    type="text" value={recipe.title} placeholder={`Título de la receta ${rIdx + 1}`}
                                                    onChange={(e) => {
                                                        const updated = [...(editingFood.recipes || [])];
                                                        updated[rIdx] = { ...updated[rIdx], title: e.target.value };
                                                        setEditingFood(p => ({ ...p, recipes: updated }));
                                                    }}
                                                    className="flex-1 bg-white border border-nutrity-border rounded-lg px-3 py-2 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-nutrity-accent/10"
                                                />
                                                <button type="button" onClick={() => setEditingFood(p => ({ ...p, recipes: p.recipes?.filter((_, i) => i !== rIdx) }))}
                                                    className="p-1.5 rounded-lg text-red-400 hover:bg-red-50 transition-all"><Trash2 className="w-4 h-4" /></button>
                                            </div>
                                            
                                            <div className="p-3 bg-white rounded-lg border border-nutrity-border">
                                                <Base64ImageUpload
                                                    label="Imagen de la Receta"
                                                    value={recipe.image || ""}
                                                    onChange={(img) => {
                                                        const updated = [...(editingFood.recipes || [])];
                                                        updated[rIdx] = { ...updated[rIdx], image: img };
                                                        setEditingFood(p => ({ ...p, recipes: updated }));
                                                    }}
                                                    placeholder="Sube una foto o pega una URL"
                                                />
                                            </div>

                                            <div className="space-y-4">
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                    <div className="bg-white p-3 rounded-lg border border-nutrity-border">
                                                        <FieldInput label="Ingredientes (uno por línea)" multiline value={(Array.isArray(recipe.ingredients) ? recipe.ingredients : typeof recipe.ingredients === 'string' ? [recipe.ingredients] : []).join('\n')} onChange={(text) => {
                                                            const ingredients = text.split('\n').filter(line => line.trim() !== '');
                                                            const updated = [...(editingFood.recipes || [])];
                                                            updated[rIdx] = { ...updated[rIdx], ingredients };
                                                            setEditingFood(p => ({ ...p, recipes: updated }));
                                                        }} placeholder="1 taza de avena&#10;2 huevos..." />
                                                    </div>
                                                    <div className="bg-white p-3 rounded-lg border border-nutrity-border">
                                                        <FieldInput label="Preparación (uno por línea)" multiline value={(Array.isArray(recipe.preparation) ? recipe.preparation : typeof recipe.preparation === 'string' ? [recipe.preparation] : []).join('\n')} onChange={(text) => {
                                                            const preparation = text.split('\n').filter(line => line.trim() !== '');
                                                            const updated = [...(editingFood.recipes || [])];
                                                            updated[rIdx] = { ...updated[rIdx], preparation };
                                                            setEditingFood(p => ({ ...p, recipes: updated }));
                                                        }} placeholder="Mezclar los ingredientes...&#10;Cocinar a fuego lento..." />
                                                    </div>
                                                </div>
                                                <div className="bg-white p-3 rounded-lg border border-nutrity-border">
                                                    <FieldInput label="Indicaciones Adicionales" multiline value={(Array.isArray(recipe.instructions) ? recipe.instructions : typeof recipe.instructions === 'string' ? [recipe.instructions] : []).join('\n')} onChange={(text) => {
                                                        const instructions = text.split('\n').filter(line => line.trim() !== '');
                                                        const updated = [...(editingFood.recipes || [])];
                                                        updated[rIdx] = { ...updated[rIdx], instructions };
                                                        setEditingFood(p => ({ ...p, recipes: updated }));
                                                    }} placeholder="Se puede guardar en el refrigerador...&#10;Ideal para el desayuno..." />
                                                </div>
                                            </div>
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
            </AnimatePresence>
        </>
    );
}
