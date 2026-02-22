using Invenet.Api.Modules.Auth.Domain;
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

        builder.Property(s => s.UserId)
            .IsRequired();

        // Indexes
        
        // Index on UserId for efficient lookups
        builder.HasIndex(s => s.UserId)
            .HasDatabaseName("ix_strategies_user_id");

        // Composite index for active strategies by user
        builder.HasIndex(s => new { s.UserId, s.IsDeleted })
            .HasDatabaseName("ix_strategies_user_active");

        // Unique constraint for active strategy names per user
        // Only enforced when IsDeleted = FALSE
        builder.HasIndex(s => new { s.UserId, s.Name })
            .IsUnique()
            .HasDatabaseName("ix_strategies_user_name_unique")
            .HasFilter("\"IsDeleted\" = FALSE");

        // Relationships
        
        // Foreign key to ApplicationUser (AspNetUsers)
        builder.HasOne<ApplicationUser>(s => s.User)
            .WithMany()
            .HasForeignKey(s => s.UserId)
            .OnDelete(DeleteBehavior.Cascade);

        // One-to-many relationship with Trades
        builder.HasMany(s => s.Trades)
            .WithOne(t => t.Strategy)
            .HasForeignKey(t => t.StrategyId)
            .OnDelete(DeleteBehavior.SetNull); // Safety fallback - soft delete prevents this
    }
}
