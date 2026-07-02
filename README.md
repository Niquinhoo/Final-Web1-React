# Mi Ecommerce — React + TypeScript + Vite

Este proyecto contiene la tienda y el panel de administración de **Mi Ecommerce** en una sola app React. No requiere servidor Express: productos, categorías, carrito, usuarios y pedidos persisten en `localStorage`.

---

## 🚀 Cómo Ejecutar el Proyecto

1. **Instalar dependencias:**
   ```bash
   npm install
   ```

2. **Iniciar el servidor de desarrollo:**
   ```bash
   npm run dev
   ```
   La tienda estará disponible en [http://localhost:5173/](http://localhost:5173/) y el dashboard en [http://localhost:5173/admin/dashboard](http://localhost:5173/admin/dashboard).

3. **Compilar para producción (opcional):**
   ```bash
   npm run build
   ```

---

## 💾 Persistencia Local

La app usa `src/utils/store.ts` como fuente de datos local. `src/utils/api.ts` conserva la misma forma de endpoints REST que tenía el proyecto original, pero resuelve todo contra `localStorage`.

* **Productos:**
  * `GET /products` — Listado completo, búsqueda y orden.
  * `GET /products/:id` — Obtener detalles de un producto.
  * `POST /products` — Crear un producto.
  * `PUT /products/:id` — Guardar cambios del producto.
  * `DELETE /products/:id` — Eliminar el producto.
* **Categorías:**
  * `GET /categories` — Grilla de categorías.
  * `GET /categories/:id` — Cargar datos de la categoría seleccionada.
  * `POST /categories` — Dar de alta una nueva categoría.
  * `PUT /categories/:id` — Actualizar una categoría.
  * `DELETE /categories/:id` — Dar de baja una categoría.

## 🔐 Login y Admin

Los usuarios se guardan localmente con contraseña hasheada (`sha256:salt:hash`). La sesión persiste con un token local. Las cuentas registradas desde la UI son usuarios comunes; sólo las cuentas con `adminFlag: true` ven el botón **Admin** y pueden entrar a `/admin`.

Cuenta admin semilla:

```text
Email: admin@pediloo.local
Contraseña: Admin123!
```

---

## 📁 Estructura del Proyecto

```text
src/
├── assets/         # Recursos gráficos e iconos estáticos
├── components/     # Componentes reutilizables organizados en Atomic Design (atoms, molecules, organisms)
├── pages/          # Páginas y vistas principales (Home, Products, Categories, Profile)
│   ├── Home/       # Estadísticas generales, stock crítico y accesos rápidos
│   ├── Products/   # Lista y formulario de ABM de productos
│   └── Categories/ # Lista y formulario de ABM de categorías
├── utils/          # Persistencia local y adapter API
│   ├── api.ts      # Adapter REST local para tienda y dashboard
│   └── store.ts    # Datos semilla, CRUD, carrito, usuarios y pedidos
├── App.tsx         # Enrutador (React Router DOM) y maquetación de Layout
└── index.css       # Configuración global de estilos y variables de Material Design 3
```

---

## 🎨 Características de Diseño
* **Material Design 3 (Google Android):** Uso de paletas tonales con contrastes definidos, formas redondeadas (shapes) de diferentes niveles y contornos interactivos en píldora.
* **Responsive Design:** Panel adaptativo que oculta el `Sidebar` en pantallas pequeñas/móviles y habilita un menú deslizante mediante cajón (Navigation Drawer) dinámico controlado por estado de React.
* **Gestión de Carga y Errores:** Manejo de estados de carga (`loading`) y captura centralizada de errores del adapter local.
