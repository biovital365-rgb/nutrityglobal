const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkMaca() {
    try {
        const food = await prisma.food.findFirst({
            where: { name: 'Maca Negra' }
        });
        console.log("Maca Negra data:", JSON.stringify(food, null, 2));
    } catch(e) {
        console.error(e);
    } finally {
        await prisma.$disconnect();
    }
}
checkMaca();
