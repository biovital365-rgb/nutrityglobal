'use client';

import { useMemo, useState } from 'react';
import { Activity, Check, ClipboardCheck, Moon, ShieldAlert, Utensils } from 'lucide-react';
import { updateRouteAction } from '@/actions/clinical-actions';
import type { MetabolicPlan } from '@/lib/schemas';

type Props = { plan: MetabolicPlan; userName: string; userId: string };

const icons = { Utensils, Activity, Moon, ClipboardCheck };

export function BioPlanSection({ plan, userName, userId }: Props) {
  const [actions, setActions] = useState(plan.weeklyActions);
  const [saving, setSaving] = useState<string | null>(null);
  const completed = useMemo(() => actions.filter(action => action.completed).length, [actions]);

  async function toggle(actionId: string, value: boolean) {
    setSaving(actionId);
    setActions(current => current.map(action => action.id === actionId ? { ...action, completed: value } : action));
    try {
      await updateRouteAction(userId, actionId, value);
    } catch {
      setActions(current => current.map(action => action.id === actionId ? { ...action, completed: !value } : action));
    } finally { setSaving(null); }
  }

  return <div className="space-y-8">
    <section className="rounded-[2rem] bg-[#17324d] p-7 text-white shadow-xl md:p-10">
      <p className="text-xs font-black uppercase tracking-[0.22em] text-[#e6d3a8]">Ruta Nutrity · 12 semanas</p>
      <h2 className="mt-3 text-3xl font-black md:text-5xl">{plan.phase}</h2>
      <p className="mt-4 max-w-3xl leading-7 text-white/75">{plan.insight}</p>
      <div className="mt-7 grid gap-4 md:grid-cols-2">
        <div className="rounded-2xl border border-white/10 bg-white/10 p-5"><p className="text-xs font-bold uppercase tracking-widest text-white/50">Objetivo elegido</p><p className="mt-2 text-lg font-bold first-letter:uppercase">{plan.meta}</p></div>
        <div className="rounded-2xl border border-white/10 bg-white/10 p-5"><p className="text-xs font-bold uppercase tracking-widest text-white/50">Avance semanal</p><p className="mt-2 text-lg font-bold">{completed} de {actions.length} acciones completadas</p></div>
      </div>
    </section>

    <section className="rounded-[2rem] border bg-white p-6 md:p-8">
      <h3 className="text-2xl font-black">Acciones de esta semana</h3>
      <p className="mt-2 text-sm text-slate-600">Marca una acción cuando hayas cumplido su frecuencia. El progreso refleja hábitos registrados, no resultados clínicos.</p>
      <div className="mt-6 grid gap-4">
        {actions.map(action => <label key={action.id} className={`flex cursor-pointer gap-4 rounded-2xl border-2 p-5 transition ${action.completed ? 'border-emerald-300 bg-emerald-50' : 'border-slate-200 hover:border-[#c19b6c]'}`}>
          <button type="button" disabled={saving === action.id} onClick={() => toggle(action.id, !action.completed)} className={`mt-1 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg border ${action.completed ? 'border-emerald-600 bg-emerald-600 text-white' : 'border-slate-300'}`}>{action.completed && <Check className="h-4 w-4" />}</button>
          <span><span className="text-[10px] font-black uppercase tracking-widest text-[#9a7740]">{action.category} · {action.frequency}</span><span className="mt-1 block font-black">{action.title}</span><span className="mt-1 block text-sm leading-6 text-slate-600">{action.description}</span></span>
        </label>)}
      </div>
    </section>

    <section className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {plan.pillars.map(pillar => {
        const Icon = icons[pillar.icon as keyof typeof icons] || ClipboardCheck;
        return <article key={pillar.title} className="rounded-2xl border bg-white p-5"><div className={`flex h-11 w-11 items-center justify-center rounded-xl text-white ${pillar.color}`}><Icon className="h-5 w-5" /></div><p className="mt-4 text-xs font-black uppercase tracking-widest text-[#9a7740]">{pillar.tag}</p><h3 className="mt-1 font-black">{pillar.title}</h3><p className="mt-2 text-sm leading-6 text-slate-600">{pillar.desc}</p></article>;
      })}
    </section>

    <section className="rounded-[2rem] border bg-white p-6 md:p-8">
      <h3 className="text-2xl font-black">Recorrido de 12 semanas</h3>
      <div className="mt-6 grid gap-4 md:grid-cols-2 lg:grid-cols-3">{plan.stages.map(stage => <article key={stage.weeks} className="rounded-2xl bg-slate-50 p-5"><p className="text-xs font-black uppercase tracking-widest text-[#9a7740]">Semanas {stage.weeks}</p><h4 className="mt-2 font-black">{stage.title}</h4><p className="mt-2 text-sm leading-6 text-slate-600">{stage.objective}</p></article>)}</div>
    </section>

    <section className={`rounded-2xl border p-5 ${plan.safety.level === 'CONSULT' ? 'border-amber-300 bg-amber-50' : 'border-blue-200 bg-blue-50'}`}>
      <div className="flex gap-3"><ShieldAlert className="h-6 w-6 shrink-0" /><div><p className="font-black">Uso seguro</p><p className="mt-1 text-sm leading-6">{plan.safety.message}</p><p className="mt-2 text-sm font-bold">{plan.safety.emergencyMessage}</p></div></div>
    </section>
    <p className="text-center text-xs text-slate-500">Ruta creada para {userName}. No constituye diagnóstico, tratamiento ni pronóstico.</p>
  </div>;
}
