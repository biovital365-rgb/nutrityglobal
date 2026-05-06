# MEMORY - Nutrity Global SaaS (2026)

## 🎯 Estado Actual (Mayo 2026)
- **Producto**: Nutrity Global - CRM & Onboarding para Remisión de Diabetes.
- **Enfoque**: Remisión Metabólica Clínica basada en el modelo de 4 secciones (Antropometría, Bioquímica, Estilo de Vida, PNL).
- **Integración IA**: Sincronización exitosa con **NotebookLM** (vía MCP) para fundamentación clínica (NMG y Medicina Funcional).
- **Onboarding**: Engine de diagnóstico 100% implementado en `NutrityOnboarding.tsx`, integrando métricas clave como:
    - **Antropometría**: Perímetro de cintura (grasa ectópica).
    - **Bioquímica**: HbA1c y niveles de glucosa en ayuno.
    - **Salud Mental**: Escalas de PNL (Programación Neurolingüística) para adherencia.

### Logros Recientes (Sesión 05-05-2026) 🚀
1.  **Resolución Definitiva de Flujo**: Estandarización de IDs entre Firebase y Supabase mediante el helper `getInternalId`. Eliminación de lógica ambigua basada en longitud de strings.
2.  **Supabase como Fuente de Verdad**: Desactivación de escrituras en Firestore para nuevas evaluaciones. Ahora Supabase centraliza toda la actividad, manteniendo Firestore solo como fallback de lectura para datos legados.
3.  **Sincronización de Perfiles Robusta**: Refactorización de `syncUserProfile` para manejar colisiones de email y asegurar roles de ADMIN de forma determinista.
4.  **Optimización de Auth**: Eliminación de race-conditions al centralizar la sincronización en `App.tsx`, eliminando duplicidad en el componente `Auth.tsx`.

### Decisiones Arquitectónicas
-   **Gobernanza de IDs**: Uso de mapeo dinámico Firebase UID -> Supabase UUID en el `dbService` para garantizar integridad referencial sin sacrificar la flexibilidad de Auth.
-   **Eliminación de Dualidad**: Transición completa hacia Supabase para almacenamiento activo. Firestore entra en modo de "archivo histórico".
-   **Aislamiento SaaS**: Refuerzo del filtrado por `organizationId` y `userId` (interno) en todas las capas del servicio.
-   **Engine de Remisión**: Implementación de un "Target de Remisión" dinámico (15% pérdida de peso) integrado en el onboarding.
-   **PNL en Salud**: Integración de escalas de percepción emocional y compromiso de 12 semanas para ajustar el tono del Coach IA.

### 🛠️ Configuración Técnica Actual
- **Base de Datos**: Supabase (PostgreSQL).
- **IA**: Google Gemini (1.5-Flash).
- **Autenticación**: Firebase Auth sincronizado con Supabase Profiles.
- **Frontend**: React + Tailwind + Lucide + Motion (Framer).

---

## 📋 Tareas Pendientes (Próxima Sesión)

### 1. Verificación de Producción ⚠️
- [ ] **Validar Purga en Vivo**: Una vez completado el despliegue en Vercel, ejecutar la limpieza de duplicados desde el Panel Admin en producción.
- [ ] **Revisar Políticas RLS**: Si el borrado falla, auditar las políticas de `DELETE` en Supabase para las tablas de catálogo. Confirmar que el rol `service_role` o el usuario admin tengan permisos explícitos.
- [ ] **Test de Idempotencia**: Ejecutar un "Seed" manual en producción y verificar que no se creen nuevos duplicados.

### 2. Importación de Datos Históricos
- [ ] **Clarificar Origen de Datos**: Resolver si los datos reales están en `vid-a-ecommerce` o en el proyecto secundario.
- [ ] **Permisos de Firestore**: Habilitar API o configurar Service Account para el script de migración.
- [ ] **Ejecutar Migración**: Correr `scripts/migrate-data.ts` para unificar la base de usuarios antiguos.

### 3. Profundización del Diagnóstico (Salud Integral) 🩺
- [ ] **Ajuste de Insights IA**: Refinar el prompt del Asesor para considerar la correlación entre estrés/sueño y glucosa (integración de indicadores holísticos).
- [ ] **Visualización Bio-Plan**: Implementar la vista de "dieta especial" personalizada en la pestaña de Menú, mostrando los ajustes metabólicos sugeridos por la IA.

### 4. CRM y Reportes
- [ ] **Dashboard de KPIs**: Implementar visualización de métricas de retención y progreso de salud global (Score de Remisión promedio).
- [ ] **Auditoría de PDFs**: Pestaña de logs para el seguimiento de reportes generados.

---

## 💡 Decisiones de Diseño Importantes
- **User Status Protocol**: El sistema maneja estados `ACTIVE`, `BLOCKED` y `OBSERVED`. El estado `BLOCKED` restringe el acceso al Dashboard mediante un modal persistente.
- **Data Integrity First**: No se permiten escrituras masivas sin validación de `organizationId`.
- **Admin Maintenance**: El Admin Panel es ahora la herramienta principal para la salud del sistema, no solo para la gestión de usuarios.
