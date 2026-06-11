import { PrismaClient } from '@prisma/client';
import { coursesToSeed } from './seed-courses-data';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Iniciando inyección segura de Cursos 2 al 6...');

  for (const courseData of coursesToSeed) {
    console.log(`- Procesando curso: ${courseData.title}`);

    // 1. Upsert Course
    const course = await prisma.course.upsert({
      where: { id: courseData.id },
      update: {
        title: courseData.title,
        description: courseData.description,
        thumbnail: courseData.thumbnail,
        category: courseData.category,
        price: courseData.price,
      },
      create: {
        id: courseData.id,
        title: courseData.title,
        description: courseData.description,
        thumbnail: courseData.thumbnail,
        category: courseData.category,
        price: courseData.price,
        isPublished: true,
      },
    });

    // 2. Process Lessons
    for (const lessonData of courseData.lessons) {
      console.log(`  > Procesando lección: ${lessonData.title}`);
      
      const lesson = await prisma.lesson.upsert({
        where: { id: lessonData.id },
        update: {
          title: lessonData.title,
          order: lessonData.order,
          isFree: lessonData.isFree,
          videoUrl: lessonData.videoUrl || null,
          videoInstructions: lessonData.videoInstructions || null,
          pdfUrl: lessonData.pdfUrl || null,
          pdfInstructions: lessonData.pdfInstructions || null,
        },
        create: {
          id: lessonData.id,
          courseId: course.id,
          title: lessonData.title,
          order: lessonData.order,
          isFree: lessonData.isFree,
          videoUrl: lessonData.videoUrl || null,
          videoInstructions: lessonData.videoInstructions || null,
          pdfUrl: lessonData.pdfUrl || null,
          pdfInstructions: lessonData.pdfInstructions || null,
        },
      });

      // 3. Process Quiz (if any)
      if (lessonData.quiz) {
        // We use upsert by lessonId as it is unique in Quiz
        await prisma.quiz.upsert({
          where: { lessonId: lesson.id },
          update: {
            title: lessonData.quiz.title,
            description: lessonData.quiz.description,
            questions: lessonData.quiz.questions as any,
          },
          create: {
            lessonId: lesson.id,
            title: lessonData.quiz.title,
            description: lessonData.quiz.description,
            questions: lessonData.quiz.questions as any,
          },
        });
        console.log(`    ✓ Quiz inyectado para lección ${lesson.order}`);
      }

      // 4. Process Assignment (if any)
      if (lessonData.assignment) {
        await prisma.assignment.upsert({
          where: { lessonId: lesson.id },
          update: {
            title: lessonData.assignment.title,
            description: lessonData.assignment.description,
          },
          create: {
            lessonId: lesson.id,
            title: lessonData.assignment.title,
            description: lessonData.assignment.description,
          },
        });
        console.log(`    ✓ Assignment inyectado para lección ${lesson.order}`);
      }
    }
  }

  console.log('🎉 Seeding de Cursos 2-6 completado exitosamente.');
}

main()
  .catch((e) => {
    console.error('❌ Error durante el seeding de cursos:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
