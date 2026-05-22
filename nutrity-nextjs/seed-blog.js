const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function seed() {
  const posts = [
    {
      title: "El Eje Intestino-Cerebro: Cómo tu Microbiota Dicta tus Emociones",
      slug: "eje-intestino-cerebro-microbiota",
      content: `
<h2>El Segundo Cerebro</h2>
<p>Durante décadas, la medicina tradicional consideró al sistema digestivo como un simple tubo de procesamiento de alimentos. Hoy, la ciencia moderna ha descubierto una red neuronal tan compleja en nuestras entrañas que ha sido bautizada como el "segundo cerebro".</p>
<p>Esta conexión bidireccional entre el sistema nervioso central y el tracto gastrointestinal no solo regula la digestión, sino que tiene un impacto profundo en nuestro estado de ánimo, ansiedad y capacidad cognitiva.</p>

<h3>La Fábrica de Serotonina</h3>
<p>Sorprendentemente, más del 90% de la serotonina (el neurotransmisor de la felicidad) se produce en el intestino, no en el cerebro. Una microbiota desequilibrada o "disbiosis" puede interrumpir esta producción, llevando a síntomas de depresión, fatiga crónica y neblina mental.</p>

<h3>Cómo Optimizar tu Microbiota</h3>
<ul>
  <li><strong>Fibras Prebióticas:</strong> Alimentos como el ajo, cebolla, espárragos y plátanos verdes alimentan las bacterias beneficiosas.</li>
  <li><strong>Alimentos Fermentados:</strong> El kéfir, chucrut y kombucha aportan cepas vivas de probióticos.</li>
  <li><strong>Gestión del Estrés:</strong> El cortisol elevado altera la permeabilidad intestinal, causando el síndrome del "intestino permeable".</li>
</ul>
      `,
      excerpt: "Descubre cómo las bacterias de tu sistema digestivo controlan tu estado de ánimo, estrés y producción de serotonina.",
      category: "Microbiota y Digestión",
      isPublished: true,
      isPremium: false,
      author: "Dr. BioVital"
    },
    {
      title: "Resistencia a la Insulina: El Enemigo Silencioso del Metabolismo",
      slug: "resistencia-a-la-insulina-enemigo-silencioso",
      content: `
<h2>¿Qué es la Resistencia a la Insulina?</h2>
<p>La insulina es la hormona maestra encargada de abrir las puertas de tus células para que la glucosa (energía) pueda entrar. Cuando consumes un exceso crónico de carbohidratos refinados y azúcares, tu cuerpo produce tanta insulina que las células terminan "ensordeciendo" a su llamado.</p>

<h3>Síntomas que No Debes Ignorar</h3>
<p>La resistencia a la insulina a menudo no se detecta en los exámenes de glucosa en ayunas estándar hasta que ya es muy tarde. Presta atención a estos signos:</p>
<ul>
  <li>Perímetro abdominal ensanchado (grasa visceral).</li>
  <li>Acantosis nigricans (oscurecimiento de la piel en cuello o axilas).</li>
  <li>Somnolencia extrema después de comer (el famoso "mal del puerco").</li>
  <li>Dificultad severa para perder peso, sin importar la dieta.</li>
</ul>

<h3>Estrategias de Reversión</h3>
<p>La buena noticia es que esta condición es altamente reversible. Estrategias como el ayuno intermitente (16/8), el entrenamiento de fuerza (para crear "sumideros" de glucosa en el músculo) y la dieta cetogénica clínica han demostrado ser herramientas terapéuticas poderosas.</p>
      `,
      excerpt: "Identifica los síntomas tempranos de la resistencia a la insulina y aprende cómo revertirla antes de que se convierta en diabetes.",
      category: "Salud Metabólica",
      isPublished: true,
      isPremium: true,
      author: "Dra. Endocrinología"
    },
    {
      title: "Biodescodificación: El Impacto de las Emociones en tu Biología",
      slug: "biodescodificacion-emociones-biologia",
      content: `
<h2>El Cuerpo Grita lo que la Boca Calla</h2>
<p>La biodescodificación es un enfoque terapéutico que busca el origen emocional y metafísico de los síntomas físicos. Basado en la premisa de que toda enfermedad tiene un conflicto emocional subyacente no resuelto, este enfoque nos invita a escuchar el mensaje que nuestro cuerpo está intentando transmitir.</p>

<h3>La Biología de las Creencias</h3>
<p>El Dr. Bruce Lipton, pionero en epigenética, demostró que nuestro entorno y nuestras percepciones (creencias) pueden alterar la expresión de nuestros genes. Un trauma no procesado genera una cascada constante de hormonas de estrés que, con el tiempo, inflaman los tejidos y debilitan el sistema inmunológico.</p>

<h3>Ejemplos Clínicos Frecuentes</h3>
<ul>
  <li><strong>Problemas de Tiroides:</strong> Frecuentemente asociados al "conflicto del tiempo" (sentir que el tiempo no alcanza, o desear que el tiempo pase más rápido).</li>
  <li><strong>Dolor Lumbar:</strong> A menudo relacionado con la falta de apoyo financiero o emocional en la vida.</li>
  <li><strong>Afecciones Estomacales:</strong> Situaciones de la vida que "no podemos digerir" o aceptar.</li>
</ul>

<p>Sanar requiere no solo cambiar el plato de comida, sino también la calidad de nuestros pensamientos y emociones. La verdadera remisión es holística.</p>
      `,
      excerpt: "Explora cómo los traumas no resueltos y los conflictos emocionales pueden manifestarse como enfermedades físicas.",
      category: "Mente-Cuerpo",
      isPublished: true,
      isPremium: false,
      author: "Nutrity Global AI"
    }
  ];

  try {
    const created = await prisma.post.createMany({
      data: posts,
      skipDuplicates: true
    });
    console.log("Artículos insertados:", created.count);
  } catch (error) {
    console.error("Error al insertar:", error);
  } finally {
    await prisma.$disconnect();
  }
}

seed();
