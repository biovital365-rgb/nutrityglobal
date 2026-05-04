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

export const dbService = {
    // Alimentos
    async getFoods(organizationId?: string) {
        let query = supabase.from('Food').select('*')
        
        if (organizationId) {
            query = query.or(`organizationId.is.null,organizationId.eq.${organizationId}`)
        } else {
            query = query.is('organizationId', null)
        }

        const { data, error } = await query.order('name', { ascending: true })
        if (error) throw error
        return data as FoodItem[]
    },

    async saveFood(food: Partial<FoodItem>, organizationId?: string) {
        const payload = {
            ...food,
            organizationId: food.organizationId || organizationId,
            id: food.id || `food_${Math.random().toString(36).substring(2, 11)}`
        };

        const { data, error } = await supabase
            .from('Food')
            .upsert(payload)
            .select()
            .single()

        if (error) throw error
        return data as FoodItem
    },

    async deleteFood(id: string) {
        const { error } = await supabase
            .from('Food')
            .delete()
            .eq('id', id)
        if (error) throw error
        return true
    },

    // Micronutrientes
    async getMicronutrients(organizationId?: string) {
        let query = supabase.from('Micronutrient').select('*')
        
        if (organizationId) {
            query = query.or(`organizationId.is.null,organizationId.eq.${organizationId}`)
        } else {
            query = query.is('organizationId', null)
        }

        const { data, error } = await query.order('name', { ascending: true })
        if (error) throw error
        return data as Micronutrient[]
    },

    async saveMicronutrient(micro: Partial<Micronutrient>, organizationId?: string) {
        const payload = {
            ...micro,
            organizationId: micro.organizationId || organizationId,
            id: micro.id || `micro_${Math.random().toString(36).substring(2, 11)}`
        };

        const { data, error } = await supabase
            .from('Micronutrient')
            .upsert(payload)
            .select()
            .single()

        if (error) throw error
        return data as Micronutrient
    },

    // Perfil de Usuario (SaaS)
    async getUserProfile(firebaseUid: string) {
        const { data, error } = await supabase
            .from('User')
            .select('*, organization:Organization(*)')
            .eq('firebaseUid', firebaseUid)
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

    async syncUserProfile(firebaseUser: any, name?: string) {
        try {
            let profile = await this.getUserProfile(firebaseUser.uid)

            if (!profile) {
                const { data: emailProfile } = await supabase
                    .from('User')
                    .select()
                    .eq('email', firebaseUser.email)
                    .maybeSingle()

                if (emailProfile) {
                    const { data: updated } = await supabase
                        .from('User')
                        .update({ firebaseUid: firebaseUser.uid })
                        .eq('id', emailProfile.id)
                        .select('*, organization:Organization(*)')
                        .single()
                    profile = updated
                } else {
                    // Detectar SuperAdmins por email y asignarles el rol correcto
                    const superAdminEmails = ['biovital.365@gmail.com', 'biovital.360@gmail.com', 'admin@nutrity.global'];
                    const isAdmin = superAdminEmails.includes((firebaseUser.email || '').toLowerCase());

                    const id = crypto.randomUUID(); // Generar UUID para el nuevo usuario
                    const { data: created } = await supabase
                        .from('User')
                        .insert({
                            id,
                            firebaseUid: firebaseUser.uid,
                            email: firebaseUser.email,
                            name: name || firebaseUser.displayName,
                            role: isAdmin ? 'ADMIN' : 'USER',
                            plan: isAdmin ? 'ELITE' : 'FREE',
                            updatedAt: new Date().toISOString()
                        })
                        .select('*, organization:Organization(*)')
                        .single()
                    profile = created
                }
            }

            // Si el perfil ya existe pero el email es SuperAdmin y no tiene rol ADMIN,
            // actualizarlo. Protege contra registros antiguos con rol incorrecto.
            if (profile) {
                const superAdminEmails = ['biovital.365@gmail.com', 'biovital.360@gmail.com', 'admin@nutrity.global'];
                const isAdmin = superAdminEmails.includes((profile.email || '').toLowerCase());
                if (isAdmin && profile.role !== 'ADMIN') {
                    const { data: upgraded } = await supabase
                        .from('User')
                        .update({ role: 'ADMIN', plan: 'ELITE', updatedAt: new Date().toISOString() })
                        .eq('id', profile.id)
                        .select('*, organization:Organization(*)')
                        .single()
                    profile = upgraded
                }
            }

            return profile
        } catch (err) {
            console.error('Sync profile error:', err)
            return null
        }
    },

    // Evaluaciones
    async saveEvaluation(userId: string, organizationId: string | undefined, data: any, results: any) {
        const id = `eval_${Math.random().toString(36).substring(2, 11)}`;
        const { data: saved, error } = await supabase
            .from('Evaluation')
            .insert({
                id,
                userId,
                organizationId,
                data,
                results
            })
            .select()
            .single()

        if (error) throw error
        return saved
    },

    async getLatestEvaluation(userId: string, organizationId?: string) {
        let query = supabase.from('Evaluation').select('*').eq('userId', userId)
        
        if (organizationId) {
            query = query.eq('organizationId', organizationId)
        }

        const { data, error } = await query
            .order('timestamp', { ascending: false })
            .limit(1)
            .maybeSingle()

        if (error) throw error
        return data
    },

    // Mediciones
    async getMeasurements(userId: string, organizationId?: string) {
        let query = supabase.from('Measurement').select('*').eq('userId', userId)
        
        if (organizationId) {
            query = query.eq('organizationId', organizationId)
        }

        const { data, error } = await query.order('timestamp', { ascending: false })

        if (error) throw error
        return data
    },

    async saveMeasurement(userId: string, organizationId: string | undefined, measurement: any) {
        const id = measurement.id || `meas_${Math.random().toString(36).substring(2, 11)}`;
        const { data, error } = await supabase
            .from('Measurement')
            .insert({
                ...measurement,
                id,
                userId,
                organizationId
            })
            .select()
            .single()

        if (error) throw error
        return data
    },

    // --- Módulo de Academia (SaaS) ---
    async getCourses(organizationId?: string) {
        let query = supabase.from('Course').select('*')
        
        if (organizationId) {
            query = query.or(`organizationId.is.null,organizationId.eq.${organizationId}`)
        } else {
            query = query.is('organizationId', null)
        }

        const { data, error } = await query.order('createdAt', { ascending: false })

        if (error) throw error
        return data as Course[]
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
            organizationId: course.organizationId || organizationId,
            id: course.id || `course_${Math.random().toString(36).substring(2, 11)}`,
            updatedAt: new Date().toISOString()
        };

        const { data, error } = await supabase
            .from('Course')
            .upsert(payload)
            .select()
            .single()

        if (error) throw error
        return data as Course
    },

    async deleteCourse(id: string) {
        const { error } = await supabase
            .from('Course')
            .delete()
            .eq('id', id)

        if (error) throw error
        return true
    },

    async toggleLessonProgress(userId: string, lessonId: string, completed: boolean) {
        const { error } = await supabase
            .from('LessonProgress')
            .upsert({
                userId,
                lessonId,
                completed,
                updatedAt: new Date().toISOString()
            }, { onConflict: 'userId,lessonId' })

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
    async getAppointments(userId: string, organizationId?: string) {
        let query = supabase.from('Appointment').select('*').eq('userId', userId)
        
        if (organizationId) {
            query = query.eq('organizationId', organizationId)
        }

        const { data, error } = await query.order('date', { ascending: true })
        if (error) throw error
        return data
    },

    async saveAppointment(userId: string, organizationId: string | undefined, appointment: any) {
        const id = appointment.id || `appt_${Math.random().toString(36).substring(2, 11)}`;
        const { data, error } = await supabase
            .from('Appointment')
            .insert({
                ...appointment,
                id,
                userId,
                organizationId
            })
            .select()
            .single()

        if (error) throw error
        return data
    }
}
