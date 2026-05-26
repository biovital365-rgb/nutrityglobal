import 'dotenv/config'
import pg from 'pg'

process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0'

async function checkColumns() {
    const pool = new pg.Pool({
        connectionString: process.env.DATABASE_URL,
        ssl: { rejectUnauthorized: false }
    })

    try {
        const client = await pool.connect()
        console.log('Querying DailyMenu columns...')
        const res = await client.query(`
            SELECT column_name, data_type 
            FROM information_schema.columns 
            WHERE table_name = 'DailyMenu'
        `)
        console.log('Columns:')
        res.rows.forEach(row => {
            console.log(`- ${row.column_name}: ${row.data_type}`)
        })
        client.release()
    } catch (e: any) {
        console.error('Error querying columns:', e.message)
    } finally {
        await pool.end()
    }
}

checkColumns()
