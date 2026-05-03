import pg from 'pg';
import dotenv from 'dotenv';
dotenv.config();

const { Client } = pg;

async function run() {
    const client = new Client({
        connectionString: process.env.DATABASE_URL
    });

    await client.connect();
    const res = await client.query(`SELECT column_name FROM information_schema.columns WHERE table_name='User';`);
    console.log(res.rows.map(r => r.column_name));
    await client.end();
}

run();
