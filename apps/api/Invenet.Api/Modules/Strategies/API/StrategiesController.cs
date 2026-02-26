using System.Data;
using System.Security.Claims;
using Invenet.Api.Modules.Shared.Infrastructure.Data;
using Invenet.Api.Modules.Strategies.Domain;
using Invenet.Api.Modules.Strategies.Features.CreateStrategy;
using Invenet.Api.Modules.Strategies.Features.CreateStrategyVersion;
using Invenet.Api.Modules.Strategies.Features.GetStrategy;
using Invenet.Api.Modules.Strategies.Features.ListStrategies;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace Invenet.Api.Modules.Strategies.API;

[ApiController]
[Route("api/strategies")]
[Authorize]
public sealed class StrategiesController : ControllerBase
{
  private readonly ModularDbContext _context;
  private readonly ILogger<StrategiesController> _logger;

  public StrategiesController(ModularDbContext context, ILogger<StrategiesController> logger)
  {
    _context = context;
    _logger = logger;
  }

  private bool TryGetCurrentUserId(out Guid userId)
  {
    userId = Guid.Empty;
    var userIdString = User.FindFirstValue(ClaimTypes.NameIdentifier);
    if (string.IsNullOrEmpty(userIdString) || !Guid.TryParse(userIdString, out var parsedUserId))
    {
      return false;
    }

    userId = parsedUserId;
    return true;
  }

  [HttpGet]
  public async Task<ActionResult<ListStrategiesResponse>> List([FromQuery] bool includeArchived = true)
  {
    if (!TryGetCurrentUserId(out var userId))
    {
      return Unauthorized(new { message = "Invalid or missing user claim" });
    }

    var query = _context.Strategies.AsNoTracking().Where(s => s.UserId == userId);
    if (!includeArchived)
    {
      query = query.Where(s => !s.IsArchived);
    }

    var strategies = await query
        .OrderBy(s => s.Name)
        .Select(s => new StrategyListItem(
            s.Id,
            s.Name,
            s.Market,
            s.DefaultTimeframe,
            s.IsArchived,
            s.CreatedAt,
            s.UpdatedAt,
            _context.StrategyVersions
                .Where(v => v.StrategyId == s.Id)
                .OrderByDescending(v => v.VersionNumber)
                .Select(v => new CurrentVersionSummary(v.Id, v.VersionNumber, v.CreatedAt, v.Timeframe))
                .FirstOrDefault()
        ))
        .ToListAsync();

    return Ok(new ListStrategiesResponse(strategies, strategies.Count));
  }

  [HttpGet("{id:guid}")]
  public async Task<ActionResult<GetStrategyResponse>> Get(Guid id, [FromQuery] int? version = null)
  {
    if (!TryGetCurrentUserId(out var userId))
    {
      return Unauthorized(new { message = "Invalid or missing user claim" });
    }

    var strategy = await _context.Strategies
        .AsNoTracking()
        .Where(s => s.Id == id && s.UserId == userId)
        .Select(s => new
        {
          s.Id,
          s.Name,
          s.Market,
          s.DefaultTimeframe,
          s.IsArchived,
          s.CreatedAt,
          s.UpdatedAt,
          Versions = s.Versions
              .OrderByDescending(v => v.VersionNumber)
              .Select(v => new StrategyVersionHistoryItem(v.Id, v.VersionNumber, v.CreatedAt, v.CreatedByUserId))
              .ToList(),
        })
        .FirstOrDefaultAsync();

    if (strategy == null)
    {
      return NotFound(new { message = "Strategy not found" });
    }

    StrategyVersionDetail? currentVersion;
    if (version.HasValue)
    {
      currentVersion = await _context.StrategyVersions
          .AsNoTracking()
          .Where(v => v.StrategyId == id && v.VersionNumber == version.Value)
          .Select(v => new StrategyVersionDetail(
              v.Id,
              v.VersionNumber,
              v.Timeframe,
              v.EntryRules,
              v.ExitRules,
              v.RiskRules,
              v.Notes,
              v.CreatedAt,
              v.CreatedByUserId
          ))
          .FirstOrDefaultAsync();
    }
    else
    {
      currentVersion = await _context.StrategyVersions
          .AsNoTracking()
          .Where(v => v.StrategyId == id)
          .OrderByDescending(v => v.VersionNumber)
          .Select(v => new StrategyVersionDetail(
              v.Id,
              v.VersionNumber,
              v.Timeframe,
              v.EntryRules,
              v.ExitRules,
              v.RiskRules,
              v.Notes,
              v.CreatedAt,
              v.CreatedByUserId
          ))
          .FirstOrDefaultAsync();
    }

    var response = new GetStrategyResponse(
        strategy.Id,
        strategy.Name,
        strategy.Market,
        strategy.DefaultTimeframe,
        strategy.IsArchived,
        strategy.CreatedAt,
        strategy.UpdatedAt,
        currentVersion,
        strategy.Versions
    );

    return Ok(response);
  }

