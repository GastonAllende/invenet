using System.Reflection;
using Invenet.Api.Modules.Shared.Contracts;

namespace Invenet.Api.Modules.Shared.Infrastructure;

/// <summary>
/// Extension methods for registering and mapping modules.
/// </summary>
public static class ModuleExtensions
{
    /// <summary>
    /// Registers all modules that implement IModule in the assembly.
    /// </summary>
    public static IServiceCollection RegisterModules(this IServiceCollection services, IConfiguration configuration)
    {
        var modules = DiscoverModules();
        
        foreach (var module in modules)
        {
            module.RegisterModule(services, configuration);
        }
        
        return services;
    }
    
    /// <summary>
    /// Maps endpoints for all modules that implement IModule in the assembly.
    /// </summary>
    public static IEndpointRouteBuilder MapModules(this IEndpointRouteBuilder endpoints)
    {
        var modules = DiscoverModules();
        
        foreach (var module in modules)
        {
            module.MapEndpoints(endpoints);
        }
        
        return endpoints;
    }
    
    private static IEnumerable<IModule> DiscoverModules()
    {
        return Assembly.GetExecutingAssembly()
            .GetTypes()
            .Where(t => typeof(IModule).IsAssignableFrom(t) && !t.IsInterface && !t.IsAbstract)
            .Select(Activator.CreateInstance)
            .Cast<IModule>();
    }
}
