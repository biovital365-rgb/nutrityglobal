'use client';
import { motion } from 'motion/react';
import { Activity, Calendar, ClipboardCheck, Shield, Users } from 'lucide-react';

export function AdminCrmTab({ users, appointments }: { users: any[]; appointments: any[] }) {
  const withRoute = users.filter(user => user.metabolicResults?.routeVersion === '2.0');
  const completedActions = withRoute.reduce((total, user) => total + (user.metabolicResults.weeklyActions || []).filter((action: any) => action.completed).length, 0);
  const totalActions = withRoute.reduce((total, user) => total + (user.metabolicResults.weeklyActions || []).length, 0);
  const upcoming = appointments.slice(0, 5);
  return <motion.div key="crm-dashboard" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-8">
    <div className="grid gap-6 md:grid-cols-4">{[
      { icon: Users, value: users.length, label: 'Usuarios', color: 'text-nutrity-accent' },
      { icon: ClipboardCheck, value: withRoute.length, label: 'Rutas creadas', color: 'text-emerald-600' },
      { icon: Activity, value: `${completedActions}/${totalActions}`, label: 'Acciones registradas', color: 'text-blue-600' },
      { icon: Shield, value: users.filter(user => user.status === 'BLOCKED').length, label: 'Cuentas bloqueadas', color: 'text-rose-500' },
    ].map(({ icon: Icon, value, label, color }) => <article key={label} className="nutrity-card p-8 text-center"><Icon className={`mx-auto h-8 w-8 ${color}`} /><h3 className="mt-4 text-2xl font-black">{value}</h3><p className="mt-2 text-[10px] font-black uppercase tracking-widest text-slate-500">{label}</p></article>)}</div>
    <section className="nutrity-card p-6"><h4 className="flex items-center gap-2 text-xs font-black uppercase tracking-widest"><Calendar className="h-4 w-4 text-blue-600" /> Próximas citas</h4><div className="mt-4 space-y-3">{upcoming.length ? upcoming.map(appointment => <div key={appointment.id} className="flex items-center justify-between rounded-xl bg-blue-50 p-3"><span className="text-xs font-bold">{appointment.user?.name || appointment.title}</span><span className="text-[10px] font-bold text-blue-700">{appointment.date}</span></div>) : <p className="py-4 text-center text-xs text-slate-500">No hay citas próximas.</p>}</div></section>
    <p className="text-xs text-slate-500">Este panel muestra actividad y seguimiento; no clasifica riesgo ni estima resultados clínicos.</p>
  </motion.div>;
}
