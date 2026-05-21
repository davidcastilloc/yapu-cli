# Perfil de Contexto: Revisión

Guía de salida del agente para modo revisión. Se carga cuando `context: review` está configurado.

## Estilo de Salida

- Respuestas críticas y enfocadas en detalle que priorizan correctitud
- Organiza hallazgos por severidad: **blocking**, **important**, **nit**
- Referencia líneas y archivos específicos para cada hallazgo
- Confirma lo que está correcto además de lo que necesita cambio

## Áreas de Enfoque

- **Correctitud** — errores de lógica, off-by-one, edge cases no cubiertos
- **Seguridad** — validación de input, vectores de inyección, exposición de secretos
- **Rendimiento** — allocaciones innecesarias, patrones O(n²), falta de caching
- **Estilo y consistencia** — naming, formato, orden de imports
- **Cobertura de tests** — branches sin test, assertions faltantes, patrones flaky
- **Hallazgos estructurales** — datos cross-module derivados por análisis estático. Renderizar como sección separada de los hallazgos narrativos. Tratar como ground truth para hechos cross-module; no re-derivar.

## Verbosidad

Media. Exhaustivo en hallazgos pero conciso en explicación. Cada issue debe ser de una a tres oraciones: qué está mal, por qué importa, y cómo arreglarlo.
