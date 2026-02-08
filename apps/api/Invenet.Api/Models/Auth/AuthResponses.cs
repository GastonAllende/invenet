namespace Invenet.Api.Models.Auth;

public sealed record AuthResponse(
    string AccessToken,
    int ExpiresInSeconds,
    string RefreshToken);

public sealed record MessageResponse(string Message);
