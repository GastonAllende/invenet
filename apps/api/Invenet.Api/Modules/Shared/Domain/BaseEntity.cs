namespace Invenet.Api.Modules.Shared.Domain;

/// <summary>
/// Base class for all entities in the system.
/// </summary>
public abstract class BaseEntity
{
  public Guid Id { get; set; }
  public DateTimeOffset CreatedAt { get; set; }
  public DateTimeOffset UpdatedAt { get; set; }
}
