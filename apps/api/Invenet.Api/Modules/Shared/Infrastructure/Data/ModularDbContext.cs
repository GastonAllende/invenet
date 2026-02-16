using Microsoft.EntityFrameworkCore;

namespace Invenet.Api.Modules.Shared.Infrastructure.Data;

/// <summary>
/// Base DbContext that will be used by all modules.
/// Each module can configure its own entities via IEntityTypeConfiguration.
/// </summary>
public class ModularDbContext : DbContext
{
    public ModularDbContext(DbContextOptions<ModularDbContext> options) : base(options)
    {
    }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);
        
        // Apply all configurations from the assembly
        modelBuilder.ApplyConfigurationsFromAssembly(typeof(ModularDbContext).Assembly);
    }
}
