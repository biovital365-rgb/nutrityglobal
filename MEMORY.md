# MEMORY - Nutrity Global SaaS (2026)

## 🎯 Estado Actual (Mayo 2026)
- **Producto**: Nutrity Global - CRM & Onboarding para Remisión de Diabetes.
- **Enfoque**: Remisión Metabólica Clínica basada en el modelo de 4 secciones (Antropometría, Bioquímica, Estilo de Vida, PNL/Biodescodificación).
- **Integración IA**: Sincronización exitosa con **NotebookLM** (vía MCP) para fundamentación clínica (NMG y Medicina Funcional).
- **Onboarding**: Engine de diagnóstico 100% implementado en `NutrityOnboarding.tsx`, integrando métricas clave como:
    - **Antropometría**: Perímetro de cintura (grasa ectópica).
    - **Bioquímica**: HbA1c y niveles de glucosa en ayuno.
    - **Salud Mental**: Biodescodificación y niveles de consciencia biológica.

### Logros Recientes (Sesión 07-05-2026) 🚀
1.  **Integración de Biodescodificación**: Implementación exitosa del campo `biodescodification` en el onboarding y motor metabólico. El sistema ahora ajusta el Bio-Feedback basándose en la conexión mente-cuerpo (NMG).
2.  **Menú Semanal Dinámico (IA)**: Sustitución del menú estático por un generador dinámico con Gemini 1.5 Flash que diseña dietas de precisión basadas en la fase metabólica y superfoods andinos del paciente.
3.  **Automatización de Citas**: Implementación de lógica de auto-agendamiento que programa un "Diagnóstico Profundo" a los +7 días de completar el onboarding.
4.  **Optimización de Reporte PDF**: El reporte clínico ahora incluye insights emocionales (Biodescodificación), próximos pasos claros y un Call to Action (CTA) hacia la Academia Nutrity.
5.  **Canal de WhatsApp**: Integración de botón flotante animado para acceso directo al canal de actualizaciones de la comunidad.

### Decisiones Arquitectónicas
-   **Generación de IDs en Cliente**: Estándar obligatorio de IDs explícitos con `crypto.randomUUID()` desde el frontend (`db-service.ts`) para inserts/upserts en Supabase.
-   **Modelo de IA Preferido**: `gemini-pro` para Coach e IA generativa estable; `gemini-1.5-flash` para tareas de generación masiva (como menús dinámicos).
-   **Evolución del Onboarding**: Se reemplazó la selección de alimentos estática por la evaluación de conocimientos en Biodescodificación para filtrar el nivel de profundidad de la IA.
-   **Flujo de Sesión**: Priorización absoluta de los datos de evaluación de Supabase en `App.tsx` para evitar que usuarios autenticados vean la pantalla de diagnóstico por error.

### 🛠️ Configuración Técnica Actual
- **Base de Datos**: Supabase (PostgreSQL).
- **IA**: Google Gemini (Pro como principal, Flash para menús).
- **Autenticación**: Firebase Auth sincronizado con Supabase.

---

## 📋 Tareas Pendientes (Roadmap Próxima Sesión)

### 1. Refinamiento del Menú IA 🍽️
- [ ] **Persistencia de Menú**: Guardar el menú generado por IA en Supabase para que no se regenere en cada sesión (evitar consumo de API innecesario).
- [ ] **Regeneración Parcial**: Permitir que el usuario pida cambios en un plato específico ("No me gusta este desayuno, cámbialo").

### 2. Academia y Monetización 💰
- [ ] **Validación de Checkout**: Asegurar que los botones de compra en la sección Academia redirijan correctamente a PayPal/Stripe y actualicen el `plan` del usuario post-pago.
- [ ] **Acceso a eBooks**: Implementar la descarga directa de PDFs de guías una vez comprado el curso/guía.

### 3. UI/UX Móvil 📱
- [ ] **Optimización de Floating Elements**: Verificar que el botón de WhatsApp y el de IA no colisionen en dispositivos con pantallas pequeñas (< 380px).
- [ ] **Modo Offline**: Cachear los superfoods y micronutrientes para consulta sin conexión.

### 4. Administración Avanzada ⚙️
- [ ] **Visibilidad de Biodescodificación**: Mostrar el nivel de biodescodificación del paciente en el Admin Panel para que el médico humano tenga contexto previo.
- [ ] **Filtro de Citas por Estado**: Mejorar la agenda admin para filtrar citas de "Diagnóstico Profundo" vs "Control Rutinario".

---

## 💡 Decisiones de Diseño Importantes
- **User Status Protocol**: El sistema maneja estados `ACTIVE`, `BLOCKED` y `OBSERVED`.
- **Emotional-Driven AI**: La IA no solo prescribe dieta, sino que decodifica el síntoma biológico según la consciencia del usuario.
- **Admin Maintenance**: El Admin Panel es ahora la herramienta principal para la salud del sistema y auditoría de diagnósticos.
