import { dbService } from "./src/lib/db-service";
import * as dotenv from "dotenv";
dotenv.config();

async function checkUser() {
    const email = "aliendredilan@gmail.com";
    console.log(`Checking user status for ${email}...`);
    try {
        // 1. Buscar el usuario en Supabase por email
        const { data: users, error: userError } = await (dbService as any).supabase
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

        // 2. Buscar evaluaciones para este usuario (usando su id o firebaseUid)
        const { data: evals, error: evalError } = await (dbService as any).supabase
            .from('Evaluation')
            .select('*')
            .or(`userId.eq.${user.id},userId.eq.${user.firebaseUid}`);
        
        console.log(`Found ${evals?.length || 0} evaluations in Supabase.`);
        if (evals && evals.length > 0) {
            console.log("Latest Evaluation:", JSON.stringify(evals[0], null, 2));
        }

    } catch (err) {
        console.error("Error checking user:", err);
    }
}

checkUser();
