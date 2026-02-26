using System.Security.Claims;
using Invenet.Api.Modules.Shared.Infrastructure.Data;
using Invenet.Api.Modules.Trades.Domain;
using Invenet.Api.Modules.Trades.Features.CreateTrade;
using Invenet.Api.Modules.Trades.Features.GetTrade;
using Invenet.Api.Modules.Trades.Features.ListTrades;
using Invenet.Api.Modules.Trades.Features.UpdateTrade;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace Invenet.Api.Modules.Trades.API;

[ApiController]
[Route("api/trades")]
[Authorize]
public sealed class TradesController : ControllerBase
{
  private readonly ModularDbContext _context;
  private readonly ILogger<TradesController> _logger;

  public TradesController(ModularDbContext context, ILogger<TradesController> logger)
  {
    _context = context;
    _logger = logger;
  }

  private Guid GetCurrentUserId()
  {
    var userIdString = User.FindFirstValue(ClaimTypes.NameIdentifier);
    if (string.IsNullOrEmpty(userIdString) || !Guid.TryParse(userIdString, out var userId))
    {
      throw new UnauthorizedAccessException("User ID not found in claims");
    }

    return userId;
  }

  private async Task<bool> AccountBelongsToUser(Guid accountId, Guid userId)
  {
    return await _context.Accounts.AnyAsync(a => a.Id == accountId && a.UserId == userId);
  }

  private sealed record StrategyVersionInfo(Guid StrategyVersionId, Guid StrategyId, string StrategyName, int VersionNumber);

  private async Task<StrategyVersionInfo?> ResolveStrategyVersion(Guid userId, Guid? strategyId, Guid? strategyVersionId)
  {
    if (!strategyId.HasValue && !strategyVersionId.HasValue)
    {
      return null;
    }

    if (strategyVersionId.HasValue)
    {
      var explicitVersion = await _context.StrategyVersions
          .Where(sv => sv.Id == strategyVersionId.Value && sv.Strategy.UserId == userId)
          .Select(sv => new StrategyVersionInfo(sv.Id, sv.StrategyId, sv.Strategy.Name, sv.VersionNumber))
          .SingleOrDefaultAsync();

      if (explicitVersion is null)
      {
        return null;
      }

      if (!strategyId.HasValue || explicitVersion.StrategyId == strategyId.Value)
      {
        return explicitVersion;
      }

      return null;
    }

    return await _context.StrategyVersions
        .Where(sv => sv.StrategyId == strategyId!.Value && sv.Strategy.UserId == userId)
        .OrderByDescending(sv => sv.VersionNumber)
        .Select(sv => new StrategyVersionInfo(sv.Id, sv.StrategyId, sv.Strategy.Name, sv.VersionNumber))
        .FirstOrDefaultAsync();
  }

  [HttpGet]
  public async Task<ActionResult<ListTradesResponse>> GetTrades(
      [FromQuery] Guid? accountId,
      [FromQuery] Guid? strategyId,
      [FromQuery] string? status,
      [FromQuery] DateTime? dateFrom,
      [FromQuery] DateTime? dateTo,
      [FromQuery] bool includeArchived = false)
  {
    var userId = GetCurrentUserId();

    if (!accountId.HasValue)
    {
      return BadRequest(new { message = "accountId query parameter is required" });
    }

    if (!await AccountBelongsToUser(accountId.Value, userId))
    {
      return Forbid();
    }

    TradeStatus? parsedStatus = null;
    if (!string.IsNullOrWhiteSpace(status))
    {
      if (!Enum.TryParse<TradeStatus>(status, ignoreCase: true, out var parsed))
      {
        return BadRequest(new { message = "status must be Open or Closed" });
      }

      parsedStatus = parsed;
    }

    var query = _context.Trades
        .AsNoTracking()
        .Where(t => t.AccountId == accountId.Value);

    if (!includeArchived)
    {
      query = query.Where(t => !t.IsArchived);
    }

    if (strategyId.HasValue)
    {
      query = query.Where(t => t.StrategyVersion != null && t.StrategyVersion.StrategyId == strategyId.Value);
    }

    if (parsedStatus.HasValue)
    {
      query = query.Where(t => t.Status == parsedStatus.Value);
    }

    if (dateFrom.HasValue)
    {
      query = query.Where(t => t.OpenedAt >= dateFrom.Value);
    }

    if (dateTo.HasValue)
    {
      query = query.Where(t => t.OpenedAt <= dateTo.Value);
    }

    var trades = await query
        .OrderByDescending(t => t.OpenedAt)
        .Select(t => new TradeListItem(
            t.Id,
            t.AccountId,
            t.StrategyVersionId,
            t.StrategyVersion != null ? t.StrategyVersion.StrategyId : null,
            t.StrategyVersion != null ? t.StrategyVersion.Strategy.Name : null,
            t.StrategyVersion != null ? t.StrategyVersion.VersionNumber : null,
            t.Direction.ToString(),
            t.OpenedAt,
            t.ClosedAt,
            t.Symbol,
            t.EntryPrice,
            t.ExitPrice,
            t.Quantity,
            t.RMultiple,
            t.Pnl,
            t.IsArchived,
            t.Status.ToString(),
            t.CreatedAt,
            t.UpdatedAt
        ))
        .ToListAsync();

    return Ok(new ListTradesResponse(trades, trades.Count));
  }

