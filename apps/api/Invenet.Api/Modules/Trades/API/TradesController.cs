using System.Security.Claims;
using Invenet.Api.Modules.Shared.Infrastructure.Data;
using Invenet.Api.Modules.Trades.Domain;
using Invenet.Api.Modules.Trades.Features.CreateTrade;
using Invenet.Api.Modules.Trades.Features.ListTrades;
using Invenet.Api.Modules.Trades.Features.UpdateTrade;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace Invenet.Api.Modules.Trades.API;

/// <summary>
/// Controller for trading operations.
/// </summary>
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

  /// <summary>
  /// Get the current authenticated user's ID.
  /// </summary>
  private Guid GetCurrentUserId()
  {
    var userIdString = User.FindFirstValue(ClaimTypes.NameIdentifier);
    if (string.IsNullOrEmpty(userIdString) || !Guid.TryParse(userIdString, out var userId))
    {
      throw new UnauthorizedAccessException("User ID not found in claims");
    }
    return userId;
  }

  /// <summary>
  /// Get all trades for the authenticated user, ordered by date descending.
  /// </summary>
  /// <returns>List of trades belonging to the user's accounts</returns>
  /// <response code="200">Trades returned successfully</response>
  /// <response code="400">Account context is missing</response>
  /// <response code="401">User not authenticated</response>
  /// <response code="403">Account does not belong to user</response>
  [HttpGet]
  public async Task<ActionResult<ListTradesResponse>> GetTrades([FromQuery] Guid? accountId)
  {
    var userId = GetCurrentUserId();

    if (!accountId.HasValue)
    {
      return BadRequest(new { message = "accountId query parameter is required" });
    }

    var accountBelongsToUser = await _context.Accounts
        .AnyAsync(a => a.Id == accountId.Value && a.UserId == userId);

    if (!accountBelongsToUser)
    {
      return Forbid();
    }

    var trades = await _context.Trades
        .Where(t => t.AccountId == accountId.Value)
        .OrderByDescending(t => t.Date)
        .Select(t => new TradeListItem(
            t.Id,
            t.AccountId,
            t.StrategyId,
            t.Type.ToString(),
            t.Date,
            t.Symbol,
            t.EntryPrice,
            t.ExitPrice,
            t.PositionSize,
            t.InvestedAmount,
            t.Commission,
            t.ProfitLoss,
            t.Status.ToString(),
            t.CreatedAt
        ))
        .ToListAsync();

    return Ok(new ListTradesResponse(trades, trades.Count));
  }

  /// <summary>
  /// Create a new trade for the authenticated user.
  /// </summary>
  /// <response code="201">Trade created successfully</response>
  /// <response code="400">Validation error</response>
  /// <response code="401">User not authenticated</response>
  /// <response code="403">Account does not belong to user</response>
  [HttpPost]
  public async Task<ActionResult<CreateTradeResponse>> Create([FromBody] CreateTradeRequest request)
  {
    var userId = GetCurrentUserId();

    // Verify account ownership
    var accountExists = await _context.Accounts
        .AnyAsync(a => a.Id == request.AccountId && a.UserId == userId);

    if (!accountExists)
    {
      return Forbid();
    }

    // Verify strategy ownership if provided
    if (request.StrategyId.HasValue)
    {
      var strategyExists = await _context.Strategies
          .AnyAsync(s => s.Id == request.StrategyId.Value && s.UserId == userId);

      if (!strategyExists)
      {
        return Forbid();
      }
    }

    var now = DateTime.UtcNow;
    var trade = new Trade
    {
      Id = Guid.NewGuid(),
      AccountId = request.AccountId,
      StrategyId = request.StrategyId,
      Type = Enum.Parse<TradeType>(request.Type),
      Date = request.Date,
      Symbol = request.Symbol,
      EntryPrice = request.EntryPrice,
      ExitPrice = request.ExitPrice,
      PositionSize = request.PositionSize,
      InvestedAmount = request.InvestedAmount,
      Commission = request.Commission,
      ProfitLoss = request.ProfitLoss,
      Status = Enum.Parse<TradeStatus>(request.Status),
      CreatedAt = now,
    };

    _context.Trades.Add(trade);
    await _context.SaveChangesAsync();

    _logger.LogInformation(
        "Trade created: {TradeId} ({Symbol}) for User {UserId}",
        trade.Id, trade.Symbol, userId);

    var response = new CreateTradeResponse(
        trade.Id,
        trade.AccountId,
        trade.StrategyId,
        trade.Type.ToString(),
        trade.Date,
        trade.Symbol,
        trade.EntryPrice,
        trade.ExitPrice,
        trade.PositionSize,
        trade.InvestedAmount,
        trade.Commission,
        trade.ProfitLoss,
        trade.Status.ToString(),
        trade.CreatedAt
    );

    return CreatedAtAction(nameof(GetTrades), null, response);
  }

  /// <summary>
  /// Update an existing trade. The trade must belong to the authenticated user.
  /// </summary>
  /// <response code="200">Trade updated successfully</response>
  /// <response code="400">Validation error</response>
  /// <response code="401">User not authenticated</response>
  /// <response code="403">Trade does not belong to authenticated user</response>
  /// <response code="404">Trade not found</response>
  [HttpPut("{id:guid}")]
  public async Task<ActionResult<UpdateTradeResponse>> Update(Guid id, [FromBody] UpdateTradeRequest request)
  {
    var userId = GetCurrentUserId();

    // Load the trade with its account to verify ownership
    var trade = await _context.Trades.FirstOrDefaultAsync(t => t.Id == id);

    if (trade == null)
    {
      return NotFound(new { message = "Trade not found" });
    }

    // Verify the trade's account belongs to this user
    var accountBelongsToUser = await _context.Accounts
        .AnyAsync(a => a.Id == trade.AccountId && a.UserId == userId);

    if (!accountBelongsToUser)
    {
      return Forbid();
    }

    // Verify strategy ownership if provided
    if (request.StrategyId.HasValue)
    {
      var strategyExists = await _context.Strategies
          .AnyAsync(s => s.Id == request.StrategyId.Value && s.UserId == userId);

      if (!strategyExists)
      {
        return Forbid();
      }
    }

    trade.StrategyId = request.StrategyId;
    trade.Type = Enum.Parse<TradeType>(request.Type);
    trade.Date = request.Date;
    trade.Symbol = request.Symbol;
    trade.EntryPrice = request.EntryPrice;
    trade.ExitPrice = request.ExitPrice;
    trade.PositionSize = request.PositionSize;
    trade.InvestedAmount = request.InvestedAmount;
    trade.Commission = request.Commission;
    trade.ProfitLoss = request.ProfitLoss;
    trade.Status = Enum.Parse<TradeStatus>(request.Status);

    await _context.SaveChangesAsync();

    _logger.LogInformation(
        "Trade updated: {TradeId} ({Symbol}) for User {UserId}",
        trade.Id, trade.Symbol, userId);

    var response = new UpdateTradeResponse(
        trade.Id,
        trade.AccountId,
        trade.StrategyId,
        trade.Type.ToString(),
        trade.Date,
        trade.Symbol,
        trade.EntryPrice,
        trade.ExitPrice,
        trade.PositionSize,
        trade.InvestedAmount,
        trade.Commission,
        trade.ProfitLoss,
        trade.Status.ToString(),
        trade.CreatedAt
    );

    return Ok(response);
  }

  /// <summary>
  /// Permanently delete a trade. The trade must belong to the authenticated user.
  /// </summary>
  /// <response code="204">Trade deleted successfully</response>
  /// <response code="401">User not authenticated</response>
  /// <response code="403">Trade does not belong to authenticated user</response>
  /// <response code="404">Trade not found</response>
  [HttpDelete("{id:guid}")]
  public async Task<IActionResult> Delete(Guid id)
  {
    var userId = GetCurrentUserId();

    var trade = await _context.Trades.FirstOrDefaultAsync(t => t.Id == id);

    if (trade == null)
    {
      return NotFound(new { message = "Trade not found" });
    }

    var accountBelongsToUser = await _context.Accounts
        .AnyAsync(a => a.Id == trade.AccountId && a.UserId == userId);

    if (!accountBelongsToUser)
    {
      return Forbid();
    }

    _context.Trades.Remove(trade);
    await _context.SaveChangesAsync();

    _logger.LogInformation(
        "Trade deleted: {TradeId} ({Symbol}) for User {UserId}",
        trade.Id, trade.Symbol, userId);

    return NoContent();
  }
}
