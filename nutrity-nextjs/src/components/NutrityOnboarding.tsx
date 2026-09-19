'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, ArrowRight, Check, HeartPulse, ShieldAlert } from 'lucide-react';
import type { OnboardingData } from '@/lib/schemas';
import { BrandLogo } from '@/components/BrandLogo';
import { trackEvent, trackEventOnce } from '@/lib/analytics';

type Props = {
  onComplete: (data: OnboardingData) => Promise<void> | void;
  onBack: () => void;
  onAuthClick: () => void;
};
type OnboardingDraft = Omit<OnboardingData, 'privacyConsent' | 'safetyAcknowledgement' | 'noUrgentSymptoms'> & {
  privacyConsent: boolean;
  safetyAcknowledgement: boolean;
  noUrgentSymptoms: boolean;
};

const choiceClass = (selected: boolean) => `rounded-2xl border-2 p-4 text-left transition ${selected ? 'border-[#c19b6c] bg-[#c19b6c]/10' : 'border-slate-200 bg-white hover:border-[#c19b6c]/50'}`;

export function NutrityOnboarding({ onComplete, onBack, onAuthClick }: Props) {
  const [step, setStep] = useState(1);
  const [busy, setBusy] = useState(false);
  const [data, setData] = useState<OnboardingDraft>({
    name: '', age: '', condition: 'prediabetes', currentGlucose: '', measurementContext: 'unknown',
    treatmentSupport: 'medical_followup', activityLevel: 'light', sleepQuality: 'fair', mealPattern: 'improvable',
    primaryGoal: 'consistency', biggestBarrier: 'time', barrierOther: '', urgentSymptoms: [], noUrgentSymptoms: false,
    privacyConsent: false, safetyAcknowledgement: false,
  });

  const hasUrgentSymptoms = data.urgentSymptoms.length > 0;
  const canContinue = step === 1
    ? data.name.trim().length >= 2 && Number(data.age) >= 18
    : step === 4
      ? data.privacyConsent === true && data.safetyAcknowledgement === true && data.noUrgentSymptoms === true && !hasUrgentSymptoms
      : true;

  useEffect(() => { trackEventOnce('onboarding_started'); }, []);

  function toggleSymptom(value: OnboardingData['urgentSymptoms'][number]) {
    if (!data.urgentSymptoms.includes(value)) trackEventOnce('onboarding_safety_stop', { outcome: 'urgent_signal_selected' });
    setData(current => ({
      ...current,
      noUrgentSymptoms: false,
      urgentSymptoms: current.urgentSymptoms.includes(value)
        ? current.urgentSymptoms.filter(item => item !== value)
        : [...current.urgentSymptoms, value],
    }));
  }

  async function next() {
    if (!canContinue) return;
    trackEvent('onboarding_step_completed', { step });
    if (step < 4) return setStep(current => current + 1);
    setBusy(true);
    try {
      trackEvent('onboarding_completed');
      await onComplete({ ...data, privacyConsent: true, safetyAcknowledgement: true, noUrgentSymptoms: true });
    } finally { setBusy(false); }
  }

  return (
    <main className="min-h-screen bg-[#fbf8f1] px-4 py-8 text-[#17324d]">
      <div className="mx-auto max-w-3xl">
        <header className="mb-8 flex items-center justify-between">
          <button onClick={onBack} className="flex items-center gap-2 text-sm font-bold"><ArrowLeft className="h-4 w-4" /> Inicio</button>
          <BrandLogo className="hidden h-10 w-auto sm:block" />
          <button onClick={onAuthClick} className="text-sm font-bold underline">Ya tengo cuenta</button>
        </header>

        <section className="overflow-hidden rounded-[2rem] border border-[#c19b6c]/20 bg-white shadow-xl">
          <div className="bg-[#17324d] p-7 text-white md:p-10">
            <p className="text-xs font-bold uppercase tracking-[0.22em] text-[#e6d3a8]">Ruta Nutrity · Paso {step} de 4</p>
            <h1 className="mt-3 text-3xl font-black md:text-4xl">Tu punto de partida</h1>
            <p className="mt-3 max-w-xl text-sm leading-6 text-white/70">Usaremos solo la información necesaria para organizar hábitos educativos. No generamos diagnósticos, pronósticos ni cambios de tratamiento.</p>
            <div className="mt-6 h-2 overflow-hidden rounded-full bg-white/10"><div className="h-full bg-[#c19b6c] transition-all" style={{ width: `${step * 25}%` }} /></div>
          </div>

          <div className="space-y-7 p-7 md:p-10">
            {step === 1 && <>
              <div><h2 className="text-2xl font-bold">Información básica</h2><p className="mt-1 text-sm text-slate-600">La edad mínima para usar esta versión es 18 años.</p></div>
              <label className="block text-sm font-bold">Nombre<input value={data.name} onChange={event => setData({ ...data, name: event.target.value })} maxLength={120} className="mt-2 w-full rounded-xl border p-3 font-normal" /></label>
              <label className="block text-sm font-bold">Edad<input value={data.age} onChange={event => setData({ ...data, age: event.target.value.replace(/\D/g, '').slice(0, 3) })} inputMode="numeric" className="mt-2 w-full rounded-xl border p-3 font-normal" /></label>
              <div><p className="mb-3 text-sm font-bold">¿Qué describe mejor tu situación?</p><div className="grid gap-3 sm:grid-cols-2">{[
                ['prediabetes', 'Prediabetes'], ['diabetes2', 'Diabetes tipo 2'], ['resistance', 'Resistencia a la insulina'], ['prevention', 'Prevención y hábitos'], ['other', 'Otra situación'],
              ].map(([value, label]) => <button key={value} onClick={() => setData({ ...data, condition: value as OnboardingData['condition'] })} className={choiceClass(data.condition === value)}>{label}</button>)}</div></div>
            </>}

            {step === 2 && <>
              <div><h2 className="text-2xl font-bold">Contexto y seguimiento</h2><p className="mt-1 text-sm text-slate-600">El dato de glucosa es opcional y solo se registra si tú lo conoces.</p></div>
              <label className="block text-sm font-bold">Última glucosa registrada, opcional<input value={data.currentGlucose || ''} onChange={event => setData({ ...data, currentGlucose: event.target.value.replace(/[^\d.,]/g, '').slice(0, 20) })} inputMode="decimal" placeholder="Ej. 110" className="mt-2 w-full rounded-xl border p-3 font-normal" /></label>
              <div><p className="mb-3 text-sm font-bold">Contexto de esa medición</p><div className="grid gap-3 sm:grid-cols-2">{[
                ['fasting', 'En ayunas'], ['after_meal', 'Después de comer'], ['random', 'Otro momento'], ['unknown', 'No lo sé'],
              ].map(([value, label]) => <button key={value} onClick={() => setData({ ...data, measurementContext: value as OnboardingData['measurementContext'] })} className={choiceClass(data.measurementContext === value)}>{label}</button>)}</div></div>
              <div><p className="mb-3 text-sm font-bold">Acompañamiento actual</p><div className="grid gap-3">{[
                ['medical_followup', 'Tengo seguimiento con un profesional'], ['no_followup', 'No tengo seguimiento actualmente'], ['prefer_not', 'Prefiero no responder'],
              ].map(([value, label]) => <button key={value} onClick={() => setData({ ...data, treatmentSupport: value as OnboardingData['treatmentSupport'] })} className={choiceClass(data.treatmentSupport === value)}>{label}</button>)}</div></div>
            </>}

            {step === 3 && <>
              <div><h2 className="text-2xl font-bold">Hábitos y objetivo</h2><p className="mt-1 text-sm text-slate-600">No buscamos perfección; buscamos un primer cambio sostenible.</p></div>
              {[
                ['activityLevel', 'Movimiento habitual', [['sedentary', 'Muy poco'], ['light', 'Ligero'], ['moderate', 'Moderado'], ['active', 'Activo']]],
                ['sleepQuality', 'Calidad del sueño', [['poor', 'Difícil'], ['fair', 'Variable'], ['good', 'Buena']]],
                ['mealPattern', 'Organización de comidas', [['irregular', 'Irregular'], ['improvable', 'Mejorable'], ['structured', 'Estructurada']]],
                ['primaryGoal', 'Prioridad inicial', [['food', 'Alimentación'], ['movement', 'Movimiento'], ['energy', 'Energía'], ['tracking', 'Seguimiento'], ['consistency', 'Constancia']]],
                ['biggestBarrier', 'Principal barrera', [['time', 'Tiempo'], ['cost', 'Costo'], ['motivation', 'Motivación'], ['information', 'Exceso de información'], ['support', 'Falta de apoyo'], ['other', 'Otra']]],
              ].map(([field, label, options]) => <div key={field as string}><p className="mb-3 text-sm font-bold">{label as string}</p><div className="flex flex-wrap gap-2">{(options as string[][]).map(([value, text]) => <button key={value} onClick={() => setData({ ...data, [field as string]: value })} className={choiceClass(data[field as keyof OnboardingData] === value)}>{text}</button>)}</div></div>)}
              {data.biggestBarrier === 'other' && <label className="block text-sm font-bold">¿Cuál es tu principal barrera?<input value={data.barrierOther || ''} onChange={event => setData({ ...data, barrierOther: event.target.value })} maxLength={240} placeholder="Cuéntanos brevemente" className="mt-2 w-full rounded-xl border p-3 font-normal" /></label>}
            </>}

            {step === 4 && <>
              <div><h2 className="text-2xl font-bold">Seguridad y consentimiento</h2><p className="mt-1 text-sm text-slate-600">Selecciona únicamente lo que presentas ahora.</p></div>
              <div className="grid gap-3">{[
                ['chest_pain', 'Dolor o presión intensa en el pecho'], ['breathing_difficulty', 'Dificultad importante para respirar'], ['confusion', 'Confusión repentina'], ['fainting', 'Desmayo'], ['persistent_vomiting', 'Vómitos persistentes'],
              ].map(([value, label]) => <label key={value} className="flex cursor-pointer gap-3 rounded-xl border p-4"><input type="checkbox" checked={data.urgentSymptoms.includes(value as OnboardingData['urgentSymptoms'][number])} onChange={() => toggleSymptom(value as OnboardingData['urgentSymptoms'][number])} className="mt-1" /><span>{label}</span></label>)}</div>
              <button type="button" onClick={() => setData(current => ({ ...current, urgentSymptoms: [], noUrgentSymptoms: true }))} className={`${choiceClass(data.noUrgentSymptoms)} flex w-full items-start gap-3`}>
                <span className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border ${data.noUrgentSymptoms ? 'border-[#c19b6c] bg-[#c19b6c] text-white' : 'border-slate-400'}`}>{data.noUrgentSymptoms && <Check className="h-3.5 w-3.5" />}</span>
                <span><strong className="block">Ninguna de las anteriores</strong><span className="mt-1 block text-sm text-slate-600">Quiero continuar con mi Ruta Nutrity.</span></span>
              </button>
              {hasUrgentSymptoms && <div className="rounded-2xl border-2 border-red-300 bg-red-50 p-5 text-red-900"><div className="flex gap-3"><ShieldAlert className="h-6 w-6 shrink-0" /><div><p className="font-black">No continúes con la evaluación.</p><p className="mt-1 text-sm leading-6">Nutrity no atiende urgencias. Busca atención de emergencia local ahora. No esperes una respuesta dentro de la aplicación.</p></div></div></div>}
              <label className="flex gap-3 rounded-xl bg-slate-50 p-4 text-sm"><input type="checkbox" checked={data.safetyAcknowledgement} onChange={event => setData({ ...data, safetyAcknowledgement: event.target.checked })} className="mt-1" /><span>Entiendo que Nutrity ofrece educación y seguimiento de hábitos; no diagnostica ni reemplaza atención profesional.</span></label>
              <label className="flex gap-3 rounded-xl bg-slate-50 p-4 text-sm"><input type="checkbox" checked={data.privacyConsent} onChange={event => setData({ ...data, privacyConsent: event.target.checked })} className="mt-1" /><span>Autorizo el tratamiento de estos datos para crear mi Ruta Nutrity. He leído el <Link href="/privacy" target="_blank" className="font-bold underline">Aviso de Privacidad</Link>.</span></label>
            </>}

            <div className="flex items-center justify-between border-t pt-6">
              <button onClick={() => step === 1 ? onBack() : setStep(current => current - 1)} className="rounded-xl border px-5 py-3 font-bold">Atrás</button>
              <button disabled={!canContinue || busy} onClick={next} className="flex items-center gap-2 rounded-xl bg-[#17324d] px-6 py-3 font-bold text-white disabled:cursor-not-allowed disabled:opacity-40">{step === 4 ? <><Check className="h-4 w-4" /> Crear mi Ruta Nutrity</> : <>Continuar <ArrowRight className="h-4 w-4" /></>}</button>
            </div>
          </div>
        </section>
        <p className="mt-5 flex items-center justify-center gap-2 text-center text-xs text-slate-500"><HeartPulse className="h-4 w-4" /> Si tienes dudas sobre síntomas o medicación, consulta a tu profesional.</p>
      </div>
    </main>
  );
}
