using System.Security.Claims;
using Invenet.Api.Modules.Shared.Infrastructure.Data;
using Invenet.Api.Modules.Strategies.Domain;
using Invenet.Api.Modules.Strategies.Features.CreateStrategy;
using Invenet.Api.Modules.Strategies.Features.GetStrategy;
using Invenet.Api.Modules.Strategies.Features.ListStrategies;
using Invenet.Api.Modules.Strategies.Features.UpdateStrategy;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace Invenet.Api.Modules.Strategies.API;

/// <summary>
/// Controller for trading strategy management.
/// </summary>
[ApiController]
[Route("api/strategies")]
[Authorize]
public sealed class StrategiesController : ControllerBase
{
  private readonly ModularDbContext _context;
  private readonly ILogger<StrategiesController> _logger;

  public StrategiesController(
      ModularDbContext context,
      ILogger<StrategiesController> logger)
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
  /// List all strategies for the authenticated user.
  /// </summary>
  [HttpGet]
  public async Task<ActionResult<ListStrategiesResponse>> List(
      [FromQuery] bool includeDeleted = false)
  {
    var userId = GetCurrentUserId();

    var query = _context.Strategies.Where(s => s.UserId == userId);

    if (!includeDeleted)
    {
      query = query.Where(s => !s.IsDeleted);
    }

    var strategies = await query
        .OrderBy(s => s.Name)
        .Select(s => new StrategyListItem(
            s.Id,
            s.Name,
            s.Description,
            s.IsDeleted,
            s.CreatedAt,
            s.UpdatedAt
        ))
        .ToListAsync();

    return Ok(new ListStrategiesResponse(strategies, strategies.Count));
  }

  /// <summary>
  /// Get a single strategy by ID.
  /// </summary>
  [HttpGet("{id:guid}")]
  public async Task<ActionResult<GetStrategyResponse>> Get(Guid id)
  {
    var userId = GetCurrentUserId();

    var strategy = await _context.Strategies
        .Where(s => s.Id == id && s.UserId == userId)
        .Select(s => new GetStrategyResponse(
            s.Id,
            s.Name,
            s.Description,
            s.IsDeleted,
            s.CreatedAt,
            s.UpdatedAt
        ))
        .FirstOrDefaultAsync();

    if (strategy == null)
    {
      return NotFound(new { message = "Strategy not found" });
    }

    return Ok(strategy);
  }

  /// <summary>
  /// Create a new strategy.
  /// </summary>
  [HttpPost]
  public async Task<ActionResult<CreateStrategyResponse>> Create(
      [FromBody] CreateStrategyRequest request)
  {
    var userId = GetCurrentUserId();

    // Validate name
    var trimmedName = request.Name?.Trim() ?? string.Empty;
    if (string.IsNullOrWhiteSpace(trimmedName))
    {
      return BadRequest(new { message = "Name is required" });
    }

    if (trimmedName.Length > 200)
    {
      return BadRequest(new { message = "Name must be 200 characters or less" });
    }

    // Validate description length
    var trimmedDescription = request.Description?.Trim();
    if (trimmedDescription != null && trimmedDescription.Length > 2000)
    {
      return BadRequest(new { message = "Description must be 2000 characters or less" });
    }

    // Check for duplicate name
    var exists = await _context.Strategies
        .AnyAsync(s => s.UserId == userId
                    && s.Name == trimmedName
                    && !s.IsDeleted);

    if (exists)
    {
      return Conflict(new
      {
        type = "https://api.invenet.com/errors/duplicate-strategy",
        title = "Duplicate Strategy",
        status = 409,
        detail = $"A strategy with the name '{trimmedName}' already exists for your account"
      });
    }

    var now = DateTime.UtcNow;
    var strategy = new Strategy
    {
      Id = Guid.NewGuid(),
      UserId = userId,
      Name = trimmedName,
      Description = trimmedDescription,
      IsDeleted = false,
      CreatedAt = now,
      UpdatedAt = now
    };

    _context.Strategies.Add(strategy);
    await _context.SaveChangesAsync();

    _logger.LogInformation(
        "Strategy created: {StrategyId} - {StrategyName} for User {UserId}",
        strategy.Id, strategy.Name, userId);

    var response = new CreateStrategyResponse(
        strategy.Id,
        strategy.Name,
        strategy.Description,
        strategy.IsDeleted,
        strategy.CreatedAt,
        strategy.UpdatedAt
    );

    return CreatedAtAction(nameof(Get), new { id = strategy.Id }, response);
  }

  /// <summary>
  /// Update an existing strategy.
  /// </summary>
  [HttpPut("{id:guid}")]
  public async Task<ActionResult<UpdateStrategyResponse>> Update(
      Guid id,
      [FromBody] UpdateStrategyRequest request)
  {
    var userId = GetCurrentUserId();

    var strategy = await _context.Strategies
        .FirstOrDefaultAsync(s => s.Id == id && s.UserId == userId);

    if (strategy == null)
    {
      return NotFound(new { message = "Strategy not found" });
    }

    // Update name if provided
    if (!string.IsNullOrWhiteSpace(request.Name))
    {
      var trimmedName = request.Name.Trim();

      if (trimmedName.Length > 200)
      {
        return BadRequest(new { message = "Name must be 200 characters or less" });
      }

      // Check for duplicate (excluding current strategy)
      var exists = await _context.Strategies
          .AnyAsync(s => s.UserId == userId
                      && s.Name == trimmedName
                      && s.Id != id
                      && !s.IsDeleted);

      if (exists)
      {
        return Conflict(new
        {
          type = "https://api.invenet.com/errors/duplicate-strategy",
          title = "Duplicate Strategy",
          status = 409,
          detail = $"A strategy with the name '{trimmedName}' already exists for your account"
        });
      }

      strategy.Name = trimmedName;
    }

    // Update description (allow clearing by passing empty string)
    if (request.Description != null)
    {
      var trimmedDescription = request.Description.Trim();

      if (trimmedDescription.Length > 2000)
      {
        return BadRequest(new { message = "Description must be 2000 characters or less" });
      }

      strategy.Description = string.IsNullOrWhiteSpace(trimmedDescription) ? null : trimmedDescription;
    }

    strategy.UpdatedAt = DateTime.UtcNow;

    await _context.SaveChangesAsync();

    _logger.LogInformation(
        "Strategy updated: {StrategyId} - {StrategyName} for User {UserId}",
        strategy.Id, strategy.Name, userId);

    var response = new UpdateStrategyResponse(
        strategy.Id,
        strategy.Name,
        strategy.Description,
        strategy.IsDeleted,
        strategy.CreatedAt,
        strategy.UpdatedAt
    );

    return Ok(response);
  }

  /// <summary>
  /// Delete a strategy (soft delete).
  /// </summary>
  [HttpDelete("{id:guid}")]
  public async Task<ActionResult> Delete(Guid id)
  {
    var userId = GetCurrentUserId();

    var strategy = await _context.Strategies
        .FirstOrDefaultAsync(s => s.Id == id && s.UserId == userId);

    if (strategy == null)
    {
      return NotFound(new { message = "Strategy not found" });
    }

    // Soft delete
    strategy.IsDeleted = true;
    strategy.UpdatedAt = DateTime.UtcNow;

    await _context.SaveChangesAsync();

    _logger.LogInformation(
        "Strategy soft-deleted: {StrategyId} - {StrategyName} for User {UserId}",
        strategy.Id, strategy.Name, userId);

    return NoContent();
  }
}
