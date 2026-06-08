"use server";

import { GoogleGenerativeAI } from "@google/generative-ai";
import { WeeklyMenuSchema, MetabolicPlanSchema, type OnboardingData, type WeeklyMenu, type MetabolicPlan } from "../lib/schemas";
import { supabase } from "@/lib/supabase";
import { getInternalId, getPendingMenu } from "./db-actions";

const apiKey = process.env.GEMINI_API_KEY || process.env.VITE_GEMINI_API_KEY || "";
const genAI = new GoogleGenerativeAI(apiKey);

const menuModel = genAI.getGenerativeModel({
    model: "gemini-2.5-flash",
    generationConfig: {
        responseMimeType: "application/json",
    }
});

const menuModelFallback = genAI.getGenerativeModel({
    model: "gemini-1.5-flash",
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

    const prompt = `Eres el Motor de Decodificación Biológica de Nutrity Global y un Médico/Coach Funcional Integrativo experto.
    Basado en el NotebookLM de BioVital 365, dominas:
    - Nueva Medicina Germánica (NMG) y conflictos biológicos programantes.
    - Nutrición Andina de Precisión (Tarwi, Yacón, Quinua, Maca, Sacha Inchi).
    - Medicina Ayurvédica (Doshas), MTC (Medicina Tradicional China, Los 5 Elementos), PNL Clínica, Naturopatía.
    
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

    A) DECODIFICACIÓN BIOLÓGICA (NMG) Y VISIÓN 360: Identifica:
       - El CONFLICTO EMOCIONAL programante según la NMG (ej: Glucosa alta → Resistencia al cambio).
       - El ÓRGANO o tejido biológico afectado y su función emocional.
       - La FASE biológica actual: ¿Estrés activo (SBS) o Reparación (PCL)?
       - Abordaje desde las 5 disciplinas (NMG, MTC, Ayurveda, PNL, Naturopatía). Relaciona el órgano con el Elemento de la MTC y el Dosha Ayurvédico.

    B) PLAN METABÓLICO: Genera el plan integral de remisión.

    C) LLAMADO A LA ACCIÓN (COACH FUNCIONAL): 
       - Deriva al paciente a agendar una cita en el Calendario del Coach.
       - Sugiere 1-2 materiales de la Academia (eBooks o Cursos) con una breve orientación.

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
      "coachCallToAction": string (texto persuasivo derivando al calendario del coach y recomendando material de la academia),
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

import { createClient } from "@/utils/supabase/server";

export async function generateAIWeeklyMenuSecure(userId: string, phase: string): Promise<any> {
    try {
        const supabase = await createClient();
        // 1. Fetch User Data
        const { data: user, error: userError } = await supabase
            .from('User')
            .select('id, name, age, plan')
            .eq('id', userId)
            .maybeSingle();
            
        if (userError || !user) {
            throw new Error(userError?.message || "Usuario no encontrado");
        }

        if (user.plan === 'FREE') {
            return { success: false, error: "REQUIRES_UPGRADE", message: "Tu plan Freemium no incluye generación de menú automatizado." };
        }

        // --- RATE LIMITING (Anti-abuso IA) ---
        // Verificamos si este usuario ya ha generado más de 2 semanas de menú (14 días) en las últimas 24h
        const todayStr = new Date().toISOString().split('T')[0];
        const { count: dailyGenerations } = await supabase
            .from('DailyMenu')
            .select('*', { count: 'exact', head: true })
            .eq('userId', userId)
            .gte('createdAt', `${todayStr}T00:00:00.000Z`);

        if (dailyGenerations && dailyGenerations >= 14) {
            console.warn(`[RATE LIMIT] Usuario ${userId} superó el límite diario de IA.`);
            return { success: false, error: "RATE_LIMIT", message: "Por seguridad, has alcanzado el límite de re-generación de menús por hoy. Intenta de nuevo mañana." };
        }
        // -------------------------------------

        // 2. Fetch Latest Evaluation
        const { data: evaluations } = await supabase
            .from('Evaluation')
            .select('results')
            .eq('userId', userId)
            .order('timestamp', { ascending: false })
            .limit(1);
            
        const metabolicPlan = evaluations?.[0]?.results as any || null;

        // 3. Fetch Latest BiologicalDiagnosis
        const { data: diagnoses } = await supabase
            .from('BiologicalDiagnosis')
            .select('*')
            .eq('userId', userId)
            .order('createdAt', { ascending: false })
            .limit(1);
            
        const diagnosis = diagnoses?.[0] || null;

        // 4. Construct AI Prompt Context
        const userName = user.name || "Paciente Nutrity";
        const userAge = user.age || "No especificada";
        
        let promptContext = `Paciente: ${userName} (Edad: ${userAge})\n`;
        
        if (metabolicPlan) {
            promptContext += `Fase Metabólica Actual: ${metabolicPlan.phase || 'No especificada'}\n`;
            promptContext += `Meta Clínica Global: ${metabolicPlan.meta || 'No especificada'}\n`;
            if (metabolicPlan.superfoods && Array.isArray(metabolicPlan.superfoods)) {
                promptContext += `Superalimentos Recomendados: ${metabolicPlan.superfoods.join(", ")}\n`;
            }
        }
        
        if (diagnosis) {
            promptContext += `Diagnóstico Biológico (Triaje Holístico - NMG):\n`;
            promptContext += `- Síntoma Principal: ${diagnosis.mainSymptom}\n`;
            promptContext += `- Sistema Afectado: ${diagnosis.affectedSystem}\n`;
            if (diagnosis.symptomDuration) promptContext += `- Duración: ${diagnosis.symptomDuration}\n`;
            if (diagnosis.emotionalContext) promptContext += `- Contexto Emocional: ${diagnosis.emotionalContext}\n`;
            if (diagnosis.nmgConflict) promptContext += `- Raíz Emocional: ${diagnosis.nmgConflict}\n`;
            if (diagnosis.nmgOrgan) promptContext += `- Órgano Afectado: ${diagnosis.nmgOrgan}\n`;
        }

        const prompt = `Eres un Coach de Nutrición Clínica y Chef de Precisión Metabólica para Nutrity Global.
Tu tarea es generar un plan de menú semanal (lunes a domingo) personalizado y alineado exactamente a las necesidades de remisión metabólica del paciente.

INFORMACIÓN DEL PACIENTE:
${promptContext}

FASE SELECCIONADA PARA ESTE MENÚ SEMANAL: Fase ${phase}

REGLAS NUTRICIONALES DE LA FASE SELECCIONADA (${phase}):
- Fase Iniciación: Menú muy bajo en azúcares y carbohidratos refinados, altamente antiinflamatorio, fácil de digerir. Excelente control de glucosa postprandial.
- Fase Intermedia: Introducción de carbohidratos complejos de bajo índice glucémico, mayor variedad, flexibilidad metabólica controlada.
- Fase Avanzada: Optimización hormonal, regeneración celular profunda y mantenimiento a largo plazo.

DIRECTRICES DEL MENÚ:
1. Usa superalimentos andinos obligatoriamente: Quinua, Kiwicha, Cañihua, Maca, Aguaymanto, Tarwi, Sacha Inchi, Cacao puro, Oca Morada.
2. Si el paciente presenta síntomas digestivos en su diagnóstico (ej. colon irritable, acidez, hinchazón), adapta los alimentos para que sean suaves para el intestino (comidas cocidas, fáciles de digerir, caldos antiinflamatorios).
3. Si el paciente presenta un conflicto biológico o estrés (ej. resistencia, desvalorización, miedo), incorpora micronutrientes y superalimentos adaptógenos (como maca o cacao puro) que apoyen el sistema nervioso.
4. El campo "metabolicGoal" de cada día debe ser ultra-específico y explicar por qué este menú apoya al paciente ese día (ej. "Estabilización de glucosa matutina con Tarwi", "Apoyo digestivo antiinflamatorio con Yacón").

Genera un JSON con este formato exacto:
{
  "lunes": { "breakfast": "...", "lunch": "...", "snack": "...", "dinner": "...", "metabolicGoal": "..." },
  "martes": { "breakfast": "...", "lunch": "...", "snack": "...", "dinner": "...", "metabolicGoal": "..." },
  "miercoles": { "breakfast": "...", "lunch": "...", "snack": "...", "dinner": "...", "metabolicGoal": "..." },
  "jueves": { "breakfast": "...", "lunch": "...", "snack": "...", "dinner": "...", "metabolicGoal": "..." },
  "viernes": { "breakfast": "...", "lunch": "...", "snack": "...", "dinner": "...", "metabolicGoal": "..." },
  "sabado": { "breakfast": "...", "lunch": "...", "snack": "...", "dinner": "...", "metabolicGoal": "..." },
  "domingo": { "breakfast": "...", "lunch": "...", "snack": "...", "dinner": "...", "metabolicGoal": "..." }
}

Responde estrictamente en JSON. Sin markdown, sin explicaciones adicionales.`;

        // 5. Generate with Gemini with fallback to 1.5-flash
        let result;
        try {
            console.log("Intentando generar menú con gemini-2.5-flash...");
            result = await menuModel.generateContent(prompt);
        } catch (e: any) {
            console.warn("Fallo con gemini-2.5-flash, intentando fallback con gemini-1.5-flash. Error:", e);
            result = await menuModelFallback.generateContent(prompt);
        }
        
        const text = result.response.text();
        const cleanText = text.replace(/^\s*```(?:json)?\n?|\n?```\s*$/g, '');
        const json = JSON.parse(cleanText);
        const parsedMenu = WeeklyMenuSchema.parse(json);

        // 6. Map and Save in DB
        const internalId = await getInternalId(userId);
        
        // "menú para la semana siguiente, desde el día siguiente a la generación por 7 días"
        // Starting tomorrow
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        const weekStartStr = tomorrow.toISOString().split("T")[0]; // YYYY-MM-DD representing first day (tomorrow)

        const weekdayKeys = ['domingo', 'lunes', 'martes', 'miercoles', 'jueves', 'viernes', 'sabado'];
        const rows = [];
        
        for (let i = 0; i < 7; i++) {
            const d = new Date();
            d.setDate(d.getDate() + 1 + i); // 1 to 7 days offset
            const dateStr = d.toISOString().split('T')[0];
            const dayOfWeekName = weekdayKeys[d.getDay()]; // e.g. "viernes"
            
            const dayData = parsedMenu[dayOfWeekName as keyof typeof parsedMenu] || {};
            
            rows.push({
                id: crypto.randomUUID(),
                userId: internalId,
                date: dateStr,
                weekStart: weekStartStr,
                phase,
                status: 'PENDING',
                menuData: {
                    breakfast:    dayData.breakfast    || '',
                    lunch:        dayData.lunch        || '',
                    dinner:       dayData.dinner       || '',
                    snack:        dayData.snack        || '',
                },
                metabolicGoal: dayData.metabolicGoal || '',
                updatedAt: new Date().toISOString(),
            });
        }

        // Eliminar semana previa para este usuario si existe (re-generación)
        await supabase
            .from('DailyMenu')
            .delete()
            .eq('userId', internalId)
            .eq('weekStart', weekStartStr);

        const { data: inserted, error: insertError } = await supabase
            .from('DailyMenu')
            .insert(rows)
            .select();

        if (insertError) throw insertError;

        // Retornar los días guardados como pendientes para refrescar el UI
        const saved = await getPendingMenu(userId);
        return { success: true, menuDays: saved };
    } catch (error: any) {
        console.error("Secure AI Weekly Menu generation failed:", error);
        return { success: false, error: error.message || String(error) };
    }
}
