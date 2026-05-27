"use client";
import { motion } from "motion/react";
import { useState, useEffect } from "react";
import Link from "next/link";
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
    CheckCircle2,
    ArrowDown,
    Droplets,
    Dumbbell,
    Salad,
    Clock,
    Scale,
    Apple
} from "lucide-react";
import { getPosts, getLandingConfig } from "@/actions/db-actions";
import type { Post } from "@/lib/types";

interface NutrityLandingProps {
    user?: any;
    onStart: () => void;
    onAuthClick: () => void;
}

export function NutrityLanding({ user, onStart, onAuthClick }: NutrityLandingProps) {
    const [recentPosts, setRecentPosts] = useState<Post[]>([]);
    const [landingConfig, setLandingConfig] = useState<any>({});
    const [isScrolled, setIsScrolled] = useState(false);

    useEffect(() => {
        getPosts(undefined, true).then(posts => {
            setRecentPosts(posts.slice(0, 3));
        }).catch(err => console.error("Error fetching posts:", err));

        getLandingConfig().then(config => {
            if (config) setLandingConfig(config);
        }).catch(err => console.error("Error fetching landing config:", err));

        const handleScroll = () => {
            setIsScrolled(window.scrollY > 20);
        };
        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    return (
        <div className="flex flex-col min-h-screen w-full bg-[#fbf8f1] text-[#2d3748] overflow-x-hidden selection:bg-[#c19b6c] selection:text-white font-sans">
            {/* Sticky Navigation */}
            <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${isScrolled ? "backdrop-blur-xl bg-[#fbf8f1]/90 border-b border-[#c19b6c]/20 py-3 shadow-lg" : "bg-transparent py-5"}`}>
                <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-[#012a4a] rounded-xl flex items-center justify-center shadow-lg shadow-[#012a4a]/20">
                            <Leaf className="w-5 h-5 text-[#c19b6c]" />
                        </div>
                        <div>
                            <h2 className="text-xl font-display font-bold leading-none text-[#012a4a]">BioVital.360</h2>
                            <span className="text-[9px] font-bold text-[#c19b6c] uppercase tracking-[0.25em]">MRGA</span>
                        </div>
                    </div>
                    <nav className="hidden lg:flex items-center gap-8 bg-white/50 backdrop-blur-md px-8 py-2 rounded-full border border-[#c19b6c]/20">
                        <a href="#doble-ciclo" className="text-xs font-bold uppercase tracking-widest text-[#1b3b36] hover:text-[#c19b6c] transition-colors">La Ciencia</a>
                        <a href="#alimentacion" className="text-xs font-bold uppercase tracking-widest text-[#1b3b36] hover:text-[#c19b6c] transition-colors">Alimentación</a>
                        <a href="#movimiento" className="text-xs font-bold uppercase tracking-widest text-[#1b3b36] hover:text-[#c19b6c] transition-colors">Movimiento</a>
                        <a href="#estrategias" className="text-xs font-bold uppercase tracking-widest text-[#1b3b36] hover:text-[#c19b6c] transition-colors">Estrategias</a>
                        <Link href="/blog" className="text-xs font-bold uppercase tracking-widest text-[#1b3b36] hover:text-[#c19b6c] transition-colors">Blog</Link>
                    </nav>
                    <button
                        onClick={onAuthClick}
                        className="bg-[#012a4a] text-[#fbf8f1] px-6 py-2.5 rounded-xl text-xs font-bold uppercase tracking-widest shadow-lg hover:bg-[#1b3b36] transition-all active:scale-95 border border-[#012a4a]"
                    >
                        Acceso
                    </button>
                </div>
            </header>

            <main>
                {/* Hero Section */}
                <section className="relative min-h-screen pt-32 pb-20 px-6 flex items-center overflow-hidden">
                    <div className="absolute inset-0 z-0">
                        <img 
                            src="https://images.unsplash.com/photo-1506126613408-eca07ce68773?auto=format&fit=crop&q=80" 
                            alt="Amanecer en las montañas" 
                            className="w-full h-full object-cover object-top"
                        />
                        <div className="absolute inset-0 bg-gradient-to-r from-[#fbf8f1] via-[#fbf8f1]/90 to-transparent md:to-[#fbf8f1]/30"></div>
                        <div className="absolute inset-0 bg-gradient-to-t from-[#fbf8f1] via-transparent to-[#fbf8f1]/50"></div>
                    </div>

                    <div className="max-w-7xl mx-auto w-full relative z-10 grid lg:grid-cols-2 gap-12 items-center">
                        <motion.div
                            initial={{ opacity: 0, y: 30 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 1 }}
                            className="flex flex-col justify-center"
                        >
                            <div className="inline-flex items-center gap-3 mb-8">
                                <span className="w-12 h-[1px] bg-[#c19b6c]"></span>
                                <span className="text-[10px] md:text-xs font-bold text-[#c19b6c] uppercase tracking-[0.3em]">Guía Práctica Basada en Evidencia</span>
                            </div>

                            <h1 className="text-5xl md:text-7xl lg:text-8xl font-serif font-bold leading-[1.05] tracking-tight mb-6 text-[#012a4a] whitespace-pre-line">
                                {landingConfig.heroTitle || "REMISIÓN \n METABÓLICA"}
                            </h1>
                            <h2 className="text-lg md:text-2xl font-bold tracking-widest text-[#1b3b36] mb-10 uppercase bg-[#1b3b36]/5 inline-block px-4 py-2 border-l-4 border-[#1b3b36]">
                                {landingConfig.heroSubtitle || "De la Diabetes Tipo 2"}
                            </h2>

                            <div className="flex items-start gap-4 mb-12">
                                <div className="w-2 h-2 rounded-full bg-[#c19b6c] mt-2.5"></div>
                                <p className="text-xl md:text-2xl text-[#2d3748] italic font-serif leading-relaxed whitespace-pre-line">
                                    {landingConfig.heroDescription || "Recuperando tu salud metabólica \n con ciencia, hábitos y esperanza."}
                                </p>
                            </div>

                            <div className="flex flex-col sm:flex-row gap-4 mb-12">
                                <button
                                    onClick={onStart}
                                    className="bg-[#c19b6c] text-[#012a4a] px-8 py-5 rounded-xl font-bold text-sm uppercase tracking-widest flex items-center justify-center gap-3 shadow-2xl shadow-[#c19b6c]/20 hover:scale-105 transition-all border border-[#c19b6c]"
                                >
                                    {landingConfig.ctaText || "Comenzar mi Transformación"}
                                    <ChevronRight className="w-5 h-5" />
                                </button>
                            </div>
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ duration: 1.2, delay: 0.3 }}
                            className="relative hidden lg:flex items-center justify-center"
                        >
                            <div className="relative w-64 h-64 rounded-full border border-[#c19b6c] flex items-center justify-center bg-[#fbf8f1]/80 backdrop-blur-md shadow-2xl p-4">
                                <div className="absolute inset-2 border border-[#c19b6c]/40 rounded-full animate-[spin_20s_linear_infinite] border-dashed"></div>
                                <div className="text-center z-10">
                                    <Heart className="w-8 h-8 text-[#c19b6c] mx-auto mb-4" />
                                    <p className="text-[10px] font-bold uppercase tracking-widest text-[#012a4a] leading-relaxed">
                                        La ciencia <br /> confirma. <br /> Tu compromiso <br /> transforma.
                                    </p>
                                    <Leaf className="w-5 h-5 text-[#c19b6c] mx-auto mt-4" />
                                </div>
                            </div>
                        </motion.div>
                    </div>
                </section>

                {/* Doble Ciclo Infographic */}
                <section id="doble-ciclo" className="py-24 bg-[#012a4a] text-[#fbf8f1] relative border-t border-[#c19b6c]/20 overflow-hidden">
                    <div className="max-w-7xl mx-auto px-6 relative z-10">
                        <div className="text-center mb-20">
                            <h2 className="text-[10px] md:text-xs font-bold text-[#c19b6c] uppercase tracking-[0.3em] mb-4">La Ciencia del Problema</h2>
                            <h3 className="text-4xl md:text-6xl font-serif font-bold mb-6">El Doble Ciclo</h3>
                            <p className="text-[#e6d3a8] text-lg font-serif italic max-w-2xl mx-auto">
                                La resistencia a la insulina es provocada por un exceso crónico de energía y depósitos de grasa ectópica.
                            </p>
                        </div>

                        <div className="grid md:grid-cols-2 gap-12 lg:gap-24 relative">
                            {/* Ciclo 1 */}
                            <motion.div 
                                initial={{ opacity: 0, y: 30 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                className="bg-[#1b3b36]/40 p-8 md:p-12 rounded-[3rem] border border-[#c19b6c]/30 backdrop-blur-sm relative"
                            >
                                <div className="absolute -top-6 -left-6 w-16 h-16 bg-[#c19b6c] rounded-full flex items-center justify-center text-[#012a4a] font-serif font-bold text-2xl shadow-xl">1</div>
                                <h4 className="text-2xl font-serif font-bold text-[#e6d3a8] mb-8 text-center border-b border-[#c19b6c]/20 pb-4">Ciclo del Hígado</h4>
                                <div className="space-y-6 flex flex-col items-center">
                                    <div className="bg-[#012a4a] w-full p-5 rounded-2xl text-center border border-white/10 shadow-lg">
                                        <p className="font-bold text-sm uppercase tracking-wide">Exceso de Calorías Diarias</p>
                                    </div>
                                    <ArrowDown className="w-6 h-6 text-[#c19b6c]" />
                                    <div className="bg-[#012a4a] w-full p-5 rounded-2xl text-center border border-white/10 shadow-lg relative">
                                        <Droplets className="absolute top-1/2 -translate-y-1/2 left-4 w-6 h-6 text-[#c19b6c]/50" />
                                        <p className="font-bold text-sm uppercase tracking-wide">Grasa en el Hígado</p>
                                    </div>
                                    <ArrowDown className="w-6 h-6 text-[#c19b6c]" />
                                    <div className="bg-[#012a4a] w-full p-5 rounded-2xl text-center border border-white/10 shadow-lg">
                                        <p className="font-bold text-sm uppercase tracking-wide text-[#c19b6c]">Resistencia a la Insulina Hepática</p>
                                    </div>
                                    <ArrowDown className="w-6 h-6 text-[#c19b6c]" />
                                    <div className="bg-[#012a4a] w-full p-5 rounded-2xl text-center border border-white/10 shadow-lg">
                                        <p className="font-bold text-sm uppercase tracking-wide">Producción Excesiva de Glucosa</p>
                                    </div>
                                </div>
                            </motion.div>

                            {/* Ciclo 2 */}
                            <motion.div 
                                initial={{ opacity: 0, y: 30 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: 0.2 }}
                                className="bg-[#1b3b36]/40 p-8 md:p-12 rounded-[3rem] border border-[#c19b6c]/30 backdrop-blur-sm relative"
                            >
                                <div className="absolute -top-6 -left-6 w-16 h-16 bg-[#c19b6c] rounded-full flex items-center justify-center text-[#012a4a] font-serif font-bold text-2xl shadow-xl">2</div>
                                <h4 className="text-2xl font-serif font-bold text-[#e6d3a8] mb-8 text-center border-b border-[#c19b6c]/20 pb-4">Ciclo del Páncreas</h4>
                                <div className="space-y-6 flex flex-col items-center">
                                    <div className="bg-[#012a4a] w-full p-5 rounded-2xl text-center border border-white/10 shadow-lg">
                                        <p className="font-bold text-sm uppercase tracking-wide">Exceso de Glucosa en Sangre</p>
                                    </div>
                                    <ArrowDown className="w-6 h-6 text-[#c19b6c]" />
                                    <div className="bg-[#012a4a] w-full p-5 rounded-2xl text-center border border-white/10 shadow-lg">
                                        <p className="font-bold text-sm uppercase tracking-wide">Más Insulina Secretada</p>
                                    </div>
                                    <ArrowDown className="w-6 h-6 text-[#c19b6c]" />
                                    <div className="bg-[#012a4a] w-full p-5 rounded-2xl text-center border border-white/10 shadow-lg relative">
                                        <Droplets className="absolute top-1/2 -translate-y-1/2 left-4 w-6 h-6 text-[#c19b6c]/50" />
                                        <p className="font-bold text-sm uppercase tracking-wide text-[#c19b6c]">Grasa en el Páncreas</p>
                                    </div>
                                    <ArrowDown className="w-6 h-6 text-[#c19b6c]" />
                                    <div className="bg-[#012a4a] w-full p-5 rounded-2xl text-center border border-white/10 shadow-lg">
                                        <p className="font-bold text-sm uppercase tracking-wide">Falla de las Células Beta</p>
                                    </div>
                                </div>
                            </motion.div>
                        </div>
                    </div>
                </section>

                {/* Pilares de Alimentación y Plato Metabólico */}
                <section id="alimentacion" className="py-24 bg-white relative">
                    <div className="max-w-7xl mx-auto px-6">
                        <div className="inline-flex items-center gap-3 mb-6">
                            <span className="text-4xl font-serif text-[#c19b6c]">01</span>
                            <div className="h-10 w-[2px] bg-[#c19b6c]"></div>
                            <span className="text-[10px] md:text-xs font-bold text-[#1b3b36] uppercase tracking-[0.3em]">Alimentación que Sana</span>
                        </div>
                        
                        <div className="grid lg:grid-cols-2 gap-16 items-center mb-20">
                            <div>
                                <h2 className="text-4xl md:text-5xl lg:text-6xl font-serif font-bold text-[#012a4a] mb-6 leading-tight">
                                    No se trata de comer menos, sino de comer <span className="italic text-[#1b3b36]">mejor</span>.
                                </h2>
                                <p className="text-lg text-[#2d3748] mb-10 leading-relaxed font-medium">
                                    La alimentación es información. Cada comida le dice a tu cuerpo si debe almacenar grasa, inflamar tejidos o, por el contrario, utilizar la energía y regenerarse.
                                </p>

                                <div className="grid sm:grid-cols-2 gap-6">
                                    {[
                                        { title: "Proteínas", desc: "Saciedad y preservación muscular.", icon: Flame },
                                        { title: "Grasas Sanas", desc: "Hormonas y energía estable.", icon: Droplets },
                                        { title: "Fibra", desc: "Salud intestinal y control de glucosa.", icon: Leaf },
                                        { title: "Carbohidratos", desc: "De bajo índice glucémico.", icon: Apple }
                                    ].map((item, i) => (
                                        <div key={i} className="p-6 rounded-2xl border border-[#c19b6c]/20 bg-[#fbf8f1] hover:shadow-lg transition-shadow">
                                            <item.icon className="w-8 h-8 text-[#c19b6c] mb-4" />
                                            <h4 className="font-serif font-bold text-[#012a4a] text-lg mb-2">{item.title}</h4>
                                            <p className="text-sm text-[#2d3748]">{item.desc}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Plato Metabólico CSS Graphic */}
                            <div className="relative flex justify-center items-center">
                                <div className="absolute inset-0 bg-[#c19b6c]/10 blur-3xl rounded-full w-[400px] h-[400px] mx-auto"></div>
                                <div className="w-[300px] h-[300px] md:w-[450px] md:h-[450px] rounded-full bg-white border-8 border-[#fbf8f1] shadow-2xl relative overflow-hidden flex">
                                    <div className="w-1/2 h-full bg-[#1b3b36]/90 flex flex-col items-center justify-center text-center p-6 text-white border-r border-white/20">
                                        <Leaf className="w-10 h-10 mb-3 opacity-80" />
                                        <span className="font-serif font-bold text-2xl md:text-4xl">50%</span>
                                        <span className="text-[10px] md:text-xs font-bold uppercase tracking-widest mt-2">Vegetales y Fibra</span>
                                    </div>
                                    <div className="w-1/2 h-full flex flex-col">
                                        <div className="h-1/2 w-full bg-[#012a4a]/90 flex flex-col items-center justify-center text-center p-4 text-white border-b border-white/20">
                                            <Flame className="w-8 h-8 mb-2 opacity-80" />
                                            <span className="font-serif font-bold text-xl md:text-3xl">25%</span>
                                            <span className="text-[9px] md:text-[10px] font-bold uppercase tracking-widest mt-1">Proteína de Calidad</span>
                                        </div>
                                        <div className="h-1/2 w-full bg-[#c19b6c]/90 flex flex-col items-center justify-center text-center p-4 text-[#012a4a]">
                                            <Apple className="w-8 h-8 mb-2 opacity-80" />
                                            <span className="font-serif font-bold text-xl md:text-3xl">25%</span>
                                            <span className="text-[9px] md:text-[10px] font-bold uppercase tracking-widest mt-1">Carbohidratos Complejos</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Movimiento como Medicina */}
                <section id="movimiento" className="py-24 bg-[#fbf8f1] relative border-t border-[#c19b6c]/20">
                    <div className="max-w-7xl mx-auto px-6">
                        <div className="text-center mb-16">
                            <div className="inline-flex items-center gap-3 mb-6 justify-center">
                                <span className="text-4xl font-serif text-[#c19b6c]">02</span>
                                <div className="h-10 w-[2px] bg-[#c19b6c]"></div>
                                <span className="text-[10px] md:text-xs font-bold text-[#1b3b36] uppercase tracking-[0.3em]">El Cuerpo en Acción</span>
                            </div>
                            <h2 className="text-4xl md:text-6xl font-serif font-bold text-[#012a4a] mb-6">El Movimiento como Medicina</h2>
                            <p className="text-lg text-[#2d3748] font-medium max-w-2xl mx-auto">
                                El músculo es el principal órgano consumidor de glucosa. Activarlo es clave para sensibilizar el cuerpo a la insulina.
                            </p>
                        </div>

                        <div className="grid md:grid-cols-3 gap-8">
                            {[
                                {
                                    icon: Activity,
                                    title: "Caminar",
                                    subtitle: "La medicina subestimada",
                                    desc: "Caminatas de 10 a 15 minutos después de las comidas pueden reducir significativamente la glucosa postprandial."
                                },
                                {
                                    icon: Dumbbell,
                                    title: "Fuerza",
                                    subtitle: "Construye el motor",
                                    desc: "Mejora la sensibilidad a la insulina creando más receptores musculares para almacenar energía."
                                },
                                {
                                    icon: Heart,
                                    title: "Aeróbico",
                                    subtitle: "Salud cardiovascular",
                                    desc: "Mejora la eficiencia mitocondrial y la quema de grasa a largo plazo."
                                }
                            ].map((item, i) => (
                                <motion.div 
                                    key={i}
                                    initial={{ opacity: 0, y: 20 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    viewport={{ once: true }}
                                    transition={{ delay: i * 0.2 }}
                                    className="bg-white p-8 rounded-[2rem] border border-[#c19b6c]/20 shadow-xl hover:-translate-y-2 transition-transform text-center"
                                >
                                    <div className="w-16 h-16 mx-auto bg-[#c19b6c]/10 rounded-full flex items-center justify-center mb-6">
                                        <item.icon className="w-8 h-8 text-[#c19b6c]" />
                                    </div>
                                    <h3 className="font-serif font-bold text-2xl text-[#012a4a] mb-2">{item.title}</h3>
                                    <p className="text-[10px] font-bold text-[#c19b6c] uppercase tracking-widest mb-4">{item.subtitle}</p>
                                    <p className="text-[#2d3748] leading-relaxed text-sm">{item.desc}</p>
                                </motion.div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* Estrategias y Tabla Comparativa */}
                <section id="estrategias" className="py-24 bg-white relative border-t border-[#c19b6c]/20">
                    <div className="max-w-7xl mx-auto px-6">
                        <div className="text-center mb-16">
                            <h2 className="text-4xl md:text-5xl font-serif font-bold text-[#012a4a] mb-6">Enfoques Clínicos Respaldados</h2>
                            <p className="text-[#2d3748] max-w-2xl mx-auto font-medium text-lg">
                                Diversas estrategias han demostrado efectividad en ensayos clínicos para la remisión. En nuestra academia aprenderás cuál se adapta a ti.
                            </p>
                        </div>

                        <div className="overflow-x-auto pb-8">
                            <div className="min-w-[800px] border border-[#c19b6c]/20 rounded-3xl overflow-hidden shadow-lg">
                                <div className="grid grid-cols-4 bg-[#012a4a] text-[#e6d3a8] p-6 text-xs font-bold uppercase tracking-widest">
                                    <div>Estrategia</div>
                                    <div>Enfoque Principal</div>
                                    <div>Beneficio Clave</div>
                                    <div>Evidencia Nivel</div>
                                </div>
                                {[
                                    { name: "Restricción Calórica (DiRECT)", focus: "Déficit agresivo inicial", benefit: "Reducción rápida de grasa ectópica", level: "Alta (Ensayo Clínico)" },
                                    { name: "Low-Carb / Keto", focus: "Reducción drástica de CH", benefit: "Control inmediato de glucosa/insulina", level: "Alta (RCTs)" },
                                    { name: "Ayuno Intermitente", focus: "Ventanas de alimentación", benefit: "Reducción de resistencia a la insulina", level: "Moderada/Alta" },
                                    { name: "Dieta Mediterránea", focus: "Grasas sanas, fibra, antiinflamatoria", benefit: "Salud CV y sostenibilidad", level: "Muy Alta" }
                                ].map((row, i) => (
                                    <div key={i} className="grid grid-cols-4 p-6 border-t border-[#c19b6c]/10 bg-[#fbf8f1]/50 items-center text-sm">
                                        <div className="font-serif font-bold text-[#012a4a] text-lg">{row.name}</div>
                                        <div className="text-[#2d3748]">{row.focus}</div>
                                        <div className="text-[#1b3b36] font-medium">{row.benefit}</div>
                                        <div className="flex items-center gap-2">
                                            <Shield className="w-4 h-4 text-[#c19b6c]" />
                                            <span className="text-[#2d3748] font-bold text-xs uppercase tracking-wider">{row.level}</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="mt-12 text-center">
                            <button
                                onClick={onStart}
                                className="bg-[#1b3b36] text-[#fbf8f1] px-10 py-4 rounded-xl font-bold text-xs uppercase tracking-widest shadow-xl shadow-[#1b3b36]/20 hover:scale-105 transition-all inline-flex items-center gap-3"
                            >
                                Ingresar a la Academia <ChevronRight className="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                </section>

                {/* Recent Blog Content */}
                <section className="py-24 bg-[#012a4a] text-[#fbf8f1] relative border-t-4 border-[#c19b6c]">
                    <div className="max-w-7xl mx-auto px-6">
                        <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-6">
                            <div>
                                <h2 className="text-3xl md:text-5xl font-serif font-bold mb-4 text-[#e6d3a8]">Artículos Recientes</h2>
                                <p className="text-white/80 font-medium">Últimas actualizaciones, ciencia y consejos metabólicos.</p>
                            </div>
                            <Link href="/blog" className="text-[#c19b6c] text-xs font-bold uppercase tracking-widest hover:text-white transition-colors flex items-center gap-2">
                                Ver todo el blog <ArrowRight className="w-4 h-4" />
                            </Link>
                        </div>

                        <div className="grid md:grid-cols-3 gap-8">
                            {recentPosts.length > 0 ? recentPosts.map((post) => (
                                <Link href={`/blog/${post.slug}`} key={post.id} className="group flex flex-col bg-[#fbf8f1] rounded-[2rem] overflow-hidden hover:scale-[1.02] transition-transform duration-300">
                                    {post.thumbnail ? (
                                        <div className="h-48 overflow-hidden relative">
                                            <img src={post.thumbnail} alt={post.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                                        </div>
                                    ) : (
                                        <div className="h-48 bg-[#c19b6c]/20 flex items-center justify-center">
                                            <Leaf className="w-12 h-12 text-[#c19b6c]" />
                                        </div>
                                    )}
                                    <div className="p-8 flex flex-col flex-1">
                                        <span className="text-[9px] font-bold uppercase tracking-widest text-[#1b3b36] mb-3">{post.category}</span>
                                        <h3 className="font-serif font-bold text-xl text-[#012a4a] mb-4 line-clamp-2 leading-tight">{post.title}</h3>
                                        <div className="mt-auto flex items-center justify-between border-t border-[#c19b6c]/20 pt-4">
                                            <span className="text-[10px] font-bold text-[#2d3748] uppercase tracking-widest">
                                                {new Date(post.createdAt).toLocaleDateString("es-ES", { month: "short", day: "numeric" })}
                                            </span>
                                            <ArrowRight className="w-4 h-4 text-[#c19b6c] group-hover:translate-x-1 transition-transform" />
                                        </div>
                                    </div>
                                </Link>
                            )) : (
                                <div className="col-span-full text-center py-12 text-white/50 italic font-serif">
                                    Cargando artículos recientes...
                                </div>
                            )}
                        </div>
                    </div>
                </section>
            </main>

            <footer className="py-16 px-6 bg-[#fbf8f1] border-t border-[#c19b6c]/20">
                <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-8">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-[#012a4a] rounded-lg flex items-center justify-center">
                            <Leaf className="w-4 h-4 text-[#c19b6c]" />
                        </div>
                        <span className="text-xs font-bold tracking-widest uppercase text-[#012a4a]">BioVital.360 • MRGA</span>
                    </div>
                    <div className="flex flex-wrap justify-center gap-6 text-[10px] font-bold tracking-widest uppercase text-[#2d3748]">
                        <a href="#doble-ciclo" className="hover:text-[#c19b6c] transition-colors">La Ciencia</a>
                        <a href="#alimentacion" className="hover:text-[#c19b6c] transition-colors">Alimentación</a>
                        <a href="/blog" className="hover:text-[#c19b6c] transition-colors">Blog</a>
                        <button
                            onClick={onAuthClick}
                            className="hover:text-[#c19b6c] transition-colors"
                        >
                            Acceso
                        </button>
                    </div>
                </div>
            </footer>
        </div>
    );
}
