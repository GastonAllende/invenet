---
description: 'Backend conventions for the Invenet API. Use when working on ASP.NET Core modules, controllers, domain entities, EF Core migrations, or backend business logic.'
applyTo: 'apps/api/**'
---

# Backend Context

**Stack**: ASP.NET Core (.NET 10) + EF Core + PostgreSQL + Modular Monolith

## Module Structure

Every module lives under `apps/api/Invenet.Api/Modules/<Name>/` and follows:

```
<Name>/
├── <Name>Module.cs          # Implements IModule — auto-discovered at startup
├── API/                     # Controllers
├── Domain/                  # Entities (inherit BaseEntity)
├── Features/                # DTOs / use-case slices
└── Infrastructure/
    └── Data/                # EF Core IEntityTypeConfiguration<T>
```

## Key Conventions

- **Self-contained modules** — no direct cross-module class references
- **`AsNoTracking()`** on all read-only EF queries
- **Schema per module** — `builder.ToTable("Things", schema: "module_name")`
- **Features/ folder** — keep DTOs per use-case (e.g. `Features/CreateTrade/`) as complexity grows
- **Module auto-discovery** — implement `IModule`; no manual registration needed

## Adding a New Module — Checklist

- [ ] `Modules/<Name>/<Name>Module.cs` implements `IModule`
- [ ] `Domain/<Name>Entity.cs` inherits `BaseEntity`
- [ ] `Infrastructure/Data/<Name>Configuration.cs` sets table + schema
- [ ] `API/<Name>Controller.cs` inherits `ApiControllerBase`
- [ ] Create migration: `dotnet ef migrations add Add<Name>`

## Common Commands

```bash
cd apps/api/Invenet.Api
dotnet watch run
dotnet ef migrations add <MigrationName>
dotnet ef database update
dotnet user-secrets set "Key" "Value"
```

## Reference Docs

- Full architecture: `docs/backend/MODULAR_MONOLITH.md`
- New module template with code snippets: `docs/backend/MODULE_TEMPLATE.md`
