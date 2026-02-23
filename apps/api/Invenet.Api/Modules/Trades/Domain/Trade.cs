using Invenet.Api.Modules.Strategies.Domain;

namespace Invenet.Api.Modules.Trades.Domain;

/// <summary>
/// Direction of a trade.
/// </summary>
public enum TradeType { BUY, SELL }

/// <summary>
/// Outcome status of a trade.
/// </summary>
public enum TradeStatus { Win, Loss, Open }

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
  /// Optional strategy associated with this trade.
  /// </summary>
  public Guid? StrategyId { get; set; }

  /// <summary>
  /// Direction of the trade: BUY or SELL.
  /// </summary>
  public TradeType Type { get; set; }

  /// <summary>
  /// Trade execution date.
  /// </summary>
  public DateTime Date { get; set; }

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
  public decimal PositionSize { get; set; }

  /// <summary>
  /// Total capital deployed (entryPrice × positionSize).
  /// </summary>
  public decimal InvestedAmount { get; set; }

  /// <summary>
  /// Broker commission; defaults to 0.
  /// </summary>
  public decimal Commission { get; set; }

  /// <summary>
  /// Realised profit or loss; defaults to 0 while open.
  /// </summary>
  public decimal ProfitLoss { get; set; }

  /// <summary>
  /// Outcome of the trade: Win, Loss, or Open.
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
  /// The strategy used for this trade (if any).
  /// </summary>
  public Strategy? Strategy { get; set; }
}
