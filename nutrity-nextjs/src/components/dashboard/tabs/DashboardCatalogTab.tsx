import { motion } from "framer-motion";
import { Search } from "lucide-react";
import React from "react";
import { getDirectImageUrl } from "@/lib/utils";

export interface DashboardCatalogTabProps {
    results: any;
    foodSearch: string;
    setFoodSearch: React.Dispatch<React.SetStateAction<string>>;
    filteredFoods: any[];
    setSelectedFood: React.Dispatch<React.SetStateAction<any | null>>;
}

export function DashboardCatalogTab({
    results,
    foodSearch,
    setFoodSearch,
    filteredFoods,
    setSelectedFood
}: DashboardCatalogTabProps) {
    return (
        <motion.div key="catalog" initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} className="space-y-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
                <div className="space-y-1">
                    <h2 className="text-3xl font-display font-bold">Catálogo Metabólico</h2>
                    <p className="text-nutrity-gray-text text-sm">Alimentos con grado terapéutico para tu fase de {results.phase}.</p>
                </div>
                <div className="relative w-full md:w-80">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-nutrity-gray-text opacity-40" />
                    <input
                        type="text"
                        placeholder="Buscar superalimento..."
                        value={foodSearch}
                        onChange={(e) => setFoodSearch(e.target.value)}
                        className="w-full bg-white border border-nutrity-border rounded-xl pl-11 pr-5 py-3.5 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-nutrity-accent/10 focus:border-nutrity-accent transition-all shadow-sm"
                    />
                </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {filteredFoods.map((food) => (
                    <div key={food.id} onClick={() => setSelectedFood(food)} className="nutrity-card overflow-hidden group hover:border-nutrity-accent transition-all cursor-pointer">
                        <div className="h-40 relative">
                            <img src={getDirectImageUrl(food.image)} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" alt="Image" referrerPolicy="no-referrer" onError={(e) => { e.currentTarget.src = '/food-placeholder.svg'; }} />
                            <div className="absolute top-3 left-3 px-3 py-1 bg-white/90 backdrop-blur-md rounded-lg text-[8px] font-bold text-nutrity-accent uppercase tracking-widest">{food.category}</div>
                        </div>
                        <div className="p-6">
                            <h3 className="font-bold text-lg mb-1">{food.name}</h3>
                            <p className="text-[10px] text-nutrity-gray-text font-medium mb-4 line-clamp-2">{food.description}</p>
                            <div className="flex flex-wrap gap-1.5 mb-4">
                                {food.metabolicBenefits.slice(0, 2).map((b: any, i: number) => (
                                    <span key={i} className="px-2 py-0.5 bg-nutrity-accent/5 text-nutrity-accent text-[8px] font-bold rounded-md">{b}</span>
                                ))}
                            </div>
                            <div className="pt-4 border-t border-nutrity-border flex justify-between items-center">
                                <div className="flex flex-col">
                                    <span className="text-[8px] font-bold text-nutrity-gray-text uppercase opacity-40">Proteína</span>
                                    <span className="text-xs font-bold">{food.nutrients.protein}</span>
                                </div>
                                <div className="flex flex-col text-right">
                                    <span className="text-[8px] font-bold text-nutrity-gray-text uppercase opacity-40">Fibra</span>
                                    <span className="text-xs font-bold">{food.nutrients.fiber}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </motion.div>
    );
}
