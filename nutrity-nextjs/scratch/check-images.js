const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkImages() {
    try {
        const foods = await prisma.food.findMany({
            select: { name: true, image: true, metabolicBenefits: true }
        });
        for (const f of foods) {
            console.log(`- ${f.name}: Image URL length: ${f.image ? f.image.substring(0,30) + '...' : 'NULL'}`);
            if (f.name === 'Aguaymanto') {
               console.log(`Aguaymanto Image URL: ${f.image}`);
            }
        }
    } catch(e) {
        console.error(e);
    } finally {
        await prisma.$disconnect();
    }
}
checkImages();
