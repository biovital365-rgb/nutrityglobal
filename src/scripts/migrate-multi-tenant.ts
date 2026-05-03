import { createClient } from '@supabase/supabase-js';
import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs, updateDoc, doc, query, where } from 'firebase/firestore';
import * as dotenv from 'dotenv';
import path from 'path';

// Cargar variables de entorno
dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL!;
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY!;
const databaseUrl = process.env.DATABASE_URL!;

const firebaseConfig = {
    apiKey: process.env.VITE_FIREBASE_API_KEY,
    authDomain: process.env.VITE_FIREBASE_AUTH_DOMAIN,
    projectId: process.env.VITE_FIREBASE_PROJECT_ID,
    storageBucket: process.env.VITE_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.VITE_FIREBASE_APP_ID,
};

// Inicializar Clientes
const supabase = createClient(supabaseUrl, supabaseAnonKey);
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function migrate() {
    console.log('🚀 Iniciando migración multi-tenant...');

    // 1. Obtener mapeo de Usuarios -> Organizaciones desde Supabase
    const { data: users, error: userError } = await supabase
        .from('User')
        .select('id, firebaseUid, organizationId');

    if (userError) {
        console.error('❌ Error al obtener usuarios:', userError);
        return;
    }

    const userOrgMap = new Map<string, string>(); // prismaId -> orgId
    const firebaseUserOrgMap = new Map<string, string>(); // firebaseUid -> orgId

    users.forEach(u => {
        if (u.organizationId) {
            userOrgMap.set(u.id, u.organizationId);
            if (u.firebaseUid) firebaseUserOrgMap.set(u.firebaseUid, u.organizationId);
        }
    });

    console.log(`📊 Mapeo cargado: ${userOrgMap.size} usuarios con organización.`);

    // 2. Migrar Supabase (PostgreSQL)
    const supabaseTables = ['Measurement', 'Appointment', 'Evaluation', 'Enrollment'];
    
    for (const table of supabaseTables) {
        console.log(`\n📦 Procesando tabla Supabase: ${table}...`);
        const { data: records, error: recError } = await supabase.from(table).select('id, userId').is('organizationId', null);

        if (recError) {
            console.error(`❌ Error en tabla ${table}:`, recError);
            continue;
        }

        let updatedCount = 0;
        for (const record of records) {
            const orgId = userOrgMap.get(record.userId);
            if (orgId) {
                const { error: upError } = await supabase
                    .from(table)
                    .update({ organizationId: orgId })
                    .eq('id', record.id);
                
                if (!upError) updatedCount++;
            }
        }
        console.log(`✅ ${updatedCount} registros actualizados en ${table}.`);
    }

    // 3. Migrar Firestore (Firebase)
    const firestoreCollections = ['measurements', 'appointments', 'evaluations'];

    for (const colName of firestoreCollections) {
        console.log(`\n🔥 Procesando colección Firestore: ${colName}...`);
        const q = query(collection(db, colName)); // Nota: No podemos filtrar por null fácilmente en Firestore si el campo no existe
        const snapshot = await getDocs(q);

        let updatedCount = 0;
        let skippedCount = 0;

        for (const fireDoc of snapshot.docs) {
            const data = fireDoc.data();
            if (data.organizationId) {
                skippedCount++;
                continue;
            }

            const orgId = firebaseUserOrgMap.get(data.userId);
            if (orgId) {
                await updateDoc(doc(db, colName, fireDoc.id), {
                    organizationId: orgId
                });
                updatedCount++;
            }
        }
        console.log(`✅ ${updatedCount} documentos actualizados en ${colName} (Omitidos: ${skippedCount}).`);
    }

    console.log('\n🏁 Migración finalizada con éxito.');
}

migrate().catch(err => {
    console.error('💥 Error crítico en la migración:', err);
});
