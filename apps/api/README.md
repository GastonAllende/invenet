# Invenet API

A modular monolith ASP.NET Core API built with clean architecture principles.

## Quick Start

```bash
# Navigate to API directory
cd apps/api/Invenet.Api

# Restore dependencies
dotnet restore

# Run migrations
dotnet ef database update

# Run the API
dotnet run

# Or use watch mode for development
dotnet watch run
```

API will be available at: `http://localhost:5000`
Swagger UI: `http://localhost:5000/swagger`

## Architecture

This project uses **Modular Monolith Architecture**. For detailed information:

- **Architecture Guide**: [MODULAR_MONOLITH.md](./MODULAR_MONOLITH.md) - Complete architecture documentation
- **Migration Guide**: [MIGRATION_GUIDE.md](./MIGRATION_GUIDE.md) - Guide for migrating from old structure
- **Agent Instructions**: [Invenet.Api/AGENT.md](./Invenet.Api/AGENT.md) - Quick reference for AI agents

## Project Structure

```
apps/api/
├── Invenet.Api/
│   ├── Modules/              # Business modules
│   │   ├── Shared/          # Cross-cutting concerns
│   │   ├── Auth/            # Authentication & authorization
│   │   ├── Trades/          # Trading operations
│   │   └── Health/          # Health checks
│   ├── Data/                # EF Core design-time factory
│   ├── EmailTemplates/      # Email templates
│   ├── Migrations/          # Database migrations
│   └── Program.cs           # Application entry point
└── Invenet.Test/            # Unit tests
```

## Configuration

Required configuration in `appsettings.json` or user secrets:

```json
{
  "ConnectionStrings": {
    "DefaultConnection": "Host=localhost;Database=invenet;Username=postgres;Password=yourpassword"
  },
  "Jwt": {
    "Key": "your-secret-key-at-least-32-characters-long",
    "Issuer": "InvenetAPI",
    "Audience": "InvenetClient",
    "ExpiryMinutes": 60,
    "RefreshTokenExpiryDays": 7
  },
  "SendGrid": {
    "ApiKey": "your-sendgrid-api-key",
    "FromEmail": "noreply@invenet.com",
    "FromName": "Invenet"
  },
  "App": {
    "FrontendUrl": "http://localhost:4200"
  }
}
```

## Development

### Using User Secrets (Recommended)

```bash
cd apps/api/Invenet.Api

# Initialize user secrets
dotnet user-secrets init

# Set connection string
dotnet user-secrets set "ConnectionStrings:DefaultConnection" "Host=localhost;Database=invenet;Username=postgres;Password=yourpassword"

# Set JWT key
dotnet user-secrets set "Jwt:Key" "your-secret-key-at-least-32-characters-long"

# Set SendGrid API key
dotnet user-secrets set "SendGrid:ApiKey" "your-sendgrid-api-key"
```

### Database Migrations

```bash
# Create a new migration
dotnet ef migrations add MigrationName

# Apply migrations
dotnet ef database update

# Rollback to specific migration
dotnet ef database update PreviousMigrationName

# Remove last migration (if not applied)
dotnet ef migrations remove
```

### Running Tests

```bash
cd apps/api
dotnet test
```

## Available Modules

### Auth Module

- User registration with email confirmation
- Login with JWT tokens
- Refresh token rotation
- Password reset
- Email verification

**Endpoints:**

- `POST /api/auth/register`
- `POST /api/auth/login`
- `POST /api/auth/confirm-email`
- `POST /api/auth/resend-confirmation`
- `POST /api/auth/forgot-password`
- `POST /api/auth/reset-password`
- `POST /api/auth/refresh`
- `POST /api/auth/logout`

### Health Module

- Application health checks

**Endpoints:**

- `GET /api/health`

### Trades Module

- Trading operations (to be implemented)

**Endpoints:**

- `GET /api/trades`

## Adding a New Module

See the [MODULAR_MONOLITH.md](./MODULAR_MONOLITH.md#adding-a-new-module) guide for detailed instructions.

Quick steps:

1. Create module folder structure
2. Implement `IModule` interface
3. Add domain entities and configurations
4. Create controllers/endpoints
5. Module will be auto-discovered on startup

## Tech Stack

- **.NET 10.0**
- **ASP.NET Core** - Web framework
- **Entity Framework Core** - ORM
- **PostgreSQL** - Database
- **JWT** - Authentication
- **SendGrid** - Email service
- **NSwag** - OpenAPI/Swagger

## Resources

- [ASP.NET Core Documentation](https://learn.microsoft.com/en-us/aspnet/core/)
- [Entity Framework Core](https://learn.microsoft.com/en-us/ef/core/)
- [Modular Monolith Pattern](https://www.milanjovanovic.tech/blog/what-is-a-modular-monolith)

## License

Proprietary
