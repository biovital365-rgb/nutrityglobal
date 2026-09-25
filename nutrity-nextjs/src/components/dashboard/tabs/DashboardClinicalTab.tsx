import { motion } from "framer-motion";
import { Brain, Clock, Droplets, PlusCircle, TrendingDown, Zap, FileText, Loader2 } from "lucide-react";
import React, { useState } from "react";
import { generatePatientPDFReport } from "@/actions/db-actions";

export interface DashboardClinicalTabProps {
    measurements: any[];
    setShowMeasureModal: React.Dispatch<React.SetStateAction<boolean>>;
}

export function DashboardClinicalTab({
    measurements,
    setShowMeasureModal
}: DashboardClinicalTabProps) {
    const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);

    const handleGenerateReport = async () => {
        setIsGeneratingPDF(true);
        try {
            const res = await generatePatientPDFReport();
            if (res.success && res.url) {
                window.open(res.url, "_blank");
            } else {
                alert("Error al generar el reporte: " + res.error);
            }
        } catch (error: any) {
            alert("Error de conexión al generar el reporte.");
        } finally {
            setIsGeneratingPDF(false);
        }
    };

    return (
        <motion.div key="measures" initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} className="space-y-8">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                <div className="space-y-1">
                    <h2 className="text-3xl font-display font-bold">Registro de mediciones</h2>
                    <p className="text-nutrity-gray-text text-sm">Consulta la información que registraste para observar cambios y preparar preguntas para tu profesional.</p>
                </div>
                <div className="flex gap-4">
                    <button 
                        onClick={handleGenerateReport} 
                        disabled={isGeneratingPDF}
                        className="bg-white border border-nutrity-border text-nutrity-primary px-6 py-4 rounded-xl font-bold text-xs shadow-sm flex items-center gap-3 active:scale-95 transition-all hover:border-nutrity-accent disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {isGeneratingPDF ? (
                            <Loader2 className="w-5 h-5 animate-spin text-nutrity-accent" />
                        ) : (
                            <FileText className="w-5 h-5 text-nutrity-accent" />
                        )}
                        {isGeneratingPDF ? "Generando..." : "Descargar Reporte PDF"}
                    </button>
                    <button onClick={() => setShowMeasureModal(true)} className="bg-nutrity-accent text-white px-6 py-4 rounded-xl font-bold text-xs shadow-lg shadow-nutrity-accent/20 flex items-center gap-3 active:scale-95 transition-all">
                        <PlusCircle className="w-5 h-5" /> Nueva Medición
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {measurements.slice(0, 3).map((m) => (
                    <div key={m.id} className="nutrity-card p-8 group hover:border-nutrity-accent transition-all relative overflow-hidden">
                        <div className="relative z-10 flex items-start justify-between mb-6">
                            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-transform group-hover:scale-110 ${
                                m.label === 'Vitalidad' ? 'bg-amber-50 text-amber-500' :
                                m.label === 'Metabolismo' ? 'bg-nutrity-accent/10 text-nutrity-accent' :
                                m.label === 'Regeneración' ? 'bg-indigo-50 text-indigo-500' :
                                'bg-blue-50 text-blue-500'
                            }`}>
                                {m.label === 'Vitalidad' ? <Zap className="w-6 h-6" /> :
                                 m.label === 'Metabolismo' ? <Droplets className="w-6 h-6" /> :
                                 m.label === 'Regeneración' ? <Clock className="w-6 h-6" /> :
                                 <Brain className="w-6 h-6" />}
                            </div>
                            <span className="px-3 py-1 bg-nutrity-success/10 text-nutrity-success rounded-full text-[9px] font-bold uppercase tracking-widest">{m.status || "Registrado"}</span>
                        </div>
                        <div className="relative z-10">
                            <h3 className="text-3xl font-display font-bold text-nutrity-primary">{m.value}</h3>
                            <p className="text-[10px] font-bold text-nutrity-gray-text uppercase tracking-widest mt-2">{m.label}</p>
                        </div>
                        <div className="mt-6 flex items-center gap-2 relative z-10 text-nutrity-gray-text">
                            <Clock className="w-3.5 h-3.5 opacity-50" />
                            <span className="text-[10px] font-bold">{m.date} · {m.time}</span>
                        </div>
                    </div>
                ))}
            </div>

            <div className="nutrity-card bg-white overflow-hidden flex flex-col shadow-xl shadow-slate-200/50">
                <div className="p-8 border-b border-nutrity-border flex items-center justify-between">
                    <h3 className="font-display font-bold text-xl">Registro personal</h3>
                    <TrendingDown className="w-6 h-6 text-nutrity-accent opacity-40" />
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="bg-slate-50/50 text-[10px] font-bold uppercase tracking-widest text-nutrity-gray-text/60">
                                <th className="py-5 px-8">Fecha & Hora</th>
                                <th className="py-5 px-8">Medición</th>
                                <th className="py-5 px-8">Valor registrado</th>
                                <th className="py-5 px-8">Estado del registro</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-nutrity-border">
                            {measurements.map((m) => (
                                <tr key={m.id} className="hover:bg-slate-50 transition-colors group">
                                    <td className="py-6 px-8 flex flex-col">
                                        <span className="font-bold text-sm leading-none mb-1 group-hover:text-nutrity-accent transition-colors">{m.date}</span>
                                        <span className="text-[10px] font-bold text-nutrity-gray-text opacity-40 uppercase">{m.time}</span>
                                    </td>
                                    <td className="py-6 px-8 text-sm font-bold text-nutrity-primary">{m.label}</td>
                                    <td className="py-6 px-8 text-lg font-display font-bold text-nutrity-accent">{m.value}</td>
                                    <td className="py-6 px-8">
                                        <span className="px-4 py-1.5 rounded-xl bg-nutrity-bg border border-nutrity-border text-nutrity-primary text-[10px] font-bold uppercase tracking-widest">{m.status}</span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </motion.div>
    );
}
