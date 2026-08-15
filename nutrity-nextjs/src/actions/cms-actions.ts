"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { getServerUser } from "./user-actions";
import { FoodItem, Micronutrient } from "./db-actions"; // Temporarily assume types are exported in db-actions, or better, export them here.

export async function getFoods() {
    const user = await getServerUser();
    const targetOrg = user?.role === 'ADMIN' ? null : (user?.organizationId || null);

    const whereClause: any = { deletedAt: null };
    if (targetOrg) {
        whereClause.OR = [
            { organizationId: null },
            { organizationId: targetOrg }
        ];
    }

    const data = await prisma.food.findMany({
        where: whereClause,
        orderBy: { name: 'asc' }
    });
    
    return data as any;
}

export async function saveFood(food: any, organizationIdParam?: string) {
    const user = await getServerUser();
    if (!user) throw new Error("Unauthorized");
    const finalOrgId = user.role === 'ADMIN' ? (food.organizationId || organizationIdParam || null) : user.organizationId;

    const payload: any = {
        name: food.name || '',
        scientificName: food.scientificName || '',
        image: food.image || '',
        category: food.category || '',
        description: food.description || '',
        metabolicBenefits: food.metabolicBenefits || [],
        nutrients: food.nutrients || { protein: '', fiber: '', sugar: '' },
        recipes: food.recipes || [],
        organizationId: finalOrgId
    };

    let result;
    if (food.id) {
        result = await prisma.food.update({
            where: { id: food.id },
            data: payload
        });
    } else {
        result = await prisma.food.create({
            data: payload
        });
    }

    return result as any;
}

export async function deleteFood(id: string) {
    const user = await getServerUser();
    if (!user) throw new Error("Unauthorized");
    
    const food = await prisma.food.findUnique({ where: { id } });
    if (!food) throw new Error("Not found");
    
    if (user.role !== 'ADMIN' && food.organizationId !== user.organizationId) {
        throw new Error("Forbidden");
    }

    await prisma.food.update({
        where: { id },
        data: { deletedAt: new Date() }
    });
    return true;
}

export async function deduplicateFoods() {
    const allFoods = await prisma.food.findMany({
        select: { id: true, name: true, organizationId: true, createdAt: true },
        orderBy: { createdAt: 'desc' }
    });
    if (!allFoods || allFoods.length === 0) return { count: 0 };

    const seen = new Set<string>();
    const toDelete: string[] = [];

    for (const food of allFoods) {
        const key = `${food.name.toLowerCase().trim()}-${food.organizationId || 'global'}`;
        if (seen.has(key)) {
            toDelete.push(food.id);
        } else {
            seen.add(key);
        }
    }

    if (toDelete.length > 0) {
        await prisma.food.deleteMany({
            where: { id: { in: toDelete } }
        });
    }

    return { count: toDelete.length };
}

export async function restoreFood(id: string) {
    const data = await prisma.food.update({
        where: { id },
        data: { deletedAt: null }
    });
    revalidatePath('/', 'layout');
    return data;
}

export async function getMicronutrients() {
    const user = await getServerUser();
    const targetOrg = user?.role === 'ADMIN' ? null : (user?.organizationId || null);

    const whereClause: any = { deletedAt: null };
    if (targetOrg) {
        whereClause.OR = [
            { organizationId: null },
            { organizationId: targetOrg }
        ];
    }

    const data = await prisma.micronutrient.findMany({
        where: whereClause,
        orderBy: { name: 'asc' }
    });
    
    return data as any;
}

export async function saveMicronutrient(micro: any, organizationIdParam?: string) {
    const user = await getServerUser();
    if (!user) throw new Error("Unauthorized");
    const finalOrgId = user.role === 'ADMIN' ? (micro.organizationId || organizationIdParam || null) : user.organizationId;

    const payload: any = {
        name: micro.name || '',
        symbol: micro.symbol || '',
        category: micro.category || '',
        function: micro.function || '',
        metabolicImpact: micro.metabolicImpact || '',
        sources: micro.sources || [],
        deficiencySigns: micro.deficiencySigns || [],
        dailyDose: micro.dailyDose || '',
        image: micro.image || null,
        organizationId: finalOrgId
    };

    let result;
    if (micro.id) {
        result = await prisma.micronutrient.update({
            where: { id: micro.id },
            data: payload
        });
    } else {
        result = await prisma.micronutrient.create({
            data: payload
        });
    }

    return result as any;
}

export async function deleteMicronutrient(id: string) {
    const user = await getServerUser();
    if (!user) throw new Error("Unauthorized");
    
    const micro = await prisma.micronutrient.findUnique({ where: { id } });
    if (!micro) throw new Error("Not found");
    
    if (user.role !== 'ADMIN' && micro.organizationId !== user.organizationId) {
        throw new Error("Forbidden");
    }

    await prisma.micronutrient.update({
        where: { id },
        data: { deletedAt: new Date() }
    });
    return true;
}

