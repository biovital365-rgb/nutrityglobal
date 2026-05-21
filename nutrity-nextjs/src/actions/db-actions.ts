"use server";
import { supabase } from "@/lib/supabase";


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
    recipes: Array<{ title: string; instructions: string[] }>
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
        if (idOrUid.length === 36 && idOrUid.includes('-')) return idOrUid;
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
        return idOrUid;
}

    // Alimentos con Auto-Sincronización y Depuración Silenciosa (Solución Definitiva)
export async function getFoods(organizationId?: string) {
        let query = supabase.from('Food').select('*').is('deletedAt', null)
        if (organizationId) {
            query = query.or(`organizationId.is.null,organizationId.eq.${organizationId}`)
        }

        const { data, error } = await query.order('name', { ascending: true })
        
        // 1. Auto-Sincronización si está vacío
        if (!error && (!data || data.length === 0)) {
            console.log('Catalog empty, auto-syncing foods...');
            const { foodCatalog } = await import('../lib/food-data');
            for (const food of foodCatalog) {
                await saveFood({ ...food, organizationId }, organizationId).catch(() => {});
            }
            return getFoods(organizationId);
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
                    uniqueData.push(food as FoodItem);
                }
            }

            if (toDelete.length > 0) {
                console.log(`Silent cleaning ${toDelete.length} duplicate foods...`);
                supabase.from('Food').delete().in('id', toDelete).then(() => {
                    console.log('Food cleanup completed successfully.');
                });
                return uniqueData;
            }
        }

        if (error) {
            console.error('getFoods error:', error)
            return []
        }
        return (data || []) as FoodItem[]
}

export async function saveFood(food: Partial<FoodItem>, organizationId?: string) {
        const nameKey = (food.name || '').toLowerCase().trim()
            .normalize("NFD").replace(/[\u0300-\u036f]/g, "") // Remove accents
            .replace(/[^a-z0-9]/g, '-') // Non-alphanumeric to dash
            .replace(/-+/g, '-') // Collapse multiple dashes
            .replace(/^-|-$/g, ''); // Remove leading/trailing dashes
        const deterministicId = `food-${nameKey}`;
        const originalId = food.id; // Guardamos el ID original para detectar cambios de nombre

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
        };

        const finalOrgId = food.organizationId || organizationId;
        if (finalOrgId) payload.organizationId = finalOrgId;

        const { data, error } = await supabase
            .from('Food')
            .upsert(payload, { onConflict: 'id' })
            .select()
            .single()

        if (error) throw error;

        // Si el ID cambió (cambio de nombre), eliminamos el registro antiguo
        if (originalId && originalId !== deterministicId && originalId.startsWith('food-')) {
            console.log(`Renaming food: deleting old ID ${originalId}`);
            await supabase.from('Food').delete().eq('id', originalId);
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
        const { error } = await supabase
            .from('Food')
            .update({ deletedAt: new Date().toISOString() })
            .eq('id', id)
        if (error) throw error
        return true
}

    // Micronutrientes con Auto-Sincronización y Depuración Silenciosa
export async function getMicronutrients(organizationId?: string) {
        let query = supabase.from('Micronutrient').select('*').is('deletedAt', null)
        if (organizationId) {
            query = query.or(`organizationId.is.null,organizationId.eq.${organizationId}`)
        }

        const { data, error } = await query.order('name', { ascending: true })
        
        // 1. Auto-Sincronización
        if (!error && (!data || data.length === 0)) {
            console.log('Catalog empty, auto-syncing micronutrients...');
            const { micronutrientsData } = await import('../lib/micronutrients-data');
            for (const micro of micronutrientsData) {
                await saveMicronutrient({ ...(micro as any), organizationId }, organizationId).catch(() => {});
            }
            return getMicronutrients(organizationId);
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
                    uniqueData.push(micro as Micronutrient);
                }
            }

            if (toDelete.length > 0) {
                console.log(`Silent cleaning ${toDelete.length} duplicate micronutrients...`);
                supabase.from('Micronutrient').delete().in('id', toDelete).then(() => {
                    console.log('Micronutrient cleanup completed successfully.');
                });
                return uniqueData;
            }
        }

        if (error) {
            console.error('getMicronutrients error:', error)
            return []
        }
        return (data || []) as Micronutrient[]
}

