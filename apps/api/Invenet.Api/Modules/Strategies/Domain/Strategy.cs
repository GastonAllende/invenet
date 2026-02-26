using Invenet.Api.Modules.Auth.Domain;

namespace Invenet.Api.Modules.Strategies.Domain;

/// <summary>
/// Strategy container entity (identity and lifecycle metadata).
/// Rule content is stored in immutable StrategyVersion snapshots.
/// </summary>
public class Strategy
{
  public Guid Id { get; set; }
  public Guid UserId { get; set; }
  public string Name { get; set; } = string.Empty;
  public string? Market { get; set; }
  public string? DefaultTimeframe { get; set; }
  public bool IsArchived { get; set; } = false;
  public DateTime CreatedAt { get; set; }
  public DateTime UpdatedAt { get; set; }

  public ApplicationUser User { get; set; } = null!;
  public ICollection<StrategyVersion> Versions { get; set; } = new List<StrategyVersion>();
}
