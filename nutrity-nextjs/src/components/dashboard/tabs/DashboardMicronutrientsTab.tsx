import { motion } from "framer-motion";
import { Search, Zap, Info } from "lucide-react";
import React from "react";
import { getDirectImageUrl } from "@/lib/utils";

export interface DashboardMicronutrientsTabProps {
    microSearch: string;
    setMicroSearch: React.Dispatch<React.SetStateAction<string>>;
    filteredMicros: any[];
    setSelectedMicro: React.Dispatch<React.SetStateAction<any | null>>;
}

export function DashboardMicronutrientsTab({
    microSearch,
    setMicroSearch,
    filteredMicros,
    setSelectedMicro
}: DashboardMicronutrientsTabProps) {
    return (
        <motion.div key="micronutrients" initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }}>
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
                <div className="space-y-1">
                    <h2 className="text-3xl font-display font-bold">Micronutrientes Críticos</h2>
                    <p className="text-nutrity-gray-text text-sm">Cofactores esenciales para tu regeneración celular de precisión.</p>
                </div>
                <div className="relative w-full md:w-80">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-nutrity-gray-text opacity-40" />
                    <input
                        type="text"
                        placeholder="Buscar micronutriente..."
                        value={microSearch}
                        onChange={(e) => setMicroSearch(e.target.value)}
                        className="w-full bg-white border border-nutrity-border rounded-xl pl-11 pr-5 py-3.5 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-nutrity-accent/10 focus:border-nutrity-accent transition-all shadow-sm"
                    />
                </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredMicros.map((micro) => (
                    <div key={micro.id} onClick={() => setSelectedMicro(micro)} className="nutrity-card p-8 hover:border-nutrity-accent transition-all group relative overflow-hidden cursor-pointer">
                        <div className="flex items-center justify-between mb-6">
                            <div className="w-12 h-12 rounded-xl bg-nutrity-accent/10 flex items-center justify-center text-nutrity-accent group-hover:scale-110 transition-transform overflow-hidden">
                                {micro.image ? (
                                    <img src={getDirectImageUrl(micro.image)} alt={micro.name} className="w-full h-full object-cover" referrerPolicy="no-referrer" onError={(e) => { e.currentTarget.src = '/food-placeholder.svg'; }} />
                                ) : (
                                    <Zap className="w-7 h-7" />
                                )}
                            </div>
                            <span className="px-3 py-1 bg-nutrity-bg border border-nutrity-border rounded-full text-[9px] font-bold text-nutrity-primary uppercase tracking-widest">{micro.category}</span>
                        </div>
                        <h3 className="text-2xl font-bold mb-2">{micro.name}</h3>
                        <p className="text-xs text-nutrity-gray-text font-medium leading-relaxed mb-6">{micro.function}</p>
                        <div className="space-y-4">
                            <div className="flex flex-col gap-1.5">
                                <span className="text-[9px] font-bold text-nutrity-gray-text uppercase tracking-widest opacity-50">Fuentes Bioavales</span>
                                <div className="flex flex-wrap gap-2">
                                    {(micro.sources || []).map((s: any, i: number) => (
                                        <span key={i} className="px-2 py-0.5 bg-nutrity-bg text-[10px] font-bold text-nutrity-primary rounded-md">{s}</span>
                                    ))}
                                </div>
                            </div>
                            <div className="flex flex-col gap-1.5">
                                <span className="text-[9px] font-bold text-nutrity-gray-text uppercase tracking-widest opacity-50">Señal de Deficiencia</span>
                                <div className="flex items-center gap-2">
                                    <Info className="w-3 h-3 text-rose-500" />
                                    <span className="text-xs font-bold text-rose-500">{micro.deficiencySigns[0]}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </motion.div>
    );
}
