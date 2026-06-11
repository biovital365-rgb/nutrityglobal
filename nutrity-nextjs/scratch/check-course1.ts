import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const courses = await prisma.course.findMany({
    include: {
      lessons: {
        orderBy: {
          order: 'asc'
        }
      }
    }
  });

  if (courses.length > 0) {
    console.log("Found Courses:");
    courses.forEach(c => {
      console.log(`\nCourse: ${c.title} (ID: ${c.id})`);
      console.log("Lessons:");
      c.lessons.forEach(l => {
        console.log(`  - Order ${l.order}: ${l.title} (ID: ${l.id})`);
      });
    });
  } else {
    console.log("No courses found in database.");
  }
}

main()
  .catch(e => console.error(e))
  .finally(() => prisma.$disconnect());
