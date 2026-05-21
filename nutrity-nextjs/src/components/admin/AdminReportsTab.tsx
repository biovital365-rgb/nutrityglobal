"use client";
import { motion } from "motion/react";

interface AdminReportsTabProps {
    pdfReports: any[];
}

export function AdminReportsTab({ pdfReports }: AdminReportsTabProps) {
    return (
        <motion.div key="reports-view" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <div className="nutrity-card bg-white overflow-hidden shadow-xl shadow-slate-200/50">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="bg-slate-50/50 text-[10px] font-bold uppercase tracking-widest text-nutrity-gray-text/60">
                                <th className="py-4 px-6">Usuario</th>
                                <th className="py-4 px-6">Estado</th>
                                <th className="py-4 px-6">Fecha</th>
                                <th className="py-4 px-6">Mensaje</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-nutrity-border">
                            {pdfReports.map((log) => (
                                <tr key={log.id} className="hover:bg-slate-50 transition-colors">
                                    <td className="py-4 px-6">
                                        <span className="font-bold text-sm block">{log.user?.name || "Usuario"}</span>
                                        <p className="text-[10px] text-nutrity-gray-text">{log.user?.email}</p>
                                    </td>
                                    <td className="py-4 px-6">
                                        <span className={`px-2 py-1 rounded-lg text-[9px] font-bold uppercase tracking-wider ${
                                            log.status === "DOWNLOADED" ? "bg-emerald-50 text-emerald-600" :
                                            log.status === "ERROR" ? "bg-red-50 text-red-600" :
                                            "bg-blue-50 text-blue-600"
                                        }`}>
                                            {log.status}
                                        </span>
                                    </td>
                                    <td className="py-4 px-6 text-[11px] text-nutrity-gray-text">
                                        {new Date(log.timestamp).toLocaleString()}
                                    </td>
                                    <td className="py-4 px-6 text-xs text-nutrity-primary/60">
                                        {log.errorMessage || "Procesado correctamente"}
                                    </td>
                                </tr>
                            ))}
                            {pdfReports.length === 0 && (
                                <tr><td colSpan={4} className="py-16 text-center text-nutrity-gray-text text-sm">No hay registros de reportes</td></tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </motion.div>
    );
}
