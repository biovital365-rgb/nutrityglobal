# Plan de Próxima Sesión: Escalamiento del LMS (Cursos 2-6)

## 🎯 Objetivo Principal
Cerrar el ciclo de desarrollo del LMS replicando la estructura operativa, evaluativa y de UX del **Curso 1 ("El Método 50-25-25")** hacia los **Cursos 2 al 6**, garantizando un lanzamiento del programa educativo completo con consistencia técnica y editorial.

## 🛠️ Fases de Ejecución Proyectadas (Fase 3 del LMS)

### 1. Documentación del Patrón (El Estándar Curso 1)
- Extraer el patrón de creación de Lecciones (Video URL, PDF URL, Textos).
- Extraer el patrón de Quizzes y Assignments (Score >= 7, feedback, persistencia).
- **Entregable:** Un mini-blueprint interno en `MEMORY.md` o en código que defina: *"Toda nueva lección debe tener esta estructura exacta de JSONB y esta secuencia de evaluaciones."*

### 2. Preparación Editorial y Estructural (Cursos 2-6)
- Definición de UUIDs consistentes para los 5 cursos restantes.
- Mapeo de módulos y lecciones (Títulos, Descripciones, URLs de assets).
- Redacción clínica prudente para las nuevas preguntas de opción múltiple y retos prácticos de los Cursos 2 al 6, manteniendo el tono sobrio (NMG y acompañamiento metabólico) validado en el Curso 1.

### 3. Inyección Segura (Seeding Controlado)
- Creación de un script de Seeding (similar a `scratch/seed-evaluations.ts` y `seed-courses.ts`) pero enfocado exclusivamente en la carga masiva y validada de los Cursos 2 al 6.
- **Regla Estricta:** Ejecución local, validación visual en `localhost` y posterior volcado a producción mediante el script (sin tocar Supabase manualmente para evitar Schema Drift).

### 4. Estabilización UX/UI y Tracking de Progreso
- Asegurar que la barra de progreso general del alumno (`Progress%`) se calcule correctamente al tener 6 cursos en paralelo.
- Verificar el bloqueo secuencial (¿El Curso 2 requiere aprobar el Curso 1? Si es así, implementar la lógica de "Prerequisite" en el frontend).
- Pruebas cruzadas en el **Admin Panel**: Comprobar que el Coach pueda filtrar las tareas (`Assignments`) y los Quizzes por Curso (1 al 6) para no abrumar la tabla de `Submissions`.

## 🔒 Reglas Inquebrantables para la Sesión
1. **No Data Ghosting / Schema Drift:** Ningún curso se carga a mano. Todo va tipado desde TypeScript hacia Supabase.
2. **SSOT (Single Source of Truth):** La base de datos es la única fuente de verdad. El Admin Panel leerá directamente de allí.
3. **Mantenimiento del Tono BioVital:** Cero afirmaciones de "cura milagrosa". Todo el contenido evaluativo de los cursos 2-6 se basa en "mitigación", "educación", "estabilidad" y "acompañamiento metabólico".

---
*Este plan establece la hoja de ruta inmediata apenas se retome el entorno de desarrollo.*
