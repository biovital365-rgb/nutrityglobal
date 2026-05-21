const fs = require('fs');
let content = fs.readFileSync('src/components/AdminPanel.tsx', 'utf8');

if (!content.includes('use client')) {
    content = '"use client";\n' + content;
}

content = content.replace(
    'import { dbService, FoodItem, Micronutrient, Course, Lesson } from "../lib/db-service";',
    'import * as dbService from "@/actions/db-actions";\nimport { FoodItem, Micronutrient, Course, Lesson } from "@/lib/types";'
);

content = content.replace(
    'import { micronutrientsData } from "../lib/micronutrients-data";',
    'import { micronutrientsData } from "../lib/micronutrients-data";\nimport AdminBlogTab from "./admin/AdminBlogTab";'
);

content = content.replace(
    interface AdminPanelProps {
    user: {
        uid?: string;
        email?: string;
        displayName?: string;
        profile?: {
            name?: string;
            email?: string;
            role?: string;
            plan?: string;
            organization?: { name?: string };
        };
    };
},
    interface AdminPanelProps {
    user: {
        uid?: string;
        email?: string;
        displayName?: string;
        profile?: {
            name?: string;
            email?: string;
            role?: string;
            plan?: string;
            organization?: { id?: string; name?: string };
        };
    };
    onLogout?: () => void;
    onBackToDashboard?: () => void;
}
);

content = content.replace(
    'type AdminSection = "foods" | "micronutrients" | "menu" | "courses" | "users" | "crm" | "calendar" | "reports";',
    'type AdminSection = "foods" | "micronutrients" | "menu" | "courses" | "users" | "crm" | "calendar" | "reports" | "blog";'
);

const oldBtn = <button
                                    onClick={() => setActiveSection('reports')}
                                    className={\w-full flex items-center justify-between p-3 rounded-xl transition-all \\}
                                >
                                    <div className="flex items-center gap-3">
                                        <Activity className="w-5 h-5" />
                                        Reportes y Analíticas
                                    </div>
                                    <ChevronRight className={\w-4 h-4 transition-transform \\} />
                                </button>;

const newBtn = oldBtn + 
                                <button
                                    onClick={() => setActiveSection('blog')}
                                    className={\w-full flex items-center justify-between p-3 rounded-xl transition-all \\}
                                >
                                    <div className="flex items-center gap-3">
                                        <BookOpen className="w-5 h-5" />
                                        Blog & Premium
                                    </div>
                                    <ChevronRight className={\w-4 h-4 transition-transform \\} />
                                </button>;

content = content.replace(oldBtn, newBtn);

const oldSwitch = default:
                return <div className="text-nutrity-white">Sección en construcción</div>;;

const newSwitch = case "blog":
                return <AdminBlogTab user={user} />;
            default:
                return <div className="text-nutrity-white">Sección en construcción</div>;;

content = content.replace(oldSwitch, newSwitch);

fs.writeFileSync('src/components/AdminPanel.tsx', content);
