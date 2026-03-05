import pg from 'pg';
import * as dotenv from 'dotenv';
dotenv.config();

const { Client } = pg;
const client = new Client({
    connectionString: process.env.DATABASE_URL,
});

async function run() {
    try {
        await client.connect();
        const res = await client.query('SELECT email, role, plan FROM "User"');
        console.log('Database Users:', res.rows);
    } catch (err) {
        console.error('SQL Error:', err);
    } finally {
        await client.end();
    }
}

run();
