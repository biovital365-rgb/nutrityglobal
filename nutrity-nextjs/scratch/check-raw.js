const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkRaw() {
    try {
        const raw = await prisma.$queryRaw`SELECT * FROM "Food" WHERE name = 'Aguaymanto' LIMIT 1`;
        console.log("Raw Food data:", raw);
    } catch(e) {
        console.error(e);
    } finally {
        await prisma.$disconnect();
    }
}
checkRaw();
