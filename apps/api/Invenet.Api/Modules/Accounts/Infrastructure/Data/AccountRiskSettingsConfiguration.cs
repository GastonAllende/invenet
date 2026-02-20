using Invenet.Api.Modules.Accounts.Domain;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Invenet.Api.Modules.Accounts.Infrastructure.Data;

public sealed class AccountRiskSettingsConfiguration : IEntityTypeConfiguration<AccountRiskSettings>
{
    public void Configure(EntityTypeBuilder<AccountRiskSettings> builder)
    {
        builder.ToTable("account_risk_settings", schema: "accounts");

        builder.Property(r => r.RiskPerTradePct)
            .IsRequired()
            .HasColumnType("decimal(5,2)")
            .HasDefaultValue(0.00m);

        builder.Property(r => r.MaxDailyLossPct)
            .IsRequired()
            .HasColumnType("decimal(5,2)")
            .HasDefaultValue(0.00m);

        builder.Property(r => r.MaxWeeklyLossPct)
            .IsRequired()
            .HasColumnType("decimal(5,2)")
            .HasDefaultValue(0.00m);

        builder.Property(r => r.EnforceLimits)
            .IsRequired()
            .HasDefaultValue(false);

        // Unique constraint (enforces 1:1)
        builder.HasIndex(r => r.AccountId)
            .IsUnique()
            .HasDatabaseName("ix_account_risk_settings_account_id");
    }
}
