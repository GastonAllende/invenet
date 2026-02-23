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

    builder.Property(t => t.StrategyId);  // Nullable

    builder.Property(t => t.Type)
        .IsRequired()
        .HasMaxLength(4)
        .HasConversion<string>();   // stored as "BUY" / "SELL"

    builder.Property(t => t.Date)
        .IsRequired();

    builder.Property(t => t.Symbol)
        .IsRequired()
        .HasMaxLength(20);

    builder.Property(t => t.EntryPrice)
        .IsRequired()
        .HasColumnType("decimal(18,2)");

    builder.Property(t => t.ExitPrice)
        .HasColumnType("decimal(18,2)");  // Nullable

    builder.Property(t => t.PositionSize)
        .IsRequired()
        .HasColumnType("decimal(18,4)");

    builder.Property(t => t.InvestedAmount)
        .IsRequired()
        .HasColumnType("decimal(18,2)");

    builder.Property(t => t.Commission)
        .IsRequired()
        .HasColumnType("decimal(18,2)")
        .HasDefaultValue(0m);

    builder.Property(t => t.ProfitLoss)
        .IsRequired()
        .HasColumnType("decimal(18,2)")
        .HasDefaultValue(0m);

    builder.Property(t => t.Status)
        .IsRequired()
        .HasMaxLength(10)
        .HasConversion<string>();   // stored as "Open" / "Win" / "Loss"

    builder.Property(t => t.CreatedAt)
        .IsRequired();

    builder.Property(t => t.UpdatedAt)
        .IsRequired();

    // Indexes
    builder.HasIndex(t => t.AccountId)
        .HasDatabaseName("ix_trades_account_id");

    builder.HasIndex(t => t.StrategyId)
        .HasDatabaseName("ix_trades_strategy_id");

    builder.HasIndex(t => new { t.AccountId, t.StrategyId })
        .HasDatabaseName("ix_trades_account_strategy");

    builder.HasIndex(t => t.Date)
        .HasDatabaseName("ix_trades_date");

    builder.HasIndex(t => new { t.AccountId, t.Date })
        .HasDatabaseName("ix_trades_account_date");

    // Relationships

    // Many-to-one relationship with Strategy (nullable)
    builder.HasOne(t => t.Strategy)
        .WithMany(s => s.Trades)
        .HasForeignKey(t => t.StrategyId)
        .OnDelete(DeleteBehavior.SetNull)
        .IsRequired(false);
  }
}
