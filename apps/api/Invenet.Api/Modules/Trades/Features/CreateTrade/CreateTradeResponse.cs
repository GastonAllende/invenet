namespace Invenet.Api.Modules.Trades.Features.CreateTrade;

/// <summary>
/// Response returned after successfully creating a trade (HTTP 201).
/// </summary>
public record CreateTradeResponse(
    Guid Id,
    Guid AccountId,
    Guid? StrategyId,
    string Type,
    DateTime Date,
    string Symbol,
    decimal EntryPrice,
    decimal? ExitPrice,
    decimal PositionSize,
    decimal InvestedAmount,
    decimal Commission,
    decimal ProfitLoss,
    string Status,
    DateTime CreatedAt
);
