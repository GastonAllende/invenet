# Invenet API - Agent Instructions

## Architecture

This API uses **Modular Monolith Architecture**. Each module is self-contained with its own domain, features, and infrastructure.

## Stack

- ASP.NET Core (.NET 10)
- Entity Framework Core
- PostgreSQL
- Modular Monolith Pattern

## Project Structure

```
Modules/
  ├── Shared/           # Cross-cutting concerns
  ├── Auth/             # Authentication & Authorization
  ├── Trades/           # Trading operations
  └── Health/           # Health checks
```

## Entry Points

- `apps/Invenet.Api/Program.cs` - Application bootstrap with module registration
- `apps/Invenet.Api/Modules/` - All business modules
- Each module has: Domain/, Features/, Infrastructure/, API/

## Common Commands

```bash
# Run API
cd apps/Invenet.Api
dotnet watch run

# Migrations
dotnet ef migrations add MigrationName
dotnet ef database update

# Tests
dotnet test
```

## Module Guidelines

- Each module implements `IModule` interface
- Modules are auto-discovered at startup
- Use schema per module in database (e.g., "auth", "trades")
- Features organized by vertical slice (Register/, Login/, etc.)
- No direct module-to-module references

## Adding New Code

1. Identify which module it belongs to
2. Create in appropriate folder: Domain/, Features/, Infrastructure/, or API/
3. For new entities, create `IEntityTypeConfiguration`
4. Controllers go in `API/` folder
5. Run migration if adding/changing entities

## Best Practices

- Keep controllers thin; use feature handlers or services
- Prefer async APIs and proper status codes
- Use `AsNoTracking()` for read-only queries
- Follow vertical slice architecture within modules
- Each module should be independently testable

## Reference

- Full architecture guide: `apps/api/MODULAR_MONOLITH.md`
- Playbook: `docs/AGENT_PLAYBOOK.md`
