namespace Invenet.Api.Models.Auth;

public sealed record RegisterRequest(string Email, string Username, string Password);

public sealed record LoginRequest(string Email, string Password, bool RememberMe = false);

public sealed record LogoutRequest(string RefreshToken);

public sealed record RefreshRequest(string RefreshToken);

public sealed record ForgotPasswordRequest(string Email);

public sealed record ResetPasswordRequest(string Email, string Token, string NewPassword);

public sealed record ConfirmEmailRequest(string Email, string Token);

public sealed record ResendVerificationRequest(string Email);
