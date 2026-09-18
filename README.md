# Nutrity Global

La aplicación oficial y única ruta de despliegue está en [`nutrity-nextjs`](./nutrity-nextjs).
El código Vite de la raíz se conserva temporalmente solo como referencia durante la consolidación y no debe desplegarse.

## Desarrollo local

1. `npm --prefix nutrity-nextjs ci`
2. Copia `nutrity-nextjs/.env.example` a `nutrity-nextjs/.env.local` y completa los secretos fuera de Git.
3. `npm run dev`

## Verificación

- `npm run typecheck`
- `npm run lint`
- `npm run build`

Consulta [`nutrity-nextjs/README.md`](./nutrity-nextjs/README.md) para la configuración completa.
