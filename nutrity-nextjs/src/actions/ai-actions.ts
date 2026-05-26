"use server";

import { GoogleGenerativeAI } from "@google/generative-ai";
import { WeeklyMenuSchema, MetabolicPlanSchema, type OnboardingData, type WeeklyMenu, type MetabolicPlan } from "../lib/schemas";

const apiKey = process.env.GEMINI_API_KEY || process.env.NEXT_PUBLIC_GEMINI_API_KEY || "";
const genAI = new GoogleGenerativeAI(apiKey);

const menuModel = genAI.getGenerativeModel({
    model: "gemini-2.5-flash",
    generationConfig: {
        responseMimeType: "application/json",
    }
});

const planModel = genAI.getGenerativeModel({
    model: "gemini-2.5-flash",
    generationConfig: {
        responseMimeType: "application/json",
    }
});

export async function generateAILifePlan(data: OnboardingData): Promise<MetabolicPlan> {
    // ── Contexto NMG del síntoma declarado (Triaje Holístico) ──────────────────
    const nmgTriajeContext = data.mainSymptom ? `
    TRIAJE HOLÍSTICO (Nueva Medicina Germánica + Medicina Integrativa):
    - Síntoma Principal: ${data.mainSymptom}
    - Sistema Biológico Afectado: ${data.affectedSystem || 'Por determinar'}
    - Duración del Síntoma: ${data.symptomDuration || 'No especificada'}
    - Contexto Emocional Percibido: ${data.emotionalContext || 'No especificado'}
    - Nivel de Consciencia en Biodescodificación: ${data.biodescodification || 'Básico'}
    ` : '';

    const prompt = `Eres el Motor de Decodificación Biológica de Nutrity Global, experto en:
    - Nueva Medicina Germánica (NMG) y conflictos biológicos programantes
    - Nutrición Andina de Precisión (Tarwi, Yacón, Quinua, Maca, Sacha Inchi)
    - Medicina Ayurvédica, MTC (Medicina Tradicional China), PNL Clínica, Naturopatía
    
    DATOS DEL PACIENTE:
    - Nombre: ${data.name}
    - Edad: ${data.age}
    - Condición Diagnosticada: ${data.condition}
    - Glucosa en Ayunas: ${data.currentGlucose} mg/dL
    - Nivel de Estrés: ${data.stressLevel}/10
    - Calidad de Sueño: ${data.sleepQuality}
    - Salud Digestiva: ${data.digestiveHealth}
    - Actividad Física: ${data.activityLevel}
    - Interés principal: ${data.interest}
    ${nmgTriajeContext}

    PROTOCOLO DE ANÁLISIS OBLIGATORIO:

    A) DECODIFICACIÓN BIOLÓGICA (NMG): Si hay síntoma declarado, identifica:
       - El CONFLICTO EMOCIONAL programante según la NMG (ej: Glucosa alta → Resistencia al cambio, páncreas como "dulzor de la vida")
       - El ÓRGANO o tejido biológico afectado y su función emocional
       - La FASE biológica actual: ¿Estrés activo (SBS) o Reparación (PCL)?
       - Abordaje desde al menos 3 disciplinas (MTC, Ayurveda, PNL, Naturopatía)

    B) PLAN METABÓLICO: Genera el plan integral de remisión.

    RESPONDE con este JSON EXACTO:
    {
      "remissionScore": number (1-100),
      "phase": string (ej: "Activación", "Reseteo Metabólico", "Remisión Profunda"),
      "meta": string (objetivo clínico maestro),
      "pillars": [
        { "icon": string (Lucide icon name), "title": string, "desc": string, "color": string (Tailwind bg class), "tag": string }
      ],
      "insight": string (análisis clínico empoderador, 2-3 oraciones),
      "biodescodificacion": string (mensaje sobre raíz emocional según NMG),
      "biodescodificacionRecommendations": [string, string, string, string],
      "trendData": [number x9] (curva proyectada de glucosa en 9 semanas),
      "holisticStats": [{ "label": string, "value": number (1-100), "color": string }],
      "superfoods": [string, string, string],
      "nmgDiagnosis": {
        "conflict": string (raíz emocional exacta según NMG),
        "organ": string (órgano/tejido afectado y su rol emocional),
        "phase": string ("Estrés Activo (SBS)" | "Reparación (PCL)" | "Equilibrio"),
        "holisticApproach": [
          { "discipline": "NMG", "recommendation": string },
          { "discipline": "MTC", "recommendation": string },
          { "discipline": "Ayurveda", "recommendation": string },
          { "discipline": "PNL", "recommendation": string },
          { "discipline": "Naturopatía", "recommendation": string }
        ]
      }
    }
    
    Responde ÚNICAMENTE con el JSON. Sin markdown, sin explicaciones extra.`;

    try {
        const result = await planModel.generateContent(prompt);
        const text = result.response.text();
        const cleanText = text.replace(/^\s*```(?:json)?\n?|\n?```\s*$/g, '');
        const json = JSON.parse(cleanText);
        return MetabolicPlanSchema.parse(json);
    } catch (error: any) {
        console.error("AI Life Plan generation failed:", error);
        return { _error: error.message || String(error) } as any;
    }
}

