namespace Invenet.Api.Modules.Strategies.Features;

// ── Create ───────────────────────────────────────────────────────────────────

public record CreateStrategyRequest(
    string Name,
    string? Market,
    string? DefaultTimeframe,
    string? Timeframe,
    string EntryRules,
    string ExitRules,
    string RiskRules,
    string? Notes = null
);

public record CreateStrategyResponse(
    Guid Id,
    string Name,
    string? Market,
    string? DefaultTimeframe,
    bool IsArchived,
    DateTimeOffset CreatedAt,
    DateTimeOffset UpdatedAt,
    Guid VersionId,
    int VersionNumber
);

// ── Create Version ────────────────────────────────────────────────────────────

public record CreateStrategyVersionRequest(
    string? Timeframe,
    string EntryRules,
    string ExitRules,
    string RiskRules,
    string? Notes = null
);

public record CreateStrategyVersionResponse(
    Guid Id,
    int VersionNumber,
    DateTimeOffset CreatedAt,
    Guid CreatedByUserId,
    string? Timeframe,
    string EntryRules,
    string ExitRules,
    string RiskRules,
    string? Notes
);

// ── Get ──────────────────────────────────────────────────────────────────────

public record StrategyVersionDetail(
    Guid Id,
    int VersionNumber,
    string? Timeframe,
    string EntryRules,
    string ExitRules,
    string RiskRules,
    string? Notes,
    DateTimeOffset CreatedAt,
    Guid CreatedByUserId
);

public record StrategyVersionHistoryItem(
    Guid Id,
    int VersionNumber,
    DateTimeOffset CreatedAt,
    Guid CreatedByUserId
);

public record GetStrategyResponse(
    Guid Id,
    string Name,
    string? Market,
    string? DefaultTimeframe,
    bool IsArchived,
    DateTimeOffset CreatedAt,
    DateTimeOffset UpdatedAt,
    StrategyVersionDetail? CurrentVersion,
    IEnumerable<StrategyVersionHistoryItem> Versions
);

// ── List ─────────────────────────────────────────────────────────────────────

public record CurrentVersionSummary(
    Guid Id,
    int VersionNumber,
    DateTimeOffset CreatedAt,
    string? Timeframe
);

public record StrategyListItem(
    Guid Id,
    string Name,
    string? Market,
    string? DefaultTimeframe,
    bool IsArchived,
    DateTimeOffset CreatedAt,
    DateTimeOffset UpdatedAt,
    CurrentVersionSummary? CurrentVersion
);

public record ListStrategiesResponse(
    IEnumerable<StrategyListItem> Strategies,
    int Total
);

// ── Update ───────────────────────────────────────────────────────────────────

public record UpdateStrategyRequest(
    string? Name = null,
    string? Description = null
);

public record UpdateStrategyResponse(
    Guid Id,
    string Name,
    string? Description,
    bool IsDeleted,
    DateTimeOffset CreatedAt,
    DateTimeOffset UpdatedAt
);
