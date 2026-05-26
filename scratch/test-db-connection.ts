import 'dotenv/config'
import pg from 'pg'

process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0'

async function testConnection() {
    console.log('Testing direct connection...')
    
    // Direct connection to Supabase database host
    const connectionString = "postgresql://postgres:nutrityglobal%232026@db.pxkeyvmolfshembawelw.supabase.co:5432/postgres"
    
    console.log('Using connection string:', connectionString.substring(0, 50) + '...')

    const pool = new pg.Pool({
        connectionString,
        ssl: {
            rejectUnauthorized: false
        }
    })

    try {
        const client = await pool.connect()
        console.log('Successfully connected via direct connection!')
        const res = await client.query('SELECT NOW()')
        console.log('Query result:', res.rows[0])
        client.release()
    } catch (e: any) {
        console.error('Connection failed:', e.message)
        console.error('Full error:', e)
    } finally {
        await pool.end()
    }
}

testConnection()
