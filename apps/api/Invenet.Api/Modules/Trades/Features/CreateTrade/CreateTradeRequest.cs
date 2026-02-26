using System.ComponentModel.DataAnnotations;

namespace Invenet.Api.Modules.Trades.Features.CreateTrade;

/// <summary>
/// Request payload to create a new trade.
/// </summary>
public record CreateTradeRequest(
    [Required] Guid AccountId,
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
    [RegularExpression("^(Open|Closed)$", ErrorMessage = "Status must be 'Open' or 'Closed'")] string? Status
);
