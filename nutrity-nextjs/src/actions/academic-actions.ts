"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { getInternalId, getServerUser } from "./user-actions";
import { Course, Lesson } from "./db-actions";

export async function getCourses(organizationId?: string, includeDeleted = false) {
    const whereClause: any = {};
    if (!includeDeleted) {
        whereClause.deletedAt = null;
    }
    
    if (organizationId) {
        whereClause.OR = [
            { organizationId: null },
            { organizationId }
        ];
    }
    
    const courses = await prisma.course.findMany({
        where: whereClause,
        include: {
            lessons: {
                include: {
                    quiz: true,
                    assignment: true
                },
                orderBy: { order: 'asc' }
            }
        },
        orderBy: { createdAt: 'desc' }
    });
    
    return courses as any;
}

export async function getCourseWithLessons(courseId: string) {
    const data = await prisma.course.findUnique({
        where: { id: courseId },
        include: {
            lessons: {
                include: {
                    quiz: true,
                    assignment: true
                },
                orderBy: {
                    order: 'asc'
                }
            }
        }
    });

    if (!data) throw new Error('Course not found');
    return data as any;
}

export async function saveCourse(course: any, organizationId?: string) {
    const { lessons, ...courseData } = course;
    
    const id = courseData.id && courseData.id.length > 20 ? courseData.id : crypto.randomUUID();
    
    const payload = {
        organizationId: courseData.organizationId || organizationId || null,
        title: courseData.title || '',
        description: courseData.description || '',
        thumbnail: courseData.thumbnail || '',
        category: courseData.category || 'Bienestar',
        price: Number(courseData.price) || 0,
        level: Number(courseData.level) || 1,
        paypalUrl: courseData.paypalUrl || null,
        currency: courseData.currency || 'USD',
        isPublished: courseData.isPublished !== undefined ? courseData.isPublished : true,
        updatedAt: new Date(),
    };

    const data = await prisma.course.upsert({
        where: { id },
        update: payload,
        create: { ...payload, id }
    });
    
    // Handle lessons if they exist
    if (lessons && Array.isArray(lessons)) {
        for (let i = 0; i < lessons.length; i++) {
            const lessonData = lessons[i];
            const savedLessonId = lessonData.id && lessonData.id.length > 20 ? lessonData.id : crypto.randomUUID();
            
            const lessonPayload = {
                title: lessonData.title || `Lección ${i + 1}`,
                description: lessonData.description || null,
                videoUrl: lessonData.videoUrl || null,
                videoInstructions: lessonData.videoInstructions || null,
                presentationUrl: lessonData.presentationUrl || null,
                presentationInstructions: lessonData.presentationInstructions || null,
                pdfUrl: lessonData.pdfUrl || null,
                pdfInstructions: lessonData.pdfInstructions || null,
                duration: lessonData.duration || null,
                order: lessonData.order !== undefined ? lessonData.order : i,
                isFree: lessonData.isFree || false
            };
            
            await prisma.lesson.upsert({
                where: { id: savedLessonId },
                update: { ...lessonPayload, courseId: id },
                create: { ...lessonPayload, courseId: id, id: savedLessonId }
            });
            
            if (lessonData.quiz) {
                await prisma.quiz.upsert({
                    where: { lessonId: savedLessonId },
                    update: { title: lessonData.quiz.title || '', description: lessonData.quiz.description || '', questions: lessonData.quiz.questions || [] },
                    create: { lessonId: savedLessonId, title: lessonData.quiz.title || '', description: lessonData.quiz.description || '', questions: lessonData.quiz.questions || [] }
                }).catch(console.error);
            } else {
                await prisma.quiz.deleteMany({ where: { lessonId: savedLessonId } }).catch(() => {});
            }

            if (lessonData.assignment) {
                await prisma.assignment.upsert({
                    where: { lessonId: savedLessonId },
                    update: { title: lessonData.assignment.title || '', description: lessonData.assignment.description || '' },
                    create: { lessonId: savedLessonId, title: lessonData.assignment.title || '', description: lessonData.assignment.description || '' }
                }).catch(console.error);
            } else {
                await prisma.assignment.deleteMany({ where: { lessonId: savedLessonId } }).catch(() => {});
            }
        }
    }
    
    revalidatePath('/', 'layout');
    return data as any;
}

export async function deleteCourse(id: string) {
    await prisma.course.update({
        where: { id },
        data: { deletedAt: new Date() }
    });
    revalidatePath('/', 'layout');
    return true;
}

