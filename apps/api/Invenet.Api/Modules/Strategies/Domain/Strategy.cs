namespace Invenet.Api.Modules.Strategies.Domain;

/// <summary>
/// Strategy container entity (identity and lifecycle metadata).
/// Rule content is stored in immutable StrategyVersion snapshots.
/// UserId references auth.users(id) (Supabase Auth) via a DB-level FK not modeled in EF.
/// </summary>
public class Strategy
{
  public Guid Id { get; set; }
  public Guid UserId { get; set; }
  public string Name { get; set; } = string.Empty;
  public string? Market { get; set; }
  public string? DefaultTimeframe { get; set; }
  public bool IsArchived { get; set; } = false;
  public DateTimeOffset CreatedAt { get; set; }
  public DateTimeOffset UpdatedAt { get; set; }

  public ICollection<StrategyVersion> Versions { get; set; } = new List<StrategyVersion>();
}
