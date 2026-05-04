export interface OnboardingData {
    name: string;
    age: string;
    condition: string;
    currentGlucose: string;
    interest: string;
    // Nuevos campos holísticos
    weight?: string;
    height?: string;
    activityLevel?: string;
    sleepQuality?: string;
    stressLevel?: string;
    digestiveHealth?: string;
}

export interface MetabolicPlan {
    remissionScore: number;
    phase: string;
    meta: string;
    pillars: {
        icon: string;
        title: string;
        desc: string;
        color: string;
        tag: string;
    }[];
    insight: string;
    trendData: number[];
    holisticStats?: {
        label: string;
        value: number;
        color: string;
    }[];
}

export function generateMetabolicPlan(data: OnboardingData): MetabolicPlan {
    const age = parseInt(data.age) || 55;
    const weight = parseFloat(data.weight || "70");
    const height = parseFloat(data.height || "170") / 100;
    const bmi = weight / (height * height);
    
    const now = new Date();
    const seed = now.getHours() + now.getMinutes(); 

    // 1. Base Score logic con ajustes holísticos
    let score = 60;
    
    // Ajustes por condición y glucosa
    if (data.condition === 'prevention') score += 10;
    if (data.currentGlucose === 'normal') score += 10;
    if (data.currentGlucose === 'very_high') score -= 15;
    
    // Ajustes Holísticos
    if (data.activityLevel === 'active') score += 10;
    if (data.activityLevel === 'sedentary') score -= 5;
    
    if (data.sleepQuality === 'good') score += 5;
    if (data.sleepQuality === 'poor') score -= 10;
    
    if (data.stressLevel === 'high') score -= 10;
    
    if (bmi > 30) score -= 5; // Penalización leve por obesidad (inflamación sistémica)

    // 2. Phase logic
    let phase = "Activación Bio-Integral";
    if (data.condition === 'diabetes') phase = "Remisión Metabólica Profunda";
    if (data.condition === 'resistance') phase = "Reseteo Insulínico";

    // 3. Meta logic
    let meta = "Estabilización de Eje Metabólico";
    if (data.condition === 'diabetes') meta = "Normalización de HbA1c y Salud Celular";
    if (data.stressLevel === 'high') meta += " + Gestión de Cortisol";

    // 4. Pillars logic
    const pillars = [];

    // Pillar 1: Superfood (Basado en interés o condición)
    const foodOptions = [
        { title: "Protocolo Tarwi Ionizado", desc: "30g en ayunas para sensibilizar receptores de insulina.", icon: "Droplets" },
        { title: "Jarabe de Yacón Concentrado", desc: "Inulina natural para regular el pico glucémico y salud intestinal.", icon: "Droplets" },
        { title: "Quinua Negra Germinada", desc: "Antocianinas potentes para reducción de inflamación sistémica.", icon: "Droplets" },
        { title: "Maca Negra Activada", desc: "Adaptógeno para equilibrio del eje HPA y energía.", icon: "Droplets" }
    ];
    
    let mainFood = foodOptions[seed % foodOptions.length];
    if (data.interest === 'tarwi') mainFood = foodOptions[0];
    if (data.interest === 'yacon') mainFood = foodOptions[1];
    if (data.interest === 'quinoa') mainFood = foodOptions[2];
    if (data.interest === 'maca') mainFood = foodOptions[3];
    
    pillars.push({
        ...mainFood,
        color: "bg-nutrity-blue",
        tag: "Nutrición"
    });

    // Pillar 2: Mental/PNL (Ajustado por estrés)
    const pnlOptions = [
        { title: "Coherencia Cardíaca", desc: "Respiración 5-5 para reducir el impacto del cortisol en la glucosa.", icon: "Brain" },
        { title: "Anclaje de Saciedad PNL", desc: "Técnica para reprogramar la respuesta de recompensa dopaminérgica.", icon: "Brain" },
        { title: "Higiene del Sueño Pro", desc: "Bloqueo de luz azul y meditación de descarga mental.", icon: "Brain" }
    ];
    
    let selectedPNL = pnlOptions[seed % pnlOptions.length];
    if (data.stressLevel === 'high') selectedPNL = pnlOptions[0];
    if (data.sleepQuality === 'poor') selectedPNL = pnlOptions[2];

    pillars.push({
        ...selectedPNL,
        color: "bg-red-400",
        tag: "Mente"
    });

    // Pillar 3: Lifestyle (Ajustado por actividad/digestión)
    const lifestyleOptions = [
        { title: "Contracción Muscular Activa", desc: "Ejercicios de fuerza breves post-comida para captar glucosa.", icon: "Zap" },
        { title: "Optimización de Microbiota", desc: "Caminata ligera y probióticos andinos para reducir hinchazón.", icon: "Zap" },
        { title: "Termogénesis Controlada", desc: "Exposición al frío para activar el metabolismo de grasas.", icon: "Zap" }
    ];
    
    let selectedLifestyle = lifestyleOptions[seed % lifestyleOptions.length];
    if (data.digestiveHealth === 'bloating') selectedLifestyle = lifestyleOptions[1];
    if (data.activityLevel === 'sedentary') selectedLifestyle = lifestyleOptions[0];

    pillars.push({
        ...selectedLifestyle,
        color: "bg-orange-400",
        tag: "Cuerpo"
    });

    // 5. Insight logic
    const firstName = (data.name || "Paciente").split(' ')[0];
    let insight = `${firstName}, tu perfil integral revela `;
    
    if (data.stressLevel === 'high' && data.currentGlucose !== 'normal') {
        insight += "que el estrés está disparando tus picos de glucosa incluso en ayunas. El magnesio y la respiración serán tus mejores aliados.";
    } else if (data.sleepQuality === 'poor') {
        insight += "una deuda de recuperación celular. Sin sueño profundo, tu hígado libera glucosa extra por la mañana.";
    } else if (bmi > 30) {
        insight += "un estado de inflamación de bajo grado. Prioriza el Tarwi para mejorar la sensibilidad celular.";
    } else {
        insight += "una oportunidad de optimización mitocondrial. La Quinua Negra potenciará tu energía celular hoy.";
    }

    // 6. Holistic Stats para visualización
    const holisticStats = [
        { label: "Vitalidad", value: data.condition === 'prevention' ? 85 : 65, color: "bg-blue-500" },
        { label: "Metabolismo", value: data.activityLevel === 'active' ? 90 : (data.activityLevel === 'moderate' ? 60 : 30), color: "bg-orange-500" },
        { label: "Regeneración", value: data.sleepQuality === 'good' ? 80 : (data.sleepQuality === 'fair' ? 50 : 20), color: "bg-indigo-500" },
        { label: "Equilibrio", value: data.stressLevel === 'low' ? 85 : (data.stressLevel === 'moderate' ? 55 : 25), color: "bg-red-500" }
    ];

    // Mock trend data
    const trendData = Array.from({ length: 9 }, () => Math.floor(Math.random() * 40) + 30);

    return {
        remissionScore: Math.max(15, Math.min(score, 98)),
        phase,
        meta,
        pillars,
        insight,
        trendData,
        holisticStats
    };
}
