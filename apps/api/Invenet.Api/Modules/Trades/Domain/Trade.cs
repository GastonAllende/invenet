using Invenet.Api.Modules.Strategies.Domain;

namespace Invenet.Api.Modules.Trades.Domain;

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
    /// Trading symbol/ticker (e.g., AAPL, MSFT).
    /// </summary>
    public string Symbol { get; set; } = string.Empty;

    /// <summary>
    /// Entry price for the trade.
    /// </summary>
    public decimal EntryPrice { get; set; }

    /// <summary>
    /// Exit price for the trade (nullable if trade still open).
    /// </summary>
    public decimal? ExitPrice { get; set; }

    /// <summary>
    /// Optional strategy associated with this trade.
    /// </summary>
    public Guid? StrategyId { get; set; }

    /// <summary>
    /// Timestamp when the trade was created.
    /// </summary>
    public DateTime CreatedAt { get; set; }

    /// <summary>
    /// Timestamp when the trade was last updated.
    /// </summary>
    public DateTime UpdatedAt { get; set; }

    // Navigation properties

    /// <summary>
    /// The strategy used for this trade (if any).
    /// </summary>
    public Strategy? Strategy { get; set; }
}
