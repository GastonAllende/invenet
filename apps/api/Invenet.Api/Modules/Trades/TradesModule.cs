using Invenet.Api.Modules.Shared.Contracts;

namespace Invenet.Api.Modules.Trades;

/// <summary>
/// Trades module for managing trading operations.
/// </summary>
public class TradesModule : IModule
{
    public IServiceCollection RegisterModule(IServiceCollection services, IConfiguration configuration)
    {
        // Register trades-specific services here
        // Example: services.AddScoped<ITradesService, TradesService>();
        
        return services;
    }

    public IEndpointRouteBuilder MapEndpoints(IEndpointRouteBuilder endpoints)
    {
        // Endpoints are mapped via the TradesController
        return endpoints;
    }
}
