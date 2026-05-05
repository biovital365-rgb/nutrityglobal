import { createClient } from "@supabase/supabase-js";
import * as dotenv from "dotenv";
dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error("Missing Supabase env vars");
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkUser() {
    const email = "aliendredilan@gmail.com";
    console.log(`Checking user status for ${email}...`);
    try {
        const { data: users, error: userError } = await supabase
            .from('User')
            .select('*')
            .eq('email', email);
        
        if (userError) throw userError;
        if (!users || users.length === 0) {
            console.log("User not found in Supabase.");
            return;
        }

        const user = users[0];
        console.log("User found:", JSON.stringify(user, null, 2));

        const { data: evals, error: evalError } = await supabase
            .from('Evaluation')
            .select('*')
            .or(`userId.eq.${user.id},userId.eq.${user.firebaseUid}`);
        
        console.log(`Found ${evals?.length || 0} evaluations in Supabase.`);
        if (evals && evals.length > 0) {
            console.log("Latest Evaluation ID:", evals[0].id);
        }

    } catch (err) {
        console.error("Error checking user:", err);
    }
}

checkUser();
