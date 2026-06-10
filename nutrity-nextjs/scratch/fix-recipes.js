const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function fixRecipes() {
    const foods = await prisma.food.findMany();
    let updatedCount = 0;

    for (const food of foods) {
        let changed = false;
        let recipes = [];
        try {
            recipes = typeof food.recipes === 'string' ? JSON.parse(food.recipes) : food.recipes;
        } catch(e) { continue; }
        
        if (!Array.isArray(recipes)) continue;

        const newRecipes = recipes.map(r => {
            if (!r.preparation || r.preparation.length === 0) {
                if (r.instructions && r.instructions.length > 0) {
                    r.preparation = r.instructions;
                    r.instructions = []; // Clear instructions or leave them? usually instructions were just preparation
                    changed = true;
                }
            }
            return r;
        });

        if (changed) {
            await prisma.food.update({
                where: { id: food.id },
                data: { recipes: newRecipes }
            });
            updatedCount++;
            console.log(`Updated recipes for food: ${food.name}`);
        }
    }
    console.log(`Total foods updated: ${updatedCount}`);
}

fixRecipes()
    .catch(e => console.error(e))
    .finally(async () => await prisma.$disconnect());
