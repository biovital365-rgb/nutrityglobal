import { supabase } from './supabase'

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

export const dbService = {
    // Helper para obtener ID interno de Supabase desde Firebase UID o el propio ID interno
    async getInternalId(idOrUid: string): Promise<string> {
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
    },

    // Alimentos con Auto-Sincronización y Depuración Silenciosa (Solución Definitiva)
    async getFoods(organizationId?: string) {
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
                await this.saveFood({ ...food, organizationId }, organizationId).catch(() => {});
            }
            return this.getFoods(organizationId);
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
    },

    async saveFood(food: Partial<FoodItem>, organizationId?: string) {
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
    },

    // Función para limpiar duplicados (mantiene el más reciente)
    async deduplicateFoods() {
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
    },

    async deleteFood(id: string) {
        const { error } = await supabase
            .from('Food')
            .update({ deletedAt: new Date().toISOString() })
            .eq('id', id)
        if (error) throw error
        return true
    },

    // Micronutrientes con Auto-Sincronización y Depuración Silenciosa
    async getMicronutrients(organizationId?: string) {
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
                await this.saveMicronutrient({ ...(micro as any), organizationId }, organizationId).catch(() => {});
            }
            return this.getMicronutrients(organizationId);
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
    },

    async saveMicronutrient(micro: Partial<Micronutrient>, organizationId?: string) {
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
    },

    async deleteMicronutrient(id: string) {
        const { error } = await supabase
            .from('Micronutrient')
            .update({ deletedAt: new Date().toISOString() })
            .eq('id', id)
        if (error) throw error
        return true
    },

    async deduplicateMicronutrients() {
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
    },

    // Perfil de Usuario (SaaS)
    async getUserProfile(firebaseUid: string) {
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
    },

    async updateUserProfile(userId: string, profileData: Partial<any>) {
        const { email, ...safeData } = profileData;
        const { data, error } = await supabase
            .from('User')
            .update(safeData)
            .eq('id', userId)
            .select('*, organization:Organization(*)')
            .single()

        if (error) throw error
        return data
    },

    // Admin: Gestión de Usuarios
    async getAllUsers(organizationId?: string, includeDeleted = false) {
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
    },

    async updateUserStatus(userId: string, status: 'ACTIVE' | 'BLOCKED' | 'OBSERVED') {
        const { data, error } = await supabase
            .from('User')
            .update({ status, updatedAt: new Date().toISOString() })
            .eq('id', userId)
            .select()
            .single()
        if (error) throw error
        return data
    },

    async deleteUser(userId: string) {
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
    },

    async syncUserProfile(firebaseUser: any, name?: string) {
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
    },

    // Evaluaciones
    async saveEvaluation(userId: string, organizationId: string | undefined, data: any, results: any) {
        const internalId = await this.getInternalId(userId);

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
    },

    async getLatestEvaluation(userId: string, organizationId?: string) {
        const internalId = await this.getInternalId(userId);
        const { data, error } = await supabase.from('Evaluation')
            .select('*')
            .eq('userId', internalId)
            .order('createdAt', { ascending: false })
            .limit(1)
            .maybeSingle();

        if (error) throw error
        return data
    },

    // Mediciones
    async getMeasurements(userId: string, organizationId?: string) {
        const internalId = await this.getInternalId(userId);

        let query = supabase.from('Measurement').select('*').eq('userId', internalId)
        
        if (organizationId) {
            query = query.eq('organizationId', organizationId)
        }

        const { data, error } = await query.order('timestamp', { ascending: false })

        if (error) throw error
        return data
    },

    async saveMeasurement(userId: string, organizationId: string | undefined, measurement: any) {
        const internalId = await this.getInternalId(userId);

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
    },

    // --- Módulo de Academia (SaaS) ---
    async getCourses(organizationId?: string, includeDeleted = false) {
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
    },

    async getCourseWithLessons(courseId: string) {
        const { data, error } = await supabase
            .from('Course')
            .select('*, lessons:Lesson(*)')
            .eq('id', courseId)
            .single()

        if (error) throw error
        return data as Course
    },

    async saveCourse(course: Partial<Course>, organizationId?: string) {
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
    },

    async deleteCourse(id: string) {
        const { error } = await supabase
            .from('Course')
            .update({ deletedAt: new Date().toISOString() })
            .eq('id', id)

        if (error) throw error
        return true
    },

    async toggleLessonProgress(userId: string, lessonId: string, completed: boolean) {
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
    },

    async getLessonsProgress(userId: string) {
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
    },

    // Citas (Nuevo soporte multi-tenant en Supabase)
    async getAppointments(userId: string, organizationId?: string, includeDeleted = false) {
        const internalId = await this.getInternalId(userId);
        let query = supabase.from('Appointment').select('*').eq('userId', internalId)
        if (!includeDeleted) query = query.is('deletedAt', null)
        
        if (organizationId) {
            query = query.eq('organizationId', organizationId)
        }
        const { data, error } = await query.order('date', { ascending: true })
        if (error) throw error
        return data
    },

    async saveAppointment(userId: string, organizationId: string | undefined, appointment: any) {
        const internalId = await this.getInternalId(userId);

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
    },
    async getAllAppointments(organizationId?: string, includeDeleted = false) {
        let query = supabase.from('Appointment').select('*, user:User(name, email)')
        if (!includeDeleted) query = query.is('deletedAt', null)
        
        if (organizationId) {
            query = query.eq('organizationId', organizationId)
        }
        const { data, error } = await query.order('date', { ascending: false })
        if (error) throw error
        return data
    },

    async updateAppointment(id: string, updates: any) {
        const { data, error } = await supabase
            .from('Appointment')
            .update({ ...updates, updatedAt: new Date().toISOString() })
            .eq('id', id)
            .select()
            .single()
        if (error) throw error
        return data
    },

    async deleteAppointment(id: string) {
        const { error } = await supabase
            .from('Appointment')
            .update({ deletedAt: new Date().toISOString() })
            .eq('id', id)
        if (error) throw error
        return true
    },

    // --- Módulo de Reportes PDF ---
    async logPDFReport(userId: string, organizationId: string | undefined, status: 'GENERATED' | 'DOWNLOADED' | 'ERROR', errorMessage?: string) {
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
    },

    async getPDFReports(organizationId?: string) {
        let query = supabase.from('PDFReportLog').select('*, user:User(name, email)')
        if (organizationId) {
            query = query.eq('organizationId', organizationId)
        }
        const { data, error } = await query.order('createdAt', { ascending: false })
        if (error) throw error
        return data
    },

    // Sincronización Forzada de Catálogos (Para Admin)
    async forceSyncCatalog(type: 'foods' | 'micros', organizationId?: string) {
        if (type === 'foods') {
            const { foodCatalog } = await import('../lib/food-data');
            for (const food of foodCatalog) {
                await this.saveFood({ ...food, organizationId }, organizationId).catch(e => console.error(`Sync error ${food.name}:`, e));
            }
        } else {
            const { micronutrientsData } = await import('../lib/micronutrients-data');
            for (const micro of micronutrientsData) {
                await this.saveMicronutrient({ ...(micro as any), organizationId }, organizationId).catch(e => console.error(`Sync error ${micro.name}:`, e));
            }
        }
        return true;
    },

    // --- Módulo de Menús Diarios ---
    async saveDailyMenu(userId: string, date: string, menuData: any, metabolicGoal?: string) {
        const internalId = await this.getInternalId(userId);
        const { data, error } = await supabase
            .from('DailyMenu')
            .upsert({
                userId: internalId,
                date,
                menuData,
                metabolicGoal,
                updatedAt: new Date().toISOString()
            }, { onConflict: 'userId,date' })
            .select()
            .single();

        if (error) throw error;
        return data;
    },

    async getDailyMenu(userId: string, date: string) {
        const internalId = await this.getInternalId(userId);
        const { data, error } = await supabase
            .from('DailyMenu')
            .select('*')
            .eq('userId', internalId)
            .eq('date', date)
            .is('deletedAt', null)
            .maybeSingle();

        if (error) throw error;
        return data;
    },

    async getDailyMenus(userId: string) {
        const internalId = await this.getInternalId(userId);
        const { data, error } = await supabase
            .from('DailyMenu')
            .select('*')
            .eq('userId', internalId)
            .is('deletedAt', null)
            .order('date', { ascending: false });

        if (error) throw error;
        return data;
    },

    // Recovery methods
    async restoreFood(id: string) {
        const { data, error } = await supabase.from('Food').update({ deletedAt: null }).eq('id', id).select().single();
        if (error) throw error;
        return data;
    },

    async restoreMicronutrient(id: string) {
        const { data, error } = await supabase.from('Micronutrient').update({ deletedAt: null }).eq('id', id).select().single();
        if (error) throw error;
        return data;
    },

    async restoreCourse(id: string) {
        const { data, error } = await supabase.from('Course').update({ deletedAt: null }).eq('id', id).select().single();
        if (error) throw error;
        return data;
    },

    async restoreUser(id: string) {
        const { data, error } = await supabase.from('User').update({ deletedAt: null }).eq('id', id).select().single();
        if (error) throw error;
        return data;
    },

    async restoreAppointment(id: string) {
        const { data, error } = await supabase.from('Appointment').update({ deletedAt: null }).eq('id', id).select().single();
        if (error) throw error;
        return data;
    }
}
