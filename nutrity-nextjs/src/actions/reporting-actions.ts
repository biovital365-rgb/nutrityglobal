"use server";

import { getUserExpedientData } from "@/lib/reporting/getUserExpedientData";
import { generatePDFBuffer } from "@/lib/pdf-generator";
import { getSupabaseAdmin } from "@/lib/supabase";
import { prisma } from "@/lib/prisma";
import { requireUser, requireUserAccess } from "@/lib/authz";

export async function generatePatientPDFReport(patientId?: string) {
    try {
        // 1. Validar sesión
        const user = await requireUser();
        const { target } = await requireUserAccess(patientId || user.id, { coachAllowed: true });
        const targetUserId = target.id;

        // 2. Obtener datos
        const data = await getUserExpedientData(targetUserId);

        // 3. Generar PDF Buffer
        const pdfBuffer = await generatePDFBuffer(data);

        // 4. Subir a Supabase Storage
        const fileName = `report_${targetUserId}_${Date.now()}.pdf`;
        
        const supabaseAdmin = getSupabaseAdmin();
        const { data: uploadData, error: uploadError } = await supabaseAdmin
            .storage
            .from('pdf-reports')
            .upload(fileName, pdfBuffer, {
                contentType: 'application/pdf',
                upsert: false
            });

        if (uploadError) {
            console.error("Error uploading PDF:", uploadError);
            throw new Error("Failed to upload PDF");
        }

        // 5. Crear Signed URL
        const { data: signedUrlData, error: signedUrlError } = await supabaseAdmin
            .storage
            .from('pdf-reports')
            .createSignedUrl(fileName, 3600); // 1 hour

        if (signedUrlError || !signedUrlData) {
            console.error("Error generating signed URL:", signedUrlError);
            throw new Error("Failed to generate signed URL");
        }

        // 6. Registrar en Prisma
        await prisma.pDFReportLog.create({
            data: {
                userId: targetUserId,
                organizationId: target.organizationId,
                status: "GENERATED"
            }
        });

        return { success: true, url: signedUrlData.signedUrl };
    } catch (error: unknown) {
        console.error("Error generating PDF:", error);
        return { success: false, error: error instanceof Error ? error.message : "Failed to generate report" };
    }
}
