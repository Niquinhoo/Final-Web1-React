# Dashboard de Administración — Mi Ecommerce (React + TypeScript + Vite)

Este proyecto representa el frontend del panel de control de **Mi Ecommerce**, diseñado bajo principios de **Material Design 3 (MD3)**. Permite a los administradores gestionar de forma visual e intuitiva el catálogo de productos y las categorías del e-commerce.

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
   El panel administrativo estará disponible en [http://localhost:5173/](http://localhost:5173/).

3. **Compilar para producción (opcional):**
   ```bash
   npm run build
   ```

---

## 🔌 Integración con el Backend (Express API)

El dashboard está completamente integrado con el backend del ecommerce desarrollado en Express. La comunicación se realiza de forma asíncrona mediante peticiones HTTP `fetch` centralizadas en el módulo helper de la aplicación.

* **Base URL de la API:** `http://localhost:3000/api` (definida en `src/utils/api.ts`).
* **Requisito:** Para que el dashboard cargue y guarde datos reales, el servidor de Express (`Web-1`) debe estar ejecutándose en paralelo en el puerto `3000`.

### Endpoints Consumidos
* **Productos:**
  * `GET /api/products` — Listado completo y búsqueda.
  * `GET /api/products/:id` — Obtener detalles de un producto para edición.
  * `POST /api/products` — Crear un producto en la base de datos SQLite.
  * `PUT /api/products/:id` — Guardar cambios del producto.
  * `DELETE /api/products/:id` — Eliminar el producto permanentemente.
* **Categorías:**
  * `GET /api/categories` — Grilla de categorías.
  * `GET /api/categories/:id` — Cargar datos de la categoría seleccionada.
  * `POST /api/categories` — Dar de alta una nueva categoría.
  * `PUT /api/categories/:id` — Actualizar los campos de una categoría.
  * `DELETE /api/categories/:id` — Dar de baja una categoría.

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
├── utils/          # Módulos de utilidad
│   └── api.ts      # Cliente API tipado (apiFetch) con soporte genérico de TypeScript
├── App.tsx         # Enrutador (React Router DOM) y maquetación de Layout
└── index.css       # Configuración global de estilos y variables de Material Design 3
```

---

## 🎨 Características de Diseño
* **Material Design 3 (Google Android):** Uso de paletas tonales con contrastes definidos, formas redondeadas (shapes) de diferentes niveles y contornos interactivos en píldora.
* **Responsive Design:** Panel adaptativo que oculta el `Sidebar` en pantallas pequeñas/móviles y habilita un menú deslizante mediante cajón (Navigation Drawer) dinámico controlado por estado de React.
* **Gestión de Carga y Errores:** Manejo de estados de carga (`loading`) y captura centralizada de errores HTTP en las peticiones.
