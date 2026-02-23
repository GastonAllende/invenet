using System.ComponentModel.DataAnnotations;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Security.Cryptography;
using System.Text;
using System.Web;
using Invenet.Api.Modules.Auth.Domain;
using Invenet.Api.Modules.Auth.Features.Common;
using Invenet.Api.Modules.Auth.Features.Login;
using Invenet.Api.Modules.Auth.Features.Register;
using Invenet.Api.Modules.Auth.Infrastructure.Email;
using Invenet.Api.Modules.Shared.Infrastructure.Data;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;

namespace Invenet.Api.Modules.Auth.API;

/// <summary>
/// Controller for authentication and authorization endpoints.
/// </summary>
[ApiController]
[Route("api/auth")]
public sealed class AuthController : ControllerBase
{
  private readonly UserManager<ApplicationUser> _userManager;
  private readonly SignInManager<ApplicationUser> _signInManager;
  private readonly ModularDbContext _dbContext;
  private readonly IConfiguration _configuration;
  private readonly IEmailService _emailService;
  private readonly ILogger<AuthController> _logger;

  public AuthController(
      UserManager<ApplicationUser> userManager,
      SignInManager<ApplicationUser> signInManager,
      ModularDbContext dbContext,
      IConfiguration configuration,
      IEmailService emailService,
      ILogger<AuthController> logger)
  {
    _userManager = userManager;
    _signInManager = signInManager;
    _dbContext = dbContext;
    _configuration = configuration;
    _emailService = emailService;
    _logger = logger;
  }

  [HttpPost("register")]
  [AllowAnonymous]
  public async Task<ActionResult<MessageResponse>> Register(RegisterRequest request)
  {
    var user = new ApplicationUser
    {
      Email = request.Email,
      UserName = request.Username,
      CreatedAt = DateTimeOffset.UtcNow,
      UpdatedAt = DateTimeOffset.UtcNow
    };

    var result = await _userManager.CreateAsync(user, request.Password);
    if (!result.Succeeded)
    {
      return BadRequest(result.Errors);
    }

    // Generate email confirmation token
    var token = await _userManager.GenerateEmailConfirmationTokenAsync(user);
    await SendConfirmationEmailAsync(user, token);

    _logger.LogInformation("User {Email} registered successfully. Confirmation email sent.", user.Email);

    return Ok(new MessageResponse("Registration successful. Please check your email to verify your account."));
  }

  [HttpPost("login")]
  [AllowAnonymous]
  public async Task<ActionResult<AuthResponse>> Login(LoginRequest request)
  {
    var user = await _userManager.FindByEmailAsync(request.Email);
    if (user is null)
    {
      return Unauthorized(new { message = "Invalid email or password." });
    }

    // Check if email is confirmed
    if (!await _userManager.IsEmailConfirmedAsync(user))
    {
      return Unauthorized(new { message = "Please verify your email address before logging in." });
    }

    var valid = await _signInManager.CheckPasswordSignInAsync(user, request.Password, lockoutOnFailure: true);
    if (!valid.Succeeded)
    {
      if (valid.IsLockedOut)
      {
        return Unauthorized(new { message = "Account is locked due to multiple failed login attempts." });
      }
      return Unauthorized(new { message = "Invalid email or password." });
    }

    user.LastLoginAt = DateTimeOffset.UtcNow;
    user.UpdatedAt = DateTimeOffset.UtcNow;
    await _userManager.UpdateAsync(user);

    var (accessToken, expiresAt) = GenerateAccessToken(user);
    var refreshToken = await GenerateAndStoreRefreshTokenAsync(user.Id);

    return Ok(new AuthResponse
    {
      AccessToken = accessToken,
      RefreshToken = refreshToken,
      ExpiresAt = expiresAt
    });
  }

