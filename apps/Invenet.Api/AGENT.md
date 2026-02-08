# Invenet API - Agent Instructions

## Stack
- ASP.NET Core (.NET)
- Entity Framework Core
- PostgreSQL

## Entry Points
- `apps/Invenet.Api/Program.cs`
- `apps/Invenet.Api/Controllers/*`
- `apps/Invenet.Api/Data/*`
- `apps/Invenet.Api/Models/*`

## Common Commands
```bash
# Run API
cd apps/Invenet.Api
 dotnet watch run

# Tests
cd apps/Invenet.Api
 dotnet test
```

## Notes
- Keep controllers thin; push logic into services.
- Prefer async APIs and proper status codes.
- Use `AsNoTracking()` for read-only queries.
- Follow `docs/AGENT_PLAYBOOK.md` for patterns.
