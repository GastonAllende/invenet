using Invenet.Api.Modules.Accounts.Features.CreateAccount;

namespace Invenet.Api.Modules.Accounts.Features.UpdateAccount;

/// <summary>
/// Response after updating an account.
/// </summary>
public record UpdateAccountResponse(
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
