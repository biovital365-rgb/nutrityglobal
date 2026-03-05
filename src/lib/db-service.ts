import { supabase } from './supabase'

// Interfaces correspondientes a los modelos de Prisma
export interface FoodItem {
    id: string
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
    async getFoods() {
        const { data, error } = await supabase
            .from('Food')
            .select('*')
            .order('name', { ascending: true })

        if (error) throw error
        return data as FoodItem[]
    },

    async saveFood(food: Partial<FoodItem>) {
        const payload = {
            ...food,
            id: food.id || `food_${Math.random().toString(36).substring(2, 11)}`,
            updatedAt: new Date().toISOString()
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
    async getMicronutrients() {
        const { data, error } = await supabase
            .from('Micronutrient')
            .select('*')
            .order('name', { ascending: true })

        if (error) throw error
        return data as Micronutrient[]
    },

    async saveMicronutrient(micro: Partial<Micronutrient>) {
        const payload = {
            ...micro,
            id: micro.id || `micro_${Math.random().toString(36).substring(2, 11)}`,
            updatedAt: new Date().toISOString()
        };

        const { data, error } = await supabase
            .from('Micronutrient')
            .upsert(payload)
            .select()
            .single()

        if (error) throw error
        return data as Micronutrient
    },

    async deleteMicronutrient(id: string) {
        const { error } = await supabase
            .from('Micronutrient')
            .delete()
            .eq('id', id)

        if (error) throw error
        return true
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

    async syncUserProfile(firebaseUser: any, name?: string) {
        try {
            // 1. Verificar si ya existe por firebaseUid
            let profile = await this.getUserProfile(firebaseUser.uid)

            if (!profile) {
                // 2. Fallback: buscar por email (para usuarios creados manualmente/seed)
                const { data: emailProfile } = await supabase
                    .from('User')
                    .select('*, organization:Organization(*)')
                    .eq('email', firebaseUser.email)
                    .maybeSingle()

                if (emailProfile) {
                    // Actualizar con el firebaseUid
                    const { data: updated } = await supabase
                        .from('User')
                        .update({ firebaseUid: firebaseUser.uid })
                        .eq('id', emailProfile.id)
                        .select('*, organization:Organization(*)')
                        .single()
                    profile = updated
                } else {
                    // 3. Crear nuevo si no existe
                    const { data: created } = await supabase
                        .from('User')
                        .insert({
                            firebaseUid: firebaseUser.uid,
                            email: firebaseUser.email,
                            name: name || firebaseUser.displayName,
                            role: 'USER',
                            plan: 'FREE'
                        })
                        .select('*, organization:Organization(*)')
                        .single()
                    profile = created
                }
            }
            return profile
        } catch (err) {
            console.error('Sync profile error:', err)
            return null
        }
    },

    // Evaluaciones
    async saveEvaluation(userId: string, data: any, results: any) {
        const { data: saved, error } = await supabase
            .from('Evaluation')
            .insert({
                userId,
                data,
                results
            })
            .select()
            .single()

        if (error) throw error
        return saved
    },

    async getLatestEvaluation(userId: string) {
        const { data, error } = await supabase
            .from('Evaluation')
            .select('*')
            .eq('userId', userId)
            .order('timestamp', { ascending: false })
            .limit(1)
            .maybeSingle()

        if (error) throw error
        return data
    },

    // Mediciones (Migración gradual desde Firebase en el futuro)
    async getMeasurements(userId: string) {
        const { data, error } = await supabase
            .from('Measurement')
            .select('*')
            .eq('userId', userId)
            .order('timestamp', { ascending: false })

        if (error) throw error
        return data
    },

    // --- Módulo de Academia (SaaS) ---
    async getCourses() {
        const { data, error } = await supabase
            .from('Course')
            .select('*')
            .order('createdAt', { ascending: false })

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

    async saveCourse(course: Partial<Course>) {
        const payload = {
            ...course,
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
    }
}
