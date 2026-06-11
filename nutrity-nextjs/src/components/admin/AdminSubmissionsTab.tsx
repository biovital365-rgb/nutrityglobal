"use client";
import React, { useState } from 'react';
import { FileText, CheckCircle2, Clock, Send, Search, CheckCircle, XCircle } from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

interface AdminSubmissionsTabProps {
    submissions: any[];
    quizAttempts?: any[];
    isSaving: boolean;
    onReview: (submissionId: string, feedback: string) => Promise<void>;
}

export function AdminSubmissionsTab({ submissions, quizAttempts = [], isSaving, onReview }: AdminSubmissionsTabProps) {
    const [activeTab, setActiveTab] = useState<'ASSIGNMENTS' | 'QUIZZES'>('ASSIGNMENTS');
    const [searchTerm, setSearchTerm] = useState('');
    const [filter, setFilter] = useState<'ALL' | 'PENDING' | 'REVIEWED'>('ALL');
    const [selectedCourseFilter, setSelectedCourseFilter] = useState('ALL');
    const [selectedSub, setSelectedSub] = useState<any | null>(null);
    const [feedback, setFeedback] = useState('');

    // Extract unique courses
    const allCoursesMap = new Map();
    submissions.forEach(s => {
        const course = s.assignment?.lesson?.course;
        if (course) allCoursesMap.set(course.id, course.title);
    });
    quizAttempts.forEach(q => {
        const course = q.quiz?.lesson?.course;
        if (course) allCoursesMap.set(course.id, course.title);
    });
    const uniqueCourses = Array.from(allCoursesMap.entries()).map(([id, title]) => ({ id, title }));

    const filteredSubs = submissions.filter(s => {
        const matchesSearch = s.user?.name?.toLowerCase().includes(searchTerm.toLowerCase()) || 
                              s.assignment?.title?.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesFilter = filter === 'ALL' || s.status === filter;
        const matchesCourse = selectedCourseFilter === 'ALL' || s.assignment?.lesson?.course?.id === selectedCourseFilter;
        return matchesSearch && matchesFilter && matchesCourse;
    });

    const filteredQuizzes = quizAttempts.filter(q => {
        const matchesSearch = q.user?.name?.toLowerCase().includes(searchTerm.toLowerCase()) || 
                              q.quiz?.title?.toLowerCase().includes(searchTerm.toLowerCase());
        // For quizzes, map 'PENDING'/'REVIEWED' filter to pass/fail conceptually if needed, or ignore filter.
        const matchesFilter = filter === 'ALL' || (filter === 'REVIEWED' && q.passed) || (filter === 'PENDING' && !q.passed);
        const matchesCourse = selectedCourseFilter === 'ALL' || q.quiz?.lesson?.course?.id === selectedCourseFilter;
        return matchesSearch && matchesFilter && matchesCourse;
    });

    const handleReview = async () => {
        if (!selectedSub || !feedback.trim() || activeTab === 'QUIZZES') return;
        await onReview(selectedSub.id, feedback);
        setSelectedSub(null);
        setFeedback('');
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
                <div className="flex bg-nutrity-bg border border-nutrity-border rounded-xl p-1 w-full md:w-auto">
                    <button
                        onClick={() => { setActiveTab('ASSIGNMENTS'); setSelectedSub(null); }}
                        className={`flex-1 px-6 py-2.5 rounded-lg text-sm font-bold transition-all ${
                            activeTab === 'ASSIGNMENTS' ? 'bg-white text-nutrity-primary shadow-sm' : 'text-nutrity-gray-text hover:bg-slate-50'
                        }`}
                    >
                        Tareas ({submissions.length})
                    </button>
                    <button
                        onClick={() => { setActiveTab('QUIZZES'); setSelectedSub(null); }}
                        className={`flex-1 px-6 py-2.5 rounded-lg text-sm font-bold transition-all ${
                            activeTab === 'QUIZZES' ? 'bg-white text-nutrity-primary shadow-sm' : 'text-nutrity-gray-text hover:bg-slate-50'
                        }`}
                    >
                        Quizzes ({quizAttempts.length})
                    </button>
                </div>

                <div className="relative flex-1 w-full max-w-md flex gap-2">
                    <div className="relative flex-1">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-nutrity-gray-text opacity-40" />
                        <input
                            type="text"
                            placeholder="Buscar por paciente o título..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full bg-white border border-nutrity-border rounded-xl pl-11 pr-5 py-3 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-nutrity-accent/20"
                        />
                    </div>
                    <select
                        value={selectedCourseFilter}
                        onChange={(e) => setSelectedCourseFilter(e.target.value)}
                        className="bg-white border border-nutrity-border rounded-xl px-4 py-3 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-nutrity-accent/20 cursor-pointer min-w-[150px]"
                    >
                        <option value="ALL">Todos los Cursos</option>
                        {uniqueCourses.map(c => (
                            <option key={c.id} value={c.id}>{c.title}</option>
                        ))}
                    </select>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-1 space-y-4">
                    {activeTab === 'ASSIGNMENTS' && filteredSubs.map((sub) => (
                        <div
                            key={sub.id}
                            onClick={() => { setSelectedSub(sub); setFeedback(sub.feedback || ''); }}
                            className={`p-4 rounded-2xl border cursor-pointer transition-all ${selectedSub?.id === sub.id ? 'bg-nutrity-accent/5 border-nutrity-accent' : 'bg-white border-nutrity-border hover:border-nutrity-accent/30'}`}
                        >
                            <div className="flex justify-between items-start mb-2">
                                <span className="text-xs font-bold uppercase text-nutrity-primary">
                                    {sub.assignment?.lesson?.title?.substring(0, 20) || 'Lección'}...
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

                    {activeTab === 'QUIZZES' && filteredQuizzes.map((quiz) => (
                        <div
                            key={quiz.id}
                            onClick={() => { setSelectedSub(quiz); }}
                            className={`p-4 rounded-2xl border cursor-pointer transition-all ${selectedSub?.id === quiz.id ? 'bg-nutrity-accent/5 border-nutrity-accent' : 'bg-white border-nutrity-border hover:border-nutrity-accent/30'}`}
                        >
                            <div className="flex justify-between items-start mb-2">
                                <span className="text-xs font-bold uppercase text-nutrity-primary">
                                    {quiz.quiz?.lesson?.title?.substring(0, 20) || 'Lección'}...
                                </span>
                                {quiz.passed ? (
                                    <span className="flex items-center gap-1 text-[10px] font-bold text-nutrity-success bg-nutrity-success/10 px-2 py-1 rounded-full">
                                        <CheckCircle className="w-3 h-3" /> {quiz.score}/10
                                    </span>
                                ) : (
                                    <span className="flex items-center gap-1 text-[10px] font-bold text-red-500 bg-red-50 px-2 py-1 rounded-full">
                                        <XCircle className="w-3 h-3" /> {quiz.score}/10
                                    </span>
                                )}
                            </div>
                            <h4 className="font-bold text-sm truncate">{quiz.quiz?.title}</h4>
                            <p className="text-xs text-nutrity-gray-text mt-1">Por: {quiz.user?.name || quiz.user?.email}</p>
                            <p className="text-[10px] text-nutrity-gray-text opacity-70 mt-2">
                                {format(new Date(quiz.createdAt), "d 'de' MMMM, yyyy", { locale: es })}
                            </p>
                        </div>
                    ))}

                    {((activeTab === 'ASSIGNMENTS' && filteredSubs.length === 0) || (activeTab === 'QUIZZES' && filteredQuizzes.length === 0)) && (
                        <div className="text-center p-8 bg-white rounded-3xl border border-dashed border-nutrity-border">
                            <FileText className="w-8 h-8 text-nutrity-gray-text/30 mx-auto mb-2" />
                            <p className="text-sm font-medium text-nutrity-gray-text">No hay {activeTab === 'ASSIGNMENTS' ? 'tareas' : 'quizzes'}</p>
                        </div>
                    )}
                </div>

                <div className="lg:col-span-2">
                    {selectedSub ? (
                        activeTab === 'ASSIGNMENTS' ? (
                            <div className="bg-white border border-nutrity-border rounded-3xl p-6 shadow-sm sticky top-6">
                                <div className="mb-6">
                                    <h3 className="text-xl font-bold font-display">{selectedSub.assignment?.title}</h3>
                                    <p className="text-sm text-nutrity-gray-text mt-1">
                                        Enviado por <span className="font-bold text-nutrity-primary">{selectedSub.user?.name || selectedSub.user?.email}</span> el {format(new Date(selectedSub.createdAt), "dd/MM/yyyy HH:mm")}
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
                            <div className="bg-white border border-nutrity-border rounded-3xl p-6 shadow-sm sticky top-6">
                                <div className="mb-6">
                                    <h3 className="text-xl font-bold font-display">{selectedSub.quiz?.title}</h3>
                                    <p className="text-sm text-nutrity-gray-text mt-1">
                                        Realizado por <span className="font-bold text-nutrity-primary">{selectedSub.user?.name || selectedSub.user?.email}</span> el {format(new Date(selectedSub.createdAt), "dd/MM/yyyy HH:mm")}
                                    </p>
                                    <div className={`mt-4 inline-flex items-center gap-2 px-4 py-2 rounded-full font-bold text-sm ${selectedSub.passed ? 'bg-nutrity-success/10 text-nutrity-success' : 'bg-red-50 text-red-500'}`}>
                                        {selectedSub.passed ? <CheckCircle className="w-5 h-5" /> : <XCircle className="w-5 h-5" />}
                                        Calificación: {selectedSub.score}/10 {selectedSub.passed ? '(Aprobado)' : '(Reprobado)'}
                                    </div>
                                </div>

                                <div className="bg-slate-50 border border-nutrity-border rounded-2xl p-6 mb-6">
                                    <h4 className="text-xs font-bold uppercase tracking-widest text-nutrity-gray-text mb-3">Detalle de Respuestas:</h4>
                                    <pre className="text-xs font-medium leading-relaxed whitespace-pre-wrap bg-white p-4 border border-nutrity-border rounded-xl overflow-x-auto">
                                        {JSON.stringify(selectedSub.answers, null, 2)}
                                    </pre>
                                </div>
                            </div>
                        )
                    ) : (
                        <div className="bg-white border border-nutrity-border rounded-3xl p-12 text-center flex flex-col items-center justify-center h-full text-nutrity-gray-text">
                            <FileText className="w-12 h-12 opacity-20 mb-4" />
                            <p className="font-medium">Selecciona un elemento en el panel izquierdo para revisar.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

