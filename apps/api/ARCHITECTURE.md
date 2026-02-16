# Modular Monolith Architecture - Visual Overview

## High-Level Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         API Gateway / Entry Point                 │
│                           (Program.cs)                            │
└───────────────────────────────┬───────────────────────────────────┘
                                │
                    ┌───────────┴──────────┐
                    │   Module Discovery    │
                    │  & Registration       │
                    │ (ModuleExtensions)    │
                    └───────────┬───────────┘
                                │
        ┌───────────────────────┼───────────────────────┐
        │                       │                       │
┌───────▼────────┐    ┌────────▼────────┐    ┌────────▼────────┐
│  Auth Module   │    │ Trades Module   │    │ Health Module   │
│                │    │                 │    │                 │
│ ┌────────────┐ │    │ ┌─────────────┐ │    │ ┌─────────────┐ │
│ │    API     │ │    │ │    API      │ │    │ │    API      │ │
│ │(Controller)│ │    │ │ (Controller)│ │    │ │ (Controller)│ │
│ └──────┬─────┘ │    │ └──────┬──────┘ │    │ └──────┬──────┘ │
│        │       │    │        │        │    │        │        │
│ ┌──────▼─────┐ │    │ ┌──────▼──────┐ │    │ ┌──────▼──────┐ │
│ │  Features  │ │    │ │  Features   │ │    │ │  Features   │ │
│ │ (Use Cases)│ │    │ │ (Use Cases) │ │    │ │ (Use Cases) │ │
│ └──────┬─────┘ │    │ └──────┬──────┘ │    │ └──────┬──────┘ │
│        │       │    │        │        │    │        │        │
│ ┌──────▼─────┐ │    │ ┌──────▼──────┐ │    │ ┌──────▼──────┐ │
│ │   Domain   │ │    │ │   Domain    │ │    │ │   Domain    │ │
│ │ (Entities) │ │    │ │  (Entities) │ │    │ │  (Entities) │ │
│ └──────┬─────┘ │    │ └──────┬──────┘ │    │ └──────┬──────┘ │
│        │       │    │        │        │    │        │        │
│ ┌──────▼─────┐ │    │ ┌──────▼──────┐ │    │ ┌──────▼──────┐ │
│ │Infrastruc- │ │    │ │Infrastruc-  │ │    │ │Infrastruc-  │ │
│ │   ture     │ │    │ │   ture      │ │    │ │   ture      │ │
│ └────────────┘ │    │ └─────────────┘ │    │ └─────────────┘ │
└────────┬───────┘    └────────┬────────┘    └────────┬────────┘
         │                     │                      │
         └─────────────────────┼──────────────────────┘
                               │
                    ┌──────────▼──────────┐
                    │   Shared Module     │
                    │                     │
                    │ ┌─────────────────┐ │
                    │ │   Contracts     │ │
                    │ │   (IModule)     │ │
                    │ └─────────────────┘ │
                    │ ┌─────────────────┐ │
                    │ │    Domain       │ │
                    │ │  (BaseEntity)   │ │
                    │ └─────────────────┘ │
                    │ ┌─────────────────┐ │
                    │ │ Infrastructure  │ │
                    │ │ (ModularDbContext)│
                    │ └─────────────────┘ │
                    └─────────────────────┘
```

## Module Structure (Example: Auth Module)

```
Auth Module
├── AuthModule.cs (IModule implementation)
│   ├── RegisterModule() → Services
│   └── MapEndpoints() → Routes
│
├── API Layer (Controllers/Endpoints)
│   └── AuthController.cs
│       ├── POST /api/auth/register
│       ├── POST /api/auth/login
│       ├── POST /api/auth/refresh
│       └── ... other endpoints
│
├── Features Layer (Vertical Slices)
│   ├── Register/
│   │   ├── RegisterRequest.cs
│   │   └── RegisterResponse.cs
│   ├── Login/
│   │   ├── LoginRequest.cs
│   │   └── LoginResponse.cs
│   └── Common/
│       └── AuthResponse.cs
│
├── Domain Layer (Entities & Business Logic)
│   ├── ApplicationUser.cs
│   └── RefreshToken.cs
│
└── Infrastructure Layer (Data & External Services)
    ├── Data/
    │   └── AuthEntityConfiguration.cs
    │       ├── ApplicationUserConfiguration
    │       ├── RefreshTokenConfiguration
    │       └── ... Identity configurations
    └── Email/
        ├── IEmailService.cs
        └── EmailService.cs
