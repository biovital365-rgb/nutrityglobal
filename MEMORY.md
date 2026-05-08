# MEMORY - Nutrity Global SaaS (2026)

## 🎯 Estado Actual (Mayo 2026)
- **Producto**: Nutrity Global - CRM & Onboarding para Remisión de Diabetes.
- **Enfoque**: Remisión Metabólica Clínica basada en el modelo de 4 secciones (Antropometría, Bioquímica, Estilo de Vida, PNL/Biodescodificación).
- **Integración IA**: Sincronización exitosa con **NotebookLM** (vía MCP) para fundamentación clínica (NMG y Medicina Funcional).
- **Onboarding**: Engine de diagnóstico 100% implementado en `NutrityOnboarding.tsx`, integrando métricas clave como:
    - **Antropometría**: Perímetro de cintura (grasa ectópica).
    - **Bioquímica**: HbA1c y niveles de glucosa### Session Summary: Nutrity Global Admin Restoration Interface (Phase 3)
    - **Bioquímica**: HbA1c y niveles de glucosa

### 🛠️ Features Implemented (Phase 5 - Clinical Excellence)
1.  **Protocolo Maestro V8.0 (PDF)**:
    *   **Menú Semanal Personalizado**: Inclusión total de los 7 días de nutrición andina en el reporte.
    *   **Bio-Tracker Semafórico**: Implementación de sistema Visual R-A-V (Rojo, Amarillo, Verde) para niveles de glucosa.
    *   **Check-list de Cumplimiento**: Cuadros de verificación integrados para ayuno, superfoods y bio-hacking.
    *   **Diseño Editorial Premium**: Transición de un reporte simple a un documento tipo "Revista Médica" con bloques de color y tipografía jerárquica.
2.  **Arquitectura de Datos Sincronizada**:
    *   Centralización del estado del menú en `App.tsx` para permitir que el exportador PDF tenga visión global.
    *   Sincronización en tiempo real entre `NutrityDashboard` y `App` mediante el hook `onMenuUpdate`.
3.  **Refuerzo de Biodescodificación**:
    *   Secciones dedicadas en el PDF para conectar el síntoma biológico con el conflicto emocional, guiando al usuario hacia una remisión integral.

#### 🔑 Key Context & Decisions
*   **Visión**: La aplicación ahora cumple el ciclo completo: Diagnóstico -> Plan IA -> Seguimiento en App -> Reporte de Auditoría Médica.
*   **Tech Stack**: jsPDF (Reportes), Gemini 1.5-Flash (Inteligencia), Supabase (Persistencia).

#### ⚠️ Active Issues & Blockers
*   **Assets**: Las imágenes 404 en el catálogo (ej. zinc, pumpkin seeds) deben ser cargadas manualmente a `public/` o actualizadas en la DB con URLs externas válidas.

#### 🚀 Next Steps
1.  **Carga de Assets**: Completar la biblioteca de imágenes de alimentos en el servidor.
2.  **GEO Audit**: Preparar el contenido para ser indexable por motores de búsqueda generativos.
3.  **Final Launch**: Revisión estética final de la landing page.

 Datos**: Supabase (PostgreSQL) con Prisma ORM.
- **IA**: Google Gemini (Pro/Flash).
- **Estrategia de Persistencia**: Deterministic IDs + Logical Deletion.

---

## Roadmap de Desarrollo 2026

- [x] **Fase 1: Cimientos y Migración** (Completado)
    *   Migración de Firebase a Supabase para persistencia relacional.
    *   Estandarización de Esquemas (Zod) y Tipado Estricto.
- [x] **Fase 2: IA Structured Outputs** (Completado)
    *   Motor metabólico centralizado con Gemini 1.5-Flash y validación Zod.
    *   Generación determinista de Menús Semanales y Planes de Vida.
- [x] **Fase 3: Administración y Estabilización** (Completado)
    *   Dashboard de Auditoría en `AdminPanel.tsx` con visibilidad de resultados metabólicos.
    *   Alertas automáticas en CRM para pacientes con bajo puntaje de remisión.
    *   Filtros avanzados en calendario y gestión de usuarios (Bloqueo/Observación).
- [x] **Fase 4: Monetización y Pulido Final** (Completado)
    *   Implementación de Gating en Academia (Lock Premium UI).
    *   Corrección de UI Móvil (WhatsApp button responsive).
    *   Funcionalidad de Regeneración Parcial de Menú con IA.
    *   Refinamiento de CSS Global para estética Premium Nature Biotech.

## Decisiones Arquitectónicas Recientes
1.  **Regeneración Granular**: Se añadió el método `regenerateMeal` en el servicio de IA para permitir actualizaciones atómicas del menú sin reescribir la semana completa, optimizando el consumo de tokens y la experiencia de usuario.
2.  **Premium Gating UX**: Se implementó una lógica de "Preview + Upgrade" en la Academia, permitiendo a los usuarios ver el catálogo de cursos pero restringiendo el acceso a las lecciones mediante una capa de seguridad basada en el campo `plan` de Supabase.
3.  **Mobile Safety Zone**: Se ajustó la posición de los elementos flotantes (`Z-Index` y `Bottom offset`) para evitar colisiones con la barra de navegación nativa de PWA y el menú inferior de Nutrity Dashboard.
1.  **Visibilidad Admin de IA**: Se modificó `getAllUsers` para incluir un join con `Evaluation`, permitiendo a los administradores auditar el progreso metabólico real de cada usuario desde la tabla principal.
2.  **Filtrado de Citas Local**: Implementado filtrado reactivo en el Admin Panel para separar "Diagnósticos Profundos" de "Controles de Seguimiento", optimizando el flujo de trabajo clínico.
3.  **Aislamiento SaaS**: Todas las vistas administrativas ahora respetan estrictamente el `organizationId` del perfil del administrador, asegurando multi-tenancy.

---

## 💡 Decisiones de Diseño Importantes
- **User Status Protocol**: El sistema maneja estados `ACTIVE`, `BLOCKED` y `OBSERVED`.
- **Emotional-Driven AI**: La IA no solo prescribe dieta, sino que decodifica el síntoma biológico según la consciencia del usuario.
- **Admin Maintenance**: El Admin Panel es ahora la herramienta principal para la salud del sistema y auditoría de diagnósticos.
