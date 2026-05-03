import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL!;
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY!;

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function check() {
    console.log('🔍 Verificando tablas en Supabase...');
    
    const tables = ['Organization', 'User', 'Measurement', 'Food', 'Micronutrient', 'Course', 'Lesson'];
    
    for (const table of tables) {
        const { error } = await supabase.from(table).select('count', { count: 'exact', head: true });
        if (error) {
            console.error(`❌ Tabla '${table}':`, error.message);
        } else {
            console.log(`✅ Tabla '${table}': EXISTE`);
            
            // Check organizationId column
            if (['User', 'Food', 'Micronutrient'].includes(table)) {
                const { error: colError } = await supabase.from(table).select('organizationId').limit(1);
                if (colError) {
                    console.error(`  ⚠️  Columna 'organizationId' en ${table}: NO ENCONTRADA (${colError.message})`);
                } else {
                    console.log(`  ✅ Columna 'organizationId' en ${table}: EXISTE`);
                }
            }
        }
    }
}

check();