  [HttpPost]
  public async Task<ActionResult<CreateStrategyResponse>> Create([FromBody] CreateStrategyRequest request)
  {
    if (!TryGetCurrentUserId(out var userId))
    {
      return Unauthorized(new { message = "Invalid or missing user claim" });
    }

    var trimmedName = request.Name?.Trim() ?? string.Empty;
    if (string.IsNullOrWhiteSpace(trimmedName))
    {
      return BadRequest(new { message = "Name is required" });
    }

    if (trimmedName.Length > 200)
    {
      return BadRequest(new { message = "Name must be 200 characters or less" });
    }

    if (string.IsNullOrWhiteSpace(request.EntryRules) || string.IsNullOrWhiteSpace(request.ExitRules) || string.IsNullOrWhiteSpace(request.RiskRules))
    {
      return BadRequest(new { message = "EntryRules, ExitRules and RiskRules are required" });
    }

    var exists = await _context.Strategies
        .AnyAsync(s => s.UserId == userId && s.Name == trimmedName);

    if (exists)
    {
      return Conflict(new
      {
        type = "https://api.invenet.com/errors/duplicate-strategy",
        title = "Duplicate Strategy",
        status = 409,
        detail = $"A strategy with the name '{trimmedName}' already exists"
      });
    }

    var executionStrategy = _context.Database.CreateExecutionStrategy();
    Strategy? strategy = null;
    StrategyVersion? version = null;

    await executionStrategy.ExecuteAsync(async () =>
    {
      await using var tx = await _context.Database.BeginTransactionAsync();

      var now = DateTime.UtcNow;
      strategy = new Strategy
      {
        Id = Guid.NewGuid(),
        UserId = userId,
        Name = trimmedName,
        Market = request.Market?.Trim(),
        DefaultTimeframe = request.DefaultTimeframe?.Trim(),
        IsArchived = false,
        CreatedAt = now,
        UpdatedAt = now,
      };

      version = new StrategyVersion
      {
        Id = Guid.NewGuid(),
        StrategyId = strategy.Id,
        VersionNumber = 1,
        Timeframe = request.Timeframe?.Trim(),
        EntryRules = request.EntryRules.Trim(),
        ExitRules = request.ExitRules.Trim(),
        RiskRules = request.RiskRules.Trim(),
        Notes = request.Notes?.Trim(),
        CreatedAt = now,
        CreatedByUserId = userId,
      };

      _context.Strategies.Add(strategy);
      _context.StrategyVersions.Add(version);
      await _context.SaveChangesAsync();
      await tx.CommitAsync();
    });

    if (strategy == null || version == null)
    {
      return StatusCode(500, new { message = "Failed to create strategy" });
    }

    return CreatedAtAction(
        nameof(Get),
        new { id = strategy.Id },
        new CreateStrategyResponse(
            strategy.Id,
            strategy.Name,
            strategy.Market,
            strategy.DefaultTimeframe,
            strategy.IsArchived,
            strategy.CreatedAt,
            strategy.UpdatedAt,
            version.Id,
            version.VersionNumber
        )
    );
  }

