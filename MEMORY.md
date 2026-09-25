# MEMORY - Nutrity Global SaaS (2026)

> [!IMPORTANT]
> **Estado canónico vigente desde el 18 de septiembre de 2026.** Las secciones históricas posteriores se conservan únicamente como registro de evolución. Cualquier referencia anterior a NMG, biodescodificación, diagnóstico automatizado, puntajes o promesas de remisión, proyecciones de glucosa, causas emocionales o cambio de medicación está retirada y no debe reutilizarse como requisito de producto.

## Estado actual — Fase 3 publicada (18 sep 2026)

- **Marca oficial:** Nutrity Global es la aplicación y el producto comercial. BioVital.360 es exclusivamente el canal de contenido, adquisición y comunidad. BioVital 365 está descartada.
- **Producto vigente:** Ruta Nutrity educativa de 12 semanas, con seis etapas, cuatro o cinco acciones semanales, progreso persistente y reporte educativo.
- **Seguridad clínica:** el onboarding incluye consentimiento explícito y detiene el recorrido ante dolor de pecho, dificultad respiratoria, confusión, desmayo o vómitos persistentes, mostrando derivación urgente.
- **IA:** limitada a ejemplos educativos de menús y coaching de hábitos; no diagnostica, prescribe, interpreta síntomas como causas emocionales ni promete resultados clínicos.
- **Aplicación oficial:** Next.js en `nutrity-nextjs`. Los componentes heredados de numerología y diagnóstico fueron retirados del producto activo.
- **Producción:** [https://nutrityglobal-tau.vercel.app](https://nutrityglobal-tau.vercel.app), despliegue Vercel **Ready / Production**.
- **Commits publicados:** `f644dd2` (seguridad, privacidad y rediseño del MVP), `673b61c` (alineación del build con el root configurado en Vercel) y `f098fa3` (cierre de marca, oferta, embudo y Academia de Fase 3).
- **Verificación:** TypeScript y ESLint sin errores; landing, onboarding, autenticación, privacidad, términos y activos de marca validados visualmente en producción. El endpoint de métricas aceptó un evento anónimo de auditoría con HTTP 202.
- **Fase 3:** identidad N Ruta Clara integrada con activos locales, oferta beta simplificada, embudo medible con consentimiento, Academia organizada como ruta guiada y Manual de Marca 1.0 beta.
- **Oferta pública beta:** Gratis, Nutrity Plus (USD 9,99/mes), Ruta Nutrity 12 semanas (USD 49/mes) y Profesional (USD 149/mes). Stripe es la única pasarela visible; PayPal queda fuera de la interfaz hasta ofrecer paridad de recurrencia y cancelación.
- **Auditoría:** el guion de pruebas reales está en `docs/CHECKLIST-AUDITORIA-FASE-3.md`. La publicación y la ejecución con cuentas reales son el siguiente control operativo.
- **Skill de marca:** `nutrity-brand-strategist` validado e instalado en Codex; su fuente versionable está en `skills/nutrity-brand-strategist`.

## Cierre PMV posterior a prueba de usuario — 25 sep 2026

- **Perfil obligatorio coherente:** un usuario `ACTIVE` ya no evita la ficha obligatoria. Nombre, correo, celular válido, edad, dirección, ocupación y estado civil deben estar completos antes de habilitar el resto del panel.
- **Perfil accesible:** campos con `id`, `name`, etiquetas asociadas, autocompletado, límites, ayuda visible y botón de guardado deshabilitado mientras falten datos válidos.
- **Academia segura:** filtro defensivo ampliado para retirar de títulos, descripciones, lecciones e instrucciones las promesas de cura, reversión, control de glucosa, prevención y resultados clínicos absolutos provenientes del contenido heredado.
- **Oferta única:** Academia usa exclusivamente los nombres Nutrity Plus, Ruta Nutrity 12 semanas y Nutrity Profesional. Se retiraron la compra individual y las referencias públicas a PayPal; el checkout beta visible continúa únicamente mediante los planes de Stripe.
- **Mediciones:** renombradas como registro personal; se retiraron “marcadores críticos” y “Evaluación IA”. Glucosa, peso y A1c tienen unidades explícitas y validación cliente/servidor; presión arterial queda fuera hasta contar con un formulario sistólica/diastólica adecuado.
- **IA Coach:** mantiene el alcance educativo, elimina Markdown literal y añade etiquetas accesibles al campo y al botón de envío.
- **Móvil:** el acceso a inicio usa un icono de hogar y la navegación inferior comunica que contiene más secciones mediante desplazamiento horizontal.
- **Validación técnica:** `git diff --check`, ESLint, TypeScript y build de producción de 20 rutas aprobados. El build local requiere variables públicas de Supabase; la validación se ejecutó con valores efímeros de compilación, sin guardar secretos.

## Tareas pendientes priorizadas

### Hallazgos de la primera prueba real (18 sep 2026)

- [x] Corregir el contrato de actualización de perfiles para que Superadmin pueda guardar datos básicos, rol, plan y estado sin error 500, manteniendo esos tres campos restringidos a ADMIN.
- [x] Añadir “Otra” a la barrera principal del onboarding y un campo breve para especificarla.
- [x] Añadir una confirmación explícita y no ambigua: “Ninguna de las anteriores — quiero continuar con mi Ruta Nutrity”; cualquier señal urgente sigue bloqueando el recorrido.
- [x] Publicar en producción los ajustes de perfil, onboarding, marca, oferta, embudo y Academia.
- [ ] Repetir las pruebas reales con Superadmin, Coach y usuario nuevo usando `docs/CHECKLIST-AUDITORIA-FASE-3.md`.
- [x] Rediseñar Academia como una ruta guiada por unidades interactivas con la metodología “Comprende, practica y registra”, manteniendo progresión, evaluaciones y retos.
- [x] Retirar de la interfaz activa promesas clínicas o absolutas del contenido académico y aplicar un filtro defensivo al contenido heredado de la base de datos. La revisión clínica externa sigue pendiente.
- [x] Crear el Manual de Marca 1.0 beta de Nutrity Global y el sistema de convivencia con BioVital.360.
- [x] Reemplazar el logotipo remoto por activos SVG locales/versionados y definir variantes positiva, negativa, monocroma y micro.
- [x] Corregir la validación y accesibilidad del perfil nuevo, evitando que el estado `ACTIVE` omita los datos obligatorios.
- [x] Unificar Academia con la oferta beta y retirar compras individuales/PayPal de la interfaz activa.
- [x] Reforzar el filtro de lenguaje clínico heredado en Academia, IA Coach y Mediciones.
- [ ] Repetir la prueba real del perfil nuevo completando un celular válido y verificando guardado, desbloqueo del panel y persistencia tras recargar.

### P0 — Seguridad antes de dirigir tráfico

- [x] Ejecutar escaneo inicial del árbol, 195 commits alcanzables y objetos Git no alcanzables. Resultado documentado en `docs/SECURITY-SCAN-2026-09-25.md`; se encontraron una clave Gemini histórica, exportaciones de usuarios recuperables, `dev.db` versionada, seis JWT `anon` incrustados y cinco blobs no alcanzables con señales de información personal.
- [ ] Rotar credenciales de Gemini, Supabase/PostgreSQL, Stripe, PayPal, Resend y cualquier secreto que haya estado versionado o compartido.
- [ ] Comprobar que las credenciales antiguas están revocadas y documentar evidencia de la rotación.
- [ ] Reescribir y purgar el historial Git que contiene secretos o exportaciones antiguas; ejecutar un nuevo escaneo del historial y del árbol vigente.
- [ ] Revisar las 12 alertas actuales de `npm audit` —1 baja, 2 moderadas, 8 altas y 1 crítica—, identificar dependencias alcanzables y aplicar actualizaciones compatibles sin usar `--force` de forma ciega.
- [ ] Repetir typecheck, lint, build y pruebas funcionales después de resolver dependencias.

### P1 — Dominio, QA y validación clínica

- [ ] Definir y conectar el dominio comercial definitivo. `nutrityglobal.vercel.app` devuelve actualmente 404; el dominio activo es `nutrityglobal-tau.vercel.app`.
- [ ] Actualizar enlaces públicos, metadata, correos, webhooks y documentación cuando se apruebe el dominio definitivo.
- [ ] Obtener revisión clínica externa del contenido educativo, señales de alarma y mensajes de derivación.
- [ ] Ejecutar E2E con cuentas reales de prueba para los casos: recorrido normal, datos opcionales omitidos y cada señal de alarma.
- [ ] Validar móvil y escritorio: onboarding, Ruta Nutrity, checklist semanal, menús, coach, reporte y privacidad.
- [ ] Probar aislamiento horizontal entre usuarios y organizaciones, roles ADMIN/COACH/USER y bloqueo de recursos premium.
- [ ] Probar Stripe en sandbox: checkout, webhook firmado, idempotencia, activación, cancelación y rechazo de importes/planes manipulados. PayPal no forma parte de la oferta pública beta.
- [ ] Probar exportación y eliminación de cuenta con datos reales de prueba.

### P1 — Observabilidad posterior al despliegue

- [ ] Revisar Vercel Runtime Logs, tasa de errores y tiempos de respuesta durante las primeras 24–48 horas.
- [ ] Vigilar el pool de conexiones de Supabase/PostgreSQL y verificar que producción usa el Transaction Pooler previsto.
- [ ] Confirmar recepción y procesamiento idempotente de webhooks sin errores silenciosos.
- [ ] Revisar errores 404 de assets y URLs antiguas del catálogo antes de la beta.

### P2 — Fase 3: marca, oferta y embudo

- [x] Completar barrido de interfaz, correos, PDFs, metadata, Academia y administración: Nutrity Global como producto y BioVital.360 solo como canal.
- [x] Crear e instalar el skill `nutrity-brand-strategist` para estrategia, identidad, manual, co-branding y control de claims.
- [x] Consolidar el Manual de Marca 1.0 beta con posicionamiento, arquitectura, voz, paleta, tipografía, usos y activos de N Ruta Clara.
- [x] Incorporar `public/logo.png` como propuesta real del fundador y evaluarla frente a Ruta Clara, sin sustituirla. Se documentaron tres evoluciones provisionales.
- [x] Evaluar la variante 02 del logotipo con “y” amarilla: queda como candidata principal a color, condicionada a pruebas de contraste y escala; la versión verde se conserva como referencia monocromática.
- [x] Preparar prototipos conceptuales de Conservación óptica y N Ruta Clara, más una lámina comparativa, en `docs/brand-prototypes/`.
- [x] Decisión de marca: Prototipo B — N Ruta Clara aprobado por el propietario el 18 de septiembre de 2026.
- [x] Crear familia vectorial inicial del símbolo en color, monocroma, negativa y micro, más prueba técnica de 16, 24, 48 y 160 px. Regla provisional: símbolo completo desde 48 px y micro entre 16–32 px.
- [x] Integrar la familia beta de N Ruta Clara y el wordmark vectorial en landing, autenticación, onboarding, panel, favicon y Open Graph. Un refinamiento tipográfico registrable puede realizarse después de la auditoría.
- [x] Definir embudo mínimo, eventos y oferta inicial en `docs/FASE-3-MARCA-OFERTA-EMBUDO.md`.
- [x] Definir y preparar la oferta beta visible: Gratis, Nutrity Plus, Ruta Nutrity 12 semanas y Profesional.
- [x] Definir precio, moneda, renovación, cancelación, revisión de primera compra, soporte y límites del acompañamiento en términos visibles.
- [x] Instrumentar eventos del embudo con consentimiento: visita, CTA, onboarding, registro, ruta, primera acción, plan, checkout, pago y Academia.
- [x] Crear checklist de control de marca, embudo, pagos, perfiles, Academia y roles para la auditoría posterior a publicación.
- [ ] Preparar beta cerrada con 20 participantes de BioVital.360 y medir finalización, activación, retorno D7, soporte e incidentes.
- [ ] Evaluar resultados de la Fase 2 en la próxima sesión antes de ampliar alcance o abordar insuficiencia renal.

## 🗄️ Estado histórico (Mayo 2026 — no vigente)
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

#### 🚀 Next Steps (Hoja de Ruta Post-Testing E2E)
1. **Testing E2E Producción**: Ejecución del protocolo de pruebas en Vercel (validación de onboarding, descarga dual de expedientes y descarga segura de recursos LMS).
2. **Monitoreo (Day 1)**: Observabilidad en Vercel Runtime Logs y consumo del Connection Pooler de Supabase (puerto 6543) durante las primeras 24-48h de tráfico masivo.
3. **[Prioridad Media/Futura] Cuotas Duras IA**: Evaluación de un límite estricto de generación IA por plan (BASIC, PREMIUM, ELITE) a nivel de base de datos.
4. **[Prioridad Media/Futura] Sanación de Base de Datos**: Script de limpieza directa en Supabase para depurar URLs antiguas de alimentos o micronutrientes rotos.
5. **Carga Masiva de Contenido**: Desplegar los cursos restantes.
6. **Diagnóstico Nivel Pro**: Triaje y NMG Avanzado, elevando la profundidad de los cuestionarios clínicos.
7. **Gestor CMS**: Permitir a administradores cargar imágenes y textos de la Landing Page desde el Dashboard.

- **Base de Datos**: Supabase (PostgreSQL) con Prisma ORM (Sincronizado vía `db push`).
- **IA**: Google Gemini 1.5-Flash (Chunking asíncrono implementado).
- **Estrategia de Persistencia**: Deterministic IDs + Logical Deletion + RLS Policies.

### 🛡️ Decisiones de Arquitectura Recientes (Auditoría Técnica - Bloque A)
- **Seguridad**: Se eliminó completamente la exposición de la API Key de Gemini en el bundle de cliente (`NEXT_PUBLIC_GEMINI_API_KEY`). Ahora se usa exclusivamente `GEMINI_API_KEY` en entorno servidor.
- **SSOT IA**: Se eliminó el archivo duplicado `ai-service.ts`. Toda la lógica de inteligencia artificial (modelos, prompts y rate-limiting) se ha consolidado en `src/actions/ai-actions.ts` usando "use server".
- **Unificación de Modelos**: Se definió `gemini-2.5-flash` como modelo principal por defecto, con fallback a `gemini-1.5-flash` para estabilidad.

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

- [x] **Fase 9: Transición a SaaS B2C (Pagos y Tematización Dinámica)** (Completado)
    *   **Notificaciones Transaccionales**: Integración con `Resend` para correos de bienvenida automáticos (Onboarding) y notificaciones de "Menú Aprobado".
    *   **Rate Limiting IA**: Restricción anti-abuso implementada en `ai-actions.ts` limitando la generación a 14 días/menús cada 24 horas por usuario FREE.
    *   **Seguridad de Producción (RLS)**: Aplicación de scripts SQL en Supabase para bloquear el acceso de lectura/escritura en la tabla `DailyMenu` asegurando la privacidad B2C.
    *   **Multi-tenant Simplificado (Coach-Paciente)**: Sistema de `invitation_org_id` capturado vía URL (`?ref=ORG_ID`) e inyectado desde el `localStorage` directo al `syncUserProfile` en la base de datos.
    *   **Tematización Dinámica UI**: Inyección de variables CSS HSL vía `ThemeInjector` para cambiar completamente la paleta visual del dashboard según el plan del usuario (Verde: FREE, Azul: BASIC, Plata: PREMIUM, Dorado: ELITE).
    *   **Integración Pasarela PayPal**: Implementación de pago de suscripciones y webhooks de PayPal (`src/app/api/webhooks/paypal/route.ts`), enrutando compras a niveles `BASIC`, `PREMIUM` y `ELITE`, y control visual de planes en `SubscriptionTab.tsx`.

- [x] **Fase 10: LMS Evaluaciones y Assignments (Fase 2 del LMS)** (Completado)
    *   **Evaluaciones Clínicas**: Integración del motor de Quizzes (múltiple opción) para validar conceptos como el "Escudo de Fibra" y la regla visual 50-25-25.
    *   **Retos de Integración (Assignments)**: Creación del flujo de tareas escritas donde el alumno propone platos y el Coach las evalúa en el Admin Panel.
    *   **Feedback Loop Educativo**: Estados `PENDING` a `REVIEWED` con almacenamiento del objeto `answers` íntegro y cálculo automático de aprobación (`score >= 7`).
    *   **Visibilidad Administrativa**: Consolidación del Tab de `Submissions` en el Admin Panel para visualizar tanto intentos de Quizzes como tareas redactadas de los pacientes.

- [x] **Fase 11: Consolidación LMS, Coaches y Recetas** (Completado)
    *   **Backend as Single Source of Truth**: `verifyLessonAccess` protege server actions. El score de los quizzes se calcula zero-trust en el servidor. `LessonProgress` está dictado por el backend eliminando toggles falsos. Límite global de 3 intentos en Quizzes asegurado vía Prisma.
    *   **Descargas Seguras**: Implementado proxy HTTP `/api/academic/download` que enmascara URLs premium (PDFs y PPTs).
    *   **Panel de Coaches**: Implementación estricta de `AssignmentStatus` (PENDING, REVIEWED, APPROVED, REJECTED). Regla de negocio: Solo `REJECTED` permite reenvío. Color-coding de estados en la UI del alumno.
    *   **Catálogo Editorial de Recetas**: Mapeo 1:1 entre Admin panel y UI Cliente (`instructions` -> Perfil Metabólico, `tip` -> TIP BioVital 360, `additionalNotes` -> Precauciones). Compatibilidad retroactiva garantizada y tipado estricto consolidado.

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
11. **Estructura Eficiente de Lecciones LMS**: Para mantener la base de datos ligera y rápida (evitando blobs binarios en Supabase), el modelo `Lesson` fue refactorizado para administrar los recursos mediante URLs públicas en 3 bloques independientes (Video, Presentación, PDF), cada uno con su respectiva caja de instrucciones de texto. Al recuperar el curso principal (`getCourses`), el backend ahora realiza un join implícito (`select('*, lessons:Lesson(*)')`) para inyectar todas las lecciones directamente en la memoria del panel, agilizando la experiencia de edición.
12. **Profile Sync en Dashboard SSR**: `dashboard/page.tsx` ahora hace `setUser({ ...authUser, profile: dbProfile })` con el resultado de `syncUserProfile`. Esto garantiza que `user.profile.id` esté siempre disponible en `NutrityDashboard`, eliminando la guard silenciosa que bloqueaba el guardado de perfiles.
13. **PDF Off-Screen Multi-Página**: El componente `NutrityReportTemplate` se renderiza off-screen con `position: absolute; left: -9999px` directamente en `dashboard/page.tsx`. Se usa `html2canvas (scale: 2)` + `jsPDF` con iteración sobre `[id^='pdf-page-']` para generar un PDF A4 multi-página con alta fidelidad.
14. **Emotional-Driven AI (NMG V8)**: El `systemPrompt` de `getAICoachResponse` en `ai-service.ts` ahora incluye el protocolo NMG/Biodescodificación: decodificación de conflicto biológico para síntomas físicos + acción metabólica concreta + empoderamiento PNL. Modelo cambiado a `gemini-1.5-flash` por mayor estabilidad.
15. **User Status Protocol Completo**: `AdminUsersTab.tsx` expone `onStatusChange` (prop opcional) con 3 botones pill (ACTIVE/OBSERVED/BLOCKED) en el cardex y un select en el modal de edición. El handler en `AdminPanel.tsx` llama `updateUserStatus`, refresca la lista y sincroniza el estado del cardex abierto en tiempo real.
16. **Corrección de Schema y Sincronización DB**: Se integró el modelo `PDFReportLog` directamente a Prisma para habilitar el guardado sin Errores 500 y mostrar analíticas reales en Admin Panel.
17. **Prevención de Pérdida de Datos (DailyMenu)**: Se añadieron a Prisma campos operacionales críticos (`status`, `phase`, `approvedBy`, `adminNotes`, `weekStart`, `approvedAt`) en `DailyMenu` para evitar que un `npx prisma db push` elimine datos de producción en Supabase, alineando el ORM con los Server Actions.
18. **Forzado de Rol y Plan ELITE en Sincronización**: Se ajustó `syncUserProfile` en `db-actions.ts` para que cualquier SuperAdmin pre-definido en el array sea forzado a mantener `role: 'ADMIN'` y `plan: 'ELITE'` sin importar su estado previo, previniendo que se muestre como 'Básico (FREE)' en la UI.
19. **Auditoría de Descarga PDF**: El evento `handleGeneratePDF` en el Dashboard ahora ejecuta el Server Action `logPDFReport` con estado 'DOWNLOADED' o 'ERROR', habilitando la trazabilidad del SaaS en el panel de administrador.
20. **Recuperación de Assets Base**: Se restablecieron las imágenes crudas en el directorio `public/` de Next.js (`tarwi.png`, `yacon.png`, etc.) copiándolas desde el root antiguo, eliminando los 404 Not Found en las consultas a la base de datos de Alimentos.
21. **Diagnóstico Nivel Pro (NMG & Biometría)**: El componente `NutrityOnboarding.tsx` fue rediseñado a un formato "Premium", reemplazando inputs libres por rangos estructurados e incorporando indagación inductiva del "Síndrome de Dirk Hamer" (DHS), asegurando consistencia clínica pre-procesada antes de enviar a Gemini. La paleta de colores del formulario (Forest Green, Cream, Gold) ahora emula directamente la experiencia visual del eBook oficial.
22. **Sincronización de Blog y Ajuste de Hero Landing**: Se centralizó el estado de los artículos de blog en el componente padre `AdminPanel.tsx` para sincronizar en tiempo real el contador en la barra de navegación del administrador. Se redefinió la interfaz `AdminBlogTabProps` para eliminar tipos implícitos y usar tipado estricto (KISS/Type Safety), solucionando lints de estado síncronos. En `NutrityLanding.tsx`, se removió la opacidad reducida (opacity-90), el desenfoque artificial (backdrop-blur) y se redujo la capa blanca superior a `bg-white/10` para lograr que la imagen principal del landing luzca nítida, contrastada y fiel a su versión original como fondo de la sección.
23. **TikTok CMS Dinámico y Generación de Menú en Servidor**: Se añadió soporte en el CMS para gestionar los 4 videos de TikTok (título, enlace real e imagen de portada base64 o URL) de forma dinámica, cargando en el dashboard del paciente con estética nativa móvil de TikTok (simulando interacciones verticales, disco musical y tickers animados definidos en globals.css). Asimismo, la generación de menú semanal se movió al servidor en `generateAIWeeklyMenuSecure` (evitando key exposure), configurando un plan de 7 días consecutivos a partir del día siguiente a la generación y aplicando fallback automático a `gemini-1.5-flash` si `gemini-2.5-flash` supera límites de cuota (429).
24. **Supabase Single Source of Truth (SSOT)**: Se erradicó la dependencia de catálogos estáticos (`food-data.ts`, `micronutrients-data.ts`) y la función destructiva `forceSyncCatalog`. Para evitar la superposición o pérdida de datos cargados vía SQL puro, las vistas de Alimentos y Micronutrientes dependen ahora única y estrictamente de la DB. Si la DB está vacía, la interfaz responde limpiamente sin "auto-sembrar" el modelo antiguo.
25. **Prevención de Data Ghosting**: Se reemplazaron todos los *fallbacks* (valores por defecto) hardcodeados en `NutrityLanding` (como "De la Diabetes Tipo 2" y videos de TikTok residuales de una app anterior) por estados estrictamente anulables (`null`). Esto elimina el molesto parpadeo ("flash of old app data") en la carga inicial y asegura que la web proyecte la identidad de marca dinámica configurada desde el Admin Panel.
26. **Prevención de Schema Drift (JSONB)**: Se definió una política estricta de carga de datos a través del Admin Panel para evitar inconsistencias de llaves JSON (e.g. `image` vs `imageUrl`) que ocurren al inyectar datos en crudo a las columnas JSONB de Supabase, garantizando que el Frontend renderice correctamente el "Perfil Metabólico" y los tips de las recetas sin requerir fallbacks agresivos. Carga manual en DB prohibida a menos que sea validada estrictamente.
27. **Refactorización de Lógica de Acceso (Plan Premium vs Free)**: Se desvinculó la validación de acceso del índice de ordenación y se implementó un evaluador `getCourseNumber` que escanea las strings de los títulos (ej. "método 50"). Se implementó bloqueo explícito por lección (`index >= 2`) en el curso gratuito para incitar al up-sell en los usuarios `FREE`.
28. **Prevención de Errores Vercel (Timeouts de Google Fonts)**: Se eliminaron dependencias dinámicas a `next/font/google` (`Geist`, `Geist Mono`) para evitar caídas severas de build (errores de timeout de red) en entornos como Vercel y locales, usando directamente la fuente `font-sans` del sistema definida por Tailwind.
29. **Robustez del Mapa JSON**: Se inyectaron fallbacks como `(lesson.quiz.questions || []).map(...)` en interfaces administrativas para prevenir `TypeError: Cannot read properties of undefined` cuando el JSON de Supabase carece de estructuras vacías inicializadas.
30. **Protección y Reglas de Negocio del Módulo Académico**:
    - **verifyLessonAccess**: Toda acción backend (score, tareas, PDFs) pasa por una validación estricta que cruza el `User.plan` con el nivel/categoría del curso.
    - **Zero Trust Score**: El frontend no decide si un Quiz está aprobado. El backend recalcula iterativamente las respuestas comparando con la DB y dicta el `passed: true/false`.
    - **Límite de Intentos**: Prisma `.count()` en servidor rechaza intentos de quiz superiores a 3 por usuario/lección.
    - **LessonProgress Backend-driven**: Solo el servidor muta el estado a `completed` (al pasar Quiz, enviar Tarea, o mediante Server Action explícito para lecciones sin evaluación).
    - **Wrapper de Archivos Premium**: Se implementó `/api/academic/download` como un proxy de redirección HTTP 302 que enmascara las URLs (PDFs/Presentaciones) y rechaza accesos sin plan vigente.

---

## 💡 Decisiones de Diseño Importantes
- **User Status Protocol**: El sistema maneja estados `ACTIVE`, `BLOCKED` y `OBSERVED`.
- **Emotional-Driven AI**: La IA no solo prescribe dieta, sino que decodifica el síntoma biológico según la consciencia del usuario.
- **Premium Onboarding UI**: Se utiliza una paleta de colores específica (Forest Green, Gold, Cream) para emular la estética de un "libro/revista" clínica, elevando el valor percibido del diagnóstico.
- **Admin Maintenance**: El Admin Panel es ahora la herramienta principal para la salud del sistema y auditoría de diagnósticos.
- **Estabilidad en Producción (Vercel & Supabase)**:
    * Se eliminaron los imports dinámicos en Server Actions (ej. `await import('@/lib/food-data')`) reemplazándolos por imports estáticos, solucionando Errores 500 en Vercel durante el renderizado de Server Components.
    * Se adoptó oficialmente el **Transaction Pooler IPv4 (puerto 6543) de Supabase** (`aws-0-us-[region].pooler.supabase.com`) con el flag `?pgbouncer=true` en `DATABASE_URL` para garantizar la conexión desde Vercel (que no soporta IPv6 nativo en Serverless Functions).
    * Se incluyó comportamiento responsivo nativo en el sidebar de navegación (`overflow-y-auto`) para pantallas de laptops pequeñas, evitando pérdida de accesibilidad a funciones críticas (Planes y Organización).
    * **Asignación Pasiva B2C**: En lugar de forzar un registro de usuarios complejo por jerarquías, el modelo SaaS emplea una asignación pasiva de `organizationId` a través del enlace de la Landing Page que persiste en `localStorage` hasta el registro.
    * **Resend Fallback (Mock)**: El sistema de correos tiene un fallback inteligente en código que intercepta la falta de API Key y simula el envío sin crashear el proceso, ideal para ambientes de desarrollo.

---

## 📚 Patrón Maestro: Estructura del LMS (Cursos)
Para garantizar cero "Schema Drift" y asegurar que el frontend procese correctamente los cursos sin *fallbacks* invasivos, toda inyección de cursos (ej. Cursos 2 al 6) debe ejecutarse vía script y respetar la siguiente estructura en Prisma:

1. **Course**: Debe contener `title`, `description`, `thumbnail` (URL externa válida), `category` (ej. "Pilar Metabolismo"), y `price`.
2. **Lesson**: Vinculado al `courseId`. Debe incluir `title`, `order` (crítico para prerrequisitos), y los campos opcionales poblados según el asset: `videoUrl`, `videoInstructions`, `pdfUrl`, `pdfInstructions`.
3. **Quiz (Evaluación Automática)**: Vinculado al `lessonId` si aplica. Debe contener el array `questions` en formato estricto JSON:
   `[{ text: "Pregunta", options: ["A", "B", "C"], correctIndex: 1 }]`
4. **Assignment (Reto Práctico)**: Vinculado al `lessonId`. Debe contener `title` y una `description` detallada con la instrucción clínica. Las entregas (`AssignmentSubmission`) serán filtradas por el coach en el Admin Panel usando la relación `assignment -> lesson -> course`.

---

## 🛠️ Fase 12: Optimización Arquitectónica y Estabilización (Agosto 2026)
- **Generación Asíncrona AI (Chunking)**: Se migró la generación de menús semanales de bloqueos secuenciales lentos a una arquitectura asíncrona de Background Tasks en Vercel, procesando cada día independientemente con su propio Retry/Backoff.
- **Unificación Firebase -> Supabase ID**: Refactorizado de `getInternalId` a O(1) resolviendo el User ID nativo en Supabase.
- **Aislamiento Multi-tenant Estricto (RLS)**: Activación de Row Level Security y filtros de `organizationId` obligatorios a nivel ORM para aislar los pacientes (B2B2C).
- **Asincronía SSR de Next.js 15**: Corrección masiva de propiedades asíncronas (`await params` / `await searchParams`) en layouts y Server Actions para compatibilidad con el App Router de Next.js.
- **Guest Evaluation Fix (Instancias GoTrueClient)**: Al solucionar colisiones de clientes SSR vs. Navegador, se garantizó que los "guests" sean tratados correctamente en su transición a registro en el Onboarding (`page.tsx`).
- **Limpieza Estructural Git/Local**: Depuración masiva de objetos residuales con `git gc` y exclusión efectiva del `.env`, reduciendo el footprint del repositorio drásticamente.

- [x] **Fase 13: UI Premium, Testing E2E y Blindaje Zero-Trust (Agosto 2026)** (Completado)
    * **Expediente PDF Adaptativo**: Renderizado server-side dinámico con vistas `patient` / `coach`, degradación automática de roles y protección de paginación con `wrap={false}` en componentes `@react-pdf/renderer`.
    * **Resiliencia de Assets UI**: Integración de SVG `food-placeholder.svg` con manejadores `onError` en el renderizado de alimentos y cursos, garantizando catálogos visualmente limpios sin errores 404 en pantalla.
    * **LMS Proxy Zero-Trust**: Reescritura del endpoint de descargas (`/api/academic/download/route.ts`) para realizar fetching proxy (streaming) en vez de un redirect 307 clásico. Inyección de `Content-Disposition` para enmascarar URLs reales del Storage en Vercel.
    * **Vercel E2E Audit**: Verificación y despliegue exitoso (main) asegurando el requerimiento de Connection Pooling (Supabase pgbouncer port 6543) y el funcionamiento de barreras de planes para la generación de IA.
    * **DB Persistence Hotfixes (Producción)**: Corrección de un grave fallo de integridad relacional en Prisma al resolver CUIDs vs UUIDs (en `getInternalId`) que provocaba errores 500 durante la generación del Bio-Plan en el Onboarding.
    * **RLS & Server Actions Stabilization**: Estabilización del bypass de políticas RLS en Vercel utilizando obligatoriamente la variable `SUPABASE_SERVICE_ROLE_KEY`, garantizando el guardado de Citas Automáticas y Mediciones Clínicas desde componentes de servidor.
