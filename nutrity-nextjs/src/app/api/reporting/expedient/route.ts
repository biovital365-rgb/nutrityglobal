import { NextResponse } from 'next/server';
import { renderToStream } from '@react-pdf/renderer';
import { getServerUser } from '@/actions/db-actions';
import { getUserExpedientData } from '@/lib/reporting/getUserExpedientData';
import { NutrityNativeReport } from '@/components/pdf/NutrityNativeReport';
import React from 'react';
import { prisma } from '@/lib/prisma';

export async function GET(req: Request) {
    try {
        // 1. Verify Session
        const user = await getServerUser();
        if (!user) {
            return new NextResponse('Unauthorized', { status: 401 });
        }

        // 1b. Check generated report count
        const generatedCount = await prisma.pDFReportLog.count({
            where: { userId: user.id }
        });

        // 1c. Verify Plan and Status
        if (user.status !== 'ACTIVE') {
            return new NextResponse('User account is not active', { status: 403 });
        }
        
        const plan = (user.plan || 'FREE').toUpperCase();
        const isAdminOrCoach = user.role === 'ADMIN' || user.role === 'COACH' || user.role === 'SUPERADMIN';
        
        // Determine View Mode and Limits
        let viewMode: 'patient' | 'coach' | 'partial' = 'patient';
        
        if (isAdminOrCoach) {
            viewMode = 'coach';
            // Determine View Mode by URL override
            const url = new URL(req.url);
            if (url.searchParams.get('view') === 'patient') {
                viewMode = 'patient';
            }
        } else if (plan === 'FREE') {
            if (generatedCount >= 1) {
                return new NextResponse('Has alcanzado el límite de reportes para el plan Gratuito.', { status: 403 });
            }
            viewMode = 'partial';
        } else if (plan === 'BASIC') {
            if (generatedCount >= 4) {
                return new NextResponse('Has alcanzado el límite de 4 reportes de tu plan Básico.', { status: 403 });
            }
        }
        // PREMIUM and ELITE are unlimited, viewMode = 'patient'


        // 2. Aggregate Data using the decoupled service
        const expedientData = await getUserExpedientData(user.id);

        // 3. Render PDF to stream
        // Note: renderToStream is async and returns a Node.js ReadableStream
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const pdfStream = await renderToStream(
            React.createElement(NutrityNativeReport, { data: expedientData, viewMode, userStatus: user.status }) as any
        );

        // Convert Node.js ReadableStream to Web ReadableStream for Next.js App Router
        const stream = new ReadableStream({
            start(controller) {
                pdfStream.on('data', (chunk) => controller.enqueue(chunk));
                pdfStream.on('end', () => controller.close());
                pdfStream.on('error', (err) => controller.error(err));
            }
        });

        // 4. Return as a file download
        return new NextResponse(stream, {
            headers: {
                'Content-Type': 'application/pdf',
                'Content-Disposition': `attachment; filename="Expediente_Nutrity_${user.id.slice(-6)}.pdf"`
            }
        });

    } catch (error: unknown) {
        console.error("[PDF_GENERATION_ERROR]", error);
        const errMessage = error instanceof Error ? error.message : "Unknown error";
        return new NextResponse(`Error generating report: ${errMessage}`, { status: 500 });
    }
}
