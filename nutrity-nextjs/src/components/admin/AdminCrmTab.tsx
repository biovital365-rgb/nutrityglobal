"use client";
import { motion } from "motion/react";
import { Users, Activity, Shield, Calendar, AlertTriangle, Zap } from "lucide-react";

interface AdminCrmTabProps {
    users: any[];
    appointments: any[];
}

export function AdminCrmTab({ users, appointments }: AdminCrmTabProps) {
    const avgRemission = Math.round(
        users.reduce((acc, u) => acc + (u.metabolicResults?.remissionScore || 0), 0) /
        (users.filter(u => u.metabolicResults).length || 1)
    );
    const lowScoreUsers = users.filter(u => u.metabolicResults && u.metabolicResults.remissionScore < 40);
    const upcomingDiagnostics = appointments
        .filter(a => a.title.toLowerCase().includes("diagnóstico"))
        .slice(0, 5);

    return (
        <motion.div key="crm-dashboard" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                {[
                    { icon: Users, value: users.length, label: "Total Usuarios", color: "text-nutrity-accent" },
                    { icon: Activity, value: `${avgRemission}%`, label: "Remisión Promedio", color: "text-emerald-500" },
                    { icon: Shield, value: users.filter(u => u.status === "BLOCKED").length, label: "Bloqueados", color: "text-rose-500" },
                    { icon: Calendar, value: appointments.length, label: "Citas Totales", color: "text-blue-500" },
                ].map(({ icon: Icon, value, label, color }) => (
                    <div key={label} className="nutrity-card p-8 space-y-4 text-center">
                        <Icon className={`w-8 h-8 ${color} mx-auto`} />
                        <h3 className="text-2xl font-bold">{value}</h3>
                        <p className="text-[10px] font-bold text-nutrity-gray-text uppercase tracking-widest">{label}</p>
                    </div>
                ))}
            </div>

            <div className="mt-8 grid md:grid-cols-2 gap-6">
                <div className="nutrity-card p-6">
                    <h4 className="text-xs font-bold uppercase tracking-widest mb-4 flex items-center gap-2">
                        <AlertTriangle className="w-4 h-4 text-amber-500" /> Pacientes con Score Bajo (&lt;40)
                    </h4>
                    <div className="space-y-3">
                        {lowScoreUsers.length === 0 ? (
                            <p className="text-xs text-nutrity-gray-text italic text-center py-4">No hay alertas críticas.</p>
                        ) : lowScoreUsers.map(u => (
                            <div key={u.id} className="flex items-center justify-between p-3 bg-red-50 rounded-xl">
                                <span className="text-xs font-bold">{u.name}</span>
                                <span className="text-[10px] font-bold text-red-600">{u.metabolicResults.remissionScore}%</span>
                            </div>
                        ))}
                    </div>
                </div>
                <div className="nutrity-card p-6">
                    <h4 className="text-xs font-bold uppercase tracking-widest mb-4 flex items-center gap-2">
                        <Zap className="w-4 h-4 text-emerald-500" /> Próximos Diagnósticos
                    </h4>
                    <div className="space-y-3">
                        {upcomingDiagnostics.map(a => (
                            <div key={a.id} className="flex items-center justify-between p-3 bg-emerald-50 rounded-xl">
                                <span className="text-xs font-bold">{a.user?.name}</span>
                                <span className="text-[10px] font-bold text-emerald-600">{new Date(a.date).toLocaleDateString()}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </motion.div>
    );
}
