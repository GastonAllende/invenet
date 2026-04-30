using System.Threading.RateLimiting;
using Invenet.Api.Modules.Shared.Infrastructure;
using Invenet.Api.Modules.Shared.Infrastructure.Data;
using Microsoft.AspNetCore.DataProtection;
using Microsoft.EntityFrameworkCore;

var builder = WebApplication.CreateBuilder(args);

// Persist Data Protection keys so Identity tokens survive API restarts
builder.Services.AddDataProtection()
    .PersistKeysToFileSystem(new DirectoryInfo(Path.Combine(builder.Environment.ContentRootPath, "DataProtection-Keys")))
    .SetApplicationName("Invenet");

// Register shared infrastructure
builder.Services.AddDbContext<ModularDbContext>(options =>
    options.UseNpgsql(
        builder.Configuration.GetConnectionString("DefaultConnection"),
        npgsqlOptions =>
        {
          npgsqlOptions.EnableRetryOnFailure(
              maxRetryCount: 5,
              maxRetryDelay: TimeSpan.FromSeconds(30),
              errorCodesToAdd: null);
          npgsqlOptions.CommandTimeout(60);
        }));

// Configure CORS from configuration
var allowedOrigins = builder.Configuration.GetSection("Cors:Origins").Get<string[]>() ?? [];
builder.Services.AddCors(options =>
{
  options.AddDefaultPolicy(policy =>
  {
    policy
          .WithOrigins(allowedOrigins)
          .AllowAnyHeader()
          .WithMethods("GET", "POST", "PUT", "DELETE", "OPTIONS");
  });
});

// Global error handling
builder.Services.AddProblemDetails();

// Rate limiting
builder.Services.AddRateLimiter(options =>
{
  options.RejectionStatusCode = StatusCodes.Status429TooManyRequests;

  // Auth endpoints: stricter limit by IP
  options.AddPolicy("auth", httpContext =>
    RateLimitPartition.GetFixedWindowLimiter(
      partitionKey: httpContext.Connection.RemoteIpAddress?.ToString() ?? "unknown",
      factory: _ => new FixedWindowRateLimiterOptions
      {
        Window = TimeSpan.FromMinutes(1),
        PermitLimit = 10,
        QueueLimit = 0
      }));

  // Global limit: 300 req/min per authenticated user, fallback to IP (disabled in development)
  if (!builder.Environment.IsDevelopment())
  {
    options.GlobalLimiter = PartitionedRateLimiter.Create<HttpContext, string>(httpContext =>
      RateLimitPartition.GetFixedWindowLimiter(
        partitionKey: httpContext.User?.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value
                     ?? httpContext.Connection.RemoteIpAddress?.ToString()
                     ?? "unknown",
        factory: _ => new FixedWindowRateLimiterOptions
        {
          Window = TimeSpan.FromMinutes(1),
          PermitLimit = 300,
          QueueLimit = 0
        }));
  }
});

// Add controllers
builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddOpenApiDocument(config =>
{
  config.Title = "Invenet API - Modular Monolith";
  config.Version = "v1";
  config.Description = "API organized using modular monolith architecture";
});

// Health checks
builder.Services.AddHealthChecks()
    .AddNpgSql(builder.Configuration.GetConnectionString("DefaultConnection")!);

// Register all modules (discovers and registers automatically)
builder.Services.RegisterModules(builder.Configuration);

var app = builder.Build();

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
  app.UseDeveloperExceptionPage();
  app.UseOpenApi();
  app.UseSwaggerUi(config =>
  {
    config.DocumentTitle = "Invenet API";
  });
}
else
{
  app.UseExceptionHandler();
  app.UseHsts();
  app.UseHttpsRedirection();
}

app.Use(async (context, next) =>
{
  context.Response.Headers.Append("X-Content-Type-Options", "nosniff");
  context.Response.Headers.Append("X-Frame-Options", "DENY");
  context.Response.Headers.Append("Referrer-Policy", "strict-origin-when-cross-origin");
  context.Response.Headers.Append("Permissions-Policy", "geolocation=(), camera=(), microphone=()");
  await next();
});

app.UseCors();

app.UseRateLimiter();

app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();

// Map module endpoints
app.MapModules();

app.Run();
