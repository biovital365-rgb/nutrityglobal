---
trigger: always_on
---

1. Planificación y Arquitectura (Think First)
•	Análisis de Impacto: Antes de escribir código, genera un plan paso a paso. Si el cambio afecta el Estado Global (Redux, Query, DB) o la Integridad de Datos, detente y espera validación.
•	Diseño SaaS (Multi-tenancy): Toda consulta a base de datos o acción de escritura debe incluir obligatoriamente el filtro de aislamiento (tenant_id, organization_id o user_id). Seguridad por diseño.
•	Mentalidad de Microservicios/Módulos: Divide la lógica del CRM (Ventas, Leads, Auth, IA) en módulos independientes. Evita el acoplamiento circular.
•	Iteraciones Incrementales: Cambios pequeños y verificables. Prohibido reescribir archivos de >200 líneas sin desglosar el impacto primero.
2. Estilo y Calidad Técnica
•	KISS & Type Safety: Código simple y predecible. Uso de any está prohibido. Prefiere interfaces estrictas y tipos unknown con validación.
•	Clean Code (DRY): Lógica de negocio en Services o Hooks, nunca en componentes de UI.
•	Documentación "Por qué": Nombres de variables ultra-descriptivos. Comentarios solo para decisiones técnicas complejas o deuda técnica asumida.
•	IA-Friendly (Tool Calling): Si creas funciones que serán usadas por agentes de IA, define esquemas JSON rigurosos y descripciones claras en los docstrings.
3. Comunicación y Actitud Agéntica
•	Concisión Extrema: Sin saludos, sin "Espero que esto ayude". Ve directo al código, al plan o al error.
•	Proactividad Crítica: Si mi petición es una mala práctica (ej. lógica pesada en el hilo principal, riesgo de inyección SQL), detente. Explica el riesgo y propón una alternativa (ej. Background Jobs/Queues).
•	Transparencia de Auditoría: Al modificar código, indica qué lógica cambió y por qué. Facilita mi revisión rápida.
4. Robustez y Manejo de Errores
•	Programación Defensiva: No asumas el "happy path". Implementa try/catch estructurados, validación de esquemas (Zod/Joi) y fallbacks para integraciones externas.
•	Observabilidad CRM: Todo flujo automatizado debe incluir logs estructurados. Si una automatización falla, el log debe decir exactamente en qué paso y con qué datos ocurrió.
•	Depuración Analítica: Ante un bug, no adivines. Formula una hipótesis basada en logs/estado, verifica la causa raíz y luego aplica la solución.
5. Verificación y Entrega
•	Autoverificación: Antes de entregar, verifica sintaxis, tipos y lógica.
•	Definition of Done (DoD): Una tarea no termina hasta que entregues:
1.	Código implementado.
2.	Evidencia de funcionamiento (o plan de test).
3.	Actualización de MEMORY.md (si existe) con la nueva decisión arquitectónica.
