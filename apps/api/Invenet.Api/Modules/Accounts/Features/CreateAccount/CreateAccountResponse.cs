namespace Invenet.Api.Modules.Accounts.Features.CreateAccount;

/// <summary>
/// Response after creating an account.
/// </summary>
public record CreateAccountResponse(
    Guid Id,
    string Name,
    string Broker,
    string AccountType,
    string BaseCurrency,
    DateTimeOffset StartDate,
    decimal StartingBalance,
    string Timezone,
    string? Notes,
    bool IsActive,
    DateTimeOffset CreatedAt,
    DateTimeOffset UpdatedAt,
    AccountRiskSettingsResponse? RiskSettings
);

/// <summary>
/// Risk settings response for an account.
/// </summary>
public record AccountRiskSettingsResponse(
    Guid Id,
    Guid AccountId,
    decimal RiskPerTradePct,
    decimal MaxDailyLossPct,
    decimal MaxWeeklyLossPct,
    bool EnforceLimits
);
