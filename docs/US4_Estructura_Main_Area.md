# Documentación de Diseño — User Story #4: Estructura de Main Area

Esta documentación detalla la organización interna, el comportamiento de scroll y la estructura visual de la sección **Main Area** implementada para el panel de control de **Mi Ecommerce** (Sprint 5) en el directorio [reactfinal](file:///c:/Users/nicot/Desktop/reactfinal).

---

## 🏛️ Estructura y Flujo del Main Area

El Main Area representa la zona derecha de la aplicación (en escritorio) o la pantalla completa (en dispositivos móviles cuando el menú lateral está colapsado). Esta área aloja el contenido activo de las rutas. De acuerdo con los requerimientos de la **User Story #4**, el Main Area se divide estrictamente en dos subsecciones funcionales:

1.  **Header (Top App Bar):** Barra superior fija que contiene el disparador del menú móvil, el título de la página actual y elementos de contexto global.
2.  **Content (Contenedor de Ruta):** Panel inferior donde se cargan las vistas del enrutador (`<Outlet />`). Este contenedor maneja de forma independiente el scroll vertical, previniendo fugas de scroll hacia el resto del layout.

```text
+------------------------------------------------------+
|                     Main Area                        |
|                                                      |
|   +----------------------------------------------+   |
|   |            Header (Top App Bar)              |   |
|   |         [Altura Fija: 64px, Sticky]          |   |
|   +----------------------------------------------+   |
|   |                   Content                    |   |
|   |                                              |   |
|   |             [Scroll Independiente]           |   |
|   |             [flex-grow: 1, auto-y]           |   |
|   |                                              |   |
|   +----------------------------------------------+   |
|                                                      |
+------------------------------------------------------+
```

---

## 🎨 Especificaciones Técnicas de Maquetación (CSS)

Para lograr que el Header permanezca fijo en la parte superior y el Content scrollee de forma independiente sin afectar el alto de la ventana del navegador, implementamos las siguientes reglas CSS en [App.css](file:///c:/Users/nicot/Desktop/reactfinal/src/App.css):

### 1. Contenedor de Altura Bloqueada (`.main-area`)
El Main Area se define como una caja flex vertical con el scroll deshabilitado para evitar desplazamientos de la página exterior:
```css
.main-area {
  flex-grow: 1;              /* Toma todo el ancho restante contiguo al Sidebar */
  display: flex;
  flex-direction: column;    /* Apila el Header y el Content verticalmente */
  min-height: 100vh;
  box-sizing: border-box;
  overflow: hidden;          /* Bloquea el scroll general del navegador */
}
```

### 2. Encabezado Fijo (`.header`)
El Header (Top App Bar) tiene una altura definida y se posiciona de forma fija arriba mediante `sticky`:
```css
.header {
  height: 64px;              /* Altura estándar de la especificación MD3 */
  background-color: var(--md-sys-color-surface);
  border-bottom: 1px solid var(--md-sys-color-surface-container-high);
  display: flex;
  align-items: center;
  position: sticky;
  top: 0;
  z-index: 10;               /* Se superpone al contenido scrolleable */
  box-sizing: border-box;
}
```

### 3. Área de Scroll Independiente (`.content`)
El panel de contenido crece para llenar el alto restante y encapsula su propio scroll vertical:
```css
.content {
  padding: var(--md-sys-spacing-margin); /* Margen interno estandarizado en 32px */
  flex-grow: 1;              /* Ocupa el 100% de la altura disponible restante */
  overflow-y: auto;          /* Habilita scroll vertical independiente si el contenido excede el alto */
  box-sizing: border-box;
  background-color: var(--md-sys-color-background);
}
```

---

## 🧩 Integración en la Plantilla de React

La maquetación JSX correspondiente en [App.tsx](file:///c:/Users/nicot/Desktop/reactfinal/src/App.tsx) respeta esta jerarquía estructural de forma semántica usando etiquetas HTML5 (`<header>` y `<main>`):

```tsx
// Dentro de la función Layout en App.tsx:
return (
  <div className="dashboard-layout">
    {/* Sidebar Navigation Drawer */}
    <aside className={`sidebar ${isSidebarOpen ? 'open' : ''}`}>
      {/* Menú de navegación... */}
    </aside>

    {/* Main Content Area (US4) */}
    <div className="main-area">
      <header className="header">
        <button className="mobile-menu-toggle" onClick={toggleSidebar}>
          <span className="material-symbols-outlined">menu</span>
        </button>
        <h1 className="header-title">Panel de Control</h1>
      </header>
      <main className="content">
        <Outlet /> {/* Aquí se inyectan dinámicamente las páginas del router */}
      </main>
    </div>
  </div>
);
```

---

## 🛠️ Detalles de la Verificación Realizada

1.  **Scroll Limpio:** Verificado que al scrollear dentro del panel de listado de productos o del formulario de perfil, el Sidebar y el Header se mantienen estáticos en su posición, sin rebotar ni desplazarse.
2.  **Responsividad Móvil:** En vistas de 1024px o menores, el Header conserva el flujo sticky y su altura de 64px. La acción de scroll en `.content` sigue comportándose de forma independiente tras abrir y cerrar el cajón del menú.
