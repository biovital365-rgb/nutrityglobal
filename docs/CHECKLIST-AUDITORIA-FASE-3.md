# Checklist de auditoría real — Fase 3

Fecha de preparación: 18 de septiembre de 2026.

## 1. Marca y primera impresión

- [ ] El logotipo N Ruta Clara aparece nítido en landing, acceso y dashboard.
- [ ] El favicon muestra la N simplificada.
- [ ] No aparece BioVital 365, Nutrity V7, Bio-Panel, Bio-Master ni Clinical Edition.
- [ ] BioVital.360 se entiende como canal de origen, no como nombre de la aplicación.
- [ ] El logo y los textos son legibles en móvil y escritorio.

## 2. Consentimiento y analítica

- [ ] El aviso de métricas permite “Solo esenciales” y “Aceptar métricas”.
- [ ] Rechazar métricas no bloquea ninguna función.
- [ ] Tras aceptar, los eventos aparecen en Vercel Runtime Logs con prefijo `[NUTRITY_FUNNEL]`.
- [ ] Los eventos no contienen nombre, correo, síntomas, glucosa ni respuestas de salud.

## 3. Embudo de usuario nuevo

- [ ] Landing carga sin imágenes rotas y el CTA abre onboarding.
- [ ] Onboarding avanza por cuatro pasos y conserva textos comprensibles.
- [ ] Elegir una señal de alarma impide continuar y muestra derivación urgente.
- [ ] “Ninguna de las anteriores” libera el recorrido cuando no hay señales de alarma.
- [ ] “Otra” permite escribir una barrera propia.
- [ ] La Ruta Nutrity se crea y el registro permite guardarla.
- [ ] Un correo ya registrado muestra una instrucción clara para iniciar sesión.

## 4. Dashboard y Ruta Nutrity

- [ ] El usuario común no ve funciones de ADMIN o COACH.
- [ ] Se muestra una acción principal clara y el progreso corresponde a acciones registradas.
- [ ] Completar la primera acción persiste después de recargar.
- [ ] El reporte se descarga con nombre `Reporte_Educativo_Nutrity_*.pdf`.
- [ ] El reporte mantiene el límite educativo y no presenta diagnóstico o pronóstico.

## 5. Academia

- [ ] Se comprende la secuencia “Comprende, practica y registra”.
- [ ] Las unidades muestran progreso global y bloqueo secuencial.
- [ ] Una lección disponible puede iniciarse y completarse.
- [ ] Las restricciones FREE, Plus y 12 semanas coinciden con la oferta.
- [ ] No aparecen promesas como “salva vidas”, “estabiliza glucosa” o “previene enfermedades”.

## 6. Oferta y pagos

- [ ] Los nombres visibles son Nutrity Inicio, Nutrity Plus, Ruta Nutrity 12 semanas y Nutrity Profesional.
- [ ] Los precios visibles son USD 0, 9,99/mes, 49/mes y 149/mes.
- [ ] Antes del pago se muestran renovación, cancelación, impuestos y enlace a términos.
- [ ] Stripe abre el Price ID correcto en modo de prueba o entorno autorizado.
- [ ] Cancelar el checkout devuelve al dashboard sin cambiar el plan.
- [ ] Un pago de prueba confirmado actualiza el plan una sola vez.
- [ ] El portal de facturación permite administrar o cancelar la suscripción.
- [ ] PayPal no aparece en el flujo público de esta beta.

## 7. Roles y administración

- [ ] Superadmin puede editar y guardar un perfil sin error 500.
- [ ] COACH solo accede a su organización y participantes.
- [ ] USER no puede modificar rol, plan ni estado.
- [ ] Dos usuarios de prueba no pueden leer ni modificar datos entre sí.

## 8. Registro de resultados

Por cada fallo anotar: fecha/hora, rol, dispositivo, URL, pasos, resultado esperado, resultado obtenido, captura y severidad. Clasificar como **crítico**, **importante** o **mejora**. No usar datos clínicos reales durante la auditoría.
