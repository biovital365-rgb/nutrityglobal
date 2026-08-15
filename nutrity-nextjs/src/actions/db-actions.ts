

export {
    getServerUser,
    getInternalId,
    getUserProfile,
    updateUserProfile,
    getAllUsers,
    updateUserStatus,
    deleteUser,
    syncUserProfile,
    restoreUser,
    registerClinic
} from "./user-actions";

export {
    getFoods,
    saveFood,
    deleteFood,
    deduplicateFoods,
    restoreFood,
    getMicronutrients,
    saveMicronutrient,
    deleteMicronutrient,
    deduplicateMicronutrients,
    restoreMicronutrient,
    getPosts,
    getPostBySlug,
    savePost,
    deletePost,
    getLandingConfig,
    saveLandingConfig
} from "./cms-actions";

export {
    getCourses,
    getCourseWithLessons,
    saveCourse,
    deleteCourse,
    restoreCourse,
    toggleLessonProgress,
    getLessonsProgress,
    saveQuiz,
    saveAssignment,
    getAssignmentSubmissions,
    getQuizAttempts,
    getUserAssignmentSubmissions,
    getUserQuizAttempts,
    reviewAssignmentSubmission,
    verifyLessonAccess,
    submitQuizAttempt,
    submitAssignment,
    markLessonVideoWatched
} from "./academic-actions";

export {
    saveEvaluation,
    saveBiologicalDiagnosis,
    getLatestBiologicalDiagnosis,
    getLatestEvaluation,
    getMeasurements,
    saveMeasurement,
    getAppointments,
    saveAppointment,
    getAllAppointments,
    updateAppointment,
    deleteAppointment,
    restoreAppointment,
    logPDFReport,
    getPDFReports
} from "./clinical-actions";

export {
    generatePatientPDFReport
} from "./reporting-actions";

export {
    saveWeeklyMenu,
    getWeeklyMenu,
    getApprovedMenu,
    getPendingMenu,
    approveWeeklyMenu,
    rejectWeeklyMenu,
    updateDayMenu,
    getAllMenusStatus,
    saveDailyMenu,
    getDailyMenu,
    getDailyMenus,
    requestMenuChanges
} from "./menu-actions";

export interface FoodItem {
    id: string
    organizationId?: string
    name: string
    scientificName: string
    image: string
    category: string
    description: string
    metabolicBenefits: string[]
    nutrients: {
        protein: string
        fiber: string
        sugar: string
    }
    recipes: Array<{ title: string; image?: string; ingredients?: string[]; preparation?: string[]; instructions?: string[] }>
    deletedAt?: string
}

export interface Micronutrient {
    id: string
    organizationId?: string
    name: string
    symbol: string
    category: string
    function: string
    metabolicImpact: string
    sources: string[]
    deficiencySigns: string[]
    dailyDose: string
    image: string
    deletedAt?: string
}

export interface Course {
    id: string
    organizationId?: string
    title: string
    description: string
    thumbnail: string
    category: string
    price: number
    paypalUrl?: string
    currency?: string
    isPublished?: boolean
    lessons?: Lesson[]
    deletedAt?: string
}

export interface Lesson {
    id: string
    courseId: string
    title: string
    description: string
    videoUrl: string
    videoInstructions?: string
    presentationUrl?: string
    presentationInstructions?: string
    pdfUrl?: string
    pdfInstructions?: string
    duration: string
    order: number
    isFree: boolean
    quiz?: {
        title: string;
        description: string;
        questions: Array<{ text: string; options: string[]; correctIndex: number }>;
    }
    assignment?: {
        title: string;
        description: string;
    }
}