```

## Request Flow

```
1. HTTP Request
   │
   ├──> Middleware Pipeline
   │    ├── CORS
   │    ├── Authentication
   │    └── Authorization
   │
   ├──> Controller (API Layer)
   │    └── Validates input
   │         └── Maps to domain
   │
   ├──> Feature/Service (Business Logic)
   │    ├── Executes use case
   │    └── Orchestrates domain operations
   │
   ├──> Domain (Entities & Rules)
   │    └── Validates business rules
   │
   ├──> Infrastructure (Data Access)
   │    ├── ModularDbContext
   │    └── Database (PostgreSQL)
   │
   └──> Response
        └── Maps to DTO
             └── Returns HTTP response
```

## Module Communication

```
┌──────────────┐         ┌──────────────┐
│ Auth Module  │         │ Trades Module│
│              │         │              │
│  ┌────────┐  │         │  ┌────────┐  │
│  │Service │  │         │  │Service │  │
│  └────┬───┘  │         │  └────┬───┘  │
│       │      │         │       │      │
│       │      │         │       │      │
└───────┼──────┘         └───────┼──────┘
        │                        │
        │    ┌─────────────┐     │
        └───►│   Shared    │◄────┘
             │ Contracts/  │
             │ Interfaces  │
             └─────────────┘

Modules communicate through:
- Shared interfaces (contracts)
- Events/message bus (future)
- Shared database (with schemas)
```

## Database Organization

```
PostgreSQL Database: invenet
│
├── public schema (default)
│   ├── AspNetUsers
│   ├── AspNetRoles
│   ├── AspNetUserRoles
│   └── ... other Identity tables
│
├── auth schema
│   └── RefreshTokens
│
├── trades schema (future)
│   ├── Trades
│   ├── Orders
│   └── ...
│
└── analytics schema (future)
    └── ...
```

## Deployment Architecture

```
┌────────────────────────────────────────┐
│        Single Deployable Unit          │
│                                        │
│  ┌────────────────────────────────┐   │
│  │      ASP.NET Core App          │   │
│  │  (All Modules Included)        │   │
│  │                                │   │
│  │  - Auth Module                 │   │
│  │  - Trades Module               │   │
│  │  - Health Module               │   │
│  │  - Shared Infrastructure       │   │
│  └────────────────────────────────┘   │
│                                        │
│  ┌────────────────────────────────┐   │
│  │    Single Database              │   │
│  │    (PostgreSQL)                │   │
│  └────────────────────────────────┘   │
└────────────────────────────────────────┘

Benefits:
✓ Single deployment
✓ Simplified DevOps
✓ No distributed transactions
✓ Better performance (no network calls)
✓ Easier debugging
```

## Comparison: Monolith vs Modular Monolith vs Microservices

```
Traditional Monolith:
┌─────────────────────────┐
│   All Code Mixed         │
│   - No clear boundaries  │
│   - Tight coupling       │
│   - Hard to maintain     │
└─────────────────────────┘

Modular Monolith (Current):
┌─────────────────────────┐
│ ┌─────┐ ┌─────┐ ┌─────┐│
│ │Auth │ │Trade│ │...  ││
│ │Module│ │Module│ │    ││
│ └─────┘ └─────┘ └─────┘│
│   Clear boundaries       │
│   Loose coupling         │
│   Single deployment      │
└─────────────────────────┘

Microservices:
┌─────┐  ┌─────┐  ┌─────┐
│Auth │  │Trade│  │... │
│Svc  │  │Svc  │  │    │
└─────┘  └─────┘  └─────┘
  │        │        │
  └────┬───┴────┬───┘
     Network Calls
   - Complex deployment
   - Distributed transactions
   - Higher operational cost
```

## Migration Path

```
Current State:              Future State (if needed):

┌──────────────────┐       ┌─────┐  ┌─────┐  ┌─────┐
│ Modular Monolith │       │Auth │  │Trade│  │Core │
│                  │  ──►  │ API │  │ API │  │ API │
│ - Auth Module    │       └─────┘  └─────┘  └─────┘
│ - Trades Module  │         ▲        ▲        ▲
│ - ... Modules    │         │        │        │
└──────────────────┘         └────────┴────────┘
                              Extract modules
                              if/when needed
```

## Key Principles

1. **Module Independence**: Each module can be developed/tested independently
2. **Clear Boundaries**: Well-defined interfaces between modules
3. **Shared Infrastructure**: Common services (DB, auth) via DI
4. **Single Database**: Organized by schemas for logical separation
5. **Auto-Discovery**: Modules registered automatically at startup
6. **Future-Proof**: Easy to extract into microservices if needed

## Further Reading

- See [MODULAR_MONOLITH.md](./MODULAR_MONOLITH.md) for detailed documentation
- See [MODULE_TEMPLATE.md](./MODULE_TEMPLATE.md) for creating new modules
- See [MIGRATION_GUIDE.md](./MIGRATION_GUIDE.md) for migration from old structure
