using Invenet.Api.Modules.Strategies.Domain;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Invenet.Api.Modules.Strategies.Infrastructure.Data;

public class StrategyVersionConfiguration : IEntityTypeConfiguration<StrategyVersion>
{
  public void Configure(EntityTypeBuilder<StrategyVersion> builder)
  {
    builder.ToTable("strategy_versions", schema: "strategies");

    builder.HasKey(v => v.Id);

    builder.Property(v => v.VersionNumber)
        .IsRequired();

    builder.Property(v => v.Timeframe)
        .HasMaxLength(50);

    builder.Property(v => v.EntryRules)
        .IsRequired();

    builder.Property(v => v.ExitRules)
        .IsRequired();

    builder.Property(v => v.RiskRules)
        .IsRequired();

    builder.Property(v => v.CreatedAt)
        .IsRequired();

    builder.Property(v => v.CreatedByUserId)
        .IsRequired();

    builder.HasIndex(v => new { v.StrategyId, v.VersionNumber })
        .IsUnique()
        .HasDatabaseName("ix_strategy_versions_strategy_version_unique");

    builder.HasIndex(v => new { v.StrategyId, v.VersionNumber })
        .HasDatabaseName("ix_strategy_versions_strategy_version_desc")
        .IsDescending(false, true);
  }
}
