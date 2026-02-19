using Invenet.Api.Modules.Strategies.Domain;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Invenet.Api.Modules.Strategies.Infrastructure.Data;

/// <summary>
/// Entity Framework Core configuration for the Strategy entity.
/// Defines database schema, constraints, and indexes.
/// </summary>
public class StrategyConfiguration : IEntityTypeConfiguration<Strategy>
{
    public void Configure(EntityTypeBuilder<Strategy> builder)
    {
        // Table configuration
        builder.ToTable("strategies", schema: "strategies");

        // Primary key
        builder.HasKey(s => s.Id);

        // Properties
        builder.Property(s => s.Name)
            .IsRequired()
            .HasMaxLength(200);

        builder.Property(s => s.Description)
            .HasMaxLength(2000);

        builder.Property(s => s.IsDeleted)
            .IsRequired()
            .HasDefaultValue(false);

        builder.Property(s => s.CreatedAt)
            .IsRequired();

        builder.Property(s => s.UpdatedAt)
            .IsRequired();

        builder.Property(s => s.AccountId)
            .IsRequired();

        // Indexes
        
        // Index on AccountId for efficient lookups
        builder.HasIndex(s => s.AccountId)
            .HasDatabaseName("ix_strategies_account_id");

        // Composite index for active strategies by account
        builder.HasIndex(s => new { s.AccountId, s.IsDeleted })
            .HasDatabaseName("ix_strategies_account_active");

        // Unique constraint for active strategy names per account
        // Only enforced when IsDeleted = FALSE
        builder.HasIndex(s => new { s.AccountId, s.Name })
            .IsUnique()
            .HasDatabaseName("ix_strategies_account_name_unique")
            .HasFilter("\"IsDeleted\" = FALSE");

        // Relationships
        
        // Foreign key to Account (commented out until Account entity is available)
        // builder.HasOne(s => s.Account)
        //     .WithMany()
        //     .HasForeignKey(s => s.AccountId)
        //     .OnDelete(DeleteBehavior.Cascade);

        // One-to-many relationship with Trades
        builder.HasMany(s => s.Trades)
            .WithOne(t => t.Strategy)
            .HasForeignKey(t => t.StrategyId)
            .OnDelete(DeleteBehavior.SetNull); // Safety fallback - soft delete prevents this
    }
}
