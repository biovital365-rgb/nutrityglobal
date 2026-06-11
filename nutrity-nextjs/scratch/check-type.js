const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkType() {
    try {
        const foods = await prisma.food.findMany({
            where: { name: { in: ['Aguaymanto', 'Camote Morado'] } },
            select: { name: true, recipes: true }
        });
        for (const food of foods) {
            console.log(`Food: ${food.name}`);
            console.log(`Type of recipes: ${typeof food.recipes}`);
            console.log(`Is Array? ${Array.isArray(food.recipes)}`);
            if (typeof food.recipes === 'string') {
                console.log(`String value starts with: ${food.recipes.substring(0, 30)}`);
            }
        }
    } catch(e) {
        console.error(e);
    } finally {
        await prisma.$disconnect();
    }
}
checkType();
