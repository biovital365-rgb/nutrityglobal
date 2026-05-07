import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
    ChevronRight,
    ChevronLeft,
    Activity,
    CheckCircle2,
    Zap,
    Heart,
    Brain,
    Shield,
    Dna,
    Target,
    Scale,
    Thermometer,
    Moon,
    Smile,
    Flame
} from "lucide-react";

interface OnboardingProps {
    onComplete: (data: any) => void;
    onBack?: () => void;
    onAuthClick?: () => void;
}

export function NutrityOnboarding({ onComplete, onBack, onAuthClick }: OnboardingProps) {
    const [step, setStep] = useState(1);
    const [isSyncing, setIsSyncing] = useState(false);
    const [formData, setFormData] = useState({
        // Section 1: Physical
        name: "",
        age: "",
        weight: "",
        height: "",
        waist: "",
        // Section 2: Biochemical
        hasHba1c: false,
        hba1c: "",
        fastingGlucose: "",
        medsDiabetes: "",
        medsOther: "",
        hasMedsOther: false,
        // Section 3: Lifestyle
        dietFrequency: "moderate",
        activityLevel: "moderate",
        sleepHours: "7-9",
        // Section 4: PNL & Emotional
        stressLevel: 5,
        diabetesPerception: "",
        commitment: "",
        // Section 5: Interest
        biodescodification: ""
    });

    const totalSteps = 5;

    const steps = [
        { title: "Fotografía", icon: Scale, desc: "Medidas Físicas" },
        { title: "Bioquímica", icon: Thermometer, desc: "Laboratorio" },
        { title: "Pilares", icon: Flame, desc: "Hábitos" },
        { title: "Mente", icon: Brain, desc: "Reprogramación" },
        { title: "Bio-Plan", icon: Dna, desc: "Personalización" }
    ];

    const handleNext = () => {
        if (step < totalSteps) {
            setStep(prev => prev + 1);
        } else {
            setIsSyncing(true);
            onComplete(formData);
        }
    };

    const handleBack = () => {
        if (step > 1) setStep(step - 1);
    };

    // Calculate remission target (15% loss)
    const weightVal = parseFloat(formData.weight);
    const targetWeight = weightVal ? (weightVal * 0.85).toFixed(1) : null;

    return (
        <div className="min-h-screen bg-nutrity-bg flex flex-col items-center justify-center p-6 text-nutrity-primary font-body overflow-x-hidden">
            {/* Header */}
            <div className="flex items-center gap-3 mb-8">
                <div className="w-10 h-10 bg-nutrity-accent rounded-xl flex items-center justify-center shadow-lg shadow-nutrity-accent/20">
                    <Activity className="w-6 h-6 text-white" />
                </div>
                <div>
                    <h2 className="text-xl font-display font-bold leading-none">Nutrity Global</h2>
                    <span className="text-[10px] font-bold text-nutrity-accent uppercase tracking-widest leading-none">Remisión Metabólica 365</span>
                </div>
            </div>

            {/* Stepper */}
            <div className="w-full max-w-md grid grid-cols-5 gap-2 mb-10">
                {steps.map((s, idx) => (
                    <div key={idx} className="flex flex-col gap-2">
                        <div className={`h-1.5 rounded-full transition-all duration-700 ${idx + 1 <= step ? 'bg-nutrity-accent' : 'bg-nutrity-border'}`} />
                        <div className="flex flex-col items-center">
                            <s.icon className={`w-4 h-4 mb-1 transition-colors ${idx + 1 === step ? 'text-nutrity-accent' : 'text-nutrity-gray-text opacity-30'}`} />
                            <span className={`text-[7px] font-bold uppercase tracking-tighter text-center transition-colors ${idx + 1 === step ? 'text-nutrity-accent' : 'text-nutrity-gray-text opacity-40'}`}>{s.title}</span>
                        </div>
                    </div>
                ))}
            </div>

            <AnimatePresence mode="wait">
                <motion.div
                    key={step}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="w-full max-w-lg"
                >
                    <div className="nutrity-card bg-white p-8 md:p-10 shadow-2xl shadow-nutrity-accent/5 border border-nutrity-border/50">
                        
                        {/* SECTION 1: METABOLIC PHOTOGRAPHY */}
                        {step === 1 && (
                            <div className="space-y-6">
                                <div className="space-y-1">
                                    <div className="flex items-center gap-2 text-nutrity-accent mb-1">
                                        <Scale className="w-5 h-5" />
                                        <span className="text-[10px] font-bold uppercase tracking-widest">Sección 1</span>
                                    </div>
                                    <h3 className="text-2xl font-display font-bold">Tu "Fotografía" Metabólica.</h3>
                                    <p className="text-nutrity-gray-text text-sm">La grasa abdominal es el principal indicador de resistencia a la insulina.</p>
                                </div>
                                
                                <div className="space-y-4">
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-bold uppercase tracking-widest text-nutrity-gray-text/60">Peso Actual (kg)</label>
                                            <input
                                                type="number"
                                                placeholder="75"
                                                className="w-full bg-nutrity-bg border border-nutrity-border rounded-xl px-5 py-4 focus:ring-2 focus:ring-nutrity-accent/20 focus:border-nutrity-accent outline-none font-medium transition-all"
                                                value={formData.weight}
                                                onChange={(e) => setFormData({ ...formData, weight: e.target.value })}
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-bold uppercase tracking-widest text-nutrity-gray-text/60">Estatura (cm)</label>
                                            <input
                                                type="number"
                                                placeholder="175"
                                                className="w-full bg-nutrity-bg border border-nutrity-border rounded-xl px-5 py-4 focus:ring-2 focus:ring-nutrity-accent/20 focus:border-nutrity-accent outline-none font-medium transition-all"
                                                value={formData.height}
                                                onChange={(e) => setFormData({ ...formData, height: e.target.value })}
                                            />
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-bold uppercase tracking-widest text-nutrity-gray-text/60">Perímetro Abdominal (cm - a la altura del ombligo)</label>
                                        <input
                                            type="number"
                                            placeholder="90"
                                            className="w-full bg-nutrity-bg border border-nutrity-border rounded-xl px-5 py-4 focus:ring-2 focus:ring-nutrity-accent/20 focus:border-nutrity-accent outline-none font-medium transition-all"
                                            value={formData.waist}
                                            onChange={(e) => setFormData({ ...formData, waist: e.target.value })}
                                        />
                                    </div>

                                    {targetWeight && (
                                        <motion.div 
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            className="p-4 bg-nutrity-accent/5 border border-nutrity-accent/20 rounded-xl flex items-center gap-4"
                                        >
                                            <Target className="w-8 h-8 text-nutrity-accent" />
                                            <div>
                                                <p className="text-[10px] font-bold uppercase text-nutrity-accent tracking-tighter">Meta de Remisión (15%)</p>
                                                <p className="text-sm font-bold text-nutrity-primary">Tu peso ideal de reactivación es {targetWeight} kg</p>
                                            </div>
                                        </motion.div>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* SECTION 2: BIOCHEMICAL */}
                        {step === 2 && (
                            <div className="space-y-6">
                                <div className="space-y-1">
                                    <div className="flex items-center gap-2 text-nutrity-accent mb-1">
                                        <Thermometer className="w-5 h-5" />
                                        <span className="text-[10px] font-bold uppercase tracking-widest">Sección 2</span>
                                    </div>
                                    <h3 className="text-2xl font-display font-bold">Laboratorio & Medicación.</h3>
                                    <p className="text-nutrity-gray-text text-sm">Entendamos cómo tu cuerpo regula el azúcar actualmente.</p>
                                </div>

                                <div className="space-y-5">
                                    <div className="space-y-3">
                                        <label className="text-[10px] font-bold uppercase tracking-widest text-nutrity-gray-text/60">¿Conoces tu Hemoglobina Glicosilada (HbA1c)?</label>
                                        <div className="grid grid-cols-2 gap-3">
                                            <button 
                                                onClick={() => setFormData({...formData, hasHba1c: true})}
                                                className={`py-3 rounded-xl border-2 font-bold text-xs transition-all ${formData.hasHba1c ? 'border-nutrity-accent bg-nutrity-accent/5' : 'border-nutrity-border'}`}
                                            >Sí, la conozco</button>
                                            <button 
                                                onClick={() => setFormData({...formData, hasHba1c: false, hba1c: ""})}
                                                className={`py-3 rounded-xl border-2 font-bold text-xs transition-all ${!formData.hasHba1c ? 'border-nutrity-accent bg-nutrity-accent/5' : 'border-nutrity-border'}`}
                                            >No lo sé</button>
                                        </div>
                                        {formData.hasHba1c && (
                                            <input
                                                type="text"
                                                placeholder="Ej: 7.2 %"
                                                className="w-full bg-nutrity-bg border border-nutrity-border rounded-xl px-5 py-4 focus:ring-2 focus:ring-nutrity-accent/20 focus:border-nutrity-accent outline-none font-medium transition-all"
                                                value={formData.hba1c}
                                                onChange={(e) => setFormData({ ...formData, hba1c: e.target.value })}
                                            />
                                        )}
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-[10px] font-bold uppercase tracking-widest text-nutrity-gray-text/60">Glucosa promedio en Ayunas (mg/dL)</label>
                                        <input
                                            type="number"
                                            placeholder="110"
                                            className="w-full bg-nutrity-bg border border-nutrity-border rounded-xl px-5 py-4 focus:ring-2 focus:ring-nutrity-accent/20 focus:border-nutrity-accent outline-none font-medium transition-all"
                                            value={formData.fastingGlucose}
                                            onChange={(e) => setFormData({ ...formData, fastingGlucose: e.target.value })}
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-[10px] font-bold uppercase tracking-widest text-nutrity-gray-text/60">Medicamentos para Diabetes (Ej: Metformina)</label>
                                        <input
                                            type="text"
                                            placeholder="Ninguno / Metformina 850mg"
                                            className="w-full bg-nutrity-bg border border-nutrity-border rounded-xl px-5 py-4 focus:ring-2 focus:ring-nutrity-accent/20 focus:border-nutrity-accent outline-none font-medium transition-all"
                                            value={formData.medsDiabetes}
                                            onChange={(e) => setFormData({ ...formData, medsDiabetes: e.target.value })}
                                        />
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* SECTION 3: LIFESTYLE PILLARS */}
                        {step === 3 && (
                            <div className="space-y-6">
                                <div className="space-y-1">
                                    <div className="flex items-center gap-2 text-nutrity-accent mb-1">
                                        <Flame className="w-5 h-5" />
                                        <span className="text-[10px] font-bold uppercase tracking-widest">Sección 3</span>
                                    </div>
                                    <h3 className="text-2xl font-display font-bold">Los 3 Pilares de Vida.</h3>
                                    <p className="text-nutrity-gray-text text-sm">Tus hábitos diarios son la medicina para reactivar tu páncreas.</p>
                                </div>

                                <div className="space-y-6">
                                    <div className="space-y-3">
                                        <label className="text-[10px] font-bold uppercase tracking-widest text-nutrity-gray-text/60">Frecuencia de Ultraprocesados / Harinas</label>
                                        <div className="grid grid-cols-1 gap-2">
                                            {[
                                                { id: "daily", label: "Todos los días", icon: "⚠️" },
                                                { id: "moderate", label: "2 a 3 veces por semana", icon: "⚖️" },
                                                { id: "rarely", label: "Rara vez o nunca", icon: "✨" }
                                            ].map((opt) => (
                                                <button
                                                    key={opt.id}
                                                    onClick={() => setFormData({ ...formData, dietFrequency: opt.id })}
                                                    className={`w-full text-left p-4 rounded-xl border-2 flex items-center gap-3 transition-all ${formData.dietFrequency === opt.id ? 'border-nutrity-accent bg-nutrity-accent/5' : 'border-nutrity-border'}`}
                                                >
                                                    <span className="text-lg">{opt.icon}</span>
                                                    <span className="text-xs font-bold">{opt.label}</span>
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    <div className="space-y-3">
                                        <label className="text-[10px] font-bold uppercase tracking-widest text-nutrity-gray-text/60">Actividad Física Semanal</label>
                                        <div className="grid grid-cols-3 gap-2">
                                            {[
                                                { id: "sedentary", label: "Casi nada" },
                                                { id: "moderate", label: "1 a 2 días" },
                                                { id: "active", label: "3+ días" }
                                            ].map((opt) => (
                                                <button
                                                    key={opt.id}
                                                    onClick={() => setFormData({ ...formData, activityLevel: opt.id })}
                                                    className={`py-3 rounded-lg border-2 text-[8px] font-bold uppercase tracking-widest transition-all ${formData.activityLevel === opt.id ? 'border-nutrity-accent bg-nutrity-accent/5 text-nutrity-accent' : 'border-nutrity-border text-nutrity-gray-text'}`}
                                                >
                                                    {opt.label}
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    <div className="space-y-3">
                                        <label className="text-[10px] font-bold uppercase tracking-widest text-nutrity-gray-text/60">Horas de Sueño Ininterrumpido</label>
                                        <div className="grid grid-cols-3 gap-2">
                                            {[
                                                { id: "<6", label: "Menos de 6h" },
                                                { id: "6-7", label: "6 a 7h" },
                                                { id: "7-9", label: "7 a 9h" }
                                            ].map((opt) => (
                                                <button
                                                    key={opt.id}
                                                    onClick={() => setFormData({ ...formData, sleepHours: opt.id })}
                                                    className={`py-3 rounded-lg border-2 text-[8px] font-bold uppercase tracking-widest transition-all ${formData.sleepHours === opt.id ? 'border-nutrity-accent bg-nutrity-accent/5 text-nutrity-accent' : 'border-nutrity-border text-nutrity-gray-text'}`}
                                                >
                                                    {opt.label}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* SECTION 4: PNL & MENTAL STATE */}
                        {step === 4 && (
                            <div className="space-y-6">
                                <div className="space-y-1">
                                    <div className="flex items-center gap-2 text-nutrity-accent mb-1">
                                        <Brain className="w-5 h-5" />
                                        <span className="text-[10px] font-bold uppercase tracking-widest">Sección 4</span>
                                    </div>
                                    <h3 className="text-2xl font-display font-bold">Reprogramación PNL.</h3>
                                    <p className="text-nutrity-gray-text text-sm">Tu cuerpo responde a tus pensamientos. El estrés eleva la glucosa.</p>
                                </div>

                                <div className="space-y-6">
                                    <div className="space-y-4">
                                        <div className="flex justify-between items-center">
                                            <label className="text-[10px] font-bold uppercase tracking-widest text-nutrity-gray-text/60">Nivel de Estrés / Ansiedad (1-10)</label>
                                            <span className="text-xl font-bold text-nutrity-accent">{formData.stressLevel}</span>
                                        </div>
                                        <input
                                            type="range"
                                            min="1"
                                            max="10"
                                            className="w-full accent-nutrity-accent"
                                            value={formData.stressLevel}
                                            onChange={(e) => setFormData({ ...formData, stressLevel: parseInt(e.target.value) })}
                                        />
                                    </div>

                                    <div className="space-y-3">
                                        <label className="text-[10px] font-bold uppercase tracking-widest text-nutrity-gray-text/60">¿Cómo percibes tu condición?</label>
                                        <div className="grid grid-cols-1 gap-2">
                                            {[
                                                { id: "fear", label: "Es una condena, tengo miedo.", icon: "😰" },
                                                { id: "frustration", label: "Es difícil, me genera frustración.", icon: "😤" },
                                                { id: "control", label: "Sé que puedo tomar el control.", icon: "💪" }
                                            ].map((opt) => (
                                                <button
                                                    key={opt.id}
                                                    onClick={() => setFormData({ ...formData, diabetesPerception: opt.id })}
                                                    className={`w-full text-left p-4 rounded-xl border-2 flex items-center gap-3 transition-all ${formData.diabetesPerception === opt.id ? 'border-nutrity-accent bg-nutrity-accent/5' : 'border-nutrity-border'}`}
                                                >
                                                    <span className="text-lg">{opt.icon}</span>
                                                    <span className="text-xs font-bold">{opt.label}</span>
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    <div className="space-y-3">
                                        <label className="text-[10px] font-bold uppercase tracking-widest text-nutrity-gray-text/60">Nivel de Compromiso (12 Semanas)</label>
                                        <div className="grid grid-cols-1 gap-2">
                                            {[
                                                { id: "100", label: "Sí, estoy listo/a al 100%.", icon: "🚀" },
                                                { id: "maybe", label: "Tengo dudas, pero quiero intentarlo.", icon: "🤔" }
                                            ].map((opt) => (
                                                <button
                                                    key={opt.id}
                                                    onClick={() => setFormData({ ...formData, commitment: opt.id })}
                                                    className={`w-full text-left p-4 rounded-xl border-2 flex items-center gap-3 transition-all ${formData.commitment === opt.id ? 'border-nutrity-accent bg-nutrity-accent/5' : 'border-nutrity-border'}`}
                                                >
                                                    <span className="text-lg">{opt.icon}</span>
                                                    <span className="text-xs font-bold">{opt.label}</span>
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* SECTION 5: BIO-PERSONALIZATION */}
                        {step === 5 && (
                            <div className="space-y-6">
                                <div className="space-y-1">
                                    <div className="flex items-center gap-2 text-nutrity-accent mb-1">
                                        <Dna className="w-5 h-5" />
                                        <span className="text-[10px] font-bold uppercase tracking-widest">Sección 5</span>
                                    </div>
                                    <h3 className="text-2xl font-display font-bold">Bio-Consciencia.</h3>
                                    <p className="text-nutrity-gray-text text-sm">¿Qué tanto conoces la medicina de Biodescodificación?</p>
                                </div>

                                <div className="grid grid-cols-1 gap-3">
                                    {[
                                        { id: "nothing", label: "Nada", icon: "🌑", desc: "No conozco el término" },
                                        { id: "little", label: "Un Poco", icon: "🌒", desc: "He escuchado conceptos básicos" },
                                        { id: "heard", label: "Escuché hablar", icon: "🌓", desc: "Tengo una idea general" },
                                        { id: "enough", label: "Suficiente", icon: "🌔", desc: "Entiendo la conexión mente-cuerpo" },
                                        { id: "much", label: "Mucho", icon: "🌕", desc: "Aplico biodescodificación en mi vida" }
                                    ].map((opt) => (
                                        <button
                                            key={opt.id}
                                            onClick={() => setFormData({ ...formData, biodescodification: opt.id })}
                                            className={`p-4 rounded-xl border-2 flex items-center gap-4 transition-all ${formData.biodescodification === opt.id ? 'border-nutrity-accent bg-nutrity-accent/5' : 'border-nutrity-border hover:bg-nutrity-bg'}`}
                                        >
                                            <span className="text-2xl">{opt.icon}</span>
                                            <div className="text-left">
                                                <p className="text-xs font-bold">{opt.label}</p>
                                                <p className="text-[8px] font-bold uppercase text-nutrity-gray-text/40">{opt.desc}</p>
                                            </div>
                                        </button>
                                    ))}
                                </div>

                                <div className="p-4 bg-nutrity-bg rounded-xl border border-nutrity-border">
                                    <p className="text-[10px] text-center text-nutrity-gray-text">
                                        Al finalizar, la IA procesará tus 13 marcadores para generar tu protocolo de remisión metabólica personalizado.
                                    </p>
                                </div>
                            </div>
                        )}

                        {/* Navigation Footer */}
                        <div className="pt-8 border-t border-nutrity-border flex items-center justify-between gap-4 mt-8">
                            <button
                                onClick={handleBack}
                                disabled={step === 1}
                                className="px-6 py-3 rounded-xl text-nutrity-gray-text font-bold hover:bg-nutrity-bg transition-all disabled:opacity-0"
                            >
                                Atrás
                            </button>
                            <button
                                onClick={handleNext}
                                disabled={
                                    (step === 1 && (!formData.weight || !formData.height || !formData.waist)) ||
                                    (step === 2 && !formData.fastingGlucose) ||
                                    (step === 4 && (!formData.diabetesPerception || !formData.commitment)) ||
                                    (step === 5 && !formData.biodescodification) || 
                                    isSyncing
                                }
                                className="flex-1 bg-nutrity-accent text-white py-4 rounded-xl font-bold flex items-center justify-center gap-2 shadow-lg shadow-nutrity-accent/20 hover:opacity-90 transition-all active:scale-[0.98] disabled:opacity-40"
                            >
                                {isSyncing ? (
                                    <div className="flex items-center gap-2">
                                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                        <span>Procesando Bio-Plan...</span>
                                    </div>
                                ) : (
                                    <>
                                        <span>{step === totalSteps ? "Obtener Mi Bio-Plan" : "Continuar"}</span>
                                        <ChevronRight className="w-5 h-5" />
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </motion.div>
            </AnimatePresence>

            {/* Footer Trust Tag */}
            <div className="mt-8 flex flex-col items-center gap-2 opacity-30">
                <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.2em]">
                    <Shield className="w-3 h-3" />
                    <span>Protocolo de Seguridad HIPAA Compliant</span>
                </div>
            </div>
        </div>
    );
}
