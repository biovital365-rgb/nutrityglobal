"use server";

import { GoogleGenerativeAI } from "@google/generative-ai";
import { WeeklyMenuSchema, MetabolicPlanSchema, type OnboardingData, type WeeklyMenu, type MetabolicPlan } from "../lib/schemas";

const apiKey = process.env.GEMINI_API_KEY || process.env.NEXT_PUBLIC_GEMINI_API_KEY || "";
const genAI = new GoogleGenerativeAI(apiKey);

const menuModel = genAI.getGenerativeModel({
    model: "gemini-1.5-flash",
    generationConfig: {
        responseMimeType: "application/json",
    }
});

const planModel = genAI.getGenerativeModel({
    model: "gemini-1.5-flash",
    generationConfig: {
        responseMimeType: "application/json",
    }
});

export async function generateAILifePlan(data: OnboardingData): Promise<MetabolicPlan> {
    const prompt = `Actúa como un experto en Medicina de Restauración Biológica y Nutrición de Precisión.
    Analiza los siguientes datos de diagnóstico:
    - Nombre: ${data.name}
    - Edad: ${data.age}
    - Condición: ${data.condition}
    - Glucosa actual: ${data.currentGlucose}
    - Interés: ${data.interest}
    - Estrés: ${data.stressLevel}/10
    - Sueño: ${data.sleepQuality}
    - Digestión: ${data.digestiveHealth}
    
    Genera un Plan Metabólico que incluya:
    1. remissionScore: (1-100) basado en la probabilidad de remisión.
    2. phase: Una fase clínica (ej. "Activación", "Reseteo", "Remisión").
    3. meta: El objetivo clínico maestro.
    4. pillars: Un array de 3 objetos, cada uno con:
       - icon: Nombre de icono Lucide (Activity, Brain, Zap, Target, Leaf, Heart).
       - title: Título del pilar.
       - desc: Descripción estratégica.
       - color: Una clase de fondo Tailwind (ej. "bg-nutrity-blue", "bg-orange-400", "bg-red-400").
       - tag: Etiqueta (ej. "Nutrición", "Mente", "Cuerpo").
    5. insight: Un análisis clínico empoderador.
    6. biodescodificacion: Un mensaje profundo sobre la raíz emocional del síntoma (ej. resistencia, miedo al futuro) basado en NMG.
    7. biodescodificacionRecommendations: Un array de 4 acciones de consciencia/emocionales.
    8. trendData: Un array de 9 números que representen la curva proyectada de glucosa.
    9. holisticStats: 4 objetos con { label, value (1-100), color (clase bg-...) }.
    10. superfoods: Lista de 3 alimentos andinos clave.
    
    Responde estrictamente en JSON.`;

    try {
        const result = await planModel.generateContent(prompt);
        const text = result.response.text();
        const cleanText = text.replace(/^\s*```(?:json)?\n?|\n?```\s*$/g, '');
        const json = JSON.parse(cleanText);
        return MetabolicPlanSchema.parse(json);
    } catch (error) {
        console.error("AI Life Plan generation failed:", error);
        throw error;
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
        const model = genAI.getGenerativeModel({ model: "gemini-3-flash-preview" });
        const result = await model.generateContent(prompt);
        return result.response.text().trim().replace(/^"|"$/g, '');
    } catch (error) {
        console.error("Meal regeneration failed:", error);
        return currentMeal; 
    }
}

export async function getAICoachResponse(messages: any[], context: any) {
    const model = genAI.getGenerativeModel({ model: "gemini-3-flash-preview" });
    
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
