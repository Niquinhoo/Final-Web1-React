# Documentación de Diseño — User Story #5: Menú de Navegación

Esta documentación detalla la organización del menú principal, su árbol de navegación, la adopción del sistema visual **Material Design 3 (MD3) / Google Android**, y la modularización en componentes separados (**Sidebar** y **Header** organisms) dentro del panel de control de **Mi Ecommerce** (Sprint 5) en el directorio [reactfinal](file:///c:/Users/nicot/Desktop/reactfinal).

---

## 🏛️ Estructura del Árbol de Navegación y Modularidad

De acuerdo con la metodología **Atomic Design**, hemos desacoplado la interfaz de la navegación del archivo principal `App.tsx` en organismos autocontenidos:

```text
📁 reactfinal/
  └── 📁 src/
       ├── 📁 components/
       │    └── 📁 organisms/
       │         ├── 📁 Sidebar/
       │         │    ├── 📄 Sidebar.tsx (Organismo de Navegación)
       │         │    └── 📄 Sidebar.css (Estilos específicos del Drawer)
       │         └── 📁 Header/
       │              ├── 📄 Header.tsx (Organismo de Barra Superior)
       │              └── 📄 Header.css (Estilos específicos del Header)
       ├── 📄 App.tsx (Template Layout y Router)
       └── 📄 App.css (Estructura de Layout principal)
```

### 1. Organismo Sidebar
*   **Archivo:** [Sidebar.tsx](file:///c:/Users/nicot/Desktop/reactfinal/src/components/organisms/Sidebar/Sidebar.tsx)
*   **Responsabilidad:** Contiene la estructura de la barra lateral (o cajón responsivo), los enlaces de navegación (`/home`, `/products`, `/categories`, `/profile`) y los iconos dinámicos de *Material Symbols*.
*   **Props Recibidas:**
    *   `isSidebarOpen` (boolean): Determina si el cajón responsivo está visible en mobile.
    *   `closeSidebar` (función): Callback para cerrar el cajón tras hacer clic en una ruta o el overlay.

### 2. Organismo Header
*   **Archivo:** [Header.tsx](file:///c:/Users/nicot/Desktop/reactfinal/src/components/organisms/Header/Header.tsx)
*   **Responsabilidad:** Provee el título global de la sección actual y el botón de menú hamburguesa (**☰**) para invocar la navegación lateral en pantallas pequeñas.
*   **Props Recibidas:**
    *   `toggleSidebar` (función): Callback para alternar la visibilidad de la barra lateral.

---

## 🎨 Adopción de Material Design 3 (Google Android) en la Sidebar

El Menú de Navegación aplica los siguientes patrones de la guía de diseño de **Material Design 3 (MD3)**:

### 1. Estados Interactivos y Contenedor Activo (Active-Pill)
*   **Hover (Sobrevolado):** Al colocar el cursor sobre un elemento de menú inactivo, se dibuja un overlay translúcido con una opacidad del `8%` utilizando el color de contraste (`--md-sys-color-on-surface-variant`).
*   **Foco Activo (Active Pill):** Cuando el enrutador detecta que la ruta coincide con el enlace, el componente `<NavLink>` recibe automáticamente la clase `.active`. Esto transforma el botón en una píldora prominente con bordes completamente redondeados (`border-radius: var(--md-sys-shape-corner-full)`), aplicando el color de acento secundario (`--md-sys-color-secondary-container`) y texto contrastante.
*   **Micro-animación en Presión:** Al hacer clic (`:active`), el elemento realiza un leve escalado negativo (`transform: scale(0.97)`), emulando la respuesta táctil de un dispositivo Android.

### 2. Iconografía Dinámica (Material Symbols Outlined)
*   **Iconos inactivos:** Se renderizan con un trazo delineado común (`fill: 0`, peso `400`).
*   **Iconos activos:** Al activarse la ruta, se actualiza la propiedad de variación de la fuente del icono (`font-variation-settings: 'FILL' 1, 'wght' 600`), rellenando el icono de forma sólida para centrar la atención.

---

## 📱 Comportamiento Adaptable en Dispositivos Móviles (Drawer Responsivo)

Para garantizar la usabilidad en pantallas pequeñas (ancho inferior o igual a `1024px`), el menú de navegación pasa de ser una barra lateral fija a un cajón de navegación interactivo (Navigation Drawer):

### 1. Deslizamiento por Transición CSS
El drawer lateral utiliza aceleración por hardware mediante transformaciones 2D y una curva de suavizado natural:
*   **Oculto:** `.sidebar` se desplaza fuera de la pantalla mediante `transform: translateX(-100%)`.
*   **Abierto:** Al presionar el botón hamburguesa (**☰**) en el Header, se añade la clase `.open` que reubica el drawer mediante `transform: translateX(0)`.
*   **Transición:** La animación dura `0.3 segundos` utilizando la curva `cubic-bezier(0.2, 0, 0, 1)`, logrando una sensación orgánica de deslizamiento.

### 2. Cierre por Clic Externo (Scrim Backdrop)
*   Un overlay translúcido (`.sidebar-overlay`) de color oscuro con opacidad variable cubre todo el espacio del Main Area al abrir el drawer, bloqueando interacciones accidentales sobre el contenido inferior.
*   Este overlay posee un controlador de eventos `onClick` en React que restablece el estado de apertura a `false`.

---

## 🛠️ Detalles de la Verificación Realizada

Para verificar la correcta integración y funcionamiento de la User Story #5, realizamos las siguientes pruebas locales:

1.  **Navegación Fluida:** Confirmamos que al hacer clic en cualquiera de los enlaces de la sidebar, el componente `<Outlet />` del Main Area renderiza instantáneamente la página correspondiente sin recargar la página del navegador.
2.  **Sincronización del Indicador Activo:** Comprobamos que el estilo de la píldora activa y el relleno de los iconos se actualiza instantáneamente en concordancia con el cambio de ruta (URL).
3.  **Comportamiento del Drawer en Mobile:** Redimensionamos el viewport a `768px` y `375px` verificando:
    *   La ocultación automática de la barra lateral.
    *   La aparición del botón hamburguesa (**☰**) en la barra superior.
    *   La transición de entrada y salida de la barra lateral al abrirla.
    *   El funcionamiento del overlay scrim y el cierre al hacer clic fuera del menú.
