import { Client } from 'pg';
import * as dotenv from 'dotenv';

dotenv.config();

const connectionString = process.env.DATABASE_URL;

async function test() {
    console.log('🔌 Probando conexión directa a PostgreSQL (con ignore SSL)...');
    const client = new Client({
        connectionString,
        connectionTimeoutMillis: 10000,
        ssl: {
            rejectUnauthorized: false
        }
    });

    try {
        await client.connect();
        console.log('✅ Conexión establecida con éxito.');
        
        const res = await client.query('SELECT current_database(), current_user, version();');
        console.log('📊 Datos de conexión:', res.rows[0]);
        
        const tables = await client.query("SELECT tablename FROM pg_catalog.pg_tables WHERE schemaname = 'public';");
        console.log('📋 Tablas encontradas:', tables.rows.map(r => r.tablename));
        
        await client.end();
    } catch (err: any) {
        console.error('❌ Error de conexión:', err.message);
        if (err.stack) console.error(err.stack);
    }
}

test();