  [HttpPost("{id:guid}/versions")]
  public async Task<ActionResult<CreateStrategyVersionResponse>> CreateVersion(Guid id, [FromBody] CreateStrategyVersionRequest request)
  {
    if (!TryGetCurrentUserId(out var userId))
    {
      return Unauthorized(new { message = "Invalid or missing user claim" });
    }

    if (string.IsNullOrWhiteSpace(request.EntryRules) || string.IsNullOrWhiteSpace(request.ExitRules) || string.IsNullOrWhiteSpace(request.RiskRules))
    {
      return BadRequest(new { message = "EntryRules, ExitRules and RiskRules are required" });
    }

    var executionStrategy = _context.Database.CreateExecutionStrategy();
    StrategyVersion? newVersion = null;
    ActionResult? failureResult = null;

    await executionStrategy.ExecuteAsync(async () =>
    {
      await using var tx = await _context.Database.BeginTransactionAsync(IsolationLevel.Serializable);

      var strategy = await _context.Strategies.FirstOrDefaultAsync(s => s.Id == id && s.UserId == userId);
      if (strategy == null)
      {
        failureResult = NotFound(new { message = "Strategy not found" });
        return;
      }

      if (strategy.IsArchived)
      {
        failureResult = BadRequest(new { message = "Archived strategies cannot receive new versions" });
        return;
      }

      var latestVersionNumber = await _context.StrategyVersions
          .Where(v => v.StrategyId == id)
          .Select(v => (int?)v.VersionNumber)
          .MaxAsync() ?? 0;

      var now = DateTime.UtcNow;
      newVersion = new StrategyVersion
      {
        Id = Guid.NewGuid(),
        StrategyId = id,
        VersionNumber = latestVersionNumber + 1,
        Timeframe = request.Timeframe?.Trim(),
        EntryRules = request.EntryRules.Trim(),
        ExitRules = request.ExitRules.Trim(),
        RiskRules = request.RiskRules.Trim(),
        Notes = request.Notes?.Trim(),
        CreatedAt = now,
        CreatedByUserId = userId,
      };

      strategy.UpdatedAt = now;
      _context.StrategyVersions.Add(newVersion);

      await _context.SaveChangesAsync();
      await tx.CommitAsync();
    });

    if (failureResult != null)
    {
      return failureResult;
    }

    if (newVersion == null)
    {
      return StatusCode(500, new { message = "Failed to create strategy version" });
    }

    return Ok(new CreateStrategyVersionResponse(
        newVersion.Id,
        newVersion.VersionNumber,
        newVersion.CreatedAt,
        newVersion.CreatedByUserId,
        newVersion.Timeframe,
        newVersion.EntryRules,
        newVersion.ExitRules,
        newVersion.RiskRules,
        newVersion.Notes
    ));
  }

  [HttpPost("{id:guid}/archive")]
  public async Task<ActionResult> Archive(Guid id)
  {
    if (!TryGetCurrentUserId(out var userId))
    {
      return Unauthorized(new { message = "Invalid or missing user claim" });
    }
    var strategy = await _context.Strategies.FirstOrDefaultAsync(s => s.Id == id && s.UserId == userId);

    if (strategy == null)
    {
      return NotFound(new { message = "Strategy not found" });
    }

    strategy.IsArchived = true;
    strategy.UpdatedAt = DateTime.UtcNow;
    await _context.SaveChangesAsync();

    return NoContent();
  }

  [HttpPost("{id:guid}/unarchive")]
  public async Task<ActionResult> Unarchive(Guid id)
  {
    if (!TryGetCurrentUserId(out var userId))
    {
      return Unauthorized(new { message = "Invalid or missing user claim" });
    }
    var strategy = await _context.Strategies.FirstOrDefaultAsync(s => s.Id == id && s.UserId == userId);

    if (strategy == null)
    {
      return NotFound(new { message = "Strategy not found" });
    }

    strategy.IsArchived = false;
    strategy.UpdatedAt = DateTime.UtcNow;
    await _context.SaveChangesAsync();

    return NoContent();
  }
}
