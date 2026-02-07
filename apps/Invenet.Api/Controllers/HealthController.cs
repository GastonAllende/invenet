using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Invenet.Api.Data;

namespace Invenet.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class HealthController : ControllerBase
{
    private readonly AppDbContext _context;
    private readonly ILogger<HealthController> _logger;

    public HealthController(AppDbContext context, ILogger<HealthController> logger)
    {
        _context = context;
        _logger = logger;
    }

    /// <summary>
    /// Checks if the API is healthy
    /// </summary>
    [HttpGet]
    public IActionResult Get()
    {
        return Ok(new { status = "Healthy", timestamp = DateTime.UtcNow });
    }

    /// <summary>
    /// Checks database connectivity
    /// </summary>
    [HttpGet("database")]
    public async Task<IActionResult> CheckDatabase()
    {
        try
        {
            // Simple database connectivity check
            var canConnect = await _context.Database.CanConnectAsync();
            
            if (canConnect)
            {
                return Ok(new 
                { 
                    status = "Database Connected", 
                    database = "InvenetDb",
                    timestamp = DateTime.UtcNow 
                });
            }
            
            return StatusCode(503, new 
            { 
                status = "Database connection failed",
                timestamp = DateTime.UtcNow 
            });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Database health check failed");
            return StatusCode(503, new 
            { 
                status = "Database error", 
                error = ex.Message,
                timestamp = DateTime.UtcNow 
            });
        }
    }
}
