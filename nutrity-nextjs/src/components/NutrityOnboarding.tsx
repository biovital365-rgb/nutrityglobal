"use client";
import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
    ChevronRight,
    Activity,
    Brain,
    Shield,
    Dna,
    Target,
    Scale,
    Thermometer,
    Flame,
    Stethoscope,
    Check,
} from "lucide-react";

// ── Opciones y Data NMG ───────────────────────────────────────────────────────
const BIOLOGICAL_SYSTEMS = [
    { id: "digestivo", label: "Digestivo", emoji: "🫁", desc: "Estómago, hígado, intestinos" },
    { id: "endocrino", label: "Endocrino / Metabólico", emoji: "⚗️", desc: "Glucosa, insulina, tiroides" },
    { id: "inmune", label: "Inmunológico", emoji: "🛡️", desc: "Inflamación, alergias" },
    { id: "nervioso", label: "Sistema Nervioso", emoji: "🧠", desc: "Ansiedad, insomnio, estrés" },
];

const DHS_OPTIONS = [
    { id: "shock_familiar", label: "Sí, un conflicto familiar o pérdida inesperada." },
    { id: "shock_laboral", label: "Sí, un golpe laboral, económico o de territorio." },
    { id: "shock_identidad", label: "Sí, una situación donde me sentí desvalorizado/a." },
    { id: "no_recuerdo", label: "No logro identificar un evento específico." },
    { id: "otro", label: "Otro (Especificar)" },
];

const WEIGHT_RANGES = ["Menos de 60 kg", "60 - 75 kg", "76 - 90 kg", "91 - 105 kg", "Más de 105 kg", "Otro"];
const HEIGHT_RANGES = ["Menos de 150 cm", "150 - 165 cm", "166 - 180 cm", "Más de 180 cm", "Otro"];
const WAIST_RANGES = ["Menos de 80 cm", "80 - 94 cm", "95 - 102 cm", "Más de 102 cm", "Otro"];
const GLUCOSE_RANGES = ["< 100 mg/dL (Normal)", "100 - 125 mg/dL (Pre)", "126 - 150 mg/dL", "> 150 mg/dL", "No lo sé", "Otro"];
const HBA1C_RANGES = ["< 5.7% (Normal)", "5.7% - 6.4% (Pre)", "6.5% - 8.0%", "> 8.0%", "No lo sé", "Otro"];

const MEDS_OPTIONS = [
    "Metformina",
    "Insulina",
    "Inhibidores SGLT2 (Empagliflozina, etc)",
    "GLP-1 (Ozempic, Saxenda, etc)",
    "Glibenclamida / Sulfonilureas",
    "Ninguno",
    "Otro"
];

const DIET_OPTIONS = [
    { id: "real_food", label: "Comida real y densa en nutrientes (equilibrada)." },
    { id: "procesados", label: "Normal, pero consumo harinas y procesados regularmente." },
    { id: "alta_carbos", label: "Alta en carbohidratos refinados, azúcares y snacks." },
    { id: "restrictiva", label: "Dietas restrictivas (Keto, etc) sin resultados sostenibles." },
    { id: "otro", label: "Otro (Especificar)" },
];

const ENERGY_OPTIONS = [
    { id: "vitalidad", label: "Me siento con vitalidad y ligero/a." },
    { id: "pesadez", label: "Siento pesadez y sueño (mal del puerco)." },
    { id: "ansiedad", label: "Ansiedad por comer algo dulce poco después." },
];

interface OnboardingProps {
    onComplete: (data: any) => void;
    onBack?: () => void;
    onAuthClick?: () => void;
}

