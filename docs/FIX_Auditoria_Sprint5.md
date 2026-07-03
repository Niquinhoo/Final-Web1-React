# Fix Auditoria Sprint 5

## Alcance

Se corrigieron puntos detectados en la auditoria del dashboard sin cambiar dos decisiones del proyecto:

- Se mantiene el flujo de sesiones y usuarios administradores.
- Se mantienen aislados los entornos de tienda publica y dashboard administrativo.

## Cambios

- Se agrego CRUD de usuarios al dashboard:
  - listado en `/admin/users`;
  - alta en `/admin/users/new`;
  - detalle y edicion en `/admin/users/:id`;
  - baja desde listado y detalle.
- Se agregaron endpoints locales en `apiFetch` para `/users`.
- Se agregaron operaciones de usuarios en `store.ts` sin iniciar sesion al crear usuarios desde el dashboard.
- Se protege el ultimo administrador para no dejar el dashboard sin acceso admin.
- Se agrego navegacion a Usuarios en el sidebar del dashboard.
- Se agrego resumen de Usuarios en el Home administrativo.
- Se agrego asignacion de productos en la pantalla de detalle de categoria:
  - marcar un producto lo mueve a esa categoria;
  - desmarcar un producto de esa categoria lo mueve a `Otros`.
- Se corrigio el selector de categoria del formulario de productos para usar las categorias reales del store local.
- Se eliminaron atoms MD3 que no tenian uso en la app: `TextField`, `Switch`, `SegmentedButton`, `Tooltip` y el hook `useId`.

## Validacion ejecutada

- `npm run lint`
- `npm run build`
- Vite local en `http://127.0.0.1:5173/`
- Render headless con Chromium:
  - la tienda publica monta contenido;
  - `/admin/dashboard` redirige al login cuando no hay sesion.

Nota: `agent-browser` no estaba instalado en el entorno, por eso la comprobacion visual se hizo con Chromium headless.
