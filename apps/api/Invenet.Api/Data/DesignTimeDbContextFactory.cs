using Invenet.Api.Modules.Shared.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Design;
using Microsoft.Extensions.Configuration;

namespace Invenet.Api.Data;

/// <summary>
/// Factory for creating ModularDbContext instances at design time.
/// This is required for EF Core tools (migrations, scaffolding, etc.).
/// </summary>
public sealed class DesignTimeDbContextFactory : IDesignTimeDbContextFactory<ModularDbContext>
{
    public ModularDbContext CreateDbContext(string[] args)
    {
        var basePath = Directory.GetCurrentDirectory();
        var configuration = new ConfigurationBuilder()
            .SetBasePath(basePath)
            .AddJsonFile("appsettings.json", optional: true)
            .AddJsonFile("appsettings.Development.json", optional: true)
            .AddEnvironmentVariables()
            .Build();

        var connectionString = configuration.GetConnectionString("DefaultConnection");
        if (string.IsNullOrWhiteSpace(connectionString))
        {
            throw new InvalidOperationException("Connection string 'DefaultConnection' not found.");
        }

        var options = new DbContextOptionsBuilder<ModularDbContext>()
            .UseNpgsql(connectionString, npgsqlOptions =>
            {
                npgsqlOptions.CommandTimeout(60);
            })
            .Options;

        return new ModularDbContext(options);
    }
}
