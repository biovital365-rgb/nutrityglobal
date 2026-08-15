"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { getInternalId, getServerUser } from "./user-actions";
import { sendMenuApprovedEmail, sendMenuChangesRequestedEmail } from "./email-actions";

export async function saveWeeklyMenu(userId: string, weekStart: string, phase: string, days: Record<string, any>) {
    const internalId = await getInternalId(userId);
    const dayNames = ['lunes', 'martes', 'miercoles', 'jueves', 'viernes', 'sabado', 'domingo'];
    const offsets  = [0, 1, 2, 3, 4, 5, 6];
    const base = new Date(weekStart + 'T12:00:00Z');

    const rows = dayNames.map((dayName, i) => {
        const d = new Date(base);
        d.setUTCDate(base.getUTCDate() + offsets[i]);
        const date = d.toISOString().split('T')[0];
        const dayData = days[dayName] || {};
        return {
            id: crypto.randomUUID(),
            userId: internalId,
            date,
            weekStart,
            phase,
            status: 'PENDING',
            menuData: {
                breakfast:    dayData.breakfast    || '',
                lunch:        dayData.lunch        || '',
                dinner:       dayData.dinner       || '',
                snack:        dayData.snack        || '',
            },
            metabolicGoal: dayData.metabolicGoal || '',
            updatedAt: new Date(),
        };
    });

    // Eliminar semana previa para este usuario si existe (re-generación)
    await prisma.dailyMenu.deleteMany({
        where: { userId: internalId, weekStart }
    });

    const data = await prisma.dailyMenu.createMany({
        data: rows
    });

    return data;
}

export async function getWeeklyMenu(userId: string, weekStart: string) {
    const internalId = await getInternalId(userId);
    const data = await prisma.dailyMenu.findMany({
        where: { userId: internalId, weekStart },
        orderBy: { date: 'asc' }
    });
    return data;
}

export async function getApprovedMenu(userId: string) {
    const internalId = await getInternalId(userId);
    const data = await prisma.dailyMenu.findMany({
        where: { userId: internalId, status: 'APPROVED' },
        orderBy: { weekStart: 'desc' },
        take: 7
    });
    return data;
}

export async function getPendingMenu(userId: string) {
    const internalId = await getInternalId(userId);
    const data = await prisma.dailyMenu.findMany({
        where: { userId: internalId, status: 'PENDING' },
        orderBy: { weekStart: 'desc' },
        take: 7
    });
    return data;
}

export async function approveWeeklyMenu(userId: string, weekStart: string, adminEmail: string, notes?: string) {
    const internalId = await getInternalId(userId);
    const data = await prisma.dailyMenu.updateMany({
        where: { userId: internalId, weekStart },
        data: {
            status: 'APPROVED',
            approvedAt: new Date(),
            approvedBy: adminEmail,
            adminNotes: notes || null,
            updatedAt: new Date(),
        }
    });

    // Disparar email asíncrono
    sendMenuApprovedEmail(internalId).catch(err => console.error('Failed to send approved email', err));

    revalidatePath('/', 'layout');
    return data;
}

export async function rejectWeeklyMenu(userId: string, weekStart: string, adminEmail: string, notes: string) {
    const internalId = await getInternalId(userId);
    const data = await prisma.dailyMenu.updateMany({
        where: { userId: internalId, weekStart },
        data: {
            status: 'REJECTED',
            approvedBy: adminEmail,
            adminNotes: notes,
            updatedAt: new Date(),
        }
    });

    revalidatePath('/', 'layout');
    return data;
}

export async function updateDayMenu(recordId: string, menuData: any, metabolicGoal: string) {
    const data = await prisma.dailyMenu.update({
        where: { id: recordId },
        data: {
            menuData,
            metabolicGoal,
            updatedAt: new Date(),
        }
    });

    revalidatePath('/', 'layout');
    return data;
}

export async function getAllMenusStatus(organizationId?: string) {
    // Note: This replaces the raw query grouping since Prisma doesn't naturally do distinct grouped joins as easily.
    // Instead we query the latest by taking all grouped items. Let's do it in code for simplicity to match legacy behavior.
    const where: any = {};
    
    // We could filter by organizationId via users, but legacy just selected everything then grouped by userId.
    const data = await prisma.dailyMenu.findMany({
        orderBy: { weekStart: 'desc' },
        include: { user: { select: { id: true, name: true, email: true } } }
    });

    const map: Record<string, any> = {};
    for (const row of data) {
        const uid = row.userId;
        if (!map[uid]) {
            map[uid] = {
                userId:      uid,
                userName:    row.user?.name  || 'Sin nombre',
                userEmail:   row.user?.email || '',
                weekStart:   row.weekStart,
                status:      row.status,
                phase:       row.phase,
                approvedAt:  row.approvedAt,
                approvedBy:  row.approvedBy,
            };
        }
    }
    return Object.values(map);
}

export async function saveDailyMenu(params: { userId: string; date: string; menuData: any; metabolicGoal?: string } | string, date?: string, menuData?: any, metabolicGoal?: string) {
    let userId_: string, date_: string, menuData_: any, metabolicGoal_: string | undefined;
    if (typeof params === 'object' && 'userId' in params) {
        userId_ = params.userId; date_ = params.date; menuData_ = params.menuData; metabolicGoal_ = params.metabolicGoal;
    } else {
        userId_ = params as string; date_ = date!; menuData_ = menuData; metabolicGoal_ = metabolicGoal;
    }
    const internalId = await getInternalId(userId_);
    
    const id = crypto.randomUUID();
    
    const payload = {
        userId: internalId,
        date: date_,
        menuData: menuData_,
        metabolicGoal: metabolicGoal_,
        updatedAt: new Date()
    };
    
    // UPSERT
    const data = await prisma.dailyMenu.upsert({
        where: { userId_date: { userId: internalId, date: date_ } },
        update: payload,
        create: { ...payload, id }
    });
    
    return data;
}

export async function getDailyMenu(userId: string, date: string) {
    const internalId = await getInternalId(userId);
    const data = await prisma.dailyMenu.findUnique({
        where: { userId_date: { userId: internalId, date } }
    });

    return data;
}

export async function getDailyMenus(userId: string) {
    const internalId = await getInternalId(userId);
    const data = await prisma.dailyMenu.findMany({
        where: { userId: internalId },
        orderBy: { date: 'desc' }
    });

    return data;
}

export async function requestMenuChanges(userId: string, weekStart: string, notes: string) {
    const currentUser = await getServerUser();
    if (!currentUser || currentUser.id !== userId) throw new Error("Forbidden");

    // Buscamos si existe al menos un día
    const menu = await prisma.dailyMenu.findFirst({
        where: { userId, weekStart }
    });

    if (!menu) {
        throw new Error("Menú no encontrado para esa semana");
    }

    // Actualizamos el estado a CHANGES_REQUESTED para TODOS los días de la semana
    await prisma.dailyMenu.updateMany({
        where: { userId, weekStart },
        data: {
            status: 'CHANGES_REQUESTED',
            adminNotes: notes, 
            updatedAt: new Date(),
        }
    });

    try {
        await sendMenuChangesRequestedEmail(userId, notes);
    } catch (e) {
        console.error('Failed to send menu changes requested email', e);
    }

    return true;
}
