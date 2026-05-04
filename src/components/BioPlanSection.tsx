import React from 'react';
import { motion } from 'motion/react';
import { 
    Activity, 
    Target, 
    Zap, 
    Brain, 
    Heart, 
    CheckCircle2, 
    ArrowRight,
    TrendingUp,
    Shield
} from 'lucide-react';
import { MetabolicPlan } from '../lib/metabolic-engine';

interface BioPlanSectionProps {
    plan: MetabolicPlan;
    userName: string;
}

export function BioPlanSection({ plan, userName }: BioPlanSectionProps) {
    const firstName = userName.split(' ')[0];

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.15
            }
        }
    };

    const itemVariants = {
        hidden: { y: 20, opacity: 0 },
        visible: { y: 0, opacity: 1 }
    };

    return (
        <motion.div 
            className="space-y-8"
            initial="hidden"
            animate="visible"
            variants={containerVariants}
        >
            {/* Hero Section: Score & Status */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <motion.div 
                    variants={itemVariants}
                    className="lg:col-span-2 bg-gradient-to-br from-nutrity-primary to-nutrity-primary/90 rounded-3xl p-8 text-white relative overflow-hidden shadow-2xl shadow-nutrity-primary/20"
                >
                    <div className="relative z-10">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="p-2 bg-white/10 rounded-lg backdrop-blur-md">
                                <Shield className="w-5 h-5 text-nutrity-accent" />
                            </div>
                            <span className="text-sm font-bold uppercase tracking-widest text-nutrity-accent/90">Estatus de Remisión</span>
                        </div>
                        
                        <h2 className="text-4xl font-display font-extrabold mb-4 leading-tight">
                            {plan.phase}
                        </h2>
                        
                        <p className="text-white/80 text-lg mb-8 max-w-xl leading-relaxed">
                            {plan.insight}
                        </p>

                        <div className="flex flex-wrap gap-4">
                            <div className="bg-white/10 backdrop-blur-md border border-white/10 px-5 py-3 rounded-2xl">
                                <span className="block text-xs text-white/60 uppercase tracking-wider mb-1 font-bold">Objetivo Clínico</span>
                                <span className="text-sm font-semibold">{plan.meta}</span>
                            </div>
                        </div>
                    </div>

                    {/* Background Decorative Elements */}
                    <div className="absolute top-0 right-0 w-64 h-64 bg-nutrity-accent/10 rounded-full blur-3xl -mr-20 -mt-20"></div>
                    <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/5 rounded-full blur-2xl -ml-10 -mb-10"></div>
                </motion.div>

                <motion.div 
                    variants={itemVariants}
                    className="bg-white rounded-3xl p-8 border border-nutrity-border shadow-sm flex flex-col items-center justify-center text-center relative overflow-hidden"
                >
                    <div className="relative w-40 h-40 mb-4">
                        {/* Custom Circular Gauge */}
                        <svg className="w-full h-full transform -rotate-90">
                            <circle
                                cx="80"
                                cy="80"
                                r="70"
                                stroke="currentColor"
                                strokeWidth="8"
                                fill="transparent"
                                className="text-nutrity-bg"
                            />
                            <motion.circle
                                cx="80"
                                cy="80"
                                r="70"
                                stroke="currentColor"
                                strokeWidth="10"
                                fill="transparent"
                                strokeDasharray={440}
                                initial={{ strokeDashoffset: 440 }}
                                animate={{ strokeDashoffset: 440 - (440 * plan.remissionScore) / 100 }}
                                transition={{ duration: 1.5, ease: "easeOut" }}
                                strokeLinecap="round"
                                className="text-nutrity-accent"
                            />
                        </svg>
                        <div className="absolute inset-0 flex flex-col items-center justify-center transform rotate-0">
                            <span className="text-5xl font-display font-black text-nutrity-primary">{plan.remissionScore}%</span>
                            <span className="text-[10px] font-bold text-nutrity-gray-text uppercase tracking-widest mt-1">Score Vital</span>
                        </div>
                    </div>
                    <div className="flex items-center gap-2 text-nutrity-success font-bold text-sm">
                        <TrendingUp className="w-4 h-4" />
                        <span>Mejorando +4.2%</span>
                    </div>
                </motion.div>
            </div>

            {/* Pillars Section */}
            <div>
                <div className="flex items-center justify-between mb-6">
                    <h3 className="text-2xl font-display font-bold text-nutrity-primary flex items-center gap-3">
                        <Target className="w-6 h-6 text-nutrity-accent" />
                        Pilares de Intervención
                    </h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {plan.pillars.map((pillar, index) => (
                        <motion.div 
                            key={index}
                            variants={itemVariants}
                            whileHover={{ y: -5 }}
                            className="bg-white rounded-2xl p-6 border border-nutrity-border shadow-sm group transition-all"
                        >
                            <div className={`w-12 h-12 ${pillar.color} text-white rounded-xl flex items-center justify-center mb-4 shadow-lg shadow-black/5 group-hover:scale-110 transition-transform`}>
                                {pillar.icon === 'Droplets' && <Activity className="w-6 h-6" />}
                                {pillar.icon === 'Brain' && <Brain className="w-6 h-6" />}
                                {pillar.icon === 'Zap' && <Zap className="w-6 h-6" />}
                            </div>
                            <span className="inline-block px-2 py-0.5 bg-nutrity-bg text-[10px] font-bold text-nutrity-primary rounded-md uppercase tracking-widest mb-3">
                                {pillar.tag}
                            </span>
                            <h4 className="text-lg font-bold text-nutrity-primary mb-2 group-hover:text-nutrity-accent transition-colors">
                                {pillar.title}
                            </h4>
                            <p className="text-nutrity-gray-text text-sm leading-relaxed mb-4">
                                {pillar.desc}
                            </p>
                            <button className="flex items-center gap-2 text-xs font-bold text-nutrity-primary hover:text-nutrity-accent transition-all group/btn">
                                Ver Protocolo
                                <ArrowRight className="w-3 h-3 group-hover/btn:translate-x-1 transition-transform" />
                            </button>
                        </motion.div>
                    ))}
                </div>
            </div>

            {/* Holistic Stats Panel */}
            {plan.holisticStats && (
                <motion.div 
                    variants={itemVariants}
                    className="bg-nutrity-bg/50 border border-nutrity-border rounded-3xl p-8"
                >
                    <h3 className="text-xl font-display font-bold text-nutrity-primary mb-8 flex items-center gap-3">
                        <Activity className="w-6 h-6 text-nutrity-accent" />
                        Análisis Bio-Integral
                    </h3>
                    
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
                        {plan.holisticStats.map((stat, index) => (
                            <div key={index} className="space-y-3">
                                <div className="flex justify-between items-end">
                                    <span className="text-sm font-bold text-nutrity-gray-text">{stat.label}</span>
                                    <span className="text-xs font-black text-nutrity-primary">{stat.value}%</span>
                                </div>
                                <div className="h-2 bg-white rounded-full overflow-hidden border border-nutrity-border">
                                    <motion.div 
                                        initial={{ width: 0 }}
                                        animate={{ width: `${stat.value}%` }}
                                        transition={{ duration: 1, delay: 0.5 + (index * 0.1) }}
                                        className={`h-full ${stat.color} rounded-full`}
                                    />
                                </div>
                            </div>
                        ))}
                    </div>
                </motion.div>
            )}
        </motion.div>
    );
}
