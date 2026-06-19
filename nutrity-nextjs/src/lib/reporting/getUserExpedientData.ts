import { prisma } from "@/lib/prisma";

export async function getUserExpedientData(userId: string) {
    // 1. Get User Profile
    const user = await prisma.user.findUnique({
        where: { id: userId },
        select: {
            id: true,
            name: true,
            email: true,
            plan: true,
            subscriptionStatus: true,
            createdAt: true,
        }
    });

    if (!user) {
        throw new Error("User not found");
    }

    // 2. Get latest Biological Diagnosis
    const diagnosis = await prisma.biologicalDiagnosis.findFirst({
        where: { userId },
        orderBy: { createdAt: 'desc' }
    });

    // 3. Get latest Daily Menu
    const latestMenu = await prisma.dailyMenu.findFirst({
        where: { userId, status: "APPROVED" },
        orderBy: { date: 'desc' }
    });

    // We only need the menuData if it exists
    let menuData = null;
    let recipes = null;
    if (latestMenu && latestMenu.menuData) {
        menuData = latestMenu.menuData;
        // Optimization: we could fetch the specific recipes (Foods) used in this menu, 
        // but for now we'll just return the menu structure.
    }

    // 4. Get Academic Progress (Lessons, Quizzes, Assignments)
    const [progress, quizAttempts, assignmentSubmissions] = await Promise.all([
        prisma.lessonProgress.findMany({
            where: { userId, completed: true },
            select: { lessonId: true, completed: true, updatedAt: true }
        }),
        prisma.quizAttempt.findMany({
            where: { userId },
            orderBy: { score: 'desc' }
        }),
        prisma.assignmentSubmission.findMany({
            where: { userId },
            orderBy: { createdAt: 'desc' }
        })
    ]);

    // Aggregate into a structured object
    return {
        profile: user,
        diagnosis: diagnosis || null,
        menu: menuData,
        academic: {
            completedLessonsCount: progress.length,
            quizAttempts,
            assignmentSubmissions
        }
    };
}
