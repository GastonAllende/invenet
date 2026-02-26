using System.ComponentModel.DataAnnotations;

namespace Invenet.Api.Modules.Trades.Features.UpdateTrade;

/// <summary>
/// Request payload to update an existing trade.
/// AccountId is intentionally excluded — trades cannot be reassigned to a different account.
/// </summary>
public record UpdateTradeRequest(
    Guid? StrategyId,
    Guid? StrategyVersionId,
    [Required][RegularExpression("^(Long|Short)$", ErrorMessage = "Direction must be 'Long' or 'Short'")] string Direction,
    [Required] DateTime OpenedAt,
    [Required][StringLength(20, MinimumLength = 1, ErrorMessage = "Symbol must be 1–20 characters")] string Symbol,
    [Required][Range(0.00001, double.MaxValue, ErrorMessage = "EntryPrice must be greater than 0")] decimal EntryPrice,
    [Range(0.00001, double.MaxValue, ErrorMessage = "ExitPrice must be greater than 0 when provided")] decimal? ExitPrice,
    DateTime? ClosedAt,
    [Range(0.00001, double.MaxValue, ErrorMessage = "Quantity must be greater than 0")] decimal? Quantity,
    decimal? RMultiple,
    decimal? Pnl,
    string[]? Tags,
    string? Notes,
    [Required][RegularExpression("^(Open|Closed)$", ErrorMessage = "Status must be 'Open' or 'Closed'")] string Status
);
