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
export interface Post {
    id: string;
    organizationId?: string;
    title: string;
    slug: string;
    content: string;
    excerpt?: string;
    thumbnail?: string;
    category: string;
    tags?: string[];
    isPublished: boolean;
    isPremium: boolean;
    author: string;
    createdAt: string | Date;
    updatedAt: string | Date;
}
