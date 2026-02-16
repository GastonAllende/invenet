using Invenet.Api.Modules.Shared.Domain;

namespace Invenet.Api.Modules.Auth.Domain;

/// <summary>
/// Represents a refresh token for JWT authentication.
/// </summary>
public sealed class RefreshToken : BaseEntity
{
    public required string Token { get; set; }
    public required Guid UserId { get; set; }
    public DateTimeOffset ExpiresAt { get; set; }
    public bool IsRevoked { get; set; }
    public DateTimeOffset? RevokedAt { get; set; }
    public Guid? TokenFamily { get; set; }
    
    // Navigation properties
    public ApplicationUser User { get; set; } = null!;
    
    public bool IsExpired => DateTimeOffset.UtcNow >= ExpiresAt;
    public bool IsActive => !IsRevoked && !IsExpired;
}
