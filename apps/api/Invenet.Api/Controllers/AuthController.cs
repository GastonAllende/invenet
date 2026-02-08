using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Security.Cryptography;
using System.Text;
using System.Web;
using Invenet.Api.Data;
using Invenet.Api.Models;
using Invenet.Api.Models.Auth;
using Invenet.Api.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;

namespace Invenet.Api.Controllers;

[ApiController]
[Route("api/auth")]
public sealed class AuthController : ControllerBase
{
    private readonly UserManager<ApplicationUser> _userManager;
    private readonly SignInManager<ApplicationUser> _signInManager;
    private readonly AppDbContext _dbContext;
    private readonly IConfiguration _configuration;
    private readonly IEmailService _emailService;
    private readonly ILogger<AuthController> _logger;

    public AuthController(
        UserManager<ApplicationUser> userManager,
        SignInManager<ApplicationUser> signInManager,
        AppDbContext dbContext,
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

        var response = await IssueTokensAsync(user, request.RememberMe);
        return Ok(response);
    }

    [HttpPost("logout")]
    [Authorize]
    public async Task<IActionResult> Logout(LogoutRequest request)
    {
        var tokenHash = HashToken(request.RefreshToken);
        var refreshToken = await _dbContext.RefreshTokens
            .FirstOrDefaultAsync(token => token.TokenHash == tokenHash);

        if (refreshToken is null)
        {
            return NoContent();
        }

        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (userId is null || refreshToken.UserId.ToString() != userId)
        {
            return Forbid();
        }

        if (refreshToken.RevokedAt is not null)
        {
            return Ok();
        }

        refreshToken.RevokedAt = DateTimeOffset.UtcNow;
        refreshToken.RevokedByIp = HttpContext.Connection.RemoteIpAddress?.ToString();
        await _dbContext.SaveChangesAsync();

        return Ok();
    }

    [HttpPost("refresh")]
    [AllowAnonymous]
    public async Task<ActionResult<AuthResponse>> Refresh(RefreshRequest request)
    {
        var tokenHash = HashToken(request.RefreshToken);
        var refreshToken = await _dbContext.RefreshTokens
            .Include(t => t.User)
            .FirstOrDefaultAsync(t => t.TokenHash == tokenHash);

        if (refreshToken is null)
        {
            return Unauthorized(new { message = "Invalid refresh token." });
        }

        // Check if token is expired
        if (refreshToken.ExpiresAt <= DateTimeOffset.UtcNow)
        {
            return Unauthorized(new { message = "Refresh token has expired." });
        }

        // Check if token was revoked
        if (refreshToken.RevokedAt is not null)
        {
            // Token reuse detected - revoke entire token family for security
            _logger.LogWarning(
                "Token reuse detected for user {UserId}. Revoking token family {TokenFamily}.",
                refreshToken.UserId,
                refreshToken.TokenFamily);
            
            await RevokeTokenFamilyAsync(refreshToken.TokenFamily, refreshToken.UserId);
            return Unauthorized(new { message = "Token reuse detected. All sessions have been revoked for security." });
        }

        // Revoke current token
        refreshToken.RevokedAt = DateTimeOffset.UtcNow;
        refreshToken.RevokedByIp = HttpContext.Connection.RemoteIpAddress?.ToString();

        // Issue new tokens with same family ID (token rotation)
        var user = refreshToken.User;
        var roles = await _userManager.GetRolesAsync(user);
        var accessTokenMinutes = _configuration.GetValue("Jwt:AccessTokenMinutes", 60);
        var refreshTokenDays = _configuration.GetValue("Jwt:RefreshTokenDays", 7);

        var accessToken = CreateAccessToken(user, roles, TimeSpan.FromMinutes(accessTokenMinutes));
        var newRefreshToken = CreateRefreshToken(user, TimeSpan.FromDays(refreshTokenDays), refreshToken.TokenFamily);

        _dbContext.RefreshTokens.Add(newRefreshToken);
        await _dbContext.SaveChangesAsync();

        _logger.LogInformation("Tokens refreshed for user {UserId}.", user.Id);

        return Ok(new AuthResponse(
            accessToken,
            (int)TimeSpan.FromMinutes(accessTokenMinutes).TotalSeconds,
            newRefreshToken.PlaintextToken));
    }

