# MEMORY - Nutrity Global SaaS (2026)

## 🎯 Estado Actual (Mayo 2026)
- **Producto**: Nutrity Global - CRM & Onboarding para Remisión de Diabetes.
- **Enfoque**: Remisión Metabólica Clínica basada en el modelo de 4 secciones (Antropometría, Bioquímica, Estilo de Vida, PNL).
- **Integración IA**: Sincronización exitosa con **NotebookLM** (vía MCP) para fundamentación clínica (NMG y Medicina Funcional).
- **Onboarding**: Engine de diagnóstico 100% implementado en `NutrityOnboarding.tsx`, integrando métricas clave como:
    - **Antropometría**: Perímetro de cintura (grasa ectópica).
    - **Bioquímica**: HbA1c y niveles de glucosa en ayuno.
    - **Salud Mental**: Escalas de PNL (Programación Neurolingüística) para adherencia.

### Logros Recientes (Sesión 06-05-2026) 🚀
1.  **Estabilización de Persistencia**: Resolución de errores 400 (Bad Request) y 409 (Conflict) en Supabase. Se eliminó el campo `updatedAt` de los payloads ya que no existe en el esquema actual de producción.
2.  **Transición de IA**: Migración del modelo principal a **`gemini-pro`** debido a errores 404 constantes con `gemini-1.5-flash`. Se mantiene el fallback entre modelos para garantizar resiliencia.
3.  **Sincronización de Perfiles**: Corrección de la lógica de creación de usuarios en `db-service.ts`, asegurando que los nuevos registros se vinculen correctamente con Supabase sin errores de sintaxis.
4.  **Limpieza de Ruido Firestore**: Identificación de los logs de "Database (default) not found" como ruido heredado; el sistema ya opera satisfactoriamente sobre Supabase.

### Decisiones Arquitectónicas
-   **Generación de IDs en Cliente**: Debido a la ausencia de generación de UUIDs por defecto a nivel de base de datos (`gen_random_uuid()`) en algunas tablas como `User`, `Evaluation` y `LessonProgress`, se estableció como estándar obligatorio la generación de IDs explícitos con `crypto.randomUUID()` desde el frontend (`db-service.ts`) antes de hacer inserts/upserts. Esto previene fallos silenciosos y errores 400.
-   **Modelo de IA Preferido**: `gemini-pro` se establece como estándar de estabilidad para el Coach IA hasta que la cuota/disponibilidad de Flash se normalice.
-   **Esquema de Datos**: Se prioriza la compatibilidad estricta con las columnas existentes en Supabase para evitar fallos de inserción silenciosos o 400.
-   **Flujo de Sesión**: Priorización absoluta de los datos de evaluación de Supabase en `App.tsx` para evitar que usuarios autenticados vean la pantalla de diagnóstico por error.

### 🛠️ Configuración Técnica Actual
- **Base de Datos**: Supabase (PostgreSQL).
- **IA**: Google Gemini (Pro como principal, Flash como fallback).
- **Autenticación**: Firebase Auth sincronizado con Supabase.

---

## 📋 Tareas Pendientes (Próxima Sesión)

### 1. Evolución del Esquema (Base de Datos) ⚠️
- [ ] **Añadir Columna `updated_at`**: Ejecutar migración SQL en Supabase para añadir `updated_at` (con trigger `moddatetime`) a las tablas `User`, `Evaluation`, `Measurement` y `Appointment`.
- [ ] **Estandarización de Timestamps**: Una vez añadida la columna, restaurar la lógica de `updatedAt` en `db-service.ts` usando el formato ISO.

### 2. UI/UX y Multimedia
- [ ] **Fix de Imágenes 404**: Corregir las rutas de imágenes en el catálogo (ej. `yacon...png`) que no cargan en el dashboard.
- [ ] **Auditoría de Sesión**: Verificar que el estado `onboardingCompleted` se mantenga persistente tras cierres de sesión prolongados.

### 3. Profundización del Diagnóstico (Salud Integral) 🩺
- [ ] **Refinar Prompt del Coach**: Ajustar las instrucciones del sistema para `gemini-pro` para que aproveche mejor el historial de mediciones en lugar de solo la última evaluación.
- [ ] **Visualización Bio-Plan**: Implementar la vista de "dieta especial" personalizada basada en los resultados metabólicos.

### 4. Limpieza Final de Código
- [ ] **Remoción de SDK Firebase (Firestore)**: Una vez confirmada la estabilidad total en producción, eliminar el SDK de Firestore de `firebase.ts` y sus dependencias en `package.json` para eliminar los logs de error de base de datos no encontrada.

---

## 💡 Decisiones de Diseño Importantes
- **User Status Protocol**: El sistema maneja estados `ACTIVE`, `BLOCKED` y `OBSERVED`. El estado `BLOCKED` restringe el acceso al Dashboard mediante un modal persistente.
- **Data Integrity First**: No se permiten escrituras masivas sin validación de `organizationId`.
- **Admin Maintenance**: El Admin Panel es ahora la herramienta principal para la salud del sistema, no solo para la gestión de usuarios.
