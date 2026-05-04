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
    const now = new Date();
    const seed = now.getHours() + now.getMinutes(); // Variación diaria mínima

    // Base Score logic with age adjustment
    let score = 65;
    if (data.condition === 'prevention') score += 15;
    if (data.currentGlucose === 'normal') score += 10;
    if (data.currentGlucose === 'very_high') score -= 15;
    if (age > 60) score -= 5; // Factor de edad en regeneración

    // Phase logic
    let phase = "Activación";
    if (data.condition === 'diabetes') phase = "Remisión Intensiva";
    if (data.condition === 'resistance') phase = "Optimización Insulínica";

    // Meta logic
    let meta = "Estabilizar Glucosa Post-Prandial";
    if (data.condition === 'diabetes') meta = "Reducción de HbA1c y Marcadores Inflamatorios";
    if (data.condition === 'prevention') meta = "Longevidad y Flexibilidad Metabólica";

    // Pillars logic
    const pillars = [];

    // Pillar 1: Superfood (Dynamic selection)
    const foodOptions = [
        { title: "Protocolo Tarwi Ionizado", desc: "30g en ayunas para sensibilizar receptores de insulina.", icon: "Droplets" },
        { title: "Jarabe de Yacón Concentrado", desc: "Inulina natural para regular el pico glucémico.", icon: "Droplets" },
        { title: "Quinua Negra Germinada", desc: "Antocianinas potentes para reducción de inflamación.", icon: "Droplets" },
        { title: "Maca Negra Activada", desc: "Adaptógeno para equilibrio del eje HPA y glucosa.", icon: "Droplets" }
    ];
    
    // Seleccionar basado en interés o condición
    let mainFood = foodOptions[seed % foodOptions.length];
    if (data.interest === 'tarwi') mainFood = foodOptions[0];
    if (data.interest === 'yacon') mainFood = foodOptions[1];
    
    pillars.push({
        ...mainFood,
        color: "bg-nutrity-blue",
        tag: "Nutrición"
    });

    // Pillar 2: Mental/PNL
    const pnlOptions = [
        { title: "Reprogramación Vagal", desc: "5 min de respiración coherente antes de cada comida.", icon: "Brain" },
        { title: "Anclaje de Saciedad", desc: "Técnica PNL para identificar hambre real vs emocional.", icon: "Brain" },
        { title: "Visualización Celular", desc: "Meditación guiada para la captación de glucosa.", icon: "Brain" }
    ];
    pillars.push({
        ...pnlOptions[seed % pnlOptions.length],
        color: "bg-red-400",
        tag: "PNL"
    });

    // Pillar 3: IA Coach/Lifestyle
    const lifestyleOptions = [
        { title: "Ventana Metabólica 12/12", desc: "Ayuno circadiano para maximizar el ahorro insulínico.", icon: "Zap" },
        { title: "Caminata Post-Prandial", desc: "15 min de marcha ligera tras comer para aplanar la curva.", icon: "Zap" },
        { title: "Termogénesis Inducida", desc: "Ducha fría matutina para activar grasa parda.", icon: "Zap" }
    ];
    pillars.push({
        ...lifestyleOptions[seed % lifestyleOptions.length],
        color: "bg-orange-400",
        tag: "IA Coach"
    });

    // Insight logic
    const firstName = (data.name || "Paciente").split(' ')[0];
    let insight = `${firstName}, detectamos que tu perfil sugiere una `;
    
    const insights = [
        "sensibilidad al cortisol nocturno. Evita pantallas tras las 21:00.",
        "resistencia a la leptina matutina. Prioriza proteína en el desayuno.",
        "necesidad de optimización mitocondrial. El magnesio será clave hoy.",
        "curva de glucosa inestable. Considera el vinagre de sidra antes de comer."
    ];
    
    insight += insights[seed % insights.length];

    // Mock trend data (dynamic trend)
    const trendData = Array.from({ length: 9 }, () => Math.floor(Math.random() * 50) + 20);

    return {
        remissionScore: Math.min(score, 98),
        phase,
        meta,
        pillars,
        insight,
        trendData
    };
}
