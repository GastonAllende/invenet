using Invenet.Api.Modules.Shared.Domain;

namespace Invenet.Api.Modules.Accounts.Domain;

/// <summary>
/// Represents a brokerage account belonging to a user.
/// UserId references auth.users(id) (Supabase Auth) via a DB-level FK not modeled in EF.
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
  public AccountRiskSettings RiskSettings { get; set; } = null!;
}
