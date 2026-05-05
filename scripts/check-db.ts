import 'dotenv/config'
import pg from 'pg'

const connectionString = process.env.DATABASE_URL
const pool = new pg.Pool({ 
    connectionString,
    ssl: {
        rejectUnauthorized: false
    }
})

async function main() {
    try {
        const res = await pool.query('SELECT count(*) FROM "User"')
        console.log('✅ Connection successful. User count:', res.rows[0].count)
    } catch (err) {
        console.error('❌ Error connecting to database:', err)
    } finally {
        await pool.end()
    }
}

main()
