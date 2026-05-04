import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL!;
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY!;

const supabase = createClient(supabaseUrl, supabaseAnonKey);

const courses = [
    {
        id: crypto.randomUUID(),
        title: "Protocolo de Remisión DM2",
        description: "Aprende las bases científicas para revertir la diabetes tipo 2 mediante nutrición de precisión.",
        thumbnail: "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?q=80&w=2070&auto=format&fit=crop",
        category: "Metabolismo",
        price: 0, // Free for now
        updatedAt: new Date().toISOString()
    },
    {
        id: crypto.randomUUID(),
        title: "Cocina de Bio-Hacking",
        description: "Recetas diseñadas para reprogramar tu señalización insulínica sin sacrificar el sabor.",
        thumbnail: "https://images.unsplash.com/photo-1490645935967-10de6ba17061?q=80&w=2053&auto=format&fit=crop",
        category: "Nutrición",
        price: 29.99,
        paypalUrl: "https://www.paypal.com/ncp/payment/CMG445X32EL2S",
        updatedAt: new Date().toISOString()
    }
];

async function seed() {
    console.log('🌱 Sembrando Academia...');

    for (const course of courses) {
        const { data, error } = await supabase
            .from('Course')
            .upsert(course)
            .select()
            .single();

        if (error) {
            console.error(`❌ Error al insertar curso ${course.title}:`, error);
        } else {
            console.log(`✅ Curso insertado: ${course.title}`);
            
            // Insertar lecciones básicas para el curso gratuito
            if (course.price === 0) {
                const lessons = [
                    {
                        id: crypto.randomUUID(),
                        courseId: data.id,
                        title: "La Verdad sobre la Insulina",
                        description: "Entendiendo el papel de la insulina como llave de almacenamiento.",
                        videoUrl: "https://www.w3schools.com/html/mov_bbb.mp4",
                        duration: "12:00",
                        order: 1,
                        isFree: true
                    },
                    {
                        id: crypto.randomUUID(),
                        courseId: data.id,
                        title: "Ayuno y Autofagia",
                        description: "Cómo activar el sistema de limpieza celular.",
                        videoUrl: "https://www.w3schools.com/html/mov_bbb.mp4",
                        duration: "15:00",
                        order: 2,
                        isFree: true
                    }
                ];

                for (const lesson of lessons) {
                    const { error: lError } = await supabase.from('Lesson').upsert(lesson);
                    if (lError) console.error(`   ❌ Error en lección ${lesson.title}:`, lError);
                    else console.log(`   ✅ Lección insertada: ${lesson.title}`);
                }
            }
        }
    }

    console.log('🏁 Sembrado finalizado.');
}

seed();
