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
        const emails = ['biovital.365@gmail.com', 'biovital.360@gmail.com'];

        for (const email of emails) {
            console.log(`Promoting ${email} via SQL...`);
            const res = await client.query(
                "UPDATE \"User\" SET role = 'ADMIN', plan = 'ELITE' WHERE email = $1 RETURNING *",
                [email]
            );
            if (res.rowCount === 0) {
                console.warn(`User ${email} not found in database.`);
            } else {
                console.log(`Updated successfully:`, res.rows[0]);
            }
        }
    } catch (err) {
        console.error('SQL Error:', err);
    } finally {
        await client.end();
    }
}

run();
