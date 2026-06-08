# Plan para la Próxima Sesión: Optimizaciones y Nuevos Desarrollos

Este documento sirve como un punto de partida ("hand-off") para la próxima sesión de IA, asegurando continuidad inmediata en el desarrollo de **Nutrity Global SaaS**.

## 🎯 Objetivo de la Próxima Sesión
Ahora que la base de facturación B2C, la visualización dinámica de planes (4 niveles: Free, Basic, Premium, Elite) y la pasarela de PayPal han sido integrados con éxito, el enfoque debe moverse a la **estabilización de funciones del panel administrativo para los Coaches**, además de **afinaciones visuales y funcionales post-despliegue**.

## 📋 Tareas Prioritarias Sugeridas

1. **Dashboard de Conversiones para Coaches (B2B2C)**
   - *Contexto:* Los coaches (Elite) ahora pueden invitar pacientes con su link `?ref=ORG_ID`.
   - *Tarea:* Crear una pestaña en el `AdminPanel.tsx` (o un panel específico para el rol `COACH`) donde puedan ver cuántos pacientes se han registrado usando su link y su estado de suscripción.

2. **Feedback Loop (Botón "Solicitar Cambios")**
   - *Contexto:* El sistema ya envía el menú aprobado, pero el paciente debe poder reaccionar interactuando más fluido con el Coach.
   - *Tarea:* Refinar la experiencia UI/UX del botón en el dashboard del paciente que permite enviar un comentario al coach y cambiar el estado del menú a `CHANGES_REQUESTED`.

3. **Optimizaciones de Marketing y SEO (GEO)**
   - *Contexto:* Preparar la plataforma para escalar en ventas B2C.
   - *Tarea:* Refinar el `robots.txt`, el `sitemap.xml` dinámico y añadir metadatos enriquecidos (JSON-LD) a los artículos del Blog para motores de IA (ChatGPT, Perplexity).

4. **Despliegue y Pruebas E2E**
   - *Contexto:* Nuevas funciones han sido mergeadas al branch principal.
   - *Tarea:* Realizar un testing End-to-End exhaustivo sobre los 4 planes en el entorno de producción (o staging en Vercel) confirmando que Stripe/PayPal webhooks y RLS no causen fricciones.

## 🤖 Contexto para el Agente (System Prompt Hand-off)
**Para el próximo agente AI:** Al iniciar la sesión, por favor lee primero el archivo `MEMORY.md` para entender las decisiones arquitectónicas recientes (especialmente la inyección de temas de colores UI, pasarelas de pago y la persistencia de perfiles en base a Planes: Basic, Premium, Elite). Aplica el protocolo estricto de UI Premium/SaaS Level 2 y asegura el buen funcionamiento responsive de las tarjetas de precios en `SubscriptionTab.tsx`.
