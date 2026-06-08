import { motion } from "motion/react";
import { Users, TrendingUp, CreditCard } from "lucide-react";

interface AdminConversionsTabProps {
    users: any[];
}

export function AdminConversionsTab({ users }: AdminConversionsTabProps) {
    const totalPatients = users.length;
    const elitePatients = users.filter(u => u.plan === "ELITE").length;
    const basicPatients = users.filter(u => u.plan === "BASIC").length;
    const freePatients = users.filter(u => !u.plan || u.plan === "FREEMIUM").length;

    const conversionRate = totalPatients > 0 
        ? Math.round(((elitePatients + basicPatients) / totalPatients) * 100) 
        : 0;

    return (
        <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-white p-6 rounded-2xl border border-nutrity-border shadow-sm">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600">
                            <Users className="w-6 h-6" />
                        </div>
                        <div>
                            <p className="text-sm font-bold text-nutrity-gray-text">Total Pacientes</p>
                            <h3 className="text-2xl font-display font-bold text-nutrity-primary">{totalPatients}</h3>
                        </div>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-2xl border border-nutrity-border shadow-sm">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl bg-amber-50 flex items-center justify-center text-amber-600">
                            <TrendingUp className="w-6 h-6" />
                        </div>
                        <div>
                            <p className="text-sm font-bold text-nutrity-gray-text">Tasa de Conversión</p>
                            <h3 className="text-2xl font-display font-bold text-amber-600">{conversionRate}%</h3>
                        </div>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-2xl border border-nutrity-border shadow-sm">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl bg-nutrity-success/10 flex items-center justify-center text-nutrity-success">
                            <CreditCard className="w-6 h-6" />
                        </div>
                        <div>
                            <p className="text-sm font-bold text-nutrity-gray-text">Suscripciones Pagas</p>
                            <h3 className="text-2xl font-display font-bold text-nutrity-success">{elitePatients + basicPatients}</h3>
                        </div>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-2xl border border-nutrity-border shadow-sm">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl bg-gray-100 flex items-center justify-center text-gray-500">
                            <Users className="w-6 h-6" />
                        </div>
                        <div>
                            <p className="text-sm font-bold text-nutrity-gray-text">Usuarios Freemium</p>
                            <h3 className="text-2xl font-display font-bold text-gray-600">{freePatients}</h3>
                        </div>
                    </div>
                </div>
            </div>

            <div className="bg-white border border-nutrity-border rounded-2xl overflow-hidden shadow-sm">
                <div className="p-6 border-b border-nutrity-border">
                    <h3 className="font-display font-bold text-lg text-nutrity-primary">Detalle de Conversiones</h3>
                    <p className="text-sm text-nutrity-gray-text">Pacientes registrados con tu código de invitación.</p>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                        <thead className="bg-nutrity-bg text-nutrity-gray-text font-bold">
                            <tr>
                                <th className="px-6 py-4">Paciente</th>
                                <th className="px-6 py-4">Email</th>
                                <th className="px-6 py-4">Plan Actual</th>
                                <th className="px-6 py-4">Fecha de Registro</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-nutrity-border">
                            {users.map(user => (
                                <tr key={user.id} className="hover:bg-nutrity-bg/50 transition-colors">
                                    <td className="px-6 py-4 font-medium text-nutrity-primary">{user.name || "Sin nombre"}</td>
                                    <td className="px-6 py-4 text-nutrity-gray-text">{user.email}</td>
                                    <td className="px-6 py-4">
                                        <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                                            user.plan === 'ELITE' ? 'bg-amber-100 text-amber-700' :
                                            user.plan === 'BASIC' ? 'bg-blue-100 text-blue-700' :
                                            'bg-gray-100 text-gray-600'
                                        }`}>
                                            {user.plan || "FREEMIUM"}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-nutrity-gray-text">
                                        {new Date(user.createdAt).toLocaleDateString()}
                                    </td>
                                </tr>
                            ))}
                            {users.length === 0 && (
                                <tr>
                                    <td colSpan={4} className="px-6 py-12 text-center text-nutrity-gray-text">
                                        Aún no tienes pacientes registrados. Comparte tu enlace de invitación.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
