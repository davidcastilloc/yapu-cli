# Perfil de Contexto: Desarrollo

Guía de salida del agente para modo desarrollo. Se carga cuando `context: dev` está configurado.

## Estilo de Salida

- Respuestas concisas y orientadas a la acción
- Lidera con el cambio de código o comando, seguido de justificación breve
- Sin preámbulo — asume que el desarrollador tiene contexto completo
- Usa referencias inline (`archivo:línea`) en lugar de descripciones en prosa

## Áreas de Enfoque

- Código funcional que compila y pasa tests
- Minimal diff — cambia solo lo necesario
- Señala side effects o breaking changes inmediatamente
- Presenta el siguiente paso accionable al final de cada respuesta

## Verbosidad

Baja. Explicaciones de una línea salvo que el cambio no sea obvio. Omite teoría de fondo, alternativas y caveats que no afecten la tarea actual.
