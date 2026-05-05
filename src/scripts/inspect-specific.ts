import { Client } from 'pg';
import * as dotenv from 'dotenv';
dotenv.config();
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
const connectionString = "postgresql://postgres:nutrityglobal%232026@db.pxkeyvmolfshembawelw.supabase.co:5432/postgres?sslmode=require";

async function inspectSpecific() {
    const client = new Client({ connectionString, ssl: { rejectUnauthorized: false } });
    await client.connect();
    const tables = ['Measurement', 'Appointment'];
    for (const table of tables) {
        console.log(`\n📊 Columns for ${table}:`);
        const res = await client.query(`SELECT column_name FROM information_schema.columns WHERE table_name = '${table}';`);
        res.rows.forEach(row => console.log(`- ${row.column_name}`));
    }
    await client.end();
}
inspectSpecific();
