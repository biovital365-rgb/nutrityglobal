"use server";

import { prisma } from "@/lib/prisma";
import { getSupabaseAdmin } from "@/lib/supabase";
import { organizationScope, requireRole } from "@/lib/authz";

/**
 * Creates a new user in Supabase Auth and Prisma
 * This is used by Coaches to register their own patients
 */
export async function createPatientByCoach(data: { name: string; email: string; phone?: string; age?: string; password?: string }) {
    const coachUser = await requireRole('ADMIN', 'COACH');
    const organizationId = organizationScope(coachUser);
    if (!organizationId) {
        throw new Error("Only users belonging to an organization can create patients.");
    }

    const temporaryPassword = data.password?.trim();
    if (!temporaryPassword || temporaryPassword.length < 12) {
        throw new Error("La contraseña temporal debe tener al menos 12 caracteres.");
    }

    const supabaseAdmin = getSupabaseAdmin();

    // 1. Create the user in Supabase Auth
    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
        email: data.email,
        password: temporaryPassword,
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
                organizationId
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

export async function getAdminDashboardData(organizationId?: string | null, showDeleted = false) {
    const actor = await requireRole('ADMIN', 'COACH');
    const orgIdStr = organizationScope(actor, organizationId);
    
    const { getFoods, getMicronutrients, getPosts, getLandingConfig } = await import("./cms-actions");
    const { getAllUsers } = await import("./user-actions");
    const { getAllAppointments, getPDFReports } = await import("./clinical-actions");
    const { getCourses, getAssignmentSubmissions, getQuizAttempts } = await import("./academic-actions");

    const [
        foods, micros, courses, users, appointments,
        reports, landing, posts, submissions, quizAttempts
    ] = await Promise.all([
        getFoods().catch(() => []),
        getMicronutrients().catch(() => []),
        getCourses(orgIdStr, showDeleted).catch(() => []),
        getAllUsers(orgIdStr, showDeleted).catch(() => []),
        getAllAppointments(orgIdStr, showDeleted).catch(() => []),
        getPDFReports(orgIdStr).catch(() => []),
        getLandingConfig(orgIdStr).catch(() => ({})),
        getPosts(orgIdStr, false).catch(() => []),
        getAssignmentSubmissions(orgIdStr).catch(() => []),
        getQuizAttempts(orgIdStr).catch(() => []),
    ]);

    return {
        foods, micros, courses, users, appointments,
        reports, landing, posts, submissions, quizAttempts
    };
}
