const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkRecipes() {
    try {
        const foods = await prisma.food.findMany({
            where: { name: { in: ['Aguaymanto', 'Camote Morado', 'Cacao Puro (100%)', 'Cañihua'] } }
        });
        for (const food of foods) {
            console.log(`Food: ${food.name}`);
            console.log(JSON.stringify(food.recipes, null, 2));
            console.log('---');
        }
    } catch(e) {
        console.error(e);
    } finally {
        await prisma.$disconnect();
    }
}
checkRecipes();
