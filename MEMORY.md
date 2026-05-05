# MEMORY - Nutrity Global SaaS (2026)

## Estado Actual (Mayo 2026)
La plataforma **Nutrity Global** ha evolucionado hacia un enfoque de **Salud Integral (Holística)**. El motor metabólico ahora integra indicadores de estilo de vida (sueño, estrés, actividad), el Coach IA está sincronizado con el catálogo de Supabase y el diagnóstico se ha profundizado para servir como base de resultados bio-individualizados.

### Logros Recientes (Sesión 05-05-2026) 🚀
1.  **Integridad de Datos**: Corregida duplicación (5x) mediante IDs deterministas y herramienta de deduplicación en el Panel Admin.
2.  **Gobernanza Administrativa**: Dashboard robusto para gestión de usuarios, citas y catálogo sincronizado con Supabase.
3.  **Salud Integral**: Rediseño del diagnóstico centrado en bio-individualidad (sueño, estrés, metabolismo).

### Decisiones Arquitectónicas
-   **Idempotencia de Catálogo**: Uso de IDs deterministas en `dbService` para evitar duplicados en el seeding.
-   **Mapeo de IDs Dual**: Resolución automática entre Firebase UID y Supabase UUID.
-   **Multi-tenancy SaaS**: Filtrado estricto por `organizationId` para aislamiento de datos de salud.
-   **Supabase como Core**: Única fuente de verdad para perfiles y catálogo holístico.

### 🛠️ Configuración Técnica Actual
- **Base de Datos**: Supabase (PostgreSQL).
- **IA**: Google Gemini (1.5-Flash).
- **Autenticación**: Firebase Auth sincronizado con Supabase Profiles.
- **Frontend**: React + Tailwind + Lucide + Motion (Framer).

---

## 📋 Tareas Pendientes (Próxima Sesión)

### 1. Importación de Datos (Blocker Identificado) ⚠️
- [ ] **Clarificar Origen de Datos**: Se detectó que el proyecto `nutrity-e043a` tiene la API de Firestore deshabilitada. Es necesario confirmar si los datos reales están en `vid-a-ecommerce` o en otro proyecto.
- [ ] **Permisos de Migración**: Para importar usuarios y evaluaciones desde Firebase, se requiere o bien habilitar la API de Firestore, o proporcionar un Service Account JSON para el script de migración.
- [ ] **Ejecutar `scripts/migrate-data.ts`**: Una vez aclarado el origen y los permisos, correr el script para poblar Supabase con la data histórica.

### 2. Profundización del Diagnóstico (Salud Integral) 🩺
- [x] **Rediseñar Onboarding**: Añadir pasos de Calidad de Sueño, Niveles de Estrés y Salud Digestiva.
- [x] **Evolucionar Motor Metabólico**: Ajustar `metabolic-engine.ts` para ponderar factores holísticos en el Score de Remisión.
- [ ] **Ajuste de Insights IA**: Refinar el prompt del Asesor para considerar la correlación entre estrés/sueño y glucosa.

### 3. Refinamiento de CRM y Automatización
- [ ] Implementar servicios de mensajería automática real (Twilio/WATI) para el seguimiento de citas.
- [ ] Dashboard de analíticas avanzadas para el Administrador (Tasa de retención, KPIs de salud global).

### 4. UI/UX "Special Diet"
- [ ] Diseñar la vista específica para la dieta personalizada generada por el Asesor IA en la pestaña Menú. Actualmente redirige a Menú, pero falta la capa de visualización "Especial".

### 4. Seguimiento de Reportes
- [ ] Integrar visualización de logs de reportes PDF (Éxito/Error) en una pestaña dedicada dentro de Admin para auditoría clínica.

---

## 💡 Decisiones de Diseño Importantes
- **Bloqueo Temporal**: Se utiliza un modal persistente en el Dashboard que impide la interacción si el estado es `BLOCKED`.
- **Dual Cloud Persistence**: Se mantiene el guardado en Firestore solo por compatibilidad legacy, pero Supabase es el disparador de la lógica de negocio.
- **Mapeo Transparente**: El desarrollador/administrador puede usar tanto el UID de Firebase como el UUID de Supabase en las llamadas al servicio, el sistema lo resuelve internamente.
