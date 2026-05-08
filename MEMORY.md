# MEMORY - Nutrity Global SaaS (2026)

## 🎯 Estado Actual (Mayo 2026)
- **Producto**: Nutrity Global - CRM & Onboarding para Remisión de Diabetes.
- **Enfoque**: Remisión Metabólica Clínica basada en el modelo de 4 secciones (Antropometría, Bioquímica, Estilo de Vida, PNL/Biodescodificación).
- **Integración IA**: Sincronización exitosa con **NotebookLM** (vía MCP) para fundamentación clínica (NMG y Medicina Funcional).
- **Onboarding**: Engine de diagnóstico 100% implementado en `NutrityOnboarding.tsx`, integrando métricas clave como:
    - **Antropometría**: Perímetro de cintura (grasa ectópica).
    - **Bioquímica**: HbA1c y niveles de glucosa### Session Summary: Nutrity Global Admin Restoration Interface (Phase 3)

In this session, we successfully completed the implementation of the administrative **"Restore" functionality** in the `AdminPanel`, enabling the recovery of soft-deleted records across the platform.

#### 🛠️ Key Features Implemented
1.  **Backend Recovery Layer**:
    *   Updated `src/lib/db-service.ts` to include `restore` methods for `Food`, `Micronutrient`, `Course`, `User`, and `Appointment` models.
    *   Modified existing `get` methods (e.g., `getFoods`, `getAllUsers`) to accept an optional `includeDeleted` boolean parameter, allowing the Admin UI to toggle the visibility of soft-deleted items.
2.  **Admin Recovery UI**:
    *   Added a `showDeleted` toggle state in `AdminPanel.tsx` to filter the data tables.
    *   Integrated "Restaurar" buttons in the action columns of the Food, Micronutrient, Course, User, and Calendar tables, which only appear when a record's `deletedAt` field is populated.
    *   Implemented `handleRestore` within `AdminPanel.tsx` to communicate with the new `db-service` restoration methods.
3.  **UI Stabilization**:
    *   Fixed corrupted JSX in `AdminPanel.tsx` caused by previous tool failures.
    *   Standardized table rendering and action columns for all entities.

#### 🔑 Key Information & Context
*   **Database Schema**: The platform uses soft-deletion (via a `deletedAt` timestamp column) across all primary entities.
*   **Data Integrity**: Restoration logic simply clears the `deletedAt` field, reverting the record to active status.
*   **Project Path**: `c:\Files ECOTRAFFIC\PROYECTOS 2026\BioVital 365\app Nutrity Global`.

#### ⚠️ Active Blockers & Pending Work
1.  **Monetization**: Gating academy content based on `User.plan` status remains on the roadmap.
2.  **Mobile UX**: The WhatsApp floating button still requires CSS positioning adjustments to prevent overlap on narrow viewports.
3.  **Catalog Sync**: While `force-sync` is implemented, we should monitor its performance as the database grows to ensure timeouts don't occur.

#### 🚀 Roadmap for Future Sessions
1.  **Implement Monetization Gates**: Add logic to `App.tsx` and the `Academy` component to verify `User.plan` before rendering specific content.
2.  **Refine Structured Outputs**: Ensure the AI Metabolic Engine consistently produces high-validity JSON for menu generation.
3.  **Responsive Polish**: Refine the floating WhatsApp button CSS to ensure it respects safe area constraints on mobile devices.
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
