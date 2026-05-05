import { Client } from 'pg';
import * as dotenv from 'dotenv';
dotenv.config();
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
const connectionString = "postgresql://postgres:nutrityglobal%232026@db.pxkeyvmolfshembawelw.supabase.co:5432/postgres?sslmode=require";

async function fixSchema() {
    const client = new Client({ connectionString, ssl: { rejectUnauthorized: false } });
    try {
        await client.connect();
        console.log('🛠️ Creating PDFReportLog table...');
        await client.query(`
            CREATE TABLE IF NOT EXISTS "PDFReportLog" (
                "id" TEXT PRIMARY KEY,
                "userId" TEXT NOT NULL,
                "organizationId" TEXT,
                "status" TEXT NOT NULL,
                "errorMessage" TEXT,
                "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
                "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
                CONSTRAINT "PDFReportLog_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE
            );
        `);
        console.log('✅ Table PDFReportLog created.');

        // Also add createdAt to Evaluation if missing (to standardize)
        await client.query(`
            ALTER TABLE "Evaluation" ADD COLUMN IF NOT EXISTS "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;
        `);
        console.log('✅ Standardized Evaluation with createdAt.');

    } catch (err) {
        console.error(err);
    } finally {
        await client.end();
    }
}
fixSchema();
