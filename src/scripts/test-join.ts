import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL!;
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY!;

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testJoin() {
    console.log('🧪 Probando consulta con JOIN en Supabase...');
    
    const { data, error } = await supabase
        .from('User')
        .select('*, organization:Organization(*)')
        .limit(1);

    if (error) {
        console.error('❌ Error en la consulta:', error);
    } else {
        console.log('✅ Consulta exitosa:', data);
    }
}

testJoin();
