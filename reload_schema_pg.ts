import pg from 'pg';
import dotenv from 'dotenv';
dotenv.config();

const { Client } = pg;

async function run() {
    const client = new Client({
        connectionString: process.env.DATABASE_URL
    });

    await client.connect();
    await client.query(`NOTIFY pgrst, 'reload schema';`);
    console.log("Reloaded schema successfully via pg!");
    await client.end();
}

run();