  [HttpGet("{id:guid}")]
  public async Task<ActionResult<GetTradeResponse>> Get(Guid id)
  {
    var userId = GetCurrentUserId();

    var trade = await _context.Trades
        .AsNoTracking()
        .Where(t => t.Id == id)
        .Select(t => new GetTradeResponse(
            t.Id,
            t.AccountId,
            t.StrategyVersionId,
            t.StrategyVersion != null ? t.StrategyVersion.StrategyId : null,
            t.StrategyVersion != null ? t.StrategyVersion.Strategy.Name : null,
            t.StrategyVersion != null ? t.StrategyVersion.VersionNumber : null,
            t.Direction.ToString(),
            t.OpenedAt,
            t.ClosedAt,
            t.Symbol,
            t.EntryPrice,
            t.ExitPrice,
            t.Quantity,
            t.RMultiple,
            t.Pnl,
            t.Tags,
            t.Notes,
            t.IsArchived,
            t.Status.ToString(),
            t.CreatedAt,
            t.UpdatedAt
        ))
        .SingleOrDefaultAsync();

    if (trade is null)
    {
      return NotFound(new { message = "Trade not found" });
    }

    if (!await AccountBelongsToUser(trade.AccountId, userId))
    {
      return Forbid();
    }

    return Ok(trade);
  }

  [HttpPost]
  public async Task<ActionResult<CreateTradeResponse>> Create([FromBody] CreateTradeRequest request)
  {
    var userId = GetCurrentUserId();

    if (!await AccountBelongsToUser(request.AccountId, userId))
    {
      return Forbid();
    }

    var strategyInfo = await ResolveStrategyVersion(userId, request.StrategyId, request.StrategyVersionId);
    if (request.StrategyId.HasValue || request.StrategyVersionId.HasValue)
    {
      if (strategyInfo is null)
      {
        return BadRequest(new { message = "Could not resolve strategyVersionId for the provided strategy" });
      }
    }

    if (!request.StrategyId.HasValue && !request.StrategyVersionId.HasValue)
    {
      return BadRequest(new { message = "Either strategyId or strategyVersionId must be provided" });
    }

    var now = DateTime.UtcNow;
    var resolvedStatus = string.IsNullOrWhiteSpace(request.Status) ? TradeStatus.Open : Enum.Parse<TradeStatus>(request.Status);
    var trade = new Trade
    {
      Id = Guid.NewGuid(),
      AccountId = request.AccountId,
      StrategyVersionId = strategyInfo?.StrategyVersionId,
      Direction = Enum.Parse<TradeDirection>(request.Direction),
      OpenedAt = request.OpenedAt,
      ClosedAt = request.ClosedAt,
      Symbol = request.Symbol.Trim(),
      EntryPrice = request.EntryPrice,
      ExitPrice = request.ExitPrice,
      Quantity = request.Quantity ?? 0m,
      RMultiple = request.RMultiple,
      Pnl = request.Pnl,
      Tags = request.Tags,
      Notes = request.Notes?.Trim(),
      IsArchived = false,
      Status = resolvedStatus,
      CreatedAt = now,
      UpdatedAt = now
    };

    _context.Trades.Add(trade);
    await _context.SaveChangesAsync();

    _logger.LogInformation("Trade created: {TradeId} ({Symbol}) for User {UserId}", trade.Id, trade.Symbol, userId);

    return CreatedAtAction(nameof(Get), new { id = trade.Id }, new CreateTradeResponse(
        trade.Id,
        trade.AccountId,
        trade.StrategyVersionId,
        strategyInfo?.StrategyId,
        strategyInfo?.StrategyName,
        strategyInfo?.VersionNumber,
        trade.Direction.ToString(),
        trade.OpenedAt,
        trade.ClosedAt,
        trade.Symbol,
        trade.EntryPrice,
        trade.ExitPrice,
        trade.Quantity,
        trade.RMultiple,
        trade.Pnl,
        trade.Tags,
        trade.Notes,
        trade.IsArchived,
        trade.Status.ToString(),
        trade.CreatedAt,
        trade.UpdatedAt));
  }

