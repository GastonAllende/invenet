using System.ComponentModel.DataAnnotations;

namespace Invenet.Api.Modules.Auth.Features.Login;

/// <summary>
/// Request model for user login.
/// </summary>
public sealed record LoginRequest
{
  [Required]
  [EmailAddress]
  public required string Email { get; init; }

  [Required]
  public required string Password { get; init; }
}
