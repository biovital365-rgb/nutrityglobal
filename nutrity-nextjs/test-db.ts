import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    const allFoods: any[] = await prisma.food.findMany({});
    console.log("Total foods ever:", allFoods.length);
    for (const f of allFoods) {
        console.log(`- ${f.name} (ID: ${f.id}, deleted: ${!!f.deletedAt})`);
    }
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
