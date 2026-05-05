import 'dotenv/config'
import pg from 'pg'

const connectionString = "postgresql://postgres:nutrityglobal%232026@db.pxkeyvmolfshembawelw.supabase.co:5432/postgres"

const pool = new pg.Pool({ 
    connectionString,
    ssl: {
        rejectUnauthorized: false
    }
})

async function main() {
    try {
        const tables = ['User', 'Evaluation', 'Appointment', 'Measurement', 'Food', 'Micronutrient', 'Course']
        for (const table of tables) {
            const res = await pool.query(`SELECT count(*) FROM "${table}"`)
            console.log(`- ${table}: ${res.rows[0].count}`)
        }
    } catch (err) {
        console.error('❌ Error:', err)
    } finally {
        await pool.end()
    }
}

main()
