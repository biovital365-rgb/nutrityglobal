"use server";

import { prisma } from "@/lib/prisma";
import { createClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";
import { sendWelcomeEmail } from "./email-actions";

const ADMIN_EMAILS = [
    'biovital.365@gmail.com',
    'biovital.360@gmail.com',
    'admin@nutrity.global',
    'apexdigital70@gmail.com'
];

// Cache para IDs de usuario para acelerar la carga (30s -> <2s)
const userIdCache: Record<string, string> = {};

export async function getServerUser() {
    const supabaseClient = await createClient();
    const { data: { user } } = await supabaseClient.auth.getUser();
    if (!user) return null;
    return await prisma.user.findFirst({
        where: { 
            OR: [
                { firebaseUid: user.id }, 
                { email: user.email! }
            ] 
        },
        include: { organization: true }
    });
}

// Helper para obtener ID interno desde Firebase UID o el propio ID interno
export async function getInternalId(idOrUid: string): Promise<string> {
    if (!idOrUid) return idOrUid;
    
    if (idOrUid.startsWith('c') && idOrUid.length > 20 && !idOrUid.includes('-')) {
        return idOrUid; // CUID de Prisma
    }

    if (userIdCache[idOrUid]) return userIdCache[idOrUid];
    
    const data = await prisma.user.findFirst({
        where: { firebaseUid: idOrUid },
        select: { id: true }
    });
        
    if (data) {
        userIdCache[idOrUid] = data.id;
        return data.id;
    }
    
    return idOrUid;
}

export async function getUserProfile(firebaseUid?: string) {
    const currentUser = await getServerUser();
    if (!currentUser) return null;
    
    const targetUid = firebaseUid || currentUser.firebaseUid;
    if (currentUser.role !== 'ADMIN' && targetUid !== currentUser.firebaseUid) {
        return null;
    }

    return await prisma.user.findFirst({
        where: { firebaseUid: targetUid as string, deletedAt: null },
        include: { organization: true }
    });
}

export async function updateUserProfile(userId: string, profileData: any) {
    const currentUser = await getServerUser();
    if (!currentUser) throw new Error("Unauthorized");
    
    const internalId = await getInternalId(userId);
    if (currentUser.role !== 'ADMIN' && currentUser.id !== internalId) {
        throw new Error("Forbidden");
    }

    const { email, ...safeData } = profileData;
    const updated = await prisma.user.update({
        where: { id: internalId },
        data: { ...safeData, updatedAt: new Date() },
        include: { organization: true }
    });
    revalidatePath('/', 'layout');
    return updated;
}

export async function getAllUsers(organizationIdParam?: string, includeDeleted = false) {
    const currentUser = await getServerUser();
    if (!currentUser || !['ADMIN', 'COACH'].includes(currentUser.role)) throw new Error("Forbidden");

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
    const currentUser = await getServerUser();
    if (!currentUser || currentUser.role !== 'ADMIN') throw new Error("Forbidden");

    const updated = await prisma.user.update({
        where: { id: userId },
        data: { status: status as any, updatedAt: new Date() }
    });
    revalidatePath('/', 'layout');
    return updated;
}

export async function deleteUser(userId: string) {
    const currentUser = await getServerUser();
    if (!currentUser || currentUser.role !== 'ADMIN') throw new Error("Forbidden");

    await prisma.user.update({
        where: { id: userId },
        data: { deletedAt: new Date(), status: 'BLOCKED' }
    });
    
    revalidatePath('/', 'layout');
    return true;
}

export async function syncUserProfile(firebaseUser: any, name?: string, organizationId?: string) {
    try {
        const email = (firebaseUser.email || '').toLowerCase().trim();
        const isAdminEmail = ADMIN_EMAILS.includes(email);

        let profile = await prisma.user.findFirst({
            where: { firebaseUid: firebaseUser.uid, deletedAt: null },
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
                        firebaseUid: firebaseUser.uid,
                        role: isAdminEmail ? 'ADMIN' : (emailProfile.role || 'USER'),
                        plan: isAdminEmail ? 'ELITE' : (emailProfile.plan || 'FREE'),
                        updatedAt: new Date()
                    },
                    include: { organization: true }
                });
            } else {
                try {
                    profile = await prisma.user.create({
                        data: {
                            id: crypto.randomUUID(),
                            firebaseUid: firebaseUser.uid,
                            email: email,
                            name: name || firebaseUser.displayName || 'Nuevo Usuario',
                            role: isAdminEmail ? 'ADMIN' : 'USER',
                            plan: isAdminEmail ? 'ELITE' : 'FREE',
                            organizationId: organizationId || null,
                            updatedAt: new Date()
                        },
                        include: { organization: true }
                    });
                    
                    // Disparar correo de bienvenida asincrónicamente sin bloquear el SSR
                    sendWelcomeEmail(email, profile.name || 'Amig@').catch(err => console.error('Failed to send welcome email', err));
                } catch (e: any) {
                    if (e.code === 'P2002') {
                        // Race condition handled: another request already created the user
                        profile = await prisma.user.findFirst({
                            where: { firebaseUid: firebaseUser.uid },
                            include: { organization: true }
                        });
                    } else {
                        throw e;
                    }
                }
            }
        } else if (isAdminEmail && (profile.role !== 'ADMIN' || profile.plan !== 'ELITE')) {
            profile = await prisma.user.update({
                where: { id: profile.id },
                data: { role: 'ADMIN', plan: 'ELITE' },
                include: { organization: true }
            });
        }

        return profile;
    } catch (err) {
        console.error('CRITICAL: syncUserProfile failed:', err);
        return null;
    }
}

export async function restoreUser(id: string) {
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
        // 1. Crear OrganizaciÃ³n
        const orgId = crypto.randomUUID();
        const org = await prisma.organization.create({
            data: {
                id: orgId,
                name: clinicName
            }
        });

        // 2. ConfiguraciÃ³n por defecto
        await prisma.organizationConfig.create({
            data: {
                organizationId: orgId,
                primaryColor: '#012a4a',
                accentColor: '#c19b6c',
                heroTitle: 'REMISIÃ“N METABÃ“LICA',
                heroSubtitle: 'De la Diabetes Tipo 2'
            }
        });

        // 3. Actualizar Usuario
        await prisma.user.upsert({
            where: { id: userId },
            update: {
                role: 'COACH',
                organizationId: orgId,
                name: userName
            },
            create: {
                id: userId,
                email: '', // Placeholder, idealmente se pasa
                role: 'COACH',
                organizationId: orgId,
                name: userName
            }
        });

        return { success: true, organizationId: orgId };
    } catch (e: any) {
        console.error('Error registering clinic:', e);
        return { success: false, error: e.message };
    }
}

