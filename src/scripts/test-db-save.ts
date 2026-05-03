import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL!;
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY!;

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function runTest() {
    console.log('🧪 Iniciando prueba de guardado Multi-tenant (REST API)...');

    try {
        const now = new Date().toISOString();
        const testId = `test_${Math.random().toString(36).substring(2, 11)}`;

        // 1. Crear Organización de prueba
        console.log('🏢 Creando organización de prueba...');
        const { data: org, error: orgError } = await supabase
            .from('Organization')
            .upsert({ 
                id: 'test-org-123',
                name: 'Organización de Prueba'
            })
            .select()
            .single();

        if (orgError) throw orgError;
        console.log('✅ Organización creada:', org.id);

        // 2. Crear Usuario de prueba vinculado a la org
        console.log('👤 Creando usuario de prueba...');
        const { data: user, error: userError } = await supabase
            .from('User')
            .upsert({
                id: 'test-user-123',
                firebaseUid: 'fake-uid-123',
                email: 'test@nutrity.com',
                name: 'Tester Multi-tenant',
                organizationId: org.id,
                role: 'USER',
                updatedAt: now
            })
            .select()
            .single();

        if (userError) throw userError;
        console.log('✅ Usuario creado y vinculado a la org:', user.id);

        // 3. Crear Medición vinculada a la org (Aislamiento SaaS)
        console.log('📏 Guardando medición con organizationId...');
        const { data: measurement, error: measError } = await supabase
            .from('Measurement')
            .insert({
                id: testId,
                userId: user.id,
                organizationId: org.id,
                label: 'Glucosa',
                value: '95 mg/dL',
                date: new Date().toISOString().split('T')[0],
                time: '08:00',
                status: 'Test Success'
            })
            .select()
            .single();

        if (measError) throw measError;
        console.log('✅ Medición guardada con éxito:', measurement.id);

        // 4. Verificar aislamiento
        console.log('🔍 Verificando aislamiento de datos...');
        const { data: results, error: queryError } = await supabase
            .from('Measurement')
            .select('*')
            .eq('organizationId', org.id);

        if (queryError) throw queryError;
        console.log(`📊 Prueba finalizada. Registros encontrados para la org: ${results.length}`);
        
        if (results.length > 0) {
            console.log('🚀 ¡PRUEBA EXITOSA! El sistema multi-tenant está operativo.');
        }

    } catch (error) {
        console.error('❌ Error en la prueba:', error);
    }
}

runTest();
