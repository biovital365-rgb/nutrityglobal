"use client";
import { motion } from "motion/react";
import { CreditCard, CheckCircle2, Shield, Activity, Users, AlertCircle } from "lucide-react";

interface AdminPaymentsTabProps {
    users: any[];
    isSaving: boolean;
    onUpdatePlan: (userId: string, newPlan: string) => void;
}

export function AdminPaymentsTab({ users, isSaving, onUpdatePlan }: AdminPaymentsTabProps) {
    const plans = ["FREEMIUM", "BASIC", "ADVANCED", "ELITE"];

    return (
        <motion.div key="payments-table" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            {/* Resumen de Planes */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                {plans.map((planStr) => {
                    const count = users.filter((u) => (u.plan || "FREEMIUM") === planStr).length;
                    return (
                        <div key={planStr} className="bg-white p-4 rounded-xl border border-nutrity-border shadow-sm">
                            <p className="text-[10px] font-bold text-nutrity-gray-text uppercase tracking-widest mb-1">{planStr}</p>
                            <p className="text-2xl font-bold text-nutrity-primary">{count} <span className="text-xs text-nutrity-gray-text font-normal">usuarios</span></p>
                        </div>
                    );
                })}
            </div>

            <div className="nutrity-card bg-white overflow-hidden shadow-xl shadow-slate-200/50">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="bg-slate-50/50 text-[10px] font-bold uppercase tracking-widest text-nutrity-gray-text/60">
                                <th className="py-4 px-6">Usuario</th>
                                <th className="py-4 px-6">Suscripción Actual</th>
                                <th className="py-4 px-6">Estado de Pago</th>
                                <th className="py-4 px-6 text-right">Actualizar Plan</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-nutrity-border">
                            {users.map((u) => {
                                const currentPlan = u.plan || "FREEMIUM";
                                const isPremium = currentPlan !== "FREEMIUM";
                                
                                return (
                                    <tr key={u.id} className="hover:bg-slate-50 transition-colors group">
                                        <td className="py-4 px-6">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-full bg-nutrity-primary/10 flex items-center justify-center text-nutrity-primary font-bold text-xs">
                                                    {u.name?.charAt(0) || "U"}
                                                </div>
                                                <div>
                                                    <span className="font-bold text-sm block">{u.name || "Sin nombre"}</span>
                                                    <p className="text-[10px] text-nutrity-gray-text">{u.email}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="py-4 px-6">
                                            <div className="flex items-center gap-2">
                                                <Shield className={`w-4 h-4 ${isPremium ? 'text-nutrity-accent' : 'text-slate-400'}`} />
                                                <span className={`text-xs font-bold ${isPremium ? 'text-nutrity-primary' : 'text-nutrity-gray-text'}`}>
                                                    {currentPlan}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="py-4 px-6">
                                            {isPremium ? (
                                                <div className="flex items-center gap-1.5 text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full w-fit">
                                                    <CheckCircle2 className="w-3.5 h-3.5" />
                                                    <span className="text-[10px] font-bold tracking-wider">PAGADO (Stripe)</span>
                                                </div>
                                            ) : (
                                                <div className="flex items-center gap-1.5 text-slate-500 bg-slate-100 px-2.5 py-1 rounded-full w-fit">
                                                    <AlertCircle className="w-3.5 h-3.5" />
                                                    <span className="text-[10px] font-bold tracking-wider">SIN SUSCRIPCIÓN</span>
                                                </div>
                                            )}
                                        </td>
                                        <td className="py-4 px-6 text-right">
                                            <div className="flex justify-end gap-2">
                                                <select 
                                                    className="bg-slate-50 border border-slate-200 rounded-lg text-xs font-bold px-3 py-1.5 outline-none focus:border-nutrity-accent transition-colors disabled:opacity-50"
                                                    value={currentPlan}
                                                    disabled={isSaving}
                                                    onChange={(e) => onUpdatePlan(u.id, e.target.value)}
                                                >
                                                    {plans.map(p => (
                                                        <option key={p} value={p}>{p}</option>
                                                    ))}
                                                </select>
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            </div>
        </motion.div>
    );
}
