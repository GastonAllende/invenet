# Auth Library (`@invenet/auth`)

Handles authentication and authorization for the Invenet platform.

## Scope

- **Guards**: `auth.guard.ts` (protects `/journal`, `/accounts`, etc.)
- **Interceptors**: `auth.interceptor.ts` (attaches Bearer tokens to all requests)
- **Service**: `auth.service.ts` (handles login, logout, and token persistence)
- **Storage**: Tokens are stored in `localStorage`.

## Backend Partner

`apps/api/Invenet.Api/Modules/Auth/`

## Key Rules

- Always use the `auth.interceptor.ts` for outgoing API calls.
- Prefer `authGuard` for protecting feature routes in `app.routes.ts`.
