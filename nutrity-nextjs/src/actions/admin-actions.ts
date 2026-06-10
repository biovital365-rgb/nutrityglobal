"use server";

import { createClient } from "@supabase/supabase-js";
import { prisma } from "@/lib/prisma";
import { getServerUser } from "./db-actions";

// Initialize Supabase Admin Client
function getSupabaseAdmin() {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.VITE_SUPABASE_URL;
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !serviceRoleKey) {
        throw new Error("Missing Supabase Admin credentials. Please add SUPABASE_SERVICE_ROLE_KEY to your .env file.");
    }

    return createClient(supabaseUrl, serviceRoleKey, {
        auth: {
            autoRefreshToken: false,
            persistSession: false
        }
    });
}

/**
 * Creates a new user in Supabase Auth and Prisma
 * This is used by Coaches to register their own patients
 */
export async function createPatientByCoach(data: { name: string; email: string; phone?: string; age?: string; password?: string }) {
    const coachUser = await getServerUser();
    
    if (!coachUser || !coachUser.organizationId) {
        throw new Error("Only users belonging to an organization can create patients.");
    }

    const supabaseAdmin = getSupabaseAdmin();

    // 1. Create the user in Supabase Auth
    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
        email: data.email,
        password: data.password || "Nutrity2026*", // Default temporary password if not provided
        email_confirm: true, // Auto confirm since coach is registering them
        user_metadata: {
            name: data.name,
            role: "USER"
        }
    });

    if (authError) {
        console.error("Supabase Admin Auth Error:", authError);
        throw new Error(authError.message);
    }

    if (!authData.user) {
        throw new Error("Failed to create user in Auth.");
    }

    // 2. Create the user in Prisma (Database)
    try {
        const newUser = await prisma.user.create({
            data: {
                id: authData.user.id, // Using the UUID from Supabase
                firebaseUid: authData.user.id,
                email: data.email,
                name: data.name,
                phone: data.phone || "",
                age: data.age || null,
                role: "USER",
                plan: "FREE",
                status: "ACTIVE",
                organizationId: coachUser.organizationId
            }
        });

        return { success: true, user: newUser };
    } catch (dbError) {
        console.error("Database Error creating patient:", dbError);
        // Clean up auth user if DB creation fails
        await supabaseAdmin.auth.admin.deleteUser(authData.user.id);
        throw new Error("Failed to create user profile in database.");
    }
}
