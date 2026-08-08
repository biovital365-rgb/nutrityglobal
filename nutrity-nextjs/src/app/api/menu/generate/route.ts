import { NextResponse } from 'next/server';
import { waitUntil } from '@vercel/functions';
import { prisma } from "@/lib/prisma";
import { getInternalId, getServerUser } from "@/actions/db-actions";
import { generateSingleDayMenu } from "@/lib/ai-service";

async function processMenuInBackground(internalId: string, phase: string, weekStartStr: string, promptContext: string, rows: any[]) {
    try {
        const weekdays = ['lunes', 'martes', 'miercoles', 'jueves', 'viernes', 'sabado', 'domingo'];
        
        for (let i = 0; i < 7; i++) {
            const row = rows[i];
            const dayName = weekdays[i];
            
            try {
                // Generar menú para este día (con backoff interno)
                const menuResult = await generateSingleDayMenu(promptContext, dayName, "");
                
                // Actualizar el progreso (14% por día aprox)
                const progress = Math.round(((i + 1) / 7) * 100);
                
                await prisma.dailyMenu.update({
                    where: { id: row.id },
                    data: {
                        menuData: menuResult,
                        metabolicGoal: menuResult.metabolicGoal || '',
                        status: i === 6 ? 'PENDING' : 'PROCESSING', 
                        progress: progress,
                        updatedAt: new Date()
                    }
                });
            } catch (dayError) {
                console.error(`[Background Task] Error en el día ${dayName}:`, dayError);
                await prisma.dailyMenu.update({
                    where: { id: row.id },
                    data: { status: 'ERROR_PARTIAL', updatedAt: new Date() }
                });
            }
        }
        
        // Final update for all non-error rows to PENDING
        await prisma.dailyMenu.updateMany({
            where: { userId: internalId, weekStart: weekStartStr, status: 'PROCESSING' },
            data: { status: 'PENDING', progress: 100, updatedAt: new Date() }
        });

    } catch (error) {
        console.error("[Background Task] Error global procesando menú:", error);
    }
}

export async function POST(request: Request) {
    try {
        const { userId, phase } = await request.json();
        if (!userId || !phase) {
            return NextResponse.json({ error: "Faltan parámetros" }, { status: 400 });
        }

        const internalId = await getInternalId(userId);

        const user = await prisma.user.findUnique({
            where: { id: internalId },
            include: { evaluations: { take: 1, orderBy: { createdAt: 'desc' } } }
        });

        if (!user) return NextResponse.json({ error: "Usuario no encontrado" }, { status: 404 });

        // Bypass plan check if caller is an admin or coach
        const currentUser = await getServerUser();
        const isAdminOrCoach = currentUser?.role === 'ADMIN' || currentUser?.role === 'COACH';
        
        if (!isAdminOrCoach && user.plan === 'FREE') {
            return NextResponse.json({ error: "Requiere plan superior" }, { status: 403 });
        }

        // Identificador del lote
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        const weekStartStr = tomorrow.toISOString().split("T")[0];

        // Limpiar previos
        await prisma.dailyMenu.deleteMany({
            where: { userId: internalId, weekStart: weekStartStr }
        });

        // Preparar filas iniciales
        const rows = [];
        for (let i = 0; i < 7; i++) {
            const d = new Date(tomorrow);
            d.setDate(d.getDate() + i);
            rows.push({
                id: crypto.randomUUID(),
                userId: internalId,
                organizationId: user.organizationId,
                date: d.toISOString().split('T')[0],
                weekStart: weekStartStr,
                phase: phase,
                status: 'PROCESSING',
                progress: 0,
                menuData: {},
                metabolicGoal: '',
                updatedAt: new Date()
            });
        }

        await prisma.dailyMenu.createMany({ data: rows });

        const metabolicPlan = user.evaluations?.[0]?.results as any || null;
        let promptContext = `Paciente: ${user.name || "Nutrity"} (Edad: ${user.age || "N/A"})\nFase: ${phase}\n`;
        if (metabolicPlan) {
            promptContext += `Meta: ${metabolicPlan.meta}\nSuperfoods: ${metabolicPlan.superfoods?.join(", ")}\n`;
        }

        waitUntil(processMenuInBackground(internalId, phase, weekStartStr, promptContext, rows));

        return NextResponse.json({ 
            success: true, 
            weekStart: weekStartStr, 
            message: "Generación asíncrona iniciada (HTTP 202)" 
        }, { status: 202 });

    } catch (error: any) {
        console.error("Generate API Error:", error);
        return NextResponse.json({ error: error.message || "Error interno" }, { status: 500 });
    }
}
