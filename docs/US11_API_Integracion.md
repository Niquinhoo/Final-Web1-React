# Documentación de Diseño — Integración de API REST y SQLite Backend

> Estado histórico: esta documentación describe la etapa donde React consumía Express en `localhost:3000`. La entrega actual funciona React-only con persistencia local. Ver `docs/US12_Persistencia_Local_Auth_Admin.md`.

Esta documentación detalla la integración del backend en Express y SQLite ([Web-1](file:///c:/Users/nicot/Desktop/Web-1)) con el panel de administración en React ([reactfinal](file:///c:/Users/nicot/Desktop/reactfinal)) correspondiente al Sprint 5, facilitando operaciones CRUD sincrónicas y la actualización del inventario de productos.

---

## 💻 Configuración del Espacio de Trabajo Unificado

Para agilizar el desarrollo simultáneo de ambos proyectos en un único entorno de edición de código (por ejemplo, VS Code), se configuró el archivo de espacio de trabajo [react-ecommerce.code-workspace](file:///c:/Users/nicot/Desktop/reactfinal/react-ecommerce.code-workspace) en la raíz del frontend.

El espacio de trabajo agrupa ambas carpetas:
- **React Dashboard:** El panel administrativo (`reactfinal`) ejecutándose en el puerto `5173`.
- **Express Backend:** El servidor de la API y tienda EJS (`Web-1`) ejecutándose en el puerto `3000`.

---

## 🗄️ Esquema de Base de Datos SQLite (Tabla de Productos con Stock)

Se modificó el modelo relacional en la base de datos local [database.db](file:///c:/Users/nicot/Desktop/Web-1/db/database.db) mediante [schema.sql](file:///c:/Users/nicot/Desktop/Web-1/db/schema.sql) para dar soporte a las operaciones de inventario de productos requeridas por el dashboard.

### Tabla `products` modificada
```sql
CREATE TABLE IF NOT EXISTS products (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    description TEXT,
    price REAL NOT NULL,
    src TEXT,
    category TEXT,
    isTopSeller INTEGER DEFAULT 0,
    stock INTEGER NOT NULL DEFAULT 0
);
```

### Inicialización y Datos Semilla
- En [seedData.js](file:///c:/Users/nicot/Desktop/Web-1/data/seedData.js), se integró el atributo `stock` en todos los objetos del arreglo de productos semilla para inicializar la tienda con inventario real (valores: `15`, `10`, `24`, `8`, `5`).
- En [bootstrap.js](file:///c:/Users/nicot/Desktop/Web-1/db/bootstrap.js), se ajustó la inserción para inyectar este valor inicial de forma segura.
- La base de datos se regeneró ejecutando el script [migrate.js](file:///c:/Users/nicot/Desktop/Web-1/migrate.js).

---

## 🔌 Habilitación de CORS (Cross-Origin Resource Sharing)

Para permitir que la aplicación del dashboard en React (`http://localhost:5173`) realice peticiones HTTP asíncronas hacia el backend en Express (`http://localhost:3000`) sin bloqueos de seguridad del navegador, se instaló la dependencia `cors` en el backend y se activó globalmente en [app.js](file:///c:/Users/nicot/Desktop/Web-1/app.js) justo después de inicializar la aplicación.

```javascript
const cors = require('cors');
app.use(cors());
```

---

## 📌 Arquitectura del Enrutador REST API `/api`

Se implementó el enrutador [api.router.js](file:///c:/Users/nicot/Desktop/Web-1/routes/api.router.js) para procesar solicitudes HTTP en formato JSON y interactuar directamente con la base de datos mediante queries sincrónicas de `better-sqlite3`.

### Endpoints Expuestos

#### 1. Productos (`/api/products`)
| Método | Endpoint | Descripción | Cuerpo (JSON) / Respuesta |
| :--- | :--- | :--- | :--- |
| **GET** | `/products` | Obtiene el listado completo de productos formateados con su stock y miniatura. | `Array<ProductData>` (JSON) |
| **GET** | `/products/:id` | Obtiene los detalles de un producto por ID. Retorna `404` si no existe. | `ProductData` (JSON) |
| **POST** | `/products/new` | Registra un nuevo producto. Valida que `price` y `stock` no sean negativos (>=0). | `ProductData` (JSON) |
| **PUT** | `/products/:id/edit` | Modifica un producto existente. Realiza la misma validación de números no negativos. | `ProductData` (JSON) |
| **DELETE** | `/products/:id/delete` | Elimina físicamente un producto de la base de datos. | `204 No Content` |

#### 2. Categorías (`/api/categories`)
| Método | Endpoint | Descripción | Cuerpo (JSON) / Respuesta |
| :--- | :--- | :--- | :--- |
| **GET** | `/categories` | Lista todas las categorías con su nombre, icono y tipo para el panel. | `Array<CategoryData>` (JSON) |
| **GET** | `/categories/:id` | Obtiene el detalle de una categoría por ID. Retorna `404` si no existe. | `CategoryData` (JSON) |
| **POST** | `/categories` | Crea una nueva categoría. Por defecto asigna el tipo `other`. | `CategoryData` (JSON) |
| **PUT** | `/categories/:id` | Edita el nombre o icono de una categoría existente. | `CategoryData` (JSON) |
| **DELETE** | `/categories/:id` | Elimina una categoría de la base de datos. | `204 No Content` |

---

## ⚡ Verificación del Funcionamiento e Integridad

1.  **Tienda EJS (Legacy):** El backend sigue sirviendo las vistas EJS tradicionales en `http://localhost:3000`. Se validó que las páginas de inicio, lista de categorías y detalle de producto rendericen correctamente y muestren la información procedente de la base de datos con stock.
2.  **Integración Frontend (Vite + React):** Se comprobó que el panel administrativo cargue correctamente los totales de stock, lista de productos y categorías desde SQLite, y realice el flujo completo de creación, edición y eliminación de datos de forma interactiva e inmediata.