    [HttpPost("confirm-email")]
    [AllowAnonymous]
    public async Task<ActionResult<AuthResponse>> ConfirmEmail(ConfirmEmailRequest request)
    {
        var user = await _userManager.FindByEmailAsync(request.Email);
        if (user is null)
        {
            return BadRequest(new { message = "Invalid confirmation request." });
        }

        var result = await _userManager.ConfirmEmailAsync(user, request.Token);
        if (!result.Succeeded)
        {
            return BadRequest(new { message = "Email confirmation failed. The link may be invalid or expired." });
        }

        _logger.LogInformation("Email confirmed for user {Email}.", user.Email);

        // Issue tokens after successful email confirmation
        var response = await IssueTokensAsync(user, rememberMe: false);
        return Ok(response);
    }

    [HttpPost("resend-verification")]
    [AllowAnonymous]
    public async Task<ActionResult<MessageResponse>> ResendVerification(ResendVerificationRequest request)
    {
        var user = await _userManager.FindByEmailAsync(request.Email);
        if (user is null)
        {
            // Don't reveal if user exists
            return Ok(new MessageResponse("If an account exists with this email, a verification email has been sent."));
        }

        if (await _userManager.IsEmailConfirmedAsync(user))
        {
            return BadRequest(new { message = "Email is already verified." });
        }

        var token = await _userManager.GenerateEmailConfirmationTokenAsync(user);
        await SendConfirmationEmailAsync(user, token);

        _logger.LogInformation("Verification email resent to {Email}.", user.Email);

        return Ok(new MessageResponse("Verification email has been sent. Please check your inbox."));
    }

    [HttpPost("forgot-password")]
    [AllowAnonymous]
    public async Task<ActionResult<MessageResponse>> ForgotPassword(ForgotPasswordRequest request)
    {
        // Always return success to prevent email enumeration
        var user = await _userManager.FindByEmailAsync(request.Email);
        if (user is null || !await _userManager.IsEmailConfirmedAsync(user))
        {
            return Ok(new MessageResponse("If an account exists with this email, a password reset link has been sent."));
        }

        var token = await _userManager.GeneratePasswordResetTokenAsync(user);
        await SendPasswordResetEmailAsync(user, token);

        _logger.LogInformation("Password reset requested for user {Email}.", user.Email);

        return Ok(new MessageResponse("If an account exists with this email, a password reset link has been sent."));
    }

    [HttpPost("reset-password")]
    [AllowAnonymous]
    public async Task<ActionResult<MessageResponse>> ResetPassword(ResetPasswordRequest request)
    {
        var user = await _userManager.FindByEmailAsync(request.Email);
        if (user is null)
        {
            return BadRequest(new { message = "Password reset failed." });
        }

        var result = await _userManager.ResetPasswordAsync(user, request.Token, request.NewPassword);
        if (!result.Succeeded)
        {
            return BadRequest(new { message = "Password reset failed. The link may be invalid or expired." });
        }

        // Revoke all refresh tokens for security
        await RevokeAllUserTokensAsync(user.Id);

        _logger.LogInformation("Password reset successfully for user {Email}. All sessions revoked.", user.Email);

        return Ok(new MessageResponse("Password has been reset successfully. Please log in with your new password."));
    }

    private async Task<AuthResponse> IssueTokensAsync(ApplicationUser user, bool rememberMe = false)
    {
        var roles = await _userManager.GetRolesAsync(user);
        var accessTokenMinutes = _configuration.GetValue("Jwt:AccessTokenMinutes", 60);
        
        // Use different refresh token lifetime based on rememberMe
        var refreshTokenDays = rememberMe 
            ? _configuration.GetValue("Jwt:RememberMeRefreshTokenDays", 7)
            : _configuration.GetValue("Jwt:RefreshTokenDays", 1);

        var accessToken = CreateAccessToken(user, roles, TimeSpan.FromMinutes(accessTokenMinutes));
        var refreshToken = CreateRefreshToken(user, TimeSpan.FromDays(refreshTokenDays));

        _dbContext.RefreshTokens.Add(refreshToken);
        await _dbContext.SaveChangesAsync();

        return new AuthResponse(accessToken, (int)TimeSpan.FromMinutes(accessTokenMinutes).TotalSeconds, refreshToken.PlaintextToken);
    }