  [HttpPost("confirm-email")]
  [AllowAnonymous]
  public async Task<ActionResult<MessageResponse>> ConfirmEmail([FromBody] ConfirmEmailRequest request)
  {
    if (string.IsNullOrWhiteSpace(request.Email) || string.IsNullOrWhiteSpace(request.Token))
    {
      return BadRequest(new MessageResponse("Invalid confirmation link."));
    }

    var user = await _userManager.FindByEmailAsync(request.Email);
    if (user is null)
    {
      return BadRequest(new MessageResponse("Invalid confirmation link."));
    }

    var result = await _userManager.ConfirmEmailAsync(user, request.Token);
    if (!result.Succeeded)
    {
      return BadRequest(new MessageResponse("Email confirmation failed."));
    }

    _logger.LogInformation("User {Email} confirmed their email.", user.Email);

    return Ok(new MessageResponse("Email confirmed successfully. You can now log in."));
  }

  [HttpPost("resend-confirmation")]
  [AllowAnonymous]
  public async Task<ActionResult<MessageResponse>> ResendConfirmation([FromBody] ResendConfirmationRequest request)
  {
    var user = await _userManager.FindByEmailAsync(request.Email);
    if (user is null)
    {
      // Don't reveal that the user doesn't exist
      return Ok(new MessageResponse("If the email exists, a confirmation link has been sent."));
    }

    if (await _userManager.IsEmailConfirmedAsync(user))
    {
      return BadRequest(new MessageResponse("Email is already confirmed."));
    }

    var token = await _userManager.GenerateEmailConfirmationTokenAsync(user);
    await SendConfirmationEmailAsync(user, token);

    return Ok(new MessageResponse("If the email exists, a confirmation link has been sent."));
  }

  [HttpPost("forgot-password")]
  [AllowAnonymous]
  public async Task<ActionResult<MessageResponse>> ForgotPassword([FromBody] ForgotPasswordRequest request)
  {
    var user = await _userManager.FindByEmailAsync(request.Email);
    if (user is null || !await _userManager.IsEmailConfirmedAsync(user))
    {
      // Don't reveal that the user doesn't exist or is not confirmed
      return Ok(new MessageResponse("If the email exists, a password reset link has been sent."));
    }

    var token = await _userManager.GeneratePasswordResetTokenAsync(user);
    await SendPasswordResetEmailAsync(user, token);

    return Ok(new MessageResponse("If the email exists, a password reset link has been sent."));
  }

  [HttpPost("reset-password")]
  [AllowAnonymous]
  public async Task<ActionResult<MessageResponse>> ResetPassword([FromBody] ResetPasswordRequest request)
  {
    var user = await _userManager.FindByEmailAsync(request.Email);
    if (user is null)
    {
      return BadRequest(new MessageResponse("Invalid reset link."));
    }

    var result = await _userManager.ResetPasswordAsync(user, request.Token, request.NewPassword);
    if (!result.Succeeded)
    {
      return BadRequest(result.Errors);
    }

    _logger.LogInformation("User {Email} reset their password.", user.Email);

    return Ok(new MessageResponse("Password reset successfully."));
  }

  [HttpPost("refresh")]
  [AllowAnonymous]
  public async Task<ActionResult<AuthResponse>> Refresh([FromBody] RefreshTokenRequest request)
  {
    var storedToken = await _dbContext.Set<RefreshToken>()
        .Include(rt => rt.User)
        .FirstOrDefaultAsync(rt => rt.Token == request.RefreshToken);

    if (storedToken is null || !storedToken.IsActive)
    {
      return Unauthorized(new { message = "Invalid or expired refresh token." });
    }

    // Revoke the used refresh token and its family
    await RevokeTokenFamilyAsync(storedToken.TokenFamily ?? Guid.NewGuid());

    var (accessToken, expiresAt) = GenerateAccessToken(storedToken.User);
    var newRefreshToken = await GenerateAndStoreRefreshTokenAsync(storedToken.UserId, storedToken.TokenFamily);

    return Ok(new AuthResponse
    {
      AccessToken = accessToken,
      RefreshToken = newRefreshToken,
      ExpiresAt = expiresAt
    });
  }

