# Fase 3 — Marca, oferta y embudo

Estado: cierre técnico preparado el 18 de septiembre de 2026; publicación y auditoría final pendientes de completar en esta sesión.

## Resultado comercial buscado

Convertir la atención y confianza construidas por BioVital.360 en registros, activación y compras de Nutrity Global. La conversión debe apoyarse en utilidad demostrable y acompañamiento educativo, no en miedo ni promesas de resultados médicos.

## Arquitectura de marca

- **Nutrity Global:** marca principal, producto y relación comercial.
- **BioVital.360:** canal de contenido, comunidad y adquisición.
- Relación recomendada: “Conociste la idea en BioVital.360. Ponla en práctica con Nutrity Global.”
- **BioVital 365:** retirado y no reutilizable.

## Oferta inicial para validación

Los identificadores técnicos existentes se conservan para no romper pagos; los nombres visibles se simplifican:

| Identificador | Nombre visible | Función |
| --- | --- | --- |
| FREE | Nutrity Inicio | Primera Ruta Nutrity y registro básico. |
| BASIC | Nutrity Plus | Rutina semanal, planificación limitada y reporte educativo. |
| ADVANCED | Ruta Nutrity 12 semanas | Recorrido educativo completo, Academia y revisión de avances. |
| ELITE | Nutrity Profesional | Herramientas para coaches y profesionales autorizados. Es una oferta B2B separada. |

Precios mostrados actualmente: USD 9,99; USD 49,00; USD 149,00. Deben confirmarse contra los Price IDs reales de Stripe antes de publicar campañas.

## Embudo mínimo

1. Contenido de BioVital.360 con una sola acción: conocer o iniciar la Ruta Nutrity.
2. Landing Nutrity con promesa educativa, demostración del producto y límites claros.
3. Onboarding de cuatro pasos.
4. Registro o acceso.
5. Primera acción completada dentro de la Ruta Nutrity.
6. Presentación del plan correspondiente al valor ya experimentado.
7. Checkout y confirmación.
8. Activación, recordatorio y retorno a los siete días.

## Eventos requeridos

- `landing_view`
- `primary_cta_click`
- `onboarding_started`
- `onboarding_step_completed`
- `onboarding_safety_stop`
- `onboarding_completed`
- `account_created`
- `route_created`
- `first_action_completed`
- `plan_viewed`
- `checkout_started`
- `payment_confirmed`
- `academy_unit_started`
- `academy_unit_completed`
- `day_7_return`

No incluir respuestas de salud, síntomas ni mediciones en propiedades analíticas.

## Sistema de marca: entregables

1. Fundamento estratégico y posicionamiento.
2. Dos o tres territorios visuales para selección.
3. Logotipo principal, compacto, símbolo y versiones monocromas.
4. Paleta funcional accesible y tipografías.
5. Fotografía, ilustración, iconografía y recursos gráficos.
6. Voz, mensajes prioritarios y lenguaje de salud permitido.
7. Reglas de convivencia Nutrity Global × BioVital.360.
8. Aplicaciones: TikTok, landing, onboarding, dashboard, Academia, email y reporte.
9. Manual profesional y paquete de archivos maestros.

## Decisiones adoptadas para la beta

- Identidad aprobada: **N Ruta Clara**, con “y” y nodo amarillo de llegada.
- Paquete de activos local y versionado; no se usan enlaces remotos para el logotipo.
- Oferta pública beta: Nutrity Inicio gratis; Nutrity Plus USD 9,99/mes; Ruta Nutrity 12 semanas USD 49/mes; Nutrity Profesional USD 149/mes.
- Stripe es el flujo público de suscripción mensual. PayPal permanece deshabilitado en la interfaz hasta contar con renovación y cancelación equivalentes.
- Cancelación mediante portal de facturación; revisión de primer cobro solicitada dentro de siete días, respetando derechos obligatorios aplicables.
- Soporte por `admin@nutrity.global`, con objetivo de respuesta de dos días hábiles y sin atención de urgencias.
- Analítica propia, opcional y minimizada: consentimiento visible, endpoint con eventos y propiedades permitidas, sin respuestas clínicas ni identificadores personales.

## Criterio de cierre

La Fase 3 se considera cerrada cuando el build y lint pasan, los cambios quedan publicados, los activos responden en producción, el flujo landing → onboarding → registro → primera acción → planes funciona y el checklist de auditoría queda disponible para pruebas reales.

## Criterios de éxito de la beta

- Finalización de onboarding.
- Creación de Ruta Nutrity.
- Primera acción completada.
- Retorno en siete días.
- Inicio y conversión del checkout.
- Solicitudes de soporte e incidentes de seguridad.
- Comprensión de la diferencia entre contenido educativo y atención profesional.
