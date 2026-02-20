namespace Invenet.Api.Modules.Accounts.Features.ListAccounts;

/// <summary>
/// Response with list of accounts.
/// </summary>
public record ListAccountsResponse(
    List<AccountListItem> Accounts,
    int Total
);

/// <summary>
/// Simplified account item for list view.
/// </summary>
public record AccountListItem(
    Guid Id,
    string Name,
    string Broker,
    string AccountType,
    string BaseCurrency,
    DateTimeOffset StartDate,
    decimal StartingBalance,
    string Timezone,
    bool IsActive,
    DateTimeOffset CreatedAt,
    RiskSettingsListItem? RiskSettings
);

/// <summary>
/// Simplified risk settings for list view.
/// </summary>
public record RiskSettingsListItem(
    decimal RiskPerTradePct,
    decimal MaxDailyLossPct,
    decimal MaxWeeklyLossPct,
    bool EnforceLimits
);
