namespace Invenet.Api.Modules.Strategies.Domain;

/// <summary>
/// Immutable snapshot of a strategy's rules at a specific version number.
/// </summary>
public class StrategyVersion
{
  public Guid Id { get; set; }
  public Guid StrategyId { get; set; }
  public int VersionNumber { get; set; }
  public string? Timeframe { get; set; }
  public string EntryRules { get; set; } = string.Empty;
  public string ExitRules { get; set; } = string.Empty;
  public string RiskRules { get; set; } = string.Empty;
  public string? Notes { get; set; }
  public DateTime CreatedAt { get; set; }
  public Guid CreatedByUserId { get; set; }

  public Strategy Strategy { get; set; } = null!;
}
