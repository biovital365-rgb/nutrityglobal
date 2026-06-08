"use server";
import { supabase } from "@/lib/supabase";
import { prisma } from "@/lib/prisma";
import { createClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";
import { foodCatalog } from "@/lib/food-data";
import { micronutrientsData } from "@/lib/micronutrients-data";
import { sendWelcomeEmail, sendMenuApprovedEmail, sendMenuChangesRequestedEmail } from "./email-actions";

export async function getServerUser() {
    const supabaseClient = await createClient();
    const { data: { user } } = await supabaseClient.auth.getUser();
    if (!user) return null;
    return await prisma.user.findFirst({
        where: { 
            OR: [
                { firebaseUid: user.id }, 
                { email: user.email! }
            ] 
        },
        include: { organization: true }
    });
}

// Interfaces correspondientes a los modelos de Prisma
export interface FoodItem {
    id: string
    organizationId?: string
    name: string
    scientificName: string
    image: string
    category: string
    description: string
    metabolicBenefits: string[]
    nutrients: {
        protein: string
        fiber: string
        sugar: string
    }
    recipes: Array<{ title: string; image?: string; ingredients?: string[]; preparation?: string[]; instructions?: string[] }>
    deletedAt?: string
}

export interface Micronutrient {
    id: string
    organizationId?: string
    name: string
    symbol: string
    category: string
    function: string
    metabolicImpact: string
    sources: string[]
    deficiencySigns: string[]
    dailyDose: string
    image: string
    deletedAt?: string
}

export interface Course {
    id: string
    organizationId?: string
    title: string
    description: string
    thumbnail: string
    category: string
    price: number
    paypalUrl?: string
    currency?: string
    isPublished?: boolean
    lessons?: Lesson[]
    deletedAt?: string
}

export interface Lesson {
    id: string
    courseId: string
    title: string
    description: string
    videoUrl: string
    duration: string
    order: number
    isFree: boolean
}

const ADMIN_EMAILS = [
    'biovital.365@gmail.com',
    'biovital.360@gmail.com',
    'admin@nutrity.global',
    'apexdigital70@gmail.com'
];

// Cache para IDs de usuario para acelerar la carga (30s -> <2s)
const userIdCache: Record<string, string> = {};


    // Helper para obtener ID interno de Supabase desde Firebase UID o el propio ID interno
export async function getInternalId(idOrUid: string): Promise<string> {
        if (!idOrUid) return idOrUid;
        if (userIdCache[idOrUid]) return userIdCache[idOrUid];
        
        const { data, error } = await supabase
            .from('User')
            .select('id')
            .eq('firebaseUid', idOrUid)
            .maybeSingle();
            
        if (data) {
            userIdCache[idOrUid] = data.id;
            return data.id;
        }
        
        if (idOrUid.length === 36 && idOrUid.includes('-')) {
            return idOrUid;
        }
        
        return idOrUid;
}

    // Alimentos con Auto-Sincronización y Depuración Silenciosa usando Prisma
export async function getFoods() {
        const user = await getServerUser();
        const targetOrg = user?.role === 'ADMIN' ? null : (user?.organizationId || null);

        const whereClause: any = { deletedAt: null };
        if (targetOrg) {
            whereClause.OR = [
                { organizationId: null },
                { organizationId: targetOrg }
            ];
        }

        const data = await prisma.food.findMany({
            where: whereClause,
            orderBy: { name: 'asc' }
        });
        
        // 1. Auto-Sincronización si está vacío
        if (!data || data.length === 0) {
            console.log('Catalog empty, auto-syncing foods...');
            for (const food of foodCatalog) {
                await saveFood({ ...food, organizationId: targetOrg || undefined }).catch(() => {});
            }
            return getFoods();
        }

        // 2. Depuración Silenciosa de Duplicados (Sin necesidad de botón)
        if (data && data.length > 0) {
            const seen = new Set();
            const toDelete: string[] = [];
            const uniqueData: FoodItem[] = [];

            for (const food of data) {
                const key = `${food.name.toLowerCase().trim()}-${food.organizationId || 'global'}`;
                if (seen.has(key)) {
                    toDelete.push(food.id);
                } else {
                    seen.add(key);
                    uniqueData.push(food as unknown as FoodItem);
                }
            }

            if (toDelete.length > 0) {
                console.log(`Silent cleaning ${toDelete.length} duplicate foods...`);
                await prisma.food.deleteMany({ where: { id: { in: toDelete } } });
                console.log('Food cleanup completed successfully.');
                return uniqueData;
            }
        }

        return data as unknown as FoodItem[];
}

export async function saveFood(food: Partial<FoodItem>, organizationIdParam?: string) {
        const user = await getServerUser();
        // Validation: user must be logged in to create records
        if (!user) throw new Error("Unauthorized");
        const finalOrgId = user.role === 'ADMIN' ? (food.organizationId || organizationIdParam || null) : user.organizationId;

        const nameKey = (food.name || '').toLowerCase().trim()
            .normalize("NFD").replace(/[\u0300-\u036f]/g, "") // Remove accents
            .replace(/[^a-z0-9]/g, '-') // Non-alphanumeric to dash
            .replace(/-+/g, '-') // Collapse multiple dashes
            .replace(/^-|-$/g, ''); // Remove leading/trailing dashes
        const deterministicId = `food-${nameKey}`;
        const originalId = food.id; 

        const payload: any = {
            name: food.name || '',
            scientificName: food.scientificName || '',
            image: food.image || '',
            category: food.category || '',
            description: food.description || '',
            metabolicBenefits: food.metabolicBenefits || [],
            nutrients: food.nutrients || { protein: '', fiber: '', sugar: '' },
            recipes: food.recipes || [],
            id: deterministicId, 
            organizationId: finalOrgId
        };

        const data = await prisma.food.upsert({
            where: { id: deterministicId },
            update: payload,
            create: payload
        });

        // Si el ID cambió (cambio de nombre), eliminamos el registro antiguo
        if (originalId && originalId !== deterministicId && originalId.startsWith('food-')) {
            console.log(`Renaming food: deleting old ID ${originalId}`);
            // Check authorization before delete
            const oldFood = await prisma.food.findUnique({ where: { id: originalId } });
            if (oldFood && (user.role === 'ADMIN' || oldFood.organizationId === user.organizationId)) {
                await prisma.food.delete({ where: { id: originalId } });
            }
        }

        return { ...data, _previousId: (originalId !== deterministicId ? originalId : undefined) } as any;
}

    // Función para limpiar duplicados (mantiene el más reciente)
export async function deduplicateFoods() {
        const { data: allFoods } = await supabase.from('Food').select('id, name, organizationId, createdAt').order('createdAt', { ascending: false });
        if (!allFoods) return { count: 0 };

        const seen = new Set<string>();
        const toDelete: string[] = [];

        for (const food of allFoods) {
            const key = `${food.name.toLowerCase().trim()}-${food.organizationId || 'global'}`;
            
            if (seen.has(key)) {
                toDelete.push(food.id);
            } else {
                seen.add(key);
            }
        }

        if (toDelete.length > 0) {
            const { error } = await supabase.from('Food').delete().in('id', toDelete);
            if (error) console.error('Error deleting duplicate foods:', error);
        }

        return { count: toDelete.length };
}

export async function deleteFood(id: string) {
        const user = await getServerUser();
        if (!user) throw new Error("Unauthorized");
        
        const food = await prisma.food.findUnique({ where: { id } });
        if (!food) throw new Error("Not found");
        
        if (user.role !== 'ADMIN' && food.organizationId !== user.organizationId) {
            throw new Error("Forbidden");
        }

        await prisma.food.update({
            where: { id },
            data: { deletedAt: new Date().toISOString() }
        });
        return true
}

    // Micronutrientes con Auto-Sincronización y Depuración Silenciosa
export async function getMicronutrients() {
        const user = await getServerUser();
        const targetOrg = user?.role === 'ADMIN' ? null : (user?.organizationId || null);

        const whereClause: any = { deletedAt: null };
        if (targetOrg) {
            whereClause.OR = [
                { organizationId: null },
                { organizationId: targetOrg }
            ];
        }

        const data = await prisma.micronutrient.findMany({
            where: whereClause,
            orderBy: { name: 'asc' }
        });
        
        // 1. Auto-Sincronización
        if (!data || data.length === 0) {
            console.log('Catalog empty, auto-syncing micronutrients...');
            for (const micro of micronutrientsData) {
                await saveMicronutrient({ ...(micro as any), organizationId: targetOrg || undefined }).catch(() => {});
            }
            return getMicronutrients();
        }

        // 2. Depuración Silenciosa
        if (data && data.length > 0) {
            const seen = new Set();
            const toDelete: string[] = [];
            const uniqueData: Micronutrient[] = [];

            for (const micro of data) {
                const key = `${micro.name.toLowerCase().trim()}-${micro.organizationId || 'global'}`;
                if (seen.has(key)) {
                    toDelete.push(micro.id);
                } else {
                    seen.add(key);
                    uniqueData.push(micro as unknown as Micronutrient);
                }
            }

            if (toDelete.length > 0) {
                console.log(`Silent cleaning ${toDelete.length} duplicate micronutrients...`);
                await prisma.micronutrient.deleteMany({ where: { id: { in: toDelete } } });
                console.log('Micronutrient cleanup completed successfully.');
                return uniqueData;
            }
        }

        return data as unknown as Micronutrient[];
}

export async function saveMicronutrient(micro: Partial<Micronutrient>, organizationIdParam?: string) {
        const user = await getServerUser();
        if (!user) throw new Error("Unauthorized");
        const finalOrgId = user.role === 'ADMIN' ? (micro.organizationId || organizationIdParam || null) : user.organizationId;

        const nameKey = (micro.name || '').toLowerCase().trim()
            .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
            .replace(/[^a-z0-9]/g, '-')
            .replace(/-+/g, '-')
            .replace(/^-|-$/g, '');
        const deterministicId = `micro-${nameKey}`;
        const originalId = micro.id;

        const payload: any = {
            name: micro.name || '',
            symbol: micro.symbol || '',
            category: micro.category || '',
            function: (micro as any).function || '',
            metabolicImpact: micro.metabolicImpact || '',
            sources: micro.sources || [],
            deficiencySigns: micro.deficiencySigns || [],
            dailyDose: micro.dailyDose || '',
            image: micro.image || null,
            id: deterministicId, 
            organizationId: finalOrgId
        };

        const data = await prisma.micronutrient.upsert({
            where: { id: deterministicId },
            update: payload,
            create: payload
        });

        // Cleanup old ID if renamed
        if (originalId && originalId !== deterministicId && originalId.startsWith('micro-')) {
            const oldMicro = await prisma.micronutrient.findUnique({ where: { id: originalId } });
            if (oldMicro && (user.role === 'ADMIN' || oldMicro.organizationId === user.organizationId)) {
                await prisma.micronutrient.delete({ where: { id: originalId } });
            }
        }

        return { ...data, _previousId: (originalId !== deterministicId ? originalId : undefined) } as any;
}

export async function deleteMicronutrient(id: string) {
        const user = await getServerUser();
        if (!user) throw new Error("Unauthorized");
        
        const micro = await prisma.micronutrient.findUnique({ where: { id } });
        if (!micro) throw new Error("Not found");
        
        if (user.role !== 'ADMIN' && micro.organizationId !== user.organizationId) {
            throw new Error("Forbidden");
        }

        await prisma.micronutrient.update({
            where: { id },
            data: { deletedAt: new Date().toISOString() }
        });
        return true
}

export async function deduplicateMicronutrients() {
        const { data: allMicros } = await supabase.from('Micronutrient').select('id, name, organizationId, createdAt').order('createdAt', { ascending: false });
        if (!allMicros) return { count: 0 };

        const seen = new Set<string>();
        const toDelete: string[] = [];

        for (const micro of allMicros) {
            const key = `${micro.name.toLowerCase().trim()}-${micro.organizationId || 'global'}`;
            if (seen.has(key)) {
                toDelete.push(micro.id);
            } else {
                seen.add(key);
            }
        }

        if (toDelete.length > 0) {
            const { error } = await supabase.from('Micronutrient').delete().in('id', toDelete);
            if (error) console.error('Error deleting duplicate micros:', error);
        }

        return { count: toDelete.length };
}

export async function getUserProfile(firebaseUid?: string) {
        const currentUser = await getServerUser();
        if (!currentUser) return null;
        
        const targetUid = firebaseUid || currentUser.firebaseUid;
        if (currentUser.role !== 'ADMIN' && targetUid !== currentUser.firebaseUid) {
            return null;
        }

        return await prisma.user.findFirst({
            where: { firebaseUid: targetUid as string, deletedAt: null },
            include: { organization: true }
        });
}

export async function updateUserProfile(userId: string, profileData: any) {
        const currentUser = await getServerUser();
        if (!currentUser) throw new Error("Unauthorized");
        
        const internalId = await getInternalId(userId);
        if (currentUser.role !== 'ADMIN' && currentUser.id !== internalId) {
            throw new Error("Forbidden");
        }

        const { email, ...safeData } = profileData;
        return await prisma.user.update({
            where: { id: internalId },
            data: { ...safeData, updatedAt: new Date() },
            include: { organization: true }
        });
}

export async function getAllUsers(organizationIdParam?: string, includeDeleted = false) {
        const currentUser = await getServerUser();
        if (!currentUser || !['ADMIN', 'COACH'].includes(currentUser.role)) throw new Error("Forbidden");

        // Si es Elite/Coach y tiene organizationId propio, forzamos que solo vea los suyos.
        // Si no tiene organizationId (SuperAdmin), puede ver todo o filtrar por el parámetro.
        const targetOrgId = currentUser.organizationId || organizationIdParam || null;
        
        const users = await prisma.user.findMany({
            where: {
                deletedAt: includeDeleted ? undefined : null,
                ...(targetOrgId ? { organizationId: targetOrgId } : {})
            },
            include: {
                organization: true,
                evaluations: { select: { results: true }, orderBy: { createdAt: 'desc' }, take: 1 }
            },
            orderBy: { name: 'asc' }
        });

        return users.map(u => ({
            ...u,
            metabolicResults: u.evaluations?.[0]?.results || null
        }));
}

export async function updateUserStatus(userId: string, status: 'ACTIVE' | 'BLOCKED' | 'OBSERVED') {
        const currentUser = await getServerUser();
        if (!currentUser || currentUser.role !== 'ADMIN') throw new Error("Forbidden");

        return await prisma.user.update({
            where: { id: userId },
            data: { status: status as any, updatedAt: new Date() }
        });
}

export async function deleteUser(userId: string) {
        const currentUser = await getServerUser();
        if (!currentUser || currentUser.role !== 'ADMIN') throw new Error("Forbidden");

        await prisma.user.update({
            where: { id: userId },
            data: { deletedAt: new Date().toISOString() }
        });
        
        return true
}

export async function syncUserProfile(firebaseUser: any, name?: string, organizationId?: string) {
        try {
            const email = (firebaseUser.email || '').toLowerCase().trim();
            const isAdminEmail = ADMIN_EMAILS.includes(email);

            let profile = await prisma.user.findFirst({
                where: { firebaseUid: firebaseUser.uid, deletedAt: null },
                include: { organization: true }
            });

            if (!profile) {
                const emailProfile = await prisma.user.findFirst({
                    where: { email: email, deletedAt: null },
                    include: { organization: true }
                });

                if (emailProfile) {
                    profile = await prisma.user.update({
                        where: { id: emailProfile.id },
                        data: {
                            firebaseUid: firebaseUser.uid,
                            role: isAdminEmail ? 'ADMIN' : (emailProfile.role || 'USER'),
                            plan: isAdminEmail ? 'ELITE' : (emailProfile.plan || 'FREE'),
                            updatedAt: new Date()
                        },
                        include: { organization: true }
                    });
                } else {
                    try {
                        profile = await prisma.user.create({
                            data: {
                                id: crypto.randomUUID(),
                                firebaseUid: firebaseUser.uid,
                                email: email,
                                name: name || firebaseUser.displayName || 'Nuevo Usuario',
                                role: isAdminEmail ? 'ADMIN' : 'USER',
                                plan: isAdminEmail ? 'ELITE' : 'FREE',
                                organizationId: organizationId || null,
                                updatedAt: new Date()
                            },
                            include: { organization: true }
                        });
                        
                        // Disparar correo de bienvenida asincrónicamente sin bloquear el SSR
                        sendWelcomeEmail(email, profile.name || 'Amig@').catch(err => console.error('Failed to send welcome email', err));
                    } catch (e: any) {
                        if (e.code === 'P2002') {
                            // Race condition handled: another request already created the user
                            profile = await prisma.user.findFirst({
                                where: { firebaseUid: firebaseUser.uid },
                                include: { organization: true }
                            });
                        } else {
                            throw e;
                        }
                    }
                }
            } else if (isAdminEmail && (profile.role !== 'ADMIN' || profile.plan !== 'ELITE')) {
                profile = await prisma.user.update({
                    where: { id: profile.id },
                    data: { role: 'ADMIN', plan: 'ELITE' },
                    include: { organization: true }
                });
            }

            return profile;
        } catch (err) {
            console.error('CRITICAL: syncUserProfile failed:', err);
            return null;
        }
}

    // Evaluaciones
export async function saveEvaluation(userId: string, organizationId: string | undefined, data: any, results: any) {
        const currentUser = await getServerUser();
        if (!currentUser) throw new Error("Unauthorized");
        
        const internalId = await getInternalId(userId);
        if (currentUser.role !== 'ADMIN' && currentUser.id !== internalId) {
            throw new Error("Forbidden");
        }
        
        const targetOrgId = currentUser.role === 'ADMIN' ? (organizationId || null) : currentUser.organizationId;

        const existingEval = await prisma.evaluation.findFirst({
            where: { userId: internalId }
        });

        if (existingEval) {
            return await prisma.evaluation.update({
                where: { id: existingEval.id },
                data: { data, results, organizationId: targetOrgId }
            });
        } else {
            return await prisma.evaluation.create({
                data: {
                    userId: internalId,
                    organizationId: targetOrgId,
                    data,
                    results
                }
            });
        }
}


// ── Diagnóstico NMG: Persistencia del Triaje Holístico ──────────────────────
export async function saveBiologicalDiagnosis(
    userId: string,
    organizationId: string | undefined,
    /** Campos del triaje (input del usuario) */
    triaje: {
        mainSymptom: string;
        affectedSystem: string;
        symptomDuration: string;
        emotionalContext: string;
    },
    /** nmgDiagnosis generado por la IA */
    nmgDiagnosis: {
        conflict: string;
        organ: string;
        phase: string;
        holisticApproach: Array<{ discipline: string; recommendation: string }>;
    }
) {
    const currentUser = await getServerUser();
    if (!currentUser) throw new Error("Unauthorized");
    
    const internalId = await getInternalId(userId);
    if (currentUser.role !== 'ADMIN' && currentUser.id !== internalId) {
        throw new Error("Forbidden");
    }
    
    const targetOrgId = currentUser.role === 'ADMIN' ? (organizationId || null) : currentUser.organizationId;

    const existing = await prisma.biologicalDiagnosis.findFirst({
        where: { userId: internalId }
    });

    const payload = {
        userId: internalId,
        organizationId: targetOrgId,
        mainSymptom: triaje.mainSymptom,
        affectedSystem: triaje.affectedSystem,
        symptomDuration: triaje.symptomDuration,
        emotionalContext: triaje.emotionalContext,
        nmgConflict: nmgDiagnosis.conflict,
        nmgOrgan: nmgDiagnosis.organ,
        phase: nmgDiagnosis.phase,
        holisticApproach: nmgDiagnosis.holisticApproach as any,
        updatedAt: new Date()
    };

    let data;
    let error;
    try {
        if (existing) {
            data = await prisma.biologicalDiagnosis.update({
                where: { id: existing.id },
                data: payload
            });
        } else {
            data = await prisma.biologicalDiagnosis.create({
                data: payload
            });
        }
    } catch(e: any) {
        error = e;
    }

    if (error) {
        // Log estructurado para auditoría — no bloquea el flujo principal
        console.error('[NMG] saveBiologicalDiagnosis error:', {
            userId: internalId,
            error: error.message,
            step: 'upsert BiologicalDiagnosis',
        });
        throw error;
    }
    return data;
}

export async function getLatestBiologicalDiagnosis(userId: string) {
    const internalId = await getInternalId(userId);
    const { data, error } = await supabase
        .from('BiologicalDiagnosis')
        .select('*')
        .eq('userId', internalId)
        .order('updatedAt', { ascending: false })
        .limit(1)
        .maybeSingle();

    if (error) {
        console.error('[NMG] getLatestBiologicalDiagnosis error:', error.message);
        return null;
    }
    return data;
}

export async function getLatestEvaluation(userId: string, organizationId?: string) {
    const internalId = await getInternalId(userId);
    const { data, error } = await supabase.from('Evaluation')
        .select('*')
        .eq('userId', internalId)
        .order('timestamp', { ascending: false })
        .limit(1)
        .maybeSingle();

        if (error) throw error
        return data
}

    // Mediciones
export async function getMeasurements(userId: string, organizationId?: string) {
        const internalId = await getInternalId(userId);

        let query = supabase.from('Measurement').select('*').eq('userId', internalId)
        
        if (organizationId) {
            query = query.eq('organizationId', organizationId)
        }

        const { data, error } = await query.order('timestamp', { ascending: false })

        if (error) throw error
        return data
}

export async function saveMeasurement(userId: string, organizationId: string | undefined, measurement: any) {
        const internalId = await getInternalId(userId);

        const id = measurement.id && measurement.id.length > 20 ? measurement.id : crypto.randomUUID();
        const { data, error } = await supabase
            .from('Measurement')
            .upsert({
                ...measurement,
                id,
                userId: internalId,
                organizationId: organizationId || null
            }, { onConflict: 'id' })
            .select()
            .single()

        if (error) {
            console.error('saveMeasurement error:', error);
            throw error;
        }
        return data
}

    // --- Módulo de Academia (SaaS) ---
export async function getCourses(organizationId?: string, includeDeleted = false) {
        let query = supabase.from('Course').select('*')
        if (!includeDeleted) query = query.is('deletedAt', null)
        
        if (organizationId) {
            query = query.or(`organizationId.is.null,organizationId.eq.${organizationId}`)
        }
        // Sin filtro: devuelve todos los cursos disponibles

        const { data, error } = await query.order('createdAt', { ascending: false })

        if (error) {
            console.error('getCourses error:', error)
            return []
        }
        return (data || []) as Course[]
}

export async function getCourseWithLessons(courseId: string) {
        const { data, error } = await supabase
            .from('Course')
            .select('*, lessons:Lesson(*)')
            .eq('id', courseId)
            .single()

        if (error) throw error
        return data as Course
}

export async function saveCourse(course: Partial<Course>, organizationId?: string) {
        const { lessons, ...courseData } = course;
        
        const payload = {
            id: courseData.id && courseData.id.length > 20 ? courseData.id : crypto.randomUUID(),
            organizationId: courseData.organizationId || organizationId || null,
            title: courseData.title || '',
            description: courseData.description || '',
            thumbnail: courseData.thumbnail || '',
            category: courseData.category || 'Bienestar',
            price: Number(courseData.price) || 0,
            paypalUrl: courseData.paypalUrl || null,
            currency: courseData.currency || 'USD',
            isPublished: courseData.isPublished !== undefined ? courseData.isPublished : true,
            updatedAt: new Date().toISOString(),
        };

        const { data, error } = await supabase
            .from('Course')
            .upsert(payload)
            .select()
            .single()

        if (error) {
            console.error('saveCourse error:', error);
            throw error;
        }
        
        // Handle lessons if they exist
        if (lessons && Array.isArray(lessons)) {
            // Upsert all lessons with the courseId
            const lessonsPayload = lessons.map((lesson, idx) => ({
                id: lesson.id && lesson.id.length > 20 ? lesson.id : crypto.randomUUID(),
                courseId: payload.id,
                title: lesson.title || `Lección ${idx + 1}`,
                description: lesson.description || null,
                videoUrl: lesson.videoUrl || null,
                duration: lesson.duration || null,
                order: lesson.order !== undefined ? lesson.order : idx,
                isFree: lesson.isFree || false
            }));
            
            if (lessonsPayload.length > 0) {
                const { error: lessonsError } = await supabase
                    .from('Lesson')
                    .upsert(lessonsPayload);
                    
                if (lessonsError) {
                    console.error('saveCourse lessons error:', lessonsError);
                    // Non-fatal, we still saved the course
                }
            }
        }
        
        return data as Course
}

export async function deleteCourse(id: string) {
        const { error } = await supabase
            .from('Course')
            .update({ deletedAt: new Date().toISOString() })
            .eq('id', id)

        if (error) throw error
        return true
}

export async function toggleLessonProgress(userId: string, lessonId: string, completed: boolean) {
        const { data: existing } = await supabase
            .from('LessonProgress')
            .select('id')
            .eq('userId', userId)
            .eq('lessonId', lessonId)
            .maybeSingle();

        const progressId = existing?.id || crypto.randomUUID();

        const { error } = await supabase
            .from('LessonProgress')
            .upsert({
                id: progressId,
                userId,
                lessonId,
                completed,
                updatedAt: new Date().toISOString()
            }, { onConflict: 'id' })

        if (error) throw error
        return true
}

export async function getLessonsProgress(userId: string) {
        const { data, error } = await supabase
            .from('LessonProgress')
            .select('lessonId, completed')
            .eq('userId', userId)

        if (error) throw error
        const progress: Record<string, boolean> = {};
        data.forEach(item => {
            progress[item.lessonId] = item.completed;
        });
        return progress;
}

    // Citas (Nuevo soporte multi-tenant en Supabase)
export async function getAppointments(userId: string, organizationId?: string, includeDeleted = false) {
        const internalId = await getInternalId(userId);
        let query = supabase.from('Appointment').select('*').eq('userId', internalId)
        if (!includeDeleted) query = query.is('deletedAt', null)
        
        if (organizationId) {
            query = query.eq('organizationId', organizationId)
        }
        const { data, error } = await query.order('date', { ascending: true })
        if (error) throw error
        return data
}

export async function saveAppointment(userId: string, organizationId: string | undefined, appointment: any) {
        const internalId = await getInternalId(userId);

        const id = appointment.id && appointment.id.length > 20 ? appointment.id : crypto.randomUUID();
        const { data, error } = await supabase
            .from('Appointment')
            .upsert({
                ...appointment,
                id,
                userId: internalId,
                organizationId: organizationId || null
            }, { onConflict: 'id' })
            .select()
            .single()
        if (error) throw error
        return data
}
export async function getAllAppointments(organizationId?: string, includeDeleted = false) {
        let query = supabase.from('Appointment').select('*, user:User(name, email)')
        if (!includeDeleted) query = query.is('deletedAt', null)
        
        if (organizationId) {
            query = query.eq('organizationId', organizationId)
        }
        const { data, error } = await query.order('date', { ascending: false })
        if (error) throw error
        return data
}

export async function updateAppointment(id: string, updates: any) {
        const { data, error } = await supabase
            .from('Appointment')
            .update({ ...updates, updatedAt: new Date().toISOString() })
            .eq('id', id)
            .select()
            .single()
        if (error) throw error
        return data
}

export async function deleteAppointment(id: string) {
        const { error } = await supabase
            .from('Appointment')
            .update({ deletedAt: new Date().toISOString() })
            .eq('id', id)
        if (error) throw error
        return true
}

    // --- Módulo de Reportes PDF ---
export async function logPDFReport(userId: string, organizationId: string | undefined, status: 'GENERATED' | 'DOWNLOADED' | 'ERROR', errorMessage?: string) {
        const id = crypto.randomUUID();
        const { data, error } = await supabase
            .from('PDFReportLog')
            .insert({
                id,
                userId,
                organizationId: organizationId || null,
                status,
                errorMessage,
                timestamp: new Date().toISOString()
            })
            .select()
            .single()

        if (error) {
            console.error('logPDFReport error:', error);
            // No bloqueamos el flujo principal si falla el log
        }
        return data
}

export async function getPDFReports(organizationId?: string) {
        let query = supabase.from('PDFReportLog').select('*, user:User(name, email)')
        if (organizationId) {
            query = query.eq('organizationId', organizationId)
        }
        const { data, error } = await query.order('createdAt', { ascending: false })
        if (error) throw error
        return data
}

    // Sincronización Forzada de Catálogos (Para Admin)
export async function forceSyncCatalog(type: 'foods' | 'micros', organizationId?: string) {
        if (type === 'foods') {
            const { foodCatalog } = await import('../lib/food-data');
            for (const food of foodCatalog) {
                await saveFood({ ...food, organizationId }, organizationId).catch(e => console.error(`Sync error ${food.name}:`, e));
            }
        } else {
            const { micronutrientsData } = await import('../lib/micronutrients-data');
            for (const micro of micronutrientsData) {
                await saveMicronutrient({ ...(micro as any), organizationId }, organizationId).catch(e => console.error(`Sync error ${micro.name}:`, e));
            }
        }
        return true;
}

    // ─── Módulo de Menú Semanal con Flujo de Aprobación ─────────────────────────

    /**
     * Guarda los 7 días de un menú semanal con status PENDING.
     * Llamado por el Admin después de generar con IA.
     * weekStart: lunes de la semana en formato YYYY-MM-DD
     * days: objeto { lunes: {breakfast, lunch, dinner, snack, metabolicGoal}, ... }
     */
export async function saveWeeklyMenu(userId: string, weekStart: string, phase: string, days: Record<string, any>) {
        const internalId = await getInternalId(userId);
        const dayNames = ['lunes', 'martes', 'miercoles', 'jueves', 'viernes', 'sabado', 'domingo'];
        const offsets  = [0, 1, 2, 3, 4, 5, 6];
        const base = new Date(weekStart + 'T12:00:00Z');

        const rows = dayNames.map((dayName, i) => {
            const d = new Date(base);
            d.setUTCDate(base.getUTCDate() + offsets[i]);
            const date = d.toISOString().split('T')[0];
            const dayData = days[dayName] || {};
            return {
                id: crypto.randomUUID(),
                userId: internalId,
                date,
                weekStart,
                phase,
                status: 'PENDING',
                menuData: {
                    breakfast:    dayData.breakfast    || '',
                    lunch:        dayData.lunch        || '',
                    dinner:       dayData.dinner       || '',
                    snack:        dayData.snack        || '',
                },
                metabolicGoal: dayData.metabolicGoal || '',
                updatedAt: new Date().toISOString(),
            };
        });

        // Eliminar semana previa para este usuario si existe (re-generación)
        await supabase
            .from('DailyMenu')
            .delete()
            .eq('userId', internalId)
            .eq('weekStart', weekStart);

        const { data, error } = await supabase
            .from('DailyMenu')
            .insert(rows)
            .select();

        if (error) throw error;
        return data;
}

    /**
     * Retorna los 7 registros de una semana específica para un usuario.
     */
export async function getWeeklyMenu(userId: string, weekStart: string) {
        const internalId = await getInternalId(userId);
        const { data, error } = await supabase
            .from('DailyMenu')
            .select('*')
            .eq('userId', internalId)
            .eq('weekStart', weekStart)
            .order('date', { ascending: true });

        if (error) throw error;
        return data || [];
}

    /**
     * Retorna el menú semanal APROBADO más reciente del usuario.
     * El usuario ve este en su tab "Menú".
     */
export async function getApprovedMenu(userId: string) {
        const internalId = await getInternalId(userId);
        const { data, error } = await supabase
            .from('DailyMenu')
            .select('*')
            .eq('userId', internalId)
            .eq('status', 'APPROVED')
            .order('weekStart', { ascending: false })
            .limit(7);

        if (error) throw error;
        return data || [];
}

    /**
     * Retorna el menú PENDIENTE más reciente (si existe) para un usuario.
     */
export async function getPendingMenu(userId: string) {
        const internalId = await getInternalId(userId);
        const { data, error } = await supabase
            .from('DailyMenu')
            .select('*')
            .eq('userId', internalId)
            .eq('status', 'PENDING')
            .order('weekStart', { ascending: false })
            .limit(7);

        if (error) throw error;
        return data || [];
}

    /**
     * Admin aprueba todos los días de una semana.
     */
export async function approveWeeklyMenu(userId: string, weekStart: string, adminEmail: string, notes?: string) {
        const internalId = await getInternalId(userId);
        const { data, error } = await supabase
            .from('DailyMenu')
            .update({
                status:     'APPROVED',
                approvedAt: new Date().toISOString(),
                approvedBy: adminEmail,
                adminNotes: notes || null,
                updatedAt:  new Date().toISOString(),
            })
            .eq('userId', internalId)
            .eq('weekStart', weekStart)
            .select();

        if (error) throw error;

        // Disparar email asíncrono
        sendMenuApprovedEmail(internalId).catch(err => console.error('Failed to send approved email', err));

        return data;
}

    /**
     * Admin rechaza todos los días de una semana con notas.
     */
export async function rejectWeeklyMenu(userId: string, weekStart: string, adminEmail: string, notes: string) {
        const internalId = await getInternalId(userId);
        const { data, error } = await supabase
            .from('DailyMenu')
            .update({
                status:     'REJECTED',
                approvedBy: adminEmail,
                adminNotes: notes,
                updatedAt:  new Date().toISOString(),
            })
            .eq('userId', internalId)
            .eq('weekStart', weekStart)
            .select();

        if (error) throw error;
        return data;
}

    /**
     * Admin edita un día específico del menú.
     */
export async function updateDayMenu(recordId: string, menuData: any, metabolicGoal: string) {
        const { data, error } = await supabase
            .from('DailyMenu')
            .update({
                menuData,
                metabolicGoal,
                updatedAt: new Date().toISOString(),
            })
            .eq('id', recordId)
            .select()
            .single();

        if (error) throw error;
        return data;
}

    /**
     * Admin: obtiene todos los usuarios con su último estado de menú.
     * Retorna un array de { userId, userName, userEmail, weekStart, status, phase }
     */
export async function getAllMenusStatus(organizationId?: string) {
        let query = supabase
            .from('DailyMenu')
            .select('userId, weekStart, status, phase, approvedAt, approvedBy, user:User(id, name, email)')
            .order('weekStart', { ascending: false });

        const { data, error } = await query;
        if (error) throw error;

        // Agrupar: un objeto por userId con el weekStart más reciente
        const map: Record<string, any> = {};
        for (const row of (data || [])) {
            const uid = (row as any).userId;
            if (!map[uid]) {
                map[uid] = {
                    userId:      uid,
                    userName:    (row as any).user?.name  || 'Sin nombre',
                    userEmail:   (row as any).user?.email || '',
                    weekStart:   (row as any).weekStart,
                    status:      (row as any).status,
                    phase:       (row as any).phase,
                    approvedAt:  (row as any).approvedAt,
                    approvedBy:  (row as any).approvedBy,
                };
            }
        }
        return Object.values(map);
}

    // ─── Compatibilidad con llamadas anteriores (no se rompe nada) ────────────
export async function saveDailyMenu(params: { userId: string; date: string; menuData: any; metabolicGoal?: string } | string, date?: string, menuData?: any, metabolicGoal?: string) {
        // Soporte para llamada legacy: saveDailyMenu(userId, date, menuData)
        let userId_: string, date_: string, menuData_: any, metabolicGoal_: string | undefined;
        if (typeof params === 'object' && 'userId' in params) {
            userId_ = params.userId; date_ = params.date; menuData_ = params.menuData; metabolicGoal_ = params.metabolicGoal;
        } else {
            userId_ = params as string; date_ = date!; menuData_ = menuData; metabolicGoal_ = metabolicGoal;
        }
        const internalId = await getInternalId(userId_);
        const { data, error } = await supabase
            .from('DailyMenu')
            .upsert({
                id: crypto.randomUUID(),
                userId: internalId,
                date: date_,
                menuData: menuData_,
                metabolicGoal: metabolicGoal_,
                updatedAt: new Date().toISOString()
            }, { onConflict: 'userId,date' })
            .select()
            .single();
        if (error) throw error;
        return data;
}

export async function getDailyMenu(userId: string, date: string) {
        const internalId = await getInternalId(userId);
        const { data, error } = await supabase
            .from('DailyMenu')
            .select('*')
            .eq('userId', internalId)
            .eq('date', date)
            .maybeSingle();

        if (error) throw error;
        return data;
}

export async function getDailyMenus(userId: string) {
        const internalId = await getInternalId(userId);
        const { data, error } = await supabase
            .from('DailyMenu')
            .select('*')
            .eq('userId', internalId)
            .order('date', { ascending: false });

        if (error) throw error;
        return data;
}

    // Recovery methods
export async function restoreFood(id: string) {
        const { data, error } = await supabase.from('Food').update({ deletedAt: null }).eq('id', id).select().single();
        if (error) throw error;
        return data;
}

export async function restoreMicronutrient(id: string) {
        const { data, error } = await supabase.from('Micronutrient').update({ deletedAt: null }).eq('id', id).select().single();
        if (error) throw error;
        return data;
}

export async function restoreCourse(id: string) {
        const { data, error } = await supabase.from('Course').update({ deletedAt: null }).eq('id', id).select().single();
        if (error) throw error;
        return data;
}

export async function restoreUser(id: string) {
        const { data, error } = await supabase.from('User').update({ deletedAt: null }).eq('id', id).select().single();
        if (error) throw error;
        return data;
}

export async function restoreAppointment(id: string) {
        const { data, error } = await supabase.from('Appointment').update({ deletedAt: null }).eq('id', id).select().single();
        if (error) throw error;
        return data;
    }

// --- BLOG POSTS ---
export async function getPosts(organizationId?: string, onlyPublished: boolean = true) {
  let query = supabase.from('Post').select('*');
  if (organizationId) query = query.eq('organizationId', organizationId);
  if (onlyPublished) query = query.eq('isPublished', true);
  const { data, error } = await query.order('createdAt', { ascending: false });
  if (error) { console.error('Error fetching posts:', error); return []; }
  return data;
}

export async function getPostBySlug(slug: string) {
  const { data, error } = await supabase.from('Post').select('*').eq('slug', slug).single();
  if (error) { console.error('Error fetching post:', error); return null; }
  return data;
}

export async function savePost(post: any, organizationId?: string) {
  const id = post.id && post.id.length > 20 ? post.id : crypto.randomUUID();
  const isUpdate = !!post.id;
  const { data, error } = await supabase.from('Post').upsert({ ...post, id, organizationId: organizationId || null, updatedAt: new Date().toISOString() }).select().single();
  if (error) { console.error('Error saving post:', error); throw new Error(error.message); }
  revalidatePath('/', 'layout');
  return data;
}

export async function deletePost(id: string) {
  const { error } = await supabase.from('Post').delete().eq('id', id);
  if (error) { console.error('Error deleting post:', error); throw new Error(error.message); }
  revalidatePath('/', 'layout');
  return true;
}

// --- LANDING PAGE CMS ---
export async function getLandingConfig(organizationId?: string) {
  const { data, error } = await supabase
    .from('Post')
    .select('content')
    .eq('slug', 'landing-page-config')
    .maybeSingle();

  if (error) {
    console.error('Error fetching landing config:', error);
    return null;
  }
  
  if (data?.content) {
    try {
      return JSON.parse(data.content);
    } catch (e) {
      console.error('Error parsing landing config JSON', e);
      return null;
    }
  }
  return null;
}

export async function saveLandingConfig(configData: any, organizationId?: string) {
  const stringifiedContent = JSON.stringify(configData);
  
  // First see if it exists
  const { data: existing } = await supabase
    .from('Post')
    .select('id')
    .eq('slug', 'landing-page-config')
    .maybeSingle();

  const id = existing?.id || crypto.randomUUID();

  const payload = {
    id,
    title: 'Configuración de la Landing Page',
    slug: 'landing-page-config',
    content: stringifiedContent,
    category: 'SYSTEM',
    isPublished: true,
    organizationId: organizationId || null,
    updatedAt: new Date().toISOString()
  };

  const { data, error } = await supabase
    .from('Post')
    .upsert(payload, { onConflict: 'id' })
    .select()
    .single();

  if (error) {
    console.error('Error saving landing config:', error);
    throw new Error(error.message);
  }
  revalidatePath('/', 'layout');
  return data;
}

export async function requestMenuChanges(userId: string, weekStart: string, notes: string) {
    const currentUser = await getServerUser();
    if (!currentUser || currentUser.id !== userId) throw new Error("Forbidden");

    // Buscamos el menú de la semana
    const { data: menu, error: menuErr } = await supabase
        .from('DailyMenu')
        .select('*')
        .eq('userId', userId)
        .eq('weekStart', weekStart)
        .limit(1)
        .single();

    if (menuErr || !menu) {
        throw new Error("Menú no encontrado para esa semana");
    }

    // Actualizamos el estado a CHANGES_REQUESTED y añadimos las notas
    const { error: updateErr } = await supabase
        .from('DailyMenu')
        .update({
            status: 'CHANGES_REQUESTED',
            adminNotes: notes, 
            updatedAt: new Date().toISOString(),
        })
        .eq('id', menu.id);

    if (updateErr) {
        throw new Error("Error actualizando el estado del menú");
    }

    // Notificamos al coach/admin
    await sendMenuChangesRequestedEmail(userId, notes);

    revalidatePath('/', 'layout');
    return true;
}
