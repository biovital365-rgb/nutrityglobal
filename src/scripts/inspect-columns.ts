import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL!;
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function inspectSchema() {
    const tables = ['User', 'Organization', 'Measurement', 'Evaluation', 'Food', 'Micronutrient', 'Course', 'Appointment', 'PDFReportLog'];
    console.log('🔍 Inspecting table columns...');

    for (const table of tables) {
        // Try to get one record to see columns
        const { data, error } = await supabase.from(table).select('*').limit(1);
        if (error) {
            console.error(`❌ Table '${table}' error:`, error.message);
        } else {
            const columns = data && data[0] ? Object.keys(data[0]) : 'Empty table (cannot detect columns)';
            console.log(`✅ Table '${table}':`, columns);
        }
    }
}

inspectSchema();