    private string CreateAccessToken(ApplicationUser user, IEnumerable<string> roles, TimeSpan lifetime)
    {
        var jwtKey = _configuration["Jwt:Key"];
        var issuer = _configuration["Jwt:Issuer"];
        var audience = _configuration["Jwt:Audience"];

        if (string.IsNullOrWhiteSpace(jwtKey) || string.IsNullOrWhiteSpace(issuer) || string.IsNullOrWhiteSpace(audience))
        {
            throw new InvalidOperationException("JWT configuration is missing. Check Jwt:Key, Jwt:Issuer, and Jwt:Audience.");
        }

        var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtKey));
        var credentials = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

        var claims = new List<Claim>
        {
            new(ClaimTypes.NameIdentifier, user.Id.ToString()),
            new(JwtRegisteredClaimNames.Sub, user.Id.ToString()),
            new(JwtRegisteredClaimNames.Email, user.Email ?? string.Empty),
            new(JwtRegisteredClaimNames.UniqueName, user.UserName ?? string.Empty)
        };

        claims.AddRange(roles.Select(role => new Claim(ClaimTypes.Role, role)));

        var token = new JwtSecurityToken(
            issuer: issuer,
            audience: audience,
            claims: claims,
            notBefore: DateTime.UtcNow,
            expires: DateTime.UtcNow.Add(lifetime),
            signingCredentials: credentials);

        return new JwtSecurityTokenHandler().WriteToken(token);
    }

    private RefreshToken CreateRefreshToken(ApplicationUser user, TimeSpan lifetime, Guid? tokenFamily = null)
    {
        var tokenBytes = RandomNumberGenerator.GetBytes(64);
        var token = Convert.ToBase64String(tokenBytes);
        var tokenHash = HashToken(token);

        return new RefreshToken
        {
            Id = Guid.NewGuid(),
            UserId = user.Id,
            TokenHash = tokenHash,
            TokenFamily = tokenFamily ?? Guid.NewGuid(), // New family or use existing
            ExpiresAt = DateTimeOffset.UtcNow.Add(lifetime),
            CreatedAt = DateTimeOffset.UtcNow,
            CreatedByIp = HttpContext.Connection.RemoteIpAddress?.ToString(),
            PlaintextToken = token
        };
    }

    private static string HashToken(string token)
    {
        var bytes = SHA256.HashData(Encoding.UTF8.GetBytes(token));
        return Convert.ToBase64String(bytes);
    }

    private async Task RevokeTokenFamilyAsync(Guid tokenFamily, Guid userId)
    {
        var tokensInFamily = await _dbContext.RefreshTokens
            .Where(t => t.TokenFamily == tokenFamily && t.UserId == userId && t.RevokedAt == null)
            .ToListAsync();

        foreach (var token in tokensInFamily)
        {
            token.RevokedAt = DateTimeOffset.UtcNow;
            token.RevokedByIp = HttpContext.Connection.RemoteIpAddress?.ToString();
        }

        await _dbContext.SaveChangesAsync();
    }

    private async Task RevokeAllUserTokensAsync(Guid userId)
    {
        var tokens = await _dbContext.RefreshTokens
            .Where(t => t.UserId == userId && t.RevokedAt == null)
            .ToListAsync();

        foreach (var token in tokens)
        {
            token.RevokedAt = DateTimeOffset.UtcNow;
            token.RevokedByIp = HttpContext.Connection.RemoteIpAddress?.ToString();
        }

        await _dbContext.SaveChangesAsync();
    }

    private async Task SendConfirmationEmailAsync(ApplicationUser user, string token)
    {
        var frontendUrl = _configuration["Frontend:Url"] ?? "http://localhost:4200";
        var encodedToken = HttpUtility.UrlEncode(token);
        var encodedEmail = HttpUtility.UrlEncode(user.Email ?? string.Empty);
        var confirmationLink = $"{frontendUrl}/verify-email?token={encodedToken}&email={encodedEmail}";

        var templatePath = Path.Combine(AppContext.BaseDirectory, "EmailTemplates", "EmailConfirmation.html");
        var htmlTemplate = await System.IO.File.ReadAllTextAsync(templatePath);
        var htmlBody = htmlTemplate.Replace("{{CONFIRMATION_LINK}}", confirmationLink);

        await _emailService.SendEmailAsync(user.Email!, "Confirm Your Email - Invenet", htmlBody);
    }

    private async Task SendPasswordResetEmailAsync(ApplicationUser user, string token)
    {
        var frontendUrl = _configuration["Frontend:Url"] ?? "http://localhost:4200";
        var encodedToken = HttpUtility.UrlEncode(token);
        var encodedEmail = HttpUtility.UrlEncode(user.Email ?? string.Empty);
        var resetLink = $"{frontendUrl}/reset-password?token={encodedToken}&email={encodedEmail}";

        var templatePath = Path.Combine(AppContext.BaseDirectory, "EmailTemplates", "PasswordReset.html");
        var htmlTemplate = await System.IO.File.ReadAllTextAsync(templatePath);
        var htmlBody = htmlTemplate.Replace("{{RESET_LINK}}", resetLink);

        await _emailService.SendEmailAsync(user.Email!, "Reset Your Password - Invenet", htmlBody);
    }
}
