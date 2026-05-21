# Patrones de Sondeo por Dominio

Referencia compartida para workflows de inicio de proyecto, discusión de fase y exploración de dominio.

Cuando el usuario menciona un área tecnológica, usar estos sondeos para hacer preguntas de follow-up perspicaces. No recorrerlos como checklist — elegir los 2-3 más relevantes según contexto. El objetivo es descubrir suposiciones ocultas y trade-offs no considerados.

---

## Authentication

| El usuario menciona | Sondear con conocimiento de dominio |
|---|---|
| "login" o "auth" | ¿OAuth (qué providers?), JWT, o session-based? ¿Social login o solo email/password? |
| "users" o "accounts" | ¿MFA requerido? ¿Flujo de password reset? ¿Email verification? |
| "sessions" | ¿Duración de sesión y estrategia de refresh? ¿Server-side sessions o stateless tokens? |
| "roles" o "permissions" | ¿RBAC, ABAC, o simple role checks? ¿Cuántos roles distintos? |
| "API keys" | ¿Estrategia de key rotation? ¿Scoped permissions por key? ¿Rate limiting por key? |

---

## Real-Time Updates

| El usuario menciona | Sondear con conocimiento de dominio |
|---|---|
| "real-time" o "live updates" | ¿WebSockets, SSE, o polling? ¿Qué específicamente necesita ser real-time vs. eventual? |
| "notifications" | ¿Push notifications (browser/mobile), in-app only, o ambos? ¿Persistencia y read receipts? |
| "collaboration" o "multiplayer" | ¿Estrategia de conflict resolution? ¿Operational transforms o CRDTs? ¿Concurrent users esperados? |
| "chat" o "messaging" | ¿Message history y search? ¿Typing indicators? ¿Read receipts? |
| "streaming" | ¿Estrategia de reconnection? ¿Qué pasa cuando la conexión cae — queue o discard? |

---

## Dashboard

| El usuario menciona | Sondear con conocimiento de dominio |
|---|---|
| "dashboard" | ¿Qué data sources lo alimentan? ¿Cuántas vistas distintas? |
| "charts" o "graphs" | ¿Interactivo o estático? ¿Drill-down? ¿Export a CSV/PDF? |
| "metrics" o "KPIs" | ¿Estrategia de refresh — real-time, periodic polling, o on-demand? ¿Staleness aceptable? |
| "admin panel" | ¿Visibilidad role-based? ¿Qué acciones además de ver (edit, delete, approve)? |
| "mobile" o "responsive" | ¿Vista mobile simplificada o paridad completa? ¿Touch interactions para charts? |

---

## API Design

| El usuario menciona | Sondear con conocimiento de dominio |
|---|---|
| "API" | ¿REST, GraphQL, o RPC-style? ¿Solo interno o public-facing? |
| "endpoints" o "routes" | ¿Estrategia de versioning (URL path, header, query param)? ¿Política de breaking changes? |
| "pagination" | ¿Cursor-based o offset? ¿Tamaños esperados de result set? ¿Garantía de stable ordering? |
| "rate limiting" | ¿Per-user, per-IP, o per-API-key? ¿Burst allowance? ¿Cómo comunicar limits a clients? |
| "errors" | ¿Formato de error estructurado? ¿Codes vs. messages? ¿Cuánto detalle en producción? |

---

## Database

| El usuario menciona | Sondear con conocimiento de dominio |
|---|---|
| "database" o "storage" | ¿SQL o NoSQL? ¿Qué impulsa la elección — integridad relacional, flexibilidad, escala? |
| "ORM" o "queries" | ¿ORM (cuál?) o raw queries? ¿Query builder como punto medio? |
| "migrations" | ¿Migration tool? ¿Estrategia de rollback? ¿Data migrations vs. schema migrations? |
| "seeding" o "test data" | ¿Seed data para desarrollo? ¿Fake data realista o minimal fixtures? |
| "scale" o "performance" | ¿Read/write ratio? ¿Read replicas? ¿Estrategia de connection pooling? |

---

## Search

| El usuario menciona | Sondear con conocimiento de dominio |
|---|---|
| "search" | ¿Full-text o exact match? ¿Search engine dedicado (Elasticsearch, Meilisearch) o database-level? |
| "filtering" o "facets" | ¿Faceted filtering? ¿Cuántas dimensiones de filtro? ¿Combined filters (AND/OR)? |
| "autocomplete" o "typeahead" | ¿Estrategia de debounce? ¿Minimum character threshold? ¿Result ranking? |
| "indexing" | ¿Tamaño de índice y frecuencia de update? ¿Real-time indexing o batch? ¿Lag aceptable? |
| "fuzzy" o "typo tolerance" | ¿Fuzzy matching? ¿Synonym support? ¿Language-specific stemming? |

---

## File Upload/Storage

| El usuario menciona | Sondear con conocimiento de dominio |
|---|---|
| "upload" o "file upload" | ¿Local filesystem o cloud (S3, GCS, Azure Blob)? ¿Direct upload o through server? |
| "images" o "media" | ¿Pipeline de processing — resize, compress, thumbnail generation? ¿Format conversion? |
| "size limits" | ¿Max file size? ¿Max total storage por usuario? ¿Qué pasa cuando se exceden los limits? |
| "CDN" | ¿CDN para delivery? ¿Cache invalidation para updated files? ¿Signed URLs para access control? |
| "documents" o "attachments" | ¿Virus scanning? ¿Preview generation? ¿Versioning de archivos subidos? |

---

## Testing

| El usuario menciona | Sondear con conocimiento de dominio |
|---|---|
| "testing" o "tests" | ¿Balance de unit, integration, y E2E? ¿Dónde se invierte más esfuerzo de testing? |
| "mocking" o "stubs" | ¿Mock external services o test containers? ¿Estrategia de database mocking? |
| "CI" o "pipeline" | ¿Tests en CI? ¿Parallel test execution? ¿Test-on-PR o test-on-push? |
| "coverage" | ¿Coverage targets? ¿Coverage como gate o advisory? ¿Qué métricas (line, branch, function)? |
| "E2E" o "browser testing" | ¿Playwright, Cypress, u otro? ¿Headed vs. headless? ¿Visual regression testing? |

---

## Deployment

| El usuario menciona | Sondear con conocimiento de dominio |
|---|---|
| "deploy" o "hosting" | ¿Container, serverless, o traditional VM/VPS? ¿Managed platform (Vercel, Railway) o self-hosted? |
| "CI/CD" o "pipeline" | ¿GitHub Actions, GitLab CI, u otro? ¿Deploy on merge to main o manual trigger? |
| "environments" | ¿Cuántos ambientes (dev, staging, prod)? ¿Estrategia de environment parity? |
| "rollback" | ¿Estrategia de rollback? ¿Blue-green, canary, o instant rollback? ¿Database rollback considerations? |
| "secrets" o "config" | ¿Secret management — env vars, vault, o platform-native? ¿Estrategia de config per-environment? |
