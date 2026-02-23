using Invenet.Api.Modules.Accounts.Domain;
using Invenet.Api.Modules.Strategies.Domain;
using Invenet.Api.Modules.Trades.Domain;
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

  // DbSets for entities
  public DbSet<Account> Accounts => Set<Account>();
  public DbSet<AccountRiskSettings> AccountRiskSettings => Set<AccountRiskSettings>();
  public DbSet<Strategy> Strategies => Set<Strategy>();
  public DbSet<Trade> Trades => Set<Trade>();

  protected override void OnModelCreating(ModelBuilder modelBuilder)
  {
    base.OnModelCreating(modelBuilder);

    // Apply all configurations from the assembly
    modelBuilder.ApplyConfigurationsFromAssembly(typeof(ModularDbContext).Assembly);
  }
}
