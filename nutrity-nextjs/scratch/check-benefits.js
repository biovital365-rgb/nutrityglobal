const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkBenefits() {
    try {
        const foods = await prisma.food.findMany({
            where: { name: { in: ['Aguaymanto', 'Camote Morado'] } },
            select: { name: true, metabolicBenefits: true }
        });
        for (const food of foods) {
            console.log(`Food: ${food.name}`);
            console.log(JSON.stringify(food.metabolicBenefits, null, 2));
            console.log('---');
        }
    } catch(e) {
        console.error(e);
    } finally {
        await prisma.$disconnect();
    }
}
checkBenefits();
