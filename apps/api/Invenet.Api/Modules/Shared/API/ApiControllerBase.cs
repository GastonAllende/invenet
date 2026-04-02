using System.Security.Claims;
using Microsoft.AspNetCore.Mvc;

namespace Invenet.Api.Modules.Shared.API;

[ApiController]
public abstract class ApiControllerBase : ControllerBase
{
  protected bool TryGetCurrentUserId(out Guid userId)
  {
    userId = Guid.Empty;
    var raw = User.FindFirstValue(ClaimTypes.NameIdentifier);
    if (string.IsNullOrEmpty(raw) || !Guid.TryParse(raw, out var parsed))
      return false;
    userId = parsed;
    return true;
  }
}