export async function restoreCourse(id: string) {
    const data = await prisma.course.update({
        where: { id },
        data: { deletedAt: null }
    });
    revalidatePath('/', 'layout');
    return data;
}

export async function toggleLessonProgress(userId: string, lessonId: string, completed: boolean) {
    const internalId = await getInternalId(userId);
    
    await prisma.lessonProgress.upsert({
        where: {
            userId_lessonId: {
                userId: internalId,
                lessonId: lessonId
            }
        },
        update: {
            completed
        },
        create: {
            userId: internalId,
            lessonId: lessonId,
            completed
        }
    });

    return true;
}

export async function getLessonsProgress(userId: string) {
    const internalId = await getInternalId(userId);
    const data = await prisma.lessonProgress.findMany({
        where: { userId: internalId },
        select: { lessonId: true, completed: true }
    });

    const progress: Record<string, boolean> = {};
    data.forEach((item: any) => {
        progress[item.lessonId] = item.completed;
    });
    return progress;
}
// ─── LMS FASE 2: EVALUACIONES Y TAREAS ───────────────────────────────────────

export async function saveQuiz(lessonId: string, title: string, description: string, questions: any[]) {
    const user = await getServerUser();
    if (!user || user.role !== 'ADMIN') throw new Error("Unauthorized");

    const payload = {
        lessonId,
        title,
        description,
        questions,
    };

    const data = await prisma.quiz.upsert({
        where: { lessonId },
        update: payload,
        create: payload,
    });
    return data;
}

export async function saveAssignment(lessonId: string, title: string, description: string) {
    const user = await getServerUser();
    if (!user || user.role !== 'ADMIN') throw new Error("Unauthorized");

    const payload = {
        lessonId,
        title,
        description,
    };

    const data = await prisma.assignment.upsert({
        where: { lessonId },
        update: payload,
        create: payload,
    });
    return data;
}


export async function getAssignmentSubmissions(organizationId?: string) {
    const whereClause: any = {};
    if (organizationId) {
        whereClause.organizationId = organizationId;
    }

    const submissions = await prisma.assignmentSubmission.findMany({
        where: whereClause,
        include: { 
            user: { select: { name: true, email: true } },
            assignment: { select: { title: true, lesson: { select: { title: true } } } }
        },
        orderBy: { createdAt: 'desc' }
    });
    return submissions;
}

export async function getQuizAttempts(organizationId?: string) {
    const whereClause: any = {};
    if (organizationId) {
        whereClause.organizationId = organizationId;
    }

    const attempts = await prisma.quizAttempt.findMany({
        where: whereClause,
        include: { 
            user: { select: { name: true, email: true } },
            quiz: { select: { title: true, lesson: { select: { title: true } } } }
        },
        orderBy: { createdAt: 'desc' }
    });
    return attempts;
}

export async function getUserAssignmentSubmissions(userId: string) {
    const internalId = await getInternalId(userId);
    return await prisma.assignmentSubmission.findMany({
        where: { userId: internalId },
        include: { assignment: { select: { lessonId: true } } },
        orderBy: { createdAt: 'desc' }
    });
}

export async function getUserQuizAttempts(userId: string) {
    const internalId = await getInternalId(userId);
    return await prisma.quizAttempt.findMany({
        where: { userId: internalId },
        include: { quiz: { select: { lessonId: true } } },
        orderBy: { createdAt: 'desc' }
    });
}

export async function reviewAssignmentSubmission(submissionId: string, feedback: string, status: 'REVIEWED' | 'APPROVED' | 'REJECTED' = 'REVIEWED') {
    const updated = await prisma.assignmentSubmission.update({
        where: { id: submissionId },
        data: { status, feedback }
    });
    return updated;
}


// ─── ACADÉMICO: TAREAS Y CUESTIONARIOS ────────────────────────────────────────

export async function verifyLessonAccess(internalUserId: string, lessonId: string) {
    const user = await prisma.user.findUnique({ where: { id: internalUserId } });
    if (!user) throw new Error("User not found");

    const lesson = await prisma.lesson.findUnique({
        where: { id: lessonId },
        include: { course: true }
    });
    if (!lesson) throw new Error("Lesson not found");

    if (user.plan === 'ELITE' || user.role === 'ADMIN') return true;

    const courseNum = lesson.course.level || 1;

    const plan = (user.plan || 'FREE').toUpperCase();
    
    if (lesson.course.category === 'Ebook' && lesson.course.price === 0) return true;

    let isLocked = false;
    if (courseNum === 1) {
        if (plan === 'FREE' && lesson.order >= 2) isLocked = true;
    } else if (courseNum === 2 || courseNum === 3) {
        if (plan === 'FREE') isLocked = true;
    } else if (courseNum >= 4) {
        if (plan === 'FREE' || plan === 'BASIC' || plan === 'BÁSICO' || plan === 'BASICO') isLocked = true;
    }

    if (isLocked) throw new Error("Forbidden: Tu plan de suscripción no permite el acceso a esta lección.");
    return true;
}

