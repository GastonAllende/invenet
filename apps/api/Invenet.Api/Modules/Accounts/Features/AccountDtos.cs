using System.ComponentModel.DataAnnotations;

namespace Invenet.Api.Modules.Accounts.Features;

// ── Shared ──────────────────────────────────────────────────────────────────

public record RiskSettingsDto(
    [Required][Range(0, 100)] decimal RiskPerTradePct,
    [Required][Range(0, 100)] decimal MaxDailyLossPct,
    [Required][Range(0, 100)] decimal MaxWeeklyLossPct,
    [Required] bool EnforceLimits
);

public record UpdateRiskSettingsDto(
    [Required][Range(0, 100)] decimal RiskPerTradePct,
    [Required][Range(0, 100)] decimal MaxDailyLossPct,
    [Required][Range(0, 100)] decimal MaxWeeklyLossPct,
    [Required] bool EnforceLimits
);

public record AccountRiskSettingsResponse(
    Guid Id,
    Guid AccountId,
    decimal RiskPerTradePct,
    decimal MaxDailyLossPct,
    decimal MaxWeeklyLossPct,
    bool EnforceLimits
);

// ── Create ───────────────────────────────────────────────────────────────────

public record CreateAccountRequest(
    [Required][MaxLength(200)] string Name,
    [MaxLength(100)] string? Broker,
    [Required] string AccountType,
    [Required][MaxLength(3)][MinLength(3)] string BaseCurrency,
    [Required] DateTimeOffset StartDate,
    [Required][Range(0.01, double.MaxValue)] decimal StartingBalance,
    [MaxLength(50)] string? Timezone = "Europe/Stockholm",
    string? Notes = null,
    bool IsActive = true,
    RiskSettingsDto? RiskSettings = null
);

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

// ── Get ──────────────────────────────────────────────────────────────────────

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

// ── List ─────────────────────────────────────────────────────────────────────

public record RiskSettingsListItem(
    decimal RiskPerTradePct,
    decimal MaxDailyLossPct,
    decimal MaxWeeklyLossPct,
    bool EnforceLimits
);

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

public record ListAccountsResponse(
    List<AccountListItem> Accounts,
    int Total
);

// ── Update ───────────────────────────────────────────────────────────────────

public record UpdateAccountRequest(
    [Required][MaxLength(200)] string Name,
    [MaxLength(100)] string? Broker,
    [Required] string AccountType,
    [Required][MaxLength(3)][MinLength(3)] string BaseCurrency,
    DateTimeOffset? StartDate = null,
    [Range(0.01, double.MaxValue)] decimal? StartingBalance = null,
    [MaxLength(50)] string? Timezone = "Europe/Stockholm",
    string? Notes = null,
    UpdateRiskSettingsDto? RiskSettings = null
);

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
