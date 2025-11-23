# Homepage preview workflow

This document explains how to preview unpublished homepage changes from Strapi in the Angular front-end.

## 1. Generate a preview token in Strapi

1. Sign in to the Strapi admin panel with an account that can manage API tokens.
2. Navigate to **Settings → API Tokens**.
3. Create a new **Read-only** token (for example `Homepage preview`).
4. Copy the generated token and expose it to Strapi as the `PREVIEW_TOKEN` environment variable:

   ```bash
   export PREVIEW_TOKEN="<copied-token>"
   yarn strapi develop
   ```

   Any request to `/api/homepage/preview` without this token will be rejected.

## 2. Inject the token into the Angular runtime configuration

The Angular application reads runtime values from `window.__OG7_CONFIG__` when it runs in the browser (or from process environment variables in SSR). Extend the configuration with the API base URL and the preview token:

```html
<script>
  window.__OG7_CONFIG__ = {
    API_URL: 'https://cms.localhost:1337',
    HOMEPAGE_PREVIEW_TOKEN: '<copied-token>',
  };
</script>
```

For pre-production builds the manifest is generated automatically by the `yarn build:preprod` command, which executes `scripts/generate-runtime-config.mjs` and writes `public/runtime-config.js` before Angular bootstraps. The script fails fast when `API_URL` is missing so the build cannot proceed with an empty runtime configuration.

Alternatively, set the variables in the Node.js environment before starting the SSR server:

```bash
export API_URL="https://cms.localhost:1337"
export HOMEPAGE_PREVIEW_TOKEN="<copied-token>"
```

## 3. Edit and preview homepage content

1. In Strapi, edit the **Homepage** single type in draft mode.
2. Save your changes (they can remain unpublished).
3. Open the Angular application and navigate to `/preview/homepage`.
4. The page calls `GET /api/homepage/preview?secret=<token>` using the configured values and renders:
   - The navigation block as JSON.
   - A list of dynamic sections (with their component keys and optional titles).
   - The SEO component payload.

If the token or API URL is missing, the page will surface an explicit error banner instead of silently failing.

## 4. Publish changes

Once the preview looks correct, return to Strapi and publish the homepage entry. The public `/api/homepage` endpoint will then serve the published version to end users.

## 5. Preview QA checklist (RBAC & notifications)

Use this checklist before promoting a draft to staging/production. It validates that RBAC context from Strapi flows through the Angular runtime and that analytics/notifications are gated accordingly.

### 5.1 Prepare test identities

- **Visitor**: sign out of the front-end session to exercise the anonymous path.
- **Editor**: Strapi user with the `editor` role (mapped to `Role = 'editor'`).
- **Admin + premium**: Strapi user with the `admin` role and `premiumActive=true` so the preview session exposes `premium:analytics`. `AuthService` synchronises both role and premium context with the RBAC facade. 【F:openg7-org/src/app/core/auth/auth.service.ts†L151-L172】【F:openg7-org/src/app/core/security/rbac.policy.ts†L3-L62】

### 5.2 Fetch preview content

For each identity:

1. Load `/preview/homepage` and confirm the request `GET /api/homepage/preview?secret=<token>` succeeds with the expected sections and SEO blocks. 【F:openg7-org/src/app/domains/admin/pages/preview/preview.page.ts†L39-L86】【F:openg7-org/src/app/app.routes.ts†L60-L88】
2. Toggle the preview token (e.g. append an extra character) to ensure the page surfaces the error banner instead of silently failing.

### 5.3 Validate analytics permissions

1. Open the browser console.
2. Run the following helper to tap into Angular services:

   ```js
   const injector = (window as any).ng?.getInjector(document.querySelector('og7-root'));
   const analytics = injector?.get((window as any).ng.coreTokens.AnalyticsService);
   ```

3. While authenticated as an **editor**, execute `analytics.emit('homepage_preview_loaded', { status: 'draft' }, { priority: true });` and verify that no new entry appears in `window.dataLayer` (the call early-returns because `premium:analytics` is missing). 【F:openg7-org/src/app/core/observability/analytics.service.ts†L24-L66】
4. Repeat the command as the **admin + premium** user and confirm a `priority` event is pushed to the data layer and/or the `/api/analytics/events` endpoint. This proves the RBAC policy grants `premium:analytics` when `premiumActive=true`. 【F:openg7-org/src/app/core/security/rbac.policy.ts†L20-L62】

### 5.4 Validate admin notifications

1. Still logged in as the **admin + premium** user, open `/admin` (guarded by the role-based route). 【F:openg7-org/src/app/app.routes.ts†L8-L22】【F:openg7-org/src/app/core/auth/role.guard.ts†L1-L23】
2. Change the status of a company to trigger a success toast, then force an error (e.g. toggle offline mode) to trigger the fallback notification with email delivery. 【F:openg7-org/src/app/domains/admin/pages/admin.page.ts†L1-L74】【F:openg7-org/src/app/core/observability/notification.store.ts†L87-L193】
3. Switch to the **visitor** session and try to reach `/admin`; the guard must block navigation (redirection to `access-denied`). This ensures notifications and admin analytics remain scoped to authorised reviewers only.
