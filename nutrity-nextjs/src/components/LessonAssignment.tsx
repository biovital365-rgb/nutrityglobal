"use client";
import React, { useState } from 'react';
import { submitAssignment } from '@/actions/db-actions';
import { Loader2, CheckCircle2, Send } from 'lucide-react';

interface LessonAssignmentProps {
    lessonId: string;
    assignment: {
        title: string;
        description: string;
    };
    userId?: string;
}

export function LessonAssignment({ lessonId, assignment, userId }: LessonAssignmentProps) {
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

    if (isSubmitted) {
        return (
            <div className="bg-nutrity-success/10 border border-nutrity-success/20 rounded-2xl p-6 text-center space-y-3 mt-6">
                <div className="w-12 h-12 rounded-full bg-nutrity-success/20 flex items-center justify-center text-nutrity-success mx-auto">
                    <CheckCircle2 className="w-6 h-6" />
                </div>
                <h4 className="text-nutrity-success font-bold text-lg">¡Tarea enviada con éxito!</h4>
                <p className="text-nutrity-success/80 text-sm">Tu coach revisará tu respuesta pronto.</p>
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
