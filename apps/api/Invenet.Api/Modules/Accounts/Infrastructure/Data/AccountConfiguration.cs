using Invenet.Api.Modules.Accounts.Domain;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Invenet.Api.Modules.Accounts.Infrastructure.Data;

public sealed class AccountConfiguration : IEntityTypeConfiguration<Account>
{
  public void Configure(EntityTypeBuilder<Account> builder)
  {
    builder.ToTable("accounts", schema: "accounts");

    builder.Property(a => a.Name)
        .IsRequired()
        .HasMaxLength(200);

    builder.Property(a => a.Broker)
        .IsRequired()
        .HasMaxLength(100);

    builder.Property(a => a.AccountType)
        .IsRequired()
        .HasMaxLength(20);

    builder.Property(a => a.BaseCurrency)
        .IsRequired()
        .HasMaxLength(3);

    builder.Property(a => a.StartingBalance)
        .IsRequired()
        .HasColumnType("decimal(18,2)");

    builder.Property(a => a.Timezone)
        .IsRequired()
        .HasMaxLength(50)
        .HasDefaultValue("Europe/Stockholm");

    builder.Property(a => a.Notes)
        .IsRequired(false);

    builder.Property(a => a.IsActive)
        .IsRequired()
        .HasDefaultValue(true);

    // Relationships
    builder.HasOne(a => a.User)
        .WithMany()
        .HasForeignKey(a => a.UserId)
        .OnDelete(DeleteBehavior.Cascade);

    builder.HasOne(a => a.RiskSettings)
        .WithOne(r => r.Account)
        .HasForeignKey<AccountRiskSettings>(r => r.AccountId)
        .OnDelete(DeleteBehavior.Cascade);

    // Indexes
    builder.HasIndex(a => new { a.UserId, a.IsActive })
        .HasDatabaseName("ix_accounts_user_active");

    builder.HasIndex(a => new { a.UserId, a.CreatedAt })
        .HasDatabaseName("ix_accounts_user_created")
        .IsDescending(false, true); // CreatedAt DESC
  }
}
