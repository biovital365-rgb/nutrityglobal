import { motion } from "motion/react";
import {
    Brain,
    Leaf,
    Heart,
    ChevronRight,
    Shield,
    Zap,
    Activity,
    Users,
    CheckCircle2,
    Lock,
    Target,
    ArrowUpRight,
    Sparkles,
    LayoutDashboard,
    Search,
    Stethoscope
} from "lucide-react";

interface NutrityLandingProps {
    onStart: () => void;
}

export function NutrityLanding({ onStart }: NutrityLandingProps) {
    return (
        <div className="flex flex-col min-h-screen w-full bg-nutrity-bg text-nutrity-primary overflow-x-hidden">
            {/* Premium Navigation */}
            <header className="glass-header w-full">
                <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-nutrity-accent rounded-xl flex items-center justify-center shadow-lg shadow-nutrity-accent/20">
                            <Activity className="w-6 h-6 text-white" />
                        </div>
                        <div>
                            <h2 className="text-xl font-display font-bold leading-none">Nutrity</h2>
                            <span className="text-[10px] font-bold text-nutrity-accent uppercase tracking-[0.2em]">Global AI</span>
                        </div>
                    </div>
                    <nav className="hidden md:flex items-center gap-10">
                        <a href="#metodo" className="text-sm font-semibold text-nutrity-gray-text hover:text-nutrity-accent transition-colors">Nuestro Método</a>
                        <a href="#ciencia" className="text-sm font-semibold text-nutrity-gray-text hover:text-nutrity-accent transition-colors">Ciencia</a>
                        <button
                            onClick={onStart}
                            className="bg-nutrity-primary text-white px-6 py-2.5 rounded-xl text-sm font-bold shadow-lg hover:bg-nutrity-accent transition-all active:scale-95"
                        >
                            Acceso Pacientes
                        </button>
                    </nav>
                </div>
            </header>

            <main>
                {/* Modern Hero Section */}
                <section className="relative pt-16 pb-24 px-6 overflow-hidden">
                    <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-16 items-center">
                        <motion.div
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.8 }}
                        >
                            <div className="inline-flex items-center gap-2 px-3 py-1 bg-nutrity-accent/10 rounded-full mb-8">
                                <Sparkles className="w-4 h-4 text-nutrity-accent" />
                                <span className="text-xs font-bold text-nutrity-accent uppercase tracking-widest">Protocolo Médico v4.2</span>
                            </div>

                            <h1 className="text-4xl md:text-6xl font-display font-bold leading-[1.05] tracking-tight mb-6">
                                Ciencia de Remisión <br />
                                <span className="text-nutrity-accent italic">Metabólica Personalizada.</span>
                            </h1>

                            <p className="text-lg text-nutrity-gray-text leading-relaxed mb-10 max-w-lg font-medium">
                                Superalimentos andinos ionizados y algoritmos de IA predictiva para estabilizar tu glucosa y recuperar tu energía vital en 90 días.
                            </p>

                            <div className="flex flex-col sm:flex-row gap-4">
                                <button
                                    onClick={onStart}
                                    className="bg-nutrity-accent text-white px-8 py-4 rounded-xl font-bold text-lg flex items-center justify-center gap-3 shadow-xl shadow-nutrity-accent/20 hover:scale-[1.02] transition-all"
                                >
                                    Iniciar Evaluación Gratis
                                    <ChevronRight className="w-5 h-5" />
                                </button>
                                <div className="flex items-center gap-3 px-6 py-4 rounded-xl bg-white border border-nutrity-border shadow-sm">
                                    <div className="w-10 h-10 bg-nutrity-success/10 rounded-full flex items-center justify-center">
                                        <Shield className="w-5 h-5 text-nutrity-success" />
                                    </div>
                                    <div className="text-left">
                                        <p className="text-[10px] font-bold text-nutrity-gray-text uppercase tracking-widest leading-none mb-1">Privacidad HIPAA</p>
                                        <p className="text-xs font-bold">Datos 100% Protegidos</p>
                                    </div>
                                </div>
                            </div>
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ duration: 0.8, delay: 0.2 }}
                            className="relative"
                        >
                            <div className="nutrity-card p-2 bg-gradient-to-br from-white to-slate-50 overflow-hidden">
                                <div className="relative aspect-[4/3] rounded-lg overflow-hidden border border-nutrity-border">
                                    <img
                                        src="/tarwi_glucose.png"
                                        alt="Dashboard Preview"
                                        className="w-full h-full object-cover"
                                    />
                                    {/* Floating Stats */}
                                    <div className="absolute top-6 right-6 bg-white/90 backdrop-blur-md p-4 rounded-2xl shadow-xl border border-white flex items-center gap-4">
                                        <div className="w-10 h-10 bg-nutrity-success/20 text-nutrity-success rounded-xl flex items-center justify-center font-bold">94</div>
                                        <div>
                                            <p className="text-[10px] font-bold text-nutrity-gray-text uppercase tracking-widest">Glucosa Promedio</p>
                                            <p className="text-xs font-bold">Nivel Estable (Óptimo)</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            {/* Decorative background element */}
                            <div className="absolute -z-10 -bottom-10 -right-10 w-64 h-64 bg-nutrity-accent/5 rounded-full blur-3xl"></div>
                        </motion.div>
                    </div>
                </section>

                {/* Benefits Grid */}
                <section id="ciencia" className="py-24 bg-white border-y border-nutrity-border">
                    <div className="max-w-7xl mx-auto px-6">
                        <div className="text-center mb-16">
                            <h2 className="text-xs font-bold text-nutrity-accent uppercase tracking-[0.4em] mb-3">Health-Tech Ecosystem</h2>
                            <h3 className="text-3xl md:text-5xl font-display font-bold">Tecnología Basada en Evidencia</h3>
                        </div>

                        <div className="grid md:grid-cols-3 gap-8">
                            {[
                                {
                                    icon: Brain,
                                    title: "IA Genómica",
                                    desc: "Análisis de marcadores para personalizar dosis exactas de superfoods."
                                },
                                {
                                    icon: Stethoscope,
                                    title: "Seguimiento Clínico",
                                    desc: "Monitoreo de tendencias y alertas preventivas antes de picos glucémicos."
                                },
                                {
                                    icon: Target,
                                    title: "Protocolo 50-25-25",
                                    desc: "Método patentado para optimizar la carga glucémica por cada comida."
                                }
                            ].map((item, idx) => (
                                <div key={idx} className="nutrity-card p-8 group hover:border-nutrity-accent transition-all">
                                    <div className="w-14 h-14 bg-nutrity-bg rounded-2xl flex items-center justify-center mb-6 group-hover:bg-nutrity-accent transition-all group-hover:text-white text-nutrity-accent">
                                        <item.icon className="w-7 h-7" />
                                    </div>
                                    <h4 className="text-xl font-bold mb-3">{item.title}</h4>
                                    <p className="text-sm text-nutrity-gray-text leading-relaxed">{item.desc}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* Final CTA */}
                <section className="py-24 px-6 bg-nutrity-primary text-white text-center rounded-[2rem] mx-6 my-24 overflow-hidden relative">
                    <div className="relative z-10 max-w-2xl mx-auto">
                        <h2 className="text-3xl md:text-5xl font-display font-bold mb-6">Tu Remisión Comienza Aquí.</h2>
                        <p className="text-lg text-white/60 mb-10 leading-relaxed font-medium">
                            Únete a miles de pacientes que han recuperado su libertad metabólica con Nutrity Global.
                        </p>
                        <button
                            onClick={onStart}
                            className="bg-nutrity-accent text-white px-10 py-4 rounded-xl font-bold text-lg shadow-xl shadow-nutrity-accent/30 hover:scale-105 transition-all"
                        >
                            Comenzar Mi Bio-Evaluación
                        </button>
                    </div>
                    {/* Abstract circles */}
                    <div className="absolute top-0 right-0 w-96 h-96 bg-nutrity-accent/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
                </section>
            </main>

            <footer className="py-12 px-6 border-t border-nutrity-border">
                <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-8">
                    <div className="flex items-center gap-3 opacity-50">
                        <Activity className="w-5 h-5" />
                        <span className="text-sm font-bold tracking-widest uppercase">Nutrity Global AI • 2025</span>
                    </div>
                    <div className="flex gap-8 text-[10px] font-bold text-nutrity-gray-text tracking-widest uppercase">
                        <a href="#" className="hover:text-nutrity-accent">Ciencia</a>
                        <a href="#" className="hover:text-nutrity-accent">Privacidad</a>
                        <a href="#" className="hover:text-nutrity-accent">Términos</a>
                        <button
                            onClick={onStart}
                            className="bg-nutrity-accent/5 p-1.5 rounded-lg text-nutrity-accent/30 hover:text-nutrity-accent hover:bg-nutrity-accent/10 transition-all"
                            title="Master Access"
                        >
                            <Shield className="w-3.5 h-3.5" />
                        </button>
                    </div>
                </div>
            </footer>
        </div>
    );
}
