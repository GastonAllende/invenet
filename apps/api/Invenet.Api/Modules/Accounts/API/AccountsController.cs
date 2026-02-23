using System.Security.Claims;
using Invenet.Api.Modules.Accounts.Domain;
using Invenet.Api.Modules.Accounts.Features.CreateAccount;
using Invenet.Api.Modules.Accounts.Features.GetAccount;
using Invenet.Api.Modules.Accounts.Features.ListAccounts;
using Invenet.Api.Modules.Accounts.Features.UpdateAccount;
using Invenet.Api.Modules.Shared.Infrastructure.Data;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace Invenet.Api.Modules.Accounts.API;

/// <summary>
/// Controller for brokerage account management.
/// </summary>
[ApiController]
[Route("api/accounts")]
[Authorize]
public sealed class AccountsController : ControllerBase
{
  private readonly ModularDbContext _context;
  private readonly ILogger<AccountsController> _logger;

  public AccountsController(
      ModularDbContext context,
      ILogger<AccountsController> logger)
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
  /// Create a new brokerage account.
  /// </summary>
  /// <param name="request">Account creation details including risk settings</param>
  /// <returns>Created account with risk settings and unique ID</returns>
  /// <response code="201">Account created successfully</response>
  /// <response code="400">Invalid request data or duplicate account name</response>
  /// <response code="401">User not authenticated</response>
  [HttpPost]
  public async Task<ActionResult<CreateAccountResponse>> Create(
      [FromBody] CreateAccountRequest request)
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

    // Validate broker
    var trimmedBroker = request.Broker?.Trim() ?? string.Empty;
    if (string.IsNullOrWhiteSpace(trimmedBroker))
    {
      return BadRequest(new { message = "Broker is required" });
    }

    if (trimmedBroker.Length > 100)
    {
      return BadRequest(new { message = "Broker must be 100 characters or less" });
    }

    // Validate account type
    var validAccountTypes = new[] { "Cash", "Margin", "Prop", "Demo" };
    if (!validAccountTypes.Contains(request.AccountType))
    {
      return BadRequest(new
      {
        message = $"AccountType must be one of: {string.Join(", ", validAccountTypes)}"
      });
    }

    // Validate base currency
    var trimmedCurrency = request.BaseCurrency?.Trim()?.ToUpper() ?? string.Empty;
    if (string.IsNullOrWhiteSpace(trimmedCurrency) || trimmedCurrency.Length != 3)
    {
      return BadRequest(new { message = "BaseCurrency must be a 3-character currency code" });
    }

    // Validate starting balance
    if (request.StartingBalance < 0.01m)
    {
      return BadRequest(new { message = "StartingBalance must be at least 0.01" });
    }

    // Validate timezone
    var timezone = request.Timezone?.Trim() ?? "Europe/Stockholm";
    if (timezone.Length > 50)
    {
      return BadRequest(new { message = "Timezone must be 50 characters or less" });
    }

    // Validate risk settings if provided
    if (request.RiskSettings != null)
    {
      var rs = request.RiskSettings;
      if (rs.RiskPerTradePct < 0 || rs.RiskPerTradePct > 100)
      {
        return BadRequest(new { message = "RiskPerTradePct must be between 0 and 100" });
      }

      if (rs.MaxDailyLossPct < 0 || rs.MaxDailyLossPct > 100)
      {
        return BadRequest(new { message = "MaxDailyLossPct must be between 0 and 100" });
      }

      if (rs.MaxWeeklyLossPct < 0 || rs.MaxWeeklyLossPct > 100)
      {
        return BadRequest(new { message = "MaxWeeklyLossPct must be between 0 and 100" });
      }
    }

    // Check for duplicate name
    var exists = await _context.Accounts
        .AnyAsync(a => a.UserId == userId
                    && a.Name == trimmedName
                    && a.IsActive);

    if (exists)
    {
      return Conflict(new
      {
        type = "https://api.invenet.com/errors/duplicate-account",
        title = "Duplicate Account",
        status = 409,
        detail = $"An account with the name '{trimmedName}' already exists"
      });
    }

