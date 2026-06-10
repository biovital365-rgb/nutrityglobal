import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function patchImages() {
    console.log('Patching images in Supabase...');

    const foods = await prisma.food.findMany();
    let foodsUpdated = 0;
    for (const food of foods) {
        if (food.image && food.image.includes('unsplash.com')) {
            const newImage = `https://placehold.co/800x600/1E1E1E/F5A623?text=${encodeURIComponent(food.name)}&font=Montserrat`;
            await prisma.food.update({
                where: { id: food.id },
                data: { image: newImage }
            });
            foodsUpdated++;
            console.log(`Updated food: ${food.name}`);
        }
    }

    const micros = await prisma.micronutrient.findMany();
    let microsUpdated = 0;
    for (const micro of micros) {
        if (micro.image && micro.image.includes('unsplash.com')) {
            const newImage = `https://placehold.co/800x600/1E1E1E/F5A623?text=${encodeURIComponent(micro.name)}&font=Montserrat`;
            await prisma.micronutrient.update({
                where: { id: micro.id },
                data: { image: newImage }
            });
            microsUpdated++;
            console.log(`Updated micro: ${micro.name}`);
        }
    }

    console.log(`Patch complete. Foods updated: ${foodsUpdated}, Micros updated: ${microsUpdated}`);
}

patchImages()
    .catch(console.error)
    .finally(() => prisma.$disconnect());
