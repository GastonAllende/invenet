using Invenet.Api.Modules.Strategies.Domain;

namespace Invenet.Api.Modules.Trades.Domain;

/// <summary>
/// Direction of a trade.
/// </summary>
public enum TradeDirection { Long, Short }

/// <summary>
/// Outcome status of a trade.
/// </summary>
public enum TradeStatus { Open, Closed }

/// <summary>
/// Represents a trading transaction record.
/// </summary>
public class Trade
{
  /// <summary>
  /// Unique identifier for the trade.
  /// </summary>
  public Guid Id { get; set; }

  /// <summary>
  /// The account that owns this trade.
  /// </summary>
  public Guid AccountId { get; set; }

  /// <summary>
  /// Strategy version associated with this trade.
  /// </summary>
  public Guid? StrategyVersionId { get; set; }

  /// <summary>
  /// Direction of the trade.
  /// </summary>
  public TradeDirection Direction { get; set; }

  /// <summary>
  /// Timestamp when the trade was opened.
  /// </summary>
  public DateTime OpenedAt { get; set; }

  /// <summary>
  /// Timestamp when the trade was closed.
  /// </summary>
  public DateTime? ClosedAt { get; set; }

  /// <summary>
  /// Trading symbol/ticker (e.g., AAPL, MSFT).
  /// </summary>
  public string Symbol { get; set; } = string.Empty;

  /// <summary>
  /// Entry price for the trade.
  /// </summary>
  public decimal EntryPrice { get; set; }

  /// <summary>
  /// Exit price for the trade (null while status is Open).
  /// </summary>
  public decimal? ExitPrice { get; set; }

  /// <summary>
  /// Number of units / shares traded.
  /// </summary>
  public decimal Quantity { get; set; }

  /// <summary>
  /// Realised profit and loss.
  /// </summary>
  public decimal? Pnl { get; set; }

  /// <summary>
  /// Realised R-multiple for the trade.
  /// </summary>
  public decimal? RMultiple { get; set; }

  /// <summary>
  /// Optional tag labels.
  /// </summary>
  public string[]? Tags { get; set; }

  /// <summary>
  /// Optional free-form notes.
  /// </summary>
  public string? Notes { get; set; }

  /// <summary>
  /// Soft delete state.
  /// </summary>
  public bool IsArchived { get; set; }

  /// <summary>
  /// Trade lifecycle status.
  /// </summary>
  public TradeStatus Status { get; set; }

  /// <summary>
  /// Timestamp when the trade record was created.
  /// </summary>
  public DateTime CreatedAt { get; set; }

  /// <summary>
  /// Timestamp when the trade record was last updated.
  /// </summary>
  public DateTime UpdatedAt { get; set; }

  // Navigation properties

  /// <summary>
  /// The strategy version used for this trade.
  /// </summary>
  public StrategyVersion? StrategyVersion { get; set; }
}