    var now = DateTime.UtcNow;
    var account = new Account
    {
      Id = Guid.NewGuid(),
      UserId = userId,
      Name = trimmedName,
      Broker = trimmedBroker,
      AccountType = request.AccountType,
      BaseCurrency = trimmedCurrency,
      StartDate = request.StartDate,
      StartingBalance = request.StartingBalance,
      Timezone = timezone,
      Notes = request.Notes?.Trim(),
      IsActive = request.IsActive,
      CreatedAt = now,
      UpdatedAt = now
    };

    _context.Accounts.Add(account);

    // Create risk settings if provided
    AccountRiskSettings? riskSettings = null;
    if (request.RiskSettings != null)
    {
      riskSettings = new AccountRiskSettings
      {
        Id = Guid.NewGuid(),
        AccountId = account.Id,
        RiskPerTradePct = request.RiskSettings.RiskPerTradePct,
        MaxDailyLossPct = request.RiskSettings.MaxDailyLossPct,
        MaxWeeklyLossPct = request.RiskSettings.MaxWeeklyLossPct,
        EnforceLimits = request.RiskSettings.EnforceLimits
      };

      _context.AccountRiskSettings.Add(riskSettings);
    }

    await _context.SaveChangesAsync();

    _logger.LogInformation(
        "Account created: {AccountId} - {AccountName} for User {UserId}",
        account.Id, account.Name, userId);

    var response = new CreateAccountResponse(
        account.Id,
        account.Name,
        account.Broker,
        account.AccountType,
        account.BaseCurrency,
        account.StartDate,
        account.StartingBalance,
        account.Timezone,
        account.Notes,
        account.IsActive,
        account.CreatedAt,
        account.UpdatedAt,
        riskSettings != null
            ? new AccountRiskSettingsResponse(
                riskSettings.Id,
                riskSettings.AccountId,
                riskSettings.RiskPerTradePct,
                riskSettings.MaxDailyLossPct,
                riskSettings.MaxWeeklyLossPct,
                riskSettings.EnforceLimits)
            : null
    );

