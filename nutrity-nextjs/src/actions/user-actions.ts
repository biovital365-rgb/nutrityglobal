"use server";

import { prisma } from "@/lib/prisma";
import { createClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";
import { sendWelcomeEmail } from "./email-actions";
import { getAuthenticatedUser, requireRole, requireUser, requireUserAccess } from "@/lib/authz";
import { z } from "zod";

const userProfileUpdateSchema = z.object({
    name: z.string().trim().min(1).max(120).optional(),
    phone: z.string().trim().max(40).nullable().optional(),
    address: z.string().trim().max(240).nullable().optional(),
    age: z.string().trim().max(3).nullable().optional(),
    occupation: z.string().trim().max(120).nullable().optional(),
    maritalStatus: z.string().trim().max(60).nullable().optional(),
    socialMedia: z.string().trim().max(240).nullable().optional(),
}).strict();

const adminUserUpdateSchema = z.object({
    role: z.enum(['USER', 'COACH', 'ADMIN']).optional(),
    plan: z.enum(['FREE', 'BASIC', 'ADVANCED', 'ELITE']).optional(),
    status: z.enum(['ACTIVE', 'BLOCKED', 'OBSERVED']).optional(),
}).strict();

function selectFields(source: Record<string, unknown>, fields: string[]) {
    return Object.fromEntries(
        fields.filter(field => Object.prototype.hasOwnProperty.call(source, field)).map(field => [field, source[field]])
    );
}

export async function getServerUser() {
    return getAuthenticatedUser();
}

// Helper para obtener ID interno desde Firebase UID o el propio ID interno
export async function getInternalId(idOrUid: string): Promise<string> {
    const { target } = await requireUserAccess(idOrUid, { coachAllowed: true });
    return target.id;
}

export async function getUserProfile(firebaseUid?: string) {
    const currentUser = await requireUser();
    const { target } = await requireUserAccess(firebaseUid || currentUser.id, { coachAllowed: true });
    return prisma.user.findUnique({ where: { id: target.id }, include: { organization: true } });
}

export async function updateUserProfile(userId: string, profileData: unknown) {
    const { actor, target } = await requireUserAccess(userId, { coachAllowed: true });
    const internalId = target.id;
    const rawData = z.record(z.string(), z.unknown()).parse(profileData);
    const safeData = userProfileUpdateSchema.parse(selectFields(rawData, [
        'name', 'phone', 'address', 'age', 'occupation', 'maritalStatus', 'socialMedia'
    ]));
    const requestedAdminData = selectFields(rawData, ['role', 'plan', 'status']);
    const adminData = actor.role === 'ADMIN' ? adminUserUpdateSchema.parse(requestedAdminData) : {};
    const updated = await prisma.user.update({
        where: { id: internalId },
        data: { ...safeData, ...adminData, updatedAt: new Date() },
        include: { organization: true }
    });
    revalidatePath('/', 'layout');
    return updated;
}

export async function getAllUsers(organizationIdParam?: string, includeDeleted = false) {
    const currentUser = await requireRole('ADMIN', 'COACH');

    // Si es Elite/Coach y tiene organizationId propio, forzamos que solo vea los suyos.
    // Si no tiene organizationId (SuperAdmin), puede ver todo o filtrar por el parámetro.
    const targetOrgId = currentUser.organizationId || organizationIdParam || null;
    
    const users = await prisma.user.findMany({
        where: {
            deletedAt: includeDeleted ? undefined : null,
            ...(targetOrgId ? { organizationId: targetOrgId } : {})
        },
        include: {
            organization: true,
            evaluations: { select: { results: true }, orderBy: { createdAt: 'desc' }, take: 1 }
        },
        orderBy: { name: 'asc' }
    });

    return users.map((u: any) => ({
        ...u,
        metabolicResults: u.evaluations?.[0]?.results || null
    }));
}

export async function updateUserStatus(userId: string, status: 'ACTIVE' | 'BLOCKED' | 'OBSERVED') {
    await requireRole('ADMIN');

    const updated = await prisma.user.update({
        where: { id: userId },
        data: { status: status as any, updatedAt: new Date() }
    });
    revalidatePath('/', 'layout');
    return updated;
}

export async function deleteUser(userId: string) {
    await requireRole('ADMIN');

    await prisma.user.update({
        where: { id: userId },
        data: { deletedAt: new Date(), status: 'BLOCKED' }
    });
    
    revalidatePath('/', 'layout');
    return true;
}

export async function syncUserProfile(_firebaseUser?: unknown, name?: string) {
    try {
        const supabaseClient = await createClient();
        const { data: { user }, error } = await supabaseClient.auth.getUser();
        if (error || !user?.email) throw new Error("Unauthorized");
        const email = user.email.toLowerCase().trim();

        let profile = await prisma.user.findFirst({
            where: { firebaseUid: user.id, deletedAt: null },
            include: { organization: true }
        });

        if (!profile) {
            const emailProfile = await prisma.user.findFirst({
                where: { email: email, deletedAt: null },
                include: { organization: true }
            });

            if (emailProfile) {
                profile = await prisma.user.update({
                    where: { id: emailProfile.id },
                    data: {
                        firebaseUid: user.id,
                        updatedAt: new Date()
                    },
                    include: { organization: true }
                });
            } else {
                try {
                    profile = await prisma.user.create({
                        data: {
                            id: crypto.randomUUID(),
                            firebaseUid: user.id,
                            email: email,
                            name: name || String(user.user_metadata?.full_name || 'Nuevo Usuario'),
                            role: 'USER',
                            plan: 'FREE',
                            organizationId: null,
                            updatedAt: new Date()
                        },
                        include: { organization: true }
                    });
                    
                    // Disparar correo de bienvenida asincrónicamente sin bloquear el SSR
                    sendWelcomeEmail(email, profile.name || 'Amig@').catch(err => console.error('Failed to send welcome email', err));
                } catch (error: unknown) {
                    if (typeof error === 'object' && error !== null && 'code' in error && error.code === 'P2002') {
                        // Race condition handled: another request already created the user
                        profile = await prisma.user.findFirst({
                            where: { firebaseUid: user.id },
                            include: { organization: true }
                        });
                    } else {
                        throw error;
                    }
                }
            }
        }

        return profile;
    } catch (err) {
        console.error('CRITICAL: syncUserProfile failed:', err);
        return null;
    }
}

export async function restoreUser(id: string) {
    await requireRole('ADMIN');
    const data = await prisma.user.update({
        where: { id },
        data: { deletedAt: null }
    });
    revalidatePath('/', 'layout');
    return data;
}
// --- CLINIC REGISTRATION (B2B SaaS) ---
export async function registerClinic(userId: string, clinicName: string, userName: string) {
    try {
        const { actor, target } = await requireUserAccess(userId);
        if (actor.id !== target.id) throw new Error('Forbidden');
        if (!clinicName.trim()) throw new Error('Clinic name is required');

        const orgId = crypto.randomUUID();
        await prisma.$transaction([
            prisma.organization.create({ data: { id: orgId, name: clinicName.trim() } }),
            prisma.organizationConfig.create({
                data: {
                    organizationId: orgId,
                    primaryColor: '#012a4a',
                    accentColor: '#c19b6c',
                    heroTitle: 'SALUD METABÓLICA',
                    heroSubtitle: 'Acompañamiento educativo y de hábitos'
                }
            }),
            prisma.user.update({
                where: { id: target.id },
                data: { organizationId: orgId, name: userName, role: 'USER' }
            })
        ]);

        return { success: true, organizationId: orgId, paymentRequired: true };
    } catch (error: unknown) {
        console.error('Error registering clinic:', error);
        return { success: false, error: error instanceof Error ? error.message : 'No se pudo registrar la clínica' };
    }
}

