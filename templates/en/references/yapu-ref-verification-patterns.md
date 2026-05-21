# Verification Patterns

> Reference loaded on demand via `@yapu-ref-verification-patterns.md`.
> How to verify that artifacts are actual implementations, not stubs or placeholders.

---

## Core Principle

**Existence ≠ Implementation**

A file existing does not mean the feature works. Verification must check:

| Level | What it verifies | Method |
|-------|-------------|--------|
| 1. **Exists** | File present at expected path | Programmatic |
| 2. **Substantive** | Content is actual implementation, not placeholder | Programmatic |
| 3. **Wired** | Connected to the rest of the system | Programmatic |
| 4. **Functional** | Works when invoked | Frequently human |

---

## Universal Stub Detection

### Stub comments
```bash
grep -E "(TODO|FIXME|XXX|HACK|PLACEHOLDER)" "$file"
grep -E "implement|add later|coming soon|will be" "$file" -i
grep -E "// \.\.\.|/\* \.\.\. \*/|# \.\.\." "$file"
```

### Placeholder text in output
```bash
grep -E "placeholder|lorem ipsum|coming soon|under construction" "$file" -i
grep -E "sample|example|test data|dummy" "$file" -i
grep -E "\[.*\]|<.*>|\{.*\}" "$file"  # Unreplaced template brackets
```

### Empty or trivial implementations
```bash
grep -E "return null|return undefined|return \{\}|return \[\]" "$file"
grep -E "pass$|\.\.\.|\\bnothing\\b" "$file"
grep -E "console\.(log|warn|error).*only" "$file"  # Functions that only log
```

### Hardcoded values where dynamic are expected
```bash
grep -E "id.*=.*['\"].*['\"]" "$file"        # Hardcoded string IDs
grep -E "count.*=.*\d+|length.*=.*\d+" "$file" # Hardcoded counts
grep -E "\\\$\d+\.\d{2}|\d+ items" "$file"    # Hardcoded display values
```

---

## Verification by Artifact Type

### Components (React/UI)

**Red flags — these are stubs:**
```javascript
return <div>Component</div>
return <div>Placeholder</div>
return <div>{/* TODO */}</div>
return null
return <></>
onClick={() => {}}
onChange={() => console.log('clicked')}
onSubmit={(e) => e.preventDefault()}  // Only preventDefault, does nothing
```

**Component Checklist:**
- [ ] File exists at expected path
- [ ] Exports function/const component
- [ ] Returns JSX (not null/empty)
- [ ] No placeholder text in render
- [ ] Uses props or state (not static)
- [ ] Event handlers with actual implementations
- [ ] Imports resolve correctly
- [ ] Used somewhere in the app

### API Routes

**Red flags — these are stubs:**
```typescript
export async function POST() {
  return Response.json({ message: "Not implemented" })
}
export async function GET() {
  return Response.json([])  // Empty array without database query
}
```

**API Route Checklist:**
- [ ] File exists at expected path
- [ ] Exports HTTP method handlers
- [ ] Handlers with more than 5 lines
- [ ] Queries database or service
- [ ] Returns meaningful response (not empty/placeholder)
- [ ] Has error handling
- [ ] Validates input
- [ ] Called from frontend

### Database Schema

**Red flags — these are stubs:**
```prisma
model User {
  id String @id
  // TODO: add fields
}
model Order {
  id     String @id
  // Without: userId, items, total, status, createdAt
}
```

**Schema Checklist:**
- [ ] Model/table defined
- [ ] Has all expected fields
- [ ] Fields with appropriate types
- [ ] Relations defined if necessary
- [ ] Migrations exist and applied
- [ ] Client generated

### Hooks/Utilities

**Red flags — these are stubs:**
```typescript
export function useAuth() {
  return { user: null, login: () => {}, logout: () => {} }
}
export function useUser() {
  return { name: "Test User", email: "test@example.com" }  // Hardcoded
}
```

**Hook/Utility Checklist:**
- [ ] File exists at expected path
- [ ] Exports function
- [ ] Significant implementation (no empty returns)
- [ ] Used somewhere in the app
- [ ] Return values consumed

---

## Wiring Verification Patterns

Wiring verification checks that components actually communicate. This is where most stubs hide.

### Component → API
```bash
# The fetch/axios call exists and uses the response
grep -E "fetch\(['\"].*\$api_path|axios\.(get|post).*\$api_path" "$component_path"
grep -E "await.*fetch|\.then\(|setData|setState" "$component_path"
```

**Red flags:** Fetch exists but response is ignored. Fetch in comments. Fetch to incorrect endpoint (typo).

### API → Database
```bash
grep -E "prisma\.\$model|db\.query|Model\.find" "$route_path"
grep -E "await.*prisma|await.*db\." "$route_path"
```

**Red flags:** Query exists but result not returned. Query not awaited.

### Form → Handler
```bash
grep -A 10 "onSubmit.*=" "$component_path" | grep -E "fetch|axios|mutate|dispatch"
```

**Red flags:** Handler only prevents default. Handler only logs. Empty handler.

### State → Render
```bash
grep -E "\{.*messages.*\}|\{.*data.*\}|\{.*items.*\}" "$component_path"
grep -E "\.map\(|\.filter\(|\.reduce\(" "$component_path"
```

**Red flags:** Hardcoded content instead of state. State exists but is not rendered. Incorrect state rendered.

### Wiring Checklist
- [ ] Component → API: fetch/axios call exists and uses response
- [ ] API → Database: query exists and result returned
- [ ] Form → Handler: onSubmit calls API/mutation
- [ ] State → Render: state variables appear in JSX

---

## When to Require Human Verification

**Always human:**
- Visual appearance (does it look good?)
- Complete user flow (can you actually do the thing?)
- Real-time behavior (WebSocket, SSE)
- Integration with external services (Stripe, email sending)
- Error message clarity
- Performance feel

**Human if uncertain:**
- Complex wiring that grep cannot trace
- Dynamic behavior dependent on state
- Edge cases and error states
- Mobile responsiveness
- Accessibility

### Format to Request Human Verification:

```markdown
## Human Verification Required

### 1. Send chat message
**Test:** Type a message and click Send
**Expected:** Message appears in list, input is cleared
**Verify:** Does the message persist after refresh?
```

---

## Pre-Checkpoint Automation

Key Principles:
- The agent prepares the verification environment BEFORE presenting checkpoints.
- Users never run CLI commands (they only visit URLs).
- Server lifecycle: start before the checkpoint, handle port conflicts, keep running for the duration.
- Error handling: fix broken environment before the checkpoint, never present checkpoint with failed setup.
