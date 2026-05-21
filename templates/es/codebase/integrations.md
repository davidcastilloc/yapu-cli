# Plantilla de Integraciones Externas

Plantilla para `.planning/codebase/INTEGRATIONS.md` — dependencias de servicios externos.

**Propósito:** Documentar con qué sistemas externos se comunica este codebase. Enfocado en "qué vive fuera de nuestro código y de lo que dependemos."

---

## Plantilla

```markdown
# Integraciones Externas

**Fecha de Análisis:** [YYYY-MM-DD]

## APIs y Servicios Externos

**Procesamiento de Pagos:**
- [Servicio] - [Para qué se usa: e.g., "subscription billing"]
  - SDK/Client: [e.g., "stripe npm package v14.x"]
  - Auth: [e.g., "API key in STRIPE_SECRET_KEY env var"]
  - Endpoints usados: [e.g., "checkout sessions, webhooks"]

**Email/SMS:**
- [Servicio] - [Para qué se usa]
  - SDK/Client: [e.g., "@sendgrid/mail v8.x"]
  - Auth: [e.g., "API key in SENDGRID_API_KEY env var"]

**APIs Externas:**
- [Servicio] - [Para qué se usa]
  - Método de integración: [e.g., "REST API via fetch", "GraphQL client"]
  - Auth: [e.g., "OAuth2 token in AUTH_TOKEN env var"]
  - Rate limits: [si aplica]

## Almacenamiento de Datos

**Bases de Datos:**
- [Tipo/Proveedor] - [e.g., "PostgreSQL on Supabase"]
  - Conexión: [e.g., "via DATABASE_URL env var"]
  - Client: [e.g., "Prisma ORM v5.x"]
  - Migraciones: [e.g., "prisma migrate in migrations/"]

**File Storage:**
- [Servicio] - [e.g., "AWS S3 for user uploads"]
  - SDK/Client: [e.g., "@aws-sdk/client-s3"]
  - Auth: [e.g., "IAM credentials in AWS_* env vars"]
  - Buckets: [e.g., "prod-uploads, dev-uploads"]

**Caching:**
- [Servicio] - [e.g., "Redis for session storage"]
  - Conexión: [e.g., "REDIS_URL env var"]

## Autenticación e Identidad

**Auth Provider:**
- [Servicio] - [e.g., "Supabase Auth", "Auth0", "custom JWT"]
  - Implementación: [e.g., "Supabase client SDK"]
  - Token storage: [e.g., "httpOnly cookies"]
  - Session management: [e.g., "JWT refresh tokens"]

**OAuth Integrations:**
- [Provider] - [e.g., "Google OAuth for sign-in"]
  - Credentials: [e.g., "GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET"]
  - Scopes: [e.g., "email, profile"]

## Monitoreo y Observabilidad

**Error Tracking:** [e.g., "Sentry — DSN in SENTRY_DSN env var"]
**Analytics:** [e.g., "Mixpanel — token in MIXPANEL_TOKEN env var"]
**Logs:** [e.g., "CloudWatch", "stdout only"]

## CI/CD y Deployment

**Hosting:**
- [Plataforma] - [e.g., "Vercel"]
  - Deployment: [e.g., "automatic on main branch push"]
  - Environment vars: [e.g., "configured in Vercel dashboard"]

**CI Pipeline:**
- [Servicio] - [e.g., "GitHub Actions"]
  - Workflows: [e.g., "test.yml, deploy.yml"]

## Configuración por Entorno

**Desarrollo:**
- Env vars requeridas: [Listar vars críticas]
- Ubicación de secrets: [e.g., ".env.local (gitignored)"]
- Mock/stub services: [e.g., "Stripe test mode"]

**Staging:**
- Diferencias específicas: [e.g., "uses staging Stripe account"]

**Producción:**
- Gestión de secrets: [e.g., "Vercel environment variables"]

## Webhooks y Callbacks

**Entrantes:**
- [Servicio] - [Endpoint: e.g., "/api/webhooks/stripe"]
  - Verificación: [e.g., "signature validation"]
  - Eventos: [e.g., "payment_intent.succeeded"]

**Salientes:**
- [Servicio] - [Qué lo dispara]
  - Retry logic: [si aplica]

---

*Auditoría de integraciones: [fecha]*
*Actualizar al agregar/remover servicios externos*
```

## Guía de Uso

**Qué incluir:**
- Servicios externos con los que el código se comunica
- Patrones de autenticación (dónde viven los secrets, NO los secrets mismos)
- SDKs y client libraries usadas
- Nombres de environment variables (NO valores)
- Endpoints de webhooks y métodos de verificación
- Patrones de conexión a base de datos
- Servicios de monitoreo y logging

**Qué NO incluir:**
- API keys o secrets reales (NUNCA escribir estos)
- Arquitectura interna → eso va en ARCHITECTURE.md
- Patrones de código → eso va en CONVENTIONS.md
- Elecciones de tecnología → eso va en STACK.md

**Cómo llenar esta plantilla:**
1. Revisar .env.example o .env.template para env vars requeridas
2. Buscar imports de SDKs (stripe, @sendgrid/mail, etc.)
3. Revisar webhook handlers en routes/endpoints
4. Notar dónde se manejan los secrets (NO los secrets)
5. Documentar diferencias por entorno (dev/staging/prod)

> **Nota de seguridad:** Documentar DÓNDE viven los secrets (env vars, dashboard, vault), nunca CUÁLES son los secrets.
