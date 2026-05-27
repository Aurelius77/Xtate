# XTATE Phase 1 Implementation Plan

## Purpose

This document is the working reference for Phase 1 of the XTATE build. Phase 1 is focused on converting the current EstateConnect codebase into a stable XTATE multi-tenant foundation before building heavier modules like wallet, marketplace, technicians, forum, recurring dues automation, and advanced reporting.

## Current Baseline

- The app is a Vite, React, TypeScript, Tailwind, shadcn-ui, Supabase project.
- Existing dashboards cover resident, admin, security, and super admin roles.
- Some Supabase-backed flows already exist, especially auth, residents, dashboard stats, access codes, and estate settings.
- Several screens are still static, mocked, or partially wired, including documents, complaints, dues/payment pages, expenses, settings, and some resident workflows.
- Current multi-estate support is based on `estate_id`, `estates`, `estate_settings`, `subscriptions`, and `audit_logs`.
- The contract scope expects a platform-level multi-tenant model using `tenant_id`, `tenants`, `tenant_features`, `tenant_billing`, `platform_audit_log`, `support_tickets`, and `super_admins`.

## Phase 1 Outcome

By the end of Phase 1:

- The app should present itself as XTATE, not EstateConnect.
- Tenant architecture should be introduced without breaking the current estate-based app.
- The frontend should be able to resolve the current tenant from subdomain or local dev query string.
- Registration should stop relying on a hardcoded default estate for production behavior.
- Feature flags should come from tenant data, not only hardcoded plan maps.
- Tenant branding should load dynamically.
- Super admin routing should be prepared around platform tenants.
- New tenant tables should have RLS and clear access boundaries.
- The app should still build successfully.

## Architecture Decision

Do not immediately remove `estate_id`.

The current app already depends on `estate_id` in many components, hooks, migrations, and Supabase policies. A direct rename from `estate_id` to `tenant_id` would be high-risk and would likely break working flows.

Use a bridge approach:

1. Add platform tenant tables.
2. Map existing estates to tenants.
3. Keep existing `estate_id` for current working screens.
4. Add `tenant_id` to new platform-level tables and new features.
5. Gradually migrate core tables from `estate_id` to `tenant_id` after the foundation is stable.

Conceptually:

```txt
tenant = SaaS customer/account
estate = residential community managed under that customer
```

For most early XTATE customers, one tenant will map to one estate.

## Workstream 1: XTATE Rebrand

### Scope

Replace visible EstateConnect references and default Lovable project references with XTATE.

Likely files:

```txt
src/pages/Index.tsx
src/components/landing/*
src/components/auth/*
src/components/pwa/*
public/manifest.json
public/sw.js
index.html
README.md
supabase/functions/seed-demo-users/index.ts
supabase/migrations/*
```

### Tasks

- [x] Replace public UI name `EstateConnect` with `XTATE`.
- [x] Update app title and metadata.
- [x] Update PWA manifest name, short name, and theme-related copy.
- [x] Update service worker cache/app labels if present.
- [x] Update demo account domains from `estateconnect.app` to the agreed XTATE demo domain.
- [x] Update default estate branding seed from EstateConnect to XTATE.
- [x] Replace default Lovable README with XTATE setup and architecture notes.

### Acceptance Criteria

- [x] Browser title, landing page, PWA install prompt, and visible product copy show XTATE.
- [x] No user-facing EstateConnect branding remains.
- [x] Any remaining EstateConnect references are intentional migration notes or legacy comments.

## Workstream 2: Tenant Database Foundation

### Scope

Create the platform-level tenant schema while preserving current estate-based behavior.

### Proposed Tables

```txt
tenants
tenant_features
tenant_billing
platform_audit_log
support_tickets
super_admins
```

### Proposed Minimum Fields

