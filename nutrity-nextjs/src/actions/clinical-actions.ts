"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { getServerUser, getInternalId } from "./user-actions";

export async function saveEvaluation(userId: string, organizationId: string | undefined, data: any, results: any) {
    const currentUser = await getServerUser();
    if (!currentUser) throw new Error("Unauthorized");
    
    const internalId = await getInternalId(userId);
    
    if (currentUser.role !== 'ADMIN' && currentUser.id !== internalId) {
        const patient = await prisma.user.findUnique({ where: { id: internalId }});
        if (!['COACH', 'ELITE'].includes(currentUser.role) || patient?.organizationId !== currentUser.organizationId) {
            throw new Error("Forbidden");
        }
    }
    
    const targetOrgId = currentUser.role === 'ADMIN' ? (organizationId || null) : currentUser.organizationId;

    const existingEval = await prisma.evaluation.findFirst({
        where: { userId: internalId }
    });

    if (existingEval) {
        return await prisma.evaluation.update({
            where: { id: existingEval.id },
            data: { data, results, organizationId: targetOrgId }
        });
    } else {
        return await prisma.evaluation.create({
            data: {
                userId: internalId,
                organizationId: targetOrgId,
                data,
                results
            }
        });
    }
}

export async function saveBiologicalDiagnosis(
    userId: string,
    organizationId: string | undefined,
    triaje: {
        mainSymptom: string;
        affectedSystem: string;
        symptomDuration: string;
        emotionalContext: string;
    },
    nmgDiagnosis: {
        conflict: string;
        organ: string;
        phase: string;
        holisticApproach: Array<{ discipline: string; recommendation: string }>;
    }
) {
    const currentUser = await getServerUser();
    if (!currentUser) throw new Error("Unauthorized");
    
    const internalId = await getInternalId(userId);
    
    if (currentUser.role !== 'ADMIN' && currentUser.id !== internalId) {
        const patient = await prisma.user.findUnique({ where: { id: internalId }});
        if (!['COACH', 'ELITE'].includes(currentUser.role) || patient?.organizationId !== currentUser.organizationId) {
            throw new Error("Forbidden");
        }
    }
    
    const targetOrgId = currentUser.role === 'ADMIN' ? (organizationId || null) : currentUser.organizationId;

    const existing = await prisma.biologicalDiagnosis.findFirst({
        where: { userId: internalId }
    });

    const payload = {
        userId: internalId,
        organizationId: targetOrgId,
        mainSymptom: triaje.mainSymptom,
        affectedSystem: triaje.affectedSystem,
        symptomDuration: triaje.symptomDuration,
        emotionalContext: triaje.emotionalContext,
        nmgConflict: nmgDiagnosis.conflict,
        nmgOrgan: nmgDiagnosis.organ,
        phase: nmgDiagnosis.phase,
        holisticApproach: nmgDiagnosis.holisticApproach as any,
        updatedAt: new Date()
    };

    try {
        if (existing) {
            return await prisma.biologicalDiagnosis.update({
                where: { id: existing.id },
                data: payload
            });
        } else {
            return await prisma.biologicalDiagnosis.create({
                data: payload
            });
        }
    } catch(e: any) {
        console.error('[NMG] saveBiologicalDiagnosis error:', {
            userId: internalId,
            error: e.message,
            step: 'upsert BiologicalDiagnosis',
        });
        throw e;
    }
}

export async function getLatestBiologicalDiagnosis(userId: string) {
    const currentUser = await getServerUser();
    if (!currentUser) throw new Error("Unauthorized");

    const internalId = await getInternalId(userId);
    
    const where: any = { userId: internalId };
    if (currentUser.role !== 'ADMIN' && currentUser.id !== internalId) {
        where.organizationId = currentUser.organizationId || null;
    }

    const data = await prisma.biologicalDiagnosis.findFirst({
        where,
        orderBy: { updatedAt: 'desc' }
    });

    return data;
}

export async function getLatestEvaluation(userId: string, organizationId?: string) {
    const currentUser = await getServerUser();
    if (!currentUser) throw new Error("Unauthorized");

    const internalId = await getInternalId(userId);
    
    const where: any = { userId: internalId };
    
    if (currentUser.role !== 'ADMIN' && currentUser.id !== internalId) {
        where.organizationId = currentUser.organizationId || null;
    } else if (organizationId) {
        where.organizationId = organizationId;
    }

    const data = await prisma.evaluation.findFirst({
        where,
        orderBy: { timestamp: 'desc' }
    });

    return data;
}

