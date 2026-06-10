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
    Apple,
    Loader2
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
    const [landingConfig, setLandingConfig] = useState<any>(null);
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

    if (!landingConfig) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-[#fbf8f1]">
                <Loader2 className="w-8 h-8 animate-spin text-[#c19b6c]" />
            </div>
        );
    }

    return (
        <div className="flex flex-col min-h-screen w-full bg-[#fbf8f1] text-[#2d3748] overflow-x-hidden selection:bg-[#c19b6c] selection:text-white font-sans">
            {/* Sticky Navigation */}
            <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${isScrolled ? "backdrop-blur-xl bg-[#fbf8f1]/90 border-b border-[#c19b6c]/20 py-3 shadow-lg" : "bg-transparent py-5"}`}>
                <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <img 
                            src="https://drive.google.com/uc?export=view&id=1LSl9LF795Q6E2YnjvZ0kZ40DjVuk7LuS" 
                            alt="Nutrity Global Logo" 
                            className="w-40 h-auto object-contain drop-shadow-md" 
                        />
                    </div>
                    <nav className="hidden lg:flex items-center gap-8 bg-white/50 backdrop-blur-md px-8 py-2 rounded-full border border-[#c19b6c]/20">
                        <a href="#doble-ciclo" className="text-xs font-bold uppercase tracking-widest text-[#1b3b36] hover:text-[#c19b6c] transition-colors">La Ciencia</a>
                        <a href="#alimentacion" className="text-xs font-bold uppercase tracking-widest text-[#1b3b36] hover:text-[#c19b6c] transition-colors">Alimentación</a>
                        <a href="#movimiento" className="text-xs font-bold uppercase tracking-widest text-[#1b3b36] hover:text-[#c19b6c] transition-colors">Movimiento</a>
                        <a href="#estrategias" className="text-xs font-bold uppercase tracking-widest text-[#1b3b36] hover:text-[#c19b6c] transition-colors">Estrategias</a>
                        <button onClick={() => onStart()} className="text-xs font-bold uppercase tracking-widest text-[#1b3b36] hover:text-[#c19b6c] transition-colors">Planes</button>
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
                <section className="relative min-h-screen pt-32 pb-20 px-6 flex items-center justify-center overflow-hidden text-center">
                    <div className="absolute inset-0 z-0">
                        <img 
                            src={landingConfig.heroImage || "/landing-img-5.jpg"} 
                            alt="Hero Image" 
                            className="w-full h-full object-cover object-top"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-[#fbf8f1] via-[#fbf8f1]/40 to-transparent"></div>
                        <div className="absolute inset-0 bg-white/10"></div>
                    </div>

                    <div className="max-w-4xl mx-auto w-full relative z-10">
                        <motion.div
                            initial={{ opacity: 0, y: 30 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 1 }}
                            className="flex flex-col items-center justify-center"
                        >
                            <div className="inline-flex items-center gap-3 mb-6">
                                <span className="w-8 h-[1px] bg-[#c19b6c]"></span>
                                <span className="text-[10px] md:text-xs font-bold text-[#c19b6c] uppercase tracking-[0.3em]">Guía Práctica Basada en Evidencia</span>
                                <span className="w-8 h-[1px] bg-[#c19b6c]"></span>
                            </div>

                            <h1 className="text-4xl md:text-5xl lg:text-6xl font-serif font-bold leading-tight tracking-tight mb-4 text-[#012a4a] whitespace-pre-line">
                                {landingConfig?.heroTitle || ""}
                            </h1>
                            
                            <h2 className="text-sm md:text-lg font-bold tracking-widest text-[#1b3b36] mb-8 uppercase bg-[#1b3b36]/5 inline-block px-4 py-2 border-l-4 border-r-4 border-[#1b3b36]">
                                {landingConfig?.heroSubtitle || ""}
                            </h2>

                            <p className="text-base md:text-xl text-[#2d3748] italic font-serif leading-relaxed mb-10 max-w-2xl mx-auto">
                                {landingConfig?.heroDescription || ""}
                            </p>

                            <button
                                onClick={onStart}
                                className="bg-[#c19b6c] text-[#012a4a] px-8 py-4 rounded-xl font-bold text-sm uppercase tracking-widest flex items-center justify-center gap-3 shadow-2xl shadow-[#c19b6c]/20 hover:scale-105 transition-all border border-[#c19b6c] mx-auto"
                            >
                                {landingConfig?.ctaText || "Comenzar"}
                                <ChevronRight className="w-5 h-5" />
                            </button>
                        </motion.div>
                    </div>
                </section>

                {/* Doble Ciclo Infographic */}
                <section id="doble-ciclo" className="py-24 bg-[#012a4a] text-[#fbf8f1] relative border-t border-[#c19b6c]/20 overflow-hidden">
                    <div className="max-w-5xl mx-auto px-6 relative z-10">
                        <div className="text-center mb-12">
                            <h2 className="text-[10px] md:text-xs font-bold text-[#c19b6c] uppercase tracking-[0.3em] mb-4">La Ciencia</h2>
                            <h3 className="text-3xl md:text-5xl font-serif font-bold mb-6">El Doble Ciclo</h3>
                            <p className="text-[#e6d3a8] text-sm md:text-base font-serif italic max-w-2xl mx-auto">
                                Entendiendo la resistencia a la insulina desde sus raíces biológicas.
                            </p>
                        </div>
                        
                        <motion.div 
                            initial={{ opacity: 0, scale: 0.95 }}
                            whileInView={{ opacity: 1, scale: 1 }}
                            viewport={{ once: true }}
                            className="flex justify-center"
                        >
                            <img 
                                src={landingConfig?.scienceImage || ""} 
                                alt="Ciencia y órganos" 
                                className="w-full max-w-3xl rounded-3xl shadow-2xl border-4 border-[#1b3b36]"
                            />
                        </motion.div>
                    </div>
                </section>

                {/* Pilares de Alimentación */}
                <section id="alimentacion" className="py-24 bg-white relative">
                    <div className="max-w-5xl mx-auto px-6 text-center">
                        <div className="inline-flex items-center gap-3 mb-6 justify-center">
                            <span className="text-3xl font-serif text-[#c19b6c]">01</span>
                            <div className="h-10 w-[2px] bg-[#c19b6c]"></div>
                            <span className="text-[10px] md:text-xs font-bold text-[#1b3b36] uppercase tracking-[0.3em]">Misión Metabólica</span>
                        </div>
                        
                        <h2 className="text-3xl md:text-5xl font-serif font-bold text-[#012a4a] mb-6 leading-tight">
                            Comer <span className="italic text-[#1b3b36]">mejor</span>, no menos.
                        </h2>
                        <p className="text-sm md:text-base text-[#2d3748] mb-12 max-w-2xl mx-auto">
                            Cada comida le dice a tu cuerpo si debe almacenar grasa, inflamar tejidos o utilizar la energía y regenerarse.
                        </p>

                        <motion.div 
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            className="flex justify-center mb-12"
                        >
                            <img 
                                src={landingConfig?.missionImage || ""} 
                                alt="Misión Metabólica" 
                                className="w-full max-w-2xl rounded-3xl shadow-xl"
                            />
                        </motion.div>

                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
                            {[
                                { title: "Proteínas", desc: "Saciedad", icon: Flame },
                                { title: "Grasas", desc: "Energía", icon: Droplets },
                                { title: "Fibra", desc: "Control", icon: Leaf },
                                { title: "Carbos", desc: "Calidad", icon: Apple }
                            ].map((item, i) => (
                                <div key={i} className="p-4 md:p-6 rounded-2xl border border-[#c19b6c]/20 bg-[#fbf8f1] hover:shadow-md transition-shadow text-center">
                                    <item.icon className="w-6 h-6 md:w-8 md:h-8 text-[#c19b6c] mx-auto mb-3" />
                                    <h4 className="font-serif font-bold text-[#012a4a] text-sm md:text-lg mb-1">{item.title}</h4>
                                    <p className="text-xs text-[#2d3748]">{item.desc}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* Movimiento como Medicina */}
                <section id="movimiento" className="py-24 bg-[#fbf8f1] relative border-t border-[#c19b6c]/20">
                    <div className="max-w-5xl mx-auto px-6">
                        <div className="text-center mb-12">
                            <div className="inline-flex items-center gap-3 mb-6 justify-center">
                                <span className="text-3xl font-serif text-[#c19b6c]">02</span>
                                <div className="h-10 w-[2px] bg-[#c19b6c]"></div>
                                <span className="text-[10px] md:text-xs font-bold text-[#1b3b36] uppercase tracking-[0.3em]">El Cuerpo en Acción</span>
                            </div>
                            <h2 className="text-3xl md:text-5xl font-serif font-bold text-[#012a4a] mb-4">El Movimiento como Medicina</h2>
                            <p className="text-sm md:text-base text-[#2d3748] max-w-2xl mx-auto">
                                Activar tus músculos es clave para sensibilizar el cuerpo a la insulina.
                            </p>
                        </div>

                        <div className="grid lg:grid-cols-2 gap-12 items-center">
                            <motion.div 
                                initial={{ opacity: 0, x: -30 }}
                                whileInView={{ opacity: 1, x: 0 }}
                                viewport={{ once: true }}
                            >
                                <img 
                                    src={landingConfig?.habitsImage || ""} 
                                    alt="Hábitos de Movimiento" 
                                    className="w-full rounded-3xl shadow-xl"
                                />
                            </motion.div>
                            <div className="space-y-6">
                                {[
                                    { title: "Caminar", desc: "Reduce la glucosa postprandial.", icon: Activity },
                                    { title: "Fuerza", desc: "Crea más receptores musculares.", icon: Dumbbell },
                                    { title: "Cardio", desc: "Mejora la eficiencia mitocondrial.", icon: Heart }
                                ].map((item, i) => (
                                    <div key={i} className="flex items-center gap-4 bg-white p-5 rounded-2xl border border-[#c19b6c]/10 shadow-sm">
                                        <div className="w-12 h-12 bg-[#c19b6c]/10 rounded-full flex items-center justify-center shrink-0">
                                            <item.icon className="w-6 h-6 text-[#c19b6c]" />
                                        </div>
                                        <div>
                                            <h4 className="font-serif font-bold text-lg text-[#012a4a]">{item.title}</h4>
                                            <p className="text-xs text-[#2d3748]">{item.desc}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </section>

                {/* Estrategias */}
                <section id="estrategias" className="py-24 bg-white relative border-t border-[#c19b6c]/20">
                    <div className="max-w-5xl mx-auto px-6 text-center">
                        <div className="mb-12">
                            <h2 className="text-3xl md:text-5xl font-serif font-bold text-[#012a4a] mb-4">Enfoques Clínicos Respaldados</h2>
                            <p className="text-[#2d3748] text-sm md:text-base max-w-2xl mx-auto">
                                Estrategias comprobadas (Restricción Calórica, Low-Carb, Ayuno) personalizadas para tu éxito metabólico.
                            </p>
                        </div>

                        <motion.div 
                            initial={{ opacity: 0, scale: 0.95 }}
                            whileInView={{ opacity: 1, scale: 1 }}
                            viewport={{ once: true }}
                            className="flex justify-center mb-12"
                        >
                            <img 
                                src={landingConfig?.strategiesImage || ""} 
                                alt="Estrategias de Salud" 
                                className="w-full max-w-3xl rounded-3xl shadow-xl border-4 border-white ring-1 ring-[#c19b6c]/20"
                            />
                        </motion.div>

                        <button
                            onClick={onStart}
                            className="bg-[#1b3b36] text-[#fbf8f1] px-10 py-4 rounded-xl font-bold text-xs uppercase tracking-widest shadow-xl shadow-[#1b3b36]/20 hover:scale-105 transition-all inline-flex items-center gap-3"
                        >
                            Ingresar a la Academia <ChevronRight className="w-4 h-4" />
                        </button>
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
