# Module Structure Template

Use this template when creating a new module.

## Folder Structure

```
Modules/YourModule/
├── YourModuleModule.cs              # Module registration (implements IModule)
├── API/                             # Controllers & Endpoints
│   └── YourModuleController.cs
├── Domain/                          # Entities & Domain logic
│   └── YourEntity.cs
├── Features/                        # Use cases (Vertical Slices)
│   ├── CreateSomething/
│   │   ├── CreateSomethingRequest.cs
│   │   ├── CreateSomethingResponse.cs
│   │   └── CreateSomethingHandler.cs (optional)
│   └── GetSomething/
│       ├── GetSomethingRequest.cs
│       └── GetSomethingResponse.cs
└── Infrastructure/                  # Data access & External services
    ├── Data/
    │   └── YourEntityConfiguration.cs
    └── Services/
        ├── IYourService.cs
        └── YourService.cs
```

## File Templates

### 1. Module Registration (`YourModuleModule.cs`)

```csharp
using Invenet.Api.Modules.Shared.Contracts;

namespace Invenet.Api.Modules.YourModule;

/// <summary>
/// [Description of what this module does]
/// </summary>
public class YourModuleModule : IModule
{
    public IServiceCollection RegisterModule(IServiceCollection services, IConfiguration configuration)
    {
        // Register module-specific services
        // services.AddScoped<IYourService, YourService>();

        return services;
    }

    public IEndpointRouteBuilder MapEndpoints(IEndpointRouteBuilder endpoints)
    {
        // Map module-specific endpoints (if using minimal APIs)
        // For controllers, just return endpoints

        return endpoints;
    }
}
```

### 2. Domain Entity (`Domain/YourEntity.cs`)

```csharp
using Invenet.Api.Modules.Shared.Domain;

namespace Invenet.Api.Modules.YourModule.Domain;

/// <summary>
/// [Entity description]
/// </summary>
public class YourEntity : BaseEntity
{
    public string Name { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;

    // Add your properties here

    // Navigation properties (if any)
    // public ICollection<RelatedEntity> RelatedEntities { get; set; } = new List<RelatedEntity>();
}
```

### 3. Entity Configuration (`Infrastructure/Data/YourEntityConfiguration.cs`)

```csharp
using Invenet.Api.Modules.YourModule.Domain;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Invenet.Api.Modules.YourModule.Infrastructure.Data;

public class YourEntityConfiguration : IEntityTypeConfiguration<YourEntity>
{
    public void Configure(EntityTypeBuilder<YourEntity> builder)
    {
        // Schema and table name - use module-specific schema
        builder.ToTable("YourEntities", schema: "your_module");

        // Primary key
        builder.HasKey(e => e.Id);

        // Properties
        builder.Property(e => e.Name)
            .IsRequired()
            .HasMaxLength(200);

        builder.Property(e => e.Description)
            .HasMaxLength(1000);

        // Indexes
        builder.HasIndex(e => e.Name);

        // Relationships
        // builder.HasMany(e => e.RelatedEntities)
        //     .WithOne(re => re.YourEntity)
        //     .HasForeignKey(re => re.YourEntityId)
        //     .OnDelete(DeleteBehavior.Cascade);
    }
}
```

### 4. Controller (`API/YourModuleController.cs`)

```csharp
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Invenet.Api.Modules.YourModule.Features.GetSomething;
using Invenet.Api.Modules.YourModule.Features.CreateSomething;

namespace Invenet.Api.Modules.YourModule.API;

/// <summary>
/// Controller for [module description]
/// </summary>
[ApiController]
[Route("api/your-module")]
[Authorize] // Remove if endpoints should be public
public class YourModuleController : ControllerBase
{
    private readonly ILogger<YourModuleController> _logger;
    // private readonly IYourService _yourService;

    public YourModuleController(
        ILogger<YourModuleController> logger
        // IYourService yourService
    )
    {
        _logger = logger;
        // _yourService = yourService;
    }

    /// <summary>
    /// Get something
    /// </summary>
    [HttpGet]
    public async Task<ActionResult<GetSomethingResponse>> GetSomething()
    {
        // Implement logic here
        return Ok(new { message = "Get something" });
    }

    /// <summary>
    /// Create something
    /// </summary>
    [HttpPost]
    public async Task<ActionResult<CreateSomethingResponse>> CreateSomething(
        [FromBody] CreateSomethingRequest request)
    {
        // Implement logic here
        return CreatedAtAction(
            nameof(GetSomething),
            new { id = Guid.NewGuid() },
            new { message = "Created" });
    }

    /// <summary>
    /// Get by ID
    /// </summary>
    [HttpGet("{id:guid}")]
    public async Task<IActionResult> GetById(Guid id)
    {
        // Implement logic
        return Ok(new { id, message = "Item" });
    }

    /// <summary>
    /// Update
    /// </summary>
    [HttpPut("{id:guid}")]
    public async Task<IActionResult> Update(Guid id, [FromBody] object request)
    {
        // Implement logic
        return NoContent();
    }

    /// <summary>
    /// Delete
    /// </summary>
    [HttpDelete("{id:guid}")]
    public async Task<IActionResult> Delete(Guid id)
    {
        // Implement logic
        return NoContent();
    }
}
```

