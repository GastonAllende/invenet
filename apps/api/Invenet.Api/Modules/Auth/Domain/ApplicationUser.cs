using Microsoft.AspNetCore.Identity;

namespace Invenet.Api.Modules.Auth.Domain;

/// <summary>
/// Represents an application user with Identity integration.
/// </summary>
public sealed class ApplicationUser : IdentityUser<Guid>
{
    public DateTimeOffset CreatedAt { get; set; }
    public DateTimeOffset UpdatedAt { get; set; }
    public DateTimeOffset? LastLoginAt { get; set; }
    
    // Navigation properties
    public ICollection<RefreshToken> RefreshTokens { get; set; } = new List<RefreshToken>();
}