export async function getMeasurements(userId: string, organizationId?: string) {
    const currentUser = await getServerUser();
    if (!currentUser) throw new Error("Unauthorized");

    const internalId = await getInternalId(userId);
    const where: any = { userId: internalId };
    
    if (currentUser.role !== 'ADMIN' && currentUser.id !== internalId) {
        where.organizationId = currentUser.organizationId || null;
    } else if (organizationId) {
        where.organizationId = organizationId;
    }

    const data = await prisma.measurement.findMany({
        where,
        orderBy: { timestamp: 'desc' }
    });
    
    return data;
}

export async function saveMeasurement(userId: string, organizationId: string | undefined, measurement: any) {
    const currentUser = await getServerUser();
    if (!currentUser) throw new Error("Unauthorized");

    const internalId = await getInternalId(userId);
    
    if (currentUser.role !== 'ADMIN' && currentUser.id !== internalId) {
        const patient = await prisma.user.findUnique({ where: { id: internalId }});
        if (!['COACH', 'ELITE'].includes(currentUser.role) || patient?.organizationId !== currentUser.organizationId) {
            throw new Error("Forbidden");
        }
        organizationId = currentUser.organizationId || undefined;
    }

    const id = measurement.id && measurement.id.length > 20 ? measurement.id : crypto.randomUUID();
    
    const payload = {
        label: measurement.label,
        value: measurement.value,
        date: measurement.date,
        time: measurement.time,
        status: measurement.status,
        userId: internalId,
        organizationId: organizationId || null
    };

    const data = await prisma.measurement.upsert({
        where: { id },
        update: payload,
        create: { ...payload, id }
    });

    return data;
}

export async function getAppointments(userId: string, organizationId?: string, includeDeleted = false) {
    const internalId = await getInternalId(userId);
    
    const where: any = { userId: internalId };
    if (!includeDeleted) where.deletedAt = null;
    if (organizationId) where.organizationId = organizationId;
    
    const data = await prisma.appointment.findMany({
        where,
        orderBy: { date: 'asc' }
    });
    
    return data;
}

export async function saveAppointment(userId: string, organizationId: string | undefined, appointment: any) {
    const internalId = await getInternalId(userId);

    const id = appointment.id && appointment.id.length > 20 ? appointment.id : crypto.randomUUID();
    
    const payload = {
        title: appointment.title,
        date: appointment.date,
        time: appointment.time,
        type: appointment.type,
        status: appointment.status,
        userId: internalId,
        organizationId: organizationId || null
    };

    const data = await prisma.appointment.upsert({
        where: { id },
        update: payload,
        create: { ...payload, id }
    });
    
    return data;
}

export async function getAllAppointments(organizationId?: string, includeDeleted = false) {
    const where: any = {};
    if (!includeDeleted) where.deletedAt = null;
    if (organizationId) where.organizationId = organizationId;
    
    const data = await prisma.appointment.findMany({
        where,
        include: {
            user: { select: { name: true, email: true } }
        },
        orderBy: { date: 'desc' }
    });
    
    return data;
}

export async function updateAppointment(id: string, updates: any) {
    const data = await prisma.appointment.update({
        where: { id },
        data: updates
    });
    return data;
}

export async function deleteAppointment(id: string) {
    await prisma.appointment.update({
        where: { id },
        data: { deletedAt: new Date() }
    });
    return true;
}

export async function restoreAppointment(id: string) {
    const data = await prisma.appointment.update({
        where: { id },
        data: { deletedAt: null }
    });
    revalidatePath('/', 'layout');
    return data;
}

export async function logPDFReport(userId: string, organizationId: string | undefined, status: 'GENERATED' | 'DOWNLOADED' | 'ERROR', errorMessage?: string) {
    const id = crypto.randomUUID();
    
    try {
        const data = await prisma.pDFReportLog.create({
            data: {
                id,
                userId,
                organizationId: organizationId || null,
                status,
                errorMessage,
                timestamp: new Date()
            }
        });
        return data;
    } catch (error) {
        console.error('logPDFReport error:', error);
        return null;
    }
}

export async function getPDFReports(organizationId?: string) {
    const where: any = {};
    if (organizationId) where.organizationId = organizationId;
    
    const data = await prisma.pDFReportLog.findMany({
        where,
        include: {
            user: { select: { name: true, email: true } }
        },
        orderBy: { createdAt: 'desc' }
    });
    return data;
}
