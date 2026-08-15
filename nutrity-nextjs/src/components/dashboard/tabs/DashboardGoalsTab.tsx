import { motion } from "framer-motion";
import { Target, CheckCircle2, PlusCircle } from "lucide-react";
import React from "react";

export interface DashboardGoalsTabProps {
    results: any;
}

export function DashboardGoalsTab({
    results
}: DashboardGoalsTabProps) {
    return (
        <motion.div key="goals" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-8">
            <div className="space-y-1">
                <h2 className="text-3xl font-display font-bold">Metas Metabólicas</h2>
                <p className="text-nutrity-gray-text text-sm">Objetivos clínicos personalizados para tu remisión celular.</p>
            </div>

            <div className="grid md:grid-cols-2 gap-8">
                <div className="nutrity-card p-10 space-y-10">
                    <h3 className="text-xl font-bold border-b border-nutrity-border pb-6 flex items-center gap-3">
                        <Target className="w-6 h-6 text-nutrity-accent" /> Meta Principal
                    </h3>
                    <div className="flex items-center gap-10">
                        <div className="w-32 h-32 rounded-full border-[10px] border-nutrity-accent border-t-nutrity-bg flex items-center justify-center relative shadow-lg shadow-nutrity-accent/10">
                            <span className="text-3xl font-black">{results.remissionScore}%</span>
                        </div>
                        <div className="flex-1 space-y-2">
                            <h4 className="text-2xl font-black text-nutrity-primary leading-tight uppercase tracking-tight">{results.meta}</h4>
                            <p className="text-sm text-nutrity-gray-text font-medium leading-relaxed">Progreso actual basado en tus últimos bio-marcadores y cumplimiento del protocolo.</p>
                        </div>
                    </div>
                </div>

                <div className="nutrity-card p-10 space-y-8">
                    <h3 className="text-xl font-bold border-b border-nutrity-border pb-6">Checklist de Remisión</h3>
                    <div className="space-y-5">
                        {[
                            { label: "Estabilización de Glucosa basal < 100", done: true },
                            { label: "Inducción de flexibilidad metabólica", done: results.remissionScore > 60 },
                            { label: "Reducción de inflamación sistémica", done: results.remissionScore > 40 },
                            { label: "Optimización de salud mitocondrial", done: false }
                        ].map((goal, i) => (
                            <div key={i} className="flex items-center gap-4">
                                <div className={`w-6 h-6 rounded-lg flex items-center justify-center transition-colors ${goal.done ? 'bg-nutrity-success text-white' : 'bg-nutrity-bg border border-nutrity-border'}`}>
                                    {goal.done && <CheckCircle2 className="w-4 h-4" />}
                                </div>
                                <span className={`text-sm font-bold ${goal.done ? 'text-nutrity-primary' : 'text-nutrity-gray-text opacity-50'}`}>{goal.label}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            <div className="nutrity-card p-10 bg-slate-50/50 border-dashed border-2 flex flex-col items-center justify-center text-center py-20">
                <div className="w-20 h-20 rounded-3xl bg-nutrity-accent/10 flex items-center justify-center text-nutrity-accent mb-6">
                    <PlusCircle className="w-10 h-10" />
                </div>
                <h3 className="text-2xl font-bold mb-2">Añadir Meta Personalizada</h3>
                <p className="text-sm text-nutrity-gray-text max-w-sm mb-8">Define objetivos específicos como peso, circunferencia abdominal o niveles de vitalidad.</p>
                <button className="px-8 py-4 bg-nutrity-primary text-white text-xs font-bold uppercase tracking-widest rounded-xl shadow-xl shadow-nutrity-primary/10 hover:bg-nutrity-accent transition-all">Configurar Nueva Meta</button>
            </div>
        </motion.div>
    );
}
