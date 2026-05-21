const fs = require('fs');
let content = fs.readFileSync('src/components/AdminPanel.tsx', 'utf8');

// 1. Add use client and change db-service import
if (!content.includes('use client')) {
    content = '\"use client\";\n' + content;
}
content = content.replace(
    /import \{ dbService, FoodItem, Micronutrient, Course, Lesson \} from \"\.\.\/lib\/db-service\";/g,
    'import * as dbService from \"@/actions/db-actions\";\nimport { FoodItem, Micronutrient, Course, Lesson } from \"@/lib/types\";'
);

// 2. Insert AdminBlogTab import
if (!content.includes('AdminBlogTab')) {
    content = content.replace(
        /import \{ micronutrientsData \} from \"\.\.\/lib\/micronutrients-data\";/g,
        'import { micronutrientsData } from \"../lib/micronutrients-data\";\nimport AdminBlogTab from \"./admin/AdminBlogTab\";'
    );
}

// 3. Update AdminPanelProps
content = content.replace(
    /interface AdminPanelProps \{[\s\S]*?organization\?: \{ name\?: string \};\n        \};\n    \};\n\}/,
    \interface AdminPanelProps {
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
}\
);

// 4. Update AdminSection
content = content.replace(
    /type AdminSection = \"foods\" \| \"micronutrients\" \| \"menu\" \| \"courses\" \| \"users\" \| \"crm\" \| \"calendar\" \| \"reports\";/,
    'type AdminSection = \"foods\" | \"micronutrients\" | \"menu\" | \"courses\" | \"users\" | \"crm\" | \"calendar\" | \"reports\" | \"blog\";'
);

// 5. Add Sidebar Button
const sidebarButton = \
                                <button
                                    onClick={() => setActiveSection('reports')}
                                    className={\\\w-full flex items-center justify-between p-3 rounded-xl transition-all \\\\\\}
                                >
                                    <div className="flex items-center gap-3">
                                        <Activity className="w-5 h-5" />
                                        Reportes y Analíticas
                                    </div>
                                    <ChevronRight className={\\\w-4 h-4 transition-transform \\\\\\} />
                                </button>
                                
                                <button
                                    onClick={() => setActiveSection('blog')}
                                    className={\\\w-full flex items-center justify-between p-3 rounded-xl transition-all \\\\\\}
                                >
                                    <div className="flex items-center gap-3">
                                        <BookOpen className="w-5 h-5" />
                                        Blog & Premium
                                    </div>
                                    <ChevronRight className={\\\w-4 h-4 transition-transform \\\\\\} />
                                </button>
\;

content = content.replace(
    /<button[\s\S]*?onClick=\{\(\) => setActiveSection\('reports'\)\}[\s\S]*?<\/button>/,
    sidebarButton
);

// 6. Render Blog Tab in renderSection (find the switch)
content = content.replace(
    /default:\n                return <div className=\"text-nutrity-white\">Sección en construcción<\/div>;/,
    'case \"blog\":\n                return <AdminBlogTab user={user} />;\n            default:\n                return <div className=\"text-nutrity-white\">Sección en construcción</div>;'
);

fs.writeFileSync('src/components/AdminPanel.tsx', content);
console.log('AdminPanel patched.');
