using Invenet.Api.Modules.Trades.Domain;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Invenet.Api.Modules.Trades.Infrastructure.Data;

/// <summary>
/// Entity Framework Core configuration for the Trade entity.
/// </summary>
public class TradeConfiguration : IEntityTypeConfiguration<Trade>
{
  public void Configure(EntityTypeBuilder<Trade> builder)
  {
    // Table configuration
    builder.ToTable("trades", schema: "trades");

    // Primary key
    builder.HasKey(t => t.Id);

    // Properties
    builder.Property(t => t.AccountId)
        .IsRequired();

    builder.Property(t => t.StrategyVersionId);  // Nullable for legacy rows

    builder.Property(t => t.Direction)
        .IsRequired()
        .HasMaxLength(10)
        .HasConversion<string>();

    builder.Property(t => t.OpenedAt)
        .IsRequired();

    builder.Property(t => t.ClosedAt);

    builder.Property(t => t.Symbol)
        .IsRequired()
        .HasMaxLength(20);

    builder.Property(t => t.EntryPrice)
        .IsRequired()
        .HasColumnType("decimal(18,2)");

    builder.Property(t => t.ExitPrice)
        .HasColumnType("decimal(18,2)");  // Nullable

    builder.Property(t => t.Quantity)
        .IsRequired()
        .HasColumnType("decimal(18,4)");

    builder.Property(t => t.Pnl)
        .HasColumnType("decimal(18,2)");

    builder.Property(t => t.RMultiple)
        .HasColumnType("decimal(18,2)");

    builder.Property(t => t.Tags)
        .HasColumnType("text[]");

    builder.Property(t => t.Notes)
        .HasColumnType("text");

    builder.Property(t => t.IsArchived)
        .IsRequired()
        .HasDefaultValue(false);

    builder.Property(t => t.Status)
        .IsRequired()
        .HasMaxLength(10)
        .HasConversion<string>();

    builder.Property(t => t.CreatedAt)
        .IsRequired();

    builder.Property(t => t.UpdatedAt)
        .IsRequired();

    // Indexes
    builder.HasIndex(t => t.AccountId)
        .HasDatabaseName("ix_trades_account_id");

    builder.HasIndex(t => t.StrategyVersionId)
        .HasDatabaseName("ix_trades_strategy_version_id");

    builder.HasIndex(t => new { t.AccountId, t.StrategyVersionId })
        .HasDatabaseName("ix_trades_account_strategy_version");

    builder.HasIndex(t => t.OpenedAt)
        .HasDatabaseName("ix_trades_opened_at");

    builder.HasIndex(t => new { t.AccountId, t.OpenedAt })
        .HasDatabaseName("ix_trades_account_opened_at");

    // Relationships

    // Many-to-one relationship with strategy versions (nullable for legacy rows)
    builder.HasOne(t => t.StrategyVersion)
        .WithMany(sv => sv.Trades)
        .HasForeignKey(t => t.StrategyVersionId)
        .OnDelete(DeleteBehavior.SetNull)
        .IsRequired(false);
  }
}
