import 'dotenv/config'
import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import pg from 'pg'
import { foodCatalog } from '../src/lib/food-data'
import { micronutrientsData } from '../src/lib/micronutrients-data'

// Configuración del adaptador para Prisma 7 + PostgreSQL
const connectionString = process.env.DATABASE_URL
const pool = new pg.Pool({ connectionString })
const adapter = new PrismaPg(pool)
const prisma = new PrismaClient({ adapter } as any)

async function main() {
    console.log('🌱 Sembrando base de datos Nutrity Global en SUPABASE (PostgreSQL) con Adaptador...')

    // Limpiar datos existentes
    try {
        await prisma.enrollment.deleteMany({})
        await prisma.course.deleteMany({})
        await prisma.evaluation.deleteMany({})
        await prisma.measurement.deleteMany({})
        await prisma.appointment.deleteMany({})
        await prisma.food.deleteMany({})
        await prisma.micronutrient.deleteMany({})
        await prisma.user.deleteMany({})
        await prisma.organization.deleteMany({})
        console.log('✅ Tablas limpias.')
    } catch (e) {
        console.log('ℹ️ Tablas ya estaban vacías o error no crítico en limpieza.')
    }

    // Crear organización maestra
    const org = await prisma.organization.create({
        data: {
            name: 'Nutrity Global Master'
        }
    })

    // Sembrar Alimentos
    try {
        console.log(`- Migrando ${foodCatalog.length} alimentos...`)
        for (const food of foodCatalog) {
            await prisma.food.upsert({
                where: { id: food.id },
                update: {},
                create: {
                    id: food.id,
                    name: food.name,
                    scientificName: food.scientificName,
                    image: food.image,
                    category: food.category,
                    description: food.description,
                    metabolicBenefits: food.metabolicBenefits as any,
                    nutrients: food.nutrients as any,
                    recipes: food.recipes as any
                }
            })
        }
        console.log('✅ Alimentos migrados.')
    } catch (e) {
        console.error('❌ Error migrando alimentos:', e)
    }

    // Sembrar Micronutrientes
    try {
        console.log(`- Migrando ${micronutrientsData.length} micronutrientes...`)
        for (const m of micronutrientsData) {
            await prisma.micronutrient.upsert({
                where: { id: m.id },
                update: {},
                create: {
                    id: m.id,
                    name: m.name,
                    symbol: m.symbol,
                    category: m.category,
                    function: m.function,
                    metabolicImpact: m.metabolicImpact,
                    sources: m.sources as any,
                    deficiencySigns: m.deficiencySigns as any,
                    dailyDose: m.dailyDose,
                    image: m.image
                }
            })
        }
        console.log('✅ Micronutrientes migrados.')
    } catch (e) {
        console.error('❌ Error migrando micronutrientes:', e)
    }

    // Usuarios de Prueba (Admin Maestro y User)
    try {
        console.log('- Creando usuarios de prueba...')
        // The admin user creation was removed from the provided diff, so it's commented out or removed.
        // const adminUser = await prisma.user.create({
        //     data: {
        //         email: 'admin@nutrity.global',
        //         name: 'Nutrity Admin',
        //         role: 'ADMIN',
        //         plan: 'ELITE',
        //         organizationId: org.id
        //     }
        // })

        const testUser = await prisma.user.upsert({
            where: { email: 'user@nutrity.global' },
            update: {},
            create: {
                email: 'user@nutrity.global',
                name: 'Freddy Bio-Explorer',
                role: 'USER',
                plan: 'FREE',
                organizationId: org.id
            }
        })
        console.log('✅ Usuario test creado.')

        // Sembrar Academia
        console.log('- Sembrando Módulo de Academia...')
        const course = await prisma.course.create({
            data: {
                title: 'Protocolo Maestro: Remisión Metabólica 2025',
                description: 'De la gestión paliativa a la restauración biológica.',
                thumbnail: 'https://images.unsplash.com/photo-1576086213369-97a306d36557',
                category: 'Pilar Metabolismo',
                price: 299,
            }
        })

        const lessonsData = [
            { title: 'Módulo 1: El Cambio de Paradigma', order: 1, isFree: true },
            { title: 'Módulo 2: Fisiopatología', order: 2, isFree: false }
        ]

        for (const l of lessonsData) {
            await prisma.lesson.create({
                data: { courseId: course.id, ...l }
            })
        }

        await prisma.enrollment.create({
            data: { userId: testUser.id, courseId: course.id }
        })
        console.log('✅ Módulo de academia creado.')
    } catch (e) {
        console.error('❌ Error en módulo usuarios/academia:', e)
    }

    console.log('✅ Proceso de sembrado finalizado (revisar logs si hubo errores individuales).')
}

main()
    .catch((e) => {
        console.error('❌ Error FATAL en el sembrado:', e)
        process.exit(1)
    })
    .finally(async () => {
        await pool.end()
        await prisma.$disconnect()
    })