  [HttpPost("logout")]
  [Authorize]
  public async Task<ActionResult<MessageResponse>> Logout()
  {
    var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
    if (string.IsNullOrWhiteSpace(userId) || !Guid.TryParse(userId, out var userGuid))
    {
      return Unauthorized();
    }

    // Revoke all refresh tokens for the user
    var tokens = await _dbContext.Set<RefreshToken>()
        .Where(rt => rt.UserId == userGuid && !rt.IsRevoked)
        .ToListAsync();

    foreach (var token in tokens)
    {
      token.IsRevoked = true;
      token.RevokedAt = DateTimeOffset.UtcNow;
    }

    await _dbContext.SaveChangesAsync();

    return Ok(new MessageResponse("Logged out successfully."));
  }

  private (string token, DateTimeOffset expiresAt) GenerateAccessToken(ApplicationUser user)
  {
    var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_configuration["Jwt:Key"]!));
    var credentials = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);
    var expiresAt = DateTimeOffset.UtcNow.AddMinutes(Convert.ToDouble(_configuration["Jwt:AccessTokenMinutes"]));

    var claims = new[]
    {
            new Claim(ClaimTypes.NameIdentifier, user.Id.ToString()),
            new Claim(ClaimTypes.Name, user.UserName!),
            new Claim(ClaimTypes.Email, user.Email!),
            new Claim(JwtRegisteredClaimNames.Jti, Guid.NewGuid().ToString())
        };

    var token = new JwtSecurityToken(
        issuer: _configuration["Jwt:Issuer"],
        audience: _configuration["Jwt:Audience"],
        claims: claims,
        expires: expiresAt.UtcDateTime,
        signingCredentials: credentials
    );

    return (new JwtSecurityTokenHandler().WriteToken(token), expiresAt);
  }

  private async Task<string> GenerateAndStoreRefreshTokenAsync(Guid userId, Guid? tokenFamily = null)
  {
    var tokenBytes = new byte[64];
    using var rng = RandomNumberGenerator.Create();
    rng.GetBytes(tokenBytes);
    var token = Convert.ToBase64String(tokenBytes);

    var refreshToken = new RefreshToken
    {
      Token = token,
      UserId = userId,
      ExpiresAt = DateTimeOffset.UtcNow.AddDays(Convert.ToDouble(_configuration["Jwt:RefreshTokenDays"])),
      TokenFamily = tokenFamily ?? Guid.NewGuid(),
      CreatedAt = DateTimeOffset.UtcNow,
      UpdatedAt = DateTimeOffset.UtcNow
    };

    _dbContext.Set<RefreshToken>().Add(refreshToken);
    await _dbContext.SaveChangesAsync();

    return token;
  }

  private async Task RevokeTokenFamilyAsync(Guid tokenFamily)
  {
    var tokens = await _dbContext.Set<RefreshToken>()
        .Where(rt => rt.TokenFamily == tokenFamily && !rt.IsRevoked)
        .ToListAsync();

    foreach (var token in tokens)
    {
      token.IsRevoked = true;
      token.RevokedAt = DateTimeOffset.UtcNow;
    }

    await _dbContext.SaveChangesAsync();
  }

  private async Task SendConfirmationEmailAsync(ApplicationUser user, string token)
  {
    var encodedToken = HttpUtility.UrlEncode(token);
    var confirmationLink = $"{_configuration["Frontend:Url"]}/verify-email?email={user.Email}&token={encodedToken}";
    await _emailService.SendEmailConfirmationAsync(user.Email!, confirmationLink);
  }

  private async Task SendPasswordResetEmailAsync(ApplicationUser user, string token)
  {
    var encodedToken = HttpUtility.UrlEncode(token);
    var resetLink = $"{_configuration["Frontend:Url"]}/reset-password?email={user.Email}&token={encodedToken}";
    await _emailService.SendPasswordResetEmailAsync(user.Email!, resetLink);
  }
}

public sealed record ResendConfirmationRequest([Required, EmailAddress] string Email);
public sealed record ConfirmEmailRequest([Required, EmailAddress] string Email, [Required] string Token);
public sealed record ForgotPasswordRequest([Required, EmailAddress] string Email);
public sealed record ResetPasswordRequest(
    [Required, EmailAddress] string Email,
    [Required] string Token,
    [Required, MinLength(10)] string NewPassword);
public sealed record RefreshTokenRequest([Required] string RefreshToken);
