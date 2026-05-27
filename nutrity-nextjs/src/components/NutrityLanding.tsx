"use client";
import { motion } from "motion/react";
import {
    Activity,
    Shield,
    ChevronRight,
    Leaf,
    Heart,
    Brain,
    Moon,
    Flame,
    ArrowRight,
    CheckCircle2
} from "lucide-react";

interface NutrityLandingProps {
    user?: any;
    onStart: () => void;
    onAuthClick: () => void;
}

export function NutrityLanding({ user, onStart, onAuthClick }: NutrityLandingProps) {
    return (
        <div className="flex flex-col min-h-screen w-full bg-[#fbf8f1] text-[#2d3748] overflow-x-hidden selection:bg-[#c19b6c] selection:text-white">
            {/* Premium Navigation */}
            <header className="fixed top-0 left-0 right-0 z-50 backdrop-blur-md bg-[#fbf8f1]/80 border-b border-[#c19b6c]/20 transition-all duration-300">
                <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-[#012a4a] rounded-xl flex items-center justify-center shadow-lg shadow-[#012a4a]/20">
                            <Leaf className="w-5 h-5 text-[#c19b6c]" />
                        </div>
                        <div>
                            <h2 className="text-xl font-display font-bold leading-none text-[#012a4a]">BioVital.360</h2>
                            <span className="text-[9px] font-bold text-[#c19b6c] uppercase tracking-[0.25em]">MRGA</span>
                        </div>
                    </div>
                    <nav className="hidden md:flex items-center gap-10">
                        <a href="#pilares" className="text-sm font-semibold text-[#1b3b36] hover:text-[#c19b6c] transition-colors">Pilares</a>
                        <a href="#ciencia" className="text-sm font-semibold text-[#1b3b36] hover:text-[#c19b6c] transition-colors">Ciencia</a>
                        <a href="/blog" className="text-sm font-semibold text-[#1b3b36] hover:text-[#c19b6c] transition-colors">Blog</a>
                        <button
                            onClick={onAuthClick}
                            className="bg-[#012a4a] text-[#fbf8f1] px-6 py-2.5 rounded-xl text-sm font-bold shadow-lg hover:bg-[#1b3b36] transition-all active:scale-95 border border-[#012a4a]"
                        >
                            Acceso Pacientes
                        </button>
                    </nav>
                </div>
            </header>

            <main>
                {/* Hero Section */}
                <section className="relative min-h-[90vh] pt-24 pb-20 px-6 flex items-center overflow-hidden">
                    {/* Background Image with Overlay */}
                    <div className="absolute inset-0 z-0">
                        <img 
                            src="https://images.unsplash.com/photo-1506126613408-eca07ce68773?auto=format&fit=crop&q=80" 
                            alt="Amanecer en las montañas" 
                            className="w-full h-full object-cover object-top"
                        />
                        <div className="absolute inset-0 bg-gradient-to-r from-[#fbf8f1] via-[#fbf8f1]/90 to-transparent md:to-[#fbf8f1]/30"></div>
                        <div className="absolute inset-0 bg-gradient-to-t from-[#fbf8f1] via-transparent to-transparent"></div>
                    </div>

                    <div className="max-w-7xl mx-auto w-full relative z-10 grid md:grid-cols-2 gap-12">
                        <motion.div
                            initial={{ opacity: 0, y: 30 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 1 }}
                            className="flex flex-col justify-center"
                        >
                            <div className="inline-flex items-center gap-3 mb-6">
                                <span className="w-12 h-[1px] bg-[#c19b6c]"></span>
                                <span className="text-xs font-bold text-[#c19b6c] uppercase tracking-[0.3em]">Guía Práctica Basada en Evidencia</span>
                            </div>

                            <h1 className="text-5xl md:text-7xl font-serif font-bold leading-[1.05] tracking-tight mb-6 text-[#012a4a]">
                                REMISIÓN <br /> METABÓLICA
                            </h1>
                            <h2 className="text-xl md:text-2xl font-bold tracking-widest text-[#1b3b36] mb-8 uppercase">
                                De la Diabetes Tipo 2
                            </h2>

                            <div className="flex items-center gap-4 mb-10">
                                <div className="w-2 h-2 rounded-full bg-[#c19b6c]"></div>
                                <p className="text-lg md:text-xl text-[#2d3748] italic font-serif">
                                    Recuperando tu salud metabólica <br className="hidden md:block" /> con ciencia, hábitos y esperanza
                                </p>
                            </div>

                            <div className="flex flex-col sm:flex-row gap-4 mb-12">
                                <button
                                    onClick={onStart}
                                    className="bg-[#1b3b36] text-[#fbf8f1] px-8 py-4 rounded-xl font-bold text-lg flex items-center justify-center gap-3 shadow-xl hover:bg-[#012a4a] hover:scale-[1.02] transition-all border border-[#1b3b36]"
                                >
                                    Comenzar mi Transformación
                                    <ChevronRight className="w-5 h-5" />
                                </button>
                            </div>
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ duration: 1.2, delay: 0.3 }}
                            className="relative hidden md:flex items-center justify-center"
                        >
                            {/* Rotating Golden Seal */}
                            <div className="relative w-48 h-48 rounded-full border border-[#c19b6c] flex items-center justify-center bg-[#fbf8f1]/80 backdrop-blur-sm shadow-2xl p-4">
                                <div className="absolute inset-2 border border-[#c19b6c]/40 rounded-full animate-[spin_20s_linear_infinite]"></div>
                                <div className="text-center">
                                    <Heart className="w-6 h-6 text-[#c19b6c] mx-auto mb-2" />
                                    <p className="text-[9px] font-bold uppercase tracking-widest text-[#012a4a] leading-tight">
                                        La ciencia <br /> confirma. <br /> Tu compromiso <br /> transforma.
                                    </p>
                                    <Leaf className="w-4 h-4 text-[#c19b6c] mx-auto mt-2" />
                                </div>
                            </div>
                        </motion.div>
                    </div>
                </section>

                {/* Pilares Section */}
                <section id="pilares" className="py-24 bg-[#012a4a] text-[#fbf8f1] relative border-y-8 border-[#c19b6c]">
                    <div className="max-w-7xl mx-auto px-6">
                        <div className="text-center mb-16">
                            <Leaf className="w-8 h-8 text-[#c19b6c] mx-auto mb-4" />
                            <h2 className="text-3xl md:text-5xl font-serif font-bold mb-4">Los 5 Pilares Metabólicos</h2>
                            <p className="text-[#e6d3a8] font-medium max-w-2xl mx-auto">Pequeños cambios diarios generan grandes resultados metabólicos a largo plazo.</p>
                        </div>

                        <div className="grid grid-cols-2 md:grid-cols-5 gap-6">
                            {[
                                { icon: Flame, title: "Alimentación Inteligente", delay: 0.1 },
                                { icon: Activity, title: "Movimiento con Propósito", delay: 0.2 },
                                { icon: Moon, title: "Descanso y Recuperación", delay: 0.3 },
                                { icon: Brain, title: "Mente y Bienestar", delay: 0.4 },
                                { icon: Shield, title: "Ciencia, Salud y Esperanza", delay: 0.5 }
                            ].map((pilar, idx) => (
                                <motion.div 
                                    key={idx}
                                    initial={{ opacity: 0, y: 20 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    viewport={{ once: true }}
                                    transition={{ duration: 0.5, delay: pilar.delay }}
                                    className="group flex flex-col items-center text-center p-6 bg-[#1b3b36]/50 rounded-2xl border border-[#c19b6c]/20 hover:bg-[#1b3b36] hover:border-[#c19b6c] transition-all cursor-pointer"
                                >
                                    <pilar.icon className="w-10 h-10 text-[#c19b6c] mb-4 group-hover:scale-110 transition-transform" />
                                    <h3 className="text-sm font-bold uppercase tracking-wide leading-snug">{pilar.title}</h3>
                                </motion.div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* Ciencia / Doble Ciclo Section */}
                <section id="ciencia" className="py-24 bg-[#fbf8f1] relative">
                    <div className="max-w-7xl mx-auto px-6">
                        <div className="grid lg:grid-cols-2 gap-16 items-center">
                            <motion.div
                                initial={{ opacity: 0, x: -30 }}
                                whileInView={{ opacity: 1, x: 0 }}
                                viewport={{ once: true }}
                            >
                                <div className="inline-flex items-center gap-3 mb-6">
                                    <span className="text-4xl font-serif text-[#c19b6c]">03</span>
                                    <div className="h-10 w-[2px] bg-[#c19b6c]"></div>
                                    <span className="text-sm font-bold text-[#1b3b36] uppercase tracking-widest">El Cuerpo Puede Cambiar</span>
                                </div>
                                <h2 className="text-4xl md:text-5xl font-serif font-bold text-[#012a4a] mb-6 leading-tight">
                                    La Ciencia Detrás de la Recuperación Metabólica
                                </h2>
                                <p className="text-lg text-[#2d3748] mb-8 font-medium">
                                    Tu metabolismo tiene memoria, <span className="italic font-serif text-[#c19b6c]">pero también capacidad de transformación.</span>
                                </p>
                                <p className="text-[#2d3748]/80 mb-8 leading-relaxed">
                                    La investigación ha demostrado que el exceso de energía y la inflamación metabólica crean un círculo vicioso entre el hígado y el páncreas. La buena noticia es que, con los estímulos correctos, <strong>podemos romper y revertir ese ciclo.</strong>
                                </p>

                                <div className="space-y-4">
                                    {[
                                        "No es suerte, es biología y adaptación.",
                                        "El conocimiento te da claridad, enfoque y confianza.",
                                        "Cada elección diaria envía señales a tu cuerpo."
                                    ].map((item, i) => (
                                        <div key={i} className="flex items-start gap-3">
                                            <CheckCircle2 className="w-5 h-5 text-[#c19b6c] shrink-0 mt-0.5" />
                                            <span className="text-sm font-bold text-[#1b3b36]">{item}</span>
                                        </div>
                                    ))}
                                </div>
                            </motion.div>

                            <motion.div
                                initial={{ opacity: 0, scale: 0.95 }}
                                whileInView={{ opacity: 1, scale: 1 }}
                                viewport={{ once: true }}
                                className="bg-white p-8 md:p-10 rounded-[2rem] shadow-2xl border border-[#c19b6c]/20 relative overflow-hidden"
                            >
                                <div className="absolute top-0 right-0 w-32 h-32 bg-[#c19b6c]/5 rounded-bl-full"></div>
                                <h3 className="text-xl font-serif font-bold text-[#1b3b36] mb-8 text-center border-b border-[#c19b6c]/20 pb-4">
                                    Del Desequilibrio a la Recuperación
                                </h3>
                                
                                <div className="space-y-6">
                                    {[
                                        { bad: "Hígado graso e inflamado", good: "Menos grasa hepática y más sensible" },
                                        { bad: "Páncreas sobrecargado", good: "Mejor función de células beta" },
                                        { bad: "Glucosa alta y variables", good: "Glucosa estable y en rangos sanos" }
                                    ].map((row, i) => (
                                        <div key={i} className="flex items-center justify-between gap-4">
                                            <div className="flex-1 bg-[#1b3b36]/5 p-4 rounded-xl text-center border border-[#1b3b36]/10">
                                                <span className="text-xs font-bold text-[#2d3748]">{row.bad}</span>
                                            </div>
                                            <ArrowRight className="w-5 h-5 text-[#c19b6c] shrink-0" />
                                            <div className="flex-1 bg-[#c19b6c]/10 p-4 rounded-xl text-center border border-[#c19b6c]/30">
                                                <span className="text-xs font-bold text-[#1b3b36]">{row.good}</span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </motion.div>
                        </div>
                    </div>
                </section>

                {/* Final CTA */}
                <section className="py-24 px-6 bg-[#1b3b36] text-[#fbf8f1] text-center border-t-8 border-[#c19b6c]">
                    <div className="max-w-2xl mx-auto">
                        <Leaf className="w-12 h-12 text-[#c19b6c] mx-auto mb-6" />
                        <h2 className="text-4xl md:text-5xl font-serif font-bold mb-6">Tu salud. Tu decisión. Tu transformación.</h2>
                        <p className="text-lg text-[#e6d3a8] mb-10 font-medium">
                            No se trata de ser perfecto, sino de ser constante. Los pequeños cambios sostenidos tienen un poder transformador.
                        </p>
                        <button
                            onClick={onStart}
                            className="bg-[#c19b6c] text-[#012a4a] px-10 py-4 rounded-xl font-bold text-lg shadow-xl shadow-[#c19b6c]/20 hover:scale-105 transition-all"
                        >
                            Comenzar mi Transformación
                        </button>
                    </div>
                </section>
            </main>

            <footer className="py-12 px-6 bg-[#012a4a] text-[#e6d3a8] border-t border-white/10">
                <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-8">
                    <div className="flex items-center gap-3">
                        <Leaf className="w-5 h-5" />
                        <span className="text-sm font-bold tracking-widest uppercase text-white">BioVital.360 • MRGA</span>
                    </div>
                    <div className="flex gap-8 text-[10px] font-bold tracking-widest uppercase">
                        <a href="/blog" className="hover:text-white transition-colors">Blog</a>
                        <a href="#" className="hover:text-white transition-colors">Ciencia</a>
                        <a href="#" className="hover:text-white transition-colors">Privacidad</a>
                        <button
                            onClick={onAuthClick}
                            className="opacity-50 hover:opacity-100 transition-opacity"
                        >
                            Acceso
                        </button>
                    </div>
                </div>
            </footer>
        </div>
    );
}
