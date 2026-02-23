using Invenet.Api.Modules.Shared.Contracts;

namespace Invenet.Api.Modules.Strategies;

/// <summary>
/// Strategies module for managing trading strategies and their associations with trades.
/// </summary>
public class StrategiesModule : IModule
{
  public IServiceCollection RegisterModule(IServiceCollection services, IConfiguration configuration)
  {
    // Register strategies-specific services here when needed
    // Example: services.AddScoped<IStrategyService, StrategyService>();

    return services;
  }

  public IEndpointRouteBuilder MapEndpoints(IEndpointRouteBuilder endpoints)
  {
    // Endpoints are mapped via the StrategiesController
    return endpoints;
  }
}
