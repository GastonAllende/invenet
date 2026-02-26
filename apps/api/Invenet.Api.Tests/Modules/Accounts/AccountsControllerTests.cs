using System.Security.Claims;
using Invenet.Api.Modules.Accounts.API;
using Invenet.Api.Modules.Accounts.Domain;
using Invenet.Api.Modules.Accounts.Features.UpdateAccount;
using Invenet.Api.Modules.Shared.Infrastructure.Data;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging.Abstractions;

namespace Invenet.Api.Tests.Modules.Accounts;

public class AccountsControllerTests : IDisposable
{
    private readonly ModularDbContext _context;
    private readonly AccountsController _sut;
    private readonly Guid _userId = Guid.NewGuid();
    private readonly Guid _accountId = Guid.NewGuid();
    private readonly DateTimeOffset _initialStartDate = new(2025, 1, 15, 0, 0, 0, TimeSpan.Zero);
    private const decimal InitialStartingBalance = 1000m;

    public AccountsControllerTests()
    {
        var options = new DbContextOptionsBuilder<ModularDbContext>()
            .UseInMemoryDatabase(Guid.NewGuid().ToString())
            .Options;

        _context = new ModularDbContext(options);
        SeedAccount();

        _sut = new AccountsController(_context, NullLogger<AccountsController>.Instance);
        _sut.ControllerContext = BuildControllerContext(_userId);
    }

    private void SeedAccount()
    {
        var now = DateTime.UtcNow;
        _context.Accounts.Add(new Account
        {
            Id = _accountId,
            UserId = _userId,
            Name = "Primary Account",
            Broker = "Interactive Brokers",
            AccountType = "Personal",
            BaseCurrency = "USD",
            StartDate = _initialStartDate,
            StartingBalance = InitialStartingBalance,
            Timezone = "UTC",
            Notes = "Seeded",
            IsActive = true,
            CreatedAt = now,
            UpdatedAt = now,
        });
        _context.SaveChanges();
    }

    private static ControllerContext BuildControllerContext(Guid userId)
    {
        var identity = new ClaimsIdentity(
            new[] { new Claim(ClaimTypes.NameIdentifier, userId.ToString()) },
            authenticationType: "Test");

        var httpContext = new DefaultHttpContext
        {
            User = new ClaimsPrincipal(identity),
        };

        return new ControllerContext { HttpContext = httpContext };
    }

    [Fact]
    public async Task Update_WithStartDateOnly_PersistsNewStartDate()
    {
        var updatedStartDate = new DateTimeOffset(2025, 2, 1, 0, 0, 0, TimeSpan.Zero);
        var request = new UpdateAccountRequest(
            "Primary Account",
            "Interactive Brokers",
            "Personal",
            "USD",
            updatedStartDate
        );

        var result = await _sut.Update(_accountId, request);

        var ok = Assert.IsType<OkObjectResult>(result.Result);
        var response = Assert.IsType<UpdateAccountResponse>(ok.Value);
        Assert.Equal(updatedStartDate, response.StartDate);
        Assert.Equal(InitialStartingBalance, response.StartingBalance);

        var account = await _context.Accounts.SingleAsync(a => a.Id == _accountId);
        Assert.Equal(updatedStartDate, account.StartDate);
        Assert.Equal(InitialStartingBalance, account.StartingBalance);
    }

    [Fact]
    public async Task Update_WithStartingBalanceOnly_PersistsNewStartingBalance()
    {
        const decimal updatedBalance = 5000m;
        var request = new UpdateAccountRequest(
            "Primary Account",
            "Interactive Brokers",
            "Personal",
            "USD",
            null,
            updatedBalance
        );

        var result = await _sut.Update(_accountId, request);

        var ok = Assert.IsType<OkObjectResult>(result.Result);
        var response = Assert.IsType<UpdateAccountResponse>(ok.Value);
        Assert.Equal(_initialStartDate, response.StartDate);
        Assert.Equal(updatedBalance, response.StartingBalance);

        var account = await _context.Accounts.SingleAsync(a => a.Id == _accountId);
        Assert.Equal(_initialStartDate, account.StartDate);
        Assert.Equal(updatedBalance, account.StartingBalance);
    }

    [Fact]
    public async Task Update_WithStartDateAndStartingBalance_PersistsBoth()
    {
        var updatedStartDate = new DateTimeOffset(2025, 3, 1, 0, 0, 0, TimeSpan.Zero);
        const decimal updatedBalance = 7500m;
        var request = new UpdateAccountRequest(
            "Primary Account Updated",
            "Interactive Brokers",
            "Personal",
            "USD",
            updatedStartDate,
            updatedBalance
        );

        var result = await _sut.Update(_accountId, request);

        var ok = Assert.IsType<OkObjectResult>(result.Result);
        var response = Assert.IsType<UpdateAccountResponse>(ok.Value);
        Assert.Equal(updatedStartDate, response.StartDate);
        Assert.Equal(updatedBalance, response.StartingBalance);

        var account = await _context.Accounts.SingleAsync(a => a.Id == _accountId);
        Assert.Equal(updatedStartDate, account.StartDate);
        Assert.Equal(updatedBalance, account.StartingBalance);
    }

    [Fact]
    public async Task Update_WithInvalidStartingBalance_ReturnsBadRequest()
    {
        var request = new UpdateAccountRequest(
            "Primary Account",
            "Interactive Brokers",
            "Personal",
            "USD",
            null,
            0m
        );

        var result = await _sut.Update(_accountId, request);

        var badRequest = Assert.IsType<BadRequestObjectResult>(result.Result);
        Assert.Contains("StartingBalance", badRequest.Value?.ToString());
    }

    [Fact]
    public async Task Update_WithoutStartDateAndStartingBalance_KeepsExistingValues()
    {
        var request = new UpdateAccountRequest(
            "Primary Account",
            "Interactive Brokers",
            "Personal",
            "USD",
            null,
            null,
            "America/New_York"
        );

        var result = await _sut.Update(_accountId, request);

        var ok = Assert.IsType<OkObjectResult>(result.Result);
        var response = Assert.IsType<UpdateAccountResponse>(ok.Value);
        Assert.Equal(_initialStartDate, response.StartDate);
        Assert.Equal(InitialStartingBalance, response.StartingBalance);

        var account = await _context.Accounts.SingleAsync(a => a.Id == _accountId);
        Assert.Equal(_initialStartDate, account.StartDate);
        Assert.Equal(InitialStartingBalance, account.StartingBalance);
    }

    public void Dispose() => _context.Dispose();
}
