using System.ComponentModel.DataAnnotations.Schema;

namespace Invenet.Api.Models;

public sealed class RefreshToken
{
    public Guid Id { get; set; }
    public Guid UserId { get; set; }
    public string TokenHash { get; set; } = string.Empty;
    public DateTimeOffset ExpiresAt { get; set; }
    public DateTimeOffset CreatedAt { get; set; }
    public DateTimeOffset? RevokedAt { get; set; }
    public string? CreatedByIp { get; set; }
    public string? RevokedByIp { get; set; }

    public ApplicationUser User { get; set; } = null!;

    [NotMapped]
    public string PlaintextToken { get; set; } = string.Empty;
}
