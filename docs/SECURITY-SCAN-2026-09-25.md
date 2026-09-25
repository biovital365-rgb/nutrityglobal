# Escaneo de secretos, datos y artefactos sensibles

**Fecha:** 25 de septiembre de 2026  
**Alcance:** árbol de trabajo, archivos versionados, 195 commits alcanzables, rutas históricas y objetos Git no alcanzables.  
**Regla de manejo:** este informe no reproduce credenciales ni datos personales.

## Resultado ejecutivo

El árbol actual no contiene claves detectables de Google, Stripe, GitHub, AWS o Slack, ni bloques de llave privada. Sin embargo, el repositorio **no supera todavía la puerta de contención** porque conserva datos y credenciales recuperables en el historial, una base SQLite versionada y scripts operativos con identificadores reales.

## Hallazgos críticos

### SEC-01 · Clave de Gemini recuperable en el historial

- Dos apariciones de una clave con formato Google API fueron incorporadas en el commit `397e2ae`, dentro de `test-gemini.ts` y `test-gemini-models.ts`.
- Los archivos fueron retirados del árbol actual en `f644dd2`, pero el contenido continúa alcanzable desde el historial Git.
- Tratamiento: considerar la clave comprometida, revocarla o rotarla y purgar los blobs históricos.

### SEC-02 · Exportaciones de usuarios recuperables

- `users_nutrity.json` y `users_vida.json` fueron incorporados en `92fe9ec` y eliminados del árbol actual en `f644dd2`.
- El análisis sin revelar valores detectó, entre ambos archivos, al menos 22 cadenas con formato de correo y 36 con formato telefónico.
- Los archivos siguen siendo recuperables desde el historial alcanzable.
- Tratamiento: clasificar el origen de los datos, realizar evaluación de privacidad, conservar solamente la evidencia mínima autorizada y purgar los blobs del historial.

### SEC-03 · Base SQLite versionada en el árbol actual

- `dev.db` fue agregada en `408ddc0` y continúa versionada.
- Tamaño actual: 118.784 bytes.
- La inspección binaria detectó dos cadenas con formato de correo y múltiples términos asociados al esquema de usuarios y salud. El contenido debe tratarse como sensible hasta demostrar que contiene únicamente datos sintéticos.
- Tratamiento: inventariar tablas y registros sin exponer datos, respaldar si corresponde, retirar la base del seguimiento Git, añadir una regla explícita a `.gitignore` y purgar su historial.

## Hallazgos altos y medios

### SEC-04 · JWT público de Supabase incrustado

Seis scripts de prueba de `nutrity-nextjs` incluyen un JWT con rol `anon` y vencimiento en 2036:

- `test-db.js`
- `test-eval-upsert.js`
- `test-eval.js`
- `test-evaluation-invalid.js`
- `test-evaluation.js`
- `test-post.js`

No es una clave `service_role`, pero identifica el proyecto y no debe permanecer duplicada en código. Debe sustituirse por variables de entorno y revisarse junto con las políticas RLS.

### SEC-05 · Scripts operativos e identidades privilegiadas

- `debug-user.ts`, `debug-user-standalone.ts`, `promote-admin.ts`, `promote-admin-sql.ts` y `update-admin.ts` contienen correos reales o rutinas de promoción administrativa.
- La aplicación heredada bajo `src/` conserva comparaciones de correo para conceder acceso administrativo.
- El código heredado también conserva referencias a `VITE_GEMINI_API_KEY`, que sería una variable de cliente si esa aplicación volviera a compilarse.
- La aplicación Next.js oficial usa variables servidor, pero `email-actions.ts` conserva direcciones de fallback codificadas.
- Tratamiento: retirar scripts innecesarios, convertir utilidades autorizadas en herramientas explícitas y auditables y archivar el cliente heredado para impedir despliegues accidentales.

### SEC-06 · Objetos Git no alcanzables con señales de información personal

- `git fsck --full --no-reflogs --unreachable` encontró 41 blobs no alcanzables.
- Cinco blobs contienen cadenas con formato de correo.
- No se detectaron commits no alcanzables.
- Tratamiento: incluir estos objetos en la limpieza local posterior. No ejecutar poda antes de respaldar y completar la reescritura coordinada del historial remoto.

## Controles con resultado negativo

- No se encontraron archivos `.env` reales en el workspace; solamente `.env.example`.
- No se detectaron claves privadas PEM/OpenSSH.
- No se detectaron secretos Stripe, tokens GitHub, claves AWS ni tokens Slack mediante los patrones usados.
- No se detectaron JWT con rol `service_role`; los JWT clasificados tenían rol `anon`.
- El árbol de trabajo estaba limpio y sincronizado con `origin/main` al iniciar el escaneo.

## Limitaciones

- La revisión combina patrones de alta señal, inspección de rutas, clasificación segura de JWT y análisis de objetos Git. Un resultado negativo no demuestra por sí solo ausencia absoluta de secretos.
- `gitleaks`, `trufflehog` y `git-secrets` no estaban instalados en el entorno. Después de la remediación debe ejecutarse al menos un escáner especializado sobre el árbol y el historial reescrito.
- La base `dev.db` requiere una inspección controlada de esquema y conteos antes de decidir su disposición final.

## Orden recomendado de remediación

1. Rotar y revocar Gemini y las demás credenciales históricamente compartidas.
2. Confirmar la naturaleza de `dev.db` y preparar su retiro seguro.
3. Retirar exportaciones, JWT incrustados y scripts operativos innecesarios del árbol.
4. Eliminar bypasses administrativos por correo del código heredado o archivar completamente ese cliente.
5. Reescribir el historial para retirar claves, exportaciones y la base SQLite.
6. Coordinar el push forzado y la resincronización de todos los clones.
7. Podar objetos locales no alcanzables y ejecutar un escaneo especializado final.
8. Registrar evidencias de revocación, nuevos hashes y resultado negativo del escaneo.

## Veredicto de puerta

**Fase 0 — Contención inmediata: NO APROBADA.**  
El escaneo está completado, pero la puerta permanece abierta hasta revocar credenciales, retirar datos del árbol y purgar el historial con evidencia verificable.
