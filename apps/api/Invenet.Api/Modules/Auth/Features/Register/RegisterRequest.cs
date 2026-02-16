using System.ComponentModel.DataAnnotations;

namespace Invenet.Api.Modules.Auth.Features.Register;

/// <summary>
/// Request model for user registration.
/// </summary>
public sealed record RegisterRequest
{
    [Required]
    [EmailAddress]
    public required string Email { get; init; }

    [Required]
    [MinLength(3)]
    [MaxLength(50)]
    public required string Username { get; init; }

    [Required]
    [MinLength(10)]
    public required string Password { get; init; }
}
