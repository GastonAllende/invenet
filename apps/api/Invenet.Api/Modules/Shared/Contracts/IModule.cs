namespace Invenet.Api.Modules.Shared.Contracts;

/// <summary>
/// Defines the contract for a module in the modular monolith architecture.
/// Each module must implement this interface to register its services.
/// </summary>
public interface IModule
{
  /// <summary>
  /// Registers module-specific services to the dependency injection container.
  /// </summary>
  IServiceCollection RegisterModule(IServiceCollection services, IConfiguration configuration);

  /// <summary>
  /// Maps module-specific endpoints.
  /// </summary>
  IEndpointRouteBuilder MapEndpoints(IEndpointRouteBuilder endpoints);
}
