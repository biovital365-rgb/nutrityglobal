import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
    ChevronRight,
    ChevronLeft,
    Activity,
    CheckCircle2,
    Zap,
    Heart,
    Brain,
    Shield
} from "lucide-react";

interface OnboardingProps {
    onComplete: (data: any) => void;
    onBack?: () => void;
}

export function NutrityOnboarding({ onComplete, onBack }: OnboardingProps) {
    const [step, setStep] = useState(1);
    const [isSyncing, setIsSyncing] = useState(false);
    const [formData, setFormData] = useState({
        name: "",
        age: "",
        condition: "resistance",
        currentGlucose: "normal",
        interest: ""
    });

    const totalSteps = 4;

    const handleNext = () => {
        console.log("handleNext triggered, current step:", step);
        if (step < totalSteps) {
            setStep(step + 1);
        } else {
            console.log("Onboarding completed with data:", formData);
            setIsSyncing(true);
            onComplete(formData);
        }
    };

    const handleBack = () => {
        if (step > 1) setStep(step - 1);
    };

    const steps = [
        { title: "Perfil Inicial", icon: Activity },
        { title: "Salud Metabólica", icon: Heart },
        { title: "Niveles Glucosa", icon: Zap },
        { title: "Personalización", icon: Brain }
    ];

    return (
        <div className="min-h-screen bg-nutrity-bg flex flex-col items-center justify-center p-6 text-nutrity-primary font-body">
            {/* Header / Logo */}
            <div className="flex items-center gap-3 mb-10">
                <div className="w-10 h-10 bg-nutrity-accent rounded-xl flex items-center justify-center shadow-lg shadow-nutrity-accent/20">
                    <Activity className="w-6 h-6 text-white" />
                </div>
                <div>
                    <h2 className="text-xl font-display font-bold leading-none">Nutrity</h2>
                    <span className="text-[10px] font-bold text-nutrity-accent uppercase tracking-widest leading-none">Global AI Evaluation</span>
                </div>
            </div>

            {/* Stepper Indicator */}
            <div className="w-full max-w-sm flex items-center gap-2 mb-8">
                {steps.map((s, idx) => (
                    <div key={idx} className="flex-1 flex flex-col gap-1.5">
                        <div className={`h-1 rounded-full transition-all duration-500 ${idx + 1 <= step ? 'bg-nutrity-accent' : 'bg-nutrity-border'}`} />
                        <span className={`text-[8px] font-bold uppercase tracking-widest text-center transition-colors ${idx + 1 === step ? 'text-nutrity-accent' : 'text-nutrity-gray-text opacity-40'}`}>{s.title.split(' ')[0]}</span>
                    </div>
                ))}
            </div>

            {/* Wizard Card */}
            <AnimatePresence mode="wait">
                <motion.div
                    key={step}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    className="w-full max-w-lg nutrity-card bg-white p-8 md:p-10"
                >
                    <div className="space-y-8">
                        {step === 1 && (
                            <div className="space-y-6">
                                <div className="space-y-1">
                                    <h3 className="text-2xl font-display font-bold">Bienvenido a Nutrity.</h3>
                                    <p className="text-nutrity-gray-text text-sm">Comencemos configurando tu perfil básico para el motor de IA.</p>
                                </div>
                                <div className="space-y-4">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-bold uppercase tracking-widest text-nutrity-gray-text">Tu Nombre Completo</label>
                                        <input
                                            type="text"
                                            placeholder="Ej: Freddy Yungas"
                                            className="w-full bg-nutrity-bg border border-nutrity-border rounded-xl px-5 py-4 focus:ring-2 focus:ring-nutrity-accent/20 focus:border-nutrity-accent outline-none font-medium transition-all"
                                            value={formData.name}
                                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-bold uppercase tracking-widest text-nutrity-gray-text">Edad</label>
                                        <input
                                            type="number"
                                            placeholder="Ej: 55"
                                            className="w-full bg-nutrity-bg border border-nutrity-border rounded-xl px-5 py-4 focus:ring-2 focus:ring-nutrity-accent/20 focus:border-nutrity-accent outline-none font-medium transition-all"
                                            value={formData.age}
                                            onChange={(e) => setFormData({ ...formData, age: e.target.value })}
                                        />
                                    </div>
                                </div>
                            </div>
                        )}

                        {step === 2 && (
                            <div className="space-y-6">
                                <div className="space-y-1">
                                    <h3 className="text-2xl font-display font-bold">Estado Metabólico.</h3>
                                    <p className="text-nutrity-gray-text text-sm">¿Cuál es tu diagnóstico médico actual?</p>
                                </div>
                                <div className="grid grid-cols-1 gap-3">
                                    {[
                                        { id: "prevention", title: "Bienestar & Longevidad", desc: "Quiero prevenir y optimizar mi metabolismo." },
                                        { id: "resistance", title: "Resistencia Insulínica", desc: "Tengo síntomas de fatiga o pre-diabetes." },
                                        { id: "diabetes", title: "Remisión de Diabetes", desc: "Diagnóstico confirmado de Diabetes Tipo 2." }
                                    ].map((opt) => (
                                        <button
                                            key={opt.id}
                                            onClick={() => setFormData({ ...formData, condition: opt.id })}
                                            className={`w-full text-left p-4 rounded-xl border-2 transition-all ${formData.condition === opt.id ? 'border-nutrity-accent bg-nutrity-accent/5' : 'border-nutrity-border hover:bg-nutrity-bg'}`}
                                        >
                                            <div className="flex justify-between items-center">
                                                <span className="font-bold text-sm">{opt.title}</span>
                                                {formData.condition === opt.id && <CheckCircle2 className="w-5 h-5 text-nutrity-accent" />}
                                            </div>
                                            <p className="text-xs text-nutrity-gray-text mt-1">{opt.desc}</p>
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}

                        {step === 3 && (
                            <div className="space-y-6">
                                <div className="space-y-1">
                                    <h3 className="text-2xl font-display font-bold">Lectura de Glucosa.</h3>
                                    <p className="text-nutrity-gray-text text-sm">¿Cómo ha estado tu glucosa en ayunas esta semana?</p>
                                </div>
                                <div className="grid grid-cols-3 gap-3">
                                    {[
                                        { id: "normal", label: "Óptimo", sub: "<100 mg/dL" },
                                        { id: "high", label: "Elevado", sub: "100-125" },
                                        { id: "very_high", label: "Crítico", sub: ">126 mg/dL" }
                                    ].map((opt) => (
                                        <button
                                            key={opt.id}
                                            onClick={() => setFormData({ ...formData, currentGlucose: opt.id })}
                                            className={`flex flex-col items-center p-4 rounded-xl border-2 transition-all gap-2 ${formData.currentGlucose === opt.id ? 'border-nutrity-accent bg-nutrity-accent/5 text-nutrity-accent' : 'border-nutrity-border hover:bg-nutrity-bg text-nutrity-gray-text'}`}
                                        >
                                            <span className="text-sm font-bold">{opt.label}</span>
                                            <span className="text-[10px] font-bold opacity-60 uppercase">{opt.sub}</span>
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}

                        {step === 4 && (
                            <div className="space-y-6">
                                <div className="space-y-1">
                                    <h3 className="text-2xl font-display font-bold">Bio-Optimización.</h3>
                                    <p className="text-nutrity-gray-text text-sm">¿En qué superalimento andino te gustaría enfocar tu plan?</p>
                                </div>
                                <div className="grid grid-cols-2 gap-3">
                                    {[
                                        { id: "tarwi", label: "Tarwi", icon: "🌱" },
                                        { id: "quinoa", label: "Quinoa Negra", icon: "💎" },
                                        { id: "maca", label: "Maca Negra", icon: "⚡" },
                                        { id: "yacon", label: "Yacón", icon: "💧" }
                                    ].map((opt) => (
                                        <button
                                            key={opt.id}
                                            onClick={() => setFormData({ ...formData, interest: opt.id })}
                                            className={`p-4 rounded-xl border-2 transition-all flex flex-col items-center gap-2 ${formData.interest === opt.id ? 'border-nutrity-accent bg-nutrity-accent/5' : 'border-nutrity-border hover:bg-nutrity-bg'}`}
                                        >
                                            <span className="text-2xl">{opt.icon}</span>
                                            <span className="text-sm font-bold">{opt.label}</span>
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}

                        <div className="pt-8 border-t border-nutrity-border flex items-center justify-between gap-4">
                            <button
                                onClick={handleBack}
                                disabled={step === 1}
                                className="px-6 py-3 rounded-xl text-nutrity-gray-text font-bold hover:bg-nutrity-bg transition-all disabled:opacity-0"
                            >
                                Atrás
                            </button>
                            <button
                                onClick={handleNext}
                                disabled={(step === 1 && !formData.name) || (step === 4 && !formData.interest) || isSyncing}
                                className="flex-1 bg-nutrity-accent text-white py-4 rounded-xl font-bold flex items-center justify-center gap-2 shadow-lg hover:bg-indigo-600 transition-all active:scale-[0.98] disabled:opacity-40"
                            >
                                {isSyncing ? (
                                    <span className="animate-pulse">Sincronizando...</span>
                                ) : (
                                    <>
                                        {step === totalSteps ? "Sincronizar Bio-Plan" : "Continuar"}
                                        <ChevronRight className="w-5 h-5" />
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </motion.div>
            </AnimatePresence>

            <div className="mt-10 flex items-center gap-2 text-[10px] font-bold text-nutrity-gray-text/40 uppercase tracking-widest text-center">
                <Shield className="w-3.5 h-3.5" />
                Seguro Médico Encriptado AES-256
            </div>
        </div>
    );
}
