using System.Security.Claims;
using Invenet.Api.Modules.Shared.Infrastructure.Data;
using Invenet.Api.Modules.Trades.Features.ListTrades;
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
  /// <response code="401">User not authenticated</response>
  [HttpGet]
  public async Task<ActionResult<ListTradesResponse>> GetTrades()
  {
    var userId = GetCurrentUserId();

    // Collect all account IDs owned by this user
    var userAccountIds = await _context.Accounts
        .Where(a => a.UserId == userId)
        .Select(a => a.Id)
        .ToListAsync();

    // Query trades filtered to user's accounts
    var trades = await _context.Trades
        .Where(t => userAccountIds.Contains(t.AccountId))
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
}
