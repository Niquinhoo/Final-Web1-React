# Migracion TS7

Fecha de implementacion: 2026-07-09.

## Objetivo

Actualizar el toolchain del proyecto a TypeScript 7, la implementacion nativa del compilador, sin modificar el comportamiento de la aplicacion React ni sus APIs.

## Cambios realizados

| Area | Antes | Despues |
| --- | --- | --- |
| Compilador | `typescript ~6.0.2` | `typescript ^7.0.2` |
| Chequeo de tipos | Incluido solo dentro de `build` | Script explicito `npm run typecheck` con `tsc -b` |
| Linter | ESLint + `typescript-eslint` | Oxlint `^1.73.0` |
| Build | `tsc -b && vite build` | `npm run typecheck && vite build` |

Se eliminaron ESLint, `typescript-eslint` y sus plugins. `typescript-eslint` aun depende de la API programatica de TypeScript 6, que TypeScript 7 todavia no publica de forma estable. Oxlint analiza TypeScript y JSX sin requerir esa API.

La configuracion nueva, [`.oxlintrc.json`](../.oxlintrc.json), ignora `dist/` y mantiene las protecciones relevantes para React:

- `react/rules-of-hooks` como error.
- `react/exhaustive-deps` como advertencia.
- `react/only-export-components` como advertencia, con exportaciones de constantes permitidas para Vite Fast Refresh.

No se modifico ningun componente, ruta, tipo de dominio ni API de la aplicacion.

## Verificacion realizada

Entorno: Node `v22.17.0`, npm `11.5.2`, TypeScript `7.0.2` y Oxlint `1.73.0`.

| Comando o prueba | Resultado |
| --- | --- |
| `npm ci` | Correcto; 107 paquetes instalados y `0 vulnerabilities` reportadas por npm. |
| `npm run typecheck` | Correcto con `tsc -b` de TypeScript 7. Un chequeo con cache toma aproximadamente 1.005 s en este equipo. |
| `npm run lint` | Correcto con Oxlint, sin diagnosticos. |
| `npm run build` | Correcto; Vite genero `dist/` en 794 ms. |
| Navegador local | `/home` y `/products` cargaron con contenido; sin overlay de Vite ni errores de consola. |

Vite conserva una advertencia no bloqueante sobre el bundle JavaScript principal de 564.39 kB sin comprimir. Es una advertencia de tamanio ya existente y no fue alterada por esta migracion.

## Uso diario

```bash
npm ci
npm run typecheck
npm run lint
npm run build
npm run dev
```

`typecheck` es el control de tipos autoritativo. No se configuraron los flags experimentales `--checkers` o `--builders`: el paralelismo predeterminado de TypeScript 7 es suficiente para este proyecto y evita ajustar recursos sin una medicion que lo justifique.

## Alcance y seguimiento

TypeScript 7 aporta las mejoras mas notables en repositorios grandes; este proyecto es pequeno, por lo que se espera una mejora modesta en tiempos absolutos. La migracion deja el proyecto listo para beneficiarse cuando el numero de archivos o el trabajo de tipos crezca.

Cuando `typescript-eslint` publique soporte nativo para la API de TypeScript 7, se puede reevaluar si sus reglas aportan algo adicional a la combinacion actual de `tsc` y Oxlint. No es necesario mantener TypeScript 6 como dependencia de compatibilidad.
