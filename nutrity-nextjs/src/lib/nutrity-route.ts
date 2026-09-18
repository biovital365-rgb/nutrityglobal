import type { MetabolicPlan, OnboardingData, RouteAction } from '@/lib/schemas';

const stages = [
  { weeks: '1–2', title: 'Observar y preparar', objective: 'Reconocer rutinas actuales y elegir cambios pequeños que puedas sostener.' },
  { weeks: '3–4', title: 'Ordenar la alimentación', objective: 'Dar estructura a las comidas y priorizar alimentos mínimamente procesados.' },
  { weeks: '5–6', title: 'Moverse con regularidad', objective: 'Incorporar movimiento seguro y progresivo dentro de la vida diaria.' },
  { weeks: '7–8', title: 'Proteger descanso y energía', objective: 'Crear una rutina de sueño y observar su relación con energía y apetito.' },
  { weeks: '9–10', title: 'Consolidar', objective: 'Repetir lo que funciona y preparar alternativas para días difíciles.' },
  { weeks: '11–12', title: 'Revisar y continuar', objective: 'Comparar hábitos registrados y acordar el siguiente ciclo con el equipo de salud.' },
];

const baseActions: RouteAction[] = [
  { id: 'balanced-plate', category: 'ALIMENTACION', title: 'Construye una comida equilibrada', description: 'En una comida principal, combina verduras, una fuente de proteína y una porción que se ajuste a tu contexto y preferencias.', frequency: '5 días esta semana', completed: false },
  { id: 'gentle-movement', category: 'MOVIMIENTO', title: 'Añade movimiento breve', description: 'Realiza una caminata suave de 10 minutos o una actividad equivalente que sea segura para ti. Detente si aparecen molestias.', frequency: '4 días esta semana', completed: false },
  { id: 'sleep-window', category: 'SUENO', title: 'Protege una hora de descanso', description: 'Elige una hora aproximada para comenzar tu rutina nocturna y reduce pantallas durante los 30 minutos previos.', frequency: '5 noches esta semana', completed: false },
  { id: 'daily-note', category: 'SEGUIMIENTO', title: 'Registra una observación diaria', description: 'Anota energía, hambre, sueño o un indicador medido por ti. Nutrity no estima valores clínicos.', frequency: '1 registro al día', completed: false },
];

export function buildNutrityRoute(input: OnboardingData): MetabolicPlan {
  const name = input.name.split(' ')[0] || 'Hola';
  const actions = baseActions.map(action => ({ ...action }));
  if (input.biggestBarrier === 'time') actions[0] = { ...actions[0], title: 'Planifica una comida sencilla', description: 'Deja definida una combinación simple que puedas repetir en un día con poco tiempo.' };
  if (input.activityLevel === 'sedentary') actions[1] = { ...actions[1], description: 'Comienza con 5 a 10 minutos de movimiento suave, según tu capacidad y las indicaciones de tu profesional.' };
  if (input.sleepQuality === 'poor') actions[2] = { ...actions[2], title: 'Crea una señal de cierre del día' };
  if (input.treatmentSupport === 'no_followup') actions.push({ id: 'care-followup', category: 'APOYO', title: 'Organiza una revisión profesional', description: 'Identifica un profesional habilitado para revisar tus datos, tratamiento y objetivos antes de hacer cambios relevantes.', frequency: 'Agenda o solicita información esta semana', completed: false });

  const goalLabels: Record<OnboardingData['primaryGoal'], string> = {
    food: 'dar estructura a tu alimentación', movement: 'incorporar movimiento regular', energy: 'observar hábitos relacionados con tu energía', tracking: 'crear un registro claro de tu progreso', consistency: 'convertir cambios pequeños en una rutina sostenible',
  };

  return {
    routeVersion: '2.0', currentWeek: 1, phase: 'Semana 1 · Observar y preparar', meta: goalLabels[input.primaryGoal],
    insight: `${name}, tu primera semana se centra en acciones pequeñas y observables. Esta ruta es educativa y debe adaptarse con tu profesional si tienes tratamiento, limitaciones o síntomas.`,
    pillars: [
      { icon: 'Utensils', title: 'Alimentación cotidiana', desc: 'Ordena decisiones simples sin dietas extremas ni promesas clínicas.', color: 'bg-emerald-600', tag: 'Alimentación' },
      { icon: 'Activity', title: 'Movimiento seguro', desc: 'Suma actividad de forma gradual y acorde con tu capacidad.', color: 'bg-blue-600', tag: 'Movimiento' },
      { icon: 'Moon', title: 'Descanso y recuperación', desc: 'Observa horarios, calidad del sueño y energía durante el día.', color: 'bg-indigo-600', tag: 'Sueño' },
      { icon: 'ClipboardCheck', title: 'Seguimiento comprensible', desc: 'Registra hechos; Nutrity no predice glucosa ni resultados clínicos.', color: 'bg-amber-600', tag: 'Seguimiento' },
    ],
    weeklyActions: actions.slice(0, 5), stages,
    progressIndicators: ['Acciones semanales completadas', 'Días con registro', 'Energía percibida', 'Datos medidos e ingresados por ti'],
    safety: {
      level: input.treatmentSupport === 'no_followup' ? 'CONSULT' : 'ROUTINE',
      message: input.treatmentSupport === 'no_followup' ? 'Conviene revisar esta ruta con un profesional habilitado antes de realizar cambios relevantes.' : 'Mantén tus controles y sigue las indicaciones de tu equipo de salud.',
      emergencyMessage: 'Nutrity no atiende urgencias. Ante dolor de pecho, dificultad para respirar, confusión, desmayo o vómitos persistentes, busca atención de emergencia local.',
    },
    coachCallToAction: 'Si necesitas apoyo para sostener estas acciones, solicita acompañamiento de un coach autorizado y mantén a tu profesional de salud informado.',
    superfoods: [], updatedAt: new Date().toISOString(),
  };
}
