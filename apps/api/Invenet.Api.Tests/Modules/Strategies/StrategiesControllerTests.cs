using System.Security.Claims;
using Invenet.Api.Modules.Shared.Infrastructure.Data;
using Invenet.Api.Modules.Strategies.API;
using Invenet.Api.Modules.Strategies.Domain;
using Invenet.Api.Modules.Strategies.Features.ListStrategies;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging.Abstractions;

namespace Invenet.Api.Tests.Modules.Strategies;

/// <summary>
/// Unit tests for StrategiesController verifying user-scoped filtering.
/// Strategies are owned by users (via UserId), not accounts.
/// </summary>
public class StrategiesControllerTests : IDisposable
{
    private readonly ModularDbContext _context;
    private readonly StrategiesController _sut;

    private static readonly Guid UserA = Guid.NewGuid();
    private static readonly Guid UserB = Guid.NewGuid();

    public StrategiesControllerTests()
    {
        var options = new DbContextOptionsBuilder<ModularDbContext>()
            .UseInMemoryDatabase(Guid.NewGuid().ToString())
            .Options;

        _context = new ModularDbContext(options);
        SeedStrategies();

        _sut = new StrategiesController(_context, NullLogger<StrategiesController>.Instance);
        _sut.ControllerContext = BuildControllerContext(UserA);
    }

    private void SeedStrategies()
    {
        var now = DateTime.UtcNow;
        _context.Strategies.AddRange(
            new Strategy { Id = Guid.NewGuid(), UserId = UserA, Name = "Trend Following",  CreatedAt = now, UpdatedAt = now },
            new Strategy { Id = Guid.NewGuid(), UserId = UserA, Name = "Scalping",         CreatedAt = now, UpdatedAt = now },
            new Strategy { Id = Guid.NewGuid(), UserId = UserB, Name = "Other User Strategy", CreatedAt = now, UpdatedAt = now }
        );
        _context.SaveChanges();
    }

    private static ControllerContext BuildControllerContext(Guid userId)
    {
        var identity = new ClaimsIdentity(
            new[] { new Claim(ClaimTypes.NameIdentifier, userId.ToString()) },
            authenticationType: "Test");

        var httpContext = new DefaultHttpContext
        {
            User = new ClaimsPrincipal(identity)
        };

        return new ControllerContext { HttpContext = httpContext };
    }

    [Fact]
    public async Task List_ReturnsOnlyStrategiesOwnedByAuthenticatedUser()
    {
        // Act
        var result = await _sut.List();

        // Assert
        var okResult = Assert.IsType<OkObjectResult>(result.Result);
        var response = Assert.IsType<ListStrategiesResponse>(okResult.Value);

        Assert.Equal(2, response.Total);
        Assert.Equal(2, response.Strategies.Count());
    }

    [Fact]
    public async Task List_DoesNotReturnStrategiesFromOtherUsers()
    {
        // Act
        var result = await _sut.List();

        // Assert
        var okResult = Assert.IsType<OkObjectResult>(result.Result);
        var response = Assert.IsType<ListStrategiesResponse>(okResult.Value);

        Assert.DoesNotContain(response.Strategies, s => s.Name == "Other User Strategy");
    }

    [Fact]
    public async Task List_StrategiesReturnedHaveExpectedNames()
    {
        // Act
        var result = await _sut.List();

        // Assert
        var okResult = Assert.IsType<OkObjectResult>(result.Result);
        var response = Assert.IsType<ListStrategiesResponse>(okResult.Value);
        var names = response.Strategies.Select(s => s.Name).ToList();

        Assert.Contains("Trend Following", names);
        Assert.Contains("Scalping", names);
    }

    public void Dispose() => _context.Dispose();
}
