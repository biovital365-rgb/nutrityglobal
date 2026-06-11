const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function auditCourses() {
    try {
        const courses = await prisma.course.findMany({
            include: {
                lessons: {
                    include: {
                        quiz: true,
                        assignment: true
                    }
                }
            }
        });

        console.log(`\n=== AUDITORIA DE CURSOS ===`);
        console.log(`Total de cursos en producción: ${courses.length}`);
        
        for (const course of courses) {
            console.log(`\n> Curso: ${course.title} (ID: ${course.id})`);
            console.log(`  Categoría: ${course.category || 'N/A'}, Precio: $${course.price}`);
            console.log(`  Total lecciones: ${course.lessons.length}`);
            
            let totalQuizzes = 0;
            let totalAssignments = 0;

            for (const lesson of course.lessons) {
                console.log(`    - Lección: ${lesson.title} (ID: ${lesson.id}) [Orden: ${lesson.orderIndex}]`);
                if (lesson.quiz) {
                    console.log(`      * Quiz: Sí (ID: ${lesson.quiz.id})`);
                    totalQuizzes++;
                }
                if (lesson.assignment) {
                    console.log(`      * Tarea: Sí (ID: ${lesson.assignment.id})`);
                    totalAssignments++;
                }
            }
            
            console.log(`  Resumen del curso: ${totalQuizzes} Quizzes, ${totalAssignments} Tareas.`);
        }
        
    } catch (e) {
        console.error(e);
    } finally {
        await prisma.$disconnect();
    }
}

auditCourses();
