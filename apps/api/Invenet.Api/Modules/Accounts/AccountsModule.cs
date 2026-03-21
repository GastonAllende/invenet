using Invenet.Api.Modules.Shared.Contracts;

namespace Invenet.Api.Modules.Accounts;

/// <summary>
/// Accounts module for managing brokerage accounts and risk settings.
/// </summary>
public class AccountsModule : IModule
{
  public IServiceCollection RegisterModule(IServiceCollection services, IConfiguration configuration)
  {
    // Register accounts-specific services here when needed
    // Example: services.AddScoped<IAccountService, AccountService>();

    return services;
  }

  public IEndpointRouteBuilder MapEndpoints(IEndpointRouteBuilder endpoints)
  {
    // Endpoints are mapped via the AccountsController
    return endpoints;
  }
}
