# Documentación de Diseño — User Stories #7 & #8: Listado y Filtrado de Productos

Esta documentación detalla el diseño de la pantalla de **Listado y Administración de Productos** (`ProductsList`), la integración de la columna de imágenes con loaders de precarga (US7), y la implementación de la barra de búsqueda responsiva con lógica de filtrado en tiempo real (US8) en el directorio [reactfinal](file:///c:/Users/nicot/Desktop/reactfinal).

---

## 🏛️ Estructura General y Distribución de Elementos

La vista de productos permite la administración completa del inventario y está compuesta por:
1.  **Encabezado de Sección:** Título de la página, descripción, input de búsqueda (`.search-container`) y el botón *"Agregar Producto"*.
2.  **Tarjetas de Resumen (Métricas de Inventario):** Total de productos, recuento de stock bajo (stock ≤ 12) y categorías activas.
3.  **Tabla Principal de Productos:** Rejilla estructurada con columnas para **Imagen**, **ID**, **Nombre**, **Categoría**, **Precio**, **Stock**, **Estado** y **Acciones** (editar, eliminar).

---

## 🧩 Componentes e Implementación Técnica

### 1. Columna de Imagen Thumbnail y Loader (`ProductRowImage`)
*   **Archivo:** [ProductsList.tsx](file:///c:/Users/nicot/Desktop/reactfinal/src/pages/Products/ProductsList/ProductsList.tsx)
*   **Comportamiento (Precarga y Fallbacks):**
    *   Para evitar saltos visuales en la tabla mientras se descargan las imágenes desde servidores externos, implementamos el subcomponente local `ProductRowImage`.
    *   **Estado de Carga:** Muestra un contenedor con un spinner animado rotatorio (`hourglass_empty`) hasta que se activa el evento `onLoad` de la etiqueta `<img />`.
    *   **Estado de Error / Sin URL:** Si la URL de la imagen falla o está vacía (`onError`), se sustituye la imagen por un contenedor neutral con el icono genérico de imagen (`image`).

### 2. Barra de Búsqueda y Filtrado en Tiempo Real (US8)
*   **Lógica de Filtro:**
    *   La tabla no realiza recargas de página. El filtrado se realiza localmente mediante el estado `searchTerm`.
    *   La lista de productos (`products`) se reduce dinámicamente mediante `.filter()` comparando la búsqueda contra el **Nombre** (`title`), **Categoría** (`category`) e **Identificador** (`id`) del producto de forma case-insensitive.
    *   **Aviso de sin coincidencias:** Si la lista filtrada queda vacía y existe un término de búsqueda, la tabla muestra un aviso especial indicando que no hay coincidencias.

### 3. Foco Expansivo en Mobile (US7 & US8 Bonus)
*   **Buscador en Pantallas Pequeñas (≤ 768px):**
    *   Al enfocar el input (`onFocus`), el estado `isSearchFocused` cambia a `true`.
    *   Esto añade la clase `.search-active` en el contenedor padre, lo cual expande de forma absoluta la barra de búsqueda para cubrir el 100% de la cabecera, ocultando momentáneamente el título y el botón de adición para evitar desbordes visuales.
*   **Botón Agregar Adaptable:**
    *   En pantallas de teléfonos, el texto del botón se oculta (`.btn-text { display: none }`) y el botón se redimensiona a formato circular de `48x48px`, mostrando únicamente el icono `add`.

---

## 🎨 Especificaciones de Estilos CSS

*   **Miniaturas:** Las imágenes de la tabla están acotadas a `48x48px` con bordes redondeados medianos y un ajuste de proporción `object-fit: cover` para prevenir distorsiones.
*   **Transiciones de Búsqueda:** La expansión y el cambio de color de bordes al enfocar el input de búsqueda tienen transiciones suaves de `0.3s cubic-bezier(0.2, 0, 0, 1)`.
*   **Spinner de Precarga:** El icono de carga rota indefinidamente mediante la regla `@keyframes rotate { from { transform: rotate(0) } to { transform: rotate(360deg) } }`.

---

## 🛠️ Detalles de la Verificación Realizada

Realizamos las siguientes pruebas de verificación:
1.  **Filtrado de Productos:** Validamos que escribir un término (ej. `"Remera"`) reduce la tabla de forma instantánea y actualiza la paginación a `Mostrando 1 a N de N resultados`.
2.  **Aviso de Sin Resultados:** Certificamos que búsquedas inválidas muestran la leyenda `"No se encontraron productos coincidentes."` de manera limpia.
3.  **Auditado de Mobile:** Al emular un dispositivo móvil:
    *   Comprobamos la animación del buscador expandiéndose al 100% del ancho del viewport al recibir foco.
    *   Comprobamos que el botón agregar se transforma a icono circular de forma limpia.
