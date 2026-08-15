export interface FoodItem {
    id: string
    organizationId?: string | null
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
    recipes: Array<{ title: string; image?: string; ingredients?: string[]; preparation?: string[]; instructions?: string[]; tip?: string; additionalNotes?: string }>
    deletedAt?: string | Date | null
}

export interface Micronutrient {
    id: string
    organizationId?: string | null
    name: string
    symbol: string
    category: string
    function: string
    metabolicImpact: string
    sources: string[]
    deficiencySigns: string[]
    dailyDose: string
    image: string
    deletedAt?: string | Date | null
}

export interface Course {
    id: string
    organizationId?: string | null
    title: string
    description: string
    thumbnail: string
    category: string
    price: number
    paypalUrl?: string | null
    currency?: string | null
    isPublished?: boolean
    lessons?: Lesson[]
    deletedAt?: string | Date | null
}

export interface Lesson {
    id: string
    courseId: string
    title: string
    description: string
    videoUrl: string
    videoInstructions?: string | null
    presentationUrl?: string | null
    presentationInstructions?: string | null
    pdfUrl?: string | null
    pdfInstructions?: string | null
    duration: string
    order: number
    isFree: boolean
    quiz?: {
        title: string;
        description: string;
        questions: Array<{ text: string; options: string[]; correctIndex: number }>;
    } | null
    assignment?: {
        title: string;
        description: string;
    } | null
}
export interface Post {
    id: string;
    organizationId?: string | null;
    title: string;
    slug: string;
    content: string;
    excerpt?: string | null;
    thumbnail?: string | null;
    category: string;
    tags?: string[] | any;
    isPublished: boolean;
    isPremium: boolean;
    author: string;
    createdAt: string | Date;
    updatedAt: string | Date;
}
