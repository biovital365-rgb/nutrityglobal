# MEMORY - Nutrity Global SaaS (2026)

## 🎯 Estado Actual (Mayo 2026)
- **Producto**: Nutrity Global - CRM & Onboarding para Remisión de Diabetes.
- **Enfoque**: Remisión Metabólica Clínica basada en el modelo de 4 secciones (Antropometría, Bioquímica, Estilo de Vida, PNL/Biodescodificación).
- **Integración IA**: Sincronización exitosa con **NotebookLM** (vía MCP) para fundamentación clínica (NMG y Medicina Funcional).
- **Onboarding**: Engine de diagnóstico 100% implementado en `NutrityOnboarding.tsx`, integrando métricas clave como:
    - **Antropometría**: Perímetro de cintura (grasa ectópica).
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
1.  **Diagnóstico Nivel Pro (Triaje y NMG Avanzado)**: Elevar la complejidad del motor de diagnóstico. Integrar cuestionarios clínicos más profundos, correlación de síntomas con base científica, y mejoras en la asertividad de la Biodescodificación.
2.  **Gestor de Imágenes y Contenido Landing desde Admin**: Permitir a los administradores cargar, modificar y actualizar las imágenes y textos de la Landing Page desde el Dashboard, sin tocar código (CMS básico).
3.  **Notificaciones Push/Email**: Avisar al paciente cuando su menú sea aprobado.
4.  **Feedback del Usuario**: Botón "Solicitar Cambios" si el menú aprobado no le convence.
5.  **GEO Audit**: Preparar el contenido para ser indexable por motores de búsqueda generativos.
6.  **Stripe Paywall & Admin**: Sistema de pagos implementado con lógica `Mock` de respaldo en `stripe-actions.ts` y control de Suscripciones (Freemium, Basic, Advanced, Elite) integrado desde el Admin Panel.

- **Base de Datos**: Supabase (PostgreSQL) con Prisma ORM.
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
    *   Corrección crítica de SSR en Next.js 16 para rutas dinámicas asíncronas (`params` es un Promise) y estabilización del Autenticador cruzado (Firebase/Supabase).

- [x] **Fase 7: Experiencia Premium y UX/UI Disruptiva** (Completado)
    *   **Diseño Responsive Pro-Max:** Optimización absoluta de pantallas para dispositivos móviles. Transformar la web en una PWA/App nativa desde el navegador.
    *   **Arquitectura de Navegación Amigable:** Rediseño de menús (superiores e inferiores) para un flujo intuitivo, eliminando cualquier tipo de fricción para los pacientes.
    *   **Alertas y Feedback Sensorial:** Integración de *toast notifications*, modales atractivos y estados de carga (loading states) que acompañen emocionalmente al usuario, guiándolo sin estrés tecnológico.
    *   **SaaS Nivel 2:** Incorporación de acabados *glassmorphism*, tipografía *premium* (interlineado y legibilidad), e iteración de micro-animaciones para proyectar un estatus de software médico de élite.

- [x] **Fase 8: Landing Page e Inmersión Informativa** (Completado)
    *   Rediseño completo de la Landing Page emulando el estilo editorial de un eBook clínico.
    *   Integración de infografías interactivas y nativas en CSS para "El Plato Metabólico" y "El Doble Ciclo".
    *   Adaptación de colores institucionales premium (Navy, Forest Green, Cream, Gold).
    *   Conexión de la Landing con la base de datos de artículos del Blog.

