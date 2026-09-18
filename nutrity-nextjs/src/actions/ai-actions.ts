'use server';

import { GoogleGenerativeAI } from '@google/generative-ai';
import { prisma } from '@/lib/prisma';
import { buildNutrityRoute } from '@/lib/nutrity-route';
import { MetabolicPlanSchema, OnboardingDataSchema, WeeklyMenuSchema, type MetabolicPlan, type OnboardingData, type WeeklyMenu } from '@/lib/schemas';
import { safeJsonParse } from '@/lib/utils';
import { requireUser, requireUserAccess } from '@/lib/authz';

const MODEL = 'gemini-2.5-flash';

function model(json = false) {
  const apiKey = process.env.GEMINI_API_KEY || process.env.VITE_GEMINI_API_KEY;
  if (!apiKey) throw new Error('El servicio de IA no está configurado');
  return new GoogleGenerativeAI(apiKey).getGenerativeModel({
    model: MODEL,
    ...(json ? { generationConfig: { responseMimeType: 'application/json' } } : {}),
  });
}

export async function generateNutrityRoute(rawData: OnboardingData): Promise<MetabolicPlan> {
  const data = OnboardingDataSchema.parse(rawData);
  if (data.urgentSymptoms.length > 0) {
    throw new Error('SAFETY_STOP');
  }
  return MetabolicPlanSchema.parse(buildNutrityRoute(data));
}

// Compatibilidad temporal con clientes anteriores. La salida ya no contiene diagnóstico ni predicciones.
export async function generateAILifePlan(data: OnboardingData) {
  return generateNutrityRoute(data);
}

const menuRules = `
Actúa como asistente educativo de planificación de comidas, no como profesional médico.
No diagnostiques, no prometas resultados, no indiques dosis terapéuticas y no sugieras cambios de medicación.
Usa alimentos comunes y accesibles, evita restricciones extremas y recomienda adaptar alergias, tratamiento y porciones con un profesional.
`;

export async function generateSingleDayMenu(patientProfile: string, dayName: string, legacyContext?: string): Promise<Record<string, string>> {
  await requireUser();
  void legacyContext;
  const prompt = `${menuRules}\nContexto proporcionado por la persona:\n${patientProfile.slice(0, 3000)}\nGenera un ejemplo educativo para ${dayName} con breakfast, lunch, snack, dinner y metabolicGoal. Devuelve solo JSON.`;
  const result = await model(true).generateContent(prompt);
  return safeJsonParse(result.response.text());
}

export async function generateAIWeeklyMenu(plan: MetabolicPlan, userName: string): Promise<WeeklyMenu> {
  await requireUser();
  const prompt = `${menuRules}
Genera un ejemplo semanal para ${userName.slice(0, 80)}. Objetivo de hábitos: ${plan.meta}. Incluye lunes a domingo; cada día debe tener breakfast, lunch, snack, dinner y metabolicGoal. Devuelve solo JSON.`;
  const result = await model(true).generateContent(prompt);
  return WeeklyMenuSchema.parse(safeJsonParse(result.response.text()));
}

export async function regenerateMeal(plan: MetabolicPlan, day: string, slot: string, currentMeal: string): Promise<string> {
  await requireUser();
  const prompt = `${menuRules}\nPropón una alternativa breve para ${slot} del ${day}. Objetivo: ${plan.meta}. Alternativa actual: ${currentMeal}. Responde en máximo 20 palabras.`;
  const result = await model().generateContent(prompt);
  return result.response.text().trim().replace(/^"|"$/g, '');
}

export async function getAICoachResponse(messages: Array<{ role: string; text: string }>, context: { name?: string; phase?: string; meta?: string }) {
  await requireUser();
  const recent = messages.slice(-8).map(message => `${message.role}: ${message.text.slice(0, 1000)}`).join('\n');
  const prompt = `Eres un asistente educativo de hábitos de Nutrity Global. No diagnosticas, no prescribes, no interpretas síntomas como causas emocionales y no sustituyes atención profesional.
Si aparecen síntomas de alarma, indica buscar atención de emergencia local. Si preguntan por medicación, remite al profesional tratante.
Persona: ${context.name || 'Usuario'}. Etapa: ${context.phase || 'Ruta Nutrity'}. Objetivo: ${context.meta || 'hábitos sostenibles'}.
Conversación:\n${recent}\nResponde en español, con máximo 160 palabras y una sola acción práctica y segura.`;
  const result = await model().generateContent(prompt);
  return result.response.text();
}

export async function generateAIWeeklyMenuSecure(userId: string, phase: string) {
  try {
    const { target } = await requireUserAccess(userId, { coachAllowed: true });
    if (target.plan === 'FREE') return { success: false, error: 'REQUIRES_UPGRADE', message: 'Tu plan no incluye generación de menú.' };

    const since = new Date();
    since.setHours(0, 0, 0, 0);
    const dailyGenerations = await prisma.dailyMenu.count({ where: { userId: target.id, createdAt: { gte: since } } });
    if (dailyGenerations >= 14) return { success: false, error: 'RATE_LIMIT', message: 'Alcanzaste el límite de generación por hoy.' };

    const evaluation = await prisma.evaluation.findFirst({ where: { userId: target.id }, orderBy: { createdAt: 'desc' }, select: { results: true } });
    const route = MetabolicPlanSchema.safeParse(evaluation?.results);
    if (!route.success) return { success: false, error: 'ROUTE_REQUIRED', message: 'Completa primero tu Ruta Nutrity.' };

    const weekly = await generateAIWeeklyMenu(route.data, target.name || 'Paciente Nutrity');
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const weekStart = tomorrow.toISOString().split('T')[0];
    const keys = ['domingo', 'lunes', 'martes', 'miercoles', 'jueves', 'viernes', 'sabado'] as const;
    const rows = Array.from({ length: 7 }, (_, index) => {
      const date = new Date(tomorrow);
      date.setDate(tomorrow.getDate() + index);
      const menu = weekly[keys[date.getDay()]];
      return {
        id: crypto.randomUUID(), userId: target.id, organizationId: target.organizationId,
        date: date.toISOString().split('T')[0], weekStart, phase: phase.slice(0, 80), status: 'PENDING', progress: 100,
        menuData: { breakfast: menu.breakfast, lunch: menu.lunch, snack: menu.snack, dinner: menu.dinner }, metabolicGoal: menu.metabolicGoal,
      };
    });

    await prisma.$transaction([
      prisma.dailyMenu.deleteMany({ where: { userId: target.id, weekStart } }),
      prisma.dailyMenu.createMany({ data: rows }),
    ]);
    return { success: true, menuDays: await prisma.dailyMenu.findMany({ where: { userId: target.id, weekStart }, orderBy: { date: 'asc' } }) };
  } catch (error: unknown) {
    console.error('[WEEKLY_MENU_GENERATION]', error);
    return { success: false, error: error instanceof Error ? error.message : 'No se pudo generar el menú' };
  }
}
