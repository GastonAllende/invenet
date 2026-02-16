using Microsoft.AspNetCore.Mvc;

namespace Invenet.Api.Modules.Health.API;

/// <summary>
/// Controller for health check endpoints.
/// </summary>
[ApiController]
[Route("api/health")]
public sealed class HealthController : ControllerBase
{
    [HttpGet]
    public IActionResult GetHealth()
    {
        return Ok(new
        {
            status = "healthy",
            timestamp = DateTimeOffset.UtcNow
        });
    }
}
