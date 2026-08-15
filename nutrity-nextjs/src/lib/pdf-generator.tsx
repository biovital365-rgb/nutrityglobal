import React from 'react';
import { renderToStream } from '@react-pdf/renderer';
import { NutrityNativeReport } from '@/components/pdf/NutrityNativeReport';

export async function generatePDFBuffer(data: any): Promise<Buffer> {
    const stream = await renderToStream(<NutrityNativeReport data={data} viewMode="patient" userStatus="ACTIVE" />);
    
    return new Promise((resolve, reject) => {
        const chunks: any[] = [];
        stream.on('data', (chunk) => chunks.push(chunk));
        stream.on('end', () => resolve(Buffer.concat(chunks)));
        stream.on('error', (err) => reject(err));
    });
}
