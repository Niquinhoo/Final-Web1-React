# Documentación de Diseño — User Story #2: Rutas del Dashboard

Esta documentación detalla la implementación del sistema de enrutamiento y la estructura base de navegación creada para el frontend del panel de control de **Mi Ecommerce** (Sprint 5) en el directorio [reactfinal](file:///c:/Users/nicot/Desktop/reactfinal).

---

## 🛣️ Mapeo General de Rutas Configurado

Hemos definido una estructura de rutas amigable y consistente para que cada sección sea accesible directamente mediante una URL única. El enrutamiento está estructurado como rutas hijas de una plantilla común (`Layout`), garantizando la consistencia visual y de navegación de la aplicación:

| Ruta | Componente / Página | Propósito |
| :--- | :--- | :--- |
| `/` | `Layout` (con Redirección) | Redirige automáticamente a `/home` |
| `/home` | `Home` | Panel de bienvenida con estadísticas y accesos directos |
| `/products` | `ProductsList` | Tabla de administración de productos y barra de búsqueda |
| `/products/new` | `ProductView` (Modo Creación) | Formulario de alta para un nuevo producto |
| `/products/:id` | `ProductView` (Modo Edición) | Detalle y edición del producto con identificador `:id` |
| `/categories` | `CategoriesList` | Grilla de categorías para administración |
| `/categories/new` | `CategoryView` (Modo Creación) | Formulario de alta para una nueva categoría |
| `/categories/:id` | `CategoryView` (Modo Edición) | Detalle y edición de la categoría con identificador `:id` |
| `/profile` | `Profile` | Configuración del perfil de usuario actual |
| `*` | `NotFound` | Página de error 404 personalizada para rutas inexistentes |

---

## 🏛️ Decisiones Técnicas y de Diseño

### 1. Elección de React Router DOM (v6 / v7) y `createBrowserRouter`
**¿Qué hicimos?**
Configuramos la navegación utilizando el enrutador recomendado por la biblioteca: `createBrowserRouter`, instanciado en el archivo [App.tsx](file:///c:/Users/nicot/Desktop/reactfinal/src/App.tsx) y provisto mediante `<RouterProvider router={router} />`.

**¿Por qué lo hicimos?**
- **History API Nativa:** Utiliza la API de historial del navegador para realizar transiciones instantáneas en el cliente sin recargar la página entera (característica fundamental de una SPA).
- **Esquema de Rutas Declarativo:** Permite definir la jerarquía completa de la aplicación en un solo array plano o estructurado con relaciones padre-hijo, facilitando la lectura del mapa de la app.

---

### 2. Estructura de Layout Común y Rutas Anidadas (`children` y `<Outlet />`)
**¿Qué hicimos?**
Definimos la ruta raíz (`/`) asociada al componente `Layout`. Todas las páginas administrativas se configuraron como rutas hijas (`children`) de esta raíz.

**¿Por qué lo hicimos?**
- **DRY en Componentes de Interfaz:** Evitamos repetir el renderizado de la estructura de la barra lateral (`Sidebar`) y el encabezado (`Header`) en cada archivo de página. El componente `Layout` define el contenedor principal y delega mediante el componente `<Outlet />` de React Router la carga dinámica del contenido según la URL actual.
- **Navegación Fluida:** Al cambiar de ruta, la barra de navegación lateral y el encabezado no se desmontan ni se vuelven a renderizar, mejorando notablemente el rendimiento visual y permitiendo transiciones suaves.

---

### 3. Centralización del Enrutador en `src/App.tsx`
**¿Qué hicimos?**
Mantuvimos la declaración del enrutador y la plantilla de `Layout` dentro de [App.tsx](file:///c:/Users/nicot/Desktop/reactfinal/src/App.tsx), dejando el archivo de entrada [main.tsx](file:///c:/Users/nicot/Desktop/reactfinal/src/main.tsx) libre de lógica adicional de rutas.

**¿Por qué lo hicimos?**
- **Cohesión y Co-localización:** Seguir las directrices de la User Story #1 manteniendo la configuración global de la aplicación en el componente raíz (`App.tsx`).

---

### 4. Detección Inteligente de Modo (Detalle/Edición vs. Creación)
**¿Qué hicimos?**
En lugar de crear componentes duplicados para crear y editar (ej. `ProductCreate.tsx` y `ProductEdit.tsx`), reutilizamos el componente [ProductView.tsx](file:///c:/Users/nicot/Desktop/reactfinal/src/pages/Products/ProductView/ProductView.tsx) para las rutas `/products/new` y `/products/:id`. Lo mismo para categorías en [CategoryView.tsx](file:///c:/Users/nicot/Desktop/reactfinal/src/pages/Categories/CategoryView/CategoryView.tsx).

**¿Por qué lo hicimos?**
- **Reutilización de Lógica y UI:** Ambos flujos comparten el 90% del diseño visual y campos del formulario (Nombre, Descripción, Precio, Stock).
- **Resolución de Parámetros:** Mediante el hook `useParams`, el componente determina el estado:
  - Si `id` es `undefined`, asume el flujo de **Alta** (limpia campos y prepara llamada `POST`).
  - Si `id` tiene valor, asume el flujo de **Detalle/Edición** (obtiene los datos existentes mediante `apiFetch` y prepara llamada `PUT`).

---

### 5. Control de Errores y Rutas 404 Integrado
**¿Qué hicimos?**
Implementamos un control de fallos en dos capas:
1. **Atributo `errorElement` en el enrutador raíz:** Captura cualquier error fatal de renderizado o excepciones inesperadas durante la ejecución de los componentes.
2. **Ruta comodín `path: "*"` al final de las subrutas:** Captura cualquier URL digitada por el usuario que no coincida con el mapeo.
Ambas capas dirigen al usuario a una página común [NotFound.tsx](file:///c:/Users/nicot/Desktop/reactfinal/src/pages/NotFound/NotFound.tsx) provista con un enlace de retorno al Inicio.

---

## 🛠️ Detalles de los Archivos Creados/Modificados

1. **[App.tsx](file:///c:/Users/nicot/Desktop/reactfinal/src/App.tsx):** Concentra la declaración completa del enrutador, el objeto `router` y la plantilla `Layout` con links tipo `NavLink`.
2. **[App.css](file:///c:/Users/nicot/Desktop/reactfinal/src/App.css):** Remueve los estilos de muestra iniciales de Vite e implementa el esqueleto flex/grid para estructurar la barra lateral a la izquierda y el área de contenido a la derecha.
3. **[NotFound.tsx](file:///c:/Users/nicot/Desktop/reactfinal/src/pages/NotFound/NotFound.tsx) y [NotFound.css](file:///c:/Users/nicot/Desktop/reactfinal/src/pages/NotFound/NotFound.css):** Vista e interacción en caso de recursos no encontrados o enlaces inválidos.
4. **Vistas funcionales actualizadas:**
   - [Home.tsx](file:///c:/Users/nicot/Desktop/reactfinal/src/pages/Home/Home.tsx): Contiene botones que apuntan a `/products`, `/products/new`, `/categories` y `/categories/new`.
   - [ProductsList.tsx](file:///c:/Users/nicot/Desktop/reactfinal/src/pages/Products/ProductsList/ProductsList.tsx): Listado dummy cuyos enlaces dirigen a `/products/:id` y `/products/new`.
   - [ProductView.tsx](file:///c:/Users/nicot/Desktop/reactfinal/src/pages/Products/ProductView/ProductView.tsx): Distingue automáticamente entre estado de creación (`/products/new`) y edición (`/products/:id`).
   - [CategoriesList.tsx](file:///c:/Users/nicot/Desktop/reactfinal/src/pages/Categories/CategoriesList/CategoriesList.tsx): Cards de categorías con links de edición.
   - [CategoryView.tsx](file:///c:/Users/nicot/Desktop/reactfinal/src/pages/Categories/CategoryView/CategoryView.tsx): Distingue dinámicamente entre `/categories/new` y `/categories/:id`.
