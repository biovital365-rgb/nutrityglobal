import pg from 'pg';
import * as dotenv from 'dotenv';

dotenv.config();

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
    console.error('DATABASE_URL is not defined in .env');
    process.exit(1);
}

const client = new pg.Client({
    connectionString: connectionString,
});

async function addColumn() {
    try {
        await client.connect();
        console.log('Connected to database.');

        const query = 'ALTER TABLE "Course" ADD COLUMN IF NOT EXISTS "paypalUrl" TEXT;';
        await client.query(query);
        console.log('Column "paypalUrl" added successfully (or already existed).');

    } catch (err) {
        console.error('Error adding column:', err);
    } finally {
        await client.end();
    }
}

addColumn();
