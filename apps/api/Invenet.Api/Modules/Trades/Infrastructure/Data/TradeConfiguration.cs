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
        builder.Property(t => t.Symbol)
            .IsRequired()
            .HasMaxLength(20);

        builder.Property(t => t.EntryPrice)
            .IsRequired()
            .HasColumnType("decimal(18,2)");

        builder.Property(t => t.ExitPrice)
            .HasColumnType("decimal(18,2)");

        builder.Property(t => t.AccountId)
            .IsRequired();

        builder.Property(t => t.StrategyId);  // Nullable

        builder.Property(t => t.CreatedAt)
            .IsRequired();

        builder.Property(t => t.UpdatedAt)
            .IsRequired();

        // Indexes
        
        // Index on AccountId for efficient queries
        builder.HasIndex(t => t.AccountId)
            .HasDatabaseName("ix_trades_account_id");

        // Index on StrategyId for filtering
        builder.HasIndex(t => t.StrategyId)
            .HasDatabaseName("ix_trades_strategy_id");

        // Composite index for filtering trades by strategy for an account
        builder.HasIndex(t => new { t.AccountId, t.StrategyId })
            .HasDatabaseName("ix_trades_account_strategy");

        // Relationships
        
        // Many-to-one relationship with Strategy (nullable)
        builder.HasOne(t => t.Strategy)
            .WithMany(s => s.Trades)
            .HasForeignKey(t => t.StrategyId)
            .OnDelete(DeleteBehavior.SetNull)  // Safety fallback
            .IsRequired(false);
    }
}
