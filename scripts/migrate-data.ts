import 'dotenv/config'
import { initializeApp } from "firebase/app";
import { getFirestore, collection, getDocs } from "firebase/firestore";
import pg from 'pg'

// Configuración de Firebase
const firebaseConfig = {
    apiKey: process.env.VITE_FIREBASE_API_KEY,
    authDomain: process.env.VITE_FIREBASE_AUTH_DOMAIN,
    projectId: process.env.VITE_FIREBASE_PROJECT_ID,
    storageBucket: process.env.VITE_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.VITE_FIREBASE_APP_ID,
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Configuración de Postgres (Supabase Direct)
const connectionString = "postgresql://postgres:nutrityglobal%232026@db.pxkeyvmolfshembawelw.supabase.co:5432/postgres"
const pool = new pg.Pool({ 
    connectionString,
    ssl: { rejectUnauthorized: false }
})

async function migrate() {
    console.log('🚀 Iniciando migración de Firestore a Supabase...')

    try {
        // 1. Obtener organización maestra
        const orgRes = await pool.query('SELECT id FROM "Organization" WHERE name = \'Nutrity Global Master\' LIMIT 1')
        let orgId = orgRes.rows[0]?.id
        if (!orgId) {
            console.log('⚠️ No se encontró la organización maestra, creándola...')
            const newOrg = await pool.query('INSERT INTO "Organization" (id, name) VALUES (gen_random_uuid(), \'Nutrity Global Master\') RETURNING id')
            orgId = newOrg.rows[0].id
        }
        console.log(`✅ Organización ID: ${orgId}`)

        // 2. Migrar Usuarios
        console.log('👥 Migrando Usuarios...')
        const usersSnapshot = await getDocs(collection(db, "users"));
        for (const doc of usersSnapshot.docs) {
            const data = doc.data();
            const firebaseUid = doc.id;
            await pool.query(`
                INSERT INTO "User" (id, "firebaseUid", email, name, role, plan, "organizationId", "updatedAt")
                VALUES (gen_random_uuid(), $1, $2, $3, $4, $5, $6, NOW())
                ON CONFLICT ("firebaseUid") DO UPDATE 
                SET name = EXCLUDED.name, role = EXCLUDED.role, plan = EXCLUDED.plan
            `, [firebaseUid, data.email, data.name || data.displayName || '', data.role || 'USER', data.plan || 'FREE', orgId]);
        }
        console.log(`✅ ${usersSnapshot.size} usuarios procesados.`);

        // 3. Migrar Evaluaciones
        console.log('📋 Migrando Evaluaciones...')
        const evalsSnapshot = await getDocs(collection(db, "evaluations"));
        for (const doc of evalsSnapshot.docs) {
            const data = doc.data();
            // Buscar ID interno del usuario en Supabase
            const userRes = await pool.query('SELECT id FROM "User" WHERE "firebaseUid" = $1', [data.userId]);
            if (userRes.rows.length > 0) {
                const internalUserId = userRes.rows[0].id;
                await pool.query(`
                    INSERT INTO "Evaluation" (id, "userId", "organizationId", data, results, timestamp)
                    VALUES ($1, $2, $3, $4, $5, $6)
                    ON CONFLICT (id) DO NOTHING
                `, [doc.id.length > 20 ? gen_random_uuid() : doc.id, internalUserId, orgId, JSON.stringify(data.data || {}), JSON.stringify(data.results || {}), data.timestamp?.toDate() || new Date()]);
            }
        }
        console.log(`✅ ${evalsSnapshot.size} evaluaciones procesadas.`);

        // 4. Migrar Citas
        console.log('📅 Migrando Citas...')
        const apptsSnapshot = await getDocs(collection(db, "appointments"));
        for (const doc of apptsSnapshot.docs) {
            const data = doc.data();
            const userRes = await pool.query('SELECT id FROM "User" WHERE "firebaseUid" = $1', [data.userId]);
            if (userRes.rows.length > 0) {
                const internalUserId = userRes.rows[0].id;
                await pool.query(`
                    INSERT INTO "Appointment" (id, "userId", "organizationId", title, date, time, type, status)
                    VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
                    ON CONFLICT (id) DO NOTHING
                `, [doc.id.length > 20 ? gen_random_uuid() : doc.id, internalUserId, orgId, data.title, data.date, data.time, data.type, data.status || 'SCHEDULED']);
            }
        }
        console.log(`✅ ${apptsSnapshot.size} citas procesadas.`);

        // 5. Migrar Mediciones
        console.log('⚖️ Migrando Mediciones...')
        const measSnapshot = await getDocs(collection(db, "measurements"));
        for (const doc of measSnapshot.docs) {
            const data = doc.data();
            const userRes = await pool.query('SELECT id FROM "User" WHERE "firebaseUid" = $1', [data.userId]);
            if (userRes.rows.length > 0) {
                const internalUserId = userRes.rows[0].id;
                await pool.query(`
                    INSERT INTO "Measurement" (id, "userId", "organizationId", label, value, date, time, status)
                    VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
                    ON CONFLICT (id) DO NOTHING
                `, [doc.id.length > 20 ? gen_random_uuid() : doc.id, internalUserId, orgId, data.label, data.value, data.date, data.time, data.status]);
            }
        }
        console.log(`✅ ${measSnapshot.size} mediciones procesadas.`);

        console.log('✨ Migración finalizada con éxito.');
    } catch (err) {
        console.error('❌ Error fatal durante la migración:', err);
    } finally {
        await pool.end();
    }
}

// Función auxiliar para generar UUID si el ID de Firestore es muy largo o inválido para PK de Supabase si es CUID/UUID
function gen_random_uuid() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });
}

migrate();
