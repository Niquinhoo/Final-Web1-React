# Documentación de Diseño — User Story #6: Home (Inicio)

Esta documentación detalla el diseño de la pantalla principal de la aplicación (**Home / Inicio**), su integración con datos de perfil en almacenamiento local (`localStorage`), y la unificación de métricas y controles interactivos en el panel de control de **Mi Ecommerce** (Sprint 5) en el directorio [reactfinal](file:///c:/Users/nicot/Desktop/reactfinal).

---

## 🏛️ Estructura General de la Home

La vista de Inicio actúa como el panel general del negocio y centro de control operativo. Su estructura está dividida en dos secciones principales organizadas vertical y horizontalmente:

```
+-----------------------------------------------------------------------------+
|  ¡Hola <USERNAME>!                                                          |
|  Bienvenido de nuevo. Esto es lo que está pasando en tu catálogo hoy.        |
+-----------------------------------------------------------------------------+
|                                                                             |
|  [ Productos: X ]      [ Categorías: Y ]     [ Stock Bajo ]     [ Ventas ]  |
|  - Ver Listado         - Ver Listado                                        |
|  - Agregar Prod.       - Agregar Cat.                                       |
|                                                                             |
+-----------------------------------------------------------------------------+
|                                  |                                          |
|                                  |           Actividad Reciente             |
|        Gráfico Visual            |           +-----------------------+      |
|     (Estado de Inventario)       |           | Acción   | Item | Hora|      |
|                                  |           +-----------------------+      |
|                                  |                                          |
+-----------------------------------------------------------------------------+
```

---

## 🧩 Componentes Clave y Flujo de Datos

### 1. Encabezado de Bienvenida Dinámico
*   **Archivo:** [Home.tsx](file:///c:/Users/nicot/Desktop/reactfinal/src/pages/Home/Home.tsx)
*   **Comportamiento:**
    *   Lee el objeto `user_profile` del `localStorage` al montar el componente (`useEffect`).
    *   Si el usuario ha guardado su nombre en la pestaña **Perfil** (clave `firstName`), se actualiza el estado `username` y se muestra en pantalla: `¡Hola {username}!`.
    *   Si no hay ningún perfil creado aún, el sistema utiliza el valor de respaldo `"Administrador"` por defecto (`¡Hola Administrador!`), dejando la interfaz lista para futuras integraciones con sesiones reales.

### 2. Bloque de Acciones de Productos
*   **Objetivo:** Unifica en una sola tarjeta la métrica y las acciones de creación/visualización del catálogo.
*   **Elementos:**
    *   Contador dinámico del total de productos cargados.
    *   Botón **Ver Listado** (`/products`): Enlace directo para consultar el catálogo.
    *   Botón **Agregar Producto** (`/products/new`): Enlace directo para abrir el formulario de alta de nuevo producto.

### 3. Bloque de Acciones de Categorías
*   **Objetivo:** Unifica en una sola tarjeta la métrica y las acciones de las categorías.
*   **Elementos:**
    *   Contador dinámico del total de categorías registradas.
    *   Botón **Ver Listado** (`/categories`): Enlace directo para ver categorías.
    *   Botón **Agregar Categoría** (`/categories/new`): Enlace directo para crear una nueva categoría.

### 4. Paneles Estadísticos Auxiliares
*   **Stock Bajo:** Muestra el número de productos que tienen existencias de `12` o menos unidades. Adopta una alerta visual destacada mediante un borde izquierdo rojo (`border-left: 4px solid var(--md-sys-color-error)`).
*   **Ventas Recientes:** Indicador financiero global listo para inyectar datos de facturación real (inicialmente en `$0.00`).

---

## 🎨 Especificaciones de Estilos e Interacción (CSS)

*   **Elevación y Hover:** Las tarjetas de métricas (`.stat-card`) utilizan la especificación de tarjetas elevadas de **Material Design 3**, escalando suavemente hacia arriba (`transform: translateY(-2px)`) y dibujando una sombra sutil (`box-shadow`) al colocar el cursor encima.
*   **Botones Integrados:** Los botones dentro de los bloques se estructuran en un flexbox horizontal (`.stat-actions`) que crece proporcionalmente. Usan variantes de botones MD3:
    *   `.md3-btn-outlined` para ver listados (acción secundaria).
    *   `.md3-btn-filled` para agregar recursos (acción primaria).
*   **Responsividad:** Mediante CSS Grid, las tarjetas colapsan y se acomodan automáticamente de forma vertical cuando el ancho de la pantalla disminuye, garantizando que el texto y los botones no colisionen.

---

## 🛠️ Detalles de la Verificación Realizada

1.  **Navegación:** Comprobamos que todos los enlaces integrados en las tarjetas de productos y categorías dirigen correctamente a las rutas virtuales de destino `/products`, `/products/new`, `/categories` y `/categories/new` sin recargar la página.
2.  **Sincronización de Sesión Local:** Validamos que tras modificar el perfil de administrador en la pestaña **Perfil**, la pantalla de Inicio refleja de manera inmediata el nombre actualizado al volver a cargar el panel.
