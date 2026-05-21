# Modo de Cierre de Gaps

Activado después de una verificación fallida. Crea planes para abordar gaps encontrados en verificación o UAT.

---

## Regla Crítica

**Ignorar ítems diferidos.** Al leer VERIFICATION.md, solo la sección `gaps:` contiene ítems accionables. La sección `deferred:` lista ítems programados para fases futuras — NO son gaps y deben ignorarse.

## Flujo de Cierre

### 1. Encontrar fuentes de gaps

```bash
# Verificar gaps de código (VERIFICATION.md)
ls "$phase_dir"/*-VERIFICATION.md 2>/dev/null

# Verificar gaps de UAT (status: diagnosed)
grep -l "status: diagnosed" "$phase_dir"/*-UAT.md 2>/dev/null
```

### 2. Parsear gaps

Cada gap tiene: truth (comportamiento fallido), reason, artifacts (archivos con issues), missing (cosas por agregar/arreglar).

### 3. Cargar SUMMARYs existentes

Entender qué ya está construido para informar las correcciones.

### 4. Encontrar siguiente número de plan

Si existen planes 01-03, el siguiente es 04.

### 5. Agrupar gaps en planes

Criterios de agrupación:
- Mismo artefacto afectado
- Misma área de concern
- Orden de dependencia (no se puede wiring si el artefacto es stub → fix stub primero)

### 6. Crear tasks de cierre

```xml
<task name="{descripción_fix}" type="auto">
  <files>{artifact.path}</files>
  <action>
    {Para cada ítem en gap.missing:}
    - {missing item}

    Referencia código existente: {de SUMMARYs}
    Razón del gap: {gap.reason}
  </action>
  <verify>{Cómo confirmar que el gap está cerrado}</verify>
  <done>{Observable truth ahora alcanzable}</done>
</task>
```

### 7. Asignar waves

Usar análisis de dependencias estándar:
- Planes sin dependencias → wave 1
- Planes que dependen de otros gap closure plans → max(dependency waves) + 1
- Considerar también dependencias de planes existentes (no-gap) en la fase

### 8. Escribir PLAN.md files

```yaml
---
phase: XX-name
plan: NN              # Secuencial después de existentes
type: execute
wave: N               # Computado de depends_on
depends_on: [...]     # Otros planes de los que depende
files_modified: [...]
autonomous: true
gap_closure: true     # Flag de tracking
---
```
