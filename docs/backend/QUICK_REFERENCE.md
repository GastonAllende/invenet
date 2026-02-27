# Modular Monolith - Quick Reference

## Essential Commands

```bash
# Navigate to API
cd apps/api/Invenet.Api

# Run in dev mode
dotnet watch run

# Build
dotnet build

# Test
dotnet test

# Add migration
dotnet ef migrations add MigrationName

# Apply migrations
dotnet ef database update

# User secrets (dev only)
dotnet user-secrets set "Key:SubKey" "value"
```

## Project Structure at a Glance

```
Modules/
├── Shared/                    # Cross-cutting concerns
│   ├── Contracts/            # IModule interface
│   ├── Domain/               # BaseEntity
│   └── Infrastructure/       # ModularDbContext, ModuleExtensions
│
├── Auth/                      # Authentication module
│   ├── AuthModule.cs         # Module registration
│   ├── API/                  # AuthController
│   ├── Domain/               # ApplicationUser, RefreshToken
│   ├── Features/             # Login, Register, etc.
│   └── Infrastructure/       # Email, Data configs
│
├── Trades/                    # Trading module
└── Health/                    # Health checks
```

## Module Layers (Top to Bottom)

```
API Layer          → Controllers, Endpoints
Features Layer     → Use cases, Requests/Responses
Domain Layer       → Entities, Business rules
Infrastructure     → Data access, External services
```

## Creating a New Module - Checklist

- [ ] Create module folder: `Modules/YourModule/`
- [ ] Create `YourModuleModule.cs` (implements `IModule`)
- [ ] Create `Domain/YourEntity.cs` (entities)
- [ ] Create `Infrastructure/Data/YourEntityConfiguration.cs`
- [ ] Create `API/YourModuleController.cs`
- [ ] Create `Features/` folder with requests/responses
- [ ] Register services in `RegisterModule()`
- [ ] Run migration: `dotnet ef migrations add AddYourModule`
- [ ] Test in Swagger

## Common Patterns

### Entity

```csharp
public class YourEntity : BaseEntity
{
    public string Name { get; set; } = string.Empty;
}
```

### Entity Configuration

```csharp
public class YourEntityConfiguration : IEntityTypeConfiguration<YourEntity>
{
    public void Configure(EntityTypeBuilder<YourEntity> builder)
    {
        builder.ToTable("YourEntities", schema: "your_module");
        builder.HasKey(e => e.Id);
        builder.Property(e => e.Name).IsRequired().HasMaxLength(200);
    }
}
```

### Controller

```csharp
[ApiController]
[Route("api/your-module")]
[Authorize]
public class YourModuleController : ControllerBase
{
    [HttpGet]
    public async Task<IActionResult> Get() { }

    [HttpPost]
    public async Task<IActionResult> Create([FromBody] Request req) { }
}
```

### Request/Response

```csharp
public sealed record CreateRequest
{
    [Required]
    [MaxLength(200)]
    public required string Name { get; init; }
}

public sealed record CreateResponse(Guid Id, string Name);
```

## Module Registration (Automatic)

```csharp
// In Program.cs
builder.Services.RegisterModules(builder.Configuration);
app.MapModules();

// Discovers all IModule implementations automatically!
```

## Database Schemas

Use module-specific schemas:

- `auth` → Auth module tables
- `trades` → Trades module tables
- `public` → Identity tables (default)

## API Endpoints Convention

```
/api/{module-name}/{action}

Examples:
- POST /api/auth/login
- GET  /api/trades
- POST /api/trades
- GET  /api/trades/{id}
```

## HTTP Status Codes

- `200 OK` - Successful GET, PUT
- `201 Created` - Successful POST (with Location header)
- `204 No Content` - Successful DELETE
- `400 Bad Request` - Validation error
- `401 Unauthorized` - Not authenticated
- `403 Forbidden` - Not authorized
- `404 Not Found` - Resource doesn't exist
- `500 Internal Server Error` - Server error

## Dependency Injection

```csharp
// In YourModuleModule.cs
public IServiceCollection RegisterModule(IServiceCollection services, IConfiguration config)
{
    services.AddScoped<IYourService, YourService>();
    services.AddSingleton<IYourCache, YourCache>();
    services.AddTransient<IYourHelper, YourHelper>();
    return services;
}

// In Controller
public YourController(IYourService service) { }
```

## Configuration Access

```csharp
// In module registration
var setting = configuration["Section:Key"];

// Via options pattern
services.Configure<YourOptions>(configuration.GetSection("YourOptions"));
```

## Logging

```csharp
public class YourService
{
    private readonly ILogger<YourService> _logger;

    public YourService(ILogger<YourService> logger)
    {
        _logger = logger;
    }

    public void DoSomething()
    {
        _logger.LogInformation("Doing something");
        _logger.LogWarning("Warning: {Details}", details);
        _logger.LogError(ex, "Error occurred");
    }
}
```

## Testing Endpoints (Swagger)

1. Run: `dotnet run`
2. Open: `http://localhost:5000/swagger`
3. Authorize (for protected endpoints):
   - POST `/api/auth/login`
   - Copy access token
   - Click "Authorize" button
   - Paste token
4. Test your endpoints

## Common Issues

### "DbContext not found"

Make sure to inject `ModularDbContext`:

```csharp
public YourService(ModularDbContext dbContext) { }
```

### "Migration pending"

Run: `dotnet ef database update`

### "Module not registered"

Check that your module implements `IModule` interface

### "CORS error"

Check CORS policy in `Program.cs`

## Best Practices

✓ Keep controllers thin
✓ Use async/await for I/O
✓ Validate at API boundary
✓ Use DTOs for requests/responses
✓ Never expose entities directly
✓ Use proper HTTP status codes
✓ Add XML documentation
✓ Use `AsNoTracking()` for read-only queries
✓ Follow naming conventions
✓ Keep modules independent

## Resources

- Full docs: `MODULAR_MONOLITH.md`
- Templates: `MODULE_TEMPLATE.md`
- Migration: `MIGRATION_GUIDE.md`
- Architecture: `ARCHITECTURE.md`
- Agent guide: `Invenet.Api/AGENT.md`

## Quick Links

- Swagger: http://localhost:5000/swagger
- Health: http://localhost:5000/api/health
- Microsoft Docs: https://learn.microsoft.com/en-us/aspnet/core/
