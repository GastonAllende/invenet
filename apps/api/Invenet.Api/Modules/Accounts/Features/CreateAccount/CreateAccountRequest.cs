using System.ComponentModel.DataAnnotations;

namespace Invenet.Api.Modules.Accounts.Features.CreateAccount;

/// <summary>
/// Request to create a new brokerage account.
/// </summary>
public record CreateAccountRequest(
    [Required]
    [MaxLength(200)]
    string Name,
    
    [Required]
    [MaxLength(100)]
    string Broker,
    
    [Required]
    string AccountType,
    
    [Required]
    [MaxLength(3)]
    [MinLength(3)]
    string BaseCurrency,
    
    [Required]
    DateTimeOffset StartDate,
    
    [Required]
    [Range(0.01, double.MaxValue)]
    decimal StartingBalance,
    
    [MaxLength(50)]
    string? Timezone = "Europe/Stockholm",
    
    string? Notes = null,
    
    bool IsActive = true,
    
    RiskSettingsDto? RiskSettings = null
);

/// <summary>
/// Risk management settings for an account.
/// </summary>
public record RiskSettingsDto(
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