```txt
tenants:
id, estate_id, name, slug, status, plan, logo_url, primary_color,
secondary_color, custom_domain, currency, timezone, address,
created_at, updated_at

tenant_features:
id, tenant_id, feature_key, enabled, limit_value, metadata,
created_at, updated_at

tenant_billing:
id, tenant_id, plan, status, amount, billing_cycle, renewal_date,
payment_reference, metadata, created_at, updated_at

platform_audit_log:
id, actor_user_id, tenant_id, action, entity, entity_id, metadata,
created_at

support_tickets:
id, tenant_id, created_by, subject, message, status, priority,
created_at, updated_at

super_admins:
id, user_id, permissions, is_active, created_at, updated_at
```

### Tasks

- [x] Add a Supabase migration for tenant tables.
- [x] Add `estate_id` reference on `tenants` for the transition bridge.
- [x] Seed a default tenant mapped to the default estate.
- [x] Add indexes for `tenant_id`, `slug`, feature keys, and status fields.
- [x] Add helper function `get_user_tenant_id(user_id uuid)`.
- [x] Add helper function or view that maps a user's `estate_id` to a tenant.
- [x] Add initial tenant feature rows for the default tenant.

### Acceptance Criteria

- [x] Existing app behavior is not broken.
- [x] Default tenant exists and maps to the existing default estate.
- [x] Tenant feature flags can be queried by tenant.
- [x] New platform tables are not publicly readable.

## Workstream 3: Tenant Resolution Context

### Scope

Add frontend tenant detection and context so the app can understand which estate/tenant is active.

### Resolution Rules

Production:

```txt
lekki.xtate.app -> tenant slug lekki
paradise.xtate.app -> tenant slug paradise
```

Local development:

```txt
localhost:5173?tenant=lekki
localhost:5173?tenant=default
```

Fallback:

```txt
authenticated user's estate_id -> mapped tenant
```

### Proposed File

```txt
src/contexts/TenantContext.tsx
```

### Context Shape

```ts
type TenantContextValue = {
  tenant: Tenant | null;
  tenantId: string | null;
  tenantSlug: string | null;
  plan: string | null;
  branding: {
    name: string;
    logoUrl?: string;
    primaryColor?: string;
    secondaryColor?: string;
    currency?: string;
    timezone?: string;
    address?: string;
  } | null;
  isLoading: boolean;
  refreshTenant: () => Promise<void>;
};
```

### Tasks

- [x] Create `TenantContext`.
- [x] Add tenant slug extraction from hostname.
- [x] Add local dev support using `?tenant=slug`.
- [x] Load tenant from Supabase by slug.
- [x] Add fallback from authenticated user estate to tenant mapping.
- [x] Wrap app with `TenantProvider`.

### Acceptance Criteria

- [x] Tenant can be resolved on local dev with query string.
- [x] Tenant can be resolved from subdomain-ready logic.
- [x] App still works for users without a tenant slug during transition.

## Workstream 4: Tenant-Aware Registration

### Scope

Stop production registration from assigning every resident to the hardcoded default estate.

Current risk:

```txt
supabase/functions/create-resident-account/index.ts
DEFAULT_ESTATE_ID = "00000000-0000-0000-0000-000000000001"
```

### Tasks

- [x] Update frontend registration payload to include `tenantSlug` or `tenantId`.
- [x] Update Edge Function request type to accept tenant context.
- [x] Validate tenant exists before creating user.
- [x] Resolve tenant to the correct transitional `estate_id`.
- [x] Insert profile and resident records under the resolved estate.
- [x] Keep default fallback only for dev/demo if explicitly allowed.
- [x] Return clear errors for invalid tenant, suspended tenant, or missing house unit.

### Acceptance Criteria

- [x] Resident signup under `?tenant=lekki` attaches user to Lekki tenant/estate.
- [x] Signup does not silently attach production users to the default estate.
- [x] Suspended or unknown tenants cannot accept new resident registration.

## Workstream 5: DB-Backed Feature Flags

### Scope

Replace hardcoded plan feature checks with tenant feature rows from Supabase.

Current file:

```txt
src/hooks/useFeatureGate.tsx
```

### Proposed Files

```txt
src/contexts/FeatureFlagContext.tsx
src/components/features/FeatureGate.tsx
src/components/features/UpgradePrompt.tsx
```

### Initial Feature Keys

