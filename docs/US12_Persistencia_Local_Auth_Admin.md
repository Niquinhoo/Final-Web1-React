# Documentación — Persistencia local, login y administración React-only

## Estado actual

El proyecto ya no depende del servidor Express ni de SQLite externo. La tienda y el dashboard funcionan dentro de la app React y persisten datos en `localStorage`.

La app conserva una interfaz tipo API mediante `src/utils/api.ts`, pero esa API resuelve contra `src/utils/store.ts`. Esto permite que las pantallas sigan usando `apiFetch<T>()` sin necesitar `localhost:3000`.

## Archivos principales

| Archivo | Responsabilidad |
| --- | --- |
| `src/utils/store.ts` | Datos semilla, CRUD local, carrito, usuarios, pedidos, login y sesión. |
| `src/utils/api.ts` | Adapter REST local compatible con las rutas usadas por el dashboard. |
| `src/App.tsx` | Rutas de tienda, rutas protegidas de admin, login/register y botón Admin. |
| `public/assets/` | Imágenes copiadas desde el proyecto Web-1 para mantener rutas `/assets/...`. |

## Datos persistidos

Las claves principales de `localStorage` son:

```text
pediloo_products
pediloo_categories
pediloo_cart
pediloo_users
pediloo_orders
pediloo_current_user_id
pediloo_session_token
```

`ensureStore()` inicializa los datos semilla si faltan. Productos y categorías quedan disponibles tanto para la tienda como para el dashboard.

## Adapter local

`apiFetch<T>()` mantiene la forma de endpoints REST:

| Método | Endpoint | Acción |
| --- | --- | --- |
| `GET` | `/products` | Lista productos, soporta `?sort=asc|desc` y `?q=texto`. |
| `GET` | `/products/:id` | Obtiene un producto. |
| `POST` | `/products` | Crea un producto. |
| `PUT` | `/products/:id` | Actualiza un producto. |
| `DELETE` | `/products/:id` | Elimina un producto y limpia líneas de carrito relacionadas. |
| `GET` | `/categories` | Lista categorías. |
| `GET` | `/categories/:id` | Obtiene una categoría. |
| `POST` | `/categories` | Crea una categoría. |
| `PUT` | `/categories/:id` | Actualiza una categoría. |
| `DELETE` | `/categories/:id` | Elimina una categoría. |
| `POST` | `/upload` | Convierte una imagen seleccionada a `data:` URL para persistencia local. |

## Login y contraseñas

Los usuarios se guardan en `pediloo_users`. La contraseña no se guarda en texto plano.

Formato de hash:

```text
sha256:<salt>:<hash>
```

El hash se calcula con Web Crypto (`crypto.subtle.digest`). Si el navegador no soporta Web Crypto, queda un fallback local para que la entrega no se rompa.

Las sesiones se mantienen con:

```text
pediloo_current_user_id
pediloo_session_token
```

Esto no es JWT real porque no hay backend que firme/verifique tokens. Para esta entrega React-only, el token local alcanza para persistencia de sesión.

## Cuenta admin

La app agrega una cuenta admin semilla si no existe:

```text
Email: admin@pediloo.local
Contraseña: Admin123!
adminFlag: true
```

Las cuentas creadas desde `/register` tienen:

```text
adminFlag: false
```

## Acceso al dashboard

El botón **Admin** sólo se muestra cuando:

```ts
user?.adminFlag === true
```

La ruta `/admin/*` está protegida:

| Estado | Resultado |
| --- | --- |
| Sin sesión | Redirige a `/login`. |
| Usuario común | Redirige a `/home`. |
| Usuario admin | Renderiza el dashboard. |

## Rutas relevantes

| Ruta | Vista |
| --- | --- |
| `/home` | Tienda principal. |
| `/products` | Catálogo público. |
| `/cart` | Carrito. |
| `/login` | Login único para clientes y admin. |
| `/register` | Registro de usuario común. |
| `/account` | Cuenta y pedidos. |
| `/admin/dashboard` | Dashboard admin protegido. |
| `/admin/products` | ABM de productos. |
| `/admin/categories` | ABM de categorías. |

## Verificación realizada

Comandos:

```bash
npm run build
npm run lint
```

Validaciones manuales:

- Dashboard muestra 5 productos y 9 categorías desde persistencia local.
- Usuario admin ve el botón **Admin**.
- Usuario no logueado no entra a `/admin`.
- CRUD de productos/categorías usa `apiFetch()` contra `localStorage`.

## Límite deliberado

La persistencia es por navegador. Si se abre la app en otro navegador, perfil o computadora, esos datos no se comparten. Para persistencia multiusuario real habría que volver a incorporar backend y base de datos compartida.
