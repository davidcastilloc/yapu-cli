# CONTEXTO DEL PROYECTO - ANTIGRAVITY YAPU

## 1. Visión General
YapuCli es un framework ligero de ingeniería de contexto y estructuración de memoria estática para la consola Antigravity. Existe para combatir el desgaste de contexto (context rot) organizando el desarrollo en fases aisladas a través de una tríada de archivos de Markdown (`PROJECT.md`, `ROADMAP.md`, `STATE.md`).

## 2. Stack Tecnológico Principal
- **Runtime:** Node.js (v18+)
- **Format:** ES Modules (ESM) nativos
- **Linter:** ESLint (Flat Config moderno)
- **Testing:** Node.js Native Test Runner (`node:test` y `node:assert`)

## 3. Reglas de Arquitectura (Mandamientos)
- **Cero dependencias externas de producción:** El CLI principal no debe requerir ninguna dependencia en `dependencies` de `package.json` para mantenerse ultra-rápido y portable.
- **Protección estricta de datos:** El comando `yapu init` jamás debe sobreescribir archivos existentes en el espacio de trabajo del usuario.
- **Calidad garantizada nativamente:** Todo nuevo desarrollo o refactorización del CLI debe contar con cobertura de pruebas de integración usando los módulos nativos de Node.js.
- **Cero referencias obsoletas:** No se deben permitir términos en desuso (referencias a "GSD" o "get-shit-done") en el código activo o la documentación final.
