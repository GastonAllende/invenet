# Migration Guide: Transitioning to Modular Monolith

This document helps you migrate from the old structure to the new modular monolith architecture.

## Overview of Changes

The API has been restructured from a traditional layered architecture (Controllers, Services, Data, Models) to a **Modular Monolith** architecture where code is organized by business modules.

## Key Changes

### 1. Namespace Changes

| Old Namespace                            | New Namespace                                                     |
| ---------------------------------------- | ----------------------------------------------------------------- |
| `Invenet.Api.Models.ApplicationUser`     | `Invenet.Api.Modules.Auth.Domain.ApplicationUser`                 |
| `Invenet.Api.Models.RefreshToken`        | `Invenet.Api.Modules.Auth.Domain.RefreshToken`                    |
| `Invenet.Api.Services.IEmailService`     | `Invenet.Api.Modules.Auth.Infrastructure.Email.IEmailService`     |
| `Invenet.Api.Data.AppDbContext`          | `Invenet.Api.Modules.Shared.Infrastructure.Data.ModularDbContext` |
| `Invenet.Api.Controllers.AuthController` | `Invenet.Api.Modules.Auth.API.AuthController`                     |

### 2. Folder Structure

**Old Structure:**

```
Invenet.Api/
├── Controllers/
├── Data/
├── Models/
├── Services/
└── Program.cs
```

**New Structure:**

```
Invenet.Api/
├── Modules/
│   ├── Shared/
│   ├── Auth/
│   ├── Trades/
│   └── Health/
├── Data/              # Only DesignTimeDbContextFactory
└── Program.cs
```

### 3. DbContext Change

- **Old**: `AppDbContext`
- **New**: `ModularDbContext`

The new context automatically discovers all entity configurations in the assembly.

### 4. Module Registration

**Old (Program.cs):**

```csharp
// Services registered manually
builder.Services.AddScoped<IEmailService, EmailService>();
builder.Services.AddIdentityCore<ApplicationUser>()...
builder.Services.AddAuthentication()...
```

**New (Program.cs):**

```csharp
// Modules auto-discovered and registered
builder.Services.RegisterModules(builder.Configuration);
```

## Migration Steps

### If You Have Existing Database

Your existing database will continue to work. The entity configurations are compatible.

**Option 1: Create a Clean Migration (Recommended)**

```bash
# Remove old migrations (optional, if you want a fresh start)
# Back up your data first!
dotnet ef migrations remove

# Create new initial migration
dotnet ef migrations add InitialModularArchitecture

# Review the migration - it should show minimal or no changes
# Apply to database
dotnet ef database update
```

**Option 2: Keep Existing Migrations**

The new code is backward compatible with existing migrations. You can keep them as-is.

### If Starting Fresh

```bash
# Create initial migration
dotnet ef migrations add InitialCreate

# Apply to database
dotnet ef database update
```

## Breaking Changes

### For API Consumers (Frontend)

**No breaking changes!** All endpoints remain the same:

- `POST /api/auth/register`
- `POST /api/auth/login`
- `POST /api/auth/confirm-email`
- etc.

### For Developers

1. **Import statements need updating** if referencing old namespaces
2. **Inject `ModularDbContext`** instead of `AppDbContext`
3. **Create modules** for new features instead of adding to shared folders

## What to Delete (Old Files)

After confirming everything works, you can delete these old files:

```
apps/api/Invenet.Api/Controllers/AuthController.cs   # Moved to Modules/Auth/API/
apps/api/Invenet.Api/Controllers/HealthController.cs # Moved to Modules/Health/API/
apps/api/Invenet.Api/Controllers/TradesController.cs # Moved to Modules/Trades/API/
apps/api/Invenet.Api/Data/AppDbContext.cs            # Replaced by ModularDbContext
apps/api/Invenet.Api/Models/ApplicationUser.cs       # Moved to Modules/Auth/Domain/
apps/api/Invenet.Api/Models/RefreshToken.cs          # Moved to Modules/Auth/Domain/
apps/api/Invenet.Api/Models/Auth/*                   # Moved to Modules/Auth/Features/
apps/api/Invenet.Api/Services/IEmailService.cs       # Moved to Modules/Auth/Infrastructure/Email/
apps/api/Invenet.Api/Services/EmailService.cs        # Moved to Modules/Auth/Infrastructure/Email/
```

**Important:** Before deleting, ensure:

1. Application builds successfully
2. All tests pass
3. Application runs and endpoints work
4. Database migrations work

## Testing the Migration

### 1. Build Check

```bash
cd apps/api/Invenet.Api
dotnet build
```

### 2. Run the Application

```bash
dotnet run
```

### 3. Test Endpoints

Visit Swagger UI: `http://localhost:5000/swagger`

Test these endpoints:

- `GET /api/health` - Should return healthy status
- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - Login with credentials

### 4. Verify Database

Check that tables exist:

- `AspNetUsers`
- `auth.RefreshTokens` (in auth schema)

## Rollback Plan

If you need to rollback:

1. **Keep old files** until fully migrated
2. **Database**: Migrations are backward compatible
3. **Revert Program.cs** to old version
4. **Revert DesignTimeDbContextFactory.cs**

## Getting Help

- Review: `docs/backend/MODULAR_MONOLITH.md` - Full architecture documentation
- Check: Example modules in `Modules/Auth/` - Reference implementation
- Ask: Team lead or senior developers

## FAQ

**Q: Do I need to recreate my database?**
A: No, existing databases work with the new structure.

**Q: Will API endpoints change?**
A: No, all endpoints remain the same.

**Q: How do I add a new feature?**
A: See "Adding a New Module" section in `MODULAR_MONOLITH.md`

**Q: Can I still use the old Controllers/ folder?**
A: Technically yes, but it defeats the purpose of modular architecture. Use modules instead.

**Q: What about shared utilities?**
A: Put them in `Modules/Shared/` with appropriate subfolder (Domain/, Infrastructure/, etc.)
