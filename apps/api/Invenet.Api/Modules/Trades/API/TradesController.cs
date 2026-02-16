using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Invenet.Api.Modules.Trades.API;

/// <summary>
/// Controller for trading operations.
/// </summary>
[ApiController]
[Route("api/trades")]
[Authorize]
public sealed class TradesController : ControllerBase
{
    private readonly ILogger<TradesController> _logger;

    public TradesController(ILogger<TradesController> logger)
    {
        _logger = logger;
    }

    [HttpGet]
    public async Task<IActionResult> GetTrades()
    {
        // TODO: Implement get trades logic
        return Ok(new { message = "Trades endpoint - to be implemented" });
    }
}