    return CreatedAtAction(nameof(Get), new { id = account.Id }, response);
  }

  /// <summary>
  /// List all accounts for the authenticated user.
  /// </summary>
  /// <param name="includeArchived">Whether to include archived accounts (IsActive=false)</param>
  /// <returns>List of accounts with risk settings</returns>
  /// <response code="200">Accounts retrieved successfully</response>
  /// <response code="401">User not authenticated</response>
  [HttpGet]
  public async Task<ActionResult<ListAccountsResponse>> List(
      [FromQuery] bool includeArchived = false)
  {
    var userId = GetCurrentUserId();

    var query = _context.Accounts
        .Include(a => a.RiskSettings)
        .Where(a => a.UserId == userId);

    if (!includeArchived)
    {
      query = query.Where(a => a.IsActive);
    }

    var accounts = await query
        .OrderBy(a => a.Name)
        .Select(a => new AccountListItem(
            a.Id,
            a.Name,
            a.Broker,
            a.AccountType,
            a.BaseCurrency,
            a.StartDate,
            a.StartingBalance,
            a.Timezone,
            a.IsActive,
            a.CreatedAt,
            a.RiskSettings != null
                ? new RiskSettingsListItem(
                    a.RiskSettings.RiskPerTradePct,
                    a.RiskSettings.MaxDailyLossPct,
                    a.RiskSettings.MaxWeeklyLossPct,
                    a.RiskSettings.EnforceLimits)
                : null
        ))
        .ToListAsync();

    return Ok(new ListAccountsResponse(accounts, accounts.Count));
  }

  /// <summary>
  /// Get a single account by ID.
  /// </summary>
  /// <param name="id">Account unique identifier</param>
  /// <returns>Account details with risk settings</returns>
  /// <response code="200">Account found and returned</response>
  /// <response code="401">User not authenticated</response>
  /// <response code="404">Account not found or does not belong to user</response>
  [HttpGet("{id:guid}")]
  public async Task<ActionResult<GetAccountResponse>> Get(Guid id)
  {
    var userId = GetCurrentUserId();

    var account = await _context.Accounts
        .Include(a => a.RiskSettings)
        .Where(a => a.Id == id && a.UserId == userId)
        .Select(a => new GetAccountResponse(
            a.Id,
            a.Name,
            a.Broker,
            a.AccountType,
            a.BaseCurrency,
            a.StartDate,
            a.StartingBalance,
            a.Timezone,
            a.Notes,
            a.IsActive,
            a.CreatedAt,
            a.UpdatedAt,
            a.RiskSettings != null
                ? new AccountRiskSettingsResponse(
                    a.RiskSettings.Id,
                    a.RiskSettings.AccountId,
                    a.RiskSettings.RiskPerTradePct,
                    a.RiskSettings.MaxDailyLossPct,
                    a.RiskSettings.MaxWeeklyLossPct,
                    a.RiskSettings.EnforceLimits)
                : null
        ))
        .FirstOrDefaultAsync();

    if (account == null)
    {
      return NotFound(new { message = "Account not found" });
    }

    return Ok(account);
  }

  /// <summary>
  /// Update an existing account.
  /// </summary>
  /// <param name="id">Account unique identifier</param>
  /// <param name="request">Updated account data (excludes immutable fields: UserId, StartDate, StartingBalance)</param>
  /// <returns>Updated account with risk settings</returns>
  /// <response code="200">Account updated successfully</response>
  /// <response code="400">Invalid request data or duplicate account name</response>
  /// <response code="401">User not authenticated</response>
  /// <response code="404">Account not found or does not belong to user</response>
  [HttpPut("{id:guid}")]
  public async Task<ActionResult<UpdateAccountResponse>> Update(
      Guid id,
      [FromBody] UpdateAccountRequest request)
  {
    var userId = GetCurrentUserId();

    // Find existing account
    var account = await _context.Accounts
        .Include(a => a.RiskSettings)
        .FirstOrDefaultAsync(a => a.Id == id && a.UserId == userId);

    if (account == null)
    {
      return NotFound(new { message = "Account not found" });
    }

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

    // Validate broker
    var trimmedBroker = request.Broker?.Trim() ?? string.Empty;
    if (string.IsNullOrWhiteSpace(trimmedBroker))
    {
      return BadRequest(new { message = "Broker is required" });
    }

    if (trimmedBroker.Length > 100)
    {
      return BadRequest(new { message = "Broker must be 100 characters or less" });
    }

    // Validate account type
    var validAccountTypes = new[] { "Cash", "Margin", "Prop", "Demo" };
    if (!validAccountTypes.Contains(request.AccountType))
    {
      return BadRequest(new
      {
        message = $"AccountType must be one of: {string.Join(", ", validAccountTypes)}"
      });
    }

    // Validate base currency
    var trimmedCurrency = request.BaseCurrency?.Trim()?.ToUpper() ?? string.Empty;
    if (string.IsNullOrWhiteSpace(trimmedCurrency) || trimmedCurrency.Length != 3)
    {
      return BadRequest(new { message = "BaseCurrency must be a 3-character currency code" });
    }

    // Validate timezone
    var timezone = request.Timezone?.Trim() ?? "Europe/Stockholm";
    if (timezone.Length > 50)
    {
      return BadRequest(new { message = "Timezone must be 50 characters or less" });
    }

    // Validate risk settings if provided
    if (request.RiskSettings != null)
    {
      var rs = request.RiskSettings;
      if (rs.RiskPerTradePct < 0 || rs.RiskPerTradePct > 100)
      {
        return BadRequest(new { message = "RiskPerTradePct must be between 0 and 100" });
      }

      if (rs.MaxDailyLossPct < 0 || rs.MaxDailyLossPct > 100)
      {
        return BadRequest(new { message = "MaxDailyLossPct must be between 0 and 100" });
      }

      if (rs.MaxWeeklyLossPct < 0 || rs.MaxWeeklyLossPct > 100)
      {
        return BadRequest(new { message = "MaxWeeklyLossPct must be between 0 and 100" });
      }
    }

    // Check for duplicate name (exclude current account)
    var exists = await _context.Accounts
        .AnyAsync(a => a.UserId == userId
                    && a.Name == trimmedName
                    && a.Id != id
                    && a.IsActive);

    if (exists)
    {
      return Conflict(new
      {
        type = "https://api.invenet.com/errors/duplicate-account",
        title = "Duplicate Account",
        status = 409,
        detail = $"An account with the name '{trimmedName}' already exists"
      });
    }

    // Update allowed fields (UserId, StartDate, StartingBalance are immutable)
    account.Name = trimmedName;
    account.Broker = trimmedBroker;
    account.AccountType = request.AccountType;
    account.BaseCurrency = trimmedCurrency;
    account.Timezone = timezone;
    account.Notes = request.Notes?.Trim();
    account.UpdatedAt = DateTime.UtcNow;

    // Update or create risk settings
    if (request.RiskSettings != null)
    {
      if (account.RiskSettings != null)
      {
        // Update existing
        account.RiskSettings.RiskPerTradePct = request.RiskSettings.RiskPerTradePct;
        account.RiskSettings.MaxDailyLossPct = request.RiskSettings.MaxDailyLossPct;
        account.RiskSettings.MaxWeeklyLossPct = request.RiskSettings.MaxWeeklyLossPct;
        account.RiskSettings.EnforceLimits = request.RiskSettings.EnforceLimits;
      }
      else
      {
        // Create new
        account.RiskSettings = new AccountRiskSettings
        {
          Id = Guid.NewGuid(),
          AccountId = account.Id,
          RiskPerTradePct = request.RiskSettings.RiskPerTradePct,
          MaxDailyLossPct = request.RiskSettings.MaxDailyLossPct,
          MaxWeeklyLossPct = request.RiskSettings.MaxWeeklyLossPct,
          EnforceLimits = request.RiskSettings.EnforceLimits
        };
        _context.AccountRiskSettings.Add(account.RiskSettings);
      }
    }

    await _context.SaveChangesAsync();

    _logger.LogInformation(
        "Account updated: {AccountId} - {AccountName} for User {UserId}",
        account.Id, account.Name, userId);

    var response = new UpdateAccountResponse(
        account.Id,
        account.Name,
        account.Broker,
        account.AccountType,
        account.BaseCurrency,
        account.StartDate,
        account.StartingBalance,
        account.Timezone,
        account.Notes,
        account.IsActive,
        account.CreatedAt,
        account.UpdatedAt,
        account.RiskSettings != null
            ? new AccountRiskSettingsResponse(
                account.RiskSettings.Id,
                account.RiskSettings.AccountId,
                account.RiskSettings.RiskPerTradePct,
                account.RiskSettings.MaxDailyLossPct,
                account.RiskSettings.MaxWeeklyLossPct,
                account.RiskSettings.EnforceLimits)
            : null
    );

    return Ok(response);
  }

  /// <summary>
  /// Delete a brokerage account (hard delete).
  /// </summary>
  /// <param name="id">Account ID to delete</param>
  /// <returns>No content on success</returns>
  /// <response code="204">Account deleted successfully</response>
  /// <response code="404">Account not found</response>
  /// <response code="401">User not authenticated</response>
  [HttpDelete("{id:guid}")]
  public async Task<ActionResult> Delete(Guid id)
  {
    var userId = GetCurrentUserId();

    var account = await _context.Accounts
        .Include(a => a.RiskSettings)
        .FirstOrDefaultAsync(a => a.Id == id && a.UserId == userId);

    if (account == null)
    {
      return NotFound(new { message = "Account not found" });
    }

    // Remove risk settings first (cascade delete)
    if (account.RiskSettings != null)
    {
      _context.AccountRiskSettings.Remove(account.RiskSettings);
    }

    // Remove account
    _context.Accounts.Remove(account);

    await _context.SaveChangesAsync();

    _logger.LogInformation(
        "Account deleted: {AccountId} - {AccountName} for User {UserId}",
        account.Id, account.Name, userId);

    return NoContent();
  }
}
