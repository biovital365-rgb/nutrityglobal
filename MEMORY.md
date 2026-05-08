# MEMORY - Nutrity Global SaaS (2026)

## 🎯 Estado Actual (Mayo 2026)
- **Producto**: Nutrity Global - CRM & Onboarding para Remisión de Diabetes.
- **Enfoque**: Remisión Metabólica Clínica basada en el modelo de 4 secciones (Antropometría, Bioquímica, Estilo de Vida, PNL/Biodescodificación).
- **Integración IA**: Sincronización exitosa con **NotebookLM** (vía MCP) para fundamentación clínica (NMG y Medicina Funcional).
- **Onboarding**: Engine de diagnóstico 100% implementado en `NutrityOnboarding.tsx`, integrando métricas clave como:
    - **Antropometría**: Perímetro de cintura (grasa ectópica).
    - **Bioquímica**: HbA1c y niveles de glucosa### Session Summary: Nutrity Global Admin Restoration Interface (Phase 3)
    - **Bioquímica**: HbA1c y niveles de glucosa

### 🛠️ Features Implemented (Phase 4 Maintenance)
1.  **Clinical Report V7.0**:
    *   Resolved `ReferenceError` in PDF generation by correcting state mapping.
    *   Enriched reports with "Scheduled Diet", "Metabolic Route", and "Health Situation" insights.
    *   Updated download logic for professional presentation.
2.  **AI Engine Stability**:
    *   Migrated Gemini model IDs to `gemini-1.5-flash-latest` to resolve 404 errors in the `v1beta` endpoint.
    *   Improved retry logic and system instructions for deterministic JSON outputs.
3.  **Database Persistence & Schema Sync**:
    *   Synchronized Supabase schema to support `deletedAt` (Soft Delete) and extended profile fields.
    *   Validated `updateUserProfile` flow to ensure profile completion state is correctly persisted.

#### 🔑 Key Context & Decisions
*   **Architecture**: Supabase (PostgreSQL), Firebase (Auth), Gemini 1.5-Flash (Metabolic Core).
*   **Design**: Nature Biotech aesthetics maintained across all clinical modules.

#### ⚠️ Active Issues & Blockers
*   **None**: All critical blockers (Profile Save, PDF Crash, AI 404) have been resolved.

#### 🚀 Next Steps
1.  **Scale Testing**: Monitor user interactions with the new `regenerateMeal` feature.
2.  **SEO/GEO Optimization**: Audit landing page for Generative Engine Optimization (GEO).
3.  **Analytics**: Implement metabolic trend tracking visualizations in the main dashboard.

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
