const fs = require('fs');
const path = './src/components/NutrityLanding.tsx';
let code = fs.readFileSync(path, 'utf8');

// Add user prop to interface
code = code.replace(
  'interface NutrityLandingProps {\n    onStart: () => void;\n    onAuthClick: () => void;\n}',
  'interface NutrityLandingProps {\n    user?: any;\n    onStart: () => void;\n    onAuthClick: () => void;\n}'
);

// Add user to component params
code = code.replace(
  'export function NutrityLanding({ onStart, onAuthClick }: NutrityLandingProps) {',
  'export function NutrityLanding({ user, onStart, onAuthClick }: NutrityLandingProps) {'
);

// Replace Acceso Pacientes button text
code = code.replace(
  '>\n                            Acceso Pacientes\n                        </button>',
  '>\n                            {user ? "Mi Panel" : "Acceso Pacientes"}\n                        </button>'
);

// Replace Iniciar Evaluación Gratis button text
code = code.replace(
  '>\n                                    Iniciar Evaluación Gratis\n                                    <ChevronRight className="w-5 h-5" />\n                                </button>',
  '>\n                                    {user ? "Ir al Dashboard" : "Iniciar Evaluación Gratis"}\n                                    <ChevronRight className="w-5 h-5" />\n                                </button>'
);

fs.writeFileSync(path, code);
console.log('Done');
