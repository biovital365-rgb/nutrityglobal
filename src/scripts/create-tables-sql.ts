import { Client } from 'pg';
import * as dotenv from 'dotenv';

dotenv.config();

const connectionString = "postgresql://postgres:nutrityglobal%232026@db.pxkeyvmolfshembawelw.supabase.co:5432/postgres?sslmode=require";

async function run() {
    console.log('🏗️ Ejecutando SQL de emergencia para crear tablas...');
    const client = new Client({
        connectionString,
        ssl: { rejectUnauthorized: false }
    });

    try {
        await client.connect();
        
        // Crear tabla Organization si no existe
        await client.query(`
            CREATE TABLE IF NOT EXISTS "Organization" (
                "id" TEXT NOT NULL,
                "name" TEXT NOT NULL,
                "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
                CONSTRAINT "Organization_pkey" PRIMARY KEY ("id")
            );
        `);
        console.log('✅ Tabla Organization verificada/creada.');

        // Crear tabla User si no existe
        await client.query(`
            CREATE TABLE IF NOT EXISTS "User" (
                "id" TEXT NOT NULL,
                "firebaseUid" TEXT,
                "email" TEXT NOT NULL,
                "name" TEXT,
                "role" TEXT NOT NULL DEFAULT 'USER',
                "plan" TEXT NOT NULL DEFAULT 'FREE',
                "organizationId" TEXT,
                "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
                "updatedAt" TIMESTAMP(3) NOT NULL,
                CONSTRAINT "User_pkey" PRIMARY KEY ("id")
            );
            CREATE UNIQUE INDEX IF NOT EXISTS "User_firebaseUid_key" ON "User"("firebaseUid");
            CREATE UNIQUE INDEX IF NOT EXISTS "User_email_key" ON "User"("email");
        `);
        console.log('✅ Tabla User verificada/creada.');

        // Añadir FK si no existe (esto puede fallar si ya existe, así que lo envolvemos en un bloque anónimo)
        await client.query(`
            DO $$
            BEGIN
                IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'User_organizationId_fkey') THEN
                    ALTER TABLE "User" ADD CONSTRAINT "User_organizationId_fkey" 
                    FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE SET NULL ON UPDATE CASCADE;
                END IF;
            END
            $$;
        `);
        console.log('✅ Relación User -> Organization verificada.');

        // Crear otras tablas necesarias
        await client.query(`
            CREATE TABLE IF NOT EXISTS "Measurement" (
                "id" TEXT NOT NULL,
                "userId" TEXT NOT NULL,
                "organizationId" TEXT,
                "label" TEXT NOT NULL,
                "value" TEXT NOT NULL,
                "date" TEXT NOT NULL,
                "time" TEXT,
                "status" TEXT,
                "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
                CONSTRAINT "Measurement_pkey" PRIMARY KEY ("id"),
                CONSTRAINT "Measurement_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE,
                CONSTRAINT "Measurement_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE SET NULL ON UPDATE CASCADE
            );
        `);
        console.log('✅ Tabla Measurement verificada/creada.');

        await client.end();
        console.log('🚀 ¡Tablas listas!');
    } catch (err) {
        console.error('❌ Error:', err);
    }
}

run();
