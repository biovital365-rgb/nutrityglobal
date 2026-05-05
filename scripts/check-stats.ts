import 'dotenv/config'
import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import pg from 'pg'

const connectionString = process.env.DATABASE_URL
const pool = new pg.Pool({ connectionString })
const adapter = new PrismaPg(pool)
const prisma = new PrismaClient({ adapter } as any)

async function main() {
    try {
        const userCount = await prisma.user.count()
        const orgCount = await prisma.organization.count()
        const foodCount = await prisma.food.count()
        const microCount = await prisma.micronutrient.count()
        const evalCount = await prisma.evaluation.count()
        const apptCount = await prisma.appointment.count()
        const measureCount = await prisma.measurement.count()
        const courseCount = await prisma.course.count()

        console.log('📊 Supabase Database Stats:')
        console.log(`- Users: ${userCount}`)
        console.log(`- Organizations: ${orgCount}`)
        console.log(`- Foods: ${foodCount}`)
        console.log(`- Micronutrients: ${microCount}`)
        console.log(`- Evaluations: ${evalCount}`)
        console.log(`- Appointments: ${apptCount}`)
        console.log(`- Measurements: ${measureCount}`)
        console.log(`- Courses: ${courseCount}`)
    } catch (err) {
        console.error('❌ Error connecting to database:', err)
    }
}

main()
    .catch(console.error)
    .finally(async () => {
        await pool.end()
        await prisma.$disconnect()
    })
