import { NextRequest, NextResponse } from "next/server";
import { getServerUser } from "@/actions/db-actions";
import { verifyLessonAccess, getInternalId } from "@/actions/db-actions";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
    try {
        const { searchParams } = new URL(req.url);
        const lessonId = searchParams.get("lessonId");
        const type = searchParams.get("type"); // "pdf" | "presentation"

        if (!lessonId || !type) {
            return new NextResponse("Faltan parámetros", { status: 400 });
        }

        const currentUser = await getServerUser();
        if (!currentUser) {
            return new NextResponse("No autorizado", { status: 401 });
        }

        const internalId = await getInternalId(currentUser.firebaseUid || currentUser.id);

        try {
            await verifyLessonAccess(internalId, lessonId);
        } catch (e: any) {
            return new NextResponse(e.message || "Acceso denegado a esta lección", { status: 403 });
        }

        const lesson = await prisma.lesson.findUnique({
            where: { id: lessonId }
        });

        if (!lesson) {
            return new NextResponse("Lección no encontrada", { status: 404 });
        }

        const targetUrl = type === "pdf" ? lesson.pdfUrl : lesson.presentationUrl;

        if (!targetUrl) {
            return new NextResponse("Recurso no disponible", { status: 404 });
        }

        return NextResponse.redirect(targetUrl);
    } catch (e: any) {
        console.error("Error en download route:", e);
        return new NextResponse("Error interno del servidor", { status: 500 });
    }
}
