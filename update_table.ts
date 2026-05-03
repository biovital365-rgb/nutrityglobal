import pg from 'pg';
import dotenv from 'dotenv';
dotenv.config();

const { Client } = pg;

async function run() {
    const client = new Client({
        connectionString: process.env.DATABASE_URL
    });

    await client.connect();

    try {
        await client.query(`
            ALTER TABLE "User" 
            ADD COLUMN IF NOT EXISTS "phone" TEXT,
            ADD COLUMN IF NOT EXISTS "address" TEXT,
            ADD COLUMN IF NOT EXISTS "age" TEXT,
            ADD COLUMN IF NOT EXISTS "occupation" TEXT,
            ADD COLUMN IF NOT EXISTS "maritalStatus" TEXT,
            ADD COLUMN IF NOT EXISTS "socialMedia" TEXT;
        `);
        console.log("Added columns successfully to User table!");

        await client.query(`NOTIFY pgrst, 'reload schema';`);
        console.log("Reloaded schema specifically to tell PostgREST!");

    } catch (e) {
        console.error("Error updating User table:", e);
    }

    await client.end();
}

run();
