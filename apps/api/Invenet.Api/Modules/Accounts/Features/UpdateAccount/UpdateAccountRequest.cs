using System.ComponentModel.DataAnnotations;

namespace Invenet.Api.Modules.Accounts.Features.UpdateAccount;

/// <summary>
/// Request to update an existing account.
/// Note: UserId, StartDate, and StartingBalance cannot be modified.
/// </summary>
public record UpdateAccountRequest(
    [Required]
    [MaxLength(200)]
    string Name,

    [MaxLength(100)]
    string? Broker,

    [Required]
    string AccountType,

    [Required]
    [MaxLength(3)]
    [MinLength(3)]
    string BaseCurrency,

    [MaxLength(50)]
    string? Timezone = "Europe/Stockholm",

    string? Notes = null,

    UpdateRiskSettingsDto? RiskSettings = null
);

/// <summary>
/// Risk settings for update request.
/// </summary>
public record UpdateRiskSettingsDto(
    [Required]
    [Range(0, 100)]
    decimal RiskPerTradePct,

    [Required]
    [Range(0, 100)]
    decimal MaxDailyLossPct,

    [Required]
    [Range(0, 100)]
    decimal MaxWeeklyLossPct,

    [Required]
    bool EnforceLimits
);
