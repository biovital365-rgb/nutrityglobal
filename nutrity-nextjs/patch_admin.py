import io
import sys

with io.open("src/components/AdminPanel.tsx", "r", encoding="utf-8") as f:
    content = f.read()

if "use client" not in content:
    content = '"use client";\n' + content

content = content.replace(
    'import { dbService, FoodItem, Micronutrient, Course, Lesson } from "../lib/db-service";',
    'import * as dbService from "@/actions/db-actions";\nimport { FoodItem, Micronutrient, Course, Lesson } from "@/lib/types";'
)

content = content.replace(
    'import { micronutrientsData } from "../lib/micronutrients-data";',
    'import { micronutrientsData } from "../lib/micronutrients-data";\nimport AdminBlogTab from "./admin/AdminBlogTab";'
)

old_props = """interface AdminPanelProps {
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
}"""
new_props = """interface AdminPanelProps {
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
}"""
content = content.replace(old_props, new_props)

content = content.replace(
    'type AdminSection = "foods" | "micronutrients" | "menu" | "courses" | "users" | "crm" | "calendar" | "reports";',
    'type AdminSection = "foods" | "micronutrients" | "menu" | "courses" | "users" | "crm" | "calendar" | "reports" | "blog";'
)

old_btn = """<button
                                    onClick={() => setActiveSection('reports')}
                                    className={`w-full flex items-center justify-between p-3 rounded-xl transition-all ${activeSection === 'reports' ? 'bg-nutrity-accent/20 text-nutrity-accent font-bold' : 'text-nutrity-gray-text hover:bg-nutrity-panel/50 hover:text-nutrity-white'}`}
                                >
                                    <div className="flex items-center gap-3">
                                        <Activity className="w-5 h-5" />
                                        Reportes y Analíticas
                                    </div>
                                    <ChevronRight className={`w-4 h-4 transition-transform ${activeSection === 'reports' ? 'rotate-90' : 'opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0'}`} />
                                </button>"""

new_btn = old_btn + """
                                <button
                                    onClick={() => setActiveSection('blog')}
                                    className={`w-full flex items-center justify-between p-3 rounded-xl transition-all ${activeSection === 'blog' ? 'bg-nutrity-accent/20 text-nutrity-accent font-bold' : 'text-nutrity-gray-text hover:bg-nutrity-panel/50 hover:text-nutrity-white'}`}
                                >
                                    <div className="flex items-center gap-3">
                                        <BookOpen className="w-5 h-5" />
                                        Blog & Premium
                                    </div>
                                    <ChevronRight className={`w-4 h-4 transition-transform ${activeSection === 'blog' ? 'rotate-90' : 'opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0'}`} />
                                </button>"""
content = content.replace(old_btn, new_btn)

old_switch = """default:
                return <div className="text-nutrity-white">Sección en construcción</div>;"""
new_switch = """case "blog":
                return <AdminBlogTab user={user} />;
            default:
                return <div className="text-nutrity-white">Sección en construcción</div>;"""
content = content.replace(old_switch, new_switch)

with io.open("src/components/AdminPanel.tsx", "w", encoding="utf-8") as f:
    f.write(content)

print("success")
