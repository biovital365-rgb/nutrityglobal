import { NextResponse } from 'next/server';
import { prisma } from "@/lib/prisma";
import { getInternalId } from "@/actions/db-actions";

export async function GET(
    request: Request,
    { params }: { params: Promise<{ userId: string, weekStart: string }> }
) {
    try {
        const resolvedParams = await params;
        const internalId = await getInternalId(resolvedParams.userId);
        const weekStart = resolvedParams.weekStart;

        const rows = await prisma.dailyMenu.findMany({
            where: { userId: internalId, weekStart },
            select: { status: true, progress: true }
        });

        if (rows.length === 0) {
            return NextResponse.json({ status: 'NOT_FOUND', progress: 0 });
        }

        const isError = rows.some(r => r.status === 'ERROR_PARTIAL');
        const isDone = rows.every(r => r.status === 'PENDING' || r.status === 'APPROVED');
        
        let totalProgress = 0;
        for (const r of rows) {
            if (r.status === 'PENDING' || r.status === 'APPROVED') {
                totalProgress += 100;
            } else {
                totalProgress += r.progress || 0;
            }
        }
        const avgProgress = Math.round(totalProgress / rows.length);

        let finalStatus = 'PROCESSING';
        if (isError) finalStatus = 'ERROR_PARTIAL';
        else if (isDone) finalStatus = 'COMPLETED';

        return NextResponse.json({
            status: finalStatus,
            progress: avgProgress,
            details: rows
        });

    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
