using System.ComponentModel.DataAnnotations;

namespace Invenet.Api.Modules.Trades.Features.UpdateTrade;

/// <summary>
/// Request payload to update an existing trade.
/// AccountId is intentionally excluded — trades cannot be reassigned to a different account.
/// </summary>
public record UpdateTradeRequest(
    Guid? StrategyId,
    [Required][RegularExpression("^(BUY|SELL)$", ErrorMessage = "Type must be 'BUY' or 'SELL'")] string Type,
    [Required] DateTime Date,
    [Required][StringLength(20, MinimumLength = 1, ErrorMessage = "Symbol must be 1–20 characters")] string Symbol,
    [Required][Range(0.00001, double.MaxValue, ErrorMessage = "EntryPrice must be greater than 0")] decimal EntryPrice,
    [Range(0.00001, double.MaxValue, ErrorMessage = "ExitPrice must be greater than 0 when provided")] decimal? ExitPrice,
    [Required][Range(0.00001, double.MaxValue, ErrorMessage = "PositionSize must be greater than 0")] decimal PositionSize,
    [Range(0, double.MaxValue, ErrorMessage = "InvestedAmount must be 0 or more")] decimal InvestedAmount,
    [Range(0, double.MaxValue, ErrorMessage = "Commission must be 0 or more")] decimal Commission,
    decimal ProfitLoss,
    [Required][RegularExpression("^(Win|Loss|Open)$", ErrorMessage = "Status must be 'Win', 'Loss', or 'Open'")] string Status
);
