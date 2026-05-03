import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://cfultaogmunkwhnmehpg.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNmdWx0YW9nbXVua3dobm1laHBnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzI0NTQ4MzIsImV4cCI6MjA4ODAzMDgzMn0.fXyJO4wu9knh-95rI7NerD0BJjijH8A72ksxp0c0pgc';
const supabase = createClient(supabaseUrl, supabaseKey);

async function run() {
    const userId = "b07d9d28-75a5-4d1a-88a8-d83d641e8b0a";
    const profileData = {
        name: "Freddy",
        phone: "+59170000000",
        address: "La Paz",
        age: "45",
        occupation: "Ingeniero",
        maritalStatus: "Casado/a",
        socialMedia: "@freddy"
    };

    // Strip email
    const { email, ...safeData } = profileData;

    console.log("Updating with data:", safeData);
    const { data, error } = await supabase
        .from('User')
        .update(safeData)
        .eq('id', userId)
        .select()
        .single();

    console.log("Error:", error);
    console.log("Data:", data);
}

run();
