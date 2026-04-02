using System.ComponentModel.DataAnnotations;

namespace Invenet.Api.Modules.Auth.Features;

public sealed record LoginRequest
{
    [Required][EmailAddress] public required string Email { get; init; }
    [Required] public required string Password { get; init; }
}

public sealed record RegisterRequest
{
    [Required][EmailAddress] public required string Email { get; init; }
    [Required][MinLength(3)][MaxLength(50)] public required string Username { get; init; }
    [Required][MinLength(10)] public required string Password { get; init; }
}

public sealed record AuthResponse
{
    public required string AccessToken { get; init; }
    public required string RefreshToken { get; init; }
    public required DateTimeOffset ExpiresAt { get; init; }
}

public sealed record MessageResponse(string Message);
