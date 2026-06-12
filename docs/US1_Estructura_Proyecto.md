# Documentación de Diseño — User Story #1: Estructura del Proyecto

Esta documentación detalla el diseño, la organización de directorios y la justificación técnica de la estructura creada para el frontend del panel de control de **Mi Ecommerce** (Sprint 5) en el directorio [reactfinal](file:///c:/Users/nicot/Desktop/reactfinal).

---

## 📂 Estructura General de Directorios Creada

Hemos estructurado el proyecto de la siguiente manera:

```text
📁 reactfinal/ (Raíz del proyecto)
  ├── 📁 docs/
  │    └── 📄 US1_Estructura_Proyecto.md (Esta documentación)
  ├── 📁 public/
  │    └── ⚙️ manifest.json (Configuraciones de PWA, etc.)
  ├── 📁 src/
  │    ├── 📁 assets/ (Imágenes, logos e iconos estáticos)
  │    ├── 📁 components/ (Componentes reutilizables bajo Atomic Design)
  │    │    ├── 📁 atoms/ (Elementos indivisibles de UI)
  │    │    ├── 📁 molecules/ (Unión de átomos simples)
  │    │    └── 📁 organisms/ (Estructuras de UI complejas y repetibles)
  │    ├── 📁 pages/ (Vistas completas de la aplicación)
  │    │    ├── 📁 Home/
  │    │    │    ├── 📄 Home.tsx
  │    │    │    └── 📄 Home.css
  │    │    ├── 📁 Products/
  │    │    │    ├── 📁 ProductsList/
  │    │    │    │    ├── 📄 ProductsList.tsx
  │    │    │    │    └── 📄 ProductsList.css
  │    │    │    └── 📁 ProductView/
  │    │    │         ├── 📄 ProductView.tsx
  │    │    │         └── 📄 ProductView.css
  │    │    ├── 📁 Categories/
  │    │    │    ├── 📁 CategoriesList/
  │    │    │    │    ├── 📄 CategoriesList.tsx
  │    │    │    │    └── 📄 CategoriesList.css
  │    │    │    └── 📁 CategoryView/
  │    │    │         ├── 📄 CategoryView.tsx
  │    │    │         └── 📄 CategoryView.css
  │    │    └── 📁 Profile/
  │    │         ├── 📄 Profile.tsx
  │    │         └── 📄 Profile.css
  │    ├── 📁 utils/ (Funciones de utilidad, API helpers)
  │    │    └── 📄 api.ts (Módulo central de peticiones HTTP)
  │    ├── 📄 App.css
  │    ├── 📄 App.tsx (Enrutador y diseño de layout base)
  │    ├── 📄 index.css (Estilos globales e inicialización)
  │    └── 📄 main.tsx (Punto de entrada y renderizado)
  ├── 📄 index.html (Archivo de entrada de Vite)
  ├── 📄 package.json
  └── 📄 tsconfig.json
```

---

## 🏛️ Justificación y Decisiones de Diseño

### 1. El Enfoque de Co-localización (Co-location) en `pages/`
**¿Qué hicimos?**
Para cada página (como `Home`, `ProductsList`, `ProductView`), creamos un directorio específico que agrupa tanto el archivo del componente de React (`.tsx`) como sus estilos CSS asociados (`.css`).

**¿Por qué lo hicimos?**
-   **Co-localización**: Mantener el código del componente y sus estilos juntos reduce el tiempo de búsqueda en el árbol de archivos.
-   **Escalabilidad**: Si en el futuro una página requiere pruebas unitarias (`.test.tsx`), componentes hijos específicos o assets locales, estos pueden agregarse en su propia subcarpeta sin contaminar el directorio general.
-   **Mantenibilidad**: Cuando otro desarrollador necesite modificar los estilos de la lista de productos, sabrá exactamente que `ProductsList.css` se encuentra en la misma carpeta que `ProductsList.tsx`.

**¿Por qué es mejor que otras alternativas?**
-   *Alternativa A (Separar todo por tipo de archivo)*: Tener una carpeta gigante `src/styles/` para CSS y otra `src/views/` para JS. Esto obliga a realizar saltos constantes en el explorador de archivos para modificar una sola vista, lo cual ralentiza el desarrollo y propicia la acumulación de CSS muerto (estilos que ya no se usan pero nadie borra porque están lejos del componente).
-   *Alternativa B (Componentes planos en src/pages/)*: Tener archivos sueltos como `Home.tsx` y `Home.css` en la raíz de `/pages`. Con pocas páginas funciona, pero a medida que el proyecto crece (por ejemplo, con subpáginas de categorías o detalle de ventas), el directorio se vuelve caótico e inmanejable.

---

### 2. Estructuración modular en `components/` (Atomic Design)
**¿Qué hicimos?**
Dividimos la carpeta de componentes reutilizables en tres niveles claros: `atoms`, `molecules` y `organisms`.

**¿Por qué lo hicimos?**
-   Establece una jerarquía rígida y predecible de dependencias.
-   Los componentes del nivel inferior (`atoms`) son altamente reutilizables y no conocen el contexto del negocio (por ejemplo, un botón genérico `<Button />` o un spinner `<LoadingSpinner />`).
-   Los componentes intermedios (`molecules`) combinan átomos para tareas simples (ej: un input de búsqueda con un botón de borrado).
-   Los componentes complejos (`organisms`) manejan estados y dependencias locales de mayor nivel (ej: el menú lateral `Sidebar`, que controla la navegación, o la tabla de productos `ProductTable`).

**¿Por qué es mejor que otras alternativas?**
-   *Alternativa A (Directorio components/ plano)*: Poner todos los componentes juntos. Esto causa confusión sobre qué componentes son bloques básicos y cuáles son paneles de alto nivel, derivando frecuentemente en dependencias circulares y código acoplado que es imposible de reutilizar en otros proyectos.

---

### 3. Centralización de la API en `utils/api.ts`
**¿Qué hicimos?**
Creamos una función genérica y tipada llamada `apiFetch<T>` para manejar la comunicación HTTP asíncrona con el backend en un solo lugar.

**¿Por qué lo hicimos?**
-   **DRY (Don't Repeat Yourself)**: Evita escribir la cabecera `Content-Type: application/json` y resolver `response.json()` en cada fetch.
-   **Control Centralizado**: Si la URL base (`http://localhost:3000/api`) cambia, o si necesitamos añadir un token de autenticación (sprint 6), solo debemos modificar `api.ts` en lugar de decenas de archivos.
-   **Manejo de Errores Uniforme**: Centraliza la validación de estados HTTP erróneos (ej. lanzar un error genérico si `response.ok` es falso).
-   **Seguridad de Tipos (TypeScript)**: El uso de genéricos (`<T>`) permite que cualquier componente que consuma la API sepa exactamente qué tipo de datos está recibiendo, reduciendo errores de ejecución (`undefined` properties).

**¿Por qué es mejor que otras alternativas?**
-   *Alternativa A (Hacer fetches crudos en cada componente)*: Escribir bloques `fetch().then()` repetitivos en cada useEffect. Esto duplica código, dificulta enormemente las futuras refactorizaciones de seguridad (como añadir tokens JWT) y deja el manejo de errores a la suerte de la memoria del desarrollador.

---

### 4. Mantener `index.html` en la raíz del proyecto (Estándar de Vite)
**¿Qué hicimos?**
Dejamos el archivo `index.html` en la raíz del proyecto en lugar de moverlo a `public/index.html`.

**¿Por qué lo hicimos?**
-   **Arquitectura de Vite**: A diferencia de herramientas antiguas como Create React App (basadas en Webpack), Vite no utiliza `index.html` como un simple template estático de copia; lo trata como el **punto de entrada principal** de la aplicación.
-   Vite analiza el archivo `index.html` directamente, lee el script de módulo (`<script type="module" src="/src/main.tsx"></script>`) y a partir de ahí construye el árbol de dependencias.
-   Esto acelera los tiempos de inicio del servidor de desarrollo al compilar bajo demanda únicamente los módulos requeridos.

**¿Por qué es mejor que otras alternativas?**
-   *Alternativa A (Forzar estructura estilo Webpack / CRA)*: Intentar mover `index.html` dentro de `/public` requiere reconfigurar la raíz de Vite (`root` config), lo cual rompe la convención del framework, complica la integración de plugins y añade complejidad innecesaria a las compilaciones de producción.

---

### 5. Elección de TypeScript (`.tsx` / `.ts`) sobre JavaScript (`.jsx` / `.js`)
**¿Qué hicimos?**
Configuramos todas las plantillas del proyecto en TypeScript.

**¿Por qué lo hicimos?**
-   **Detección Temprana de Errores**: TypeScript analiza el código estáticamente, detectando typos en las props o accesos a propiedades inexistentes durante la escritura, no durante la ejecución.
-   **Autocompletado Robusto (IntelliSense)**: Al definir interfaces claras para los modelos (como el modelo de un Producto), el IDE sugiere automáticamente los atributos disponibles.
-   **Documentación Viva**: Las definiciones de tipos funcionan como una documentación nativa del código, facilitando el trabajo colaborativo en equipo.

---

## 🛠️ Detalles de la Implementación Realizada

1.  **Modelo Atómico**: Inicializadas las carpetas en `src/components/` con archivos `.gitkeep` para persistencia en el repositorio Git.
2.  **Scaffolding de Vistas**: Creados los placeholders (archivos `.tsx` y `.css`) para:
    -   `Home`
    -   `ProductsList`
    -   `ProductView`
    -   `CategoriesList`
    -   `CategoryView`
    -   `Profile`
3.  **Utilidades API**: Definida la constante `API_BASE_URL` y la función centralizada `apiFetch` en `src/utils/api.ts` con tipado de datos y manejo de códigos HTTP sin cuerpo (como 204).
