import { z } from 'zod';

export const DayMenuSchema = z.object({ breakfast: z.string(), lunch: z.string(), snack: z.string(), dinner: z.string(), metabolicGoal: z.string() });
export const WeeklyMenuSchema = z.object({
  lunes: DayMenuSchema, martes: DayMenuSchema, miercoles: DayMenuSchema, jueves: DayMenuSchema,
  viernes: DayMenuSchema, sabado: DayMenuSchema, domingo: DayMenuSchema,
});

export const RouteActionSchema = z.object({
  id: z.string(),
  category: z.enum(['ALIMENTACION', 'MOVIMIENTO', 'SUENO', 'SEGUIMIENTO', 'APOYO']),
  title: z.string(), description: z.string(), frequency: z.string(), completed: z.boolean().default(false),
});
export const RouteStageSchema = z.object({ weeks: z.string(), title: z.string(), objective: z.string() });

export const MetabolicPlanSchema = z.object({
  routeVersion: z.literal('2.0'),
  currentWeek: z.number().int().min(1).max(12).default(1),
  phase: z.string(), meta: z.string(), insight: z.string(),
  pillars: z.array(z.object({ icon: z.string(), title: z.string(), desc: z.string(), color: z.string(), tag: z.string() })).min(3).max(5),
  weeklyActions: z.array(RouteActionSchema).min(3).max(5),
  stages: z.array(RouteStageSchema).length(6),
  progressIndicators: z.array(z.string()).min(2).max(5),
  safety: z.object({ level: z.enum(['ROUTINE', 'CONSULT']), message: z.string(), emergencyMessage: z.string() }),
  coachCallToAction: z.string().optional(), superfoods: z.array(z.string()).optional(), updatedAt: z.string(),
});

export const OnboardingDataSchema = z.object({
  name: z.string().trim().min(2).max(120),
  age: z.string().regex(/^\d{1,3}$/),
  condition: z.enum(['prediabetes', 'diabetes2', 'resistance', 'prevention', 'other']),
  currentGlucose: z.string().trim().max(20).optional(),
  measurementContext: z.enum(['fasting', 'after_meal', 'random', 'unknown']).optional(),
  treatmentSupport: z.enum(['medical_followup', 'no_followup', 'prefer_not']),
  activityLevel: z.enum(['sedentary', 'light', 'moderate', 'active']),
  sleepQuality: z.enum(['poor', 'fair', 'good']),
  mealPattern: z.enum(['irregular', 'improvable', 'structured']),
  primaryGoal: z.enum(['food', 'movement', 'energy', 'tracking', 'consistency']),
  biggestBarrier: z.enum(['time', 'cost', 'motivation', 'information', 'support']),
  urgentSymptoms: z.array(z.enum(['chest_pain', 'breathing_difficulty', 'confusion', 'fainting', 'persistent_vomiting'])).default([]),
  privacyConsent: z.literal(true), safetyAcknowledgement: z.literal(true),
});

export type WeeklyMenu = z.infer<typeof WeeklyMenuSchema>;
export type MetabolicPlan = z.infer<typeof MetabolicPlanSchema>;
export type OnboardingData = z.infer<typeof OnboardingDataSchema>;
export type RouteAction = z.infer<typeof RouteActionSchema>;
