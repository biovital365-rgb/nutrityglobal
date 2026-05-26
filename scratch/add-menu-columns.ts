import 'dotenv/config'
import pg from 'pg'

process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0'

async function addColumns() {
    const pool = new pg.Pool({
        connectionString: process.env.DATABASE_URL,
        ssl: { rejectUnauthorized: false }
    })

    try {
        const client = await pool.connect()
        console.log('Altering DailyMenu table to add missing columns...')
        
        await client.query('ALTER TABLE "DailyMenu" ADD COLUMN IF NOT EXISTS "weekStart" TEXT;')
        await client.query('ALTER TABLE "DailyMenu" ADD COLUMN IF NOT EXISTS "status" TEXT DEFAULT \'PENDING\';')
        await client.query('ALTER TABLE "DailyMenu" ADD COLUMN IF NOT EXISTS "approvedAt" TIMESTAMP;')
        await client.query('ALTER TABLE "DailyMenu" ADD COLUMN IF NOT EXISTS "approvedBy" TEXT;')
        await client.query('ALTER TABLE "DailyMenu" ADD COLUMN IF NOT EXISTS "adminNotes" TEXT;')
        await client.query('ALTER TABLE "DailyMenu" ADD COLUMN IF NOT EXISTS "clientNotes" TEXT;')
        
        console.log('Columns added successfully!')

        console.log('Querying table columns to confirm...')
        const res = await client.query(`
            SELECT column_name, data_type 
            FROM information_schema.columns 
            WHERE table_name = 'DailyMenu'
        `)
        res.rows.forEach(row => {
            console.log(`- ${row.column_name}: ${row.data_type}`)
        })

        client.release()
    } catch (e: any) {
        console.error('Error altering table:', e.message)
    } finally {
        await pool.end()
    }
}

addColumns()
