using Invenet.Api.Modules.Auth.Domain;
using Invenet.Api.Modules.Trades.Domain;

namespace Invenet.Api.Modules.Strategies.Domain;

/// <summary>
/// Represents a named trading approach or methodology created by a trader to categorize their trades.
/// </summary>
public class Strategy
{
  /// <summary>
  /// Unique identifier for the strategy.
  /// </summary>
  public Guid Id { get; set; }

  /// <summary>
  /// The user that owns this strategy.
  /// </summary>
  public Guid UserId { get; set; }

  /// <summary>
  /// Human-readable strategy name (required, max 200 characters).
  /// </summary>
  public string Name { get; set; } = string.Empty;

  /// <summary>
  /// Optional detailed description of the strategy (max 2000 characters).
  /// </summary>
  public string? Description { get; set; }

  /// <summary>
  /// Soft delete flag - when true, strategy is hidden from active lists
  /// but preserved for historical trade references.
  /// </summary>
  public bool IsDeleted { get; set; } = false;

  /// <summary>
  /// Timestamp when the strategy was created (immutable after creation).
  /// </summary>
  public DateTime CreatedAt { get; set; }

  /// <summary>
  /// Timestamp when the strategy was last updated.
  /// </summary>
  public DateTime UpdatedAt { get; set; }

  // Navigation properties

  /// <summary>
  /// The user that owns this strategy.
  /// </summary>
  public ApplicationUser User { get; set; } = null!;

  /// <summary>
  /// Collection of trades that use this strategy.
  /// </summary>
  public ICollection<Trade> Trades { get; set; } = new List<Trade>();
}
