# XTATE

XTATE is a whitelabel estate management platform for residential communities. The current codebase is a React, TypeScript, Vite, Tailwind, shadcn-ui, and Supabase application with resident, estate admin, security, and super admin surfaces.

## Current Focus

Phase 1 is focused on the XTATE foundation:

- Rebrand the inherited EstateConnect application to XTATE.
- Introduce a tenant architecture while preserving the existing `estate_id` flows.
- Add tenant resolution for subdomain and local development use.
- Move feature access toward database-backed tenant feature flags.
- Prepare dynamic tenant branding.
- Prepare the platform-level super admin area.
- Tighten RLS around new tenant-scoped data.

The working implementation plan lives in:

```txt
docs/XTATE_PHASE_1_PLAN.md
```

## Tech Stack

- Vite
- React
- TypeScript
- Tailwind CSS
- shadcn-ui
- Supabase
- React Router
- TanStack Query

## Local Development

Install dependencies:

```sh
npm install
```

Start the development server:

```sh
npm run dev
```

Build for production:

```sh
npm run build
```

Run linting:

```sh
npm run lint
```

## Supabase

The app currently uses Supabase for authentication, database access, storage policies, and Edge Functions. Existing multi-estate behavior is based on `estate_id`; Phase 1 introduces platform tenant tables and a gradual migration path toward `tenant_id`.

Important areas:

```txt
supabase/migrations
supabase/functions
src/integrations/supabase
src/contexts/SecureAuthContext.tsx
src/contexts/EstateContext.tsx
src/hooks/useEstateId.tsx
```

## Architecture Notes

XTATE should run as a shared multi-tenant SaaS:

```txt
xtate.app                -> public marketing site
app.xtate.app            -> general application entry
lekki.xtate.app          -> tenant portal for Lekki
paradise.xtate.app       -> tenant portal for Paradise
```

All tenants can share the same frontend and backend infrastructure, with tenant isolation enforced by tenant-aware queries and Supabase Row Level Security.

## Documentation

- Phase 1 plan: `docs/XTATE_PHASE_1_PLAN.md`

Update the plan checklist as implementation progresses.
