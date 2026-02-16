using Invenet.Api.Modules.Shared.Contracts;

namespace Invenet.Api.Modules.Health;

/// <summary>
/// Health check module for monitoring application status.
/// </summary>
public class HealthModule : IModule
{
    public IServiceCollection RegisterModule(IServiceCollection services, IConfiguration configuration)
    {
        services.AddHealthChecks();
        
        return services;
    }

    public IEndpointRouteBuilder MapEndpoints(IEndpointRouteBuilder endpoints)
    {
        // Endpoints are mapped via the HealthController
        return endpoints;
    }
}
