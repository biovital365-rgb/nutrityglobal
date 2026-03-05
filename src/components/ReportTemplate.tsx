import React from 'react';
import { Sparkles, Heart, Mountain, Badge, Calendar, Gift, Infinity, Calculator, Target, Shield, Zap, Compass, Star } from 'lucide-react';
import { getDetailedInterpretation, getCalculationSteps, getMapSynthesis } from '../lib/interpretations';

interface ReportTemplateProps {
    results: any;
}

export function ReportTemplate({ results }: ReportTemplateProps) {
    const getFullInfo = (pillar: string, num: number) => {
        return getDetailedInterpretation(pillar, num);
    };

    const pageStyle = "w-[210mm] h-[297mm] bg-[#050505] text-white p-16 flex flex-col relative overflow-hidden";

    return (
        <div id="pdf-report-parent" className="bg-[#050505] p-0 m-0">
            {/* PAGE 1: COVER */}
            <div id="pdf-page-cover" className={pageStyle}>
                {/* CSS Based Cosmos Background */}
                <div className="absolute inset-0 overflow-hidden pointer-events-none">
                    <div className="absolute top-[20%] left-[10%] w-[80%] h-[60%] bg-[#7f13ec]/20 rounded-full blur-[120px]"></div>
                    <div className="absolute bottom-[10%] right-[10%] w-[70%] h-[50%] bg-[#ebb305]/10 rounded-full blur-[100px]"></div>
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_transparent_0%,_#050505_100%)]"></div>
                </div>

                <div className="relative z-10 flex flex-col h-full items-center justify-center text-center">
                    <div className="w-32 h-32 mb-10 rounded-[2.5rem] bg-gradient-to-tr from-[#db2777] to-[#ebb305] p-1 shadow-[0_20px_50px_rgba(219,39,119,0.3)]">
                        <div className="w-full h-full rounded-[2.3rem] bg-black flex items-center justify-center">
                            <Sparkles className="w-16 h-16 text-[#ebb305] drop-shadow-[0_0_10px_rgba(235,179,5,0.6)]" />
                        </div>
                    </div>

                    <h1 className="text-6xl font-black tracking-tighter mb-4 text-white">
                        BioVital <span className="text-[#db2777]">365</span>
                    </h1>
                    <div className="w-48 h-1 bg-gradient-to-r from-transparent via-[#ebb305] to-transparent mb-12"></div>

                    <h3 className="text-4xl font-bold text-white mb-2">
                        {results.name}
                    </h3>
                    <p className="text-slate-500 text-lg font-medium tracking-widest uppercase mb-12">
                        Mapa Mandala Numérico
                    </p>

                    <div className="p-4 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md">
                        <p className="text-slate-400 text-sm font-bold uppercase tracking-widest">
                            Nacimiento: {(() => {
                                const [y, m, d] = results.dob.split('-').map(Number);
                                return `${d}/${m}/${y}`;
                            })()}
                        </p>
                    </div>
                </div>

                <div className="absolute bottom-16 left-16 right-16 flex justify-between items-end pt-12 border-t border-white/10">
                    <div className="text-left">
                        <p className="text-slate-500 text-[10px] uppercase tracking-[0.3em] mb-1">Tecnología de Análisis</p>
                        <p className="text-[#ebb305] font-black tracking-widest text-sm">BIOVITAL AI ENGINE v2.5</p>
                    </div>
                    <div className="text-right">
                        <p className="text-slate-500 text-[10px] uppercase tracking-[0.3em] mb-1">Emisión Sagrada</p>
                        <p className="text-white font-bold">{new Date().toLocaleDateString('es-ES', { day: '2-digit', month: 'long', year: 'numeric' })}</p>
                    </div>
                </div>
            </div>

            {/* PILLAR PAGES */}
            {[
                { id: 'pdf-page-esencia', icon: Heart, label: 'Esencia (Alma)', value: results.essence, key: 'esencia', color: '#db2777' },
                { id: 'pdf-page-mision', icon: Mountain, label: 'Misión de Vida', value: results.lifePath, key: 'mision', color: '#ebb305' },
                { id: 'pdf-page-nombre', icon: Badge, label: 'Vibración del Nombre', value: results.nameVibration, key: 'nombre', color: '#06b6d4' },
                { id: 'pdf-page-ano', icon: Calendar, label: 'Año Personal', value: results.personalYear, key: 'ano', color: '#f97316' },
                { id: 'pdf-page-regalo', icon: Gift, label: 'Regalo Divino', value: results.divineGift, key: 'regalo', color: '#84cc16' }
            ].map((pilar) => {
                const info = getFullInfo(pilar.key, pilar.value);
                const calc = getCalculationSteps(pilar.key, results);

                return (
                    <div key={pilar.id} id={pilar.id} className={pageStyle}>
                        <div className="flex justify-between items-start mb-16">
                            <div className="flex items-center gap-4">
                                <div className="p-4 rounded-2xl bg-white/5 border border-white/10 text-slate-400">
                                    <pilar.icon className="w-6 h-6" />
                                </div>
                                <div>
                                    <p className="text-[10px] uppercase tracking-[0.4em] text-slate-500 font-bold">{pilar.label}</p>
                                    <h3 className="text-xl font-bold text-white tracking-tight">Análisis de Vibración</h3>
                                </div>
                            </div>
                            <div className="px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-right">
                                <p className="text-[8px] uppercase tracking-widest text-slate-500 mb-1">Frecuencia</p>
                                <p className="text-2xl font-mono font-bold text-[#ffd700] leading-none">{pilar.value}</p>
                            </div>
                        </div>

                        <div className="relative mb-12">
                            <h4 className="text-5xl font-bold text-white mb-2 leading-tight">
                                {info.subtitle}
                            </h4>
                            <div className="w-full h-px bg-gradient-to-r from-white/20 via-white/5 to-transparent"></div>
                        </div>

                        <div className="grid grid-cols-1 gap-12 mb-12">
                            <section className="space-y-4">
                                <div className="flex items-center gap-2 text-[#ebb305] text-xs font-bold uppercase tracking-widest">
                                    <Zap className="w-4 h-4" /> La Energía del {pilar.value}
                                </div>
                                <p className="text-lg text-slate-300 leading-relaxed font-light first-letter:text-4xl first-letter:font-bold first-letter:mr-2">
                                    {info.desc}
                                </p>
                            </section>

                            <section className="space-y-4 p-8 rounded-3xl bg-gradient-to-br from-white/[0.03] to-transparent border border-white/10">
                                <div className="flex items-center gap-2 text-[#06b6d4] text-xs font-bold uppercase tracking-widest">
                                    <Sparkles className="w-4 h-4" /> Integración Sagrada
                                </div>
                                <p className="text-base text-slate-400 leading-relaxed italic">
                                    "{info.pillarNuance}"
                                </p>
                                <p className="text-sm text-slate-300 font-light mt-4">
                                    {info.essence}
                                </p>
                            </section>
                        </div>

                        {info.challenges && info.challenges.length > 0 && (
                            <section className="mb-12">
                                <div className="flex items-center gap-2 text-red-400/80 text-xs font-bold uppercase tracking-widest mb-6 border-b border-red-950/30 pb-2">
                                    <Shield className="w-4 h-4" /> Desafíos de Integración (Sombra)
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    {info.challenges.map((c: string, i: number) => (
                                        <div key={i} className="flex gap-3 items-start bg-red-500/5 p-4 rounded-xl border border-red-500/10">
                                            <div className="w-1.5 h-1.5 rounded-full bg-red-500/40 mt-1.5 shrink-0" />
                                            <p className="text-sm text-slate-400 font-light">{c}</p>
                                        </div>
                                    ))}
                                </div>
                            </section>
                        )}

                        <div className="mt-auto pt-8 border-t border-white/5 flex justify-between items-end">
                            <div className="text-[10px] space-y-1">
                                <p className="text-slate-500 uppercase tracking-widest">Proceso de Cálculo Sagrado</p>
                                <p className="text-white/40 font-mono tracking-widest">{calc}</p>
                            </div>
                            <Infinity className="w-6 h-6 text-white/10" />
                        </div>
                    </div>
                );
            })}

            {/* PAGE 7: SYNTHESIS */}
            <div id="pdf-page-synthesis" className={pageStyle}>
                <div className="flex items-center gap-4 mb-20">
                    <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-[#db2777] to-[#ebb305] flex items-center justify-center shadow-lg">
                        <Target className="w-8 h-8 text-black" />
                    </div>
                    <div>
                        <h2 className="text-3xl font-black tracking-tight text-white">Síntesis Armónica</h2>
                        <p className="text-slate-500 text-[10px] uppercase tracking-[0.3em] font-bold">Integración de tu Mapa de Destino</p>
                    </div>
                </div>

                <div className="space-y-16 flex-1">
                    <section className="relative">
                        <div className="absolute -left-12 top-0 bottom-0 w-1 bg-gradient-to-b from-[#ebb305] to-transparent"></div>
                        <h4 className="text-[#ebb305] text-xs font-black uppercase tracking-widest mb-6 flex items-center gap-3">
                            <Star className="w-5 h-5 drop-shadow-[0_0_8px_rgba(235,179,5,0.4)]" /> Tu Camino de Maestría
                        </h4>
                        <p className="text-2xl text-slate-200 leading-[1.6] font-light">
                            {getMapSynthesis(results)}
                        </p>
                    </section>

                    <section className="grid grid-cols-1 gap-8 opacity-70">
                        <div className="p-8 rounded-[2rem] border border-white/10 bg-white/[0.02] backdrop-blur-sm">
                            <p className="text-xs text-slate-400 leading-relaxed italic">
                                "La numerología no es destino, sino una herramienta de navegación. Tu voluntad soberana es el capitán de este viaje. Este informe es un espejo de tus potencialidades divinas puestas en la tierra."
                            </p>
                        </div>
                    </section>
                </div>

                <div className="mt-auto flex flex-col items-center gap-6 pt-12 border-t border-white/10">
                    <Sparkles className="text-[#db2777] w-10 h-10 opacity-60 animate-pulse" />
                    <p className="text-slate-500 text-[10px] font-black uppercase tracking-[0.5em]">
                        BioVital 365 • Mandala de Transformación • 2025
                    </p>
                </div>
            </div>
        </div>
    );
}
