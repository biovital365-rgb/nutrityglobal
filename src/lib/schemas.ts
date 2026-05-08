import { z } from 'zod';

export const DayMenuSchema = z.object({
  breakfast: z.string(),
  lunch: z.string(),
  snack: z.string(),
  dinner: z.string(),
  metabolicGoal: z.string()
});

export const WeeklyMenuSchema = z.object({
  lunes: DayMenuSchema,
  martes: DayMenuSchema,
  miercoles: DayMenuSchema,
  jueves: DayMenuSchema,
  viernes: DayMenuSchema,
  sabado: DayMenuSchema,
  domingo: DayMenuSchema
});

export const MetabolicPlanSchema = z.object({
  remissionScore: z.number(),
  phase: z.string(),
  meta: z.string(),
  pillars: z.array(z.object({
    icon: z.string(),
    title: z.string(),
    desc: z.string(),
    color: z.string(),
    tag: z.string()
  })),
  insight: z.string(),
  trendData: z.array(z.number()),
  holisticStats: z.array(z.object({
    label: z.string(),
    value: z.number(),
    color: z.string()
  })).optional(),
  superfoods: z.array(z.string()).optional()
});

export const OnboardingDataSchema = z.object({
  name: z.string(),
  age: z.string(),
  condition: z.string(),
  currentGlucose: z.string(),
  interest: z.string(),
  weight: z.string().optional(),
  height: z.string().optional(),
  activityLevel: z.string().optional(),
  sleepQuality: z.string().optional(),
  stressLevel: z.string().optional(),
  digestiveHealth: z.string().optional(),
  waist: z.string().optional()
});

export type WeeklyMenu = z.infer<typeof WeeklyMenuSchema>;
export type MetabolicPlan = z.infer<typeof MetabolicPlanSchema>;
export type OnboardingData = z.infer<typeof OnboardingDataSchema>;
