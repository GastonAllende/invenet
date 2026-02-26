using Invenet.Api.Modules.Auth.Domain;
using Invenet.Api.Modules.Strategies.Domain;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Invenet.Api.Modules.Strategies.Infrastructure.Data;

public class StrategyConfiguration : IEntityTypeConfiguration<Strategy>
{
  public void Configure(EntityTypeBuilder<Strategy> builder)
  {
    builder.ToTable("strategies", schema: "strategies");

    builder.HasKey(s => s.Id);

    builder.Property(s => s.Name)
        .IsRequired()
        .HasMaxLength(200);

    builder.Property(s => s.Market)
        .HasMaxLength(100);

    builder.Property(s => s.DefaultTimeframe)
        .HasMaxLength(50);

    builder.Property(s => s.IsArchived)
        .IsRequired()
        .HasDefaultValue(false);

    builder.Property(s => s.CreatedAt).IsRequired();
    builder.Property(s => s.UpdatedAt).IsRequired();
    builder.Property(s => s.UserId).IsRequired();

    builder.HasIndex(s => s.UserId)
        .HasDatabaseName("ix_strategies_user_id");

    builder.HasIndex(s => new { s.UserId, s.IsArchived })
        .HasDatabaseName("ix_strategies_user_active");

    builder.HasIndex(s => new { s.UserId, s.Name })
        .IsUnique()
        .HasDatabaseName("ix_strategies_user_name_unique")
        .HasFilter("\"IsArchived\" = FALSE");

    builder.HasOne<ApplicationUser>(s => s.User)
        .WithMany()
        .HasForeignKey(s => s.UserId)
        .OnDelete(DeleteBehavior.Cascade);

    builder.HasMany(s => s.Versions)
        .WithOne(v => v.Strategy)
        .HasForeignKey(v => v.StrategyId)
        .OnDelete(DeleteBehavior.Cascade);
  }
}
