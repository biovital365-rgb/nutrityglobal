export interface QuizQuestion {
  text: string;
  options: string[];
  correctIndex: number;
}

export interface QuizData {
  title: string;
  description: string;
  questions: QuizQuestion[];
}

export interface AssignmentData {
  title: string;
  description: string;
}

export interface LessonData {
  id: string;
  title: string;
  order: number;
  isFree: boolean;
  videoUrl?: string;
  videoInstructions?: string;
  pdfUrl?: string;
  pdfInstructions?: string;
  quiz?: QuizData;
  assignment?: AssignmentData;
}

export interface CourseData {
  id: string;
  title: string;
  description: string;
  thumbnail: string;
  category: string;
  price: number;
  lessons: LessonData[];
}

export const coursesToSeed: CourseData[] = [
  {
    id: "course-2-0000-0000-0000-000000000002",
    title: "Curso 2: Bioquímica de la Remisión",
    description: "Comprende la ruta metabólica de la glucosa y la resistencia a la insulina a nivel celular.",
    thumbnail: "https://images.unsplash.com/photo-1579684385127-1ef15d508118",
    category: "Pilar Bioquímica",
    price: 199,
    lessons: [
      {
        id: "lesson-2-1-000-0000-0000-000000000021",
        title: "La Célula y la Insulina",
        order: 1,
        isFree: true,
        videoUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ", // Placeholder to be replaced by actual link
        videoInstructions: "Observa cómo la insulina funciona como una llave celular.",
        quiz: {
          title: "Evaluación: Resistencia a la Insulina",
          description: "Valida tu conocimiento sobre el mecanismo de acción de la insulina.",
          questions: [
            {
              text: "¿Qué ocurre biológically cuando existe resistencia a la insulina?",
              options: [
                "La insulina deja de producirse en el páncreas.",
                "Los receptores celulares no responden eficientemente a la insulina, impidiendo el ingreso de glucosa.",
                "La glucosa se transforma en proteína directamente.",
                "El hígado deja de producir bilis."
              ],
              correctIndex: 1
            }
          ]
        }
      },
      {
        id: "lesson-2-2-000-0000-0000-000000000022",
        title: "Reto Práctico: Auditoría de tu Despensa",
        order: 2,
        isFree: false,
        pdfUrl: "https://example.com/auditoria.pdf",
        pdfInstructions: "Descarga la guía de auditoría y aplícala en tu hogar.",
        assignment: {
          title: "Auditoría de Azúcares Ocultos",
          description: "Revisa tres productos de tu alacena e identifica posibles azúcares ocultos leyendo los ingredientes. Comparte tus hallazgos."
        }
      }
    ]
  },
  {
    id: "course-3-0000-0000-0000-000000000003",
    title: "Curso 3: Psiconeuroinmunología y Estrés",
    description: "Impacto del cortisol y las emociones en tus niveles de glucosa, bajo el lente de la Nueva Medicina Germánica (NMG).",
    thumbnail: "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b",
    category: "Pilar Emocional",
    price: 199,
    lessons: [
      {
        id: "lesson-3-1-000-0000-0000-000000000031",
        title: "El Eje Cortisol-Glucosa",
        order: 1,
        isFree: true,
        videoUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
        videoInstructions: "Descubre cómo el estrés crónico eleva la glucemia en ayunas.",
        quiz: {
          title: "Evaluación: Estrés y Metabolismo",
          description: "Comprueba tu entendimiento sobre el cortisol.",
          questions: [
            {
              text: "¿Cuál es la función del cortisol en situaciones de estrés biológico agudo?",
              options: [
                "Inducir el sueño profundo.",
                "Liberar reservas de glucosa del hígado para preparar al cuerpo para huir o luchar.",
                "Reducir la presión arterial de inmediato.",
                "Aumentar la absorción de nutrientes en el intestino."
              ],
              correctIndex: 1
            }
          ]
        }
      }
    ]
  },
  {
    id: "course-4-0000-0000-0000-000000000004",
    title: "Curso 4: Microbiota y Fermentación",
    description: "Restaura tu flora intestinal para modular la inflamación sistémica de bajo grado.",
    thumbnail: "https://images.unsplash.com/photo-1584362917165-526a968579e8",
    category: "Pilar Inmunológico",
    price: 199,
    lessons: [
      {
        id: "lesson-4-1-000-0000-0000-000000000041",
        title: "El Segundo Cerebro",
        order: 1,
        isFree: true,
        videoInstructions: "Conoce las bacterias que protegen tu barrera intestinal.",
        assignment: {
          title: "Reto: Incorporando Fermentos",
          description: "Menciona un alimento fermentado natural (ej. kéfir, chucrut) que te gustaría integrar en tu semana y cómo lo harías."
        }
      }
    ]
  },
  {
    id: "course-5-0000-0000-0000-000000000005",
    title: "Curso 5: Ayuno Funcional e Intermitencia",
    description: "Aprende a descansar tu sistema digestivo de forma segura y biológicamente congruente.",
    thumbnail: "https://images.unsplash.com/photo-1505576399279-565b52d4ac71",
    category: "Pilar Metabolismo",
    price: 199,
    lessons: [
      {
        id: "lesson-5-1-000-0000-0000-000000000051",
        title: "Ventanas de Alimentación",
        order: 1,
        isFree: true,
        quiz: {
          title: "Evaluación: Bases del Ayuno",
          description: "Entendiendo las fases del ayuno.",
          questions: [
            {
              text: "¿Cuál es el principal beneficio metabólico de mantener una ventana de ayuno de 12 a 14 horas nocturnas?",
              options: [
                "Disminuir drásticamente el peso muscular.",
                "Permitir la disminución basal de insulina y activar la reparación celular (autofagia leve).",
                "Evitar tener que cocinar el desayuno temprano.",
                "Acelerar el corazón durante el sueño."
              ],
              correctIndex: 1
            }
          ]
        }
      }
    ]
  },
  {
    id: "course-6-0000-0000-0000-000000000006",
    title: "Curso 6: Mantenimiento a Largo Plazo y Cronobiología",
    description: "Estrategias para que la remisión sea sostenible en el tiempo respetando los ritmos circadianos.",
    thumbnail: "https://images.unsplash.com/photo-1444858291040-58f756a3bdd6",
    category: "Pilar Estilo de Vida",
    price: 199,
    lessons: [
      {
        id: "lesson-6-1-000-0000-0000-000000000061",
        title: "Ritmos Circadianos y Glucosa",
        order: 1,
        isFree: true,
        assignment: {
          title: "Cierre del Programa: Tu Ritmo Biológico",
          description: "Describe cómo planeas ajustar tus horarios de comida y exposición a la luz solar para sincronizarte con el ritmo natural de tu cuerpo."
        }
      }
    ]
  }
];
