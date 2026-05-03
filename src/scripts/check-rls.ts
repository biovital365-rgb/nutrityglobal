import { Client } from 'pg';
import * as dotenv from 'dotenv';

dotenv.config();

async function checkRLS() {
    const client = new Client({
        connectionString: process.env.DATABASE_URL,
        ssl: { rejectUnauthorized: false }
    });

    try {
        await client.connect();
        const res = await client.query(`
            SELECT tablename, rowsecurity 
            FROM pg_tables 
            WHERE schemaname = 'public';
        `);
        console.log('🔒 Estado de RLS en tablas:');
        res.rows.forEach(row => {
            console.log(`- ${row.tablename}: ${row.rowsecurity ? 'Habilitado ✅' : 'Deshabilitado ❌'}`);
        });
        await client.end();
    } catch (err) {
        console.error('❌ Error:', err);
    }
}

checkRLS();
