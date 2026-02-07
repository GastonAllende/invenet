namespace Invenet.Api.Models.Auth;

public sealed record RegisterRequest(string Email, string Username, string Password);

public sealed record LoginRequest(string Email, string Password);

public sealed record LogoutRequest(string RefreshToken);
