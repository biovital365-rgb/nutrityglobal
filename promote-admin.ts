import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
dotenv.config();

const supabase = createClient(
    process.env.VITE_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
);

async function promoteToAdmin() {
    const emails = ['biovital.365@gmail.com', 'biovital.360@gmail.com'];

    for (const email of emails) {
        console.log(`Promoting ${email} to ADMIN...`);
        const { data, error } = await supabase
            .from('User')
            .update({ role: 'ADMIN', plan: 'ELITE' })
            .eq('email', email)
            .select();

        if (error) {
            console.error(`Error promoting ${email}:`, error);
        } else {
            console.log(`Success! ${email} is now ADMIN.`, data);
        }
    }
}

promoteToAdmin();
