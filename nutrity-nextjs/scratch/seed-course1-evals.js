const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function seedEvals() {
    try {
        console.log("Iniciando inyección de evaluaciones para Curso 1...");

        const lesson1Id = 'ae2e9db8-d201-4f7b-87c8-48c0689f82c3'; // Lección 1
        const lesson4Id = '85954abb-9261-41aa-9537-95634e2851e9'; // Lección 4
        const lesson6Id = '4252c448-3012-490c-b47e-66b48ec04b0c'; // Lección 6

        // 1. Quiz Lección 1
        await prisma.quiz.upsert({
            where: { lessonId: lesson1Id },
            update: {
                title: "Validación de Concepto: El Método 50-25-25",
                description: "Demuestra que has comprendido las bases visuales del método.",
                questions: [
                    {
                        text: "¿Cuál es la distribución visual correcta del Método 50-25-25?",
                        options: [
                            "50% Carbohidratos, 25% Proteínas, 25% Grasas",
                            "50% Proteínas, 25% Fibras/Vegetales, 25% Almidones",
                            "50% Fibras/Vegetales, 25% Proteínas, 25% Almidones"
                        ],
                        correctIndex: 2
                    },
                    {
                        text: "¿Por qué la mitad del plato debe ser fibra (vegetales)?",
                        options: [
                            "Para aportar menos calorías y engañar al estómago.",
                            "Para crear una malla en el intestino que ralentiza la absorción de glucosa.",
                            "Para eliminar toxinas del hígado."
                        ],
                        correctIndex: 1
                    }
                ]
            },
            create: {
                lessonId: lesson1Id,
                title: "Validación de Concepto: El Método 50-25-25",
                description: "Demuestra que has comprendido las bases visuales del método.",
                questions: [
                    {
                        text: "¿Cuál es la distribución visual correcta del Método 50-25-25?",
                        options: [
                            "50% Carbohidratos, 25% Proteínas, 25% Grasas",
                            "50% Proteínas, 25% Fibras/Vegetales, 25% Almidones",
                            "50% Fibras/Vegetales, 25% Proteínas, 25% Almidones"
                        ],
                        correctIndex: 2
                    },
                    {
                        text: "¿Por qué la mitad del plato debe ser fibra (vegetales)?",
                        options: [
                            "Para aportar menos calorías y engañar al estómago.",
                            "Para crear una malla en el intestino que ralentiza la absorción de glucosa.",
                            "Para eliminar toxinas del hígado."
                        ],
                        correctIndex: 1
                    }
                ]
            }
        });
        console.log("Quiz 1 insertado/actualizado.");

        // 2. Quiz Lección 4
        await prisma.quiz.upsert({
            where: { lessonId: lesson4Id },
            update: {
                title: "Aplicación Práctica: Armado de Menús",
                description: "Valida tu conocimiento sobre cómo armar un plato real.",
                questions: [
                    {
                        text: "Si tu almuerzo incluye un filete de pollo (25%) y una porción de quinua (25%), ¿qué falta para completar el método?",
                        options: [
                            "Una porción de fruta dulce.",
                            "Una gran porción (50%) de ensalada fresca o vegetales cocidos.",
                            "Un postre sin azúcar."
                        ],
                        correctIndex: 1
                    }
                ]
            },
            create: {
                lessonId: lesson4Id,
                title: "Aplicación Práctica: Armado de Menús",
                description: "Valida tu conocimiento sobre cómo armar un plato real.",
                questions: [
                    {
                        text: "Si tu almuerzo incluye un filete de pollo (25%) y una porción de quinua (25%), ¿qué falta para completar el método?",
                        options: [
                            "Una porción de fruta dulce.",
                            "Una gran porción (50%) de ensalada fresca o vegetales cocidos.",
                            "Un postre sin azúcar."
                        ],
                        correctIndex: 1
                    }
                ]
            }
        });
        console.log("Quiz 2 insertado/actualizado.");

        // 3. Assignment Lección 6
        await prisma.assignment.upsert({
            where: { lessonId: lesson6Id },
            update: {
                title: "Tu Primer Plato Consciente",
                description: "Prepara tu próximo almuerzo o cena siguiendo estrictamente la regla 50-25-25. Tómale una foto clara donde se aprecien las proporciones y súbela aquí. En los comentarios, describe qué alimentos usaste para cada porcentaje (Fibras, Proteínas, Almidones)."
            },
            create: {
                lessonId: lesson6Id,
                title: "Tu Primer Plato Consciente",
                description: "Prepara tu próximo almuerzo o cena siguiendo estrictamente la regla 50-25-25. Tómale una foto clara donde se aprecien las proporciones y súbela aquí. En los comentarios, describe qué alimentos usaste para cada porcentaje (Fibras, Proteínas, Almidones)."
            }
        });
        console.log("Assignment 1 insertado/actualizado.");

        console.log("Proceso de inyección completado con éxito.");
    } catch (e) {
        console.error("Error durante inyección:", e);
    } finally {
        await prisma.$disconnect();
    }
}

seedEvals();
