import { Client } from 'pg';
import * as dotenv from 'dotenv';
dotenv.config();
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
const connectionString = "postgresql://postgres:nutrityglobal%232026@db.pxkeyvmolfshembawelw.supabase.co:5432/postgres?sslmode=require";

async function fixConstraints() {
    const client = new Client({ connectionString, ssl: { rejectUnauthorized: false } });
    try {
        await client.connect();
        console.log('🛠️ Fixing Foreign Key Constraints to allow CASCADE delete...');

        const tables = [
            { name: 'Evaluation', constraint: 'Evaluation_userId_fkey' },
            { name: 'Measurement', constraint: 'Measurement_userId_fkey' },
            { name: 'Appointment', constraint: 'Appointment_userId_fkey' },
            { name: 'Enrollment', constraint: 'Enrollment_userId_fkey' },
            { name: 'LessonProgress', constraint: 'LessonProgress_userId_fkey' }
        ];

        for (const table of tables) {
            console.log(`\n🔄 Processing ${table.name}...`);
            
            // Drop existing constraint if it exists (try common names)
            await client.query(`ALTER TABLE "${table.name}" DROP CONSTRAINT IF EXISTS "${table.constraint}";`).catch(e => console.log(`  ⚠️ Could not drop ${table.constraint}: ${e.message}`));
            await client.query(`ALTER TABLE "${table.name}" DROP CONSTRAINT IF EXISTS "${table.name}_userId_fkey";`).catch(() => {});

            // Add new constraint with ON DELETE CASCADE
            try {
                await client.query(`
                    ALTER TABLE "${table.name}" 
                    ADD CONSTRAINT "${table.name}_userId_fkey" 
                    FOREIGN KEY ("userId") REFERENCES "User"("id") 
                    ON DELETE CASCADE ON UPDATE CASCADE;
                `);
                console.log(`  ✅ Constraint added to ${table.name} with CASCADE.`);
            } catch (err) {
                console.error(`  ❌ Error adding constraint to ${table.name}:`, err.message);
            }
        }

        console.log('\n🏁 Constraints updated successfully.');
    } catch (err) {
        console.error(err);
    } finally {
        await client.end();
    }
}

fixConstraints();
