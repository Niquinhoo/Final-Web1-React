# Documentación de Diseño — User Stories #9 & #10: Detalle, Creación y Edición de Producto

Esta documentación detalla el diseño de las pantallas de **Detalle y Edición de Producto** (US9) y **Creación de Producto** (US10), la integración con las rutas específicas del backend SQLite, la lógica de validación de entradas y la sincronización de la tarjeta de vista previa en tiempo real en el directorio [reactfinal](file:///c:/Users/nicot/Desktop/reactfinal).

---

## 🏛️ Estructura General y Distribución (Split Layout)

Las pantallas de administración individual de productos utilizan un diseño de rejilla dividida en dos columnas (`product-view-split`):
1.  **Columna de Vista Previa (Izquierda - 320px):** Muestra una tarjeta estática (`ProductCard` / `ProductPreview`) con la imagen actual, el identificador (`#id`), nombre, categoría, stock y precio del producto. Se actualiza en tiempo real a medida que el usuario escribe en el formulario.
2.  **Columna del Formulario (Derecha):** Contiene los campos del formulario (`EditForm`), incluyendo nombre, precio, categoría, stock (ajustador incremental), URL de la imagen (con botón de remoción) y descripción, acompañados por la botonera de acción (*Guardar Cambios* y *Cancelar*).

En pantallas de tablet y móviles (ancho ≤ 1024px), las columnas colapsan verticalmente, posicionando la tarjeta de vista previa encima del formulario.

---

## 🧩 Implementación Técnica e Interactividad

### 1. Sincronización en Tiempo Real
*   El componente [ProductView.tsx](file:///c:/Users/nicot/Desktop/reactfinal/src/pages/Products/ProductView/ProductView.tsx) centraliza los estados interactivos del formulario (`title`, `price`, `stock`, `src`, `category`, `description`).
*   Los inputs del formulario actúan como componentes controlados. Al modificarse, actualizan los estados locales de React, que a su vez se inyectan en la tarjeta de vista previa lateral, logrando sincronización visual inmediata sin latencia.

### 2. Ajustador Incremental de Stock
*   El stock se puede editar ingresando el valor numérico en el input o incrementándolo/decrementándolo en una unidad utilizando los botones **➕** y **➖** de forma táctil.
*   **Seguridad de Rango:** La función controladora `handleStockChange` utiliza `Math.max(0, prev + amount)` para garantizar que el stock nunca adopte un valor negativo.

### 3. Botón "Eliminar Imagen"
*   Se agregó un botón interactivo y condicional junto al input de URL de imagen (`.btn-clear-image`).
*   Solo se muestra si el campo `src` contiene texto. Al pulsarlo, limpia el input y el estado de la imagen de forma inmediata, actualizando la vista previa al marcador de posición por defecto ("Sin Imagen").

### 4. Botón Cancelar (Restauración de Datos)
*   Para cumplir estrictamente con los requerimientos visuales, el botón *"Cancelar"* no navega hacia atrás. Restablece todos los inputs al valor cargado originalmente del producto (`originalData`). 
*   Si el usuario está creando un nuevo producto, el botón limpia la totalidad del formulario a sus valores por defecto.

### 5. Validaciones de Datos en Formulario
*   **Nombre:** Campo obligatorio (`required`).
*   **Precio y Stock:** Se sanitizan en el envío (`onSubmit`) asegurando que sean valores no negativos y formateándolos a `0` si el usuario introduce valores nulos o caracteres extraños mediante `Math.max(0, Number(val))`.
*   **Descripción:** Opcional.

### 6. Endpoints de Persistencia SQLite
Alineamos el frontend con el backend SQLite de `Web-1-STP2`. Las llamadas HTTP Fetch se realizan a los siguientes endpoints específicos:

| Operación | Método | Endpoint de API SQLite |
| :--- | :--- | :--- |
| **Cargar Detalle** | `GET` | `/products/:id` |
| **Crear Producto** | `POST` | `/products/new` |
| **Modificar Producto** | `PUT` | `/products/:id/edit` |
| **Eliminar Producto** | `DELETE` | `/products/:id/delete` |

---

## 🛠️ Detalles de la Verificación Realizada

Para certificar el correcto funcionamiento de las User Stories #9 y #10, validamos:
1.  **Edición y Cancelación:** Modificamos el precio y nombre de un producto, pulsamos *"Cancelar"* y verificamos que regresaron a su valor original de base de datos de inmediato.
2.  **Remoción de Imagen:** Añadimos una URL, se sincronizó en la tarjeta previa, hicimos clic en *"Eliminar Imagen"* y la URL se vació, mostrando el icono gris neutral de respaldo.
3.  **Lógica Incremental:** Comprobamos que el botón ➖ bloquea el stock al llegar a `0`, impidiendo números negativos.
4.  **Integridad de Endpoints:** Verificamos que las acciones de Guardar (tanto en creación como en edición) y Eliminar llaman exactamente a los paths `/products/new`, `/products/:id/edit` y `/products/:id/delete`.