### 5. Request/Response Models (`Features/CreateSomething/`)

```csharp
using System.ComponentModel.DataAnnotations;

namespace Invenet.Api.Modules.YourModule.Features.CreateSomething;

/// <summary>
/// Request for creating something
/// </summary>
public sealed record CreateSomethingRequest
{
    [Required]
    [MaxLength(200)]
    public required string Name { get; init; }

    [MaxLength(1000)]
    public string? Description { get; init; }
}

/// <summary>
/// Response after creating something
/// </summary>
public sealed record CreateSomethingResponse(
    Guid Id,
    string Name,
    string? Description,
    DateTimeOffset CreatedAt
);
```

### 6. Service Interface (`Infrastructure/Services/IYourService.cs`)

```csharp
namespace Invenet.Api.Modules.YourModule.Infrastructure.Services;

/// <summary>
/// Service for [description]
/// </summary>
public interface IYourService
{
    Task<SomeResult> DoSomethingAsync(SomeInput input);
}
```

### 7. Service Implementation (`Infrastructure/Services/YourService.cs`)

```csharp
using Invenet.Api.Modules.Shared.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace Invenet.Api.Modules.YourModule.Infrastructure.Services;

public sealed class YourService : IYourService
{
    private readonly ModularDbContext _dbContext;
    private readonly ILogger<YourService> _logger;

    public YourService(
        ModularDbContext dbContext,
        ILogger<YourService> logger)
    {
        _dbContext = dbContext;
        _logger = logger;
    }

    public async Task<SomeResult> DoSomethingAsync(SomeInput input)
    {
        // Implement logic
        throw new NotImplementedException();
    }
}
```

## Steps to Create a Module

1. **Create the folder structure** as shown above

2. **Create the module class** (`YourModuleModule.cs`)
   - Implement `IModule` interface
   - Register services in `RegisterModule()`

3. **Create domain entities** in `Domain/`
   - Inherit from `BaseEntity` if needed
   - Keep pure domain logic here

4. **Create entity configurations** in `Infrastructure/Data/`
   - One configuration per entity
   - Use module-specific schema

5. **Create the controller** in `API/`
   - Add endpoints
   - Use proper HTTP verbs and status codes

6. **Create request/response models** in `Features/`
   - Organize by use case (vertical slice)
   - Keep related files together

7. **Add migration**

   ```bash
   dotnet ef migrations add Add{YourModule}Module
   dotnet ef database update
   ```

8. **Test the module**
   - Build and run
   - Test endpoints in Swagger
   - Verify database tables created

The module will be automatically discovered and registered on startup!

## Naming Conventions

- **Module**: `{ModuleName}Module.cs` (e.g., `AuthModule.cs`)
- **Entities**: Singular nouns (`User`, `Trade`, `Order`)
- **Controllers**: `{ModuleName}Controller.cs` (e.g., `TradesController.cs`)
- **Routes**: Plural, lowercase with hyphens (`/api/trades`, `/api/user-preferences`)
- **Schemas**: Lowercase, module name (`auth`, `trades`, `analytics`)
- **Features**: Verb or action-based (`CreateOrder`, `GetTradeHistory`)

## Best Practices

- Keep modules independent - avoid direct references between modules
- Use interfaces for cross-module communication
- Keep controllers thin - delegate to services
- Use async/await for all I/O operations
- Validate input at the API boundary
- Return proper HTTP status codes
- Add XML documentation comments
- Use meaningful variable and method names
- Follow SOLID principles