  [HttpPut("{id:guid}")]
  public async Task<ActionResult<UpdateTradeResponse>> Update(Guid id, [FromBody] UpdateTradeRequest request)
  {
    var userId = GetCurrentUserId();

    var trade = await _context.Trades
        .Include(t => t.StrategyVersion)
        .ThenInclude(sv => sv!.Strategy)
        .SingleOrDefaultAsync(t => t.Id == id);

    if (trade is null)
    {
      return NotFound(new { message = "Trade not found" });
    }

    if (!await AccountBelongsToUser(trade.AccountId, userId))
    {
      return Forbid();
    }

    StrategyVersionInfo? strategyInfo = null;
    if (request.StrategyId.HasValue || request.StrategyVersionId.HasValue)
    {
      strategyInfo = await ResolveStrategyVersion(userId, request.StrategyId, request.StrategyVersionId);
      if (strategyInfo is null)
      {
        return BadRequest(new { message = "Could not resolve strategyVersionId for the provided strategy" });
      }
      trade.StrategyVersionId = strategyInfo.StrategyVersionId;
    }

    trade.Direction = Enum.Parse<TradeDirection>(request.Direction);
    trade.OpenedAt = request.OpenedAt;
    trade.ClosedAt = request.ClosedAt;
    trade.Symbol = request.Symbol.Trim();
    trade.EntryPrice = request.EntryPrice;
    trade.ExitPrice = request.ExitPrice;
    trade.Quantity = request.Quantity ?? trade.Quantity;
    trade.RMultiple = request.RMultiple;
    trade.Pnl = request.Pnl;
    trade.Tags = request.Tags;
    trade.Notes = request.Notes?.Trim();
    trade.Status = Enum.Parse<TradeStatus>(request.Status);
    trade.UpdatedAt = DateTime.UtcNow;

    await _context.SaveChangesAsync();

    if (strategyInfo is null && trade.StrategyVersionId.HasValue)
    {
      strategyInfo = await _context.StrategyVersions
          .Where(sv => sv.Id == trade.StrategyVersionId.Value)
          .Select(sv => new StrategyVersionInfo(sv.Id, sv.StrategyId, sv.Strategy.Name, sv.VersionNumber))
          .SingleOrDefaultAsync();
    }

    _logger.LogInformation("Trade updated: {TradeId} ({Symbol}) for User {UserId}", trade.Id, trade.Symbol, userId);

    return Ok(new UpdateTradeResponse(
        trade.Id,
        trade.AccountId,
        trade.StrategyVersionId,
        strategyInfo?.StrategyId,
        strategyInfo?.StrategyName,
        strategyInfo?.VersionNumber,
        trade.Direction.ToString(),
        trade.OpenedAt,
        trade.ClosedAt,
        trade.Symbol,
        trade.EntryPrice,
        trade.ExitPrice,
        trade.Quantity,
        trade.RMultiple,
        trade.Pnl,
        trade.Tags,
        trade.Notes,
        trade.IsArchived,
        trade.Status.ToString(),
        trade.CreatedAt,
        trade.UpdatedAt));
  }

  [HttpPost("{id:guid}/archive")]
  public async Task<ActionResult> Archive(Guid id)
  {
    var userId = GetCurrentUserId();

    var trade = await _context.Trades.SingleOrDefaultAsync(t => t.Id == id);
    if (trade is null)
    {
      return NotFound(new { message = "Trade not found" });
    }

    if (!await AccountBelongsToUser(trade.AccountId, userId))
    {
      return Forbid();
    }

    trade.IsArchived = true;
    trade.UpdatedAt = DateTime.UtcNow;
    await _context.SaveChangesAsync();
    return NoContent();
  }

  [HttpPost("{id:guid}/unarchive")]
  public async Task<ActionResult> Unarchive(Guid id)
  {
    var userId = GetCurrentUserId();

    var trade = await _context.Trades.SingleOrDefaultAsync(t => t.Id == id);
    if (trade is null)
    {
      return NotFound(new { message = "Trade not found" });
    }

    if (!await AccountBelongsToUser(trade.AccountId, userId))
    {
      return Forbid();
    }

    trade.IsArchived = false;
    trade.UpdatedAt = DateTime.UtcNow;
    await _context.SaveChangesAsync();
    return NoContent();
  }
}
