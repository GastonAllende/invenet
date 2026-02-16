namespace Invenet.Api.Modules.Auth.Features.Common;

/// <summary>
/// Response model containing authentication tokens.
/// </summary>
public sealed record AuthResponse
{
    public required string AccessToken { get; init; }
    public required string RefreshToken { get; init; }
    public required DateTimeOffset ExpiresAt { get; init; }
}

/// <summary>
/// Generic message response.
/// </summary>
public sealed record MessageResponse(string Message);
