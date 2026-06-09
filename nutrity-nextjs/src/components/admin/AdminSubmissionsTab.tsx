"use client";
import React, { useState } from 'react';
import { FileText, CheckCircle2, Clock, Send, Search } from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

interface AdminSubmissionsTabProps {
    submissions: any[];
    isSaving: boolean;
    onReview: (submissionId: string, feedback: string) => Promise<void>;
}

export function AdminSubmissionsTab({ submissions, isSaving, onReview }: AdminSubmissionsTabProps) {
    const [searchTerm, setSearchTerm] = useState('');
    const [filter, setFilter] = useState<'ALL' | 'PENDING' | 'REVIEWED'>('ALL');
    const [selectedSub, setSelectedSub] = useState<any | null>(null);
    const [feedback, setFeedback] = useState('');

    const filteredSubs = submissions.filter(s => {
        const matchesSearch = s.user?.name?.toLowerCase().includes(searchTerm.toLowerCase()) || 
                              s.assignment?.title?.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesFilter = filter === 'ALL' || s.status === filter;
        return matchesSearch && matchesFilter;
    });

    const handleReview = async () => {
        if (!selectedSub || !feedback.trim()) return;
        await onReview(selectedSub.id, feedback);
        setSelectedSub(null);
        setFeedback('');
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
                <div className="relative flex-1 w-full">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-nutrity-gray-text opacity-40" />
                    <input
                        type="text"
                        placeholder="Buscar por paciente o tarea..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full bg-white border border-nutrity-border rounded-xl pl-11 pr-5 py-3 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-nutrity-accent/20"
                    />
                </div>
                <div className="flex bg-white rounded-xl border border-nutrity-border p-1 w-full md:w-auto">
                    {['ALL', 'PENDING', 'REVIEWED'].map((f) => (
                        <button
                            key={f}
                            onClick={() => setFilter(f as any)}
                            className={`flex-1 md:px-6 py-2 rounded-lg text-xs font-bold transition-all ${
                                filter === f ? 'bg-nutrity-primary text-white' : 'text-nutrity-gray-text hover:bg-slate-50'
                            }`}
                        >
                            {f === 'ALL' ? 'Todas' : f === 'PENDING' ? 'Pendientes' : 'Revisadas'}
                        </button>
                    ))}
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-1 space-y-4">
                    {filteredSubs.map((sub) => (
                        <div
                            key={sub.id}
                            onClick={() => { setSelectedSub(sub); setFeedback(sub.feedback || ''); }}
                            className={`p-4 rounded-2xl border cursor-pointer transition-all ${selectedSub?.id === sub.id ? 'bg-nutrity-accent/5 border-nutrity-accent' : 'bg-white border-nutrity-border hover:border-nutrity-accent/30'}`}
                        >
                            <div className="flex justify-between items-start mb-2">
                                <span className="text-xs font-bold uppercase text-nutrity-primary">
                                    {sub.assignment?.lesson?.title || 'Lección'}
                                </span>
                                {sub.status === 'PENDING' ? (
                                    <span className="flex items-center gap-1 text-[10px] font-bold text-orange-500 bg-orange-50 px-2 py-1 rounded-full">
                                        <Clock className="w-3 h-3" /> PENDIENTE
                                    </span>
                                ) : (
                                    <span className="flex items-center gap-1 text-[10px] font-bold text-nutrity-success bg-nutrity-success/10 px-2 py-1 rounded-full">
                                        <CheckCircle2 className="w-3 h-3" /> REVISADA
                                    </span>
                                )}
                            </div>
                            <h4 className="font-bold text-sm truncate">{sub.assignment?.title}</h4>
                            <p className="text-xs text-nutrity-gray-text mt-1">Por: {sub.user?.name || sub.user?.email}</p>
                            <p className="text-[10px] text-nutrity-gray-text opacity-70 mt-2">
                                {format(new Date(sub.createdAt), "d 'de' MMMM, yyyy", { locale: es })}
                            </p>
                        </div>
                    ))}

                    {filteredSubs.length === 0 && (
                        <div className="text-center p-8 bg-white rounded-3xl border border-dashed border-nutrity-border">
                            <FileText className="w-8 h-8 text-nutrity-gray-text/30 mx-auto mb-2" />
                            <p className="text-sm font-medium text-nutrity-gray-text">No hay tareas entregadas</p>
                        </div>
                    )}
                </div>

                <div className="lg:col-span-2">
                    {selectedSub ? (
                        <div className="bg-white border border-nutrity-border rounded-3xl p-6 shadow-sm sticky top-6">
                            <div className="mb-6">
                                <h3 className="text-xl font-bold font-display">{selectedSub.assignment?.title}</h3>
                                <p className="text-sm text-nutrity-gray-text mt-1">
                                    Enviado por <span className="font-bold text-nutrity-primary">{selectedSub.user?.name || selectedSub.user?.email}</span> el {format(new Date(selectedSub.createdAt), "dd/MM/yyyy")}
                                </p>
                            </div>

                            <div className="bg-slate-50 border border-nutrity-border rounded-2xl p-6 mb-6">
                                <h4 className="text-xs font-bold uppercase tracking-widest text-nutrity-gray-text mb-3">Respuesta del Paciente:</h4>
                                <p className="text-sm font-medium leading-relaxed whitespace-pre-wrap">{selectedSub.content}</p>
                            </div>

                            <div className="space-y-4">
                                <h4 className="text-xs font-bold uppercase tracking-widest text-nutrity-primary">Tu Feedback (Coach):</h4>
                                <textarea
                                    value={feedback}
                                    onChange={(e) => setFeedback(e.target.value)}
                                    placeholder="Escribe tus comentarios y retroalimentación aquí..."
                                    className="w-full bg-white border border-nutrity-border rounded-xl p-4 min-h-[120px] resize-y focus:outline-none focus:ring-2 focus:ring-nutrity-accent/20 focus:border-nutrity-accent text-sm"
                                />
                                <button
                                    onClick={handleReview}
                                    disabled={isSaving || !feedback.trim() || (selectedSub.status === 'REVIEWED' && feedback === selectedSub.feedback)}
                                    className="w-full bg-nutrity-primary text-white py-4 rounded-xl font-bold text-sm uppercase tracking-widest shadow-lg hover:bg-nutrity-accent transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                                >
                                    {isSaving ? 'Guardando...' : (
                                        <>
                                            <Send className="w-4 h-4" />
                                            {selectedSub.status === 'PENDING' ? 'Enviar Revisión' : 'Actualizar Feedback'}
                                        </>
                                    )}
                                </button>
                            </div>
                        </div>
                    ) : (
                        <div className="bg-white border border-nutrity-border rounded-3xl p-12 text-center flex flex-col items-center justify-center h-full text-nutrity-gray-text">
                            <FileText className="w-12 h-12 opacity-20 mb-4" />
                            <p className="font-medium">Selecciona una entrega en el panel izquierdo para revisarla.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
