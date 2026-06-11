const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function cleanup() {
    try {
        console.log("Eliminando cursos vacíos/duplicados...");
        
        const deletedCourses = await prisma.course.deleteMany({
            where: {
                id: {
                    in: [
                        '072fdd43-76a2-403d-b76d-b38850ea4dfb', // Duplicado Método 50-25-25
                        'aa1fa241-ec24-4c09-9290-638f6e6f0ca3'  // Test Course Local
                    ]
                }
            }
        });
        console.log(`Cursos eliminados: ${deletedCourses.count}`);

        console.log("Eliminando Lección 1 duplicada en Código Vitalidad...");
        const deletedLesson = await prisma.lesson.delete({
            where: {
                id: '09eb9ba5-422c-4273-b20c-9f47b4fbf82a' // La que dice "El control de su salud..." (menos específica)
            }
        });
        console.log(`Lección eliminada: ${deletedLesson.title}`);

    } catch (e) {
        console.error("Error en la limpieza:", e);
    } finally {
        await prisma.$disconnect();
    }
}

cleanup();
