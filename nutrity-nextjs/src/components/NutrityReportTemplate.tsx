"use client";
import React from 'react';
import { Activity, CheckCircle2, Droplets, Brain, Zap, Shield, TrendingDown, Target, Leaf, Clock, Heart, Award, BookOpen, Star, AlertCircle } from 'lucide-react';

interface ReportTemplateProps {
    results: any;
}

export function NutrityReportTemplate({ results }: ReportTemplateProps) {
    // 1000px width and 1414px height gives a perfect A4 ratio (1:1.414)
    const pageStyle = "w-[1000px] h-[1414px] bg-[#fbf8f1] text-[#1b3b36] p-20 flex flex-col relative overflow-hidden mb-0 shadow-none";
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
                            <div className="w-20 h-20 bg-[#1b3b36] rounded-[24px] flex items-center justify-center shadow-2xl shadow-[#1b3b36]/30">
                                <Activity className="w-10 h-10 text-white" />
                            </div>
                            <div>
                                <h2 className="text-4xl font-black tracking-tighter text-[#1b3b36]">Nutrity Global</h2>
                                <p className="text-[12px] font-black uppercase tracking-[0.4em] text-[#c19b6c]">Metabolic Artificial Intelligence</p>
                            </div>
                        </div>
                        <div className="text-right">
                            <div className="bg-[hsla(136,19%,29%,0.05)] px-4 py-2 rounded-xl">
                                <p className="text-[10px] font-black uppercase tracking-widest opacity-40">Estatus del Reporte</p>
                                <p className="font-bold text-[#1b3b36]">EJECUTIVO / CONFIDENCIAL</p>
                            </div>
                        </div>
                    </header>

                    <div className="flex-1 flex flex-col justify-center">
                        <div className="space-y-4 mb-12">
                            <div className="w-32 h-2 bg-[#c19b6c]"></div>
                            <span className="text-[16px] font-black uppercase tracking-[0.6em] text-[#c19b6c] block">Plan de Remisión Personalizado</span>
                        </div>

                        <h1 className="text-[85px] font-black leading-[0.85] mb-12 tracking-tighter text-[#1b3b36]">
                            Master <br />
                            Metabólico <br />
                            <span className="text-[#c19b6c]">2026</span>
                        </h1>

                        <div className="h-px bg-[hsla(136,19%,29%,0.1)] w-full mb-8"></div>
                        <div className="bg-[#1b3b36]/5 p-6 rounded-2xl mb-12 border-l-4 border-[#c19b6c]">
                            <p className="text-[12px] font-bold text-[#1b3b36] leading-relaxed">
                                <strong>Tecnología NutrityGlobal AI</strong><br/>
                                Nuestra IA Metabólica procesa tu biometría, contexto emocional (NMG) y hábitos diarios para generar algoritmos de precisión, diseñando tu ruta hacia la remisión metabólica en tiempo real.
                            </p>
                        </div>

                        <div className="grid grid-cols-2 gap-16 max-w-3xl">
                            <div className="space-y-2">
                                <p className="text-[11px] font-black uppercase tracking-[0.2em] opacity-40">Titular del Plan</p>
                                <p className="text-4xl font-black text-[#1b3b36]">{name}</p>
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
                                <Shield className="w-6 h-6 text-[#c19b6c]" />
                                <div className="leading-tight">
                                    <p className="text-[10px] font-black uppercase tracking-widest text-[#1b3b36]">DATA SECURITY PROTOCOL</p>
                                    <p className="text-[9px] opacity-40 font-bold uppercase tracking-widest">AES-256 / HIPAA COMPLIANT SYSTEM</p>
                                </div>
                            </div>
                        </div>
                        <div className="text-right">
                            <p className="text-[10px] font-black uppercase tracking-widest mb-2 opacity-30">Fecha de Certificación</p>
                            <p className="text-2xl font-black text-[#1b3b36]">{new Date().toLocaleString('es-ES', { day: '2-digit', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</p>
                        </div>
                    </footer>
                </div>
            </div>

            {/* PAGE 2: CLINICAL ANALYSIS & PROJECTION */}
            <div id="pdf-page-2" className={pageStyle}>
                <div className="relative z-10 h-full flex flex-col border-[1px] border-[hsla(136,19%,29%,0.1)] p-12">
                    <header className="flex justify-between items-center mb-16 pb-8 border-b border-[hsla(136,19%,29%,0.1)]">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-[#c19b6c1a] rounded-xl flex items-center justify-center">
                                <Brain className="w-7 h-7 text-[#c19b6c]" />
                            </div>
                            <h3 className="text-2xl font-black uppercase tracking-widest text-[#1b3b36]">01. Tu Camino Hacia la Sanación</h3>
                        </div>
                        <div className="bg-[#c19b6c] text-white px-6 py-2 rounded-full font-black text-sm uppercase shadow-md">
                            Potencial de Remisión: {results.remissionScore || 90}%
                        </div>
                    </header>

                    <section className="mb-16">
                        <div className="bg-white p-12 rounded-[50px] border border-[hsla(136,19%,29%,0.05)] shadow-xl relative overflow-hidden flex flex-col items-center text-center">
                            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-1 bg-[hsla(33,40%,58%,0.3)]"></div>
                            <div className="absolute top-0 right-0 w-48 h-48 bg-[hsla(33,40%,58%,0.05)] rounded-bl-[120px]"></div>
                            <div className="flex items-center gap-4 mb-6 relative z-10">
                                <Award className="w-8 h-8 text-[#c19b6c]" />
                                <h4 className="text-2xl font-black text-[#1b3b36]">El Mensaje de tu Cuerpo</h4>
                            </div>
                            <p className="text-xl leading-[1.6] text-[hsla(136,19%,29%,0.9)] font-medium italic tracking-tight relative z-10">
                                "{results.insight || "Tu cuerpo está buscando el equilibrio. Estás en el momento perfecto para iniciar tu sanación profunda."}"
                            </p>
                        </div>
                    </section>

                    <section className="grid grid-cols-2 gap-10 flex-1">
                        <div className="space-y-10">
                            <div>
                                <h5 className="text-[12px] font-black uppercase tracking-[0.4em] text-[#c19b6c] mb-6 flex items-center gap-2"><Target className="w-4 h-4"/> Descubriendo la Raíz</h5>
                                <div className="bg-white p-8 rounded-[40px] border border-[hsla(136,19%,29%,0.05)] shadow-lg space-y-4 mb-4">
                                    <div className="flex justify-between border-b border-[hsla(136,19%,29%,0.05)] pb-3 items-center">
                                        <span className="text-[11px] font-bold uppercase opacity-60">Sistema Biológico</span>
                                        <span className="text-sm font-black text-[#1b3b36] text-right max-w-[180px] leading-tight">{results.nmgDiagnosis?.organ || results.rawAnswers?.healthFocus || "Desequilibrio General"}</span>
                                    </div>
                                    <div className="flex justify-between border-b border-[hsla(136,19%,29%,0.05)] pb-3 items-center">
                                        <span className="text-[11px] font-bold uppercase opacity-60">Tus marcadores</span>
                                        <span className="text-sm font-black text-[#1b3b36]">
                                            {results.rawAnswers?.weight ? `${results.rawAnswers.weight} kg` : "--"} / {results.rawAnswers?.glucose ? `${results.rawAnswers.glucose} mg/dL` : "--"}
                                        </span>
                                    </div>
                                    <div className="flex justify-between border-b border-[hsla(136,19%,29%,0.05)] pb-3 items-center">
                                        <span className="text-[11px] font-bold uppercase opacity-60">Raíz Emocional</span>
                                        <span className="text-[12px] font-black text-[#1b3b36] text-right max-w-[180px] leading-tight">{results.nmgDiagnosis?.conflict || "Estrés Acumulado"}</span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-[11px] font-bold uppercase opacity-60 text-[#c19b6c]">Fase Actual</span>
                                        <span className="text-[12px] font-black text-[#c19b6c] text-right max-w-[180px] leading-tight">{results.nmgDiagnosis?.phase || "Fase de Resolución"}</span>
                                    </div>
                                </div>
                            </div>

                            <div>
                                <h5 className="text-[12px] font-black uppercase tracking-[0.4em] text-[#c19b6c] mb-6 flex items-center gap-2"><Leaf className="w-4 h-4"/> Tus Pilares de Salud</h5>
                                {results.holisticStats && results.holisticStats.length > 0 ? (
                                    <div className="grid grid-cols-2 gap-6 bg-white p-6 rounded-[30px] shadow-sm border border-[#1b3b36]/5">
                                        {results.holisticStats.map((stat: any, index: number) => (
                                            <div key={index} className="space-y-2">
                                                <div className="flex justify-between items-end">
                                                    <span className="text-[10px] font-black uppercase tracking-widest text-[#1b3b36]">{stat.label}</span>
                                                    <span className="text-[10px] font-black text-[#c19b6c]">{stat.value}%</span>
                                                </div>
                                                <div className="h-1.5 bg-[hsla(136,19%,29%,0.05)] rounded-full overflow-hidden">
                                                    <div 
                                                        className={`h-full ${stat.color === 'bg-[#c19b6c]' ? 'bg-[#c19b6c]' : 'bg-[#1b3b36]'}`} 
                                                        style={{ width: `${stat.value}%` }}
                                                    ></div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="bg-[#1b3b36]/5 p-6 rounded-[30px] border border-[#1b3b36]/10">
                                        <p className="text-sm text-[#1b3b36] font-medium leading-relaxed italic">
                                            "La verdadera salud se construye equilibrando tu mente, tus emociones, tu alimentación y tu entorno. Estás dando el primer gran paso."
                                        </p>
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="space-y-8">
                            <h5 className="text-[12px] font-black uppercase tracking-[0.4em] text-[#c19b6c] mb-6 flex items-center gap-2"><Heart className="w-4 h-4"/> Áreas de Intervención</h5>
                            <div className="space-y-4">
                                {results.pillars && results.pillars.length > 0 ? (
                                    results.pillars.map((pillar: any, i: number) => (
                                        <div key={i} className="flex items-center gap-6 p-6 bg-white rounded-[30px] border border-[hsla(136,19%,29%,0.05)] shadow-sm">
                                            <div className={`w-12 h-12 ${pillar.color || 'bg-[#1b3b36]'} rounded-2xl flex items-center justify-center shrink-0`}>
                                                <Activity className="w-6 h-6 text-white" />
                                            </div>
                                            <div>
                                                <h6 className="font-black text-sm uppercase tracking-wider text-[#1b3b36]">{pillar.title}</h6>
                                                <p className="text-[11px] opacity-70 font-medium leading-tight mt-1">{pillar.desc}</p>
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <>
                                        <div className="flex items-center gap-6 p-6 bg-white rounded-[30px] border border-[hsla(136,19%,29%,0.05)] shadow-sm">
                                            <div className="w-12 h-12 bg-[#1b3b36] rounded-2xl flex items-center justify-center shrink-0">
                                                <Activity className="w-6 h-6 text-white" />
                                            </div>
                                            <div>
                                                <h6 className="font-black text-sm uppercase tracking-wider text-[#1b3b36]">Nutrición Integrativa</h6>
                                                <p className="text-[11px] opacity-70 font-medium leading-tight mt-1">Alimentación consciente para restaurar tu balance celular.</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-6 p-6 bg-white rounded-[30px] border border-[hsla(136,19%,29%,0.05)] shadow-sm">
                                            <div className="w-12 h-12 bg-[#c19b6c] rounded-2xl flex items-center justify-center shrink-0">
                                                <Activity className="w-6 h-6 text-white" />
                                            </div>
                                            <div>
                                                <h6 className="font-black text-sm uppercase tracking-wider text-[#1b3b36]">Gestión Emocional</h6>
                                                <p className="text-[11px] opacity-70 font-medium leading-tight mt-1">Liberación de estrés y patrones que afectan tu metabolismo.</p>
                                            </div>
                                        </div>
                                    </>
                                )}
                            </div>
                        </div>
                    </section>

                    <footer className="mt-auto flex justify-between items-center text-[10px] font-black opacity-30 py-8 border-t border-[hsla(136,19%,29%,0.05)]">
                        <span>NUTRITY MASTER CORE | COMPASSIONATE CARE PROTOCOL</span>
                        <span>02 / 04</span>
                    </footer>
                </div>
            </div>

            {/* PAGE 3: DETAILED COACH RECOMMENDATIONS */}
            <div id="pdf-page-3" className={pageStyle}>
                <div className="relative z-10 h-full flex flex-col border-[1px] border-[hsla(136,19%,29%,0.1)] p-12">
                    <header className="flex justify-between items-center mb-16 pb-8 border-b border-[hsla(136,19%,29%,0.1)]">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-[#1b3b36] rounded-xl flex items-center justify-center shadow-lg">
                                <Zap className="w-7 h-7 text-[#c19b6c]" />
                            </div>
                            <h3 className="text-2xl font-black uppercase tracking-widest text-[#1b3b36]">02. Tus Primeros Pasos</h3>
                        </div>
                    </header>

                    <section className="space-y-12">
                        <div className="space-y-6">
                            <h4 className="text-[13px] font-black uppercase tracking-[0.5em] text-[#c19b6c]">Tu Acción Transformadora</h4>
                            <div className="bg-[#1b3b36] text-white p-12 rounded-[50px] shadow-2xl relative overflow-hidden">
                                <div className="absolute top-0 right-0 p-8">
                                    <Heart className="w-16 h-16 text-[#c19b6c] opacity-20" />
                                </div>
                                <h5 className="text-3xl font-black mb-6 leading-tight">Enfócate en: <br /><span className="text-[#c19b6c]">{results.pillars?.[0]?.title || "Tu Bienestar Integral"}</span></h5>
                                <div className="space-y-6 text-xl leading-relaxed font-medium text-white/90 italic relative z-10">
                                    <p>
                                        "{results.pillars?.[0]?.desc || "Cada pequeño cambio que hagas hoy sumará enormemente a tu vitalidad de mañana. Comienza observando tus hábitos con compasión, sin juzgarte."}"
                                    </p>
                                    <p>
                                        "Tu cuerpo es increíblemente sabio. Todo síntoma es un mensaje, no un castigo. Escúchalo y acompáñalo."
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-8">
                            <div className="p-10 rounded-[40px] bg-white border border-[#1b3b36]/10 shadow-xl space-y-6">
                                <div className="flex items-center gap-4 mb-2">
                                    <Clock className="w-7 h-7 text-[#c19b6c]" />
                                    <h5 className="text-xl font-black uppercase tracking-widest text-[#1b3b36]">{results.pillars?.[1]?.title || "Armonía Diaria"}</h5>
                                </div>
                                <p className="text-sm font-medium text-[hsla(136,19%,29%,0.8)] leading-relaxed">
                                    {results.pillars?.[1]?.desc || "Establece horarios regulares para tus comidas y respeta tus horas de descanso. Un cuerpo relajado absorbe mejor los nutrientes y sana más rápido."}
                                </p>
                                {results.biodescodificacionRecommendations && results.biodescodificacionRecommendations.length > 0 && (
                                    <ul className="space-y-3 mt-4 pt-4 border-t border-[#1b3b36]/5">
                                        {results.biodescodificacionRecommendations.slice(0,2).map((rec: string, i: number) => (
                                            <li key={i} className="flex gap-3 text-sm font-bold text-[hsla(136,19%,29%,0.8)] leading-snug">
                                                <div className="w-4 h-4 rounded-full bg-[#c19b6c]/10 flex items-center justify-center shrink-0 mt-0.5">
                                                    <div className="w-1.5 h-1.5 rounded-full bg-[#c19b6c]"></div>
                                                </div>
                                                {rec}
                                            </li>
                                        ))}
                                    </ul>
                                )}
                            </div>

                            <div className="p-10 rounded-[40px] bg-white border border-[#1b3b36]/10 shadow-xl space-y-6">
                                <div className="flex items-center gap-4 mb-2">
                                    <Star className="text-[#c19b6c] w-7 h-7" />
                                    <h5 className="text-xl font-black uppercase tracking-widest text-[#1b3b36]">{results.pillars?.[2]?.title || "Nutrición Consciente"}</h5>
                                </div>
                                <p className="text-sm font-medium text-[hsla(136,19%,29%,0.8)] leading-relaxed">
                                    {results.pillars?.[2]?.desc || "La comida es información para tus células. Elige alimentos naturales, vivos y llenos de color para reducir la inflamación y elevar tu energía."}
                                </p>
                                {results.biodescodificacionRecommendations && results.biodescodificacionRecommendations.length > 2 && (
                                    <ul className="space-y-3 mt-4 pt-4 border-t border-[#1b3b36]/5">
                                        {results.biodescodificacionRecommendations.slice(2,4).map((rec: string, i: number) => (
                                            <li key={i} className="flex gap-3 text-sm font-bold text-[hsla(136,19%,29%,0.8)] leading-snug">
                                                <div className="w-4 h-4 rounded-full bg-[#1b3b36]/10 flex items-center justify-center shrink-0 mt-0.5">
                                                    <div className="w-1.5 h-1.5 rounded-full bg-[#1b3b36]"></div>
                                                </div>
                                                {rec}
                                            </li>
                                        ))}
                                    </ul>
                                )}
                            </div>
                        </div>
                    </section>

                    <footer className="mt-auto flex justify-between items-center text-[10px] font-black opacity-30 py-8 border-t border-[#1b3b36]/5">
                        <span>YOUR HEALING JOURNEY | CONFIDENTIAL</span>
                        <span>03 / 04</span>
                    </footer>
                </div>
            </div>

            {/* PAGE 4: WEEKLY MENU & ALIENADOS */}
            <div id="pdf-page-4" className={pageStyle}>
                <div className="relative z-10 h-full flex flex-col border-[1px] border-[hsla(136,19%,29%,0.1)] p-12">
                    <header className="flex justify-between items-center mb-10 pb-6 border-b border-[hsla(136,19%,29%,0.1)]">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-[#c19b6c1a] rounded-xl flex items-center justify-center">
                                <BookOpen className="w-7 h-7 text-[#c19b6c]" />
                            </div>
                            <h3 className="text-2xl font-black uppercase tracking-widest text-[#1b3b36]">03. Tu Protocolo Nutricional</h3>
                        </div>
                    </header>

                    <div className="flex-1 space-y-8">
                        {/* Superfoods Mini-Cards */}
                        <div className="flex gap-6">
                            {results.superfoods && results.superfoods.length > 0 ? (
                                results.superfoods.slice(0, 2).map((superfood: string, index: number) => (
                                    <div key={index} className="flex-1 bg-white p-4 rounded-3xl border border-[#1b3b36]/5 shadow-sm flex items-center gap-4">
                                        <div className="w-16 h-16 bg-[#fbf8f1] rounded-2xl flex items-center justify-center shrink-0">
                                            <Leaf className="w-8 h-8 text-[#c19b6c]" />
                                        </div>
                                        <div>
                                            <span className="text-[9px] font-black uppercase tracking-[0.2em] text-[#c19b6c]">Súper Alimento Recomendado</span>
                                            <h5 className="text-lg font-black text-[#1b3b36] capitalize leading-tight mt-1">{superfood}</h5>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="flex-1 bg-white p-4 rounded-3xl border border-[#1b3b36]/5 shadow-sm flex items-center gap-4">
                                    <img src="/tarwi_pills_premium_1772251779199.png" className="w-16 h-16 object-cover rounded-2xl" alt="Image"/>
                                    <div>
                                        <span className="text-[9px] font-black uppercase tracking-[0.2em] text-[#c19b6c]">Alimento Base</span>
                                        <h5 className="text-lg font-black text-[#1b3b36] leading-tight mt-1">Tarwi (Chocho)</h5>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Weekly Menu */}
                        <div className="bg-white rounded-[40px] border border-[#1b3b36]/5 shadow-xl p-8 flex-1 flex flex-col">
                            <h4 className="text-[13px] font-black uppercase tracking-[0.5em] text-[#c19b6c] mb-6">Dieta Semanal Metabólica</h4>
                            
                            {results.weeklyMenu ? (
                                <div className="grid grid-cols-2 gap-4 flex-1">
                                    {['lunes', 'martes', 'miercoles', 'jueves', 'viernes', 'sabado', 'domingo'].map((day) => {
                                        const menuData = results.weeklyMenu[day];
                                        if (!menuData) return null;
                                        return (
                                            <div key={day} className="bg-slate-50 p-4 rounded-3xl border border-slate-100 flex flex-col justify-between">
                                                <div className="flex justify-between items-center mb-3">
                                                    <h6 className="text-[12px] font-black uppercase tracking-widest text-[#1b3b36]">{day}</h6>
                                                </div>
                                                <div className="space-y-3">
                                                    <div>
                                                        <span className="text-[9px] font-black uppercase text-[#c19b6c] block mb-0.5">Desayuno</span>
                                                        <p className="text-[11px] font-medium leading-tight text-[#1b3b36]">{menuData.breakfast}</p>
                                                    </div>
                                                    <div>
                                                        <span className="text-[9px] font-black uppercase text-[#c19b6c] block mb-0.5">Almuerzo</span>
                                                        <p className="text-[11px] font-medium leading-tight text-[#1b3b36]">{menuData.lunch}</p>
                                                    </div>
                                                    <div>
                                                        <span className="text-[9px] font-black uppercase text-[#c19b6c] block mb-0.5">Cena</span>
                                                        <p className="text-[11px] font-medium leading-tight text-[#1b3b36]">{menuData.dinner}</p>
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            ) : (
                                <div className="flex-1 flex flex-col items-center justify-center text-center p-10 bg-slate-50 rounded-3xl border border-dashed border-[#1b3b36]/20">
                                    <Activity className="w-12 h-12 text-[#c19b6c] mb-4 opacity-50" />
                                    <h5 className="text-xl font-black text-[#1b3b36] mb-2">Menú Aún No Generado</h5>
                                    <p className="text-sm font-medium text-[hsla(136,19%,29%,0.8)] max-w-sm">
                                        Por favor, dirígete a la pestaña "Menú" en tu Dashboard para que la Inteligencia Artificial genere tu dieta metabólica personalizada.
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>

                    <footer className="mt-auto flex justify-between items-center text-[10px] font-black opacity-30 py-6 border-t border-[#1b3b36]/5">
                        <span>YOUR HEALING JOURNEY | CONFIDENTIAL</span>
                        <span>04 / 05</span>
                    </footer>
                </div>
            </div>

            {/* PAGE 5: RAW ANSWERS (EL DIAGNÓSTICO TEXTUAL) */}
            <div id="pdf-page-5" className={pageStyle}>
                <div className="relative z-10 h-full flex flex-col border-[1px] border-[hsla(136,19%,29%,0.1)] p-12">
                    <header className="flex justify-between items-center mb-12 pb-6 border-b border-[hsla(136,19%,29%,0.1)]">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-[#1b3b36] rounded-xl flex items-center justify-center shadow-lg">
                                <Activity className="w-7 h-7 text-[#c19b6c]" />
                            </div>
                            <h3 className="text-2xl font-black uppercase tracking-widest text-[#1b3b36]">04. Resultados de tu Triaje Holístico</h3>
                        </div>
                    </header>

                    <div className="flex-1">
                        <div className="bg-[#1b3b36] p-10 rounded-[40px] text-white shadow-2xl relative overflow-hidden mb-10">
                            <div className="absolute top-0 right-0 p-10">
                                <Target className="w-16 h-16 text-[#c19b6c] opacity-20" />
                            </div>
                            <h4 className="text-[13px] font-black uppercase tracking-[0.5em] text-[#c19b6c] mb-4 relative z-10">Transparencia Total</h4>
                            <p className="text-xl leading-relaxed font-medium text-white/90 italic relative z-10 max-w-2xl">
                                "La información que proporcionaste es la base de nuestra estrategia. Aquí está el registro exacto de tu estado biológico al momento del diagnóstico."
                            </p>
                        </div>

                        {results.rawAnswers ? (
                            <div className="bg-white rounded-[40px] border border-[#1b3b36]/5 shadow-xl p-10">
                                <div className="grid grid-cols-2 gap-x-12 gap-y-6">
                                    {Object.entries(results.rawAnswers).map(([key, value], idx) => {
                                        // Filtramos campos vacíos o muy técnicos que no aportan visualmente
                                        if (!value || key === 'name' || typeof value === 'object') return null;
                                        
                                        // Diccionario amigable para las keys de rawAnswers
                                        const labels: Record<string, string> = {
                                            age: "Edad",
                                            weight: "Peso (kg)",
                                            height: "Estatura (cm)",
                                            glucose: "Nivel de Glucosa",
                                            healthFocus: "Enfoque de Salud",
                                            condition: "Condición / Patología",
                                            energyLevel: "Nivel de Energía",
                                            stressLevel: "Nivel de Estrés",
                                            sleepQuality: "Calidad de Sueño",
                                            digestiveHealth: "Salud Digestiva",
                                            activityLevel: "Nivel de Actividad",
                                            bloodType: "Tipo de Sangre",
                                            mainSymptom: "Síntoma Principal",
                                            affectedSystem: "Sistema Afectado",
                                            symptomDuration: "Duración del Síntoma",
                                            emotionalContext: "Contexto Emocional Percibido",
                                            biodescodification: "Conocimiento en Biodescodificación"
                                        };
                                        
                                        const label = labels[key] || key;
                                        
                                        return (
                                            <div key={idx} className="border-b border-[#1b3b36]/5 pb-3">
                                                <p className="text-[10px] font-black uppercase tracking-widest text-[#c19b6c] mb-1">{label}</p>
                                                <p className="text-sm font-bold text-[#1b3b36] leading-tight capitalize">{String(value)}</p>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        ) : (
                            <div className="bg-slate-50 p-10 rounded-[40px] border border-dashed border-[#1b3b36]/20 text-center">
                                <p className="text-sm font-medium text-[hsla(136,19%,29%,0.8)]">
                                    No hay datos en el formulario de triaje para mostrar.
                                </p>
                            </div>
                        )}
                    </div>

                    <footer className="mt-auto flex justify-between items-center text-[10px] font-black opacity-30 py-6 border-t border-[#1b3b36]/5">
                        <span>END OF REPORT | BIOVITAL GLOBAL TECHNOLOGIES</span>
                        <span>05 / 05</span>
                    </footer>
                </div>
            </div>

        </div>
    );
}