export async function submitQuizAttempt(lessonId: string, ignoredScore: number, answersArray: any[]) {
    const currentUser = await getServerUser();
    if (!currentUser) throw new Error("Unauthorized");
    
    const internalId = await getInternalId(currentUser.firebaseUid || currentUser.id);
    await verifyLessonAccess(internalId, lessonId);

    const quiz = await prisma.quiz.findUnique({
        where: { lessonId }
    });
    if (!quiz) throw new Error("Quiz not found");

    const attemptsCount = await prisma.quizAttempt.count({
        where: { userId: internalId, quizId: quiz.id }
    });
    if (attemptsCount >= 3) {
        throw new Error("Límite de intentos alcanzado. Has superado los 3 intentos permitidos.");
    }

    const questions = (quiz.questions as any[]) || [];
    let correctCount = 0;
    const validatedAnswers = answersArray.map((ans: any) => {
        const q = questions[ans.questionIndex];
        const isCorrect = q && q.correctIndex === ans.selectedIndex;
        if (isCorrect) correctCount++;
        return { ...ans, isCorrect };
    });

    const calculatedScore = Math.round((correctCount / Math.max(questions.length, 1)) * 10);
    const passed = calculatedScore >= 7;

    await prisma.quizAttempt.create({
        data: {
            userId: internalId,
            organizationId: currentUser.organizationId || null,
            quizId: quiz.id,
            score: calculatedScore,
            passed,
            answers: validatedAnswers
        }
    });

    if (passed) {
        await prisma.lessonProgress.upsert({
            where: { userId_lessonId: { userId: internalId, lessonId: lessonId } },
            update: { completed: true },
            create: { userId: internalId, lessonId: lessonId, completed: true }
        });
        revalidatePath('/', 'layout');
    }

    return { passed, score: calculatedScore, attemptsRemaining: 2 - attemptsCount };
}

export async function submitAssignment(lessonId: string, content: string) {
    const currentUser = await getServerUser();
    if (!currentUser) throw new Error("Unauthorized");

    const internalId = await getInternalId(currentUser.firebaseUid || currentUser.id);
    await verifyLessonAccess(internalId, lessonId);

    const assignment = await prisma.assignment.findUnique({
        where: { lessonId }
    });
    if (!assignment) throw new Error("Assignment not found");

    // Check if there is an active submission
    const existing = await prisma.assignmentSubmission.findFirst({
        where: { userId: internalId, assignmentId: assignment.id },
        orderBy: { createdAt: 'desc' }
    });

    if (existing && (existing.status === 'PENDING' || existing.status === 'REVIEWED' || existing.status === 'APPROVED')) {
        throw new Error("No puedes enviar esta tarea. Ya se encuentra enviada o revisada.");
    }

    await prisma.assignmentSubmission.create({
        data: {
            userId: internalId,
            organizationId: currentUser.organizationId || null,
            assignmentId: assignment.id,
            content,
            status: "PENDING"
        }
    });

    await prisma.lessonProgress.upsert({
        where: { userId_lessonId: { userId: internalId, lessonId: lessonId } },
        update: { completed: true },
        create: { userId: internalId, lessonId: lessonId, completed: true }
    });
    revalidatePath('/', 'layout');

    return { success: true };
}

export async function markLessonVideoWatched(lessonId: string) {
    const currentUser = await getServerUser();
    if (!currentUser) throw new Error("Unauthorized");
    
    const internalId = await getInternalId(currentUser.firebaseUid || currentUser.id);
    await verifyLessonAccess(internalId, lessonId);

    const lesson = await prisma.lesson.findUnique({
        where: { id: lessonId },
        include: { quiz: true, assignment: true }
    });
    
    if (!lesson) throw new Error("Lesson not found");

    if (!lesson.quiz && !lesson.assignment) {
        await prisma.lessonProgress.upsert({
            where: { userId_lessonId: { userId: internalId, lessonId: lessonId } },
            update: { completed: true },
            create: { userId: internalId, lessonId: lessonId, completed: true }
        });
        revalidatePath('/', 'layout');
    }

    return { success: true };
}