export async function saveMicronutrient(micro: Partial<Micronutrient>, organizationId?: string) {
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
        };

        const finalOrgId = micro.organizationId || organizationId;
        if (finalOrgId) payload.organizationId = finalOrgId;

        const { data, error } = await supabase
            .from('Micronutrient')
            .upsert(payload, { onConflict: 'id' })
            .select()
            .single()

        if (error) throw error;

        // Cleanup old ID if renamed
        if (originalId && originalId !== deterministicId && originalId.startsWith('micro-')) {
            await supabase.from('Micronutrient').delete().eq('id', originalId);
        }

        return { ...data, _previousId: (originalId !== deterministicId ? originalId : undefined) } as any;
}

export async function deleteMicronutrient(id: string) {
        const { error } = await supabase
            .from('Micronutrient')
            .update({ deletedAt: new Date().toISOString() })
            .eq('id', id)
        if (error) throw error
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

    // Perfil de Usuario (SaaS)
export async function getUserProfile(firebaseUid: string) {
        const { data, error } = await supabase
            .from('User')
            .select('*, organization:Organization(*)')
            .eq('firebaseUid', firebaseUid)
            .is('deletedAt', null)
            .maybeSingle()

        if (error) {
            console.error('Error fetching user profile:', error)
            return null
        }
        return data
}

export async function updateUserProfile(userId: string, profileData: Partial<any>) {
        const { email, ...safeData } = profileData;
        const { data, error } = await supabase
            .from('User')
            .update(safeData)
            .eq('id', userId)
            .select('*, organization:Organization(*)')
            .single()

        if (error) throw error
        return data
}

    // Admin: Gestión de Usuarios
export async function getAllUsers(organizationId?: string, includeDeleted = false) {
        let query = supabase.from('User').select('*, organization:Organization(*), evaluations:Evaluation(results)')
        if (!includeDeleted) query = query.is('deletedAt', null)
        
        if (organizationId) {
            query = query.eq('organizationId', organizationId)
        }
        const { data, error } = await query.order('name', { ascending: true })
        if (error) throw error
        
        // Mapear para facilitar acceso al último resultado
        return (data || []).map(u => ({
            ...u,
            metabolicResults: (u as any).evaluations?.[0]?.results || null
        }));
}

export async function updateUserStatus(userId: string, status: 'ACTIVE' | 'BLOCKED' | 'OBSERVED') {
        const { data, error } = await supabase
            .from('User')
            .update({ status, updatedAt: new Date().toISOString() })
            .eq('id', userId)
            .select()
            .single()
        if (error) throw error
        return data
}

export async function deleteUser(userId: string) {
        // Eliminar registros relacionados (Cascade Manual) para evitar violaciones de llave foránea
        await supabase.from('Evaluation').delete().eq('userId', userId);
        await supabase.from('Measurement').delete().eq('userId', userId);
        await supabase.from('Appointment').delete().eq('userId', userId);
        await supabase.from('LessonProgress').delete().eq('userId', userId);
        await supabase.from('Enrollment').delete().eq('userId', userId);
        
        const { error } = await supabase
            .from('User')
            .update({ deletedAt: new Date().toISOString() })
            .eq('id', userId)
            
        if (error) throw error
        return true
}

export async function syncUserProfile(firebaseUser: any, name?: string) {
        try {
            const email = (firebaseUser.email || '').toLowerCase().trim();
            const isAdminEmail = ADMIN_EMAILS.includes(email);

            // 1. Intentar buscar por firebaseUid directamente
            let { data: profile, error } = await supabase
                .from('User')
                .select('*, organization:Organization(*)')
                .eq('firebaseUid', firebaseUser.uid)
                .is('deletedAt', null)
                .maybeSingle();

            if (error) throw error;

            // 2. Si no existe por UID, buscar por email (para usuarios migrados o nuevos registros)
            if (!profile) {
                const { data: emailProfile, error: emailError } = await supabase
                    .from('User')
                    .select('*, organization:Organization(*)')
                    .eq('email', email)
                    .is('deletedAt', null)
                    .maybeSingle();

                if (emailError) throw emailError;

                if (emailProfile) {
                    // Vincular el firebaseUid al perfil existente
                    const { data: updated, error: updateError } = await supabase
                        .from('User')
                        .update({ 
                            firebaseUid: firebaseUser.uid,
                            role: isAdminEmail ? 'ADMIN' : (emailProfile.role || 'USER'),
                            plan: isAdminEmail ? 'ELITE' : (emailProfile.plan || 'FREE'),
                            updatedAt: new Date().toISOString()
                        })
                        .eq('id', emailProfile.id)
                        .select('*, organization:Organization(*)')
                        .single();
                    
                    if (updateError) throw updateError;
                    profile = updated;
                } else {
                    const { data: created, error: createError } = await supabase
                        .from('User')
                        .insert({
                            id: crypto.randomUUID(),
                            firebaseUid: firebaseUser.uid,
                            email: email,
                            name: name || firebaseUser.displayName || 'Nuevo Usuario',
                            role: isAdminEmail ? 'ADMIN' : 'USER',
                            plan: isAdminEmail ? 'ELITE' : 'FREE',
                            updatedAt: new Date().toISOString()
                        })
                        .select('*, organization:Organization(*)')
                        .single();
                    
                    if (createError) throw createError;
                    profile = created;
                }
            } else if (isAdminEmail && profile.role !== 'ADMIN') {
                // 4. Asegurar que SuperAdmins tengan el rol correcto si ya existen
                    const { data: upgraded, error: upgradeError } = await supabase
                        .from('User')
                        .update({ 
                            role: 'ADMIN', 
                            plan: 'ELITE' 
                        })
                        .eq('id', profile.id)
                        .select('*, organization:Organization(*)')
                        .single();
                
                if (upgradeError) throw upgradeError;
                profile = upgraded;
            }

            return profile;
        } catch (err) {
            console.error('CRITICAL: syncUserProfile failed:', err);
            return null;
        }
}

    // Evaluaciones
export async function saveEvaluation(userId: string, organizationId: string | undefined, data: any, results: any) {
        const internalId = await getInternalId(userId);

        // Buscar si ya existe una evaluación para no duplicarla o perder el id original
        const { data: existingEval } = await supabase
            .from('Evaluation')
            .select('id')
            .eq('userId', internalId)
            .maybeSingle();

        const evalId = existingEval?.id || crypto.randomUUID();

        const { data: saved, error } = await supabase
            .from('Evaluation')
            .upsert({
                id: evalId,
                userId: internalId,
                organizationId: organizationId || null,
                data,
                results
            }, { onConflict: 'id' }) // Usamos 'id' porque 'userId' podría no ser único a nivel DB
            .select()
            .single()

        if (error) {
            console.error('saveEvaluation error:', error);
            throw error;
        }
        return saved
}

export async function getLatestEvaluation(userId: string, organizationId?: string) {
        const internalId = await getInternalId(userId);
        const { data, error } = await supabase.from('Evaluation')
            .select('*')
            .eq('userId', internalId)
            .order('createdAt', { ascending: false })
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
        const payload = {
            ...course,
            organizationId: course.organizationId || organizationId || null,
            id: course.id && course.id.length > 20 ? course.id : crypto.randomUUID()
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
  return data;
}

export async function deletePost(id: string) {
  const { error } = await supabase.from('Post').delete().eq('id', id);
  if (error) { console.error('Error deleting post:', error); throw new Error(error.message); }
  return true;
}
