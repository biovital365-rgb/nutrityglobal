export interface OnboardingData {
    name: string;
    age: string;
    condition: string;
    currentGlucose: string;
    interest: string;
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
}

export function generateMetabolicPlan(data: OnboardingData): MetabolicPlan {
    const age = parseInt(data.age) || 55;

    // Base Score logic
    let score = 65;
    if (data.condition === 'prevention') score += 15;
    if (data.currentGlucose === 'normal') score += 10;
    if (data.currentGlucose === 'very_high') score -= 10;

    // Phase logic
    let phase = "Activación";
    if (data.condition === 'diabetes') phase = "Remisión Intensiva";
    if (data.condition === 'resistance') phase = "Optimización Insulínica";

    // Meta logic
    let meta = "Estabilizar Glucosa Post-Prandial";
    if (data.condition === 'diabetes') meta = "Reducción de HbA1c";

    // Pillars logic based on interest and condition
    const pillars = [];

    // Pillar 1: Superfood
    if (data.interest === 'tarwi' || data.condition === 'diabetes') {
        pillars.push({
            icon: "Droplets",
            title: "Protocolo Tarwi Ionizado",
            desc: "30g en ayunas para sensibilizar receptores de insulina.",
            color: "bg-nutrity-blue",
            tag: "Nutrición"
        });
    } else if (data.interest === 'yacon' || data.condition === 'resistance') {
        pillars.push({
            icon: "Droplets",
            title: "Jarabe de Yacón Concentrado",
            desc: "Inulina natural para regular el pico glucémico.",
            color: "bg-nutrity-blue",
            tag: "Nutrición"
        });
    } else {
        pillars.push({
            icon: "Droplets",
            title: "Quinua Negra Germinada",
            desc: "Antocianinas potentes para reducción de inflamación.",
            color: "bg-nutrity-blue",
            tag: "Nutrición"
        });
    }

    // Pillar 2: Mental/PNL
    pillars.push({
        icon: "Brain",
        title: "Reprogramación Vagal",
        desc: "5 min de respiración coherente antes de cada comida.",
        color: "bg-red-400",
        tag: "PNL"
    });

    // Pillar 3: IA Coach/Lifestyle
    pillars.push({
        icon: "Zap",
        title: "Ventana Metabólica 12/12",
        desc: "Ayuno circadiano para maximizar el ahorro insulínico.",
        color: "bg-orange-400",
        tag: "IA Coach"
    });

    // Insight logic
    const firstName = (data.name || "Paciente").split(' ')[0];
    let insight = `${firstName}, detectamos que tu perfil sugiere una sensibilidad al cortisol nocturno. `;
    if (data.interest === 'maca') {
        insight += "Añadir Maca Negra en tu merienda ayudará a estabilizar la glucosa nocturna.";
    } else {
        insight += "Añadir una dosis extra de Magnesio antes de dormir optimizará tu metabolismo basal.";
    }

    // Mock trend data (descending trend for health app)
    const trendData = [30, 45, 60, 40, 55, 35, 20, 45, 15];

    return {
        remissionScore: score,
        phase,
        meta,
        pillars,
        insight,
        trendData
    };
}
