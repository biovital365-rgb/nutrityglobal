import { NextResponse } from 'next/server';
import { renderToStream } from '@react-pdf/renderer';
import { getServerUser } from '@/actions/db-actions';
import { getUserExpedientData } from '@/lib/reporting/getUserExpedientData';
import { NutrityNativeReport } from '@/components/pdf/NutrityNativeReport';
import React from 'react';

export async function GET(req: Request) {
    try {
        // 1. Verify Session
        const user = await getServerUser();
        if (!user) {
            return new NextResponse('Unauthorized', { status: 401 });
        }

        // 2. Aggregate Data using the decoupled service
        const expedientData = await getUserExpedientData(user.id);

        // 3. Render PDF to stream
        // Note: renderToStream is async and returns a Node.js ReadableStream
        const pdfStream = await renderToStream(
            React.createElement(NutrityNativeReport, { data: expedientData }) as any
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

    } catch (error: any) {
        console.error("[PDF_GENERATION_ERROR]", error);
        return new NextResponse(`Error generating report: ${error.message}`, { status: 500 });
    }
}
