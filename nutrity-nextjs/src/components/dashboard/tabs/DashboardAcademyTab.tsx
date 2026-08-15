import { motion } from "framer-motion";
import { GraduationCap, Shield, Play, BookOpen, ArrowLeft, ArrowUpRight, CheckCircle2, Download, FileText, Lock } from "lucide-react";
import { getDirectImageUrl } from "@/lib/utils";
import * as dbService from "@/actions/db-actions";
import { LessonAssignment } from "../../LessonAssignment";
import { LessonQuiz } from "../../LessonQuiz";

export interface DashboardAcademyTabProps {
    courses: any[];
    lessonProgress: Record<string, boolean>;
    selectedCourse: any | null;
    user: any;
    setActiveLesson: (lesson: any) => void;
    activeLesson: any | null;
    setSelectedCourse: (course: any) => void;
    setLessonProgress: React.Dispatch<React.SetStateAction<Record<string, boolean>>>;
    userSubmissions: any[];
    userQuizAttempts: any[];
}

export function DashboardAcademyTab({
    courses,
    lessonProgress,
    selectedCourse,
    user,
    setActiveLesson,
    activeLesson,
    setSelectedCourse,
    setLessonProgress,
    userSubmissions,
    userQuizAttempts
}: DashboardAcademyTabProps) {
    return (
        <motion.div key="academy" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="space-y-1">
                    <h2 className="text-3xl font-display font-bold">Academia Nutrity Global</h2>
                    <p className="text-nutrity-gray-text text-sm">Medicina de Restauración y Bio-señalización para la remisión de DM2.</p>
                </div>
                <div className="flex flex-col items-end gap-2">
                    <div className="bg-nutrity-accent/10 px-4 py-2 rounded-xl flex items-center gap-3 border border-nutrity-accent/20">
                        <GraduationCap className="w-5 h-5 text-nutrity-accent" />
                        <span className="text-[10px] font-bold text-nutrity-accent uppercase tracking-widest">Acompañamiento Educativo</span>
                    </div>
                    {(() => {
                        const totalLessons = courses.reduce((acc, course) => acc + (course.lessons?.length || 0), 0);
                        const completedLessons = Object.values(lessonProgress).filter(Boolean).length;
                        const globalProgress = totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0;
                        return (
                            <div className="flex items-center gap-3 bg-white border border-nutrity-border px-4 py-2 rounded-xl shadow-sm w-full md:w-auto">
                                <div className="flex-1 w-full md:w-32 bg-slate-100 rounded-full h-2 overflow-hidden">
                                    <div className="bg-nutrity-success h-full transition-all duration-1000" style={{ width: `${globalProgress}%` }}></div>
                                </div>
                                <span className="text-[10px] font-bold text-nutrity-primary uppercase tracking-widest">{globalProgress}% Global</span>
                            </div>
                        );
                    })()}
                </div>
            </div>

            {!selectedCourse ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {[...courses].sort((a, b) => {
                        const getCourseNumber = (title: string): number => {
                            const t = title.toLowerCase();
                            if (t.includes('método 50') || t.includes('metodo 50') || t.includes('curso 1')) return 1;
                            if (t.includes('código vitalidad') || t.includes('codigo vitalidad') || t.includes('curso 2')) return 2;
                            if (t.includes('escudo de fibra') || t.includes('curso 3')) return 3;
                            if (t.includes('microbiota') || t.includes('curso 4')) return 4;
                            if (t.includes('ayuno') || t.includes('curso 5')) return 5;
                            if (t.includes('mantenimiento') || t.includes('curso 6')) return 6;
                            if (t.includes('bioquímica') || t.includes('bioquimica') || t.includes('curso 7')) return 7;
                            if (t.includes('psico') || t.includes('curso 8')) return 8;
                            return 99;
                        };
                        return getCourseNumber(a.title) - getCourseNumber(b.title);
                    }).map((course, index) => {
                        const isEbook = course.category?.toLowerCase().includes('ebook') || course.category?.toLowerCase().includes('guía');
                        
                        // Lógica de Acceso por Plan
                        let isLocked = false;
                        let lockMessage = 'Bloqueado';
                        
                        const getCourseNumberLocal = (title: string): number => {
                            const t = title.toLowerCase();
                            if (t.includes('método 50') || t.includes('metodo 50') || t.includes('curso 1')) return 1;
                            if (t.includes('código vitalidad') || t.includes('codigo vitalidad') || t.includes('curso 2')) return 2;
                            if (t.includes('escudo de fibra') || t.includes('curso 3')) return 3;
                            if (t.includes('microbiota') || t.includes('curso 4')) return 4;
                            if (t.includes('ayuno') || t.includes('curso 5')) return 5;
                            if (t.includes('mantenimiento') || t.includes('curso 6')) return 6;
                            if (t.includes('bioquímica') || t.includes('bioquimica') || t.includes('curso 7')) return 7;
                            if (t.includes('psico') || t.includes('curso 8')) return 8;
                            return 99;
                        };
                        
                        if (!isEbook) {
                            const plan = (user?.profile?.plan || 'FREE').toUpperCase();
                            const courseNum = getCourseNumberLocal(course.title);
                            
                            if (courseNum === 1) {
                                // Curso 1 always open, lesson restrictions inside
                                isLocked = false;
                            } else if (courseNum === 2 || courseNum === 3) {
                                // Cursos 2 y 3: Requieren Básico, Premium o Elite
                                if (plan === 'FREE') {
                                    isLocked = true;
                                    lockMessage = 'Requiere Plan Básico';
                                }
                            } else if (courseNum >= 4) {
                                // Cursos 4, 5 y 6: Requieren Premium o Elite
                                if (plan === 'FREE' || plan === 'BASIC' || plan === 'BÁSICO' || plan === 'BASICO') {
                                    isLocked = true;
                                    lockMessage = 'Requiere Plan Premium';
                                }
                            }
                        }
                        return (
                        <div key={course.id} className="nutrity-card overflow-hidden group hover:border-nutrity-accent transition-all flex flex-col">
                            <div className="h-48 overflow-hidden relative">
                                <img src={getDirectImageUrl(course.thumbnail)} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" alt={course.title} referrerPolicy="no-referrer" onError={(e) => { e.currentTarget.src = '/food-placeholder.svg'; }} />
                                <div className="absolute top-4 right-4 flex gap-2">
                                    {course.price > 0 && !user?.profile?.plan?.includes('ELITE') && (
                                        <div className="bg-amber-500 text-white px-3 py-1 rounded-lg text-[10px] font-bold uppercase tracking-widest flex items-center gap-1.5 shadow-lg">
                                            <Shield className="w-3 h-3" /> Premium
                                        </div>
                                    )}
                                    <div className="bg-white/90 backdrop-blur-md px-3 py-1 rounded-lg text-[10px] font-bold text-nutrity-accent uppercase tracking-widest flex items-center gap-1.5">
                                        {isEbook ? <BookOpen className="w-3 h-3" /> : <Play className="w-3 h-3" />}
                                        {course.category}
                                    </div>
                                </div>
                                {course.price > 0 && !user?.profile?.plan?.includes('ELITE') && (
                                    <div className="absolute inset-0 bg-nutrity-primary/40 backdrop-blur-[2px] flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                        <Shield className="w-12 h-12 text-white opacity-50" />
                                    </div>
                                )}
                            </div>
                            <div className="p-8 flex-1 flex flex-col">
                                <h3 className="text-2xl font-bold mb-3">{course.title}</h3>
                                <p className="text-sm text-nutrity-gray-text mb-8 leading-relaxed font-medium line-clamp-2">{course.description}</p>
                                <div className="mt-auto pt-6 border-t border-nutrity-border flex items-center justify-between">
                                    <div className="flex flex-col">
                                        <div className="flex items-center gap-2 mb-1">
                                            {isEbook ? (
                                                <BookOpen className="w-3 h-3 text-nutrity-accent" />
                                            ) : (
                                                <Play className="w-3 h-3 text-nutrity-accent" />
                                            )}
                                            <span className="text-[10px] font-bold text-nutrity-gray-text uppercase tracking-widest">
                                                {isEbook ? 'Guía Descargable' : `${course.lessons?.length || 6} Lecciones`}
                                            </span>
                                        </div>
                                        <span className="text-lg font-bold text-nutrity-primary">${course.price} <span className="text-[10px] text-nutrity-gray-text">USD</span></span>
                                    </div>
                                    <div className="flex gap-2">
                                        {isLocked ? (
                                            <button
                                                disabled
                                                title={lockMessage}
                                                className="px-4 py-2.5 bg-slate-100 text-slate-400 text-[9px] font-bold uppercase tracking-widest rounded-xl shadow-sm flex-1 text-center flex items-center justify-center gap-2 cursor-not-allowed border border-slate-200"
                                            >
                                                <Lock className="w-3 h-3" /> {lockMessage}
                                            </button>
                                        ) : (
                                            <button
                                                onClick={async () => {
                                                    if (isEbook && (course.price === 0 || user?.profile?.plan?.includes('ELITE'))) {
                                                        window.open(course.paypalUrl || '#', "_blank");
                                                        return;
                                                    }
                                                    const detailed = await dbService.getCourseWithLessons(course.id);
                                                    setSelectedCourse(detailed);
                                                    if (detailed?.lessons && detailed.lessons?.length > 0) {
                                                        setActiveLesson(detailed.lessons.sort((a: any, b: any) => a.order - b.order)[0]);
                                                    }
                                                }}
                                                className="px-4 py-2.5 bg-nutrity-primary text-white text-[9px] font-bold uppercase tracking-widest rounded-xl shadow-lg shadow-nutrity-primary/10 hover:bg-nutrity-accent transition-all flex-1 text-center"
                                            >
                                                {isEbook ? 'Descargar' : 'Iniciar'}
                                            </button>
                                        )}
                                        {course.price > 0 && course.paypalUrl && !isLocked && (
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    const checkoutUrl = course.paypalUrl || "https://www.paypal.com/ncp/payment/CMG445X32EL2S";
                                                    window.open(checkoutUrl, "_blank");
                                                }}
                                                className="px-4 py-2.5 bg-amber-500 text-white text-[9px] font-bold uppercase tracking-widest rounded-xl shadow-lg shadow-amber-500/20 hover:bg-amber-600 transition-all flex-1 text-center"
                                            >
                                                Comprar
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    )})}
                </div>
            ) : (
                <div className="space-y-8">
                    <button onClick={() => { setSelectedCourse(null); setActiveLesson(null); }} className="flex items-center gap-2 text-nutrity-accent font-bold text-xs uppercase tracking-widest hover:underline mb-4">
                        <ArrowLeft className="w-4 h-4" /> Volver al Catálogo
                    </button>
                    <div className="grid lg:grid-cols-3 gap-8">
                        <div className="lg:col-span-2 space-y-6">
                            <div className="aspect-video bg-black rounded-3xl overflow-hidden shadow-2xl relative group">
                                {activeLesson?.videoUrl ? (
                                    <iframe 
                                        src={activeLesson.videoUrl.includes('youtube.com/watch') 
                                            ? activeLesson.videoUrl.replace('watch?v=', 'embed/') 
                                            : activeLesson.videoUrl.includes('youtu.be') 
                                                ? activeLesson.videoUrl.replace('youtu.be/', 'youtube.com/embed/') 
                                                : activeLesson.videoUrl}
                                        title={activeLesson?.title || "Video Player"}
                                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                        allowFullScreen
                                        className="w-full h-full border-0"
                                    />
                                ) : (
                                    <>
                                        <img src={getDirectImageUrl(selectedCourse.thumbnail)} className="w-full h-full object-cover opacity-60" alt="Image" referrerPolicy="no-referrer" onError={(e) => { e.currentTarget.src = '/food-placeholder.svg'; }} />
                                        <div className="absolute inset-0 flex items-center justify-center">
                                            <Play className="w-20 h-20 text-white/20" />
                                            <div className="absolute bottom-8 left-8 right-8 text-white">
                                                <p className="text-[10px] font-bold uppercase tracking-widest text-nutrity-accent mb-2">Selecciona una lección</p>
                                                <h3 className="text-2xl font-bold">{selectedCourse.title}</h3>
                                            </div>
                                        </div>
                                    </>
                                )}
                            </div>
                            <div className="space-y-4">
                                <h3 className="text-xl font-bold">{activeLesson ? activeLesson.title : "Acerca de esta lección"}</h3>
                                <p className="text-sm text-nutrity-gray-text leading-relaxed font-medium">
                                    {activeLesson?.description ? activeLesson.description : selectedCourse.description}
                                </p>
                                {activeLesson?.videoInstructions && (
                                    <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 mt-4">
                                        <h4 className="text-xs font-bold uppercase tracking-widest text-nutrity-accent mb-2 flex items-center gap-2"><Play className="w-3 h-3" /> Instrucciones del Video</h4>
                                        <p className="text-sm text-nutrity-gray-text">{activeLesson.videoInstructions}</p>
                                    </div>
                                )}
                                {(activeLesson && !activeLesson.quiz && !activeLesson.assignment && !lessonProgress[activeLesson.id]) && (
                                    <button 
                                        onClick={async () => {
                                            await dbService.markLessonVideoWatched(activeLesson.id);
                                            setLessonProgress(prev => ({ ...prev, [activeLesson.id]: true }));
                                        }}
                                        className="mt-4 bg-nutrity-success text-white px-6 py-3 rounded-xl font-bold text-xs uppercase tracking-widest shadow-lg shadow-nutrity-success/20 hover:bg-green-600 transition-all flex items-center gap-2"
                                    >
                                        <CheckCircle2 className="w-4 h-4" /> Marcar como Completada
                                    </button>
                                )}
                            </div>

                            {(activeLesson?.presentationUrl || activeLesson?.pdfUrl) && (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
                                    {activeLesson?.presentationUrl && (
                                        <div className="bg-white border border-nutrity-border p-5 rounded-2xl flex flex-col items-start gap-3 shadow-sm hover:border-blue-200 transition-colors">
                                            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-500 flex items-center justify-center shrink-0">
                                                <BookOpen className="w-5 h-5" />
                                            </div>
                                            <div className="flex-1">
                                                <h4 className="font-bold text-sm text-nutrity-primary">Presentación de la Lección</h4>
                                                {activeLesson.presentationInstructions && <p className="text-xs text-nutrity-gray-text mt-1.5 leading-relaxed">{activeLesson.presentationInstructions}</p>}
                                            </div>
                                            <a href={`/api/academic/download?lessonId=${activeLesson.id}&type=presentation`} target="_blank" rel="noopener noreferrer" className="mt-2 px-4 py-2.5 text-xs font-bold bg-blue-50 text-blue-600 rounded-xl hover:bg-blue-100 transition-colors w-full text-center flex items-center justify-center gap-2 uppercase tracking-widest">
                                                <ArrowUpRight className="w-3.5 h-3.5" /> Ver Presentación
                                            </a>
                                        </div>
                                    )}
                                    {activeLesson?.pdfUrl && (
                                        <div className="bg-white border border-nutrity-border p-5 rounded-2xl flex flex-col items-start gap-3 shadow-sm hover:border-rose-200 transition-colors">
                                            <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-500 flex items-center justify-center shrink-0">
                                                <FileText className="w-5 h-5" />
                                            </div>
                                            <div className="flex-1">
                                                <h4 className="font-bold text-sm text-nutrity-primary">Recurso PDF Adicional</h4>
                                                {activeLesson.pdfInstructions && <p className="text-xs text-nutrity-gray-text mt-1.5 leading-relaxed">{activeLesson.pdfInstructions}</p>}
                                            </div>
                                            <a href={`/api/academic/download?lessonId=${activeLesson.id}&type=pdf`} target="_blank" rel="noopener noreferrer" className="mt-2 px-4 py-2.5 text-xs font-bold bg-rose-50 text-rose-600 rounded-xl hover:bg-rose-100 transition-colors w-full text-center flex items-center justify-center gap-2 uppercase tracking-widest">
                                                <Download className="w-3.5 h-3.5" /> Descargar PDF
                                            </a>
                                        </div>
                                    )}
                                </div>
                            )}
                            
                            {activeLesson?.assignment && (
                                <LessonAssignment lessonId={activeLesson.id} assignment={activeLesson.assignment} userId={user?.id || user?.uid} existingSubmission={userSubmissions.find(s => s.assignmentId === activeLesson.assignment.id)} />
                            )}
                            
                            {activeLesson?.quiz && (
                                <LessonQuiz lessonId={activeLesson.id} quiz={activeLesson.quiz} userId={user?.id || user?.uid} existingAttempts={userQuizAttempts.filter(a => a.quizId === activeLesson.quiz.id)} />
                            )}
                        </div>
                        <div className="space-y-6">
                            <h3 className="font-display font-bold text-lg">Currículo del Curso</h3>
                            <div className="space-y-3">
                                {(() => {
                                    const sortedLessons = (selectedCourse.lessons || []).sort((a: any, b: any) => a.order - b.order);
                                    return sortedLessons.map((lesson: any, idx: number) => {
                                        const getCourseNumberLocal = (title: string): number => {
                                            const t = title.toLowerCase();
                                            if (t.includes('método 50') || t.includes('metodo 50') || t.includes('curso 1')) return 1;
                                            if (t.includes('código vitalidad') || t.includes('codigo vitalidad') || t.includes('curso 2')) return 2;
                                            if (t.includes('escudo de fibra') || t.includes('curso 3')) return 3;
                                            if (t.includes('microbiota') || t.includes('curso 4')) return 4;
                                            if (t.includes('ayuno') || t.includes('curso 5')) return 5;
                                            if (t.includes('mantenimiento') || t.includes('curso 6')) return 6;
                                            if (t.includes('bioquímica') || t.includes('bioquimica') || t.includes('curso 7')) return 7;
                                            if (t.includes('psico') || t.includes('curso 8')) return 8;
                                            return 99;
                                        };
                                        const plan = (user?.profile?.plan || 'FREE').toUpperCase();
                                        const courseNum = getCourseNumberLocal(selectedCourse.title);
                                        
                                        // Lógica de plan
                                        const isPlanLocked = (courseNum === 1 && plan === 'FREE' && idx >= 2) || 
                                                            ((courseNum === 2 || courseNum === 3) && plan === 'FREE') || 
                                                            (courseNum >= 4 && (plan === 'FREE' || plan === 'BASIC' || plan === 'BÁSICO' || plan === 'BASICO'));
                                        
                                        // Bloqueo secuencial
                                        const isSequentialLocked = idx > 0 && !lessonProgress[sortedLessons[idx - 1].id];
                                        
                                        const isLessonLocked = isPlanLocked || isSequentialLocked;
                                        const lockMessage = isPlanLocked ? "Requiere actualizar plan" : "Completa la lección anterior";

                                        return (
                                        <div key={lesson.id}
                                            onClick={async () => {
                                                if (isLessonLocked) {
                                                    alert(`Esta lección está bloqueada: ${lockMessage}`);
                                                    return;
                                                }
                                                setActiveLesson(lesson);
                                            }}
                                            className={`p-4 rounded-2xl border transition-all ${isLessonLocked ? 'opacity-60 bg-slate-50 cursor-not-allowed border-slate-200 hover:border-slate-300' : 'cursor-pointer ' + (activeLesson?.id === lesson.id ? 'ring-2 ring-nutrity-accent shadow-md' : '')} ${lessonProgress[lesson.id] && !isLessonLocked ? 'bg-nutrity-success/5 border-nutrity-success/30 opacity-70' : (!isLessonLocked ? 'bg-white border-nutrity-border hover:border-nutrity-accent/30' : '')}`}>
                                        <div className="flex gap-4">
                                            <div className={`w-8 h-8 rounded-lg shrink-0 flex items-center justify-center font-bold text-xs ${lessonProgress[lesson.id] && !isLessonLocked ? 'bg-nutrity-success text-white' : (activeLesson?.id === lesson.id && !isLessonLocked ? 'bg-nutrity-accent text-white' : 'bg-nutrity-bg text-nutrity-gray-text')}`}>
                                                {isLessonLocked ? <Lock className="w-4 h-4 opacity-50" /> : (lessonProgress[lesson.id] ? <CheckCircle2 className="w-4 h-4" /> : lesson.order)}
                                            </div>
                                            <div>
                                                <h4 className={`text-sm font-bold leading-snug ${lessonProgress[lesson.id] && !isLessonLocked ? 'text-nutrity-gray-text line-through' : (activeLesson?.id === lesson.id && !isLessonLocked ? 'text-nutrity-primary' : 'text-nutrity-gray-text')}`}>{lesson.title}</h4>
                                                <div className="flex items-center gap-3 mt-2">
                                                    <span className="text-[9px] font-bold text-nutrity-gray-text uppercase tracking-widest">{lesson.duration || '15:00 min'}</span>
                                                    {isLessonLocked ? (
                                                        <span className="text-[9px] font-bold text-amber-500 uppercase tracking-widest bg-amber-500/10 px-2 py-0.5 rounded-full flex items-center gap-1"><Lock className="w-2 h-2"/> PRO</span>
                                                    ) : lesson.isFree ? (
                                                        <span className="text-[9px] font-bold text-nutrity-success uppercase tracking-widest bg-nutrity-success/10 px-2 py-0.5 rounded-full">Gratis</span>
                                                    ) : (
                                                        <Shield className="w-3 h-3 text-nutrity-accent opacity-30" />
                                                    )}
                                                    {lessonProgress[lesson.id] && !isLessonLocked && <span className="text-[9px] font-bold text-nutrity-success uppercase tracking-widest">Completado</span>}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                );
                                });
                                })()}
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </motion.div>
    );
}
