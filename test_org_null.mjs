import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://cfultaogmunkwhnmehpg.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNmdWx0YW9nbXVua3dobm1laHBnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzI0NTQ4MzIsImV4cCI6MjA4ODAzMDgzMn0.fXyJO4wu9knh-95rI7NerD0BJjijH8A72ksxp0c0pgc';
const supabase = createClient(supabaseUrl, supabaseKey);

async function run() {
    const { data, error } = await supabase
        .from('User')
        .select('*, organization:Organization(*)')
        .is('organizationId', null);

    console.log("Error:", error);
    console.log("Data total users with no org:", data?.length);
    console.log("Data:", data);
}

run();
