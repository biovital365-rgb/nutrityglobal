# MEMORY - Nutrity Global SaaS (2026)

## Estado Actual (Mayo 2026)
La plataforma **Nutrity Global** ha alcanzado una fase de estabilidad funcional crítica. El motor metabólico ahora es dinámico, el Coach IA está integrado con el catálogo real de Supabase y la Academia ha sido poblada con contenido inicial.

### Logros Recientes 🚀
1.  **Gobernanza Administrativa**: Implementado `AdminPanel` completo con gestión de estados de usuario (`ACTIVE`, `BLOCKED`, `OBSERVED`) y monitoreo de CRM automatizado.
2.  **Seguridad y Control de Acceso**: Implementado bloqueo dinámico en `NutrityDashboard`. Usuarios `BLOCKED` no pueden acceder a las funciones de la app.
3.  **CRM Automatizado**: El botón "Próximo Control" ahora agenda automáticamente una cita (+15 días) y dispara un flujo de WhatsApp pre-configurado.
4.  **Flujo de Dieta Especial**: El Plan Nutricional ahora redirige al modo "Dieta Especial" personalizada por la IA, integrando el diagnóstico con el menú.
5.  **Motor Metabólico Dinámico**: Lógica de aleatoriedad controlada para recomendaciones variadas.
6.  **Sincronización Híbrida**: Las evaluaciones se guardan en Supabase (fuente de verdad) y Firestore (legacy).

### Backlog Inmediato (Sesión Actual) 🛠️
- [ ] **Notificaciones Push/Twilio**: Automatizar el envío de WhatsApp sin intervención manual (Background Jobs).
- [ ] **Seguridad Pro**: Auditar y cerrar todas las políticas RLS en Supabase.
- [ ] **Reporte Premium**: Dinamizar `NutrityReportTemplate.tsx` con los nuevos biomarcadores.

### Decisiones Arquitectónicas
-   **Supabase como Core**: Única fuente de verdad para perfiles y catálogo.
-   **Multi-tenancy Estricto**: Todas las operaciones administrativas requieren validación de `organizationId`.
-   **UUID v4**: Estándar obligatorio para todos los IDs de base de datos.

### 🛠️ Configuración Técnica Actual
- **Base de Datos**: Supabase (PostgreSQL).
- **Autenticación**: Firebase Auth sincronizado con Supabase Profiles.
- **Frontend**: React + Tailwind + Lucide + Motion (Framer).

---

## 📋 Tareas Pendientes (Próxima Sesión)

### 1. Refinamiento de CRM
- [ ] Implementar servicios de mensajería automática (Twilio/WATI).
- [ ] Dashboard de analíticas avanzadas para el Administrador (Tasa de retención, glucosa promedio global).

### 2. UI/UX "Special Diet"
- [ ] Diseñar la vista específica para la dieta personalizada generada por el Asesor IA en la pestaña Menú.

### 3. Seguridad
- [ ] Auditoría de seguridad en Vercel (Secrets, Env Vars).

---

## 💡 Decisiones de Diseño Importantes
- **Bloqueo Temporal**: Se utiliza un modal persistente en el Dashboard que impide la interacción si el estado es `BLOCKED`.
- **Citas Automáticas**: Se definió un offset de 15 días por defecto para el "Próximo Control" como estándar de seguimiento metabólico.
