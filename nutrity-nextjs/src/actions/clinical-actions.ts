"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { organizationScope, requireOrganizationResource, requireRole, requireUserAccess } from "@/lib/authz";
import type { Prisma } from "@prisma/client";
import { z } from "zod";

const measurementSchema = z.object({
    id: z.string().min(20).max(80).optional(),
    label: z.enum(["Glucosa", "Peso", "A1c"]),
    value: z.string().trim().min(1).max(40).regex(/^\d+(?:[.,]\d+)?\s(?:mg\/dL|kg|%)$/),
    date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
    time: z.string().regex(/^\d{2}:\d{2}$/),
    status: z.literal("Registrado"),
}).strict();

export async function saveEvaluation(userId: string, organizationId: string | undefined, data: any, results: any) {
    const { actor, target } = await requireUserAccess(userId, { coachAllowed: true });
    const internalId = target.id;
    const targetOrgId = actor.role === 'ADMIN' ? (organizationId || target.organizationId) : target.organizationId;

    if (data?.privacyConsent !== true) throw new Error('Privacy consent required');
    const consentedData = {
        ...data,
        privacyConsent: { accepted: true, version: '1.0', recordedAt: new Date().toISOString() },
    };

    const existingEval = await prisma.evaluation.findFirst({
        where: { userId: internalId }
    });

    if (existingEval) {
        return await prisma.evaluation.update({
            where: { id: existingEval.id },
            data: { data: consentedData, results, organizationId: targetOrgId }
        });
    } else {
        return await prisma.evaluation.create({
            data: {
                userId: internalId,
                organizationId: targetOrgId,
                data: consentedData,
                results
            }
        });
    }
}

export async function getLatestEvaluation(userId: string, organizationId?: string) {
    const { actor, target } = await requireUserAccess(userId, { coachAllowed: true });
    const where: any = { userId: target.id };
    if (actor.role === 'ADMIN' && organizationId) where.organizationId = organizationId;

    const data = await prisma.evaluation.findFirst({
        where,
        orderBy: { timestamp: 'desc' }
    });

    return data;
}

export async function updateRouteAction(userId: string, actionId: string, completed: boolean) {
    const { target } = await requireUserAccess(userId);
    const evaluation = await prisma.evaluation.findFirst({
        where: { userId: target.id },
        orderBy: { timestamp: 'desc' },
    });
    if (!evaluation || !evaluation.results || typeof evaluation.results !== 'object') throw new Error('Ruta Nutrity no encontrada');

    const results = evaluation.results as Record<string, unknown>;
    if (!Array.isArray(results.weeklyActions)) throw new Error('La evaluación no contiene una Ruta Nutrity vigente');
    const weeklyActions = results.weeklyActions.map(item => {
        if (!item || typeof item !== 'object') return item;
        const action = item as Record<string, unknown>;
        return action.id === actionId ? { ...action, completed } : action;
    });
    const nextResults = { ...results, weeklyActions, updatedAt: new Date().toISOString() } as Prisma.InputJsonValue;
    await prisma.evaluation.update({ where: { id: evaluation.id }, data: { results: nextResults } });
    revalidatePath('/dashboard');
    return nextResults;
}

export async function getMeasurements(userId: string, organizationId?: string) {
    const { actor, target } = await requireUserAccess(userId, { coachAllowed: true });
    const where: any = { userId: target.id };
    if (actor.role === 'ADMIN' && organizationId) where.organizationId = organizationId;

    const data = await prisma.measurement.findMany({
        where,
        orderBy: { timestamp: 'desc' }
    });
    
    return data;
}

export async function saveMeasurement(userId: string, organizationId: string | undefined, measurement: unknown) {
    const { actor, target } = await requireUserAccess(userId, { coachAllowed: true });
    const internalId = target.id;
    organizationId = actor.role === 'ADMIN' ? organizationId : (target.organizationId || undefined);
    const safeMeasurement = measurementSchema.parse(measurement);

    const id = safeMeasurement.id || crypto.randomUUID();
    if (safeMeasurement.id) {
        const existing = await prisma.measurement.findUnique({ where: { id }, select: { userId: true } });
        if (!existing || existing.userId !== internalId) throw new Error('Forbidden');
    }
    
    const payload = {
        label: safeMeasurement.label,
        value: safeMeasurement.value,
        date: safeMeasurement.date,
        time: safeMeasurement.time,
        status: safeMeasurement.status,
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
    const { actor, target } = await requireUserAccess(userId, { coachAllowed: true });
    const internalId = target.id;
    
    const where: any = { userId: internalId };
    if (!includeDeleted) where.deletedAt = null;
    if (actor.role === 'ADMIN' && organizationId) where.organizationId = organizationId;
    
    const data = await prisma.appointment.findMany({
        where,
        orderBy: { date: 'asc' }
    });
    
    return data;
}

export async function saveAppointment(userId: string, organizationId: string | undefined, appointment: any) {
    const { actor, target } = await requireUserAccess(userId, { coachAllowed: true });
    const internalId = target.id;
    organizationId = actor.role === 'ADMIN' ? organizationId : (target.organizationId || undefined);

    const id = appointment.id && appointment.id.length > 20 ? appointment.id : crypto.randomUUID();
    if (appointment.id) {
        const existing = await prisma.appointment.findUnique({ where: { id }, select: { userId: true } });
        if (!existing || existing.userId !== internalId) throw new Error('Forbidden');
    }
    
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
    const actor = await requireRole('ADMIN', 'COACH');
    const scopedOrg = organizationScope(actor, organizationId);
    const where: any = scopedOrg ? { organizationId: scopedOrg } : {};
    if (!includeDeleted) where.deletedAt = null;
    
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
    const existing = await prisma.appointment.findUnique({ where: { id }, select: { userId: true } });
    if (!existing) throw new Error('Appointment not found');
    await requireUserAccess(existing.userId, { coachAllowed: true });
    const data = await prisma.appointment.update({
        where: { id },
        data: {
            title: updates.title,
            date: updates.date,
            time: updates.time,
            type: updates.type,
            status: updates.status,
        }
    });
    return data;
}

export async function deleteAppointment(id: string) {
    const existing = await prisma.appointment.findUnique({ where: { id }, select: { userId: true } });
    if (!existing) throw new Error('Appointment not found');
    await requireUserAccess(existing.userId, { coachAllowed: true });
    await prisma.appointment.update({
        where: { id },
        data: { deletedAt: new Date() }
    });
    return true;
}

export async function restoreAppointment(id: string) {
    const existing = await prisma.appointment.findUnique({ where: { id }, select: { organizationId: true } });
    if (!existing) throw new Error('Appointment not found');
    await requireOrganizationResource(existing.organizationId);
    const data = await prisma.appointment.update({
        where: { id },
        data: { deletedAt: null }
    });
    revalidatePath('/', 'layout');
    return data;
}

export async function logPDFReport(userId: string, organizationId: string | undefined, status: 'GENERATED' | 'DOWNLOADED' | 'ERROR', errorMessage?: string) {
    const { actor, target } = await requireUserAccess(userId, { coachAllowed: true });
    userId = target.id;
    organizationId = actor.role === 'ADMIN' ? organizationId : (target.organizationId || undefined);
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
    const actor = await requireRole('ADMIN', 'COACH');
    const scopedOrg = organizationScope(actor, organizationId);
    const where: any = scopedOrg ? { organizationId: scopedOrg } : {};
    
    const data = await prisma.pDFReportLog.findMany({
        where,
        include: {
            user: { select: { name: true, email: true } }
        },
        orderBy: { createdAt: 'desc' }
    });
    return data;
}
