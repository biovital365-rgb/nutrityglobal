import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://cfultaogmunkwhnmehpg.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNmdWx0YW9nbXVua3dobm1laHBnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzI0NTQ4MzIsImV4cCI6MjA4ODAzMDgzMn0.fXyJO4wu9knh-95rI7NerD0BJjijH8A72ksxp0c0pgc';
const supabase = createClient(supabaseUrl, supabaseKey);

async function run() {
    const payload = {
        id: `food_${Math.random().toString(36).substring(2, 11)}`,
        name: 'Test Food',
        scientificName: 'Testus Foodus',
        image: '',
        category: 'test',
        description: '',
        metabolicBenefits: [],
        nutrients: { protein: '0g', fiber: '0g', sugar: '0g' },
        recipes: []
    };

    const { data, error } = await supabase
        .from('Food')
        .upsert(payload)
        .select()
        .single();

    console.log("Error:", error);
    console.log("Data:", data);
}

run();