export async function generateAIWeeklyMenu(plan: MetabolicPlan, userName: string): Promise<WeeklyMenu> {
    const prompt = `Eres un Chef Clínico de Nutrity Global.
    Genera un menú de 7 días (lunes a domingo) para ${userName}.
    Plan: ${plan.phase}
    Meta: ${plan.meta}
    Superfoods: ${plan.superfoods?.join(", ")}
    
    Reglas:
    1. Desayuno, Almuerzo, Snack y Cena deben ser nutritivos y andinos.
    2. Usa ingredientes como Tarwi, Yacón, Quinua, Maca, Sacha Inchi.
    3. El metabolicGoal debe ser específico para el día (ej. "Control de pico matutino").
    
    Genera un JSON con este formato:
    {
      "lunes": { "breakfast": "...", "lunch": "...", "snack": "...", "dinner": "...", "metabolicGoal": "..." },
      "martes": { "breakfast": "...", "lunch": "...", "snack": "...", "dinner": "...", "metabolicGoal": "..." },
      "miercoles": { "breakfast": "...", "lunch": "...", "snack": "...", "dinner": "...", "metabolicGoal": "..." },
      "jueves": { "breakfast": "...", "lunch": "...", "snack": "...", "dinner": "...", "metabolicGoal": "..." },
      "viernes": { "breakfast": "...", "lunch": "...", "snack": "...", "dinner": "...", "metabolicGoal": "..." },
      "sabado": { "breakfast": "...", "lunch": "...", "snack": "...", "dinner": "...", "metabolicGoal": "..." },
      "domingo": { "breakfast": "...", "lunch": "...", "snack": "...", "dinner": "...", "metabolicGoal": "..." }
    }
    
    Responde estrictamente en JSON.`;

    try {
        const result = await menuModel.generateContent(prompt);
        const text = result.response.text();
        const cleanText = text.replace(/^\s*```(?:json)?\n?|\n?```\s*$/g, '');
        const json = JSON.parse(cleanText);
        return WeeklyMenuSchema.parse(json);
    } catch (error) {
        console.error("AI Weekly Menu generation failed:", error);
        throw error;
    }
}

export async function regenerateMeal(plan: MetabolicPlan, day: string, slot: string, currentMeal: string): Promise<string> {
    const prompt = `Eres un Chef Clínico de Nutrity Global.
    El usuario desea cambiar su "${slot}" del día "${day}".
    
    Contexto Actual:
    - Fase: ${plan.phase}
    - Meta: ${plan.meta}
    - Plato actual a cambiar: "${currentMeal}"
    
    Reglas:
    1. Propón una alternativa diferente pero que cumpla los mismos objetivos metabólicos.
    2. Usa superfoods andinos (Tarwi, Yacón, Quinua, etc.).
    3. Responde SOLO con el nombre y una breve descripción del nuevo plato (máximo 15 palabras).
    
    Respuesta:`;

    try {
        const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
        const result = await model.generateContent(prompt);
        return result.response.text().trim().replace(/^"|"$/g, '');
    } catch (error) {
        console.error("Meal regeneration failed:", error);
        return currentMeal; 
    }
}

export async function getAICoachResponse(messages: any[], context: any) {
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
    
    const systemPrompt = `Eres Nutrity Coach IA V8, experto en Medicina de Restauración y NMG.
    Contexto del usuario:
    - Nombre: ${context.name}
    - Fase: ${context.phase}
    - Meta: ${context.meta}
    
    Directrices:
    1. Usa rigor científico andino.
    2. Transforma el miedo en acción (PNL).
    3. Responde en máximo 200 palabras.`;

    const chat = model.startChat({
        history: [
            { role: "user", parts: [{ text: systemPrompt }] },
            { role: "model", parts: [{ text: "Entendido. Estoy listo para asistir." }] },
            ...messages.slice(-6).map(m => ({
                role: m.role === 'user' ? 'user' : 'model',
                parts: [{ text: m.text }]
            }))
        ]
    });

    const result = await chat.sendMessage(messages[messages.length - 1].text);
    return result.response.text();
}
