# Quickstart: Fix Strategy Owner Field (accountId → userId)

**Branch**: `004-fix-strategy-account-id`  
**Date**: 2026-02-21

## Prerequisites

- PostgreSQL running and connection string configured
- `dotnet tool restore` completed (EF Core tools available)
- Node dependencies installed (`npm install`)

## Implementation Order

Follow tasks in [tasks.md](./tasks.md). The critical ordering is:

```
T001 → T002 → T003  (domain → config → migration)
           ↓
     T004 in parallel with T005/T006/T007/T010
           ↓
     T009 → T011/T012/T013/T014 → T015/T016
```

## Step-by-Step Verification

### 1. After T001 + T002 (domain + config rename)

Run:

```bash
cd apps/api/Invenet.Api
dotnet build
```

Expected: **zero compile errors**. If `AccountId` is still referenced anywhere in the Strategies module, the build will fail pointing to the exact location.

### 2. After T003 (migration created)

Inspect the generated migration file — it should contain only:

- `RenameColumn` for `AccountId` → `UserId`
- `RenameIndex` for each of the three indexes

It must **not** contain `DropColumn` / `AddColumn` / `AlterColumn` — those would indicate EF Core is doing a destructive change.

Apply the migration to your local database:

```bash
cd apps/api/Invenet.Api
dotnet ef database update
```

Expected: migration applies cleanly, no errors.

### 3. After T004 (controller rename)

Run:

```bash
cd apps/api/Invenet.Api
dotnet build
```

Expected: zero compile errors.

### 4. Manual API Verification

Start the API:

```bash
cd apps/api/Invenet.Api
dotnet watch run
```

Log in and get a JWT token, then:

```bash
# List strategies — should return your strategies (same as before the fix)
curl -H "Authorization: Bearer <token>" https://localhost:5001/api/strategies
```

Expected: same strategies you had before, still returned correctly.

```bash
# Create a strategy
curl -X POST \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{"name":"Test Strategy"}' \
  https://localhost:5001/api/strategies
```

Expected: `201 Created` with strategy object (no `userId`/`accountId` in response — owner field is not exposed).

```bash
# Verify in DB that UserId column exists and holds the correct user GUID
psql $CONNECTION_STRING -c "SELECT id, \"UserId\", name FROM strategies.strategies LIMIT 5;"
```

Expected: `UserId` column present, values are valid user GUIDs.

### 5. After T015/T016 (build gates)

```bash
# Backend
cd apps/api/Invenet.Api && dotnet build

# Frontend
cd /path/to/repo/root && npx nx build invenet
```

Both must complete with zero errors.

## Rollback

If the migration needs to be reverted:

```bash
dotnet ef database update <previous-migration-name>
dotnet ef migrations remove
```

The column rename is safe to roll back — no data is lost in either direction.
