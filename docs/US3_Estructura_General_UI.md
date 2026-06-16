# Documentación de Diseño — User Story #3: Estructura General de la UI

Esta documentación detalla la organización estructural, el comportamiento responsivo y la estética de **Material Design 3 (MD3) / Google Android** implementada para el panel de control de **Mi Ecommerce** (Sprint 5) en el directorio [reactfinal](file:///c:/Users/nicot/Desktop/reactfinal).

---

## 🏛️ Estructura del Layout y Flujo de Contenedores

La aplicación utiliza una plantilla maestra en [App.tsx](file:///c:/Users/nicot/Desktop/reactfinal/src/App.tsx) que divide la interfaz de usuario en dos contenedores principales:

1.  **Sidebar (Barra Lateral):** Contiene el título de la marca y el menú de navegación principal (`sidebar-nav`). Actúa como cajón de navegación (Navigation Drawer).
2.  **Main Area (Área Principal de Trabajo):** Contiene la barra superior fija (`Header`) y el visualizador del contenido de la ruta activa (`Content` con `<Outlet />`).

```
+-------------------------------------------------------------+
|                                                             |
|   +------------------+ +--------------------------------+   |
|   |                  | |  Header (Top App Bar) [Fixed]  |   |
|   |                  | +--------------------------------+   |
|   |                  | |                                |   |
|   |     Sidebar      | |                                |   |
|   |    [260px]       | |                                |   |
|   |                  | |            Content             |   |
|   |                  | |          [Scrollable]          |   |
|   |                  | |                                |   |
|   |                  | |                                |   |
|   +------------------+ +--------------------------------+   |
|                                                             |
+-------------------------------------------------------------+
```

---

## 🎨 Adopción de Material Design 3 (Google Android)

Para lograr un lenguaje visual corporativo moderno y de alta densidad que emule la estética de Google Android, adoptamos las siguientes convenciones de **Material Design 3**:

### 1. Paleta de Colores Tonal (Tonal Color System)
Establecimos las variables CSS en [index.css](file:///c:/Users/nicot/Desktop/reactfinal/src/index.css) basándonos en la guía de diseño de Android:
-   **Primary (`--md-sys-color-primary` - `#00236f`):** Define el color primario de acento para la identidad y elementos interactivos activos.
-   **Surface Container Low (`--md-sys-color-surface-container-low` - `#eff4ff`):** Fondo de la barra lateral, proporcionando un contraste suave contra el contenido principal.
-   **Surface (`--md-sys-color-surface` - `#f8f9ff`):** Fondo del Header superior.
-   **Background (`--md-sys-color-background` - `#f8f9ff`):** Fondo global del espacio de trabajo.
-   **Outline Variant (`--md-sys-color-outline-variant` - `#c5c5d3`):** Bordes delgados y sutiles para delimitar secciones sin saturar la vista.

### 2. Forma y Bordes Redondeados (Shapes)
-   **Active Pill Indicator (Cápsulas):** En concordancia con los patrones MD3, los elementos activos y en hover del menú lateral utilizan un contorno en forma de píldora (`border-radius: 9999px` o `var(--md-sys-shape-corner-full)`).
-   **Containers (Tarjetas y Tablas):** Emplean un redondeado suave de nivel 1 (`8px` o `var(--md-sys-shape-corner-lg)`) para un acabado moderno y profesional.

### 3. Iconografía y Tipografía
-   **Material Symbols Outlined:** Integramos la fuente oficial de iconos de Google Material en [index.html](file:///c:/Users/nicot/Desktop/reactfinal/index.html) con un grosor estandarizado de `24px` y relleno dinámico al activarse (`fill: 1` vs `fill: 0`).
-   **Inter Font Family:** Cargada globalmente con pesos desde Regular (400) hasta Bold (700) para garantizar legibilidad en tablas de alta densidad.

---

## 📱 Comportamiento Adaptable (Responsive Layout)

El comportamiento de la UI cambia de forma dinámica según el ancho del dispositivo usando media queries CSS (`@media (max-width: 1024px)`):

### A. Vista Desktop (Ancho > 1024px)
-   La barra lateral (`Sidebar`) permanece fija a la izquierda ocupando un ancho de `260px` y el `100vh` de la pantalla.
-   El `Main Area` se despliega contiguo a ella. El `Header` permanece pegado arriba (`sticky`) y el contenedor de `Content` posee scroll vertical independiente para evitar que toda la ventana scrollee.

### B. Vista Mobile/Tablet (Ancho <= 1024px)
-   **Ocultación y Drawer:** La barra lateral se transforma en un cajón deslizante, desplazándose fuera de la pantalla (`transform: translateX(-100%)`).
-   **Activación:** Se habilita un botón con el icono de menú hamburguesa (`menu`) en el Header. Al presionarse, se altera el estado local en React (`isSidebarOpen`), agregando la clase `.open` que desliza la barra lateral suavemente en `0.3 segundos` (`transform: translateX(0)`).
-   **Overlay y Backdrop:** Se despliega un fondo oscuro translúcido (`sidebar-overlay`) cubriendo el contenido principal. Al hacer clic sobre cualquier sección de este overlay, la barra lateral se vuelve a cerrar instantáneamente.
