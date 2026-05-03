import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function run() {
    await prisma.$executeRawUnsafe(`NOTIFY pgrst, 'reload schema';`);
    console.log("Reloaded schema!");
    await prisma.$disconnect();
}

run();
