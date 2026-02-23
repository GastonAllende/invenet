using Invenet.Api.Modules.Auth.Domain;
using Invenet.Api.Modules.Shared.Domain;

namespace Invenet.Api.Modules.Accounts.Domain;

/// <summary>
/// Represents a brokerage account belonging to a user.
/// </summary>
public sealed class Account : BaseEntity
{
  public required Guid UserId { get; set; }
  public required string Name { get; set; }
  public required string Broker { get; set; }
  public required string AccountType { get; set; }
  public required string BaseCurrency { get; set; }
  public required DateTimeOffset StartDate { get; set; }
  public required decimal StartingBalance { get; set; }
  public string Timezone { get; set; } = "Europe/Stockholm";
  public string? Notes { get; set; }
  public bool IsActive { get; set; } = true;

  // Navigation properties
  public ApplicationUser User { get; set; } = null!;
  public AccountRiskSettings RiskSettings { get; set; } = null!;
}
