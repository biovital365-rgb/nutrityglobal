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
    existingAttempts?: any[];
}

export function LessonQuiz({ lessonId, quiz, userId, existingAttempts = [] }: LessonQuizProps) {
    const [answers, setAnswers] = useState<Record<number, number>>({});
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [result, setResult] = useState<{ score: number; passed: boolean } | null>(null);

    const allAttempts = result ? [...existingAttempts, result] : existingAttempts;
    const attemptsUsed = allAttempts.length;
    const isApproved = allAttempts.some(a => a.passed);
    const maxAttemptsReached = attemptsUsed >= 3;
    const bestScore = allAttempts.length > 0 ? Math.max(...allAttempts.map(a => a.score)) : 0;
    
    // We only block if they already passed or exhausted attempts
    const isBlocked = isApproved || maxAttemptsReached;

    const isComplete = Object.keys(answers || {})?.length === (quiz?.questions?.length || 0);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!isComplete || !userId) return;

        setIsSubmitting(true);
        try {
            // Calculate score client-side for simplicity before sending to backend
            let correctCount = 0;
            const answersArray = (quiz.questions || []).map((q, idx) => {
                const selectedIndex = answers[idx];
                const isCorrect = selectedIndex === q.correctIndex;
                if (isCorrect) correctCount++;
                return { questionIndex: idx, selectedIndex, isCorrect };
            });
            
            const score = Math.round((correctCount / (quiz?.questions?.length || 1)) * 10);
            
            const response = await submitQuizAttempt(lessonId, score, answersArray);
            setResult({ score, passed: response.passed });
        } catch (error) {
            console.error('Error al enviar el cuestionario:', error);
        } finally {
            setIsSubmitting(false);
        }
    };

    if (isBlocked) {
        return (
            <div className={`border rounded-3xl p-6 md:p-8 text-center space-y-4 mt-6 ${isApproved ? 'bg-nutrity-success/10 border-nutrity-success/20' : 'bg-red-50 border-red-100'}`}>
                <div className="flex justify-center gap-6 mb-4">
                    <div className="text-center">
                        <p className="text-[10px] font-bold text-nutrity-gray-text uppercase tracking-widest mb-1">Mejor Nota</p>
                        <p className={`text-2xl font-display font-bold ${isApproved ? 'text-nutrity-success' : 'text-red-500'}`}>{bestScore} / 10</p>
                    </div>
                    <div className="text-center">
                        <p className="text-[10px] font-bold text-nutrity-gray-text uppercase tracking-widest mb-1">Intentos</p>
                        <p className="text-2xl font-display font-bold text-nutrity-primary">{attemptsUsed} / 3</p>
                    </div>
                </div>

                <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto ${isApproved ? 'bg-nutrity-success/20 text-nutrity-success' : 'bg-red-100 text-red-500'}`}>
                    {isApproved ? <CheckCircle2 className="w-8 h-8" /> : <ShieldAlert className="w-8 h-8" />}
                </div>
                <div>
                    <h4 className={`font-display font-bold text-xl ${isApproved ? 'text-nutrity-success' : 'text-red-500'}`}>
                        {isApproved ? '¡Cuestionario Aprobado!' : 'Intentos Agotados'}
                    </h4>
                </div>
                <p className="text-sm font-medium opacity-80 max-w-sm mx-auto">
                    {isApproved 
                        ? 'Has superado el cuestionario con éxito. Puedes avanzar a la siguiente lección.' 
                        : 'Has alcanzado el límite máximo de intentos (3) sin aprobar. Contacta a tu coach para soporte adicional.'}
                </p>
            </div>
        );
    }

    return (
        <div className="bg-white border border-nutrity-border rounded-3xl p-6 md:p-8 mt-6 shadow-sm">
            <div className="mb-6 flex justify-between items-start">
                <div>
                    <h3 className="font-display font-bold text-xl">{quiz.title}</h3>
                    {quiz.description && <p className="text-sm text-nutrity-gray-text mt-1">{quiz.description}</p>}
                </div>
                <div className="text-right bg-slate-50 px-3 py-2 rounded-xl border border-slate-100">
                    <p className="text-[10px] font-bold text-nutrity-gray-text uppercase tracking-widest">Intentos Usados</p>
                    <p className="text-sm font-bold text-nutrity-primary">{attemptsUsed} de 3</p>
                </div>
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
