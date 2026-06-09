"use client";
import React, { useState } from 'react';
import { submitQuizAttempt } from '@/actions/db-actions';
import { Loader2, CheckCircle2, ShieldAlert } from 'lucide-react';

interface Question {
    text: string;
    options: string[];
    correctIndex: number;
}

interface LessonQuizProps {
    lessonId: string;
    quiz: {
        title: string;
        description: string;
        questions: Question[];
    };
    userId?: string;
}

export function LessonQuiz({ lessonId, quiz, userId }: LessonQuizProps) {
    const [answers, setAnswers] = useState<Record<number, number>>({});
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [result, setResult] = useState<{ score: number; passed: boolean } | null>(null);

    const isComplete = Object.keys(answers || {})?.length === (quiz?.questions?.length || 0);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!isComplete || !userId) return;

        setIsSubmitting(true);
        try {
            // Calculate score client-side for simplicity before sending to backend
            let correctCount = 0;
            (quiz.questions || []).forEach((q, idx) => {
                if (answers[idx] === q.correctIndex) {
                    correctCount++;
                }
            });
            const score = Math.round((correctCount / (quiz?.questions?.length || 1)) * 10);
            
            const response = await submitQuizAttempt(lessonId, score);
            setResult({ score, passed: response.passed });
        } catch (error) {
            console.error('Error al enviar el cuestionario:', error);
        } finally {
            setIsSubmitting(false);
        }
    };

    if (result) {
        return (
            <div className={`border rounded-3xl p-6 text-center space-y-4 mt-6 ${result.passed ? 'bg-nutrity-success/10 border-nutrity-success/20' : 'bg-red-50 border-red-100'}`}>
                <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto ${result.passed ? 'bg-nutrity-success/20 text-nutrity-success' : 'bg-red-100 text-red-500'}`}>
                    {result.passed ? <CheckCircle2 className="w-8 h-8" /> : <ShieldAlert className="w-8 h-8" />}
                </div>
                <div>
                    <h4 className={`font-display font-bold text-2xl ${result.passed ? 'text-nutrity-success' : 'text-red-500'}`}>
                        {result.passed ? '¡Cuestionario Aprobado!' : 'No Aprobado'}
                    </h4>
                    <p className="text-sm font-bold uppercase tracking-widest opacity-80 mt-1">Puntuación: {result.score} / 10</p>
                </div>
                <p className="text-sm font-medium opacity-80 max-w-sm mx-auto">
                    {result.passed 
                        ? 'Has superado el cuestionario con éxito. Puedes avanzar a la siguiente lección.' 
                        : 'No has alcanzado la puntuación mínima de 7/10 para aprobar. Por favor, repasa el material e inténtalo de nuevo.'}
                </p>
                {!result.passed && (
                    <button onClick={() => { setResult(null); setAnswers({}); }} className="mt-4 px-6 py-2 bg-red-500 text-white rounded-xl text-xs font-bold uppercase tracking-widest shadow-lg shadow-red-500/20 hover:bg-red-600 transition-all">
                        Reintentar
                    </button>
                )}
            </div>
        );
    }

    return (
        <div className="bg-white border border-nutrity-border rounded-3xl p-6 md:p-8 mt-6 shadow-sm">
            <div className="mb-6">
                <h3 className="font-display font-bold text-xl">{quiz.title}</h3>
                {quiz.description && <p className="text-sm text-nutrity-gray-text mt-1">{quiz.description}</p>}
            </div>

            <form onSubmit={handleSubmit} className="space-y-8">
                {(quiz.questions || []).map((q, qIdx) => (
                    <div key={qIdx} className="space-y-4">
                        <h4 className="font-bold text-nutrity-primary text-sm leading-relaxed">
                            <span className="text-nutrity-accent mr-2">{qIdx + 1}.</span> {q.text}
                        </h4>
                        <div className="space-y-2">
                            {(q.options || []).map((opt, oIdx) => (
                                <label key={oIdx} className={`flex items-center gap-3 p-4 rounded-xl border cursor-pointer transition-all ${answers[qIdx] === oIdx ? 'bg-nutrity-accent/5 border-nutrity-accent' : 'bg-slate-50 border-nutrity-border/50 hover:border-nutrity-accent/30'}`}>
                                    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 ${answers[qIdx] === oIdx ? 'border-nutrity-accent' : 'border-nutrity-gray-text/30'}`}>
                                        {answers[qIdx] === oIdx && <div className="w-2.5 h-2.5 rounded-full bg-nutrity-accent" />}
                                    </div>
                                    <span className="text-sm font-medium">{opt}</span>
                                </label>
                            ))}
                        </div>
                    </div>
                ))}

                <button
                    type="submit"
                    disabled={isSubmitting || !isComplete || !userId}
                    className="w-full bg-nutrity-primary text-white py-4 rounded-xl font-bold text-sm uppercase tracking-widest shadow-lg shadow-nutrity-primary/10 hover:bg-nutrity-accent transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                >
                    {isSubmitting && <Loader2 className="w-5 h-5 animate-spin" />}
                    {isSubmitting ? 'Evaluando...' : 'Enviar Respuestas'}
                </button>
            </form>
            {!userId && (
                <p className="text-[10px] text-red-500 mt-4 text-center font-bold uppercase">Debes iniciar sesión para realizar el cuestionario.</p>
            )}
        </div>
    );
}