export async function deduplicateMicronutrients() {
    const allMicros = await prisma.micronutrient.findMany({
        select: { id: true, name: true, organizationId: true, createdAt: true },
        orderBy: { createdAt: 'desc' }
    });
    if (!allMicros || allMicros.length === 0) return { count: 0 };

    const seen = new Set<string>();
    const toDelete: string[] = [];

    for (const micro of allMicros) {
        const key = `${micro.name.toLowerCase().trim()}-${micro.organizationId || 'global'}`;
        if (seen.has(key)) {
            toDelete.push(micro.id);
        } else {
            seen.add(key);
        }
    }

    if (toDelete.length > 0) {
        await prisma.micronutrient.deleteMany({
            where: { id: { in: toDelete } }
        });
    }

    return { count: toDelete.length };
}

export async function restoreMicronutrient(id: string) {
    const data = await prisma.micronutrient.update({
        where: { id },
        data: { deletedAt: null }
    });
    revalidatePath('/', 'layout');
    return data;
}

// --- BLOG POSTS ---
export async function getPosts(organizationId?: string, onlyPublished: boolean = true) {
    const where: any = {
        slug: { not: 'landing-page-config' }
    };
    if (organizationId) where.organizationId = organizationId;
    if (onlyPublished) where.isPublished = true;
    
    const data = await prisma.post.findMany({
        where,
        orderBy: { createdAt: 'desc' }
    });
    return data;
}

export async function getPostBySlug(slug: string) {
    const data = await prisma.post.findUnique({ where: { slug } });
    return data;
}

export async function savePost(post: any, organizationId?: string) {
    const id = post.id && post.id.length > 20 ? post.id : crypto.randomUUID();
    
    const payload = {
        title: post.title,
        slug: post.slug,
        content: post.content,
        excerpt: post.excerpt,
        thumbnail: post.thumbnail,
        category: post.category,
        tags: post.tags,
        isPublished: post.isPublished,
        isPremium: post.isPremium,
        author: post.author,
        organizationId: organizationId || null,
        updatedAt: new Date()
    };
    
    const data = await prisma.post.upsert({
        where: { id },
        update: payload,
        create: { ...payload, id }
    });
    
    revalidatePath('/', 'layout');
    return data;
}

export async function deletePost(id: string) {
    await prisma.post.delete({ where: { id } });
    revalidatePath('/', 'layout');
    return true;
}

// --- LANDING PAGE CMS (SaaS Multi-tenant) ---
export async function getLandingConfig(organizationId?: string) {
    try {
        if (organizationId) {
            const config = await prisma.organizationConfig.findUnique({
                where: { organizationId }
            });
            if (config) return config;
        }

        // Fallback a configuración global (usando Post temporalmente por retrocompatibilidad)
        const post = await prisma.post.findUnique({
            where: { slug: 'landing-page-config' },
            select: { content: true }
        });

        if (post?.content) {
            return JSON.parse(post.content);
        }
    } catch (e) {
        console.error('Error fetching landing config', e);
    }
    return null;
}

export async function saveLandingConfig(configData: any, organizationId?: string) {
    const currentUser = await getServerUser();
    if (!currentUser || !['ADMIN', 'COACH'].includes(currentUser.role)) throw new Error("Forbidden");

    // Si se pasa un organizationId, o si el usuario es COACH y tiene uno propio, guardamos en Prisma
    const targetOrgId = currentUser.role === 'ADMIN' ? (organizationId || null) : currentUser.organizationId;

    if (targetOrgId) {
        const data = {
            heroTitle: configData.heroTitle,
            heroSubtitle: configData.heroSubtitle,
            heroDescription: configData.heroDescription,
            ctaText: configData.ctaText,
            primaryColor: configData.primaryColor,
            accentColor: configData.accentColor,
            heroImage: configData.heroImage,
            scienceImage: configData.scienceImage,
            missionImage: configData.missionImage,
            habitsImage: configData.habitsImage,
            strategiesImage: configData.strategiesImage,
            tiktokVideos: configData.tiktokVideos || [],
        };

        const config = await prisma.organizationConfig.upsert({
            where: { organizationId: targetOrgId },
            update: data,
            create: {
                organizationId: targetOrgId,
                ...data
            }
        });
        revalidatePath('/', 'layout');
        return config;
    } else {
        // Modo Global Admin (guarda en Post)
        const stringifiedContent = JSON.stringify(configData);
        
        const existing = await prisma.post.findUnique({ where: { slug: 'landing-page-config' }, select: { id: true } });
        const id = existing?.id || crypto.randomUUID();

        const payload = {
            title: 'Configuración de la Landing Page Global',
            slug: 'landing-page-config',
            content: stringifiedContent,
            category: 'SYSTEM',
            isPublished: true,
            organizationId: null,
            updatedAt: new Date()
        };

        const data = await prisma.post.upsert({
            where: { id },
            update: payload,
            create: { ...payload, id }
        });
        revalidatePath('/', 'layout');
        return data;
    }
}
