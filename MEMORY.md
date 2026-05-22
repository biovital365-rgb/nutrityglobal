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
1.  **Notificaciones Push/Email**: Avisar al paciente cuando su menú sea aprobado.
2.  **Feedback del Usuario**: Botón "Solicitar Cambios" si el menú aprobado no le convence.
3.  **GEO Audit**: Preparar el contenido para ser indexable por motores de búsqueda generativos.
4.  **Final Launch**: Revisión estética final de la landing page.

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
- [x] **Fase 5: Flujo de Aprobación de Menús** (Completado)
    *   Implementación de Admin Workflow para generación, edición y aprobación de menús.
    *   Integración de estados PENDING/APPROVED en `DailyMenu` para control clínico.
    *   Generación automática de menú semanal en background post-diagnóstico.
    *   Dashboard de usuario actualizado para mostrar solo planes validados por Coach.

- [x] **Fase 6: Estabilización y Modelo 2026** (Completado)
    *   Actualización mandatoria de IA a **Gemini 3 (gemini-3-flash-preview)** para compatibilidad con la infraestructura de Mayo 2026.
    *   Resolución de errores 404 (Model Not Found) y 503 (Overloaded) mediante redundancia y cambio de versión.
    *   Corrección de error de persistencia 401 (RLS) en `DailyMenu` mediante desactivación estratégica de RLS para flujos administrativos.
    *   Optimización de UX móvil con la inclusión del botón "Salir" (Logout) en la barra de navegación inferior y cabecera.
    *   Mejora de observabilidad técnica con logs detallados de errores de API/DB en el Panel Médico.

## Decisiones Arquitectónicas Recientes
1.  **Modelo Gemini 3**: La transición a la serie 3 es obligatoria en 2026. Se utiliza el sufijo `-preview` para asegurar el acceso a los últimos avances en razonamiento clínico.
2.  **Permisos Administrativos (RLS)**: Se optó por desactivar RLS en la tabla `DailyMenu` para el entorno administrativo, priorizando la velocidad de operación y evitando bloqueos de permisos en la generación de planes críticos.
3.  **Logout Accesible**: Para PWAs y dispositivos móviles, el botón de salida debe estar en la zona de pulgar (Bottom Nav) para cumplir con estándares de accesibilidad modernos.
4.  **Resolución Híbrida de Usuarios (Firebase/Supabase)**: En la función `getInternalId`, se implementó una estrategia robusta que prioriza la búsqueda por `firebaseUid` incluso si el identificador entrante es un UUID (como los generados por Supabase Auth). Esto garantiza la integridad referencial en tablas como `Evaluation` cuando el ID autogenerado difiere del proveedor de autenticación.
5.  **Auto-Sincronización en SSR**: Las páginas críticas del servidor (como `dashboard/page.tsx`) llaman proactivamente a `syncUserProfile` para crear el registro en la base de datos si el usuario recién se autenticó, evitando errores 500 y garantizando que se guarde el perfil de salud.

---

## 💡 Decisiones de Diseño Importantes
- **User Status Protocol**: El sistema maneja estados `ACTIVE`, `BLOCKED` y `OBSERVED`.
- **Emotional-Driven AI**: La IA no solo prescribe dieta, sino que decodifica el síntoma biológico según la consciencia del usuario.
- **Admin Maintenance**: El Admin Panel es ahora la herramienta principal para la salud del sistema y auditoría de diagnósticos.

-- Sesión Finalizada 11 Mayo 2026 --
