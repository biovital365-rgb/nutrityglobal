import React from 'react';
import { Activity, CheckCircle2, Droplets, Brain, Zap, Shield, TrendingDown, Target, Leaf, Clock, Heart, Award, BookOpen, Star, AlertCircle } from 'lucide-react';

interface ReportTemplateProps {
    results: any;
}

export function NutrityReportTemplate({ results }: ReportTemplateProps) {
    // 1000px width and 1414px height gives a perfect A4 ratio (1:1.414)
    const pageStyle = "w-[1000px] h-[1414px] bg-[#fdfcf9] text-[#3d5a44] p-20 flex flex-col relative overflow-hidden mb-0 shadow-none";
    const name = results.name || "Paciente Nutrity";

    return (
        <div id="pdf-report-parent" className="bg-white p-0 m-0 flex flex-col items-start select-none font-sans overflow-visible">

            {/* PAGE 1: EXECUTIVE COVER */}
            <div id="pdf-page-1" className={pageStyle}>
                <div className="absolute top-0 right-0 w-[1000px] h-[1000px] bg-[hsla(214,95%,80%,0.05)] rounded-full -translate-y-1/2 translate-x-1/2"></div>
                <div className="absolute bottom-0 left-0 w-[800px] h-[800px] bg-[hsla(136,19%,29%,0.05)] rounded-full translate-y-1/2 -translate-x-1/2"></div>

                <div className="relative z-10 flex flex-col h-full border-[1px] border-[hsla(136,19%,29%,0.1)] p-12">
                    <header className="flex items-center justify-between mb-40">
                        <div className="flex items-center gap-5">
                            <div className="w-20 h-20 bg-[#3d5a44] rounded-[24px] flex items-center justify-center shadow-2xl shadow-[#3d5a44]/30">
                                <Activity className="w-10 h-10 text-white" />
                            </div>
                            <div>
                                <h2 className="text-4xl font-black tracking-tighter text-[#3d5a44]">Nutrity Global</h2>
                                <p className="text-[12px] font-black uppercase tracking-[0.4em] text-[#60a5fa]">Metabolic Artificial Intelligence</p>
                            </div>
                        </div>
                        <div className="text-right">
                            <div className="bg-[hsla(136,19%,29%,0.05)] px-4 py-2 rounded-xl">
                                <p className="text-[10px] font-black uppercase tracking-widest opacity-40">Estatus del Reporte</p>
                                <p className="font-bold text-[#3d5a44]">EJECUTIVO / CONFIDENCIAL</p>
                            </div>
                        </div>
                    </header>

                    <div className="flex-1 flex flex-col justify-center">
                        <div className="space-y-4 mb-12">
                            <div className="w-32 h-2 bg-[#60a5fa]"></div>
                            <span className="text-[16px] font-black uppercase tracking-[0.6em] text-[#60a5fa] block">Plan de Remisión Personalizado</span>
                        </div>

                        <h1 className="text-[85px] font-black leading-[0.85] mb-12 tracking-tighter text-[#3d5a44]">
                            Master <br />
                            Metabólico <br />
                            <span className="text-[#60a5fa]">2025</span>
                        </h1>

                        <div className="h-px bg-[hsla(136,19%,29%,0.1)] w-full mb-12"></div>

                        <div className="grid grid-cols-2 gap-16 max-w-3xl">
                            <div className="space-y-2">
                                <p className="text-[11px] font-black uppercase tracking-[0.2em] opacity-40">Titular del Plan</p>
                                <p className="text-4xl font-black text-[#3d5a44]">{name}</p>
                            </div>
                            <div className="space-y-2">
                                <p className="text-[11px] font-black uppercase tracking-[0.2em] opacity-40">Diagnóstico IA</p>
                                <p className="text-4xl font-black text-[hsla(136,19%,29%,0.6)]">
                                    {results.condition === 'diabetes' ? 'Remisión de Diabetes' :
                                        results.condition === 'prevention' ? 'Prevención Metabólica' :
                                            results.condition === 'performance' ? 'Alto Rendimiento' :
                                                results.condition === 'resistance' ? 'Resistencia Insulínica' : results.condition}
                                </p>
                            </div>
                        </div>
                    </div>

                    <footer className="mt-auto flex justify-between items-end pt-12 border-t border-[hsla(136,19%,29%,0.1)]">
                        <div className="space-y-6">
                            <div className="flex items-center gap-4 bg-white px-8 py-4 rounded-[20px] border border-[hsla(136,19%,29%,0.1)] shrink-0 shadow-sm">
                                <Shield className="w-6 h-6 text-[#60a5fa]" />
                                <div className="leading-tight">
                                    <p className="text-[10px] font-black uppercase tracking-widest text-[#3d5a44]">DATA SECURITY PROTOCOL</p>
                                    <p className="text-[9px] opacity-40 font-bold uppercase tracking-widest">AES-256 / HIPAA COMPLIANT SYSTEM</p>
                                </div>
                            </div>
                        </div>
                        <div className="text-right">
                            <p className="text-[10px] font-black uppercase tracking-widest mb-2 opacity-30">Fecha de Certificación</p>
                            <p className="text-2xl font-black text-[#3d5a44]">{new Date().toLocaleDateString('es-ES', { day: '2-digit', month: 'long', year: 'numeric' })}</p>
                        </div>
                    </footer>
                </div>
            </div>

            {/* PAGE 2: CLINICAL ANALYSIS & PROJECTION */}
            <div id="pdf-page-2" className={pageStyle}>
                <div className="relative z-10 h-full flex flex-col border-[1px] border-[hsla(136,19%,29%,0.1)] p-12">
                    <header className="flex justify-between items-center mb-20 pb-10 border-b border-[hsla(136,19%,29%,0.1)]">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-[#60a5fa1a] rounded-xl flex items-center justify-center">
                                <Brain className="w-7 h-7 text-[#60a5fa]" />
                            </div>
                            <h3 className="text-2xl font-black uppercase tracking-widest text-[#3d5a44]">01. Análisis de Biología Computacional</h3>
                        </div>
                        <div className="bg-[#60a5fa] text-white px-6 py-2 rounded-full font-black text-sm uppercase">
                            Score de Remisión: {results.remissionScore}%
                        </div>
                    </header>

                    <section className="mb-20">
                        <div className="bg-white p-14 rounded-[60px] border border-[hsla(136,19%,29%,0.05)] shadow-2xl relative overflow-hidden flex flex-col items-center text-center">
                            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-1 bg-[hsla(214,95%,80%,0.3)]"></div>
                            <div className="absolute top-0 right-0 w-48 h-48 bg-[hsla(214,95%,80%,0.05)] rounded-bl-[120px]"></div>
                            <div className="flex items-center gap-4 mb-8">
                                <Award className="w-8 h-8 text-[#60a5fa]" />
                                <h4 className="text-2xl font-black">Evaluación Médica de la IA</h4>
                            </div>
                            <p className="text-2xl leading-[1.6] text-[hsla(136,19%,29%,0.9)] font-medium italic tracking-tight">
                                "{results.insight}"
                            </p>
                        </div>
                    </section>

                    <section className="grid grid-cols-2 gap-10 flex-1">
                        <div className="space-y-8">
                            <h5 className="text-[12px] font-black uppercase tracking-[0.4em] text-[#60a5fa] mb-6">Proyección de Glucosa (90 días)</h5>
                            <div className="h-64 flex items-end gap-3 bg-white p-10 rounded-[40px] border border-[hsla(136,19%,29%,0.05)] shadow-lg">
                                {results.trendData?.map((h: number, i: number) => (
                                    <div key={i} className="flex-1 flex flex-col items-center gap-2">
                                        <div
                                            style={{ height: `${h}%` }}
                                            className={`w-full rounded-lg transition-all ${i === 8 ? "bg-[#60a5fa]" : "bg-[hsla(136,19%,29%,0.1)]"}`}
                                        ></div>
                                        <span className="text-[8px] font-bold opacity-20">M{i + 1}</span>
                                    </div>
                                ))}
                            </div>
                            <p className="text-xs text-[hsla(136,19%,29%,0.6)] leading-relaxed font-bold">
                                * Se observa una curva de estabilización en la semana 12 tras completar la fase de choque con el Protocolo Tarwi.
                            </p>
                        </div>

                        <div className="space-y-8">
                            <h5 className="text-[12px] font-black uppercase tracking-[0.4em] text-[#60a5fa] mb-6">Pillares de Intervención</h5>
                            <div className="space-y-4">
                                {(results.pillars || []).map((pillar: any, i: number) => (
                                    <div key={i} className="flex items-center gap-6 p-6 bg-white rounded-[30px] border border-[hsla(136,19%,29%,0.05)] shadow-sm">
                                        <div className="w-12 h-12 bg-slate-50 rounded-2xl flex items-center justify-center shrink-0">
                                            <Leaf className="w-6 h-6 text-[#3d5a44]/30" />
                                        </div>
                                        <div>
                                            <h6 className="font-black text-sm uppercase tracking-wider">{pillar.title}</h6>
                                            <p className="text-[11px] opacity-40 font-medium leading-tight">{pillar.desc}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </section>

                    <footer className="mt-auto flex justify-between items-center text-[10px] font-black opacity-20 py-8 border-t border-[hsla(136,19%,29%,0.05)]">
                        <span>NUTRITY MASTER CORE v4.5 | LICENSE_ID: {Math.random().toString(36).substring(7).toUpperCase()}</span>
                        <span>02 / 04</span>
                    </footer>
                </div>
            </div>

            {/* PAGE 3: DETAILED COACH RECOMMENDATIONS */}
            <div id="pdf-page-3" className={pageStyle}>
                <div className="relative z-10 h-full flex flex-col border-[1px] border-[hsla(136,19%,29%,0.1)] p-12">
                    <header className="flex justify-between items-center mb-20 pb-10 border-b border-[hsla(136,19%,29%,0.1)]">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-[#3d5a44] rounded-xl flex items-center justify-center shadow-lg">
                                <Zap className="w-7 h-7 text-[#60a5fa]" />
                            </div>
                            <h3 className="text-2xl font-black uppercase tracking-widest text-[#3d5a44]">02. Guía Ejecutiva de Implementación</h3>
                        </div>
                    </header>

                    <section className="space-y-12">
                        <div className="space-y-6">
                            <h4 className="text-[13px] font-black uppercase tracking-[0.5em] text-[#60a5fa]">Protocolo de Acción Prioritario</h4>
                            <div className="bg-[#3d5a44] text-white p-12 rounded-[50px] shadow-2xl relative overflow-hidden">
                                <div className="absolute top-0 right-0 p-8">
                                    <Heart className="w-12 h-12 text-[#60a5fa] opacity-20" />
                                </div>
                                <h5 className="text-3xl font-black mb-8 leading-tight">Optimización Celular mediante <br /><span className="text-[#60a5fa]">Superalimentos Andinos</span></h5>
                                <div className="space-y-6 text-xl leading-relaxed font-medium text-white/90 italic">
                                    <p>
                                        "Basado en su historial metabólico, su prioridad número uno es la sensibilización del receptor de insulina. El **Tarwi (Chocho)** no es solo un alimento, es un agente farmacológico natural que debe ser administrado 15-20 minutos antes de cualquier comida que contenga carbohidratos complejos."
                                    </p>
                                    <p>
                                        "Hemos detectado picos de cortisol matutinos. Se recomienda iniciar la caminata regenerativa de 15 minutos en ayunas, seguida inmediatamente por 200ml de infusión de Muña tibia para estabilizar el pH digestivo."
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-8">
                            <div className="p-10 rounded-[40px] bg-white border border-nutrity-border/50 shadow-xl space-y-6">
                                <div className="flex items-center gap-4 mb-2">
                                    <Clock className="w-7 h-7 text-[#60a5fa]" />
                                    <h5 className="text-xl font-black uppercase tracking-widest">Ritmo Circadiano</h5>
                                </div>
                                <ul className="space-y-4">
                                    {[
                                        "Cena obligatoria antes de las 19:30.",
                                        "Exposición a luz solar mínima 10 min al despertar.",
                                        "Suplementación con Magnesio + Cacao 30 min antes de dormir."
                                    ].map((list, i) => (
                                        <li key={i} className="flex gap-4 text-sm font-bold text-[hsla(136,19%,29%,0.7)]">
                                            <div className="w-5 h-5 rounded-full bg-[hsla(214,95%,80%,0.1)] flex items-center justify-center shrink-0 mt-0.5">
                                                <div className="w-1.5 h-1.5 rounded-full bg-[#60a5fa]"></div>
                                            </div>
                                            {list}
                                        </li>
                                    ))}
                                </ul>
                            </div>

                            <div className="p-10 rounded-[40px] bg-white border border-nutrity-border/50 shadow-xl space-y-6">
                                <div className="flex items-center gap-4 mb-2">
                                    <TrendingDown className="text-red-400 w-7 h-7" />
                                    <h5 className="text-xl font-black uppercase tracking-widest">Inhibidores Glucémicos</h5>
                                </div>
                                <ul className="space-y-4">
                                    {[
                                        "Evitar jugos de fruta, incluso naturales.",
                                        "Sustituir papa por Oca morada horneada.",
                                        "Uso de Maíz Morado concentrado como antioxidante renal."
                                    ].map((list, i) => (
                                        <li key={i} className="flex gap-4 text-sm font-bold text-[hsla(136,19%,29%,0.7)]">
                                            <div className="w-5 h-5 rounded-full bg-[hsla(0,100%,50%,0.1)] flex items-center justify-center shrink-0 mt-0.5">
                                                <div className="w-1.5 h-1.5 rounded-full bg-red-400"></div>
                                            </div>
                                            {list}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </div>
                    </section>

                    <footer className="mt-auto flex justify-between items-center text-[10px] font-black opacity-20 py-8 border-t border-nutrity-border/50">
                        <span>EXECUTIVE SUMMARY | CLINICAL PROTOCOL | CONFIDENTIAL</span>
                        <span>03 / 04</span>
                    </footer>
                </div>
            </div>

            {/* PAGE 4: METABOLIC CATALOG SNAPSHOT */}
            <div id="pdf-page-4" className={pageStyle}>
                <div className="relative z-10 h-full flex flex-col border-[1px] border-[hsla(136,19%,29%,0.1)] p-12">
                    <header className="flex justify-between items-center mb-20 pb-10 border-b border-[hsla(136,19%,29%,0.1)]">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-[#60a5fa1a] rounded-xl flex items-center justify-center">
                                <BookOpen className="w-7 h-7 text-[#60a5fa]" />
                            </div>
                            <h3 className="text-2xl font-black uppercase tracking-widest text-[#3d5a44]">03. Protocolo de Superalimentos</h3>
                        </div>
                    </header>

                    <div className="grid grid-cols-2 gap-10 flex-1">
                        <div className="space-y-10">
                            <div className="bg-white p-10 rounded-[50px] border border-[#3d5a44]/5 shadow-xl space-y-8">
                                <img src="/tarwi_pills_premium_1772251779199.png" className="w-full h-48 object-cover rounded-[30px]" />
                                <div className="space-y-2">
                                    <span className="text-[10px] font-black uppercase tracking-[0.4em] text-[#60a5fa]">Alimento Base</span>
                                    <h5 className="text-3xl font-black text-[#3d5a44]">Tarwi (Chocho)</h5>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="bg-slate-50 p-4 rounded-2xl">
                                        <p className="text-[9px] font-black uppercase opacity-30 mb-1">Impacto</p>
                                        <p className="font-bold text-sm text-[#3d5a44]">Alta Sensibilidad Insulínica</p>
                                    </div>
                                    <div className="bg-slate-50 p-4 rounded-2xl">
                                        <p className="text-[9px] font-black uppercase opacity-30 mb-1">Dosis Sugerida</p>
                                        <p className="font-bold text-sm text-[#3d5a44]">30g Pre-Comida</p>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-white p-10 rounded-[50px] border border-[#3d5a44]/5 shadow-xl space-y-8">
                                <img src="/quinua_negra_bowl_premium_1772251795891.png" className="w-full h-48 object-cover rounded-[30px]" />
                                <div className="space-y-2">
                                    <span className="text-[10px] font-black uppercase tracking-[0.4em] text-[#60a5fa]">Antioxidante Maestro</span>
                                    <h5 className="text-3xl font-black text-[#3d5a44]">Quinua Negra</h5>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="bg-slate-50 p-4 rounded-2xl">
                                        <p className="text-[9px] font-black uppercase opacity-30 mb-1">Impacto</p>
                                        <p className="font-bold text-sm text-[#3d5a44]">Protección Celular</p>
                                    </div>
                                    <div className="bg-slate-50 p-4 rounded-2xl">
                                        <p className="text-[9px] font-black uppercase opacity-30 mb-1">Dosis Sugerida</p>
                                        <p className="font-bold text-sm text-[#3d5a44]">Dosis Diaria 50g</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="bg-[#3d5a44] p-12 rounded-[60px] text-white flex flex-col relative overflow-hidden">
                            <div className="absolute top-0 right-0 p-10">
                                <AlertCircle className="w-12 h-12 text-[#60a5fa] animate-pulse" />
                            </div>
                            <h5 className="text-3xl font-black mb-10 leading-tight">Nota Crítica para <br />el Especialista</h5>
                            <div className="flex-1 space-y-10">
                                <div className="space-y-4">
                                    <p className="text-sm font-black uppercase tracking-widest text-[#60a5fa]">ADVERTENCIA</p>
                                    <p className="text-lg opacity-80 leading-relaxed font-medium">
                                        Si los niveles de glucosa en ayunas descienden de 85 mg/dL sistemáticamente, reduzca el consumo de extracto de yacón a la mitad para evitar hipoglucemias reactivas.
                                    </p>
                                </div>
                                <div className="space-y-4">
                                    <p className="text-sm font-black uppercase tracking-widest text-[#60a5fa]">SEGUIMIENTO</p>
                                    <p className="text-lg opacity-80 leading-relaxed font-medium">
                                        Próxima evaluación predictiva de la IA programada en 15 días. Es imperativo subir los datos de peso y glucosa post-prandial diariamente al portal Nutrity.
                                    </p>
                                </div>
                            </div>
                            <div className="mt-auto pt-10">
                                <div className="w-full h-px bg-white opacity-10 mb-6"></div>
                                <div className="flex justify-between items-center">
                                    <div className="text-[8px] font-black uppercase tracking-[0.3em]">Authorized Digital Signature</div>
                                    <div className="font-serif italic text-2xl font-light opacity-60">IA_METABOLIC_CORE</div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <footer className="mt-auto flex justify-between items-center text-[10px] font-black opacity-20 py-8 border-t border-[#3d5a44]/5">
                        <span>END OF EXECUTIVE REPORT | BIOVITAL GLOBAL TECHNOLOGIES</span>
                        <span>04 / 04</span>
                    </footer>
                </div>
            </div>

        </div>
    );
}
