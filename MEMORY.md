# MEMORY - Nutrity Global SaaS (2026)

## Estado Actual (Mayo 2026)
La plataforma **Nutrity Global** ha evolucionado hacia un enfoque de **Salud Integral (Holística)**. El motor metabólico ahora integra indicadores de estilo de vida (sueño, estrés, actividad), el Coach IA está sincronizado con el catálogo de Supabase y el diagnóstico se ha profundizado para servir como base de resultados bio-individualizados.

### Logros Recientes (Sesión 04-05-2026) 🚀
1.  **Gobernanza Administrativa Total**: Finalizado el `AdminPanel` con CRUD completo para Usuarios y Citas. Los administradores pueden editar perfiles, cambiar planes y eliminar registros con sincronización en Supabase.
2.  **Resolución de Bucle de Onboarding**: Refactorizado `db-service.ts` para manejar el sistema dual de IDs (Firebase UID vs Supabase UUID). Esto permite que usuarios existentes (ej. `aliendredilan@gmail.com`) entren directamente al Dashboard sin repetir el diagnóstico.
3.  **Estabilización de IA Advisor**: Migración del modelo a **`gemini-1.5-flash`** para garantizar respuestas rápidas y fiables, superando bloqueos de cuota o compatibilidad de versiones anteriores.
4.  **CRM de Citas**: Implementada la gestión global de agenda. Los cambios en el panel administrativo se reflejan en tiempo real para los usuarios finales.
5.  **Despliegue Continuo**: Pushed a `main` y redeploy en Vercel ejecutado con éxito.

### Decisiones Arquitectónicas
-   **Mapeo de IDs en DB Service**: El servicio de base de datos ahora resuelve automáticamente la correspondencia entre `firebaseUid` y el ID interno de Supabase para todas las operaciones de Evaluación, Citas y Mediciones.
-   **Supabase como Core**: Única fuente de verdad para perfiles y catálogo.
-   **Multi-tenancy Estricto**: Todas las operaciones administrativas requieren validación de `organizationId`.
-   **UUID v4**: Estándar obligatorio para todos los IDs de base de datos.

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
