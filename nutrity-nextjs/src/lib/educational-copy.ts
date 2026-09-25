const SAFE_REPLACEMENTS: Array<[RegExp, string]> = [
  [/C[oó]digo Vitalidad\s*[—–-]\s*Revertir Diabetes en 12 Semanas/gi, "Código Vitalidad — Hábitos para acompañar la diabetes tipo 2"],
  [/Revertir Diabetes(?: Tipo 2)? en \d+ Semanas/gi, "Hábitos para acompañar la diabetes tipo 2"],
  [/Bioqu[ií]mica de la Remisi[oó]n/gi, "Bases del seguimiento metabólico"],
  [/Aprende a controlar tu glucosa sin renunciar a la vida social\.?/gi, "Aprende a organizar decisiones de alimentación y hábitos también en contextos sociales."],
  [/C[oó]digo Vitalidad:\s*Tu Hoja de Ruta de 90 D[ií]as para Transformar tu Metabolismo/gi, "Código Vitalidad: una ruta de 12 semanas para organizar hábitos sostenibles"],
  [/Descubre un enfoque pr[aá]ctico y estructurado para regular tu glucosa, mejorar tu energ[ií]a y transformar tu salud desde la ra[ií]z, sin depender exclusivamente de soluciones temporales\.?/gi, "Descubre un enfoque educativo para organizar alimentación, actividad, descanso y registros personales de manera gradual."],
  [/C[oó]mo estabilizar tus niveles de az[uú]car de forma natural/gi, "Cómo observar la relación entre tus hábitos y tus registros"],
  [/Qu[eé] comer, cu[aá]ndo y en qu[eé] orden para mejores resultados/gi, "Cómo organizar comidas de manera práctica"],
  [/Este orden reduce los picos de glucosa e insulina hasta en un 73% y puede prevenir diabetes tipo 2, obesidad y enfermedades cardiovasculares\.?/gi, "Este orden puede explorarse como una estrategia educativa para observar saciedad, elecciones alimentarias y registros personales."],
  [/Restaura tu flora intestinal para modular la inflamaci[oó]n sist[eé]mica de bajo grado\.?/gi, "Comprende cómo la alimentación y otros hábitos se relacionan con la microbiota intestinal."],
  [/Aprende a descansar tu sistema digestivo de forma segura y biol[oó]gicamente congruente\.?/gi, "Explora horarios de alimentación y prepara preguntas para revisarlos con un profesional."],
  [/revertirla en \d+ d[ií]as/gi, "organizar hábitos durante 12 semanas"],
  [/revertir(?: una enfermedad| la diabetes| diabetes)?/gi, "acompañar hábitos"],
  [/remisi[oó]n metab[oó]lica/gi, "seguimiento metabólico"],
  [/controlar (?:tu |la )?glucosa/gi, "observar tus registros de glucosa"],
  [/regular (?:tu |la )?glucosa/gi, "observar tus registros de glucosa"],
  [/estabilizar (?:tus niveles de az[uú]car|tu glucosa|la glucosa)(?: de forma natural)?/gi, "observar la relación entre hábitos y registros"],
  [/reduce? los picos de glucosa e insulina(?: hasta en un \d+%)?/gi, "permite observar patrones relacionados con las comidas"],
  [/evitar picos de insulina/gi, "reconocer patrones relacionados con tus comidas"],
  [/prevenir (?:diabetes tipo 2, obesidad y enfermedades cardiovasculares|enfermedades cr[oó]nicas)/gi, "apoyar el bienestar a largo plazo"],
  [/que salva vidas/gi, "para hábitos sostenibles"],
  [/salva vidas/gi, "apoya hábitos sostenibles"],
  [/transformar tu salud metab[oó]lica/gi, "fortalecer tus hábitos cotidianos"],
  [/transformar tu salud desde la ra[ií]z/gi, "organizar hábitos de manera gradual"],
  [/transformar tu metabolismo/gi, "organizar hábitos sostenibles"],
  [/analizar biomarcadores/gi, "organizar los datos registrados"],
  [/an[aá]lisis de biomarcadores/gi, "organización de datos registrados"],
  [/éxito metabólico/gi, "progreso de hábitos"],
];

export function educationalHealthCopy(value: unknown, fallback = "") {
  if (typeof value !== "string") return fallback;
  const safe = SAFE_REPLACEMENTS.reduce(
    (current, [pattern, replacement]) => current.replace(pattern, replacement),
    value,
  ).replace(/\s{2,}/g, " ").trim();
  return safe || fallback;
}

export function plainEducationalText(value: unknown, fallback = "") {
  return educationalHealthCopy(value, fallback)
    .replace(/\*\*(.*?)\*\*/g, "$1")
    .replace(/__(.*?)__/g, "$1");
}
