const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkMicro() {
    try {
        const micros = await prisma.micronutrient.findMany();
        console.log(`Micronutrients count: ${micros.length}`);
        if(micros.length > 0) {
            console.log("First Micro:", micros[0]);
        }
    } catch(e) {
        console.error(e);
    } finally {
        await prisma.$disconnect();
    }
}
checkMicro();
