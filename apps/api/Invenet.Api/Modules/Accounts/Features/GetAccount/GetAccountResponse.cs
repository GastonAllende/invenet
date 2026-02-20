using Invenet.Api.Modules.Accounts.Features.CreateAccount;

namespace Invenet.Api.Modules.Accounts.Features.GetAccount;

/// <summary>
/// Response for a single account with risk settings.
/// </summary>
public record GetAccountResponse(
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
