import { motion } from "framer-motion";
import { MessageCircle, Coffee, Utensils, Heart, Apple, Target, ClipboardCheck } from "lucide-react";

export interface DashboardMenuTabProps {
    menuStatus: 'NONE' | 'PENDING' | 'APPROVED' | 'CHANGES_REQUESTED';
    isLoadingApprovedMenu: boolean;
    approvedMenuDays: any[];
    setShowChangeRequestModal: (show: boolean) => void;
    setActiveTab: (tab: string) => void;
}

export function DashboardMenuTab({
    menuStatus,
    isLoadingApprovedMenu,
    approvedMenuDays,
    setShowChangeRequestModal,
    setActiveTab
}: DashboardMenuTabProps) {
    return (
        <motion.div key="menu" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="space-y-1">
                    <h2 className="text-3xl font-display font-bold">Menú Semanal de Precisión</h2>
                    <p className="text-nutrity-gray-text text-sm">Cronograma nutricional personalizado para tu fase de remisión metabólica.</p>
                </div>
                {menuStatus === 'APPROVED' && (
                    <div className="flex items-center gap-3">
                        <span className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-50 text-emerald-600 border border-emerald-200 rounded-xl text-[10px] font-bold uppercase tracking-widest">
                            <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
                            Plan Aprobado por Coach
                        </span>
                        <button 
                            onClick={() => setShowChangeRequestModal(true)}
                            className="px-4 py-2 bg-white border border-nutrity-border text-nutrity-gray-text hover:text-nutrity-primary hover:border-nutrity-accent rounded-xl text-[10px] font-bold uppercase tracking-widest transition-colors flex items-center gap-2"
                        >
                            <MessageCircle className="w-3.5 h-3.5" />
                            Solicitar Cambios
                        </button>
                    </div>
                )}
            </div>

            {/* Loading state */}
            {isLoadingApprovedMenu && (
                <div className="py-20 flex flex-col items-center gap-4">
                    <div className="w-10 h-10 border-4 border-nutrity-accent border-t-transparent rounded-full animate-spin" />
                    <p className="text-sm font-bold text-nutrity-gray-text">Cargando tu plan nutricional...</p>
                </div>
            )}

            {/* ESTADO: APROBADO — mostrar los 7 días */}
            {!isLoadingApprovedMenu && menuStatus === 'APPROVED' && (
                <div className="space-y-4">
                    {approvedMenuDays.map((record) => {
                        const dateLabel = new Date(record.date + 'T12:00:00').toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long' });
                        return (
                            <div key={record.id} className="nutrity-card p-6 space-y-4">
                                <div className="flex items-center justify-between">
                                    <h3 className="font-bold text-base capitalize">{dateLabel}</h3>
                                    <span className="text-[9px] font-bold bg-emerald-50 text-emerald-600 px-2 py-0.5 rounded-lg">APROBADO</span>
                                </div>
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                                    {[
                                        { l: 'Desayuno', k: 'breakfast', icon: Coffee, color: 'text-amber-500 bg-amber-50' },
                                        { l: 'Almuerzo', k: 'lunch', icon: Utensils, color: 'text-nutrity-accent bg-nutrity-accent/5' },
                                        { l: 'Cena', k: 'dinner', icon: Heart, color: 'text-indigo-500 bg-indigo-50' },
                                        { l: 'Snack', k: 'snack', icon: Apple, color: 'text-rose-500 bg-rose-50' },
                                    ].map(({ l, k, icon: Icon, color }) => (
                                        <div key={k} className="bg-nutrity-bg rounded-xl p-3 space-y-2">
                                            <div className="flex items-center gap-2">
                                                <div className={`w-6 h-6 rounded-lg flex items-center justify-center ${color}`}>
                                                    <Icon className="w-3.5 h-3.5" />
                                                </div>
                                                <span className="text-[9px] font-bold text-nutrity-gray-text uppercase tracking-widest">{l}</span>
                                            </div>
                                            <p className="text-xs font-medium text-nutrity-primary leading-snug">{((record.menuData as any)?.[k]) || '—'}</p>
                                        </div>
                                    ))}
                                </div>
                                {record.metabolicGoal && (
                                    <div className="flex items-center gap-2 pt-1">
                                        <Target className="w-3.5 h-3.5 text-nutrity-accent" />
                                        <span className="text-[10px] font-bold text-nutrity-accent">Meta del día: {record.metabolicGoal}</span>
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            )}

            {/* ESTADO: PENDIENTE — en revisión por coach */}
            {!isLoadingApprovedMenu && menuStatus === 'PENDING' && (
                <div className="nutrity-card p-16 flex flex-col items-center justify-center text-center space-y-6">
                    <div className="w-20 h-20 rounded-3xl bg-amber-50 flex items-center justify-center">
                        <ClipboardCheck className="w-10 h-10 text-amber-500" />
                    </div>
                    <div className="space-y-2">
                        <h3 className="text-xl font-bold text-nutrity-primary">Tu plan está siendo revisado</h3>
                        <p className="text-sm text-nutrity-gray-text max-w-sm">Tu Coach Nutrity está revisando y personalizando tu menú semanal. Recibirás acceso en cuanto sea aprobado.</p>
                    </div>
                    <span className="px-6 py-3 bg-amber-50 text-amber-600 border border-amber-200 rounded-xl text-[11px] font-bold uppercase tracking-widest flex items-center gap-2">
                        <span className="w-2 h-2 bg-amber-500 rounded-full animate-pulse" />
                        Pendiente de Aprobación
                    </span>
                </div>
            )}

            {/* ESTADO: CHANGES_REQUESTED — solicitó cambios */}
            {!isLoadingApprovedMenu && menuStatus === 'CHANGES_REQUESTED' && (
                <div className="nutrity-card p-16 flex flex-col items-center justify-center text-center space-y-6">
                    <div className="w-20 h-20 rounded-3xl bg-blue-50 flex items-center justify-center">
                        <MessageCircle className="w-10 h-10 text-blue-500" />
                    </div>
                    <div className="space-y-2">
                        <h3 className="text-xl font-bold text-nutrity-primary">Solicitud de cambios enviada</h3>
                        <p className="text-sm text-nutrity-gray-text max-w-sm">Hemos notificado a tu Coach sobre tus observaciones. Pronto recibirás un nuevo plan ajustado a tus necesidades.</p>
                    </div>
                    <span className="px-6 py-3 bg-blue-50 text-blue-600 border border-blue-200 rounded-xl text-[11px] font-bold uppercase tracking-widest flex items-center gap-2">
                        <span className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" />
                        En Revisión por el Coach
                    </span>
                </div>
            )}

            {/* ESTADO: SIN MENÚ — aún no generado */}
            {!isLoadingApprovedMenu && menuStatus === 'NONE' && (
                <div className="nutrity-card p-16 flex flex-col items-center justify-center text-center space-y-6">
                    <div className="w-20 h-20 rounded-3xl bg-nutrity-bg flex items-center justify-center">
                        <Utensils className="w-10 h-10 text-nutrity-gray-text opacity-40" />
                    </div>
                    <div className="space-y-2">
                        <h3 className="text-xl font-bold text-nutrity-primary">Sin plan nutricional aún</h3>
                        <p className="text-sm text-nutrity-gray-text max-w-sm">Completa tu diagnóstico metabólico para que tu Coach pueda generar y aprobar tu menú personalizado de Remisión Metabólica.</p>
                    </div>
                    <button
                        onClick={() => setActiveTab('main')}
                        className="px-8 py-3.5 bg-nutrity-accent text-white rounded-xl text-xs font-bold uppercase tracking-widest shadow-lg shadow-nutrity-accent/20 hover:scale-105 transition-all"
                    >
                        Ir al Dashboard Principal
                    </button>
                </div>
            )}
        </motion.div>
    );
}
