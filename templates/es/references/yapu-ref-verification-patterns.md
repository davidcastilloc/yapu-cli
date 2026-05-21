# Patrones de Verificación

> Referencia cargada bajo demanda vía `@yapu-ref-verification-patterns.md`.
> Cómo verificar que los artefactos son implementaciones reales, no stubs o placeholders.

---

## Principio Central

**Existencia ≠ Implementación**

Un archivo existiendo no significa que la feature funciona. La verificación debe comprobar:

| Nivel | Qué verifica | Método |
|-------|-------------|--------|
| 1. **Exists** | Archivo presente en ruta esperada | Programático |
| 2. **Substantive** | Contenido es implementación real, no placeholder | Programático |
| 3. **Wired** | Conectado al resto del sistema | Programático |
| 4. **Functional** | Funciona cuando se invoca | Frecuentemente humano |

---

## Detección Universal de Stubs

### Comentarios stub
```bash
grep -E "(TODO|FIXME|XXX|HACK|PLACEHOLDER)" "$file"
grep -E "implement|add later|coming soon|will be" "$file" -i
grep -E "// \.\.\.|/\* \.\.\. \*/|# \.\.\." "$file"
```

### Texto placeholder en output
```bash
grep -E "placeholder|lorem ipsum|coming soon|under construction" "$file" -i
grep -E "sample|example|test data|dummy" "$file" -i
grep -E "\[.*\]|<.*>|\{.*\}" "$file"  # Template brackets sin reemplazar
```

### Implementaciones vacías o triviales
```bash
grep -E "return null|return undefined|return \{\}|return \[\]" "$file"
grep -E "pass$|\.\.\.|\\bnothing\\b" "$file"
grep -E "console\.(log|warn|error).*only" "$file"  # Funciones que solo loguean
```

### Valores hardcodeados donde se esperan dinámicos
```bash
grep -E "id.*=.*['\"].*['\"]" "$file"        # IDs string hardcodeados
grep -E "count.*=.*\d+|length.*=.*\d+" "$file" # Conteos hardcodeados
grep -E "\\\$\d+\.\d{2}|\d+ items" "$file"    # Valores de display hardcodeados
```

---

## Verificación por Tipo de Artefacto

### Componentes (React/UI)

**Red flags — estos son stubs:**
```javascript
return <div>Component</div>
return <div>Placeholder</div>
return <div>{/* TODO */}</div>
return null
return <></>
onClick={() => {}}
onChange={() => console.log('clicked')}
onSubmit={(e) => e.preventDefault()}  // Solo preventDefault, no hace nada
```

**Checklist de componente:**
- [ ] Archivo existe en ruta esperada
- [ ] Exporta function/const component
- [ ] Retorna JSX (no null/vacío)
- [ ] Sin texto placeholder en render
- [ ] Usa props o state (no estático)
- [ ] Event handlers con implementaciones reales
- [ ] Imports resuelven correctamente
- [ ] Usado en algún lugar de la app

### API Routes

**Red flags — estos son stubs:**
```typescript
export async function POST() {
  return Response.json({ message: "Not implemented" })
}
export async function GET() {
  return Response.json([])  // Array vacío sin query a DB
}
```

**Checklist de API route:**
- [ ] Archivo existe en ruta esperada
- [ ] Exporta HTTP method handlers
- [ ] Handlers con más de 5 líneas
- [ ] Consulta database o servicio
- [ ] Retorna respuesta significativa (no vacía/placeholder)
- [ ] Tiene manejo de errores
- [ ] Valida input
- [ ] Llamado desde frontend

### Database Schema

**Red flags — estos son stubs:**
```prisma
model User {
  id String @id
  // TODO: add fields
}
model Order {
  id     String @id
  // Sin: userId, items, total, status, createdAt
}
```

**Checklist de schema:**
- [ ] Modelo/tabla definida
- [ ] Tiene todos los campos esperados
- [ ] Campos con tipos apropiados
- [ ] Relaciones definidas si necesario
- [ ] Migraciones existen y aplicadas
- [ ] Client generado

### Hooks/Utilidades

**Red flags — estos son stubs:**
```typescript
export function useAuth() {
  return { user: null, login: () => {}, logout: () => {} }
}
export function useUser() {
  return { name: "Test User", email: "test@example.com" }  // Hardcodeado
}
```

**Checklist de hook/utilidad:**
- [ ] Archivo existe en ruta esperada
- [ ] Exporta función
- [ ] Implementación significativa (no returns vacíos)
- [ ] Usado en algún lugar de la app
- [ ] Valores de retorno consumidos

---

## Patrones de Verificación de Wiring

El wiring verification comprueba que los componentes realmente se comunican. Aquí es donde la mayoría de stubs se esconden.

### Component → API
```bash
# El fetch/axios call existe y usa la respuesta
grep -E "fetch\(['\"].*\$api_path|axios\.(get|post).*\$api_path" "$component_path"
grep -E "await.*fetch|\.then\(|setData|setState" "$component_path"
```

**Red flags:** Fetch existe pero respuesta ignorada. Fetch en comentario. Fetch a endpoint incorrecto (typo).

### API → Database
```bash
grep -E "prisma\.\$model|db\.query|Model\.find" "$route_path"
grep -E "await.*prisma|await.*db\." "$route_path"
```

**Red flags:** Query existe pero resultado no retornado. Query no await-eado.

### Form → Handler
```bash
grep -A 10 "onSubmit.*=" "$component_path" | grep -E "fetch|axios|mutate|dispatch"
```

**Red flags:** Handler solo previene default. Handler solo loguea. Handler vacío.

### State → Render
```bash
grep -E "\{.*messages.*\}|\{.*data.*\}|\{.*items.*\}" "$component_path"
grep -E "\.map\(|\.filter\(|\.reduce\(" "$component_path"
```

**Red flags:** Contenido hardcodeado en vez de state. State existe pero no se renderiza. State incorrecto renderizado.

### Wiring Checklist
- [ ] Component → API: fetch/axios call existe y usa respuesta
- [ ] API → Database: query existe y resultado retornado
- [ ] Form → Handler: onSubmit llama API/mutation
- [ ] State → Render: variables de estado aparecen en JSX

---

## Cuándo Requerir Verificación Humana

**Siempre humano:**
- Apariencia visual (¿se ve bien?)
- Completar flujo de usuario (¿puedes realmente hacer la cosa?)
- Comportamiento real-time (WebSocket, SSE)
- Integración con servicios externos (Stripe, envío de email)
- Claridad de mensajes de error
- Sensación de rendimiento

**Humano si incierto:**
- Wiring complejo que grep no puede trazar
- Comportamiento dinámico dependiente de estado
- Edge cases y estados de error
- Responsividad móvil
- Accesibilidad

**Formato para solicitar verificación humana:**
```markdown
## Verificación Humana Requerida

### 1. Envío de mensaje de chat
**Test:** Escribe un mensaje y click Send
**Esperado:** Mensaje aparece en lista, input se limpia
**Verificar:** ¿Mensaje persiste después de refresh?
```

---

## Pre-Checkpoint Automation

Principios clave:
- El agente prepara el entorno de verificación ANTES de presentar checkpoints
- Los usuarios nunca ejecutan comandos CLI (solo visitan URLs)
- Lifecycle del server: iniciar antes del checkpoint, manejar conflictos de puerto, mantener corriendo durante la duración
- Manejo de errores: arreglar entorno roto antes del checkpoint, nunca presentar checkpoint con setup fallido
