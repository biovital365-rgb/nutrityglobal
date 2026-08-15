import { motion } from "framer-motion";
import { Calendar, Pencil, Trash2, Clock } from "lucide-react";
import React from "react";

export interface DashboardAgendaTabProps {
    appointments: any[];
    setShowApptModal: React.Dispatch<React.SetStateAction<boolean>>;
    startEditAppointment: (appt: any) => void;
    handleDeleteAppointment: (id: string) => void;
}

export function DashboardAgendaTab({
    appointments,
    setShowApptModal,
    startEditAppointment,
    handleDeleteAppointment
}: DashboardAgendaTabProps) {
    return (
        <motion.div key="agenda" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
                <div className="space-y-1">
                    <h2 className="text-3xl font-display font-bold">Agenda de Control Médico</h2>
                    <p className="text-nutrity-gray-text text-sm">Gestiona tus citas de seguimiento y evaluaciones metabólicas.</p>
                </div>
                <button
                    onClick={() => setShowApptModal(true)}
                    className="bg-nutrity-accent text-white px-6 py-4 rounded-xl font-bold text-xs shadow-lg shadow-nutrity-accent/20 flex items-center gap-3 active:scale-95 transition-all"
                >
                    <Calendar className="w-5 h-5" /> Agendar Nueva Cita
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {appointments.map((appt) => (
                    <div key={appt.id} className="nutrity-card p-8 group hover:border-nutrity-accent transition-all relative overflow-hidden">
                        <div className="flex items-start justify-between mb-6">
                            <div className="w-12 h-12 rounded-xl bg-nutrity-accent/10 flex items-center justify-center text-nutrity-accent group-hover:scale-110 transition-transform">
                                <Calendar className="w-7 h-7" />
                            </div>
                            <div className="flex gap-2">
                                <button onClick={() => startEditAppointment(appt)} className="p-2 hover:bg-slate-100 rounded-lg text-nutrity-primary transition-colors" title="Editar">
                                    <Pencil className="w-4 h-4" />
                                </button>
                                <button onClick={() => handleDeleteAppointment(appt.id)} className="p-2 hover:bg-red-50 rounded-lg text-rose-500 transition-colors" title="Eliminar">
                                    <Trash2 className="w-4 h-4" />
                                </button>
                            </div>
                            <span className={`px-3 py-1 rounded-full text-[9px] font-bold uppercase tracking-widest ${appt.type === 'Virtual' ? 'bg-blue-50 text-blue-500' : 'bg-emerald-50 text-emerald-500'}`}>
                                {appt.type || 'Presencial'}
                            </span>
                        </div>
                        <h3 className="text-xl font-bold mb-2">{appt.title}</h3>
                        <div className="space-y-3">
                            <div className="flex items-center gap-3 text-nutrity-gray-text font-medium">
                                <Clock className="w-4 h-4 opacity-40" />
                                <span className="text-xs">{appt.date} {appt.time ? ` - ${appt.time}` : ''}</span>
                            </div>
                            <p className="text-[10px] font-bold text-nutrity-accent uppercase tracking-widest bg-nutrity-accent/5 inline-block px-3 py-1 rounded-lg">Confirmada por IA</p>
                        </div>
                    </div>
                ))}
            </div>

            {appointments.length === 0 && (
                <div className="nutrity-card p-20 flex flex-col items-center justify-center text-center space-y-4 opacity-50">
                    <Calendar className="w-16 h-16 text-nutrity-gray-text" />
                    <p className="font-bold text-nutrity-primary uppercase tracking-widest">No hay citas registradas</p>
                    <p className="text-xs max-w-xs">Agenda tu primera evaluación para iniciar el seguimiento de tu remisión.</p>
                </div>
            )}
        </motion.div>
    );
}
