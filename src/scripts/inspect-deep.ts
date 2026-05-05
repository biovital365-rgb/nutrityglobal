import { Client } from 'pg';
import * as dotenv from 'dotenv';
dotenv.config();

process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

const connectionString = "postgresql://postgres:nutrityglobal%232026@db.pxkeyvmolfshembawelw.supabase.co:5432/postgres?sslmode=require";

async function inspectFullSchema() {
    const client = new Client({
        connectionString,
        ssl: { rejectUnauthorized: false }
    });

    try {
        await client.connect();
        const tables = ['Measurement', 'Appointment', 'Evaluation', 'Food', 'Micronutrient', 'Course', 'PDFReportLog'];
        
        for (const table of tables) {
            console.log(`\n📊 Columns for ${table}:`);
            const res = await client.query(`
                SELECT column_name, data_type 
                FROM information_schema.columns 
                WHERE table_name = '${table}'
                ORDER BY ordinal_position;
            `);
            if (res.rows.length === 0) {
                console.log(`❌ Table ${table} not found.`);
            } else {
                res.rows.forEach(row => {
                    console.log(`- ${row.column_name} (${row.data_type})`);
                });
            }
        }
    } catch (err) {
        console.error(err);
    } finally {
        await client.end();
    }
}

inspectFullSchema();
