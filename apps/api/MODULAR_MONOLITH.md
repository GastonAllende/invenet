# Invenet API - Modular Monolith Architecture

This API is built using **Modular Monolith Architecture**, a software design approach that combines the benefits of monolithic and microservices architectures. Each module is self-contained and can be independently developed, tested, and maintained, while still being deployed as a single application.

## Table of Contents

- [Architecture Overview](#architecture-overview)
- [Project Structure](#project-structure)
- [Modules](#modules)
- [Getting Started](#getting-started)
- [Development Workflow](#development-workflow)
- [Adding a New Module](#adding-a-new-module)
- [Database Migrations](#database-migrations)
- [Best Practices](#best-practices)

## Architecture Overview

### What is Modular Monolith?

A modular monolith is an architectural style that structures the application as a collection of loosely coupled modules within a single deployable unit. Each module:

- Encapsulates a specific business domain or capability
- Has clear boundaries and interfaces
- Can be developed and tested independently
- Communicates with other modules through well-defined contracts
- Shares common infrastructure (database, authentication, etc.)

### Benefits

- **Simplified deployment**: Single application to deploy and monitor
- **Easier development**: No distributed system complexity
- **Better performance**: No network overhead between modules
- **Clear boundaries**: Each module has its own domain and responsibilities
- **Future flexibility**: Modules can be extracted into microservices if needed
- **Team autonomy**: Different teams can work on different modules

## Project Structure

```
Invenet.Api/
├── Modules/                          # All business modules
│   ├── Shared/                       # Shared infrastructure & contracts
│   │   ├── Contracts/
│   │   │   └── IModule.cs           # Module registration interface
│   │   ├── Domain/
│   │   │   └── BaseEntity.cs        # Base entity class
│   │   └── Infrastructure/
│   │       ├── ModuleExtensions.cs  # Module discovery & registration
│   │       └── Data/
│   │           └── ModularDbContext.cs
│   │
│   ├── Auth/                         # Authentication & Authorization module
│   │   ├── AuthModule.cs            # Module registration
│   │   ├── API/                     # Controllers/Endpoints
│   │   │   └── AuthController.cs
│   │   ├── Domain/                  # Entities & Domain logic
│   │   │   ├── ApplicationUser.cs
│   │   │   └── RefreshToken.cs
│   │   ├── Features/                # Use cases/Features (Vertical Slices)
│   │   │   ├── Login/
│   │   │   ├── Register/
│   │   │   └── Common/
│   │   └── Infrastructure/          # Data access, external services
│   │       ├── Data/
│   │       │   └── AuthEntityConfiguration.cs
│   │       └── Email/
│   │           ├── IEmailService.cs
│   │           └── EmailService.cs
│   │
│   ├── Trades/                       # Trading operations module
│   │   ├── TradesModule.cs
│   │   └── API/
│   │       └── TradesController.cs
│   │
│   └── Health/                       # Health check module
│       ├── HealthModule.cs
│       └── API/
│           └── HealthController.cs
│
├── Data/                             # Legacy compatibility
│   └── DesignTimeDbContextFactory.cs
├── EmailTemplates/                   # Email templates
├── Migrations/                       # EF Core migrations
├── Program.cs                        # Application entry point
└── appsettings.json                 # Configuration
```

## Modules

### Shared Module

The `Shared` module contains cross-cutting concerns and infrastructure used by all modules:

- **Contracts**: `IModule` interface for module registration
- **Domain**: Base classes like `BaseEntity`
- **Infrastructure**:
  - `ModuleExtensions`: Automatic module discovery and registration
  - `ModularDbContext`: Shared database context

### Auth Module

Handles all authentication and authorization concerns:

- User registration with email confirmation
- Login with JWT tokens
- Refresh token rotation
- Password reset
- Email verification

**Key Components**:

- `AuthModule.cs`: Registers Identity, JWT authentication
- `AuthController.cs`: REST API endpoints
- Domain entities: `ApplicationUser`, `RefreshToken`
- `EmailService`: SendGrid integration

### Trades Module

Manages trading operations (to be implemented).

### Health Module

Provides health check endpoints for monitoring.

## Getting Started

### Prerequisites

- .NET 10.0 SDK
- PostgreSQL
- SendGrid account (for email functionality)

### Configuration

1. **Database Connection**:

Update `appsettings.json` or use user secrets:

```json
{
  "ConnectionStrings": {
    "DefaultConnection": "Host=localhost;Database=invenet;Username=your_user;Password=your_password"
  }
}
```

2. **JWT Configuration**:

```json
{
  "Jwt": {
    "Key": "your-secret-key-min-32-characters-long",
    "Issuer": "InvenetAPI",
    "Audience": "InvenetClient",
    "ExpiryMinutes": 60,
    "RefreshTokenExpiryDays": 7
  }
}
```

3. **SendGrid Configuration**:

```json
{
  "SendGrid": {
    "ApiKey": "your-sendgrid-api-key",
    "FromEmail": "noreply@invenet.com",
    "FromName": "Invenet"
  }
}
```

4. **Frontend URL**:

```json
{
  "App": {
    "FrontendUrl": "http://localhost:4200"
  }
}
```

### Running the Application

```bash
# Navigate to the API directory
cd apps/api/Invenet.Api

# Restore dependencies
dotnet restore

# Run database migrations
dotnet ef database update

# Run the application
dotnet run

# Or use watch mode for development
dotnet watch run
```

The API will be available at:

- **HTTP**: `http://localhost:5000`
- **Swagger UI**: `http://localhost:5000/swagger`

## Development Workflow

### Module Auto-Discovery

Modules are automatically discovered and registered at startup. The `ModuleExtensions.RegisterModules()` method:

1. Scans the assembly for classes implementing `IModule`
2. Instantiates each module
3. Calls `RegisterModule()` to register services
4. Calls `MapEndpoints()` to register endpoints

### Working with Modules

Each module is isolated and follows these principles:

1. **Self-contained**: All module code lives in its folder
2. **Independent**: Modules don't directly reference each other
3. **Contract-based**: Communication through interfaces
4. **Infrastructure sharing**: Common services via DI

## Adding a New Module

Follow these steps to add a new module:

### 1. Create Module Structure

```
Modules/
└── YourModule/
    ├── YourModuleModule.cs           # Module registration
    ├── API/                          # Controllers/Endpoints
    ├── Domain/                       # Entities, Value Objects
    ├── Features/                     # Use cases (vertical slices)
    └── Infrastructure/               # Data access, external services
```

### 2. Create the Module Class

```csharp
using Invenet.Api.Modules.Shared.Contracts;

namespace Invenet.Api.Modules.YourModule;

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
        // Map module-specific endpoints if using minimal APIs
        // For controllers, this can just return endpoints

        return endpoints;
    }
}
```

### 3. Create Domain Entities

```csharp
using Invenet.Api.Modules.Shared.Domain;

namespace Invenet.Api.Modules.YourModule.Domain;

public class YourEntity : BaseEntity
{
    public string Name { get; set; } = string.Empty;
    // Add your properties
}
```

### 4. Create Entity Configuration

```csharp
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Invenet.Api.Modules.YourModule.Infrastructure.Data;

public class YourEntityConfiguration : IEntityTypeConfiguration<YourEntity>
{
    public void Configure(EntityTypeBuilder<YourEntity> builder)
    {
        builder.ToTable("YourEntities", schema: "your_module");

        builder.HasKey(e => e.Id);

        builder.Property(e => e.Name)
            .IsRequired()
            .HasMaxLength(200);
    }
}
```

### 5. Create Controller

```csharp
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Invenet.Api.Modules.YourModule.API;

[ApiController]
[Route("api/your-module")]
[Authorize]
public class YourModuleController : ControllerBase
{
    [HttpGet]
    public async Task<IActionResult> Get()
    {
        return Ok(new { message = "Your module" });
    }
}
```

### 6. Run Migration

```bash
dotnet ef migrations add AddYourModule
dotnet ef database update
```

The module will be automatically discovered and registered on the next application startup!

## Database Migrations

### Creating Migrations

```bash
# Navigate to the API directory
cd apps/api/Invenet.Api

# Add a new migration
dotnet ef migrations add MigrationName

# Apply migrations to database
dotnet ef database update

# Revert to a specific migration
dotnet ef database update PreviousMigrationName

# Remove last migration (if not applied)
dotnet ef migrations remove
```

### Migration Best Practices

1. **One migration per feature**: Create migrations for each logical change
2. **Descriptive names**: Use clear migration names (e.g., `AddUserPreferences`)
3. **Test migrations**: Always test rollback scenarios
4. **Review SQL**: Check generated SQL before applying to production

## Best Practices

### Module Design

1. **Single Responsibility**: Each module should focus on one business domain
2. **Loose Coupling**: Modules communicate through interfaces, not direct references
3. **High Cohesion**: Related functionality stays together within a module
4. **Clear Boundaries**: Define what belongs in each module

### Code Organization

1. **Vertical Slicing**: Organize by feature rather than technical layer
2. **Feature Folders**: Group related files (request, response, handler) together
3. **DTOs vs Entities**: Keep domain entities separate from API contracts
4. **Explicit Dependencies**: Use constructor injection for all dependencies

### Database

1. **Schema per Module**: Use database schemas to logically separate modules
2. **Entity Configuration**: Use `IEntityTypeConfiguration` for all entities
3. **Migrations**: Keep migrations in the main project
4. **No Direct DbSet Access**: Access data through repositories or services

### API Design

1. **RESTful Conventions**: Follow REST principles for endpoints
2. **Async All the Way**: Use async/await for all I/O operations
3. **Proper Status Codes**: Return appropriate HTTP status codes
4. **Validation**: Validate input at the API boundary
5. **Error Handling**: Use consistent error response format

### Security

1. **Authorization**: Use `[Authorize]` attribute on protected endpoints
2. **Input Validation**: Validate and sanitize all inputs
3. **Secrets Management**: Use user secrets for development, KeyVault for production
4. **HTTPS**: Always use HTTPS in production

### Testing

1. **Unit Tests**: Test business logic in isolation
2. **Integration Tests**: Test module interactions
3. **API Tests**: Test endpoints end-to-end
4. **Test per Module**: Keep tests close to the module they test

## Resources

- [Microsoft Documentation - Modular Architecture](https://learn.microsoft.com/en-us/dotnet/architecture/)
- [ASP.NET Core Best Practices](https://learn.microsoft.com/en-us/aspnet/core/fundamentals/best-practices)
- [Entity Framework Core](https://learn.microsoft.com/en-us/ef/core/)
- [Clean Architecture](https://blog.cleancoder.com/uncle-bob/2012/08/13/the-clean-architecture.html)

## Support

For questions or issues:

1. Check the documentation
2. Review existing code in similar modules
3. Consult the team lead
4. Reference Microsoft Learn documentation

---

**Remember**: The modular monolith gives us the agility of microservices with the simplicity of a monolith. Keep modules independent and well-defined!