export function NutrityOnboarding({ onComplete, onBack, onAuthClick }: OnboardingProps) {
    const [step, setStep] = useState(1);
    const [isSyncing, setIsSyncing] = useState(false);
    
    const [formData, setFormData] = useState({
        // ── PASO 1: Triaje Holístico NMG ──
        mainSymptom: "",
        affectedSystem: "",
        dhsEvent: "",
        dhsEventOther: "",
        // ── PASO 2: Fotografía Física ──
        name: "",
        age: "",
        weightRange: "",
        weightOther: "",
        heightRange: "",
        heightOther: "",
        waistRange: "",
        waistOther: "",
        // ── PASO 3: Bioquímica ──
        hba1cRange: "",
        hba1cOther: "",
        fastingGlucoseRange: "",
        fastingGlucoseOther: "",
        medsDiabetes: [] as string[],
        medsDiabetesOther: "",
        // ── PASO 4: Hábitos ──
        dietType: "",
        dietOther: "",
        energyAfterMeal: "",
        sleepHours: "",
        // ── PASO 5: PNL & Emocional ──
        stressLevel: 5,
        diabetesPerception: "",
        commitment: "",
        // ── PASO 6: Bio-Consciencia ──
        biodescodification: "",
    });

    const totalSteps = 6;

    const steps = [
        { title: "Triaje", icon: Stethoscope },
        { title: "Física", icon: Scale },
        { title: "Laboratorio", icon: Thermometer },
        { title: "Pilares", icon: Flame },
        { title: "Mente", icon: Brain },
        { title: "Bio-Plan", icon: Dna },
    ];

    const toggleMed = (med: string) => {
        setFormData(prev => {
            if (med === "Ninguno") return { ...prev, medsDiabetes: ["Ninguno"] };
            const newMeds = prev.medsDiabetes.includes(med)
                ? prev.medsDiabetes.filter(m => m !== med)
                : [...prev.medsDiabetes.filter(m => m !== "Ninguno"), med];
            return { ...prev, medsDiabetes: newMeds };
        });
    };

    const handleNext = () => {
        if (step < totalSteps) {
            setStep(prev => prev + 1);
        } else {
            setIsSyncing(true);
            const enrichedData = {
                ...formData,
                currentGlucose: formData.fastingGlucoseRange || "110",
                interest: "Remisión metabólica",
                sleepQuality: "regular",
                digestiveHealth: "regular",
            };
            onComplete(enrichedData);
        }
    };

    const handleBack = () => {
        if (step > 1) setStep(step - 1);
    };

    // Validación estricta por paso
    const isNextDisabled = (() => {
        if (isSyncing) return true;
        if (step === 1) return !formData.mainSymptom || !formData.affectedSystem || !formData.dhsEvent || (formData.dhsEvent === "otro" && !formData.dhsEventOther);
        if (step === 2) return !formData.name || !formData.age || !formData.weightRange || !formData.heightRange || !formData.waistRange || (formData.weightRange === "Otro" && !formData.weightOther) || (formData.heightRange === "Otro" && !formData.heightOther) || (formData.waistRange === "Otro" && !formData.waistOther);
        if (step === 3) return !formData.fastingGlucoseRange || (formData.fastingGlucoseRange === "Otro" && !formData.fastingGlucoseOther) || formData.medsDiabetes.length === 0 || (formData.medsDiabetes.includes("Otro") && !formData.medsDiabetesOther);
        if (step === 4) return !formData.dietType || (formData.dietType === "otro" && !formData.dietOther) || !formData.energyAfterMeal || !formData.sleepHours;
        if (step === 5) return !formData.diabetesPerception || !formData.commitment;
        if (step === 6) return !formData.biodescodification;
        return false;
    })();

    // Helper para inputs "Otros"
    const renderOtherInput = (value: string, onChange: (val: string) => void, placeholder: string) => (
        <motion.input
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            type="text"
            placeholder={placeholder}
            className="w-full mt-2 bg-landing-cream border border-landing-gold/30 rounded-xl px-4 py-3 focus:ring-2 focus:ring-landing-gold/50 focus:border-landing-gold outline-none font-medium text-sm text-landing-forest"
            value={value}
            onChange={(e) => onChange(e.target.value)}
        />
    );

    return (
        <div className="min-h-screen bg-landing-cream flex flex-col items-center justify-center p-4 md:p-6 text-landing-forest font-body overflow-x-hidden">
            {/* Header Premium */}
            <div className="flex flex-col items-center gap-2 mb-8 text-center">
                <div className="w-12 h-12 bg-landing-forest rounded-2xl flex items-center justify-center shadow-lg shadow-landing-forest/20 border border-landing-gold/30">
                    <Activity className="w-6 h-6 text-landing-gold" />
                </div>
                <div>
                    <h2 className="text-2xl font-serif font-bold text-landing-forest">BioVital 365</h2>
                    <span className="text-[10px] font-bold text-landing-gold uppercase tracking-[0.2em]">Remisión Metabólica</span>
                </div>
            </div>

            {/* Stepper Elegante */}
            <div className="w-full max-w-lg grid grid-cols-6 gap-1.5 mb-8">
                {steps.map((s, idx) => (
                    <div key={idx} className="flex flex-col gap-2">
                        <div className={`h-1.5 rounded-full transition-all duration-700 ${idx + 1 <= step ? "bg-landing-gold" : "bg-landing-forest/10"}`} />
                        <div className="flex flex-col items-center">
                            <s.icon className={`w-4 h-4 mb-1 transition-colors ${idx + 1 === step ? "text-landing-forest" : "text-landing-forest/30"}`} />
                            <span className={`text-[8px] font-bold uppercase tracking-tighter text-center transition-colors ${idx + 1 === step ? "text-landing-forest" : "text-landing-forest/40"}`}>{s.title}</span>
                        </div>
                    </div>
                ))}
            </div>

            <AnimatePresence mode="wait">
                <motion.div
                    key={step}
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -15 }}
                    className="w-full max-w-2xl"
                >
                    <div className="bg-white p-6 md:p-10 rounded-2xl shadow-2xl shadow-landing-navy/5 border border-landing-gold/20">

                        {/* ── PASO 1: TRIAJE HOLÍSTICO NMG ── */}
                        {step === 1 && (
                            <div className="space-y-8">
                                <div className="space-y-2 text-center">
                                    <div className="inline-flex items-center justify-center gap-2 text-landing-gold mb-2 px-3 py-1 bg-landing-gold/10 rounded-full">
                                        <Stethoscope className="w-4 h-4" />
                                        <span className="text-[10px] font-bold uppercase tracking-widest">Paso 1 · Triaje Clínico</span>
                                    </div>
                                    <h3 className="text-3xl font-serif font-bold text-landing-forest">Evaluación de Raíz</h3>
                                    <p className="text-landing-forest/70 text-sm max-w-md mx-auto">La remisión comienza entendiendo qué mensaje intenta comunicarnos tu cuerpo.</p>
                                </div>

                                <div className="space-y-3">
                                    <label className="text-[11px] font-bold uppercase tracking-widest text-landing-forest/60">1. Selecciona tu síntoma o malestar principal</label>
                                    <div className="grid grid-cols-2 gap-3">
                                        {["Resistencia a la Insulina / Pre-diabetes", "Glucosa Alta / Diabetes T2", "Hígado Graso", "Sobrepeso / Obesidad", "Fatiga Crónica", "Otro"].map(sym => (
                                            <button
                                                key={sym}
                                                onClick={() => setFormData({ ...formData, mainSymptom: sym })}
                                                className={`p-3 rounded-xl border-2 text-xs font-semibold transition-all text-left ${formData.mainSymptom === sym ? "border-landing-gold bg-landing-gold/5 text-landing-forest" : "border-landing-forest/10 text-landing-forest/70 hover:border-landing-gold/40"}`}
                                            >
                                                {sym}
                                            </button>
                                        ))}
                                    </div>
                                    {formData.mainSymptom === "Otro" && renderOtherInput(formData.dhsEventOther /* reusing for brevity or better add symptomOther */, (val) => setFormData({ ...formData, mainSymptom: val }), "Describe tu síntoma...")}
                                </div>

                                <div className="space-y-3">
                                    <label className="text-[11px] font-bold uppercase tracking-widest text-landing-forest/60">2. Sistema biológico más afectado</label>
                                    <div className="grid grid-cols-2 gap-3">
                                        {BIOLOGICAL_SYSTEMS.map((sys) => (
                                            <button
                                                key={sys.id}
                                                onClick={() => setFormData({ ...formData, affectedSystem: sys.id })}
                                                className={`p-3 rounded-xl border-2 flex items-center gap-3 transition-all text-left ${formData.affectedSystem === sys.id ? "border-landing-gold bg-landing-gold/5" : "border-landing-forest/10 hover:border-landing-gold/40"}`}
                                            >
                                                <span className="text-xl">{sys.emoji}</span>
                                                <div>
                                                    <p className="text-[11px] font-bold text-landing-forest">{sys.label}</p>
                                                    <p className="text-[9px] text-landing-forest/50 hidden sm:block">{sys.desc}</p>
                                                </div>
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <div className="space-y-3">
                                    <label className="text-[11px] font-bold uppercase tracking-widest text-landing-forest/60">3. Indagación Emocional (DHS)</label>
                                    <p className="text-xs text-landing-forest/70">¿Recuerdas haber vivido una situación inesperada, dramática y vivida en soledad poco antes de que apareciera tu síntoma?</p>
                                    <div className="grid grid-cols-1 gap-2">
                                        {DHS_OPTIONS.map((opt) => (
                                            <button
                                                key={opt.id}
                                                onClick={() => setFormData({ ...formData, dhsEvent: opt.id })}
                                                className={`w-full text-left p-4 rounded-xl border-2 transition-all ${formData.dhsEvent === opt.id ? "border-landing-gold bg-landing-gold/5 text-landing-forest font-bold" : "border-landing-forest/10 text-landing-forest/70 hover:border-landing-gold/40 font-medium"}`}
                                            >
                                                <span className="text-sm">{opt.label}</span>
                                            </button>
                                        ))}
                                    </div>
                                    {formData.dhsEvent === "otro" && renderOtherInput(formData.dhsEventOther, (val) => setFormData({ ...formData, dhsEventOther: val }), "Describe brevemente la situación...")}
                                </div>
                            </div>
                        )}

                        {/* ── PASO 2: FOTOGRAFÍA METABÓLICA ── */}
                        {step === 2 && (
                            <div className="space-y-8">
                                <div className="space-y-2 text-center">
                                    <div className="inline-flex items-center justify-center gap-2 text-landing-gold mb-2 px-3 py-1 bg-landing-gold/10 rounded-full">
                                        <Scale className="w-4 h-4" />
                                        <span className="text-[10px] font-bold uppercase tracking-widest">Paso 2 · Biometría</span>
                                    </div>
                                    <h3 className="text-3xl font-serif font-bold text-landing-forest">Tu Fotografía Actual</h3>
                                    <p className="text-landing-forest/70 text-sm">Conocer tus métricas nos permite trazar la ruta exacta hacia tu peso de reactivación metabólica.</p>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label className="text-[11px] font-bold uppercase tracking-widest text-landing-forest/60">Nombre completo</label>
                                        <input type="text" placeholder="Ej: María Pérez" className="w-full bg-landing-cream border border-landing-forest/10 rounded-xl px-4 py-3 focus:ring-2 focus:ring-landing-gold/50 focus:border-landing-gold outline-none font-medium text-landing-forest" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[11px] font-bold uppercase tracking-widest text-landing-forest/60">Edad</label>
                                        <input type="number" placeholder="Ej: 45" className="w-full bg-landing-cream border border-landing-forest/10 rounded-xl px-4 py-3 focus:ring-2 focus:ring-landing-gold/50 focus:border-landing-gold outline-none font-medium text-landing-forest" value={formData.age} onChange={(e) => setFormData({ ...formData, age: e.target.value })} />
                                    </div>
                                </div>

                                <div className="space-y-3">
                                    <label className="text-[11px] font-bold uppercase tracking-widest text-landing-forest/60">Rango de Peso</label>
                                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                                        {WEIGHT_RANGES.map(range => (
                                            <button key={range} onClick={() => setFormData({ ...formData, weightRange: range })} className={`py-3 rounded-xl border-2 text-xs font-bold transition-all ${formData.weightRange === range ? "border-landing-gold bg-landing-gold/5 text-landing-forest" : "border-landing-forest/10 text-landing-forest/60 hover:border-landing-gold/40"}`}>{range}</button>
                                        ))}
                                    </div>
                                    {formData.weightRange === "Otro" && renderOtherInput(formData.weightOther, (val) => setFormData({ ...formData, weightOther: val }), "Especifica tu peso en kg...")}
                                </div>

                                <div className="space-y-3">
                                    <label className="text-[11px] font-bold uppercase tracking-widest text-landing-forest/60">Rango de Estatura</label>
                                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                                        {HEIGHT_RANGES.map(range => (
                                            <button key={range} onClick={() => setFormData({ ...formData, heightRange: range })} className={`py-3 rounded-xl border-2 text-xs font-bold transition-all ${formData.heightRange === range ? "border-landing-gold bg-landing-gold/5 text-landing-forest" : "border-landing-forest/10 text-landing-forest/60 hover:border-landing-gold/40"}`}>{range}</button>
                                        ))}
                                    </div>
                                    {formData.heightRange === "Otro" && renderOtherInput(formData.heightOther, (val) => setFormData({ ...formData, heightOther: val }), "Especifica tu estatura en cm...")}
                                </div>

                                <div className="space-y-3">
                                    <label className="text-[11px] font-bold uppercase tracking-widest text-landing-forest/60">Perímetro Abdominal (Aprox)</label>
                                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                                        {WAIST_RANGES.map(range => (
                                            <button key={range} onClick={() => setFormData({ ...formData, waistRange: range })} className={`py-3 rounded-xl border-2 text-xs font-bold transition-all ${formData.waistRange === range ? "border-landing-gold bg-landing-gold/5 text-landing-forest" : "border-landing-forest/10 text-landing-forest/60 hover:border-landing-gold/40"}`}>{range}</button>
                                        ))}
                                    </div>
                                    {formData.waistRange === "Otro" && renderOtherInput(formData.waistOther, (val) => setFormData({ ...formData, waistOther: val }), "Especifica tu perímetro en cm...")}
                                </div>
                            </div>
                        )}

                        {/* ── PASO 3: BIOQUÍMICA ── */}
                        {step === 3 && (
                            <div className="space-y-8">
                                <div className="space-y-2 text-center">
                                    <div className="inline-flex items-center justify-center gap-2 text-landing-gold mb-2 px-3 py-1 bg-landing-gold/10 rounded-full">
                                        <Thermometer className="w-4 h-4" />
                                        <span className="text-[10px] font-bold uppercase tracking-widest">Paso 3 · Bioquímica</span>
                                    </div>
                                    <h3 className="text-3xl font-serif font-bold text-landing-forest">Nivel de Sobrecarga</h3>
                                    <p className="text-landing-forest/70 text-sm">Entender cómo tu cuerpo maneja la glucosa nos indica qué estrategia celular aplicar.</p>
                                </div>

                                <div className="space-y-3">
                                    <label className="text-[11px] font-bold uppercase tracking-widest text-landing-forest/60">Glucosa en Ayunas Promedio</label>
                                    <div className="grid grid-cols-2 gap-2">
                                        {GLUCOSE_RANGES.map(range => (
                                            <button key={range} onClick={() => setFormData({ ...formData, fastingGlucoseRange: range })} className={`py-3 px-2 rounded-xl border-2 text-xs font-bold transition-all ${formData.fastingGlucoseRange === range ? "border-landing-gold bg-landing-gold/5 text-landing-forest" : "border-landing-forest/10 text-landing-forest/60 hover:border-landing-gold/40"}`}>{range}</button>
                                        ))}
                                    </div>
                                    {formData.fastingGlucoseRange === "Otro" && renderOtherInput(formData.fastingGlucoseOther, (val) => setFormData({ ...formData, fastingGlucoseOther: val }), "Especifica tu nivel en mg/dL...")}
                                </div>

                                <div className="space-y-3">
                                    <label className="text-[11px] font-bold uppercase tracking-widest text-landing-forest/60">Hemoglobina Glicosilada (HbA1c)</label>
                                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                                        {HBA1C_RANGES.map(range => (
                                            <button key={range} onClick={() => setFormData({ ...formData, hba1cRange: range })} className={`py-3 px-2 rounded-xl border-2 text-xs font-bold transition-all ${formData.hba1cRange === range ? "border-landing-gold bg-landing-gold/5 text-landing-forest" : "border-landing-forest/10 text-landing-forest/60 hover:border-landing-gold/40"}`}>{range}</button>
                                        ))}
                                    </div>
                                    {formData.hba1cRange === "Otro" && renderOtherInput(formData.hba1cOther, (val) => setFormData({ ...formData, hba1cOther: val }), "Especifica tu %...")}
                                </div>

                                <div className="space-y-3">
                                    <label className="text-[11px] font-bold uppercase tracking-widest text-landing-forest/60">Medicación Actual (Selección Múltiple)</label>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                        {MEDS_OPTIONS.map(med => {
                                            const isSelected = formData.medsDiabetes.includes(med);
                                            return (
                                                <button
                                                    key={med}
                                                    onClick={() => toggleMed(med)}
                                                    className={`py-3 px-4 flex items-center justify-between rounded-xl border-2 text-xs font-bold transition-all ${isSelected ? "border-landing-gold bg-landing-gold/5 text-landing-forest" : "border-landing-forest/10 text-landing-forest/60 hover:border-landing-gold/40"}`}
                                                >
                                                    <span>{med}</span>
                                                    {isSelected && <Check className="w-4 h-4 text-landing-gold" />}
                                                </button>
                                            );
                                        })}
                                    </div>
                                    {formData.medsDiabetes.includes("Otro") && renderOtherInput(formData.medsDiabetesOther, (val) => setFormData({ ...formData, medsDiabetesOther: val }), "Escribe tus otros medicamentos...")}
                                </div>
                            </div>
                        )}

                        {/* ── PASO 4: PILARES DE VIDA ── */}
                        {step === 4 && (
                            <div className="space-y-8">
                                <div className="space-y-2 text-center">
                                    <div className="inline-flex items-center justify-center gap-2 text-landing-gold mb-2 px-3 py-1 bg-landing-gold/10 rounded-full">
                                        <Flame className="w-4 h-4" />
                                        <span className="text-[10px] font-bold uppercase tracking-widest">Paso 4 · Pilares</span>
                                    </div>
                                    <h3 className="text-3xl font-serif font-bold text-landing-forest">Nutrición y Hábitos</h3>
                                    <p className="text-landing-forest/70 text-sm">Cada comida es información para tus células. Priorizamos elementos esenciales para reparar tu metabolismo.</p>
                                </div>

                                <div className="space-y-4">
                                    <div className="space-y-3">
                                        <label className="text-[11px] font-bold uppercase tracking-widest text-landing-forest/60">¿Cómo describirías tu alimentación habitual?</label>
                                        <div className="grid grid-cols-1 gap-2">
                                            {DIET_OPTIONS.map((opt) => (
                                                <button key={opt.id} onClick={() => setFormData({ ...formData, dietType: opt.id })} className={`w-full text-left p-4 rounded-xl border-2 transition-all ${formData.dietType === opt.id ? "border-landing-gold bg-landing-gold/5 font-bold" : "border-landing-forest/10 hover:border-landing-gold/40"}`}>
                                                    <span className="text-sm">{opt.label}</span>
                                                </button>
                                            ))}
                                        </div>
                                        {formData.dietType === "otro" && renderOtherInput(formData.dietOther, (val) => setFormData({ ...formData, dietOther: val }), "Describe tu estilo de alimentación...")}
                                    </div>

                                    <div className="space-y-3">
                                        <label className="text-[11px] font-bold uppercase tracking-widest text-landing-forest/60">¿Qué sientes después de una comida fuerte?</label>
                                        <div className="grid grid-cols-1 gap-2">
                                            {ENERGY_OPTIONS.map((opt) => (
                                                <button key={opt.id} onClick={() => setFormData({ ...formData, energyAfterMeal: opt.id })} className={`w-full text-left p-4 rounded-xl border-2 transition-all ${formData.energyAfterMeal === opt.id ? "border-landing-gold bg-landing-gold/5 font-bold" : "border-landing-forest/10 hover:border-landing-gold/40"}`}>
                                                    <span className="text-sm">{opt.label}</span>
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    <div className="space-y-3">
                                        <label className="text-[11px] font-bold uppercase tracking-widest text-landing-forest/60">Horas de Sueño Ininterrumpido</label>
                                        <div className="grid grid-cols-3 gap-2">
                                            {[{ id: "<6", label: "Menos de 6h" }, { id: "6-7", label: "6 a 7h" }, { id: "7-9", label: "7 a 9h" }].map((opt) => (
                                                <button key={opt.id} onClick={() => setFormData({ ...formData, sleepHours: opt.id })} className={`py-3 rounded-xl border-2 text-xs font-bold transition-all ${formData.sleepHours === opt.id ? "border-landing-gold bg-landing-gold/5 text-landing-forest" : "border-landing-forest/10 text-landing-forest/60"}`}>{opt.label}</button>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* ── PASO 5: MENTE & PNL ── */}
                        {step === 5 && (
                            <div className="space-y-8">
                                <div className="space-y-2 text-center">
                                    <div className="inline-flex items-center justify-center gap-2 text-landing-gold mb-2 px-3 py-1 bg-landing-gold/10 rounded-full">
                                        <Brain className="w-4 h-4" />
                                        <span className="text-[10px] font-bold uppercase tracking-widest">Paso 5 · Mente</span>
                                    </div>
                                    <h3 className="text-3xl font-serif font-bold text-landing-forest">Neuro-Programación</h3>
                                    <p className="text-landing-forest/70 text-sm">Tu estado mental influye directamente en tus niveles de cortisol y glucosa.</p>
                                </div>

                                <div className="space-y-6">
                                    <div className="space-y-4">
                                        <div className="flex justify-between items-center bg-landing-cream p-4 rounded-xl border border-landing-forest/10">
                                            <label className="text-[11px] font-bold uppercase tracking-widest text-landing-forest">Nivel de Estrés Actual (1-10)</label>
                                            <span className="text-2xl font-bold text-landing-gold">{formData.stressLevel}</span>
                                        </div>
                                        <input type="range" min="1" max="10" className="w-full accent-landing-gold" value={formData.stressLevel} onChange={(e) => setFormData({ ...formData, stressLevel: parseInt(e.target.value) })} />
                                    </div>

                                    <div className="space-y-3">
                                        <label className="text-[11px] font-bold uppercase tracking-widest text-landing-forest/60">¿Cómo percibes tu proceso de salud?</label>
                                        <div className="grid grid-cols-1 gap-2">
                                            {[
                                                { id: "fear", label: "Con miedo y frustración, siento que es una condena." },
                                                { id: "confusion", label: "Con confusión, he intentado cosas pero nada funciona." },
                                                { id: "control", label: "Con esperanza, sé que con la estrategia correcta puedo revertirlo." },
                                            ].map((opt) => (
                                                <button key={opt.id} onClick={() => setFormData({ ...formData, diabetesPerception: opt.id })} className={`w-full text-left p-4 rounded-xl border-2 transition-all ${formData.diabetesPerception === opt.id ? "border-landing-gold bg-landing-gold/5 font-bold" : "border-landing-forest/10 hover:border-landing-gold/40"}`}>
                                                    <span className="text-sm">{opt.label}</span>
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    <div className="space-y-3">
                                        <label className="text-[11px] font-bold uppercase tracking-widest text-landing-forest/60">Nivel de Compromiso (Programa 12 Semanas)</label>
                                        <div className="grid grid-cols-1 gap-2">
                                            {[
                                                { id: "100", label: "Estoy listo/a para comprometerme al 100%." },
                                                { id: "maybe", label: "Quiero intentarlo, pero me cuesta mantener hábitos." },
                                            ].map((opt) => (
                                                <button key={opt.id} onClick={() => setFormData({ ...formData, commitment: opt.id })} className={`w-full text-left p-4 rounded-xl border-2 transition-all ${formData.commitment === opt.id ? "border-landing-gold bg-landing-gold/5 font-bold" : "border-landing-forest/10 hover:border-landing-gold/40"}`}>
                                                    <span className="text-sm">{opt.label}</span>
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* ── PASO 6: BIO-CONSCIENCIA ── */}
                        {step === 6 && (
                            <div className="space-y-8">
                                <div className="space-y-2 text-center">
                                    <div className="inline-flex items-center justify-center gap-2 text-landing-gold mb-2 px-3 py-1 bg-landing-gold/10 rounded-full">
                                        <Dna className="w-4 h-4" />
                                        <span className="text-[10px] font-bold uppercase tracking-widest">Paso 6 · Síntesis</span>
                                    </div>
                                    <h3 className="text-3xl font-serif font-bold text-landing-forest">Consciencia Corporal</h3>
                                    <p className="text-landing-forest/70 text-sm">La remisión no es perfección. Es recuperar terreno y reescribir tu historia de salud.</p>
                                </div>

                                <div className="space-y-4">
                                    <label className="text-[11px] font-bold uppercase tracking-widest text-landing-forest/60 text-center block">Nivel de familiaridad con Biodescodificación</label>
                                    <div className="grid grid-cols-1 gap-2">
                                        {[
                                            { id: "nada", label: "Es la primera vez que escucho sobre la conexión profunda mente-cuerpo." },
                                            { id: "poco", label: "Conozco un poco, pero nunca lo he aplicado para sanar." },
                                            { id: "mucho", label: "Tengo experiencia previa trabajando mis emociones y síntomas físicos." }
                                        ].map((opt) => (
                                            <button key={opt.id} onClick={() => setFormData({ ...formData, biodescodification: opt.id })} className={`p-5 rounded-xl border-2 flex flex-col gap-1 transition-all text-center ${formData.biodescodification === opt.id ? "border-landing-gold bg-landing-gold/5" : "border-landing-forest/10 hover:border-landing-gold/40"}`}>
                                                <p className="text-sm font-semibold text-landing-forest">{opt.label}</p>
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <div className="p-5 bg-landing-forest text-landing-cream rounded-2xl shadow-inner mt-6">
                                    <p className="text-sm text-center leading-relaxed font-serif italic">
                                        "El conocimiento te da claridad. Tu cuerpo es adaptable y con el estímulo correcto, puede sanar, reparar y funcionar mejor."
                                    </p>
                                </div>
                            </div>
                        )}

                        {/* Navigation Footer */}
                        <div className="pt-8 flex flex-col-reverse md:flex-row items-center justify-between gap-4 mt-8">
                            <button
                                onClick={handleBack}
                                disabled={step === 1}
                                className="w-full md:w-auto px-6 py-4 rounded-xl text-landing-forest font-bold hover:bg-landing-cream transition-all disabled:opacity-0"
                            >
                                Atrás
                            </button>
                            <button
                                onClick={handleNext}
                                disabled={isNextDisabled}
                                className="w-full md:w-auto flex-1 bg-landing-forest text-landing-gold py-4 px-8 rounded-xl font-bold flex items-center justify-center gap-2 shadow-xl shadow-landing-forest/20 hover:opacity-90 transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {isSyncing ? (
                                    <div className="flex items-center gap-3">
                                        <div className="w-5 h-5 border-2 border-landing-gold/30 border-t-landing-gold rounded-full animate-spin" />
                                        <span>Procesando Perfil Metabólico...</span>
                                    </div>
                                ) : (
                                    <>
                                        <span>{step === totalSteps ? "Obtener Mi Mapa de Remisión" : "Siguiente"}</span>
                                        <ChevronRight className="w-5 h-5" />
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </motion.div>
            </AnimatePresence>

            {/* Footer Trust Tag */}
            <div className="mt-12 flex flex-col items-center gap-2 text-landing-forest/40">
                <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.2em]">
                    <Shield className="w-3 h-3" />
                    <span>Plataforma Clínica Segura</span>
                </div>
            </div>
        </div>
    );
}
