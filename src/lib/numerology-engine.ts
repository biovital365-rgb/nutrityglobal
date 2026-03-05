/**
 * Motor de Numerología Kabalística
 * Reducción Teosófica y Gematría
 */

/**
 * Reduce un número a un solo dígito, opcionalmente manteniendo números maestros (11, 22, 33).
 */
export function reduceNumber(num: number, keepMaster: boolean = true): number {
  if (keepMaster && (num === 11 || num === 22 || num === 33)) {
    return num;
  }
  if (num < 10) return num;
  
  const sum = num.toString().split('').reduce((acc, digit) => acc + parseInt(digit, 10), 0);
  return reduceNumber(sum, keepMaster);
}

/**
 * Mapeo de Gematría (Pitágoras/Estándar para alfabeto latino)
 * A=1, B=2, C=3, D=4, E=5, F=6, G=7, H=8, I=9
 * J=1, K=2, L=3, M=4, N=5, O=6, P=7, Q=8, R=9
 * S=1, T=2, U=3, V=4, W=5, X=6, Y=7, Z=8
 */
const gematriaMap: Record<string, number> = {
  a: 1, j: 1, s: 1,
  b: 2, k: 2, t: 2,
  c: 3, l: 3, u: 3,
  d: 4, m: 4, v: 4,
  e: 5, n: 5, w: 5,
  f: 6, o: 6, x: 6,
  g: 7, p: 7, y: 7,
  h: 8, q: 8, z: 8,
  i: 9, r: 9,
  ñ: 5, // Ñ mapeada a N (5)
};

export function getGematriaValue(text: string): number {
  // Normalizar para quitar acentos y convertir a minúsculas
  const normalized = text.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
  let sum = 0;
  for (const char of normalized) {
    if (gematriaMap[char]) {
      sum += gematriaMap[char];
    }
  }
  return sum;
}

/**
 * Misión de Vida (Camino de Vida): Suma de día, mes y año reducidos.
 */
export function calculateSoulPath(dob: Date): number {
  const day = reduceNumber(dob.getUTCDate());
  const month = reduceNumber(dob.getUTCMonth() + 1);
  const year = reduceNumber(dob.getUTCFullYear());
  
  const sum = day + month + year;
  return reduceNumber(sum);
}

/**
 * Esencia (Alma): Día de nacimiento reducido.
 */
export function calculateEssence(dob: Date): number {
  return reduceNumber(dob.getUTCDate());
}

/**
 * Regalo Divino: Últimos dos dígitos del año de nacimiento reducidos.
 */
export function calculateDivineGift(dob: Date): number {
  const yearStr = dob.getUTCFullYear().toString();
  const lastTwo = parseInt(yearStr.slice(-2), 10);
  return reduceNumber(lastTwo);
}

/**
 * Año Personal: Suma del día, mes de nacimiento y el año actual.
 */
export function calculatePersonalYear(dob: Date, currentYear: number = new Date().getFullYear()): number {
  const day = reduceNumber(dob.getUTCDate());
  const month = reduceNumber(dob.getUTCMonth() + 1);
  const year = reduceNumber(currentYear);
  
  const sum = day + month + year;
  return reduceNumber(sum);
}

/**
 * Vibración del Nombre: Suma de todas las letras del nombre completo.
 */
export function calculateVibrationalName(name: string): number {
  const totalValue = getGematriaValue(name);
  return reduceNumber(totalValue);
}

export interface NumerologyMap {
  esencia: number;
  mision: number;
  nombre: number;
  anoPersonal: number;
  regalo: number;
}

export function generateFullMap(name: string, dob: Date): NumerologyMap {
  return {
    esencia: calculateEssence(dob),
    mision: calculateSoulPath(dob),
    nombre: calculateVibrationalName(name),
    anoPersonal: calculatePersonalYear(dob),
    regalo: calculateDivineGift(dob),
  };
}
