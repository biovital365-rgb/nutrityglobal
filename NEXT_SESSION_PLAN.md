# Plan para la Próxima Sesión: Optimizaciones y Nuevos Desarrollos

Este documento sirve como un punto de partida ("hand-off") para la próxima sesión de IA, asegurando continuidad inmediata en el desarrollo de **Nutrity Global SaaS**.

## 🎯 Objetivo de la Próxima Sesión
Habiendo estabilizado la Fase 1 del módulo **Academia (LMS Pro)** con la correcta edición e inserción de lecciones y recursos mediante URLs ligeras, el enfoque de la próxima sesión deberá centrarse en la **Fase 2 del LMS (Interacción Estudiantil)**, implementando sistemas de validación de conocimientos y gestión de estudiantes, además de terminar la sincronización de agenda para los coaches.

## 📋 Tareas Prioritarias Sugeridas

1. **Sistema de Evaluación y Puntuaciones (LMS)**
   - *Contexto:* Los pacientes completan cursos, pero no hay forma de validar su comprensión sobre el método de remisión.
   - *Tarea:* Diseñar la estructura y UI para Quizzes/Cuestionarios al final de ciertas lecciones, calculando un puntaje (score) que desbloquee certificados o logros dentro de la academia.

2. **Gestión de Tareas o Asignaciones (LMS)**
   - *Contexto:* El coach necesita encargar misiones prácticas (ej: "Sube foto de tu plato 50-25-25").
   - *Tarea:* Permitir la creación de "Tareas" dentro de una lección, donde el paciente pueda enviar un input de texto o un enlace, y el coach pueda revisarlo y otorgar un feedback.

3. **Integración Completa de Agenda (CRM)**
- [x] **Dashboard Administrativo**: Permitir al Admin agendar citas seleccionando al paciente correspondiente y conectando con la BD (`Appointment`).
- [x] **Visualización Bidireccional**: Mostrar las citas próximas en el "Próximo Control" del paciente y en su tab de Agenda.

4. **Optimizaciones de Marketing y SEO (GEO)**
   - *Contexto:* Preparar la plataforma para escalar en ventas B2C.
   - *Tarea:* Refinar el `robots.txt`, el `sitemap.xml` dinámico y añadir metadatos enriquecidos (JSON-LD) a los artículos del Blog para motores de IA (ChatGPT, Perplexity).

## 🤖 Contexto para el Agente (System Prompt Hand-off)
**Para el próximo agente AI:** Al iniciar la sesión, revisa `MEMORY.md` para asimilar el flujo arquitectónico del LMS, especialmente la decisión de usar URLs públicas ligeras para archivos pesados (Videos/PDFs). El objetivo es construir el motor de evaluaciones y tareas respetando el diseño Premium/Glassmorphism y manteniendo la base de datos libre de binarios.
