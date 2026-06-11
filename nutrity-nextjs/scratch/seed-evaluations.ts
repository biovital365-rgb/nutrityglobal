import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Seed: Iniciando carga de evaluaciones (Quizzes y Assignments) para el Curso 1...');

  // Lección 1 Quiz
  const lesson1Id = 'ae2e9db8-d201-4f7b-87c8-48c0689f82c3';
  await prisma.quiz.upsert({
    where: { lessonId: lesson1Id },
    update: {},
    create: {
      lessonId: lesson1Id,
      title: 'Evaluación: Fundamentos del Método 50-25-25',
      description: 'Comprueba tu comprensión sobre la estructura del plato metabólico para optimizar tu curva de glucosa.',
      questions: [
        {
          text: '¿Cuál es el objetivo clínico principal de aplicar el Método 50-25-25 en cada comida principal?',
          options: [
            'Acelerar la pérdida de peso mediante restricción calórica severa.',
            'Mitigar la respuesta glucémica e insulínica, favoreciendo la saciedad y la estabilidad metabólica.',
            'Eliminar completamente los carbohidratos para inducir cetosis constante.',
            'Garantizar un déficit calórico sin importar la calidad de los nutrientes.'
          ],
          correctIndex: 1
        },
        {
          text: 'En la composición de un plato bajo el método 50-25-25, ¿cuál es el rol fundamental de asignar el 50% a fibra y vegetales?',
          options: [
            'Proporcionar energía rápida para el rendimiento cognitivo a corto plazo.',
            'Actuar como un "Escudo de Fibra" que enlentece el vaciado gástrico y modula la absorción de los carbohidratos.',
            'Aportar las proteínas necesarias para la síntesis muscular post-entrenamiento.',
            'Reemplazar la hidratación líquida por agua contenida en los alimentos.'
          ],
          correctIndex: 1
        }
      ]
    }
  });
  console.log('✅ Quiz Lección 1 inyectado.');

  // Lección 4 Quiz
  const lesson4Id = '85954abb-9261-41aa-9537-95634e2851e9';
  await prisma.quiz.upsert({
    where: { lessonId: lesson4Id },
    update: {},
    create: {
      lessonId: lesson4Id,
      title: 'Evaluación: Aplicación Clínica de Menús',
      description: 'Pon a prueba tu capacidad para estructurar platos que apoyen tu remisión metabólica.',
      questions: [
        {
          text: 'Si tu plato ya contiene 25% de proteína magra y 50% de vegetales al vapor, ¿qué elección completaría el plato manteniendo un perfil glucémico favorable?',
          options: [
            'Una porción de postre azucarado para balancear el paladar.',
            'Una porción de carbohidratos complejos como quinoa o camote asado.',
            'Dos porciones adicionales de proteína para inducir saciedad extrema.',
            'Un jugo de frutas exprimidas comercial.'
          ],
          correctIndex: 1
        },
        {
          text: '¿Por qué la secuencia de ingesta (orden de los alimentos) es un factor crítico en el control de la glucosa?',
          options: [
            'Porque comer los carbohidratos primero mejora la digestión gástrica.',
            'Porque al consumir la fibra (vegetales) antes que los almidones y azúcares, reducimos significativamente el impacto de la insulina postprandial.',
            'Porque las proteínas siempre deben ingerirse al final para ser absorbidas en el intestino grueso.',
            'El orden de ingesta no tiene un impacto clínico demostrable si las porciones son exactas.'
          ],
          correctIndex: 1
        }
      ]
    }
  });
  console.log('✅ Quiz Lección 4 inyectado.');

  // Lección 6 Assignment
  const lesson6Id = '4252c448-3012-490c-b47e-66b48ec04b0c';
  await prisma.assignment.upsert({
    where: { lessonId: lesson6Id },
    update: {},
    create: {
      lessonId: lesson6Id,
      title: 'Reto de Integración: Diseña tu Plato 50-25-25',
      description: 'Instrucción Clínica: Proyecta tu próxima cena aplicando estrictamente la estructura 50-25-25. Escribe en el cuadro de texto a continuación:\n\n1) Tu selección para el 50% de Fibra (Ej. vegetales específicos).\n2) Tu fuente para el 25% de Proteína.\n3) Tu elección para el 25% de Carbohidratos complejos o grasas adicionales.\n\nAñade una breve reflexión sobre cómo anticipas que este equilibrio apoyará tu descanso y tu estabilidad energética matutina. Nuestro equipo de Coaches validará tu propuesta.'
    }
  });
  console.log('✅ Assignment Lección 6 inyectado.');

  console.log('🎉 Seeding de evaluaciones completado exitosamente.');
}

main()
  .catch(e => {
    console.error('Error durante el seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
