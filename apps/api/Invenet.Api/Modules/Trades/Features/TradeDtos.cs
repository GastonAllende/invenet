using System.ComponentModel.DataAnnotations;

namespace Invenet.Api.Modules.Trades.Features;

// ── Create ───────────────────────────────────────────────────────────────────

public record CreateTradeRequest(
    [Required] Guid AccountId,
    Guid? StrategyId,
    Guid? StrategyVersionId,
    [Required][RegularExpression("^(Long|Short)$", ErrorMessage = "Direction must be 'Long' or 'Short'")] string Direction,
    [Required] DateTimeOffset OpenedAt,
    [Required][StringLength(20, MinimumLength = 1, ErrorMessage = "Symbol must be 1–20 characters")] string Symbol,
    [Required][Range(0.00001, double.MaxValue, ErrorMessage = "EntryPrice must be greater than 0")] decimal EntryPrice,
    [Range(0.00001, double.MaxValue, ErrorMessage = "ExitPrice must be greater than 0 when provided")] decimal? ExitPrice,
    DateTimeOffset? ClosedAt,
    [Range(0.00001, double.MaxValue, ErrorMessage = "Quantity must be greater than 0")] decimal? Quantity,
    decimal? RMultiple,
    decimal? Pnl,
    string[]? Tags,
    string? Notes,
    [RegularExpression("^(Open|Closed)$", ErrorMessage = "Status must be 'Open' or 'Closed'")] string? Status
);

public record CreateTradeResponse(
    Guid Id,
    Guid AccountId,
    Guid? StrategyVersionId,
    Guid? StrategyId,
    string? StrategyName,
    int? StrategyVersionNumber,
    string Direction,
    DateTimeOffset OpenedAt,
    DateTimeOffset? ClosedAt,
    string Symbol,
    decimal EntryPrice,
    decimal? ExitPrice,
    decimal Quantity,
    decimal? RMultiple,
    decimal? Pnl,
    string[]? Tags,
    string? Notes,
    bool IsArchived,
    string Status,
    DateTimeOffset CreatedAt,
    DateTimeOffset UpdatedAt
);

// ── Get ──────────────────────────────────────────────────────────────────────

public record GetTradeResponse(
    Guid Id,
    Guid AccountId,
    Guid? StrategyVersionId,
    Guid? StrategyId,
    string? StrategyName,
    int? StrategyVersionNumber,
    string Direction,
    DateTimeOffset OpenedAt,
    DateTimeOffset? ClosedAt,
    string Symbol,
    decimal EntryPrice,
    decimal? ExitPrice,
    decimal Quantity,
    decimal? RMultiple,
    decimal? Pnl,
    string[]? Tags,
    string? Notes,
    bool IsArchived,
    string Status,
    DateTimeOffset CreatedAt,
    DateTimeOffset UpdatedAt
);

// ── List ─────────────────────────────────────────────────────────────────────

public record TradeListItem(
    Guid Id,
    Guid AccountId,
    Guid? StrategyVersionId,
    Guid? StrategyId,
    string? StrategyName,
    int? StrategyVersionNumber,
    string Direction,
    DateTimeOffset OpenedAt,
    DateTimeOffset? ClosedAt,
    string Symbol,
    decimal EntryPrice,
    decimal? ExitPrice,
    decimal Quantity,
    decimal? RMultiple,
    decimal? Pnl,
    bool IsArchived,
    string Status,
    DateTimeOffset CreatedAt,
    DateTimeOffset UpdatedAt
);

public record ListTradesResponse(
    IReadOnlyList<TradeListItem> Trades,
    int Total
);

// ── Update ───────────────────────────────────────────────────────────────────

public record UpdateTradeRequest(
    Guid? StrategyId,
    Guid? StrategyVersionId,
    [Required][RegularExpression("^(Long|Short)$", ErrorMessage = "Direction must be 'Long' or 'Short'")] string Direction,
    [Required] DateTimeOffset OpenedAt,
    [Required][StringLength(20, MinimumLength = 1, ErrorMessage = "Symbol must be 1–20 characters")] string Symbol,
    [Required][Range(0.00001, double.MaxValue, ErrorMessage = "EntryPrice must be greater than 0")] decimal EntryPrice,
    [Range(0.00001, double.MaxValue, ErrorMessage = "ExitPrice must be greater than 0 when provided")] decimal? ExitPrice,
    DateTimeOffset? ClosedAt,
    [Range(0.00001, double.MaxValue, ErrorMessage = "Quantity must be greater than 0")] decimal? Quantity,
    decimal? RMultiple,
    decimal? Pnl,
    string[]? Tags,
    string? Notes,
    [Required][RegularExpression("^(Open|Closed)$", ErrorMessage = "Status must be 'Open' or 'Closed'")] string Status
);

public record UpdateTradeResponse(
    Guid Id,
    Guid AccountId,
    Guid? StrategyVersionId,
    Guid? StrategyId,
    string? StrategyName,
    int? StrategyVersionNumber,
    string Direction,
    DateTimeOffset OpenedAt,
    DateTimeOffset? ClosedAt,
    string Symbol,
    decimal EntryPrice,
    decimal? ExitPrice,
    decimal Quantity,
    decimal? RMultiple,
    decimal? Pnl,
    string[]? Tags,
    string? Notes,
    bool IsArchived,
    string Status,
    DateTimeOffset CreatedAt,
    DateTimeOffset UpdatedAt
);