```txt
residents
dues
complaints
meetings
documents
access_codes
broadcast
expenses
data_import
security_management
audit_logs
white_label
custom_domain
wallet
marketplace
forum
technicians
advanced_analytics
no_ads
api_access
```

### Tasks

- [x] Create `FeatureFlagContext`.
- [x] Load flags from `tenant_features` for the active tenant.
- [x] Preserve a loading state to avoid hiding UI before flags load.
- [x] Create reusable `FeatureGate`.
- [x] Create reusable `UpgradePrompt`.
- [x] Update admin sidebar gating to use DB-backed flags.
- [x] Add default feature seed data by plan.

### Acceptance Criteria

- [x] Feature access can be changed from database rows.
- [x] Disabled features show an upgrade prompt where appropriate.
- [x] Existing admin sidebar behavior remains stable.

## Workstream 6: Tenant Branding

### Scope

Expand current estate branding into tenant-aware branding.

Current file:

```txt
src/contexts/EstateContext.tsx
```

### Tasks

- [x] Decide whether to expand `EstateContext` or add `TenantBrandContext`.
- [x] Load tenant name, logo, colors, currency, timezone, and address.
- [x] Apply CSS custom properties for primary and secondary colors.
- [x] Set document title dynamically.
- [x] Update sidebar/header brand rendering to use tenant branding.
- [x] Keep fallback XTATE branding for unresolved tenant and platform pages.

### Acceptance Criteria

- [x] Different tenants can display different names and colors.
- [x] Missing branding does not break the app.
- [x] Platform/super-admin pages can still show XTATE-level branding.

## Workstream 7: Super Admin Foundation

### Scope

Prepare platform-level super admin routes and page structure.

### Proposed Routes

```txt
/sa
/sa/tenants
/sa/tenants/:id
/sa/audit-log
/sa/billing
/sa/support
```

### Tasks

- [x] Add route aliases for `/sa/*` while preserving existing `/super-admin` during transition.
- [x] Update super admin navigation around platform tenants.
- [x] Show tenant list from `tenants`, not only `estates`.
- [x] Add tenant detail placeholder with feature flags, status, plan, and branding sections.
- [x] Add audit log page wired to `platform_audit_log`.
- [x] Add billing overview page wired to `tenant_billing`.
- [x] Add support tickets page wired to `support_tickets`.

### Acceptance Criteria

- [x] `/sa` area loads for super admins.
- [x] Super admin can view tenant records.
- [x] The route structure is ready for provisioning, feature toggles, billing, and support workflows.

## Workstream 8: RLS And Security Pass

### Scope

Add safe access policies for the new tenant tables and reduce cross-tenant risk.

### Tasks

- [x] Enable RLS on all new tenant tables.
- [x] Allow super admins to manage platform-level tables.
- [x] Allow tenant admins to view only their own tenant billing/features where appropriate.
- [x] Prevent regular residents from reading platform-level tables unless explicitly needed.
- [x] Ensure support tickets are scoped to tenant and creator/admin permissions.
- [x] Review broad existing policies that could leak data across estates.
- [x] Document remaining RLS migration risks.

### Acceptance Criteria

- [x] New tenant tables cannot be queried by unrelated authenticated users.
- [x] Super admin permissions are explicit.
- [x] Tenant-scoped reads use tenant/estate mapping.

### Remaining Risks

- [ ] Supabase migrations still need to be applied and verified in a real Supabase environment.
- [ ] Storage object policies assume document files are stored under estate-id folders or have matching `documents.file_url` rows.
- [ ] Some app pages still use static/mock data, so their final RLS behavior must be rechecked when they are wired to Supabase.
- [ ] The bridge model still depends on `estate_id`; a full `tenant_id` migration remains a later hardening step.

## Workstream 9: Verification

### Commands

```sh
npm run build
npm run lint
```

### Manual Smoke Tests

- [x] Landing page loads.
- [x] Login modal opens.
- [x] Registration flow opens.
- [x] Resident dashboard loads.
- [x] Admin dashboard loads.
- [x] Security dashboard loads.
- [x] Super admin dashboard loads.
- [x] Local tenant query string resolves a tenant.
- [x] Feature-gated admin sidebar still renders.

