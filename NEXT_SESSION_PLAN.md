# Plan de Próxima Sesión: Módulo de Reporting / Expediente PDF

## 🎯 Prioridad Principal
Consolidar y evolucionar el módulo de **Reporting / PDF** con la identidad visual de BioVital.360. El objetivo es entregar un expediente clínico completo que integre datos reales de la base de datos, generado enteramente *server-side*, y protegido bajo las reglas del plan de suscripción del usuario.

## 📋 Estado Actual y Diagnóstico (MVP completado en sesión anterior)
Durante la última fase técnica, sentamos las bases funcionales (MVP) de este módulo:
- **Agregador de Datos:** Se creó `getUserExpedientData.ts` para orquestar la extracción de Perfil, Triaje, Menú y Progreso Académico.
- **Endpoint Transversal:** Se implementó `/api/reporting/expedient/route.ts` con validación de sesión y generación de Stream PDF seguro.
- **Template Base:** Se construyó `NutrityNativeReport.tsx` usando `@react-pdf/renderer` con fallbacks elegantes.

## 🚧 Lo que queda abierto para la próxima sesión (Refinamiento y Expansión)

Antes de iniciar la creación de un nuevo `implementation_plan.md` para la fase avanzada del PDF, se deben confirmar estas 4 variables estratégicas:

1. **Entidades de DB disponibles para reporte:** Confirmar si sumaremos más entidades (ej. gráficas de peso, historial de métricas metabólicas, logs del coach) al expediente actual.
2. **Actor y destinatario del PDF:** Definir si el diseño y los datos expuestos variarán dependiendo de si lo descarga el paciente (vista amigable/motivacional), el coach (vista clínica/analítica) o el superadmin (auditoría completa).
3. **Stack técnico propuesto:** Reconfirmar la viabilidad a gran escala de `@react-pdf/renderer` en Next.js/Vercel (ya probado en el MVP) frente a los límites de ejecución *serverless*.
4. **Componentes visuales reutilizables:** Identificar qué elementos de la UI actual de BioVital.360 deben portarse con mayor fidelidad al documento PDF (fuentes personalizadas, bloques de color institucionales, logos, etc.).

## 🔒 Regla Arquitectónica Vigente
> **Backend decide. Frontend renderiza.**

Esta separación de responsabilidades, implementada con éxito en los módulos de Academia, Coaches y Recetas, se mantendrá como el estándar inquebrantable para el motor de PDFs y todo desarrollo futuro. Ninguna lógica de permisos, cálculo de métricas o generación de documentos debe recaer en el cliente.
