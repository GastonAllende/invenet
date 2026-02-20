using Invenet.Api.Modules.Shared.Domain;

namespace Invenet.Api.Modules.Accounts.Domain;

/// <summary>
/// Represents default risk management rules for an account.
/// </summary>
public sealed class AccountRiskSettings : BaseEntity
{
    public required Guid AccountId { get; set; }
    public decimal RiskPerTradePct { get; set; } = 0.00m;
    public decimal MaxDailyLossPct { get; set; } = 0.00m;
    public decimal MaxWeeklyLossPct { get; set; } = 0.00m;
    public bool EnforceLimits { get; set; } = false;

    // Navigation properties
    public Account Account { get; set; } = null!;
}
