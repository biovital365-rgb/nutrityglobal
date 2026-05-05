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
        const res = await pool.query('SELECT email, name, role FROM "User"')
        console.table(res.rows)
    } catch (err) {
        console.error('❌ Error:', err)
    } finally {
        await pool.end()
    }
}

main()
