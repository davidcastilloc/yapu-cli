# External Integrations Template

Template for `.planning/codebase/INTEGRATIONS.md` — dependencies on external services.

**Purpose:** Document which external systems this codebase communicates with. Focused on "what lives outside of our code and what we depend on."

---

## Template

```markdown
# External Integrations

**Analysis Date:** [YYYY-MM-DD]

## APIs and External Services

**Payment Processing:**
- [Service] - [What it is used for: e.g., "subscription billing"]
  - SDK/Client: [e.g., "stripe npm package v14.x"]
  - Auth: [e.g., "API key in STRIPE_SECRET_KEY env var"]
  - Used Endpoints: [e.g., "checkout sessions, webhooks"]

**Email/SMS:**
- [Service] - [What it is used for]
  - SDK/Client: [e.g., "@sendgrid/mail v8.x"]
  - Auth: [e.g., "API key in SENDGRID_API_KEY env var"]

**External APIs:**
- [Service] - [What it is used for]
  - Integration Method: [e.g., "REST API via fetch", "GraphQL client"]
  - Auth: [e.g., "OAuth2 token in AUTH_TOKEN env var"]
  - Rate limits: [if applicable]

## Data Storage

**Databases:**
- [Type/Provider] - [e.g., "PostgreSQL on Supabase"]
  - Connection: [e.g., "via DATABASE_URL env var"]
  - Client: [e.g., "Prisma ORM v5.x"]
  - Migrations: [e.g., "prisma migrate in migrations/"]

**File Storage:**
- [Service] - [e.g., "AWS S3 for user uploads"]
  - SDK/Client: [e.g., "@aws-sdk/client-s3"]
  - Auth: [e.g., "IAM credentials in AWS_* env vars"]
  - Buckets: [e.g., "prod-uploads, dev-uploads"]

**Caching:**
- [Service] - [e.g., "Redis for session storage"]
  - Connection: [e.g., "REDIS_URL env var"]

## Authentication and Identity

**Auth Provider:**
- [Service] - [e.g., "Supabase Auth", "Auth0", "custom JWT"]
  - Implementation: [e.g., "Supabase client SDK"]
  - Token storage: [e.g., "httpOnly cookies"]
  - Session management: [e.g., "JWT refresh tokens"]

**OAuth Integrations:**
- [Provider] - [e.g., "Google OAuth for sign-in"]
  - Credentials: [e.g., "GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET"]
  - Scopes: [e.g., "email, profile"]

## Monitoring and Observability

**Error Tracking:** [e.g., "Sentry — DSN in SENTRY_DSN env var"]
**Analytics:** [e.g., "Mixpanel — token in MIXPANEL_TOKEN env var"]
**Logs:** [e.g., "CloudWatch", "stdout only"]

## CI/CD and Deployment

**Hosting:**
- [Platform] - [e.g., "Vercel"]
  - Deployment: [e.g., "automatic on main branch push"]
  - Environment vars: [e.g., "configured in Vercel dashboard"]

**CI Pipeline:**
- [Service] - [e.g., "GitHub Actions"]
  - Workflows: [e.g., "test.yml, deploy.yml"]

## Configuration by Environment

**Development:**
- Required Env Vars: [List critical variables]
- Secrets Location: [e.g., ".env.local (gitignored)"]
- Mock/Stub Services: [e.g., "Stripe test mode"]

**Staging:**
- Specific Differences: [e.g., "uses staging Stripe account"]

**Production:**
- Secrets Management: [e.g., "Vercel environment variables"]

## Webhooks and Callbacks

**Incoming:**
- [Service] - [Endpoint: e.g., "/api/webhooks/stripe"]
  - Verification: [e.g., "signature validation"]
  - Events: [e.g., "payment_intent.succeeded"]

**Outgoing:**
- [Service] - [What triggers it]
  - Retry logic: [if applicable]

---

*Integrations audit: [date]*
*Update when adding/removing external services*
```

## Usage Guide

**What to include:**
- External services the code communicates with
- Authentication patterns (where secrets live, NOT the secrets themselves)
- Used SDKs and client libraries
- Environment variable names (NOT values)
- Webhook endpoints and verification methods
- Database connection patterns
- Monitoring and logging services

**What NOT to include:**
- Real API keys or secrets (NEVER write these)
- Internal architecture → that goes in ARCHITECTURE.md
- Code patterns → that goes in CONVENTIONS.md
- Technology choices → that goes in STACK.md

**How to fill out this template:**
1. Review .env.example or .env.template for required env vars
2. Search for imports of SDKs (stripe, @sendgrid/mail, etc.)
3. Review webhook handlers in routes/endpoints
4. Note where secrets are managed (NOT the secrets)
5. Document differences by environment (dev/staging/prod)

> **Security Note:** Document WHERE secrets live (env vars, dashboard, vault), never WHAT the secrets are.
