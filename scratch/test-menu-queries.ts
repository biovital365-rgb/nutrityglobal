import 'dotenv/config'
import pg from 'pg'

process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0'

async function testMenuQueries() {
    const pool = new pg.Pool({
        connectionString: process.env.DATABASE_URL,
        ssl: { rejectUnauthorized: false }
    })

    try {
        const client = await pool.connect()
        console.log('Querying first record in DailyMenu...')
        const res = await client.query('SELECT * FROM "DailyMenu" LIMIT 1')
        console.log('Result:', res.rows)
        client.release()
    } catch (e: any) {
        console.error('Error running test query:', e.message)
    } finally {
        await pool.end()
    }
}

testMenuQueries()
