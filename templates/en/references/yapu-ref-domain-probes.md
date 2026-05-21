# Domain Probing Patterns

Shared reference for project startup, phase discussion, and domain exploration workflows.

When the user mentions a technology area, use these probes to ask insightful follow-up questions. Do not walk through them as a checklist — choose the 2-3 most relevant based on context. The goal is to uncover hidden assumptions and unconsidered trade-offs.

---

## Authentication

| The user mentions | Probe with domain knowledge |
|---|---|
| "login" or "auth" | OAuth (which providers?), JWT, or session-based? Social login or just email/password? |
| "users" or "accounts" | MFA required? Password reset flow? Email verification? |
| "sessions" | Session duration and refresh strategy? Server-side sessions or stateless tokens? |
| "roles" or "permissions" | RBAC, ABAC, or simple role checks? How many distinct roles? |
| "API keys" | Key rotation strategy? Scoped permissions per key? Rate limiting per key? |

---

## Real-Time Updates

| The user mentions | Probe with domain knowledge |
|---|---|
| "real-time" or "live updates" | WebSockets, SSE, or polling? What specifically needs to be real-time vs. eventual? |
| "notifications" | Push notifications (browser/mobile), in-app only, or both? Persistence and read receipts? |
| "collaboration" or "multiplayer" | Conflict resolution strategy? Operational transforms or CRDTs? Expected concurrent users? |
| "chat" or "messaging" | Message history and search? Typing indicators? Read receipts? |
| "streaming" | Reconnection strategy? What happens when the connection drops — queue or discard? |

---

## Dashboard

| The user mentions | Probe with domain knowledge |
|---|---|
| "dashboard" | What data sources feed it? How many distinct views? |
| "charts" or "graphs" | Interactive or static? Drill-down? Export to CSV/PDF? |
| "metrics" or "KPIs" | Refresh strategy — real-time, periodic polling, or on-demand? Is staleness acceptable? |
| "admin panel" | Role-based visibility? What actions besides viewing (edit, delete, approve)? |
| "mobile" or "responsive" | Simplified mobile view or full parity? Touch interactions for charts? |

---

## API Design

| The user mentions | Probe with domain knowledge |
|---|---|
| "API" | REST, GraphQL, or RPC-style? Internal only or public-facing? |
| "endpoints" or "routes" | Versioning strategy (URL path, header, query param)? Breaking changes policy? |
| "pagination" | Cursor-based or offset? Expected result set sizes? Stable ordering guarantee? |
| "rate limiting" | Per-user, per-IP, or per-API-key? Burst allowance? How to communicate limits to clients? |
| "errors" | Structured error format? Codes vs. messages? How much detail in production? |

---

## Database

| The user mentions | Probe with domain knowledge |
|---|---|
| "database" or "storage" | SQL or NoSQL? What drives the choice — relational integrity, flexibility, scale? |
| "ORM" or "queries" | ORM (which one?) or raw queries? Query builder as a middle ground? |
| "migrations" | Migration tool? Rollback strategy? Data migrations vs. schema migrations? |
| "seeding" or "test data" | Seed data for development? Realistic fake data or minimal fixtures? |
| "scale" or "performance" | Read/write ratio? Read replicas? Connection pooling strategy? |

---

## Search

| The user mentions | Probe with domain knowledge |
|---|---|
| "search" | Full-text or exact match? Dedicated search engine (Elasticsearch, Meilisearch) or database-level? |
| "filtering" or "facets" | Faceted filtering? How many filter dimensions? Combined filters (AND/OR)? |
| "autocomplete" or "typeahead" | Debounce strategy? Minimum character threshold? Result ranking? |
| "indexing" | Index size and update frequency? Real-time indexing or batch? Acceptable lag? |
| "fuzzy" or "typo tolerance" | Fuzzy matching? Synonym support? Language-specific stemming? |

---

## File Upload/Storage

| The user mentions | Probe with domain knowledge |
|---|---|
| "upload" or "file upload" | Local filesystem or cloud (S3, GCS, Azure Blob)? Direct upload or through server? |
| "images" or "media" | Processing pipeline — resize, compress, thumbnail generation? Format conversion? |
| "size limits" | Max file size? Max total storage per user? What happens when limits are exceeded? |
| "CDN" | CDN for delivery? Cache invalidation for updated files? Signed URLs for access control? |
| "documents" or "attachments" | Virus scanning? Preview generation? Versioning of uploaded files? |

---

## Testing

| The user mentions | Probe with domain knowledge |
|---|---|
| "testing" or "tests" | Balance of unit, integration, and E2E? Where is the most testing effort invested? |
| "mocking" or "stubs" | Mock external services or test containers? Database mocking strategy? |
| "CI" or "pipeline" | Tests in CI? Parallel test execution? Test-on-PR or test-on-push? |
| "coverage" | Coverage targets? Coverage as a gate or advisory? What metrics (line, branch, function)? |
| "E2E" or "browser testing" | Playwright, Cypress, or another? Headed vs. headless? Visual regression testing? |

---

## Deployment

| The user mentions | Probe with domain knowledge |
|---|---|
| "deploy" or "hosting" | Container, serverless, or traditional VM/VPS? Managed platform (Vercel, Railway) or self-hosted? |
| "CI/CD" or "pipeline" | GitHub Actions, GitLab CI, or another? Deploy on merge to main or manual trigger? |
| "environments" | How many environments (dev, staging, prod)? Environment parity strategy? |
| "rollback" | Rollback strategy? Blue-green, canary, or instant rollback? Database rollback considerations? |
| "secrets" or "config" | Secret management — env vars, vault, or platform-native? Config strategy per-environment? |