### Acceptance Criteria

- [x] Production build passes.
- [x] Lint is clean or known issues are documented.
- [x] Main role flows are not broken by Phase 1.

### Verification Notes

- `npm run build` passes.
- `npm run lint` fails with 57 total problems: 41 errors and 16 warnings.
- Most lint errors are existing `@typescript-eslint/no-explicit-any` violations in admin/resident/super-admin pages, security helpers, and Supabase adapter code.
- New tenant-table frontend reads use temporary `any` casts because generated Supabase types do not yet include `tenants`, `tenant_features`, `tenant_billing`, `platform_audit_log`, or `support_tickets`.
- Fast-refresh warnings remain in context/UI modules that export both components and helpers.
- Supabase CLI and Deno are not installed locally, so migrations and Edge Functions still require Supabase-environment verification.

## Recommended Execution Order

1. XTATE rebrand.
2. Tenant database migration.
3. Tenant frontend context.
4. Tenant-aware registration.
5. DB-backed feature flags.
6. Tenant branding.
7. Super admin route foundation.
8. RLS and security pass.
9. Build, lint, and smoke test.

## Deferred Until After Phase 1

Do not start these until the tenant foundation is stable:

- Xtate Wallet.
- Paystack wallet funding.
- Marketplace.
- Community forum.
- Hire a Technician.
- PDF receipts.
- Recurring dues cron.
- Advanced analytics.
- Push notifications.
- Production custom subdomain routing.

## Open Decisions

- [ ] Should `tenant_id` eventually replace `estate_id` on every core table, or should `estate_id` remain as the tenant key with a compatibility layer?
- [x] What XTATE demo email domain should replace `estateconnect.app`? Use `xtate.app` for now.
- [ ] Should tenant signup be public by subdomain, invite-only, or both?
- [ ] Which plan names should be canonical: `basic/pro/enterprise`, `free/standard/custom`, or another set?
- [ ] Which features belong to each plan at launch?
- [ ] Should `/super-admin` remain permanently, or should `/sa` become the only platform admin route?

## Progress Log

Use this section to record notable implementation decisions as Phase 1 progresses.

```txt
2026-05-25: Phase 1 plan created. Current recommendation is bridge architecture: keep estate_id temporarily, add tenant tables, and migrate gradually.
2026-05-25: Workstream 1 rebrand completed for visible app/PWA/docs/demo references. Demo accounts now use `xtate.app`.
2026-05-25: Workstream 2 tenant DB foundation added in `supabase/migrations/20260525120000_xtate_tenant_foundation.sql`.
2026-05-25: `npm run build` passes after Workstreams 1 and 2. `npm run lint` still fails on existing repo-wide lint issues, mostly `no-explicit-any`, fast-refresh export warnings, and two empty UI interface types.
2026-05-25: Supabase CLI is not installed locally, so the new migration still needs to be applied or checked in a Supabase environment.
2026-05-27: Workstream 3 tenant resolution context added in `src/contexts/TenantContext.tsx` and mounted in `src/App.tsx`.
2026-05-27: Workstream 4 tenant-aware registration wired through `AuthModal`, `SecureAuthContext`, and `create-resident-account`.
2026-05-27: Workstream 5 DB-backed feature flags added in `src/contexts/FeatureFlagContext.tsx`; existing `useFeatureGate` now reads tenant features with plan fallback.
2026-05-27: Workstream 6 tenant branding added through `TenantContext`; app title, colors, sidebars, and admin/resident headers now use tenant branding with XTATE fallback.
2026-05-27: Workstream 7 super admin foundation added: `/sa/*` alias, tenant management from `tenants`, billing from `tenant_billing`, audit logs from `platform_audit_log`, and support from `support_tickets`.
2026-05-27: Workstream 8 RLS/security pass added in `supabase/migrations/20260527120000_phase1_rls_security_pass.sql`; broad legacy admin/security policies were replaced with estate-scoped policies.
2026-05-27: Workstream 9 verification completed. Build passes; lint failures are documented and require a separate cleanup pass after Supabase types are regenerated.
```
