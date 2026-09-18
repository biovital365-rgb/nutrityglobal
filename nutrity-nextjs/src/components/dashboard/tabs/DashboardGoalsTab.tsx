import { motion } from 'motion/react';
import { CheckCircle2, Circle, Flag, ShieldCheck } from 'lucide-react';
import type { MetabolicPlan } from '@/lib/schemas';

export function DashboardGoalsTab({ results }: { results: MetabolicPlan }) {
  const actions = results?.weeklyActions || [];
  const completed = actions.filter(action => action.completed).length;
  return <motion.div key="goals" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-8">
    <header><h2 className="text-3xl font-black">Progreso de hábitos</h2><p className="mt-2 text-sm text-slate-600">Aquí se muestran acciones registradas por ti; no es una estimación clínica ni una predicción de resultados.</p></header>
    <section className="grid gap-6 md:grid-cols-2">
      <article className="nutrity-card p-8"><Flag className="h-7 w-7 text-nutrity-accent" /><p className="mt-5 text-xs font-black uppercase tracking-widest text-slate-500">Objetivo de la ruta</p><h3 className="mt-2 text-2xl font-black first-letter:uppercase">{results?.meta}</h3><p className="mt-4 text-sm leading-6 text-slate-600">Semana {results?.currentWeek || 1} de 12 · {results?.phase}</p></article>
      <article className="nutrity-card p-8"><ShieldCheck className="h-7 w-7 text-emerald-600" /><p className="mt-5 text-xs font-black uppercase tracking-widest text-slate-500">Acciones completadas</p><p className="mt-2 text-4xl font-black">{completed} / {actions.length}</p><p className="mt-4 text-sm leading-6 text-slate-600">Completar acciones no significa alcanzar un resultado médico específico.</p></article>
    </section>
    <section className="nutrity-card p-8"><h3 className="text-xl font-black">Lista semanal</h3><div className="mt-6 space-y-4">{actions.map(action => <div key={action.id} className="flex gap-3 rounded-xl bg-slate-50 p-4">{action.completed ? <CheckCircle2 className="h-5 w-5 shrink-0 text-emerald-600" /> : <Circle className="h-5 w-5 shrink-0 text-slate-300" />}<div><p className="font-bold">{action.title}</p><p className="mt-1 text-xs text-slate-500">{action.frequency}</p></div></div>)}</div></section>
    <section className="nutrity-card p-8"><h3 className="text-xl font-black">Indicadores que puedes observar</h3><div className="mt-5 flex flex-wrap gap-3">{(results?.progressIndicators || []).map(indicator => <span key={indicator} className="rounded-full border bg-white px-4 py-2 text-sm font-semibold">{indicator}</span>)}</div></section>
  </motion.div>;
}