## Decisiones Arquitectónicas Recientes
1.  **Modelo Gemini 3**: La transición a la serie 3 es obligatoria en 2026. Se utiliza el sufijo `-preview` para asegurar el acceso a los últimos avances en razonamiento clínico.
2.  **Permisos Administrativos (RLS)**: Se optó por desactivar RLS en la tabla `DailyMenu` para el entorno administrativo, priorizando la velocidad de operación y evitando bloqueos de permisos en la generación de planes críticos.
3.  **Logout Accesible**: Para PWAs y dispositivos móviles, el botón de salida debe estar en la zona de pulgar (Bottom Nav) para cumplir con estándares de accesibilidad modernos.
4.  **Resolución Híbrida de Usuarios (Firebase/Supabase)**: En la función `getInternalId`, se implementó una estrategia robusta que prioriza la búsqueda por `firebaseUid` incluso si el identificador entrante es un UUID (como los generados por Supabase Auth). Esto garantiza la integridad referencial en tablas como `Evaluation` cuando el ID autogenerado difiere del proveedor de autenticación.
5.  **Auto-Sincronización en SSR**: Las páginas críticas del servidor (como `dashboard/page.tsx`) llaman proactivamente a `syncUserProfile` para crear el registro en la base de datos si el usuario recién se autenticó, evitando errores 500 y garantizando que se guarde el perfil de salud.
6.  **Next.js 15+ Params Promise**: Para evitar errores `404 Not Found` en rutas dinámicas (SSR y Generación de Metadatos), el objeto `params` de las rutas debe resolverse asíncronamente obligatoriamente (`const { slug } = await params;`).
7.  **Unificación de Colores Corporativos**: Eliminación completa de colores prohibidos (`purple`, `violet`, `indigo`, `magenta`, `fuchsia`) en favor de la paleta de marca oficial (Teal `--color-nutrity-primary`, Vibrant Lime `--color-nutrity-accent`, y Emerald `--color-nutrity-success`).
8.  **Generación de PDF Off-Screen**: Para evitar la alteración y desconfiguración visual del panel del paciente durante la generación del reporte, el componente `NutrityReportTemplate` se renderiza de forma aislada y oculta en coordenadas absolutas negativas. Se utiliza una resolución dual (`scale: 2`) combinando `html2canvas` y `jsPDF` en formato A4 estándar.
9.  **Flujo Clínico Interactiva (Feedback Loop)**: Habilitación de la caja de texto en el menú semanal para pacientes, permitiendo actualizar el estado a `CHANGES_REQUESTED` y guardar las observaciones directamente en la tabla `DailyMenu` de Supabase, las cuales se listan en el panel administrativo del coach para re-generación o ajuste.
10. **userId Resolution en updateUserProfile**: La función `updateUserProfile` ahora llama obligatoriamente a `getInternalId(userId)` antes de ejecutar el UPDATE en Supabase. Esto resuelve el bug de "perfil no guarda" para usuarios con firebaseUid distinto al UUID interno de la tabla `User`.
11. **Profile Sync en Dashboard SSR**: `dashboard/page.tsx` ahora hace `setUser({ ...authUser, profile: dbProfile })` con el resultado de `syncUserProfile`. Esto garantiza que `user.profile.id` esté siempre disponible en `NutrityDashboard`, eliminando la guard silenciosa que bloqueaba el guardado de perfiles.
12. **PDF Off-Screen Multi-Página**: El componente `NutrityReportTemplate` se renderiza off-screen con `position: absolute; left: -9999px` directamente en `dashboard/page.tsx`. Se usa `html2canvas (scale: 2)` + `jsPDF` con iteración sobre `[id^='pdf-page-']` para generar un PDF A4 multi-página con alta fidelidad.
13. **Emotional-Driven AI (NMG V8)**: El `systemPrompt` de `getAICoachResponse` en `ai-service.ts` ahora incluye el protocolo NMG/Biodescodificación: decodificación de conflicto biológico para síntomas físicos + acción metabólica concreta + empoderamiento PNL. Modelo cambiado a `gemini-1.5-flash` por mayor estabilidad.
14. **User Status Protocol Completo**: `AdminUsersTab.tsx` expone `onStatusChange` (prop opcional) con 3 botones pill (ACTIVE/OBSERVED/BLOCKED) en el cardex y un select en el modal de edición. El handler en `AdminPanel.tsx` llama `updateUserStatus`, refresca la lista y sincroniza el estado del cardex abierto en tiempo real.
15. **Corrección de Schema y Sincronización DB**: Se integró el modelo `PDFReportLog` directamente a Prisma para habilitar el guardado sin Errores 500 y mostrar analíticas reales en Admin Panel.
16. **Prevención de Pérdida de Datos (DailyMenu)**: Se añadieron a Prisma campos operacionales críticos (`status`, `phase`, `approvedBy`, `adminNotes`, `weekStart`, `approvedAt`) en `DailyMenu` para evitar que un `npx prisma db push` elimine datos de producción en Supabase, alineando el ORM con los Server Actions.
17. **Forzado de Rol y Plan ELITE en Sincronización**: Se ajustó `syncUserProfile` en `db-actions.ts` para que cualquier SuperAdmin pre-definido en el array sea forzado a mantener `role: 'ADMIN'` y `plan: 'ELITE'` sin importar su estado previo, previniendo que se muestre como 'Básico (FREE)' en la UI.
18. **Auditoría de Descarga PDF**: El evento `handleGeneratePDF` en el Dashboard ahora ejecuta el Server Action `logPDFReport` con estado 'DOWNLOADED' o 'ERROR', habilitando la trazabilidad del SaaS en el panel de administrador.
19. **Recuperación de Assets Base**: Se restablecieron las imágenes crudas en el directorio `public/` de Next.js (`tarwi.png`, `yacon.png`, etc.) copiándolas desde el root antiguo, eliminando los 404 Not Found en las consultas a la base de datos de Alimentos.
20. **Diagnóstico Nivel Pro (NMG & Biometría)**: El componente `NutrityOnboarding.tsx` fue rediseñado a un formato "Premium", reemplazando inputs libres por rangos estructurados e incorporando indagación inductiva del "Síndrome de Dirk Hamer" (DHS), asegurando consistencia clínica pre-procesada antes de enviar a Gemini. La paleta de colores del formulario (Forest Green, Cream, Gold) ahora emula directamente la experiencia visual del eBook oficial.
21. **Sincronización de Blog y Ajuste de Hero Landing**: Se centralizó el estado de los artículos de blog en el componente padre `AdminPanel.tsx` para sincronizar en tiempo real el contador en la barra de navegación del administrador. Se redefinió la interfaz `AdminBlogTabProps` para eliminar tipos implícitos y usar tipado estricto (KISS/Type Safety), solucionando lints de estado síncronos. En `NutrityLanding.tsx`, se removió la opacidad reducida (opacity-90), el desenfoque artificial (backdrop-blur) y se redujo la capa blanca superior a `bg-white/10` para lograr que la imagen principal del landing luzca nítida, contrastada y fiel a su versión original como fondo de la sección.
22. **TikTok CMS Dinámico y Generación de Menú en Servidor**: Se añadió soporte en el CMS para gestionar los 4 videos de TikTok (título, enlace real e imagen de portada base64 o URL) de forma dinámica, cargando en el dashboard del paciente con estética nativa móvil de TikTok (simulando interacciones verticales, disco musical y tickers animados definidos en globals.css). Asimismo, la generación de menú semanal se movió al servidor en `generateAIWeeklyMenuSecure` (evitando key exposure), configurando un plan de 7 días consecutivos a partir del día siguiente a la generación y aplicando fallback automático a `gemini-1.5-flash` si `gemini-2.5-flash` supera límites de cuota (429).

---

## 💡 Decisiones de Diseño Importantes
- **User Status Protocol**: El sistema maneja estados `ACTIVE`, `BLOCKED` y `OBSERVED`.
- **Emotional-Driven AI**: La IA no solo prescribe dieta, sino que decodifica el síntoma biológico según la consciencia del usuario.
- **Premium Onboarding UI**: Se utiliza una paleta de colores específica (Forest Green, Gold, Cream) para emular la estética de un "libro/revista" clínica, elevando el valor percibido del diagnóstico.
- **Admin Maintenance**: El Admin Panel es ahora la herramienta principal para la salud del sistema y auditoría de diagnósticos.
