"use client";
import React, { useState } from 'react';
import { submitAssignment } from '@/actions/db-actions';
import { Loader2, CheckCircle2, Send, Clock, XCircle } from 'lucide-react';

interface LessonAssignmentProps {
    lessonId: string;
    assignment: {
        title: string;
        description: string;
    };
    userId?: string;
    existingSubmission?: any;
}

export function LessonAssignment({ lessonId, assignment, userId, existingSubmission }: LessonAssignmentProps) {
    const [content, setContent] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isSubmitted, setIsSubmitted] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!content.trim() || !userId) return;

        setIsSubmitting(true);
        try {
            await submitAssignment(lessonId, content);
            setIsSubmitted(true);
        } catch (error) {
            console.error('Error al enviar la tarea:', error);
        } finally {
            setIsSubmitting(false);
        }
    };

    const isPending = existingSubmission?.status === 'PENDING' || isSubmitted;
    const isApprovedOrReviewed = existingSubmission?.status === 'APPROVED' || existingSubmission?.status === 'REVIEWED';
    const isRejected = existingSubmission?.status === 'REJECTED';

    if (isPending) {
        return (
            <div className="bg-orange-50 border border-orange-200 rounded-2xl p-6 text-center space-y-3 mt-6">
                <div className="w-12 h-12 rounded-full bg-orange-100 flex items-center justify-center text-orange-500 mx-auto">
                    <Clock className="w-6 h-6" />
                </div>
                <h4 className="text-orange-600 font-bold text-lg">Tarea en Revisión</h4>
                <p className="text-orange-600/80 text-sm">Tu coach está revisando tu respuesta. Te notificaremos cuando haya feedback.</p>
            </div>
        );
    }

    if (isApprovedOrReviewed) {
        return (
            <div className="bg-white border border-nutrity-success/30 rounded-3xl p-6 md:p-8 mt-6 shadow-sm relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-nutrity-success/5 rounded-bl-full -z-10" />
                <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 rounded-xl bg-nutrity-success/10 flex items-center justify-center text-nutrity-success">
                        <CheckCircle2 className="w-5 h-5" />
                    </div>
                    <div>
                        <h3 className="font-display font-bold text-xl text-nutrity-success">Tarea Aprobada</h3>
                        <p className="text-xs font-bold text-nutrity-success/70 uppercase tracking-widest mt-0.5">¡Buen trabajo!</p>
                    </div>
                </div>
                {existingSubmission.feedback && (
                    <div className="bg-nutrity-success/5 border border-nutrity-success/20 rounded-2xl p-5 mb-4">
                        <h4 className="text-[10px] font-bold text-nutrity-success uppercase tracking-widest mb-2">Feedback del Coach:</h4>
                        <p className="text-sm font-medium text-nutrity-gray-text">{existingSubmission.feedback}</p>
                    </div>
                )}
                <div className="bg-slate-50 border border-slate-100 rounded-2xl p-5">
                    <h4 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2">Tu respuesta original:</h4>
                    <p className="text-sm text-slate-600 italic">"{existingSubmission.content}"</p>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-white border border-nutrity-border rounded-3xl p-6 md:p-8 mt-6 shadow-sm">
            <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-nutrity-accent/10 flex items-center justify-center text-nutrity-accent">
                    <span className="font-bold text-lg">T</span>
                </div>
                <div>
                    <h3 className="font-display font-bold text-xl">{assignment.title}</h3>
                    <p className="text-xs font-bold text-nutrity-gray-text uppercase tracking-widest mt-0.5">Tarea Práctica</p>
                </div>
            </div>
            <p className="text-sm text-nutrity-gray-text leading-relaxed mb-6 font-medium">
                {assignment.description}
            </p>
            
            {isRejected && (
                <div className="bg-red-50 border border-red-200 rounded-2xl p-5 mb-6">
                    <h4 className="text-[10px] font-bold text-red-600 uppercase tracking-widest mb-2">Tarea Rechazada (Requiere reenvío):</h4>
                    <p className="text-sm font-medium text-red-800 mb-4">{existingSubmission.feedback}</p>
                    <div className="bg-white/50 rounded-xl p-3">
                        <p className="text-xs text-red-400 italic">Tu envío anterior: "{existingSubmission.content}"</p>
                    </div>
                </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
                <textarea
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    placeholder="Escribe tu respuesta aquí..."
                    className="w-full bg-slate-50 border border-nutrity-border rounded-xl p-4 min-h-[120px] resize-y focus:outline-none focus:ring-2 focus:ring-nutrity-accent/20 focus:border-nutrity-accent transition-all text-sm"
                    required
                />
                <button
                    type="submit"
                    disabled={isSubmitting || !content.trim() || !userId}
                    className="w-full bg-nutrity-primary text-white py-4 rounded-xl font-bold text-sm uppercase tracking-widest shadow-lg shadow-nutrity-primary/10 hover:bg-nutrity-accent transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                >
                    {isSubmitting ? (
                        <Loader2 className="w-5 h-5 animate-spin" />
                    ) : (
                        <Send className="w-4 h-4" />
                    )}
                    {isSubmitting ? 'Enviando...' : 'Enviar Tarea'}
                </button>
            </form>
            {!userId && (
                <p className="text-[10px] text-red-500 mt-2 font-bold uppercase">Debes iniciar sesión para enviar tareas.</p>
            )}
        </div>
    );
}
